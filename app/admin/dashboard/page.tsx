"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/admin-auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { PhoneCall, Users, MessageCircle, RefreshCw } from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { AdminPageWrapper } from './AdminPageWrapper'
import { AdminHeader } from './AdminHeader'
import { MetricsCards } from './MetricsCards'
import { OccurrencesList } from './OccurrencesList'
import { formatarTodasAssistencias } from './admin-formatters'
import { Clock } from 'lucide-react'

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
  chamadas: {
    total: number
    totalMinutos: number
    minutosMedia: number
    porAgente: Record<string, number>
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

interface SinistroDetalhado {
  sinistro: any
  dadosCnh: any[]
  dadosCrlv: any[]
  arquivos: any[]
  logs: any[]
}

export default function AdminDashboardPage() {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [selectedSinistro, setSelectedSinistro] = useState<SinistroDetalhado | null>(null)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)
  
  const { theme, setTheme } = useTheme()
  const { signOut, loading, isAuthenticated, user, initializing } = useAdminAuth()

  // Funções utilitárias foram movidas para lib/utils/admin-formatters.ts

  // Carregar detalhes da ocorrência
  const carregarDetalhes = async (sinistroId: string) => {
    setLoadingDetalhes(true)
    
    try {
      // Buscar dados da ocorrência
      const { data: sinistroData, error: sinistroError } = await supabase
        .from('view_sinistros_completos')
        .select('*')
        .eq('id', sinistroId)
        .single()

      if (sinistroError) throw sinistroError

      // Buscar dados CNH
      const { data: cnhData, error: cnhError } = await supabase
        .from('dados_cnh')
        .select('*')
        .eq('sinistro_id', sinistroId)

      if (cnhError) throw cnhError

      // Buscar dados CRLV
      const { data: crlvData, error: crlvError } = await supabase
        .from('dados_crlv')
        .select('*')
        .eq('sinistro_id', sinistroId)

      if (crlvError) throw crlvError

      // Buscar arquivos
      const { data: arquivosData, error: arquivosError } = await supabase
        .from('arquivos_sinistro')
        .select('*')
        .eq('sinistro_id', sinistroId)

      if (arquivosError) throw arquivosError

      console.log(`Arquivos encontrados para ocorrência ${sinistroId}:`, arquivosData?.length || 0)

      // Buscar logs
      const { data: logsData, error: logsError } = await supabase
        .from('log_atividades')
        .select('*')
        .eq('sinistro_id', sinistroId)
        .order('created_at', { ascending: false })

      if (logsError) throw logsError

      setSelectedSinistro({
        sinistro: sinistroData,
        dadosCnh: cnhData || [],
        dadosCrlv: crlvData || [],
        arquivos: arquivosData || [],
        logs: logsData || []
      })

    } catch (err: any) {
      console.error('Erro ao carregar detalhes:', err)
      setError('Erro ao carregar detalhes da ocorrência')
    } finally {
      setLoadingDetalhes(false)
    }
  }
  
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
      id: typeof user.id === 'string' ? parseInt(user.id) : (user.id || 0),
      username: user.email || '',
      email: user.email || '',
      full_name: user.full_name || '',
      user_level: user.user_level || '',
      last_login: user.last_login || null
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
        dateTo
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
          exemploComTipos: comTiposAssistencia[0]
        })
        
        // Testar formatação
        if (comAssistenciaAdicional.length > 0) {
          console.log('Formatação teste:', {
            original: comAssistenciaAdicional[0],
            formatado: formatarTodasAssistencias(comAssistenciaAdicional[0])
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
        trigger: 'useEffect dependency change'
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
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
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

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Título e período */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className={`text-lg md:text-xl mb-4 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Monitoramento completo do sistema PV Auto Proteção
          </p>
          
          {metrics && (
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className={`text-xs ${isDark ? 'border-gray-500 text-gray-300' : 'border-gray-300 text-gray-600'}`}>
                Período: {new Date(metrics.periodo.de).toLocaleDateString('pt-BR')} a {new Date(metrics.periodo.ate).toLocaleDateString('pt-BR')}
              </Badge>
              {lastUpdate && (
                <Badge variant="outline" className={`text-xs ${isDark ? 'border-gray-500 text-gray-300' : 'border-gray-300 text-gray-600'}`}>
                  <Clock className="w-3 h-3 mr-1" />
                  Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Botões de Navegação */}
        <div className="flex justify-center flex-wrap gap-4 md:gap-6 mb-8">
          <a href="/admin/calls">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3"
            >
              <PhoneCall className="w-5 h-5 mr-3" />
              Chamadas IA
            </Button>
          </a>
          
          <a href="/admin/users">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3"
            >
              <Users className="w-5 h-5 mr-3" />
              Usuários
            </Button>
          </a>

                                  <a href="/whatsapp?from=dashboard">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3"
            >
              <MessageCircle className="w-5 h-5 mr-3" />
              WhatsApp
            </Button>
          </a>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardContent className="p-4">
              <p className="text-red-700 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {metrics && (
          <>
            <MetricsCards metrics={metrics} isDark={isDark} />

            <OccurrencesList 
              metrics={metrics}
              isDark={isDark}
              carregarDetalhes={carregarDetalhes}
              selectedSinistro={selectedSinistro}
              loadingDetalhes={loadingDetalhes}
            />{/* Lista de Ocorrências Substituída */}
          </>
        )}
      </div>
    </AdminPageWrapper>
  )
}