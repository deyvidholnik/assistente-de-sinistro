'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface ChartContainerProps {
  title: string
  children: React.ReactNode
  className?: string
  description?: string
  loading?: boolean
  onRefresh?: () => void
  trend?: {
    value: number
    period: string
    direction: 'up' | 'down' | 'neutral'
  }
  actions?: React.ReactNode
}

export function ChartContainer({
  title,
  children,
  className = '',
  description,
  loading = false,
  onRefresh,
  trend,
  actions,
}: ChartContainerProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className='w-4 h-4 text-[hsl(var(--status-success))]' />
      case 'down':
        return <TrendingDown className='w-4 h-4 text-[hsl(var(--status-error))]' />
      default:
        return <Minus className='w-4 h-4 text-muted-foreground' />
    }
  }

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-[hsl(var(--status-success))]'
      case 'down':
        return 'text-[hsl(var(--status-error))]'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className={`border-0 shadow-lg bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl overflow-hidden ${className}`}>
      <CardHeader className='pb-1 px-1 md:px-2 lg:px-3'>
        <div className='flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-2 sm:justify-between min-w-0'>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-xs md:text-sm lg:text-base font-semibold text-foreground flex items-center gap-1 truncate'>
              <span className='truncate'>{title}</span>
              {loading && <RefreshCw className='w-3 h-3 animate-spin text-[hsl(var(--brand-primary))] flex-shrink-0' />}
            </CardTitle>
            {description && (
              <p className='text-xs text-muted-foreground mt-0.5 truncate hidden sm:block'>{description}</p>
            )}
          </div>
          
          <div className='flex items-center gap-1 md:gap-2 flex-shrink-0'>
            {trend && (
              <div className={`flex items-center gap-1 text-xs md:text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className='font-medium'>
                  {trend.value > 0 ? '+' : ''}{trend.value}%
                </span>
                <span className='text-xs text-muted-foreground hidden sm:inline'>
                  {trend.period}
                </span>
              </div>
            )}
            
            {actions}
            
            {onRefresh && (
              <Button
                variant='ghost'
                size='sm'
                onClick={onRefresh}
                disabled={loading}
                className='h-6 w-6 md:h-8 md:w-8 p-0 hover:bg-[hsl(var(--surface-hover))] flex-shrink-0'
              >
                <RefreshCw className={`w-3 md:w-4 h-3 md:h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className='pt-0 px-0 md:px-1 lg:px-2'>
        <div className='relative w-full overflow-hidden'>
          {loading && (
            <div className='absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10 rounded-lg'>
              <div className='flex items-center gap-1 text-muted-foreground'>
                <RefreshCw className='w-3 h-3 animate-spin' />
                <span className='text-xs'>Carregando...</span>
              </div>
            </div>
          )}
          <div className='w-full min-w-0 overflow-hidden'>
            <div className='w-full'>
              {children}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}