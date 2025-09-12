import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // 1. Métricas de Sinistros
    let sinistrosQuery = supabase
      .from('view_sinistros_completos')
      .select(`
        id, 
        numero_sinistro, 
        tipo_atendimento, 
        tipo_sinistro, 
        tipo_assistencia, 
        status, 
        data_criacao,
        data_atualizacao
      `)

    // Aplicar filtros de data apenas se fornecidos
    if (dateFrom) {
      sinistrosQuery = sinistrosQuery.gte('data_criacao', new Date(dateFrom).toISOString())
    }
    if (dateTo) {
      sinistrosQuery = sinistrosQuery.lte('data_criacao', new Date(dateTo).toISOString())
    }

    const { data: sinistros, error: sinistrosError } = await sinistrosQuery

    if (sinistrosError) {
      console.error('Erro ao buscar sinistros:', sinistrosError)
    }

    // 2. Métricas de Chamadas IA
    let callsQuery = supabase
      .from('record_calls_ai')
      .select('*')

    // Aplicar filtros de data apenas se fornecidos
    if (dateFrom) {
      const fromTimestamp = new Date(dateFrom).getTime()
      callsQuery = callsQuery.gte('start_timestamp', fromTimestamp)
    }
    if (dateTo) {
      const toTimestamp = new Date(dateTo).getTime()
      callsQuery = callsQuery.lte('start_timestamp', toTimestamp)
    }

    const { data: calls, error: callsError } = await callsQuery

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

    // Sinistros por dia - gerar dinamicamente baseado nos dados ou últimos 7 dias
    const getDaysRange = () => {
      if (dateFrom && dateTo) {
        const start = new Date(dateFrom)
        const end = new Date(dateTo)
        const days = []
        const current = new Date(start)
        
        while (current <= end) {
          days.push(current.toISOString().split('T')[0])
          current.setDate(current.getDate() + 1)
        }
        
        return days.slice(-30) // Limitar a 30 dias para performance
      } else {
        // Padrão: últimos 7 dias
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date()
          date.setDate(date.getDate() - i)
          return date.toISOString().split('T')[0]
        }).reverse()
      }
    }

    const daysRange = getDaysRange()
    const sinistrosPorDia = daysRange.map(date => {
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

    // Chamadas por dia - usar o mesmo range de dias
    const callsPorDia = daysRange.map(date => {
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

    // 6. Logs recentes (últimos 50 sinistros) - buscar da tabela sinistros diretamente
    const { data: recentLogs, error: logsError } = await supabase
      .from('sinistros')
      .select(`
        id,
        numero_sinistro,
        tipo_atendimento,
        tipo_sinistro,
        tipo_assistencia,
        assistencia_adicional,
        assistencias_tipos,
        status,
        data_criacao
      `)
      .order('data_criacao', { ascending: false })
      .limit(50)

    // Enriquecer com dados de CNH se necessário
    const enrichedLogs = recentLogs?.map(log => ({
      ...log,
      cnh_proprio_nome: 'N/A' // Placeholder - pode buscar da tabela cnh_dados se necessário
    })) || []

    return NextResponse.json({
      periodo: {
        de: dateFrom || 'todos',
        ate: dateTo || 'todos'
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
      logs: enrichedLogs || []
    })

  } catch (error) {
    console.error('Erro ao buscar métricas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 