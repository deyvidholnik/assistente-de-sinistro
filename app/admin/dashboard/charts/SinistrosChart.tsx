'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Tooltip, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartContainer as CustomChartContainer } from './shared/ChartContainer'
import { EmptyState } from './shared/EmptyState'

interface SinistrosData {
  total: number
  porStatus: Record<string, number>
  porTipo: Record<string, number>
  porDia: Array<{ date: string; count: number }>
}

interface SinistrosChartProps {
  data: SinistrosData
  loading?: boolean
  className?: string
}

const chartConfig = {
  count: {
    label: 'Quantidade',
    color: 'hsl(var(--chart-1))',
  },
  status: {
    label: 'Status',
    color: 'hsl(var(--chart-2))',
  },
  tipo: {
    label: 'Tipo',
    color: 'hsl(var(--chart-3))',
  },
}

const statusColors = {
  pendente: 'hsl(var(--status-warning))',
  em_analise: 'hsl(var(--status-info))',
  aprovado: 'hsl(var(--status-success))',
  rejeitado: 'hsl(var(--status-error))',
  concluido: 'hsl(var(--chart-1))',
}

const tipoColors = {
  sinistro_colisao: 'hsl(var(--status-error))',
  sinistro_furto: 'hsl(var(--chart-4))',
  sinistro_roubo: 'hsl(var(--status-error))',
  sinistro_pequenos_reparos: 'hsl(var(--status-success))',
  assistencia_guincho: 'hsl(var(--brand-primary))',
  assistencia_pane_seca: 'hsl(var(--chart-2))',
  assistencia_pane_mecanica: 'hsl(var(--chart-3))',
  assistencia_pane_eletrica: 'hsl(var(--chart-5))',
  assistencia_trocar_pneu: 'hsl(var(--brand-secondary))',
  assistencia_taxi: 'hsl(var(--chart-1))',
  assistencia_hotel: 'hsl(var(--chart-4))',
}

function formatStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pendente: 'Pendente',
    em_analise: 'Em Análise',
    aprovado: 'Aprovado',
    rejeitado: 'Rejeitado',
    concluido: 'Concluído',
  }
  return labels[status] || status
}

function formatTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    sinistro_colisao: 'Colisão',
    sinistro_furto: 'Furto',
    sinistro_roubo: 'Roubo',
    sinistro_pequenos_reparos: 'Pequenos Reparos',
    assistencia_guincho: 'Guincho',
    assistencia_pane_seca: 'Pane Seca',
    assistencia_pane_mecanica: 'Pane Mecânica',
    assistencia_pane_eletrica: 'Pane Elétrica',
    assistencia_trocar_pneu: 'Trocar Pneu',
    assistencia_taxi: 'Táxi',
    assistencia_hotel: 'Hotel',
  }
  return labels[tipo] || tipo
}

export function SinistrosChart({ data, loading = false, className = '' }: SinistrosChartProps) {
  // Verificar se há dados
  if (!data || (!data.total && Object.keys(data.porStatus || {}).length === 0)) {
    return (
      <EmptyState 
        title="Nenhum sinistro encontrado"
        description="Não há dados de sinistros disponíveis para o período selecionado."
        className={className}
      />
    )
  }
  // Dados para gráfico de barras por status
  const statusData = Object.entries(data.porStatus || {}).map(([status, count]) => ({
    name: formatStatusLabel(status),
    value: Number(count) || 0,
    fill: statusColors[status as keyof typeof statusColors] || 'hsl(var(--muted))',
  }))

  // Dados para gráfico de pizza por tipo
  const tipoData = Object.entries(data.porTipo || {}).map(([tipo, count]) => ({
    name: formatTipoLabel(tipo),
    value: Number(count) || 0,
    fill: tipoColors[tipo as keyof typeof tipoColors] || 'hsl(var(--muted))',
  }))

  // Dados para linha temporal
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

  const totalTrend = (data.porDia || []).length >= 2 
    ? ((data.porDia[data.porDia.length - 1].count - data.porDia[data.porDia.length - 2].count) / (data.porDia[data.porDia.length - 2].count || 1)) * 100
    : 0

  return (
    <div className={`space-y-4 md:space-y-6 ${className}`}>
      {/* Gráfico de Status - Largura total */}
      <div>
        <CustomChartContainer
          title='Sinistros por Status'
          description='Distribuição por status de aprovação'
          loading={loading}
          trend={{
            value: Math.round(totalTrend),
            period: 'vs. dia anterior',
            direction: totalTrend > 0 ? 'up' : totalTrend < 0 ? 'down' : 'neutral'
          }}
        >
          <ChartContainer config={chartConfig} className='h-[180px] sm:h-[250px] md:h-[350px] lg:h-[400px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: 10, bottom: 35 }}>
                <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
                <XAxis 
                  dataKey='name' 
                  tick={{ fontSize: 8 }}
                  angle={-45}
                  textAnchor='end'
                  height={35}
                  interval={0}
                />
                <YAxis tick={{ fontSize: 8 }} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='value' radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CustomChartContainer>
      </div>

      <div className='grid grid-cols-1 gap-3 md:gap-4 lg:gap-6 md:grid-cols-2'>
        {/* Gráfico de Tipos com Legendas */}
        <div>
          <CustomChartContainer
            title='Sinistros por Tipo'
            description='Distribuição por tipo de atendimento'
            loading={loading}
          >
            <ChartContainer config={chartConfig} className='h-[200px] sm:h-[280px] md:h-[350px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart margin={{ top: 10, right: 10, bottom: 50, left: 10 }}>
                  <Pie
                    data={tipoData}
                    cx='50%'
                    cy='35%'
                    labelLine={false}
                    outerRadius={45}
                    fill='#8884d8'
                    dataKey='value'
                  >
                    {tipoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend 
                    verticalAlign='bottom' 
                    height={45}
                    wrapperStyle={{ fontSize: '8px', paddingTop: '5px', lineHeight: '1.1' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CustomChartContainer>
        </div>

        {/* Gráfico de Linha Temporal */}
        <div>
          <CustomChartContainer
            title='Tendência Temporal'
            description='Sinistros registrados no período'
            loading={loading}
          >
            <ChartContainer config={chartConfig} className='h-[180px] sm:h-[250px] md:h-[320px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={timelineData} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
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
                  <Line 
                    type='monotone' 
                    dataKey='count' 
                    stroke='hsl(var(--brand-primary))' 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--brand-primary))', strokeWidth: 1, r: 3 }}
                    activeDot={{ r: 5, stroke: 'hsl(var(--brand-primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CustomChartContainer>
        </div>
      </div>
    </div>
  )
}