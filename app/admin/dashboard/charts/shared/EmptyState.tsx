'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { AlertCircle, BarChart3 } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
  className?: string
}

export function EmptyState({ 
  title = 'Nenhum dado disponível', 
  description = 'Os dados ainda não foram carregados ou não há informações para exibir.',
  className = '' 
}: EmptyStateProps) {
  return (
    <Card className={`border-dashed border-2 border-border/50 ${className}`}>
      <CardContent className='p-8 text-center'>
        <div className='w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4'>
          <BarChart3 className='w-8 h-8 text-muted-foreground' />
        </div>
        <h3 className='text-lg font-semibold text-foreground mb-2'>
          {title}
        </h3>
        <p className='text-sm text-muted-foreground max-w-md mx-auto'>
          {description}
        </p>
      </CardContent>
    </Card>
  )
}