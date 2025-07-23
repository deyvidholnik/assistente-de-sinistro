import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Definir período padrão (últimos 30 dias)
    const defaultDateTo = new Date()
    const defaultDateFrom = new Date()
    defaultDateFrom.setDate(defaultDateFrom.getDate() - 30)

    const fromDate = dateFrom ? new Date(dateFrom) : defaultDateFrom
    const toDate = dateTo ? new Date(dateTo) : defaultDateTo

    // 1. Métricas de Sinistros
    const { data: sinistros, error: sinistrosError } = await supabase
      .from('view_sinistros_completos')
      .select(`
        id, 
        numero_sinistro, 
        tipo_atendimento, 
        tipo_sinistro, 
        tipo_assistencia, 
        assistencia_adicional,
        total_assistencias,
        assistencias_tipos,
        status, 
        data_criacao,
        data_atualizacao
      `)
      .gte('data_criacao', fromDate.toISOString())
      .lte('data_criacao', toDate.toISOString())

    if (sinistrosError) {
      console.error('Erro ao buscar sinistros:', sinistrosError)
    }

    // 2. Métricas de Chamadas IA
    const fromTimestamp = fromDate.getTime()
    const toTimestamp = toDate.getTime()

    const { data: calls, error: callsError } = await supabase
      .from('record_calls_ai')
      .select('*')
      .gte('start_timestamp', fromTimestamp)
      .lte('start_timestamp', toTimestamp)

    if (callsError) {
      console.error('Erro ao buscar chamadas:', callsError)
    }

    // 3. Processar dados de sinistros
    const totalSinistros = sinistros?.length || 0
    const sinistrosPorStatus = (sinistros || []).reduce((acc, sinistro) => {
      acc[sinistro.status] = (acc[sinistro.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const sinistrosPorTipo = (sinistros || []).reduce((acc, sinistro) => {
      const tipo = sinistro.tipo_atendimento === 'assistencia' 
        ? `assistencia_${sinistro.tipo_assistencia}` 
        : `sinistro_${sinistro.tipo_sinistro}`
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Sinistros por dia (últimos 7 dias)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const sinistrosPorDia = last7Days.map(date => {
      const count = (sinistros || []).filter(s => 
        s.data_criacao.startsWith(date)
      ).length
      return { date, count }
    })

    // 4. Processar dados de chamadas IA
    const totalCalls = calls?.length || 0
    const totalDurationMs = (calls || []).reduce((acc, call) => acc + (call.duration_ms || 0), 0)
    const totalMinutes = Math.round(totalDurationMs / 60000)
    const averageMinutes = totalCalls > 0 ? Math.round(totalDurationMs / totalCalls / 60000 * 100) / 100 : 0

    const callsByAgent = (calls || []).reduce((acc, call) => {
      acc[call.agent_name] = (acc[call.agent_name] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Chamadas por dia (últimos 7 dias)
    const callsPorDia = last7Days.map(date => {
      const dateTimestamp = new Date(date).getTime()
      const nextDayTimestamp = dateTimestamp + (24 * 60 * 60 * 1000)
      
      const count = (calls || []).filter(call => 
        call.start_timestamp >= dateTimestamp && 
        call.start_timestamp < nextDayTimestamp
      ).length
      
      return { date, count }
    })

    // 5. Métricas de usuários
    const { data: users, error: usersError } = await supabase
      .from('user_info')
      .select('user_level, created_at, last_login, is_active')

    const totalUsers = users?.length || 0
    const activeUsers = users?.filter(u => u.is_active).length || 0
    const usersByLevel = (users || []).reduce((acc, user) => {
      acc[user.user_level] = (acc[user.user_level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // 6. Logs recentes (últimos 50 sinistros)
    const { data: recentLogs, error: logsError } = await supabase
      .from('view_sinistros_completos')
      .select(`
        id,
        numero_sinistro,
        tipo_atendimento,
        tipo_sinistro,
        tipo_assistencia,
        assistencia_adicional,
        total_assistencias,
        assistencias_tipos,
        status,
        data_criacao,
        cnh_proprio_nome
      `)
      .order('data_criacao', { ascending: false })
      .limit(50)

    return NextResponse.json({
      periodo: {
        de: fromDate.toISOString().split('T')[0],
        ate: toDate.toISOString().split('T')[0]
      },
      sinistros: {
        total: totalSinistros,
        porStatus: sinistrosPorStatus,
        porTipo: sinistrosPorTipo,
        porDia: sinistrosPorDia
      },
      chamadas: {
        total: totalCalls,
        totalMinutos: totalMinutes,
        minutosMedia: averageMinutes,
        porAgente: callsByAgent,
        porDia: callsPorDia
      },
      usuarios: {
        total: totalUsers,
        ativos: activeUsers,
        porNivel: usersByLevel
      },
      logs: recentLogs || []
    })

  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 