'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react'

interface KPIWidgetProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    period: string
    direction: 'up' | 'down' | 'neutral'
  }
  icon: LucideIcon
  color?: string
  className?: string
  loading?: boolean
}

export function KPIWidget({
  title,
  value,
  description,
  trend,
  icon: Icon,
  color = 'hsl(var(--brand-primary))',
  className = '',
  loading = false,
}: KPIWidgetProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className='w-3 h-3' />
      case 'down':
        return <TrendingDown className='w-3 h-3' />
      default:
        return <Minus className='w-3 h-3' />
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

  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('pt-BR')
    }
    return val
  }

  return (
    <Card className={`border-0 shadow-lg bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${className}`}>
      <CardContent className='p-4'>
        {loading ? (
          <div className='animate-pulse'>
            <div className='flex items-center justify-between mb-3'>
              <div className='w-10 h-10 bg-muted rounded-xl' />
              {trend && <div className='w-16 h-4 bg-muted rounded' />}
            </div>
            <div className='w-16 h-8 bg-muted rounded mb-2' />
            <div className='w-24 h-3 bg-muted rounded' />
          </div>
        ) : (
          <>
            <div className='flex items-center justify-between mb-3'>
              <div 
                className='w-10 h-10 rounded-xl flex items-center justify-center'
                style={{ 
                  backgroundColor: `${color}15`, 
                  color: color 
                }}
              >
                <Icon className='w-5 h-5' />
              </div>
              
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${getTrendColor()}`}>
                  {getTrendIcon()}
                  <span className='font-medium'>
                    {trend.value > 0 ? '+' : ''}{trend.value}%
                  </span>
                </div>
              )}
            </div>

            <div className='text-2xl font-bold text-foreground mb-1'>
              {formatValue(value)}
            </div>
            
            <div className='text-xs text-muted-foreground'>
              {title}
            </div>
            
            {description && (
              <div className='text-xs text-muted-foreground mt-1 opacity-75'>
                {description}
              </div>
            )}
            
            {trend && (
              <div className='text-xs text-muted-foreground mt-2 opacity-75'>
                {trend.period}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}