import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const search = searchParams.get('search')
    const agent = searchParams.get('agent')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Se ID específico for fornecido, buscar apenas essa chamada
    if (id) {
      const { data, error } = await supabase
        .from('record_calls_ai')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar chamada por ID:', error)
        return NextResponse.json(
          { error: 'Chamada não encontrada' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        calls: data ? [data] : [],
        metrics: {
          totalCalls: 1,
          totalMinutes: Math.round((data?.duration_ms || 0) / 60000),
          averageMinutes: Math.round((data?.duration_ms || 0) / 60000),
          uniqueAgents: [data?.agent_name || ''],
          callsByAgent: { [data?.agent_name || '']: 1 }
        }
      })
    }

    let query = supabase
      .from('record_calls_ai')
      .select('*')
      .order('start_timestamp', { ascending: false })

    // Filtro por pesquisa (nome do agente, números)
    if (search && search.trim()) {
      query = query.or(`agent_name.ilike.%${search}%,from_number.ilike.%${search}%,to_number.ilike.%${search}%`)
    }

    // Filtro por agente específico
    if (agent && agent !== 'all') {
      query = query.eq('agent_name', agent)
    }

    // Filtro por data
    if (dateFrom) {
      const fromTimestamp = new Date(dateFrom).getTime()
      query = query.gte('start_timestamp', fromTimestamp)
    }

    if (dateTo) {
      const toTimestamp = new Date(dateTo).getTime() + (24 * 60 * 60 * 1000) - 1 // Fim do dia
      query = query.lte('start_timestamp', toTimestamp)
    }

    const { data, error } = await query.limit(1000)

    if (error) {
      console.error('Erro ao buscar chamadas:', error)
      return NextResponse.json(
        { error: 'Erro interno do servidor' },
        { status: 500 }
      )
    }

    // Calcular métricas
    const totalCalls = data?.length || 0
    const totalDurationMs = data?.reduce((acc, call) => acc + (call.duration_ms || 0), 0) || 0
    const totalMinutes = Math.round(totalDurationMs / 60000)
    
    // Agentes únicos
    const uniqueAgents = [...new Set(data?.map(call => call.agent_name) || [])]

    // Chamadas por agente
    const callsByAgent = data?.reduce((acc, call) => {
      acc[call.agent_name] = (acc[call.agent_name] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Duração média
    const averageDurationMs = totalCalls > 0 ? totalDurationMs / totalCalls : 0
    const averageMinutes = Math.round(averageDurationMs / 60000 * 100) / 100

    return NextResponse.json({
      calls: data || [],
      metrics: {
        totalCalls,
        totalMinutes,
        averageMinutes,
        uniqueAgents,
        callsByAgent
      }
    })

  } catch (error) {
    console.error('Erro na API de chamadas:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
} 