'use client'

import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartContainer as CustomChartContainer } from './shared/ChartContainer'
import { EmptyState } from './shared/EmptyState'

interface TipoAssistenciaData {
  logs: Array<{
    numero_sinistro: string
    tipo_atendimento: string
    tipo_assistencia?: string
    assistencia_adicional?: boolean
    assistencias_tipos?: string | string[]
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

const assistenciaColors = {
  guincho: '#3b82f6', // azul
  pane_seca: '#8b5cf6', // roxo
  pane_mecanica: '#06b6d4', // ciano
  pane_eletrica: '#eab308', // amarelo
  trocar_pneu: '#ec4899', // rosa
  taxi: '#84cc16', // lime
  hotel: '#f59e0b', // âmbar
}

function formatAssistenciaLabel(tipo: string): string {
  const labels: Record<string, string> = {
    guincho: 'Guincho',
    pane_seca: 'Pane Seca',
    pane_mecanica: 'Pane Mecânica',
    pane_eletrica: 'Pane Elétrica',
    trocar_pneu: 'Trocar Pneu',
    taxi: 'Táxi',
    hotel: 'Hotel',
  }
  return labels[tipo] || tipo
}

export function TipoAssistenciaChart({ data, loading = false, className = '' }: TipoAssistenciaChartProps) {
  // Hook para detectar tamanho da tela
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Processar dados para unificar todas as assistências
  const processarDados = () => {
    const logs = data.logs
    const todasAssistencias: Record<string, number> = {}

    // 1. Contar assistências diretas
    const assistenciasDirectas = logs.filter(log => log.tipo_atendimento === 'assistencia')
    assistenciasDirectas.forEach(log => {
      if (log.tipo_assistencia) {
        const tipo = log.tipo_assistencia
        todasAssistencias[tipo] = (todasAssistencias[tipo] || 0) + 1
      }
    })

    // 2. Contar assistências adicionais de TODOS os registros
    const registrosComAdicionais = logs.filter(log => log.assistencia_adicional === true)
    registrosComAdicionais.forEach(log => {
      if (log.assistencias_tipos) {
        // Verificar se é array ou string
        const tipos = Array.isArray(log.assistencias_tipos) 
          ? log.assistencias_tipos 
          : log.assistencias_tipos.split(',')
        
        tipos.forEach(tipo => {
          const tipoLimpo = String(tipo).trim()
          if (tipoLimpo) {
            todasAssistencias[tipoLimpo] = (todasAssistencias[tipoLimpo] || 0) + 1
          }
        })
      }
    })

    return {
      todasAssistencias,
      totalAssistencias: Object.values(todasAssistencias).reduce((sum, count) => sum + count, 0),
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

  // Dados para gráfico de pizza (igual ao "Sinistros por Tipo")
  const assistenciasData = Object.entries(dados.todasAssistencias).map(([tipo, count]) => ({
    name: formatAssistenciaLabel(tipo),
    value: Number(count) || 0,
    fill: assistenciaColors[tipo as keyof typeof assistenciaColors] || 'hsl(var(--muted))',
  })).sort((a, b) => b.value - a.value)

  return (
    <div className={className}>
      <CustomChartContainer
        title='Assistências por Tipo'
        description='Distribuição por tipo de assistência (diretas e adicionais)'
        loading={loading}
      >
        <ChartContainer
          config={chartConfig}
          className='h-[320px] max-w-full mx-auto'
        >
          <ResponsiveContainer
            width='100%'
            height='100%'
          >
            <PieChart>
              <Pie
                data={assistenciasData}
                cx={isMobile ? '50%' : '50%'}
                cy={isMobile ? '35%' : '40%'}
                labelLine={false}
                label={({ value }) => value}
                outerRadius={isMobile ? 60 : 80}
                fill='#8884d8'
                dataKey='value'
              >
                {assistenciasData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                  />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend
                height={isMobile ? 70 : 30}
                align='center'
                wrapperStyle={{
                  fontSize: isMobile ? '8px' : '10px',
                  paddingTop: isMobile ? '20px' : '0px',
                  paddingRight: '0px',
                  paddingLeft: '0px',
                  lineHeight: isMobile ? '12px' : '4px',
                  textAlign: 'center',
                  maxWidth: '100%',
                  overflow: 'hidden',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CustomChartContainer>
    </div>
  )
}