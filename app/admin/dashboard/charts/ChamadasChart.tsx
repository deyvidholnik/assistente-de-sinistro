'use client'

import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartContainer as CustomChartContainer } from './shared/ChartContainer'
import { EmptyState } from './shared/EmptyState'
import { Clock, Phone, Users } from 'lucide-react'

interface ChamadasData {
  total: number
  totalMinutos: number
  minutosMedia: number
  porAgente: Record<string, number>
  porDia: Array<{ date: string; count: number }>
}

interface ChamadasChartProps {
  data: ChamadasData
  loading?: boolean
  className?: string
}

const chartConfig = {
  count: {
    label: 'Chamadas',
    color: 'hsl(var(--brand-primary))',
  },
  minutos: {
    label: 'Minutos',
    color: 'hsl(var(--brand-secondary))',
  },
  agente: {
    label: 'Agente',
    color: 'hsl(var(--chart-3))',
  },
}

const agentColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--brand-primary))',
  'hsl(var(--brand-secondary))',
  'hsl(var(--status-success))',
  'hsl(var(--status-warning))',
  'hsl(var(--status-info))',
]

export function ChamadasChart({ data, loading = false, className = '' }: ChamadasChartProps) {
  // Verificar se há dados
  if (!data || (!data.total && Object.keys(data.porAgente || {}).length === 0)) {
    return (
      <EmptyState 
        title="Nenhuma chamada encontrada"
        description="Não há dados de chamadas de IA disponíveis para o período selecionado."
        className={className}
      />
    )
  }
  // Dados para gráfico de área temporal
  const timelineData = (data.porDia || []).map((item) => {
    try {
      return {
        date: new Date(item.date).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        count: Number(item.count) || 0,
      }
    } catch (error) {
      return {
        date: item.date || 'Data inválida',
        count: Number(item.count) || 0,
      }
    }
  })

  // Calcular estatísticas
  const avgCallsPerDay = (data.porDia || []).length > 0 
    ? Math.round((data.total || 0) / data.porDia.length * 10) / 10
    : 0

  const totalTrend = (data.porDia || []).length >= 2 
    ? ((data.porDia[data.porDia.length - 1].count - data.porDia[data.porDia.length - 2].count) / (data.porDia[data.porDia.length - 2].count || 1)) * 100
    : 0

  // Dados para métricas resumidas
  const metricsData = [
    {
      name: 'Total de Chamadas',
      value: data.total || 0,
      icon: Phone,
      color: 'hsl(var(--brand-primary))',
    },
    {
      name: 'Minutos Totais',
      value: data.totalMinutos || 0,
      icon: Clock,
      color: 'hsl(var(--brand-secondary))',
    },
    {
      name: 'Média por Chamada',
      value: `${data.minutosMedia || 0} min`,
      icon: Clock,
      color: 'hsl(var(--chart-3))',
    },
    {
      name: 'Agentes Ativos',
      value: Object.keys(data.porAgente || {}).length,
      icon: Users,
      color: 'hsl(var(--status-success))',
    },
  ]

  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {/* Métricas Resumidas */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'>
        {metricsData.map((metric, index) => {
          const IconComponent = metric.icon
          return (
            <div key={index} className='bg-card/50 backdrop-blur-sm rounded-lg p-3 md:p-4 border border-border/50'>
              <div className='flex items-center gap-2 md:gap-3'>
                <div 
                  className='w-8 md:w-10 h-8 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0'
                  style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
                >
                  <IconComponent className='w-4 md:w-5 h-4 md:h-5' />
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='text-sm md:text-lg lg:text-2xl font-bold text-foreground truncate'>
                    {typeof metric.value === 'number' ? metric.value.toLocaleString('pt-BR') : metric.value}
                  </div>
                  <div className='text-xs text-muted-foreground truncate'>{metric.name}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Gráfico de Área Temporal - Largura total */}
      <div>
        <CustomChartContainer
          title='Volume de Chamadas'
          description='Chamadas de IA registradas por dia'
          loading={loading}
          trend={{
            value: Math.round(totalTrend),
            period: 'vs. dia anterior',
            direction: totalTrend > 0 ? 'up' : totalTrend < 0 ? 'down' : 'neutral'
          }}
        >
          <ChartContainer config={chartConfig} className='h-[180px] sm:h-[250px] md:h-[320px] lg:h-[380px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
                <XAxis 
                  dataKey='date' 
                  tick={{ fontSize: 8 }}
                  angle={-45}
                  textAnchor='end'
                  height={30}
                />
                <YAxis tick={{ fontSize: 8 }} width={25} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type='monotone' 
                  dataKey='count' 
                  stroke='hsl(var(--brand-primary))' 
                  fill='hsl(var(--brand-primary))'
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CustomChartContainer>
      </div>
    </div>
  )
}