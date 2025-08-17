'use client'

import React from 'react'
import { InsightCard } from './shared/InsightCard'
import { TrendingUp, TrendingDown, BarChart3, Activity, AlertTriangle } from 'lucide-react'

interface DashboardMetrics {
  sinistros: {
    total: number
    porDia: Array<{ date: string; count: number }>
    porStatus: Record<string, number>
  }
  chamadas: {
    total: number
    totalMinutos: number
    minutosMedia: number
    porDia: Array<{ date: string; count: number }>
  }
  usuarios: {
    total: number
    ativos: number
  }
}

interface TrendAnalysisProps {
  data: DashboardMetrics
  loading?: boolean
  className?: string
}

export function TrendAnalysis({ data, loading = false, className = '' }: TrendAnalysisProps) {
  // Análises de tendência
  const getSinistrosTrend = () => {
    const porDia = data.sinistros?.porDia || []
    if (porDia.length < 2) return null
    
    const today = porDia[porDia.length - 1]
    const yesterday = porDia[porDia.length - 2]
    
    if (!today || !yesterday) return null
    
    const change = (today.count || 0) - (yesterday.count || 0)
    const percentChange = (yesterday.count || 0) > 0 ? (change / yesterday.count) * 100 : 0
    
    return {
      change,
      percentChange,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    }
  }

  const getChamadasTrend = () => {
    const porDia = data.chamadas?.porDia || []
    if (porDia.length < 2) return null
    
    const today = porDia[porDia.length - 1]
    const yesterday = porDia[porDia.length - 2]
    
    if (!today || !yesterday) return null
    
    const change = (today.count || 0) - (yesterday.count || 0)
    const percentChange = (yesterday.count || 0) > 0 ? (change / yesterday.count) * 100 : 0
    
    return {
      change,
      percentChange,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    }
  }

  const getAverages = () => {
    const sinistrosPorDia = data.sinistros?.porDia || []
    const chamdasPorDia = data.chamadas?.porDia || []
    
    const avgSinistros = sinistrosPorDia.length > 0 
      ? Math.round((data.sinistros?.total || 0) / sinistrosPorDia.length * 10) / 10
      : 0
    
    const avgChamadas = chamdasPorDia.length > 0
      ? Math.round((data.chamadas?.total || 0) / chamdasPorDia.length * 10) / 10
      : 0
    
    return { avgSinistros, avgChamadas }
  }

  const getStatusInsights = () => {
    const porStatus = data.sinistros?.porStatus || {}
    const total = Object.values(porStatus).reduce((acc, count) => acc + Number(count || 0), 0)
    if (total === 0) return null
    
    const pendentes = Number(porStatus.pendente || 0)
    const emAnalise = Number(porStatus.em_analise || 0)
    const rejeitados = Number(porStatus.rejeitado || 0)
    
    const pendingPercent = (pendentes / total) * 100
    const analysisPercent = (emAnalise / total) * 100
    const rejectedPercent = (rejeitados / total) * 100
    
    return {
      pendingPercent,
      analysisPercent,
      rejectedPercent,
      needsAttention: pendingPercent > 30 || rejectedPercent > 15
    }
  }

  const sinistrosTrend = getSinistrosTrend()
  const chamadasTrend = getChamadasTrend()
  const averages = getAverages()
  const statusInsights = getStatusInsights()
  const userEngagement = (data.usuarios?.total || 0) > 0 ? ((data.usuarios?.ativos || 0) / data.usuarios.total) * 100 : 0

  return (
    <div className={`grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {/* Tendência de Sinistros */}
      <InsightCard
        title='Tendência de Sinistros'
        description='Variação em relação ao dia anterior'
        icon={sinistrosTrend?.direction === 'up' ? TrendingUp : TrendingDown}
        type={sinistrosTrend?.direction === 'up' ? 'warning' : sinistrosTrend?.direction === 'down' ? 'success' : 'neutral'}
        badge={sinistrosTrend ? {
          text: `${sinistrosTrend.percentChange > 0 ? '+' : ''}${sinistrosTrend.percentChange.toFixed(1)}%`,
          type: sinistrosTrend.direction === 'up' ? 'warning' : sinistrosTrend.direction === 'down' ? 'success' : 'info'
        } : undefined}
        loading={loading}
      >
        <div className='space-y-3'>
          {sinistrosTrend ? (
            <>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Variação:</span>
                <span className='font-medium'>
                  {sinistrosTrend.change > 0 ? '+' : ''}{sinistrosTrend.change} sinistros
                </span>
              </div>
              
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Média diária:</span>
                <span className='font-medium'>{averages.avgSinistros}</span>
              </div>
              
              <div className='text-xs text-muted-foreground'>
                {sinistrosTrend.direction === 'up' 
                  ? 'Aumento no número de sinistros pode indicar maior demanda ou sazonalidade.'
                  : sinistrosTrend.direction === 'down'
                  ? 'Redução no número de sinistros indica estabilidade ou menor demanda.'
                  : 'Volume estável de sinistros mantém padrão esperado.'
                }
              </div>
            </>
          ) : (
            <div className='text-sm text-muted-foreground'>
              Dados insuficientes para análise de tendência
            </div>
          )}
        </div>
      </InsightCard>

      {/* Análise de Status */}
      <InsightCard
        title='Análise de Status'
        description='Distribuição e alertas de status'
        icon={statusInsights?.needsAttention ? AlertTriangle : BarChart3}
        type={statusInsights?.needsAttention ? 'warning' : 'info'}
        badge={statusInsights?.needsAttention ? {
          text: 'Atenção Necessária',
          type: 'warning'
        } : {
          text: 'Normal',
          type: 'success'
        }}
        loading={loading}
      >
        <div className='space-y-3'>
          {statusInsights ? (
            <>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Pendentes:</span>
                  <span className='font-medium'>{statusInsights.pendingPercent.toFixed(1)}%</span>
                </div>
                
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Em análise:</span>
                  <span className='font-medium'>{statusInsights.analysisPercent.toFixed(1)}%</span>
                </div>
                
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Rejeitados:</span>
                  <span className='font-medium'>{statusInsights.rejectedPercent.toFixed(1)}%</span>
                </div>
              </div>
              
              {statusInsights.needsAttention && (
                <div className='bg-[hsl(var(--status-warning))]/10 border border-[hsl(var(--status-warning))]/30 rounded-lg p-3'>
                  <div className='text-xs text-[hsl(var(--status-warning))] font-medium'>
                    ⚠️ Atenção: Alto volume de sinistros pendentes ou rejeitados
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className='text-sm text-muted-foreground'>
              Nenhum dado de status disponível
            </div>
          )}
        </div>
      </InsightCard>

      {/* Performance de Chamadas IA */}
      <InsightCard
        title='Performance de Chamadas IA'
        description='Análise do sistema de atendimento automatizado'
        icon={Activity}
        type='info'
        badge={{
          text: `${data.chamadas.minutosMedia} min média`,
          type: 'info'
        }}
        loading={loading}
      >
        <div className='space-y-3'>
          {chamadasTrend ? (
            <>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Variação diária:</span>
                <span className={`font-medium ${
                  chamadasTrend.direction === 'up' ? 'text-[hsl(var(--status-success))]' :
                  chamadasTrend.direction === 'down' ? 'text-[hsl(var(--status-warning))]' :
                  'text-muted-foreground'
                }`}>
                  {chamadasTrend.change > 0 ? '+' : ''}{chamadasTrend.change}
                </span>
              </div>
              
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Média diária:</span>
                <span className='font-medium'>{averages.avgChamadas}</span>
              </div>
              
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Tempo total:</span>
                <span className='font-medium'>{data.chamadas.totalMinutos} min</span>
              </div>
              
              <div className='text-xs text-muted-foreground'>
                {data.chamadas.minutosMedia > 5 
                  ? 'Tempo médio elevado pode indicar consultas complexas.'
                  : 'Tempo médio otimizado para atendimento eficiente.'
                }
              </div>
            </>
          ) : (
            <div className='text-sm text-muted-foreground'>
              Dados insuficientes para análise de chamadas
            </div>
          )}
        </div>
      </InsightCard>

    </div>
  )
}