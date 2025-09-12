'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/admin-auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminPageWrapper } from './AdminPageWrapper'
import { AdminHeader } from './AdminHeader'
import { MetricsCards } from './MetricsCards'
import { DateRangeFilter } from './DateRangeFilter'
import { DashboardGrid, ResponsiveWrapper, GridSection } from './DashboardGrid'
import { SinistrosChart, UsuariosChart, TipoAssistenciaChart } from './charts'
import { TrendAnalysis } from './insights'
import { formatarTodasAssistencias } from './admin-formatters'
import { Clock } from 'lucide-react'
import { NavigationButtons } from './NavigationButtons'

interface AdminUser {
  id: number
  username: string
  email: string
  full_name: string
  user_level: string
  last_login: string | null
}

interface DashboardMetrics {
  periodo: {
    de: string
    ate: string
  }
  sinistros: {
    total: number
    porStatus: Record<string, number>
    porTipo: Record<string, number>
    porDia: Array<{ date: string; count: number }>
  }
  usuarios: {
    total: number
    ativos: number
    porNivel: Record<string, number>
  }
  logs: Array<{
    id: string
    numero_sinistro: string
    tipo_atendimento: string
    tipo_sinistro?: string
    tipo_assistencia?: string
    assistencia_adicional?: boolean
    status: string
    data_criacao: string
    cnh_proprio_nome: string
    total_assistencias?: number
    assistencias_tipos?: string
  }>
}


