'use client'

import React from 'react'

interface DashboardGridProps {
  children: React.ReactNode
  className?: string
}

interface GridSectionProps {
  children: React.ReactNode
  className?: string
  title?: string
  isDark?: boolean
}

interface GridItemProps {
  children: React.ReactNode
  className?: string
  span?: 'full' | 'half' | 'third' | 'quarter' | 'auto'
  height?: 'auto' | 'small' | 'medium' | 'large'
}

export function DashboardGrid({ children, className = '' }: DashboardGridProps) {
  return <div className={`grid gap-4 md:gap-6 ${className}`}>{children}</div>
}

export function GridSection({ children, className = '', title, isDark = false }: GridSectionProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {title && (
        <div className='flex items-center gap-2 mb-4 md:mb-6'>
          <h2 className={`text-lg md:text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h2>
          <div className='flex-1 h-px bg-gradient-to-r from-blue-600/20 to-transparent' />
        </div>
      )}
      <div className='overflow-hidden'>{children}</div>
    </div>
  )
}

export function GridItem({ children, className = '', span = 'auto', height = 'auto' }: GridItemProps) {
  const spanClasses = {
    full: 'col-span-full',
    half: 'col-span-1 lg:col-span-2',
    third: 'col-span-1 lg:col-span-1',
    quarter: 'col-span-1',
    auto: 'col-span-1',
  }

  const heightClasses = {
    auto: 'h-auto',
    small: 'h-[200px]',
    medium: 'h-[300px]',
    large: 'h-[400px]',
  }

  return <div className={`${spanClasses[span]} ${heightClasses[height]} ${className}`}>{children}</div>
}

// Utilitário para definir colunas responsivas
function getGridCols(): string {
  return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
}

// Componente para métricas em linha (KPIs)
export function MetricsRow({ children, className = '' }: DashboardGridProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4 ${className}`}>
      {children}
    </div>
  )
}

// Componente para gráficos grandes
export function ChartsGrid({ children, className = '' }: DashboardGridProps) {
  return <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 ${className}`}>{children}</div>
}

// Componente para seção de insights
export function InsightsGrid({ children, className = '' }: DashboardGridProps) {
  return <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 ${className}`}>{children}</div>
}

// Componente wrapper para conteúdo responsivo
export function ResponsiveWrapper({ children, className = '' }: DashboardGridProps) {
  return (
    <div
      className={`w-full mx-auto px-4 overflow-x-hidden ${className}`}
      style={{ maxWidth: '1400px' }}
    >
      <div className='w-full min-w-0'>{children}</div>
    </div>
  )
}
