'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { ChartContainer as CustomChartContainer } from './shared/ChartContainer'
import { Users, UserCheck, Shield, User } from 'lucide-react'

interface UsuariosData {
  total: number
  ativos: number
  porNivel: Record<string, number>
}

interface UsuariosChartProps {
  data: UsuariosData
  loading?: boolean
  className?: string
}

const chartConfig = {
  total: {
    label: 'Total',
    color: 'hsl(var(--chart-1))',
  },
  ativos: {
    label: 'Ativos',
    color: 'hsl(var(--status-success))',
  },
  nivel: {
    label: 'Nível',
    color: 'hsl(var(--brand-primary))',
  },
}

const nivelColors = {
  admin: 'hsl(var(--status-error))',
  gerente: 'hsl(var(--brand-primary))',
  operador: 'hsl(var(--status-success))',
  cliente: 'hsl(var(--chart-3))',
  guest: 'hsl(var(--muted-foreground))',
}

const nivelIcons = {
  admin: Shield,
  gerente: Users,
  operador: UserCheck,
  cliente: User,
  guest: User,
}

function formatNivelLabel(nivel: string): string {
  const labels: Record<string, string> = {
    admin: 'Administradores',
    gerente: 'Gerentes',
    operador: 'Operadores',
    cliente: 'Clientes',
    guest: 'Visitantes',
  }
  return labels[nivel] || nivel
}

export function UsuariosChart({ data, loading = false, className = '' }: UsuariosChartProps) {
  // Dados para gráfico de pizza por nível
  const nivelData = Object.entries(data.porNivel).map(([nivel, count]) => ({
    name: formatNivelLabel(nivel),
    value: count,
    nivel: nivel,
    fill: nivelColors[nivel as keyof typeof nivelColors] || 'hsl(var(--muted))',
  }))

  // Dados para gráfico de barras
  const barData = nivelData.sort((a, b) => b.value - a.value)

  // Calcular percentuais
  const percentualAtivos = data.total > 0 ? ((data.ativos / data.total) * 100) : 0
  const percentualInativos = 100 - percentualAtivos

  // Dados para gráfico de status (ativo/inativo)
  const statusData = [
    {
      name: 'Usuários Ativos',
      value: data.ativos,
      fill: 'hsl(var(--status-success))',
    },
    {
      name: 'Usuários Inativos',
      value: data.total - data.ativos,
      fill: 'hsl(var(--muted-foreground))',
    },
  ]

  // Métricas resumidas
  const metricsData = [
    {
      name: 'Total de Usuários',
      value: data.total,
      icon: Users,
      color: 'hsl(var(--chart-1))',
      description: 'Cadastrados no sistema',
    },
    {
      name: 'Usuários Ativos',
      value: data.ativos,
      icon: UserCheck,
      color: 'hsl(var(--status-success))',
      description: `${percentualAtivos.toFixed(1)}% do total`,
    },
    {
      name: 'Usuários Inativos',
      value: data.total - data.ativos,
      icon: User,
      color: 'hsl(var(--muted-foreground))',
      description: `${percentualInativos.toFixed(1)}% do total`,
    },
    {
      name: 'Níveis de Acesso',
      value: Object.keys(data.porNivel).length,
      icon: Shield,
      color: 'hsl(var(--brand-primary))',
      description: 'Tipos diferentes',
    },
  ]

  return (
    <div className={`grid gap-6 ${className}`}>
      {/* Métricas Resumidas */}
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {metricsData.map((metric, index) => {
          const IconComponent = metric.icon
          return (
            <div key={index} className='bg-card/50 backdrop-blur-sm rounded-lg p-4 border border-border/50'>
              <div className='flex items-center gap-3'>
                <div 
                  className='w-10 h-10 rounded-lg flex items-center justify-center'
                  style={{ backgroundColor: `${metric.color}15`, color: metric.color }}
                >
                  <IconComponent className='w-5 h-5' />
                </div>
                <div>
                  <div className='text-2xl font-bold text-foreground'>
                    {metric.value.toLocaleString('pt-BR')}
                  </div>
                  <div className='text-xs text-muted-foreground'>{metric.name}</div>
                  {metric.description && (
                    <div className='text-xs text-muted-foreground mt-1'>{metric.description}</div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Gráfico de Status (Ativo/Inativo) */}
        <CustomChartContainer
          title='Status dos Usuários'
          description='Distribuição entre usuários ativos e inativos'
          loading={loading}
        >
          <ChartContainer config={chartConfig} className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={statusData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={90}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CustomChartContainer>

        {/* Gráfico de Pizza por Nível */}
        <CustomChartContainer
          title='Usuários por Nível'
          description='Distribuição por nível de acesso'
          loading={loading}
        >
          <ChartContainer config={chartConfig} className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={nivelData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, percent }) => percent > 5 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  outerRadius={90}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {nivelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CustomChartContainer>
      </div>

      {/* Gráfico de Barras - Ranking por Nível */}
      {nivelData.length > 0 && (
        <CustomChartContainer
          title='Ranking por Nível de Acesso'
          description='Quantidade de usuários por tipo de permissão'
          loading={loading}
        >
          <ChartContainer config={chartConfig} className='h-[250px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray='3 3' opacity={0.3} />
                <XAxis 
                  dataKey='name' 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey='value' radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CustomChartContainer>
      )}

      {/* Lista Detalhada por Nível */}
      <CustomChartContainer
        title='Detalhamento por Nível'
        description='Informações detalhadas dos níveis de acesso'
        loading={loading}
      >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {nivelData.map((item) => {
            const IconComponent = nivelIcons[item.nivel as keyof typeof nivelIcons] || User
            const percentage = data.total > 0 ? ((item.value / data.total) * 100) : 0
            
            return (
              <div key={item.nivel} className='bg-[hsl(var(--surface-elevated))] rounded-lg p-4 border border-border/50'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-2'>
                    <div 
                      className='w-8 h-8 rounded-lg flex items-center justify-center'
                      style={{ backgroundColor: `${item.fill}15`, color: item.fill }}
                    >
                      <IconComponent className='w-4 h-4' />
                    </div>
                    <span className='font-medium text-foreground'>{item.name}</span>
                  </div>
                  <span className='text-sm text-muted-foreground'>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className='text-2xl font-bold text-foreground mb-1'>
                  {item.value.toLocaleString('pt-BR')}
                </div>
                <div className='text-xs text-muted-foreground'>
                  usuários neste nível
                </div>
              </div>
            )
          })}
        </div>
      </CustomChartContainer>
    </div>
  )
}