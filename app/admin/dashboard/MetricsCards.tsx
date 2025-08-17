"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  PhoneCall, 
  Clock, 
  Users, 
  Activity, 
  BarChart3 
} from 'lucide-react'

interface DashboardMetrics {
  periodo: {
    de: string
    ate: string
  }
  sinistros: {
    total: number
    porStatus: Record<string, number>
    porTipo: Record<string, number>
    porDia: Array<{ date: string; count: number }>
  }
  chamadas: {
    total: number
    totalMinutos: number
    minutosMedia: number
    porAgente: Record<string, number>
    porDia: Array<{ date: string; count: number }>
  }
  usuarios: {
    total: number
    ativos: number
    porNivel: Record<string, number>
  }
  logs: Array<any>
}

interface MetricsCardsProps {
  metrics: DashboardMetrics
  isDark: boolean
}

export function MetricsCards({ metrics, isDark }: MetricsCardsProps) {
  // Calcular KPIs avançados
  const calculateTrends = () => {
    const sinistrosPorDia = metrics.sinistros?.porDia || []
    const chamadasPorDia = metrics.chamadas?.porDia || []
    
    const sinistrosTrend = sinistrosPorDia.length >= 2 
      ? ((sinistrosPorDia[sinistrosPorDia.length - 1].count - sinistrosPorDia[sinistrosPorDia.length - 2].count) / (sinistrosPorDia[sinistrosPorDia.length - 2].count || 1)) * 100
      : 0

    const chamadasTrend = chamadasPorDia.length >= 2
      ? ((chamadasPorDia[chamadasPorDia.length - 1].count - chamadasPorDia[chamadasPorDia.length - 2].count) / (chamadasPorDia[chamadasPorDia.length - 2].count || 1)) * 100
      : 0

    const engajamento = (metrics.usuarios?.total || 0) > 0 ? ((metrics.usuarios?.ativos || 0) / metrics.usuarios.total) * 100 : 0

    return { sinistrosTrend, chamadasTrend, engajamento }
  }

  const trends = calculateTrends()

  const kpiData = [
    {
      title: 'Total de Sinistros',
      value: metrics.sinistros?.total || 0,
      icon: FileText,
      color: 'hsl(var(--brand-primary))',
      trend: {
        value: Math.round(trends.sinistrosTrend),
        direction: trends.sinistrosTrend > 0 ? 'up' : trends.sinistrosTrend < 0 ? 'down' : 'neutral'
      },
      description: 'Ocorrências registradas'
    },
    {
      title: 'Chamadas de IA',
      value: metrics.chamadas?.total || 0,
      icon: PhoneCall,
      color: 'hsl(var(--brand-secondary))',
      trend: {
        value: Math.round(trends.chamadasTrend),
        direction: trends.chamadasTrend > 0 ? 'up' : trends.chamadasTrend < 0 ? 'down' : 'neutral'
      },
      description: 'Atendimentos automatizados'
    },
    {
      title: 'Tempo Total (min)',
      value: metrics.chamadas?.totalMinutos || 0,
      icon: Clock,
      color: 'hsl(var(--status-success))',
      description: 'Minutos em chamadas'
    },
    {
      title: 'Usuários Cadastrados',
      value: metrics.usuarios?.total || 0,
      icon: Users,
      color: 'hsl(var(--status-info))',
      description: 'Total no sistema'
    },
    {
      title: 'Taxa de Engajamento',
      value: `${trends.engajamento.toFixed(1)}%`,
      icon: Activity,
      color: trends.engajamento > 80 ? 'hsl(var(--status-success))' : trends.engajamento > 60 ? 'hsl(var(--status-warning))' : 'hsl(var(--status-error))',
      description: 'Usuários ativos'
    },
    {
      title: 'Tempo Médio (min)',
      value: metrics.chamadas?.minutosMedia || 0,
      icon: BarChart3,
      color: 'hsl(var(--chart-3))',
      description: 'Por chamada'
    }
  ]

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3 lg:gap-4 mb-4 md:mb-6 lg:mb-8 overflow-hidden'>
      {kpiData.map((kpi, index) => {
        const IconComponent = kpi.icon
        
        return (
          <Card key={index} className='border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl hover:scale-105 transition-all duration-300 w-full max-w-full overflow-hidden'>
            <CardContent className='p-2 sm:p-3 md:p-4 text-center min-w-0'>
              <div 
                className='w-7 sm:w-8 md:w-10 lg:w-12 h-7 sm:h-8 md:h-10 lg:h-12 rounded-xl flex items-center justify-center mx-auto mb-1 md:mb-2 lg:mb-3 flex-shrink-0'
                style={{ 
                  background: `linear-gradient(135deg, ${kpi.color}, ${kpi.color}90)`,
                  color: 'white'
                }}
              >
                <IconComponent className='w-3 sm:w-4 md:w-5 lg:w-6 h-3 sm:h-4 md:h-5 lg:h-6' />
              </div>
              
              <div className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold mb-1 text-foreground truncate leading-tight'>
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString('pt-BR') : kpi.value}
              </div>
              
              <div className='text-xs text-muted-foreground mb-1 truncate leading-tight'>
                {kpi.title}
              </div>
              
              {kpi.description && (
                <div className='text-xs text-muted-foreground opacity-75 truncate leading-tight hidden sm:block'>
                  {kpi.description}
                </div>
              )}
              
              {kpi.trend && (
                <div className={`flex items-center justify-center gap-1 mt-1 text-xs ${
                  kpi.trend.direction === 'up' ? 'text-[hsl(var(--status-success))]' :
                  kpi.trend.direction === 'down' ? 'text-[hsl(var(--status-error))]' :
                  'text-muted-foreground'
                }`}>
                  {kpi.trend.direction === 'up' && <span className='text-xs'>↗</span>}
                  {kpi.trend.direction === 'down' && <span className='text-xs'>↘</span>}
                  {kpi.trend.direction === 'neutral' && <span className='text-xs'>→</span>}
                  <span className='font-medium text-xs'>
                    {kpi.trend.value > 0 ? '+' : ''}{kpi.trend.value}%
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}