"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAdminAuth } from '@/context/admin-auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTheme } from 'next-themes'
import { 
  Shield, 
  BarChart3, 
  Users, 
  Activity,
  Clock, 
  PhoneCall,
  FileText,
  Calendar,
  Search,
  Filter,
  Download,
  Sun,
  Moon,
  LogOut,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Phone,
  Headphones,
  Car,
  Wrench,
  RefreshCw,
  Settings,
  Database,
  Server,
  MessageCircle,
  Loader2,
  User,
  MapPin,
  Info,
  FolderOpen,
  Clock4,
  AlertTriangle,
  Camera,
  Plus,
  X,
  PlayCircle,
  Archive,
  FileCheck
} from 'lucide-react'
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
  const { signOut, loading, isAuthenticated, user } = useAdminAuth()

  // Função simples para formatar datas
  const formatarData = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    } catch (error) {
      return 'Data inválida'
    }
  }

  const formatarDataSemHora = (data: string) => {
    try {
      return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
    } catch (error) {
      return 'Data inválida'
    }
  }

  // Função para formatar tipo de assistência
  const formatarTipoAssistencia = (tipo: string | undefined) => {
    if (!tipo) return ''
    
    const tipos: { [key: string]: string } = {
      'hotel': 'Hotel',
      'guincho': 'Guincho',
      'taxi': 'Táxi',
      'pane_seca': 'Pane Seca',
      'pane_mecanica': 'Pane Mecânica',
      'pane_eletrica': 'Pane Elétrica',
      'trocar_pneu': 'Trocar Pneu'
    }
    
    return tipos[tipo] || tipo.replace(/_/g, ' ')
  }

  // Função para formatar todas as assistências (principal + adicionais)
  const formatarTodasAssistencias = (log: any) => {
    const assistencias: string[] = []
    
    // Adicionar assistência principal
    if (log.tipo_assistencia) {
      assistencias.push(formatarTipoAssistencia(log.tipo_assistencia))
    }
    
    // Adicionar assistências adicionais
    if (log.assistencias_tipos) {
      // Se é array, usar diretamente. Se é string, fazer split
      const tiposAdicionais = Array.isArray(log.assistencias_tipos) 
        ? log.assistencias_tipos 
        : log.assistencias_tipos.split(', ')
      
      const assistenciasAdicionais = tiposAdicionais
        .filter((tipo: string) => tipo) // Remover valores vazios
        .map((tipo: string) => formatarTipoAssistencia(tipo))
      assistencias.push(...assistenciasAdicionais)
    }
    
    return assistencias.length > 0 ? assistencias.join(', ') : ''
  }

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

  // Verificar autenticação
  useEffect(() => {
    // Se ainda está carregando, aguardar
    if (loading) return

    // Verificar se está autenticado via contexto
    if (!isAuthenticated) {
      console.log('🚪 Usuário não autenticado no dashboard, redirecionando para login')
      router.push('/admin/login')
      return
    }

    // Se está autenticado mas não tem dados do usuário ainda, aguardar
    if (!user) return

    // Se já tem adminUser configurado, não reconfigurar
    if (adminUser && adminUser.email === user.email) return

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
  }, [loading, isAuthenticated, user, router, adminUser])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="w-3 h-3 text-green-500" />
      case 'aprovado': return <CheckCircle className="w-3 h-3 text-blue-500" />
      case 'em_analise': return <Eye className="w-3 h-3 text-yellow-500" />
      case 'rejeitado': return <XCircle className="w-3 h-3 text-red-500" />
      default: return <Clock className="w-3 h-3 text-gray-500" />
    }
  }

  const getTipoIcon = (log: any) => {
    if (log.tipo_atendimento === 'assistencia') {
      return <Headphones className="w-3 h-3 text-purple-500" />
    }
    switch (log.tipo_sinistro) {
      case 'colisao': return <Car className="w-3 h-3 text-red-500" />
      case 'furto': case 'roubo': return <Shield className="w-3 h-3 text-orange-500" />
      case 'pequenos_reparos': return <Wrench className="w-3 h-3 text-green-500" />
      default: return <FileText className="w-3 h-3 text-gray-500" />
    }
  }

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
    <div className={`min-h-screen transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'}`}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
              <div className="relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0">
                <Image
                  src="/images/logo.png"
                  alt="PV Auto Proteção"
                  width={56}
                  height={56}
                  className="object-contain rounded-full"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-sm md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                  PV Auto Proteção
                </h1>
                <p className={`text-xs md:text-sm transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'} hidden md:block`}>
                  Dashboard Administrativo
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 md:space-x-4 flex-shrink-0">
              {/* Tema */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`hover:bg-opacity-20 transition-all duration-300 ${isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'} p-2`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              
              {/* Refresh */}
              <Button
                variant="ghost"
                size="sm"
                onClick={loadMetrics}
                disabled={metricsLoading}
                className={`hover:bg-opacity-20 transition-all duration-300 ${isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'} p-2`}
              >
                <RefreshCw className={`w-4 h-4 ${metricsLoading ? 'animate-spin' : ''}`} />
              </Button>

                             {/* User menu mobile/desktop */}
               <div className="flex items-center">
                 {/* Nome do usuário - compacto no mobile, completo no desktop */}
                 <div className={`text-xs md:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mr-2 truncate max-w-[100px] md:max-w-none`}>
                   <span className="hidden md:inline">Olá, </span>{adminUser?.full_name}
                 </div>
                 
                 {/* Botão logout */}
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={handleLogout}
                   className={`hover:bg-opacity-20 transition-all duration-300 ${isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'} p-2`}
                   title={`Sair (${adminUser?.full_name})`}
                 >
                   <LogOut className="w-4 h-4" />
                 </Button>
               </div>
            </div>
          </div>
        </div>
      </header>

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
            {/* Métricas Principais */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mb-8">
                                      {/* Ocorrências */}
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-1 text-blue-600">{metrics.sinistros.total}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ocorrências</div>
                </CardContent>
              </Card>

              {/* Chamadas IA */}
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <PhoneCall className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-1 text-purple-600">{metrics.chamadas.total}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Chamadas IA</div>
                </CardContent>
              </Card>

              {/* Minutos de Chamadas */}
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-1 text-green-600">{metrics.chamadas.totalMinutos}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Min. Totais</div>
                </CardContent>
              </Card>

              {/* Usuários */}
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-indigo-50 to-blue-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-1 text-indigo-600">{metrics.usuarios.total}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Usuários</div>
                </CardContent>
              </Card>

              {/* Usuários Ativos */}
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-orange-50 to-red-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-1 text-orange-600">{metrics.usuarios.ativos}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ativos</div>
                </CardContent>
              </Card>

              {/* Média de Minutos */}
              <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-teal-50 to-cyan-50'}`}>
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl font-bold mb-1 text-teal-600">{metrics.chamadas.minutosMedia}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Min. Média</div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Ocorrências */}
            <Card className={`border-0 shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
              <CardHeader>
                <CardTitle className={`text-xl flex items-center gap-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  <FileText className="w-6 h-6 text-blue-600" />
                  Ocorrências Recentes
                  <Badge variant="secondary" className="ml-auto">
                    {metrics.logs.length} registros
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid gap-4">
                  {metrics.logs.length === 0 ? (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma ocorrência encontrada</h3>
                        <p className="text-sm text-gray-500">
                          Nenhuma ocorrência encontrada no período selecionado
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    metrics.logs.map((log) => (
                      <Card key={log.id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-200 hover:border-l-blue-400">
                        <CardContent className="p-4 sm:p-5">
                          {/* Mobile Layout */}
                          <div className="lg:hidden space-y-4">
                            {/* Linha 1: Número do sinistro + Status */}
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="font-mono text-sm font-bold bg-blue-50 border-blue-200 text-blue-800 px-3 py-1">
                                #{log.numero_sinistro}
                              </Badge>
                              <Badge 
                                variant={
                                  log.status === 'concluido' ? 'default' :
                                  log.status === 'aprovado' ? 'secondary' :
                                  log.status === 'em_analise' ? 'outline' :
                                  log.status === 'rejeitado' ? 'destructive' :
                                  'secondary'
                                }
                                className={`text-xs px-2 py-1 ${
                                  log.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                                  log.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  log.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  log.status === 'rejeitado' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                              >
                                {log.status === 'pendente' && <Clock4 className="w-3 h-3 mr-1" />}
                                {log.status === 'em_analise' && <Eye className="w-3 h-3 mr-1" />}
                                {log.status === 'aprovado' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {log.status === 'rejeitado' && <XCircle className="w-3 h-3 mr-1" />}
                                {log.status === 'concluido' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {log.status === 'pendente' ? 'Pendente' :
                                 log.status === 'em_analise' ? 'Em Análise' :
                                 log.status === 'aprovado' ? 'Aprovado' :
                                 log.status === 'rejeitado' ? 'Rejeitado' :
                                 'Concluído'}
                              </Badge>
                            </div>

                            {/* Linha 2: Tipo de ocorrência */}
                            <div className="flex justify-center">
                              <Badge 
                                variant={
                                  log.tipo_atendimento === 'assistencia' ? 'default' :
                                  log.tipo_sinistro === 'colisao' ? 'destructive' : 
                                  log.tipo_sinistro === 'pequenos_reparos' ? 'outline' :
                                  'secondary'
                                }
                                className={`text-xs px-3 py-1 ${
                                  log.tipo_atendimento === 'assistencia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                  log.tipo_sinistro === 'colisao' ? 'bg-red-100 text-red-800 border-red-200' :
                                  log.tipo_sinistro === 'furto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                  log.tipo_sinistro === 'roubo' ? 'bg-red-100 text-red-800 border-red-200' :
                                  log.tipo_sinistro === 'pequenos_reparos' ? 'bg-green-100 text-green-800 border-green-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                              >
                                <div className="flex items-center gap-1">
                                  {(() => {
                                    // Verificar assistência
                                    if (log.tipo_atendimento === 'assistencia') {
                                      const todasAssistencias = formatarTodasAssistencias(log)
                                      return (
                                        <>
                                          <Headphones className="w-3 h-3" /> 
                                          Assistência - {todasAssistencias}

                                        </>
                                      )
                                    }
                                    
                                    // Verificar tipos de sinistro
                                    const baseElement = (() => {
                                      switch (log.tipo_sinistro) {
                                        case 'colisao':
                                          return <><Car className="w-3 h-3" /> Colisão</>
                                        case 'furto':
                                          return <><Shield className="w-3 h-3" /> Furto</>
                                        case 'roubo':
                                          return <><AlertTriangle className="w-3 h-3" /> Roubo</>
                                        case 'pequenos_reparos':
                                          return <><Wrench className="w-3 h-3" /> Pequenos Reparos</>
                                        default:
                                          return <>Tipo não identificado</>
                                      }
                                    })()
                                    
                                    // Adicionar assistências adicionais se existirem
                                    return (
                                      <>
                                        {baseElement}
                                        {log.assistencias_tipos && log.assistencias_tipos.length > 0 && (
                                          <span className="ml-1 text-xs text-gray-600">
                                            - {formatarTodasAssistencias(log)}
                                          </span>
                                        )}

                                      </>
                                    )
                                  })()}
                                </div>
                              </Badge>
                            </div>

                            {/* Linha 3: Informações principais */}
                            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-gray-500">Condutor</div>
                                  <div className="text-sm font-medium truncate">
                                    {log.cnh_proprio_nome || 'Nome não informado'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                  <div className="text-xs text-gray-500">
                                    {formatDate(log.data_criacao)}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Linha 4: Botão de ação */}
                            <div className="flex justify-center pt-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-xs"
                                    onClick={async () => {
                                      await carregarDetalhes(log.id)
                                    }}
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Ver Detalhes
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col" aria-describedby="dialog-description">
                                  <DialogHeader>
                                    <DialogTitle>Detalhes da Ocorrência {log.numero_sinistro}</DialogTitle>
                                    <div id="dialog-description" className="sr-only">
                                      Visualização completa dos dados da ocorrência incluindo documentos, fotos e histórico
                                    </div>
                                  </DialogHeader>
                                  {loadingDetalhes ? (
                                    <div className="flex items-center justify-center p-8">
                                      <Loader2 className="w-8 h-8 animate-spin" />
                                    </div>
                                  ) : selectedSinistro ? (
                                    <DetalhesSinistro 
                                      dados={selectedSinistro} 
                                    />
                                  ) : null}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>

                          {/* Desktop Layout */}
                          <div className="hidden lg:block">
                            <div className="space-y-3">
                              {/* Linha 1: Número + Status + Tipo */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="font-mono text-sm font-bold bg-blue-50 border-blue-200 text-blue-800 px-3 py-1">
                                    #{log.numero_sinistro}
                                  </Badge>
                                  <Badge 
                                    variant={
                                      log.tipo_atendimento === 'assistencia' ? 'default' :
                                      log.tipo_sinistro === 'colisao' ? 'destructive' : 
                                      log.tipo_sinistro === 'pequenos_reparos' ? 'outline' :
                                      'secondary'
                                    }
                                    className={`text-sm px-3 py-1 ${
                                      log.tipo_atendimento === 'assistencia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                                      log.tipo_sinistro === 'colisao' ? 'bg-red-100 text-red-800 border-red-200' :
                                      log.tipo_sinistro === 'furto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                      log.tipo_sinistro === 'roubo' ? 'bg-red-100 text-red-800 border-red-200' :
                                      log.tipo_sinistro === 'pequenos_reparos' ? 'bg-green-100 text-green-800 border-green-200' :
                                      'bg-gray-100 text-gray-800 border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
                                      {(() => {
                                        // Verificar assistência
                                        if (log.tipo_atendimento === 'assistencia') {
                                          const todasAssistencias = formatarTodasAssistencias(log)
                                          return (
                                            <>
                                              <Headphones className="w-3 h-3" /> 
                                              Assistência - {todasAssistencias}

                                            </>
                                          )
                                        }
                                        
                                        // Verificar tipos de sinistro
                                        const baseElement = (() => {
                                          switch (log.tipo_sinistro) {
                                            case 'colisao':
                                              return <><Car className="w-3 h-3" /> Colisão</>
                                            case 'furto':
                                              return <><Shield className="w-3 h-3" /> Furto</>
                                            case 'roubo':
                                              return <><AlertTriangle className="w-3 h-3" /> Roubo</>
                                            case 'pequenos_reparos':
                                              return <><Wrench className="w-3 h-3" /> Pequenos Reparos</>
                                            default:
                                              return <>Tipo não identificado</>
                                          }
                                        })()
                                        
                                        // Adicionar assistências adicionais se existirem
                                        return (
                                          <>
                                            {baseElement}
                                            {log.assistencias_tipos && log.assistencias_tipos.length > 0 && (
                                              <span className="ml-1 text-xs text-gray-600">
                                                - {formatarTodasAssistencias(log)}
                                              </span>
                                            )}

                                          </>
                                        )
                                      })()}
                                    </div>
                                  </Badge>
                                </div>
                                <Badge 
                                  variant={
                                    log.status === 'concluido' ? 'default' :
                                    log.status === 'aprovado' ? 'secondary' :
                                    log.status === 'em_analise' ? 'outline' :
                                    log.status === 'rejeitado' ? 'destructive' :
                                    'secondary'
                                  }
                                  className={`${
                                    log.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                                    log.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    log.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                    log.status === 'rejeitado' ? 'bg-red-100 text-red-800 border-red-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                  }`}
                                >
                                  {log.status === 'pendente' && <Clock4 className="w-3 h-3 mr-1" />}
                                  {log.status === 'em_analise' && <Eye className="w-3 h-3 mr-1" />}
                                  {log.status === 'aprovado' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {log.status === 'rejeitado' && <XCircle className="w-3 h-3 mr-1" />}
                                  {log.status === 'concluido' && <CheckCircle className="w-3 h-3 mr-1" />}
                                  {log.status === 'pendente' ? 'Pendente' :
                                   log.status === 'em_analise' ? 'Em Análise' :
                                   log.status === 'aprovado' ? 'Aprovado' :
                                   log.status === 'rejeitado' ? 'Rejeitado' :
                                   'Concluído'}
                                </Badge>
                              </div>

                              {/* Linha 2: Informações Principais */}
                              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <span className="text-xs text-gray-500 block">Condutor</span>
                                      <span className="text-sm font-medium truncate block">
                                        {log.cnh_proprio_nome || 'Nome não informado'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                                  <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                                  <div>
                                    <span className="text-xs text-gray-500">Criado em</span>
                                    <span className="text-sm font-medium ml-2">{formatDate(log.data_criacao)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Linha 3: Botão de ação */}
                              <div className="flex justify-end">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={async () => {
                                        await carregarDetalhes(log.id)
                                      }}
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      Ver Detalhes
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col" aria-describedby="dialog-description">
                                    <DialogHeader>
                                      <DialogTitle>Detalhes da Ocorrência {log.numero_sinistro}</DialogTitle>
                                      <div id="dialog-description" className="sr-only">
                                        Visualização completa dos dados da ocorrência incluindo documentos, fotos e histórico
                                      </div>
                                    </DialogHeader>
                                    {loadingDetalhes ? (
                                      <div className="flex items-center justify-center p-8">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                      </div>
                                    ) : selectedSinistro ? (
                                      <DetalhesSinistro 
                                        dados={selectedSinistro} 
                                      />
                                    ) : null}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

// Componente para detalhes da ocorrência (versão simplificada para admin dashboard)
interface DetalhesSinistroProps {
  dados: SinistroDetalhado
}

function DetalhesSinistro({ dados }: DetalhesSinistroProps) {
  const { sinistro, dadosCnh, dadosCrlv, arquivos, logs } = dados
  const [historicoAberto, setHistoricoAberto] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-3 md:space-y-3">
      {/* Header Principal */}
      <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>Ocorrência</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">#{sinistro.numero_sinistro}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(sinistro.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
            </div>
          </div>
          
          <div className="flex flex-col lg:items-end gap-3">
            <Badge 
              variant={
                sinistro.status === 'concluido' ? 'default' :
                sinistro.status === 'aprovado' ? 'secondary' :
                sinistro.status === 'em_analise' ? 'outline' :
                sinistro.status === 'rejeitado' ? 'destructive' :
                'secondary'
              }
              className={`w-fit ${
                sinistro.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                sinistro.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                sinistro.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                sinistro.status === 'rejeitado' ? 'bg-red-100 text-red-800 border-red-200' :
                'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              {sinistro.status === 'pendente' && <Clock4 className="w-3 h-3 mr-1" />}
              {sinistro.status === 'em_analise' && <Eye className="w-3 h-3 mr-1" />}
              {sinistro.status === 'aprovado' && <CheckCircle className="w-3 h-3 mr-1" />}
              {sinistro.status === 'rejeitado' && <XCircle className="w-3 h-3 mr-1" />}
              {sinistro.status === 'concluido' && <CheckCircle className="w-3 h-3 mr-1" />}
              {sinistro.status === 'pendente' ? 'Pendente' :
               sinistro.status === 'em_analise' ? 'Em Análise' :
               sinistro.status === 'aprovado' ? 'Aprovado' :
               sinistro.status === 'rejeitado' ? 'Rejeitado' :
               'Concluído'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tipo de Ocorrência */}
      <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Tipo de Ocorrência</h3>
            <p className="text-xs md:text-sm text-gray-600 hidden md:block">Categoria do sinistro reportado</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={`text-sm px-3 py-2 ${
              sinistro.tipo_atendimento === 'assistencia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
              sinistro.tipo_sinistro === 'colisao' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              sinistro.tipo_sinistro === 'furto' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              sinistro.tipo_sinistro === 'roubo' ? 'bg-red-100 text-red-800 border-red-200' :
              sinistro.tipo_sinistro === 'pequenos_reparos' ? 'bg-green-100 text-green-800 border-green-200' :
              'bg-gray-100 text-gray-800 border-gray-200'
            }`}
          >
                         {sinistro.tipo_atendimento === 'assistencia' ? (
               <>
                 <Headphones className="w-4 h-4 mr-2" />
                 Assistência{sinistro.tipo_assistencia ? ` - ${sinistro.tipo_assistencia.charAt(0).toUpperCase() + sinistro.tipo_assistencia.slice(1)}` : ''}
               </>
             ) : sinistro.tipo_sinistro === 'colisao' ? (
              <>
                <Car className="w-4 h-4 mr-2" />
                Colisão
              </>
            ) : sinistro.tipo_sinistro === 'furto' ? (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Furto
              </>
            ) : sinistro.tipo_sinistro === 'roubo' ? (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                Roubo
              </>
            ) : sinistro.tipo_sinistro === 'pequenos_reparos' ? (
              <>
                <Wrench className="w-4 h-4 mr-2" />
                Pequenos Reparos
              </>
            ) : (
              'Tipo não identificado'
            )}
          </Badge>
          
                     {/* Mostrar assistências adicionais se existirem para sinistros */}
           {sinistro.tipo_atendimento !== 'assistencia' && sinistro.assistencias_tipos && sinistro.assistencias_tipos.length > 0 && (
             <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
               + {Array.isArray(sinistro.assistencias_tipos) 
                   ? sinistro.assistencias_tipos.join(', ') 
                   : sinistro.assistencias_tipos}
             </Badge>
           )}
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <div className="border border-gray-200 rounded-lg bg-white p-2 md:p-4 text-center">
          <FolderOpen className="w-4 h-4 md:w-6 md:h-6 text-blue-500 mx-auto mb-1 md:mb-2" />
          <div className="text-lg md:text-2xl font-bold text-gray-900">{sinistro.total_arquivos || 0}</div>
          <div className="text-xs md:text-sm text-gray-500">Arquivos</div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-2 md:p-4 text-center">
          <Clock className="w-4 h-4 md:w-6 md:h-6 text-gray-400 mx-auto mb-1 md:mb-2" />
          <div className="text-lg md:text-2xl font-bold text-gray-900">
            {Math.ceil((new Date().getTime() - new Date(sinistro.data_criacao).getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-xs md:text-sm text-gray-500">Dias</div>
        </div>
      </div>

      {/* Seção Condutores - Versão Simplificada */}
      {dadosCnh.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Condutores</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Informações dos condutores envolvidos</p>
            </div>
          </div>
          {dadosCnh.map((cnh, index) => (
            <Card key={index} className={cnh.tipo_titular === 'proprio' ? 'border-l-4 border-l-blue-500 mb-4' : 'border-l-4 border-l-orange-500 mb-4'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className={`w-5 h-5 ${cnh.tipo_titular === 'proprio' ? 'text-blue-600' : 'text-orange-600'}`} />
                  <span className="font-semibold">{cnh.tipo_titular === 'proprio' ? 'Condutor Principal' : 'Condutor Terceiro'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nome</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-medium">{cnh.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">CPF</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono">{cnh.cpf}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Seção Veículos - Versão Simplificada */}
      {dadosCrlv.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Veículos</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Informações dos veículos envolvidos</p>
            </div>
          </div>
          {dadosCrlv.map((crlv, index) => (
            <Card key={index} className={crlv.tipo_veiculo === 'proprio' ? 'border-l-4 border-l-green-500 mb-4' : 'border-l-4 border-l-purple-500 mb-4'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Car className={`w-5 h-5 ${crlv.tipo_veiculo === 'proprio' ? 'text-green-600' : 'text-purple-600'}`} />
                  <span className="font-semibold">{crlv.tipo_veiculo === 'proprio' ? 'Veículo Principal' : 'Veículo Terceiro'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Placa</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono text-center font-bold">{crlv.placa}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Marca/Modelo</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">
                      {crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ano</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border text-center">
                      {crlv.ano_fabricacao || 'Não informado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Seção Assistências Adicionais */}
      {sinistro.assistencia_adicional && sinistro.assistencias_tipos && sinistro.assistencias_tipos.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Headphones className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Assistências Adicionais</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Serviços adicionais solicitados</p>
            </div>
          </div>
          
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
             {(Array.isArray(sinistro.assistencias_tipos) ? sinistro.assistencias_tipos : 
               typeof sinistro.assistencias_tipos === 'string' ? sinistro.assistencias_tipos.split(',') : []
             ).map((tipo: string, index: number) => {
               const tipoLimpo = tipo.trim()
               const assistenciaInfo: { [key: string]: { label: string; icon: string; color: string } } = {
                 'guincho': { label: 'Guincho', icon: '🚛', color: 'bg-blue-100 text-blue-800' },
                 'taxi': { label: 'Táxi', icon: '🚕', color: 'bg-yellow-100 text-yellow-800' },
                 'hotel': { label: 'Hotel', icon: '🏨', color: 'bg-purple-100 text-purple-800' },
                 'mecanica': { label: 'Mecânica', icon: '🔧', color: 'bg-green-100 text-green-800' },
                 'vidraceiro': { label: 'Vidraceiro', icon: '🪟', color: 'bg-indigo-100 text-indigo-800' },
                 'borracheiro': { label: 'Borracheiro', icon: '🛞', color: 'bg-orange-100 text-orange-800' },
                 'eletricista': { label: 'Eletricista', icon: '⚡', color: 'bg-red-100 text-red-800' }
               }
               const info = assistenciaInfo[tipoLimpo] || { label: tipoLimpo, icon: '🛠️', color: 'bg-gray-100 text-gray-800' }

               return (
                 <div key={index} className={`p-3 rounded-lg ${info.color} border`}>
                   <div className="flex items-center gap-2">
                     <span className="text-lg">{info.icon}</span>
                     <span className="font-medium text-sm">{info.label}</span>
                   </div>
                 </div>
               )
             })}
          </div>
        </div>
      )}

      {/* Seção Arquivos - Versão Simplificada */}
      <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Arquivos ({arquivos.length})</h3>
            <p className="text-xs md:text-sm text-gray-600 hidden md:block">Documentos e fotos anexados</p>
          </div>
        </div>

        {arquivos.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum arquivo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {arquivos.map((arquivo, index) => {
              // Verificar se é imagem
              const isImage = arquivo.tipo_arquivo === 'foto_veiculo' || 
                             arquivo.nome_original?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
              
              return (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Miniatura da imagem ou ícone */}
                  <div className="relative w-full h-32 bg-gray-50 flex items-center justify-center">
                    {isImage && arquivo.url_arquivo ? (
                      <div className="relative w-full h-full group">
                        <Image
                          src={arquivo.url_arquivo}
                          alt={arquivo.nome_original || 'Arquivo'}
                          fill
                          className="object-cover transition-transform group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          onError={(e) => {
                            // Fallback para ícone se a imagem falhar
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center">
                                  <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z"/>
                                  </svg>
                                </div>
                              `
                            }
                          }}
                        />
                        {/* Overlay com ícone de visualização */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {arquivo.tipo_arquivo === 'foto_veiculo' ? 
                          <Camera className="w-12 h-12 text-blue-500 mb-2" /> : 
                          <FileText className="w-12 h-12 text-gray-500 mb-2" />}
                      </div>
                    )}
                  </div>
                  
                  {/* Informações do arquivo */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {arquivo.tipo_arquivo === 'cnh_proprio' ? 'CNH' :
                         arquivo.tipo_arquivo === 'cnh_terceiro' ? 'CNH 3º' :
                         arquivo.tipo_arquivo === 'crlv_proprio' ? 'CRLV' :
                         arquivo.tipo_arquivo === 'crlv_terceiro' ? 'CRLV 3º' :
                         arquivo.tipo_arquivo === 'boletim_ocorrencia' ? 'B.O.' :
                         arquivo.tipo_arquivo === 'foto_veiculo' ? 'Foto' :
                         'Arquivo'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate mb-2" title={arquivo.nome_original}>
                      {arquivo.nome_original}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {(arquivo.tamanho_arquivo / 1024).toFixed(1)}KB
                      </span>
                      {arquivo.url_arquivo && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(arquivo.url_arquivo, '_blank')}
                          className="h-6 px-2 text-xs"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Seção Histórico - Versão Simplificada */}
      <Collapsible open={historicoAberto} onOpenChange={setHistoricoAberto}>
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Histórico ({logs.length})</h3>
              </div>
              {historicoAberto ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum histórico encontrado</p>
            ) : (
              <div className="space-y-2">
                {logs.slice(0, 10).map((log, index) => (
                  <div key={index} className="border-l-4 border-l-blue-200 bg-blue-50 p-3 rounded">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-medium text-sm">{log.acao}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.descricao}</p>
                  </div>
                ))}
                {logs.length > 10 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    Mostrando 10 de {logs.length} registros
                  </p>
                )}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}