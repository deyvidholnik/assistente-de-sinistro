'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useTheme } from 'next-themes'
import {
  Shield,
  LogOut,
  Sun,
  Moon,
  User,
  Calendar,
  Car,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Wrench,
  Eye,
  RefreshCw,
} from 'lucide-react'

interface ClienteData {
  cpf: string
  nome?: string
  loginTime: string
  sinistros?: any[] // Dados diretos da tabela sinistros
}

interface SinistroCompleto {
  id: string
  numero_sinistro: string
  tipo_atendimento?: 'sinistro' | 'assistencia'
  tipo_sinistro?: 'colisao' | 'furto' | 'roubo' | 'pequenos_reparos'
  tipo_assistencia?: 'hotel' | 'guincho' | 'taxi' | 'pane_seca' | 'pane_mecanica' | 'pane_eletrica' | 'trocar_pneu'
  status: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'concluido'
  data_criacao: string
  data_atualizacao?: string
  nome_completo_furto?: string
  cpf_furto?: string
  placa_veiculo_furto?: string
  assistencia_adicional?: boolean
  assistencias_tipos?: string[] | string
  total_assistencias?: number
}

export default function DashboardClientePage() {
  const [clienteData, setClienteData] = useState<ClienteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [nomeCliente, setNomeCliente] = useState<string>('')

  const { theme, setTheme } = useTheme()

  const isDark = theme === 'dark'
  const router = useRouter()

  // Combinar sinistros e assistências em uma lista única, ordenada por data
  const todosRegistros = useMemo(() => {
    if (!clienteData?.sinistros) return []

    // Remover duplicatas baseado no ID antes de ordenar
    const idsVistos = new Set();
    const registrosUnicos = clienteData.sinistros.filter(sinistro => {
      if (idsVistos.has(sinistro.id)) {
        return false;
      }
      idsVistos.add(sinistro.id);
      return true;
    });

    return registrosUnicos.sort(
      (a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime()
    )
  }, [clienteData?.sinistros])

  const sinistros = todosRegistros.filter((s: SinistroCompleto) => s.tipo_atendimento === 'sinistro')
  const assistencias = todosRegistros.filter((s: SinistroCompleto) => s.tipo_atendimento === 'assistencia')

  // Função para formatar assistências adicionais
  const formatarAssistenciasAdicionais = (sinistro: SinistroCompleto) => {
    if (!sinistro.assistencias_tipos) return []

    const tipos = Array.isArray(sinistro.assistencias_tipos)
      ? sinistro.assistencias_tipos
      : sinistro.assistencias_tipos.split(',')

    return tipos.map((tipo) => tipo.trim()).filter(Boolean)
  }

  const carregarDados = async (forceRefresh = false) => {
    const dadosCliente = localStorage.getItem('clienteLogado')
    if (!dadosCliente) {
      router.push('/login_cliente')
      return
    }

    const dadosParseados = JSON.parse(dadosCliente)

    // Se forceRefresh = true, buscar dados atualizados do banco
    if (forceRefresh && dadosParseados.cpf) {
      setRefreshing(true)
      try {
        const { supabase } = await import('@/lib/supabase')

        console.log('🔍 Buscando sinistros para CPF:', dadosParseados.cpf)
        
        // Primeiro, vamos testar uma busca mais ampla para ver todos os campos onde o CPF pode estar
        const { data: todosSinistros, error: errorTodos } = await supabase
          .from('view_sinistros_completos')
          .select('*')
        
        console.log('🔍 TODOS OS SINISTROS:', todosSinistros?.length)
        
        // Buscar sinistros que contenham o CPF em qualquer campo
        const sinistrosComCpf = todosSinistros?.filter(s => {
          const cpfLimpo = dadosParseados.cpf
          const cpfFormatado = dadosParseados.cpfFormatado || cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          
          return (
            s.cpf_furto === cpfLimpo ||
            s.cpf_furto === cpfFormatado ||
            s.cnh_proprio_cpf === cpfLimpo ||
            s.cnh_proprio_cpf === cpfFormatado ||
            s.cnh_terceiro_cpf === cpfLimpo ||
            s.cnh_terceiro_cpf === cpfFormatado ||
            JSON.stringify(s).includes(cpfLimpo) ||
            JSON.stringify(s).includes(cpfFormatado)
          )
        }) || []
        
        console.log('🔍 SINISTROS COM SEU CPF:', sinistrosComCpf.length)
        console.log('📋 CAMPOS ONDE SEU CPF FOI ENCONTRADO:', sinistrosComCpf.map(s => ({
          id: s.id,
          numero: s.numero_sinistro,
          cpf_furto: s.cpf_furto,
          cnh_proprio_cpf: s.cnh_proprio_cpf,
          cnh_terceiro_cpf: s.cnh_terceiro_cpf,
          created_by_manager: s.created_by_manager
        })))
        
        // Buscar com ambas as formatações: limpo e formatado
        const cpfLimpo = dadosParseados.cpf
        const cpfFormatado = dadosParseados.cpfFormatado || cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        
        const { data: sinistros, error } = await supabase
          .from('view_sinistros_completos')
          .select('*')
          .or(
            `cpf_furto.eq.${cpfLimpo},cpf_furto.eq.${cpfFormatado},cnh_proprio_cpf.eq.${cpfLimpo},cnh_proprio_cpf.eq.${cpfFormatado},cnh_terceiro_cpf.eq.${cpfLimpo},cnh_terceiro_cpf.eq.${cpfFormatado}`
          )
          .order('data_criacao', { ascending: false })
        
        console.log('📊 Resultado da busca no refresh:', { sinistros, error, count: sinistros?.length })

        if (!error && sinistros) {
          // Atualizar dados no localStorage com dados frescos
          const dadosAtualizados = {
            ...dadosParseados,
            sinistros: sinistros,
            lastRefresh: new Date().toISOString(),
          }

          localStorage.setItem('clienteLogado', JSON.stringify(dadosAtualizados))
          setClienteData(dadosAtualizados)
        } else {
          console.warn('Erro ao atualizar dados:', error)
          setClienteData(dadosParseados)
        }
      } catch (err) {
        console.warn('Erro na atualização automática:', err)
        setClienteData(dadosParseados)
      } finally {
        setRefreshing(false)
      }
    } else {
      setClienteData(dadosParseados)
    }

    // Usar o nome que vem dos dados do login
    setNomeCliente(dadosParseados.nome || 'Cliente')

    setLoading(false)
  }

  // Carregar dados inicial
  useEffect(() => {
    carregarDados()
  }, [router])

  // Auto-refresh a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Atualizando dados automaticamente...')
      carregarDados(true) // forceRefresh = true
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('clienteLogado')
    router.push('/')
  }

  const handleRefresh = () => {
    console.log('🔄 Atualizando dados manualmente...')
    carregarDados(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-status-warning text-status-warning-foreground border-status-warning'
      case 'em_analise':
        return 'bg-status-info text-status-info-foreground border-status-info'
      case 'aprovado':
        return 'bg-status-success text-status-success-foreground border-status-success'
      case 'rejeitado':
        return 'bg-status-error text-status-error-foreground border-status-error'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
      case 'aprovado':
        return <CheckCircle className='w-4 h-4' />
      case 'em_analise':
        return <Clock className='w-4 h-4' />
      case 'pendente':
        return <AlertCircle className='w-4 h-4' />
      case 'rejeitado':
        return <AlertCircle className='w-4 h-4' />
      default:
        return <Clock className='w-4 h-4' />
    }
  }

  const getTipoIcon = (sinistro: SinistroCompleto) => {
    if (sinistro.tipo_atendimento === 'sinistro') {
      switch (sinistro.tipo_sinistro) {
        case 'colisao':
          return <Car className='w-4 h-4' />
        case 'furto':
        case 'roubo':
          return <Shield className='w-4 h-4' />
        case 'pequenos_reparos':
          return <Wrench className='w-4 h-4' />
        default:
          return <FileText className='w-4 h-4' />
      }
    } else {
      switch (sinistro.tipo_assistencia) {
        case 'guincho':
          return <Car className='w-4 h-4' />
        case 'pane_mecanica':
        case 'pane_eletrica':
        case 'trocar_pneu':
        case 'pane_seca':
          return <Wrench className='w-4 h-4' />
        case 'hotel':
          return <MapPin className='w-4 h-4' />
        case 'taxi':
          return <Car className='w-4 h-4' />
        default:
          return <FileText className='w-4 h-4' />
      }
    }
  }

  const getTipoTexto = (sinistro: SinistroCompleto) => {
    if (sinistro.tipo_atendimento === 'sinistro') {
      const tipo = sinistro.tipo_sinistro
      if (tipo) {
        return tipo.charAt(0).toUpperCase() + tipo.slice(1)
      }
      return 'Sinistro'
    } else if (sinistro.tipo_atendimento === 'assistencia') {
      const tipo = sinistro.tipo_assistencia
      if (tipo) {
        return tipo.charAt(0).toUpperCase() + tipo.slice(1).replace('_', ' ')
      }
      return 'Assistência'
    } else {
      // Se não tem tipo_atendimento definido, tentar inferir pelo tipo_sinistro
      const tipo = sinistro.tipo_sinistro
      if (tipo) {
        return tipo.charAt(0).toUpperCase() + tipo.slice(1)
      }
      return 'Registro'
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 flex items-center justify-center'>
        <div className='w-full max-w-md mx-auto p-8 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20'>
          {/* Logo e Branding */}
          <div className='text-center mb-8'>
            <div className='relative w-20 h-20 mx-auto mb-6'>
              <Image
                src='/images/logo.png'
                alt='PV Auto Proteção'
                width={80}
                height={80}
                className='object-contain rounded-full shadow-lg'
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>

            {/* Nome da empresa */}
            <h1 className='text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent mb-2'>
              PV Auto Proteção
            </h1>
            <p className='text-slate-600 text-sm font-medium tracking-wide'>ÁREA DO CLIENTE</p>
          </div>

          {/* Loading Animation */}
          <div className='relative mb-8'>
            {/* Spinner corporativo */}
            <div className='flex justify-center mb-4'>
              <div className='relative'>
                <div className='w-12 h-12 border-4 border-slate-200 rounded-full'></div>
                <div className='absolute top-0 left-0 w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
              </div>
            </div>

            {/* Barra de progresso sutil */}
            <div className='w-full h-0.5 bg-slate-200 rounded-full overflow-hidden'>
              <div className='h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full animate-pulse w-3/4'></div>
            </div>
          </div>

          {/* Mensagem */}
          <div className='text-center'>
            <p className='text-slate-800 font-semibold mb-1'>Carregando dados</p>
            <p className='text-slate-600 text-sm font-medium'>Aguarde um momento...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen transition-all duration-300  dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      {/* Header */}
      <header className='backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 bg-gray-900/80 border-border'>
        <div className='container mx-auto px-4 py-3 md:py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 md:space-x-3'>
              <div className='relative w-12 h-12 md:w-14 md:h-14'>
                <Image
                  src='/images/logo.png'
                  alt='PV Auto Proteção'
                  width={56}
                  height={56}
                  className='object-contain rounded-full'
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <div>
                <h1 className='text-lg md:text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent'>
                  PV Auto Proteção
                </h1>
                <p className='text-xs md:text-sm transition-colors duration-300 text-muted-foreground'>
                  Área do Cliente
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2 md:space-x-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className='hover:bg-surface-hover hover:text-accent-foreground transition-all duration-300'
              >
                {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
              </Button>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleRefresh}
                disabled={refreshing}
                className='hover:bg-surface-hover hover:text-accent-foreground transition-all duration-300'
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant='ghost'
                onClick={handleLogout}
                className='hover:bg-surface-hover hover:text-accent-foreground transition-all duration-300'
              >
                <LogOut className='w-4 h-4 mr-2' />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <div className='flex items-center mb-4'>
            <div className='w-12 h-12 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full flex items-center justify-center mr-4'>
              <User className='w-6 h-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold transition-colors duration-300 text-foreground'>
                Bem-vindo, {nomeCliente}!
              </h1>
              <p className='text-sm md:text-base transition-colors duration-300 text-muted-foreground'>
                CPF: {clienteData?.cpf} • Último acesso:{' '}
                {clienteData?.loginTime ? new Date(clienteData.loginTime).toLocaleString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          <Card className='border-0 shadow-lg transition-all duration-300 bg-card/50'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium transition-colors duration-300 text-muted-foreground'>Sinistros</p>
                  <p className='text-2xl font-bold transition-colors duration-300 text-foreground'>
                    {sinistros.length}
                  </p>
                </div>
                <div className='w-12 h-12 bg-gradient-to-r from-status-info to-brand-primary rounded-full flex items-center justify-center'>
                  <FileText className='w-6 h-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-0 shadow-lg transition-all duration-300 bg-card/50'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium transition-colors duration-300 text-muted-foreground'>
                    Assistências
                  </p>
                  <p className='text-2xl font-bold transition-colors duration-300 text-foreground'>
                    {assistencias.length}
                  </p>
                </div>
                <div className='w-12 h-12 bg-gradient-to-r from-status-success to-gradient-secondary-end rounded-full flex items-center justify-center'>
                  <Phone className='w-6 h-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Activities */}
        <div className='mb-8'>
          <h2 className='text-xl font-bold mb-4 transition-colors duration-300 text-foreground'>Todas as Atividades</h2>
          <div className='grid grid-cols-1 gap-6'>
            {todosRegistros.map((sinistro) => (
              <Card
                key={sinistro.id}
                className='border-0 shadow-lg transition-all duration-300 hover:shadow-xl bg-card/50'
              >
                <CardContent className='p-4'>
                  {/* Header do Card */}
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center space-x-3'>
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          sinistro.tipo_atendimento === 'assistencia'
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                        }`}
                      >
                        {getTipoIcon(sinistro)}
                      </div>
                      <div className='flex-1'>
                        <div className='flex items-center gap-2'>
                          <h3 className='text-base font-bold transition-colors duration-300 text-foreground'>
                            {getTipoTexto(sinistro)}
                          </h3>
                          <Badge
                            variant='outline'
                            className={`text-xs px-2 py-0.5 ${
                              sinistro.tipo_atendimento === 'assistencia'
                                ? 'border-purple-300 text-purple-700 bg-purple-50'
                                : 'border-blue-300 text-blue-700 bg-blue-50'
                            }`}
                          >
                            {sinistro.tipo_atendimento === 'assistencia' ? 'Assistência' : 'Sinistro'}
                          </Badge>
                        </div>
                        <p className='text-xs text-muted-foreground'>{sinistro.numero_sinistro || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <Badge className={`${getStatusColor(sinistro.status)} border px-2 py-1 shrink-0`}>
                      {getStatusIcon(sinistro.status)}
                      <span className='ml-1 capitalize font-medium text-xs'>{sinistro.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>

                  {/* Assistências Adicionais */}
                  {sinistro.assistencia_adicional && sinistro.assistencias_tipos && (
                    <div className='mb-3'>
                      <p className='text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md inline-block'>
                        + {formatarAssistenciasAdicionais(sinistro).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Informações compactas */}
                  <div className='flex items-center justify-between text-xs text-muted-foreground'>
                    <div className='flex items-center'>
                      <Calendar className='w-3 h-3 mr-1' />
                      <span>
                        {new Date(sinistro.data_criacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                      {sinistro.nome_completo_furto && (
                        <>
                          <span className='mx-2'>•</span>
                          <User className='w-3 h-3 mr-1' />
                          <span className='truncate max-w-32'>{sinistro.nome_completo_furto}</span>
                        </>
                      )}
                    </div>

                    <Link href={`/dashboard_cliente/detalhes/${sinistro.id}`}>
                      <Button
                        variant='outline'
                        size='sm'
                        className='h-7 px-3 text-xs transition-all duration-300 hover:bg-surface-hover hover:text-accent-foreground text-foreground border-border'
                      >
                        <Eye className='w-3 h-3 mr-1' />
                        Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
