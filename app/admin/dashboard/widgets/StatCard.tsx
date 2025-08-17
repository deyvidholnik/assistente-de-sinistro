'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color?: string
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    color?: string
  }
  className?: string
  loading?: boolean
  onClick?: () => void
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'hsl(var(--brand-primary))',
  badge,
  className = '',
  loading = false,
  onClick,
}: StatCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toLocaleString('pt-BR')
    }
    return val
  }

  const CardComponent = onClick ? 'button' : 'div'

  return (
    <Card
      className={` shadow-lg bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${
        onClick ? 'cursor-pointer hover:scale-105' : ''
      } ${className}`}
    >
      <CardContent className='p-4'>
        <CardComponent
          onClick={onClick}
          className={`w-full text-left ${
            onClick
              ? 'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--brand-primary))] rounded-lg'
              : ''
          }`}
        >
          {loading ? (
            <div className='animate-pulse'>
              <div className='flex items-center justify-between mb-3'>
                <div className='w-8 h-8 bg-muted rounded-lg' />
                <div className='w-12 h-4 bg-muted rounded' />
              </div>
              <div className='w-20 h-6 bg-muted rounded mb-2' />
              <div className='w-16 h-3 bg-muted rounded' />
            </div>
          ) : (
            <>
              <div className='flex items-center justify-between mb-3'>
                <div
                  className='w-8 h-8 rounded-lg flex items-center justify-center'
                  style={{
                    backgroundColor: `${color}15`,
                    color: color,
                  }}
                >
                  <Icon className='w-4 h-4' />
                </div>

                {badge && (
                  <Badge
                    variant={badge.variant || 'outline'}
                    className='text-xs'
                    style={
                      badge.color
                        ? {
                            backgroundColor: `${badge.color}15`,
                            color: badge.color,
                            borderColor: `${badge.color}30`,
                          }
                        : undefined
                    }
                  >
                    {badge.text}
                  </Badge>
                )}
              </div>

              <div className='text-lg font-bold text-foreground mb-1'>{formatValue(value)}</div>

              <div className='text-sm text-muted-foreground'>{title}</div>

              {subtitle && <div className='text-xs text-muted-foreground mt-1 opacity-75'>{subtitle}</div>}
            </>
          )}
        </CardComponent>
      </CardContent>
    </Card>
  )
}