export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const { theme, setTheme } = useTheme()
  const { signOut, loading, isAuthenticated, user, initializing } = useAdminAuth()

  // Funções utilitárias foram movidas para lib/utils/admin-formatters.ts

  const isDark = theme === 'dark'
  const router = useRouter()

  // Ref para evitar duplas chamadas
  const loadingRef = useRef(false)

  // ✅ CORRIGIDO: Verificar autenticação sem race conditions
  useEffect(() => {
    // ✅ IMPORTANTE: Aguardar inicialização completa
    if (initializing) {
      console.log('⏳ Aguardando inicialização da autenticação...')
      return
    }

    // ✅ IMPORTANTE: Aguardar loading também
    if (loading) {
      console.log('⏳ Aguardando carregamento...')
      return
    }

    // ✅ Verificar se está autenticado APÓS inicialização
    if (!isAuthenticated) {
      console.log('🚪 Usuário não autenticado no dashboard, redirecionando para login')
      router.replace('/admin/login')
      return
    }

    // Se está autenticado mas não tem dados do usuário ainda, aguardar
    if (!user) {
      console.log('⏳ Aguardando dados do usuário...')
      return
    }

    // Se já tem adminUser configurado, não reconfigurar
    if (adminUser && adminUser.email === user.email) return

    console.log('✅ Configurando dados do usuário admin:', user.username)

    // Configurar dados do usuário admin
    setAdminUser({
      id: typeof user.id === 'string' ? parseInt(user.id) : user.id || 0,
      username: user.email || '',
      email: user.email || '',
      full_name: user.full_name || '',
      user_level: user.user_level || '',
      last_login: user.last_login || null,
    })
    // loadMetrics() será chamado pelo useEffect de dateFrom/dateTo quando adminUser for definido
  }, [loading, isAuthenticated, user, router, adminUser, initializing])

  const loadMetrics = useCallback(async () => {
    // Evitar chamadas simultâneas
    if (loadingRef.current) {
      console.log('⚠️ loadMetrics já está executando, ignorando...')
      return
    }

    try {
      loadingRef.current = true
      console.log('🚀 INICIANDO loadMetrics()', {
        time: new Date().toISOString(),
        dateFrom,
        dateTo,
      })

      setError(null)
      const params = new URLSearchParams()

      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const response = await fetch(`/api/admin/metrics?${params}`)
      const data = await response.json()

      if (response.ok) {
        setMetrics(data)
        setLastUpdate(new Date())
        console.log('✅ Métricas carregadas com sucesso')

        // Debug específico para assistências adicionais
        const logs = data.logs || []
        const comAssistenciaAdicional = logs.filter((log: any) => log.assistencia_adicional === true)
        const comTiposAssistencia = logs.filter((log: any) => log.assistencias_tipos)

        console.log('🎯 DEBUG ADMIN DASHBOARD - ASSISTÊNCIAS ADICIONAIS:', {
          totalLogs: logs.length,
          comAssistenciaAdicional: comAssistenciaAdicional.length,
          comTiposAssistencia: comTiposAssistencia.length,
          exemploComAssistencia: comAssistenciaAdicional[0],
          exemploComTipos: comTiposAssistencia[0],
        })

        // Testar formatação
        if (comAssistenciaAdicional.length > 0) {
          console.log('Formatação teste:', {
            original: comAssistenciaAdicional[0],
            formatado: formatarTodasAssistencias(comAssistenciaAdicional[0]),
          })
        }
      } else {
        setError(data.error || 'Erro ao carregar métricas')
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Erro ao carregar métricas:', err)
    } finally {
      setMetricsLoading(false)
      loadingRef.current = false
    }
  }, [dateFrom, dateTo]) // Dependências do useCallback

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh métricas admin...')
      loadMetrics()
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [loadMetrics]) // Incluir loadMetrics como dependência

  // Carregar métricas quando adminUser estiver definido ou filtros mudarem
  useEffect(() => {
    if (adminUser) {
      console.log('📊 Carregando métricas...', {
        adminUser: adminUser.email,
        dateFrom,
        dateTo,
        trigger: 'useEffect dependency change',
      })
      loadMetrics()
    }
  }, [adminUser, loadMetrics]) // Incluir loadMetrics como dependência

  const handleLogout = async () => {
    try {
      // Usar o método signOut do contexto admin
      await signOut()

      // Redirecionar para home
      router.push('/')
    } catch (error) {
      console.error('Erro no logout:', error)
      // Em caso de erro, redirecionar mesmo assim
      router.push('/')
    }
  }

  // Funções de formatação e ícones removidas - agora em lib/utils/admin-formatters.ts

  if ((loading || metricsLoading) && !metrics) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}
      >
        <div className='text-center'>
          <RefreshCw className='w-8 h-8 animate-spin mx-auto mb-4 text-blue-600' />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando dashboard administrativo...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminPageWrapper isDark={isDark}>
      <AdminHeader
        adminUser={adminUser}
        theme={theme}
        setTheme={setTheme}
        handleLogout={handleLogout}
        loadMetrics={loadMetrics}
        metricsLoading={metricsLoading}
        isDark={isDark}
      />

      <ResponsiveWrapper className='py-6 md:py-8'>
        {/* Título Principal */}
        <div className='text-center mb-6 md:mb-8 lg:mb-12'>
          <h1 className='text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-[hsl(var(--brand-primary))] via-[hsl(var(--brand-secondary))] to-[hsl(var(--brand-primary))] bg-clip-text text-transparent'>
            Dashboard
          </h1>
          <p className='text-sm md:text-base lg:text-lg xl:text-xl mb-3 md:mb-4 text-muted-foreground px-4'>
            Análise em tempo real do sistema PV Auto Proteção
          </p>

          {metrics && lastUpdate && (
            <div className='flex flex-wrap justify-center gap-2'>
              <Badge variant='outline' className='text-xs'>
                <Clock className='w-3 h-3 mr-1' />
                Atualizado: {lastUpdate.toLocaleTimeString('pt-BR')}
              </Badge>
            </div>
          )}
        </div>

        <NavigationButtons />

        {/* Filtros de Período */}
        <div className='mb-6 md:mb-8'>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onRefresh={loadMetrics}
            isLoading={metricsLoading}
            isDark={isDark}
          />
        </div>

        {error && (
          <Card className='border-[hsl(var(--status-error))] bg-[hsl(var(--status-error))]/10 mb-6'>
            <CardContent className='p-4'>
              <p className='text-[hsl(var(--status-error))] text-center font-medium'>{error}</p>
            </CardContent>
          </Card>
        )}

        {metrics && (
          <DashboardGrid>
            {/* KPIs Principais */}
            <GridSection title='Indicadores Principais' isDark={isDark}>
              <div className='col-span-full'>
                <MetricsCards metrics={metrics} isDark={isDark} />
              </div>
            </GridSection>

            {/* Análise de Tendências */}
            <GridSection title='Análise de Tendências e Insights' isDark={isDark}>
              <div className='col-span-full'>
                <TrendAnalysis data={metrics} loading={metricsLoading} />
              </div>
            </GridSection>

            {/* Gráficos de Sinistros */}
            <GridSection title='Análise de Sinistros' isDark={isDark}>
              <div className='col-span-full'>
                <SinistrosChart 
                  data={metrics.sinistros} 
                  loading={metricsLoading}
                />
              </div>
            </GridSection>

            {/* Análise por Tipo de Assistência */}
            <GridSection title='Análise por Tipo de Assistência' isDark={isDark}>
              <div className='col-span-full'>
                <TipoAssistenciaChart 
                  data={{ logs: metrics.logs }} 
                  loading={metricsLoading}
                />
              </div>
            </GridSection>

          </DashboardGrid>
        )}

        {!metrics && !metricsLoading && (
          <Card className='border-[hsl(var(--status-warning))] bg-[hsl(var(--status-warning))]/10'>
            <CardContent className='p-8 text-center'>
              <h3 className='text-lg font-semibold text-[hsl(var(--status-warning))] mb-2'>
                Nenhum dado disponível
              </h3>
              <p className='text-muted-foreground'>
                Selecione um período ou aguarde o carregamento dos dados
              </p>
            </CardContent>
          </Card>
        )}
      </ResponsiveWrapper>
    </AdminPageWrapper>
  )
}
