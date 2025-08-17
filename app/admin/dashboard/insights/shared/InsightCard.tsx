'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LucideIcon, TrendingUp, TrendingDown, AlertCircle, Info } from 'lucide-react'

interface InsightCardProps {
  title: string
  description: string
  children: React.ReactNode
  icon?: LucideIcon
  type?: 'info' | 'warning' | 'success' | 'error' | 'neutral'
  badge?: {
    text: string
    type?: 'info' | 'warning' | 'success' | 'error'
  }
  className?: string
  loading?: boolean
}

export function InsightCard({
  title,
  description,
  children,
  icon: Icon,
  type = 'neutral',
  badge,
  className = '',
  loading = false,
}: InsightCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          borderColor: 'hsl(var(--status-success))',
          iconColor: 'hsl(var(--status-success))',
          bgColor: 'hsl(var(--status-success))',
        }
      case 'warning':
        return {
          borderColor: 'hsl(var(--status-warning))',
          iconColor: 'hsl(var(--status-warning))',
          bgColor: 'hsl(var(--status-warning))',
        }
      case 'error':
        return {
          borderColor: 'hsl(var(--status-error))',
          iconColor: 'hsl(var(--status-error))',
          bgColor: 'hsl(var(--status-error))',
        }
      case 'info':
        return {
          borderColor: 'hsl(var(--status-info))',
          iconColor: 'hsl(var(--status-info))',
          bgColor: 'hsl(var(--status-info))',
        }
      default:
        return {
          borderColor: 'hsl(var(--border))',
          iconColor: 'hsl(var(--muted-foreground))',
          bgColor: 'hsl(var(--muted-foreground))',
        }
    }
  }

  const getBadgeStyles = (badgeType?: string) => {
    switch (badgeType) {
      case 'success':
        return 'bg-[hsl(var(--status-success))]/15 text-[hsl(var(--status-success))] border-[hsl(var(--status-success))]/30'
      case 'warning':
        return 'bg-[hsl(var(--status-warning))]/15 text-[hsl(var(--status-warning))] border-[hsl(var(--status-warning))]/30'
      case 'error':
        return 'bg-[hsl(var(--status-error))]/15 text-[hsl(var(--status-error))] border-[hsl(var(--status-error))]/30'
      case 'info':
        return 'bg-[hsl(var(--status-info))]/15 text-[hsl(var(--status-info))] border-[hsl(var(--status-info))]/30'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getDefaultIcon = () => {
    switch (type) {
      case 'success':
        return TrendingUp
      case 'warning':
        return AlertCircle
      case 'error':
        return TrendingDown
      case 'info':
        return Info
      default:
        return Info
    }
  }

  const styles = getTypeStyles()
  const IconComponent = Icon || getDefaultIcon()

  return (
    <Card
      className={` shadow-lg bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${className}`}
      style={{ borderLeftColor: styles.borderColor, borderLeftWidth: '4px' }}
    >
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div
              className='w-8 h-8 rounded-lg flex items-center justify-center'
              style={{
                backgroundColor: `${styles.bgColor}15`,
                color: styles.iconColor,
              }}
            >
              <IconComponent className='w-4 h-4' />
            </div>
            <div>
              <CardTitle className='text-base font-semibold text-foreground'>{title}</CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>{description}</p>
            </div>
          </div>

          {badge && (
            <Badge
              variant='outline'
              className={`text-xs ${getBadgeStyles(badge.type)}`}
            >
              {badge.text}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className='pt-0'>
        {loading ? (
          <div className='animate-pulse space-y-3'>
            <div className='h-4 bg-muted rounded w-3/4' />
            <div className='h-4 bg-muted rounded w-1/2' />
            <div className='h-4 bg-muted rounded w-2/3' />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
