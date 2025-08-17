'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, RefreshCw } from 'lucide-react'

interface DateRangeFilterProps {
  dateFrom: string
  dateTo: string
  onDateFromChange: (date: string) => void
  onDateToChange: (date: string) => void
  onRefresh: () => void
  isLoading?: boolean
  isDark?: boolean
}

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onRefresh,
  isLoading = false,
  isDark = false,
}: DateRangeFilterProps) {
  const handleQuickRange = (days: number) => {
    const hoje = new Date()
    const inicio = new Date()
    inicio.setDate(hoje.getDate() - days)
    
    onDateFromChange(inicio.toISOString().split('T')[0])
    onDateToChange(hoje.toISOString().split('T')[0])
  }

  const getQuickRangeBadges = () => [
    { label: '7 dias', days: 7 },
    { label: '15 dias', days: 15 },
    { label: '30 dias', days: 30 },
    { label: '90 dias', days: 90 },
  ]

  return (
    <Card className='border-0 shadow-lg bg-card/50 backdrop-blur-sm transition-all duration-300'>
      <CardContent className='p-3 md:p-4'>
        <div className='flex flex-col xl:flex-row gap-3 md:gap-4 items-start xl:items-center'>
          {/* Título */}
          <div className='flex items-center gap-2 min-w-fit'>
            <Calendar className='w-4 md:w-5 h-4 md:h-5 text-[hsl(var(--brand-primary))]' />
            <h3 className='text-sm md:text-base font-semibold text-foreground'>
              Período de Análise
            </h3>
          </div>

          {/* Filtros de Data */}
          <div className='flex flex-col sm:flex-row gap-2 md:gap-3 flex-1'>
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-medium text-muted-foreground'>
                Data Inicial
              </label>
              <input
                type='date'
                value={dateFrom}
                onChange={(e) => onDateFromChange(e.target.value)}
                className='px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-[hsl(var(--brand-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))]/20 transition-colors'
              />
            </div>
            
            <div className='flex flex-col gap-1'>
              <label className='text-xs font-medium text-muted-foreground'>
                Data Final
              </label>
              <input
                type='date'
                value={dateTo}
                onChange={(e) => onDateToChange(e.target.value)}
                className='px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-[hsl(var(--brand-primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-primary))]/20 transition-colors'
              />
            </div>
          </div>

          {/* Períodos Rápidos */}
          <div className='flex flex-wrap gap-2'>
            {getQuickRangeBadges().map((range) => (
              <Badge
                key={range.days}
                variant='outline'
                className='cursor-pointer hover:bg-[hsl(var(--surface-hover))] hover:border-[hsl(var(--border-accent))] transition-colors text-xs'
                onClick={() => handleQuickRange(range.days)}
              >
                {range.label}
              </Badge>
            ))}
          </div>

          {/* Botão Atualizar */}
          <Button
            onClick={onRefresh}
            disabled={isLoading}
            size='sm'
            className='flex items-center gap-2 bg-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary))]/90 text-[hsl(var(--brand-primary-foreground))] min-w-fit'
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}