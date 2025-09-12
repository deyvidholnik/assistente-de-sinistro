'use client'

import React from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartContainer as CustomChartContainer } from './shared/ChartContainer'
import { EmptyState } from './shared/EmptyState'
import { Car, Shield, FileText, AlertTriangle } from 'lucide-react'

interface TipoAssistenciaData {
  logs: Array<{
    numero_sinistro: string
    tipo_atendimento: string
    tipo_assistencia?: string
    assistencia_adicional?: boolean
    assistencias_tipos?: string
  }>
}

interface TipoAssistenciaChartProps {
  data: TipoAssistenciaData
  loading?: boolean
  className?: string
}

const chartConfig = {
  assistencia: {
    label: 'Assistências',
    color: 'hsl(var(--brand-secondary))',
  },
}

const assistenciaColors = [
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--brand-secondary))',
  'hsl(var(--status-success))',
  'hsl(var(--status-info))',
  'hsl(var(--brand-primary))',
  'hsl(var(--status-warning))',
]

const adicionaisColors = [
  'hsl(var(--status-error))',
  'hsl(var(--status-warning))',
  'hsl(var(--chart-1))',
  'hsl(var(--status-info))',
  'hsl(var(--chart-5))',
  'hsl(var(--brand-primary))',
]

export function TipoAssistenciaChart({ data, loading = false, className = '' }: TipoAssistenciaChartProps) {
  // Processar dados para gráficos - focar apenas em assistências
  const processarDados = () => {
    const logs = data.logs

    // Filtrar apenas assistências
    const assistencias = logs.filter(log => log.tipo_atendimento === 'assistencia')
    
    // Contar tipos de assistência
    const tiposAssistencia = assistencias.reduce((acc, log) => {
      const tipo = log.tipo_assistencia || 'indefinido'
      acc[tipo] = (acc[tipo] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Contar assistências adicionais
    const assistenciasAdicionais = assistencias.filter(log => log.assistencia_adicional === true)
    const tiposAdicionais = {} as Record<string, number>
    
    assistenciasAdicionais.forEach(log => {
      if (log.assistencias_tipos) {
        const tipos = log.assistencias_tipos.split(',')
        tipos.forEach(tipo => {
          const tipoLimpo = tipo.trim()
          tiposAdicionais[tipoLimpo] = (tiposAdicionais[tipoLimpo] || 0) + 1
        })
      }
    })

    return {
      tiposAssistencia,
      tiposAdicionais,
      totalAssistencias: assistencias.length,
      totalAdicionais: assistenciasAdicionais.length,
    }
  }

  const dados = processarDados()

  // Verificar se há assistências
  if (dados.totalAssistencias === 0) {
    return (
      <EmptyState 
        title="Nenhuma assistência encontrada"
        description="Não há dados de assistências disponíveis para o período selecionado."
        className={className}
      />
    )
  }

  // Preparar dados para gráficos
  const dadosAssistencia = Object.entries(dados.tiposAssistencia).map(([tipo, count]) => ({
    name: tipo === 'hotel' ? 'Hotel'
         : tipo === 'guincho' ? 'Guincho'
         : tipo === 'taxi' ? 'Táxi'
         : tipo === 'pane_seca' ? 'Pane Seca'
         : tipo === 'pane_mecanica' ? 'Pane Mecânica'
         : tipo === 'pane_eletrica' ? 'Pane Elétrica'
         : tipo === 'trocar_pneu' ? 'Trocar Pneu'
         : tipo,
    value: count,
    percent: dados.totalAssistencias > 0 ? ((count / dados.totalAssistencias) * 100).toFixed(1) : '0',
  })).sort((a, b) => b.value - a.value)

  const dadosAdicionais = Object.entries(dados.tiposAdicionais).map(([tipo, count]) => ({
    name: tipo,
    value: count,
    percent: dados.totalAdicionais > 0 ? ((count / dados.totalAdicionais) * 100).toFixed(1) : '0',
  })).sort((a, b) => b.value - a.value)

  // Dados para métricas resumidas
  const metricsData = [
    {
      name: 'Total de Assistências',
      value: dados.totalAssistencias,
      icon: Car,
      color: 'hsl(var(--brand-secondary))',
    },
    {
      name: 'Assistências Adicionais',
      value: dados.totalAdicionais,
      icon: Shield,
      color: 'hsl(var(--status-info))',
    },
    {
      name: 'Tipos Diferentes',
      value: Object.keys(dados.tiposAssistencia).length,
      icon: FileText,
      color: 'hsl(var(--brand-primary))',
    },
    {
      name: 'Taxa Adicionais',
      value: `${dados.totalAssistencias > 0 ? ((dados.totalAdicionais / dados.totalAssistencias) * 100).toFixed(1) : '0'}%`,
      icon: AlertTriangle,
      color: 'hsl(var(--status-warning))',
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

      {/* Gráficos */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6'>
        
        {/* Gráfico Pizza - Tipos de Assistência */}
        {dadosAssistencia.length > 0 && (
          <CustomChartContainer
            title='Distribuição por Tipo de Assistência'
            description={`Proporção dos ${dados.totalAssistencias} atendimentos de assistência`}
            loading={loading}
          >
            <ChartContainer config={chartConfig} className='h-[250px] md:h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={dadosAssistencia}
                    cx='50%'
                    cy='50%'
                    outerRadius={80}
                    fill='#8884d8'
                    dataKey='value'
                    label={({ name, percent }) => `${name}: ${percent}%`}
                  >
                    {dadosAssistencia.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={assistenciaColors[index % assistenciaColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CustomChartContainer>
        )}

        {/* Gráfico Barras - Ranking de Assistências */}
        {dadosAssistencia.length > 0 && (
          <CustomChartContainer
            title='Ranking de Assistências'
            description={`As assistências mais solicitadas (${dados.totalAssistencias} total)`}
            loading={loading}
          >
            <ChartContainer config={chartConfig} className='h-[250px] md:h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={dadosAssistencia} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
                  <XAxis 
                    dataKey='name' 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='value' radius={4}>
                    {dadosAssistencia.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={assistenciaColors[index % assistenciaColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CustomChartContainer>
        )}

      </div>

      {/* Assistências Adicionais - se existirem */}
      {dados.totalAdicionais > 0 && dadosAdicionais.length > 0 && (
        <div className='mt-6'>
          <CustomChartContainer
            title='Assistências Adicionais Solicitadas'
            description={`Serviços extras solicitados além da assistência principal (${dados.totalAdicionais} casos)`}
            loading={loading}
          >
            <ChartContainer config={chartConfig} className='h-[250px] md:h-[300px]'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={dadosAdicionais} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
                  <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
                  <XAxis 
                    dataKey='name' 
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor='end'
                    height={80}
                  />
                  <YAxis tick={{ fontSize: 10 }} width={30} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey='value' radius={4}>
                    {dadosAdicionais.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={adicionaisColors[index % adicionaisColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CustomChartContainer>
        </div>
      )}
    </div>
  )
}