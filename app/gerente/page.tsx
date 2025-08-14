'use client'

import { useState, useEffect } from 'react'
import { useAdminAuth } from '@/context/admin-auth-context'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Search,
  Eye,
  FileText,
  Calendar,
  Car,
  User,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Image as ImageIcon,
  BarChart3,
  Settings,
  FolderOpen,
  Shield,
  AlertTriangle,
  Clock4,
  PlayCircle,
  Archive,
  Camera,
  FileCheck,
  Users,
  Info,
  TrendingUp,
  Activity,
  Plus,
  X,
  Headphones,
  Wrench,
  LogOut,
  MessageCircle,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AuthGuard } from '@/components/auth-guard'
import { UserProfile } from '@/components/user-profile'
import { GerenteHeader } from './gerente-header'
import { GerenteEstatisticas } from './gerente-estatisticas'
import { GerenteFiltros } from './gerente-filtros'
import { GerenteListaSinistros } from './gerente-lista-sinistros'
import { DetalhesSinistro } from './gerente-detalhes-sinistro'
import Link from 'next/link'

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
    hotel: 'Hotel',
    guincho: 'Guincho',
    taxi: 'Táxi',
    pane_seca: 'Pane Seca',
    pane_mecanica: 'Pane Mecânica',
    pane_eletrica: 'Pane Elétrica',
    trocar_pneu: 'Trocar Pneu',
  }

  return tipos[tipo] || tipo.replace(/_/g, ' ')
}

// Função para formatar todas as assistências (principal + adicionais)
const formatarTodasAssistencias = (sinistro: Sinistro) => {
  const assistencias: string[] = []

  // Adicionar assistência principal
  if (sinistro.tipo_assistencia) {
    assistencias.push(formatarTipoAssistencia(sinistro.tipo_assistencia))
  }

  // Adicionar assistências adicionais
  if (sinistro.assistencias_tipos) {
    // Se é array, usar diretamente. Se é string, fazer split
    const tiposAdicionais = Array.isArray(sinistro.assistencias_tipos)
      ? sinistro.assistencias_tipos
      : sinistro.assistencias_tipos.split(', ')

    const assistenciasAdicionais = tiposAdicionais
      .filter((tipo) => tipo) // Remover valores vazios
      .map((tipo) => formatarTipoAssistencia(tipo))
    assistencias.push(...assistenciasAdicionais)
  }

  return assistencias.length > 0 ? assistencias.join(', ') : ''
}

interface Sinistro {
  id: string
  numero_sinistro: string
  tipo_atendimento?: string
  tipo_sinistro?: string
  tipo_assistencia?: string
  assistencia_adicional?: boolean
  status: string
  data_criacao: string
  data_atualizacao: string
  documentos_furtados: boolean
  outros_veiculos_envolvidos: boolean
  nome_completo_furto?: string
  cpf_furto?: string
  placa_veiculo_furto?: string
  cnh_proprio_nome?: string
  cnh_proprio_cpf?: string
  crlv_proprio_placa?: string
  crlv_proprio_marca?: string
  crlv_proprio_modelo?: string
  crlv_proprio_ano?: number
  cnh_terceiros_nome?: string
  cnh_terceiros_cpf?: string
  crlv_terceiro_placa?: string
  crlv_terceiro_marca?: string
  crlv_terceiro_modelo?: string
  total_fotos: number
  total_arquivos: number
  total_assistencias?: number
  assistencias_tipos?: string | string[] // Pode ser string ou array
}

interface SinistroDetalhado {
  sinistro: Sinistro
  dadosCnh: any[]
  dadosCrlv: any[]
  arquivos: any[]
  logs: any[]
}

export default function GerentePage() {
  const [sinistros, setSinistros] = useState<Sinistro[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [selectedSinistro, setSelectedSinistro] = useState<SinistroDetalhado | null>(null)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)
  const [andamentoSinistro, setAndamentoSinistro] = useState<any[]>([])
  const [loadingAndamento, setLoadingAndamento] = useState(false)
  const [passosPersonalizados, setPassosPersonalizados] = useState<Record<string, any[]>>({})
  const [showNovoPassoForm, setShowNovoPassoForm] = useState(false)
  const [novoPassoData, setNovoPassoData] = useState({ nome: '', descricao: '' })

  const { signOut, user } = useAdminAuth()
  const router = useRouter()

  // Função de logout
  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Erro no logout:', error)
      router.push('/')
    }
  }

  // Carregar lista de sinistros
  const carregarSinistros = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) {
      setLoading(true)
    }
    setError(null)

    try {
      const { data, error } = await supabase
        .from('view_sinistros_completos')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (error) {
        throw error
      }

      setSinistros(data || [])
      console.log('Sinistros carregados:', data?.length || 0)
      console.log('Exemplo de sinistro:', data?.[0])

      // Debug específico para assistências adicionais
      const comAssistenciaAdicional = data?.filter((s) => s.assistencia_adicional === true) || []
      const comTiposAssistencia = data?.filter((s) => s.assistencias_tipos) || []

      console.log('🎯 DEBUG ASSISTÊNCIAS ADICIONAIS:', {
        totalSinistros: data?.length || 0,
        comAssistenciaAdicional: comAssistenciaAdicional.length,
        comTiposAssistencia: comTiposAssistencia.length,
        exemploComAssistencia: comAssistenciaAdicional[0],
        exemploComTipos: comTiposAssistencia[0],
      })

      // Debug para assistências normais
      const assistencias = data?.filter((s) => s.tipo_atendimento === 'assistencia')
      if (assistencias?.length > 0) {
        console.log('Assistências encontradas:', assistencias)
        console.log('Primeira assistência com formatação:', {
          original: assistencias[0],
          formatado: formatarTodasAssistencias(assistencias[0]),
        })
      }
    } catch (err: any) {
      console.error('Erro ao carregar sinistros:', err)
      setError(err.message || 'Erro ao carregar sinistros')
    } finally {
      setLoading(false)
    }
  }

  // Carregar detalhes do sinistro
  const carregarDetalhes = async (sinistroId: string) => {
    setLoadingDetalhes(true)

    try {
      // Buscar dados do sinistro
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

      console.log(`Arquivos encontrados para sinistro ${sinistroId}:`, arquivosData?.length || 0)
      console.log('Detalhes dos arquivos:', arquivosData)

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
        logs: logsData || [],
      })
    } catch (err: any) {
      console.error('Erro ao carregar detalhes:', err)
      setError(err.message || 'Erro ao carregar detalhes')
    } finally {
      setLoadingDetalhes(false)
    }
  }

  // Carregar andamento do sinistro (para sinistros aprovados)
  const carregarAndamento = async (sinistroId: string) => {
    setLoadingAndamento(true)

    try {
      const response = await fetch(`/api/andamento-simples?sinistroId=${sinistroId}`)
      const result = await response.json()

      if (response.ok) {
        setAndamentoSinistro(result.andamento || [])

        // Atualizar passos personalizados para este sinistro
        const passosPersonalizadosDoSinistro = (result.andamento || []).filter((passo: any) => passo.personalizado)
        setPassosPersonalizados((prev) => ({
          ...prev,
          [sinistroId]: passosPersonalizadosDoSinistro,
        }))
      } else {
        console.error('Erro ao carregar andamento:', result.error)
      }
    } catch (error) {
      console.error('Erro ao carregar andamento:', error)
    } finally {
      setLoadingAndamento(false)
    }
  }

  // Carregar passos personalizados para todos os sinistros
  const carregarPassosPersonalizados = async () => {
    try {
      const passosMap: Record<string, any[]> = {}

      // Carregar passos personalizados apenas para sinistros que precisam
      const sinistrosComAndamento = sinistros.filter((s) => ['em_analise', 'aprovado', 'rejeitado'].includes(s.status))

      if (sinistrosComAndamento.length === 0) {
        setPassosPersonalizados({})
        return
      }

      // Fazer chamadas em paralelo para otimizar
      const promises = sinistrosComAndamento.map(async (sinistro) => {
        try {
          const response = await fetch(`/api/andamento-simples?sinistroId=${sinistro.id}`)
          if (response.ok) {
            const data = await response.json()
            const passosPersonalizadosDoSinistro = (data.andamento || []).filter((passo: any) => passo.personalizado)
            if (passosPersonalizadosDoSinistro.length > 0) {
              return { sinistroId: sinistro.id, passos: passosPersonalizadosDoSinistro }
            }
          }
        } catch (error) {
          console.error(`Erro ao carregar passos do sinistro ${sinistro.id}:`, error)
        }
        return null
      })

      const resultados = await Promise.all(promises)

      resultados.forEach((resultado) => {
        if (resultado) {
          passosMap[resultado.sinistroId] = resultado.passos
        }
      })

      setPassosPersonalizados(passosMap)
    } catch (error) {
      console.error('Erro ao carregar passos personalizados:', error)
    }
  }

  // Atualizar status do sinistro
  const atualizarStatusSinistro = async (sinistroId: string, novoStatus: string, observacoes?: string) => {
    try {
      const response = await fetch('/api/andamento-simples', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sinistroId,
          novoStatus,
          observacoes,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Atualizar o estado local
        setSinistros((prev) => prev.map((s) => (s.id === sinistroId ? { ...s, status: novoStatus } : s)))

        // Recarregar dados do servidor
        setTimeout(() => carregarSinistros(true), 500)

        if (selectedSinistro?.sinistro.id === sinistroId) {
          await carregarDetalhes(sinistroId)

          // Se mudou para status com andamento, carregar andamento
          if (['em_analise', 'aprovado', 'rejeitado'].includes(novoStatus)) {
            await carregarAndamento(sinistroId)
          }
        }
      } else {
        setError(result.error || 'Erro ao atualizar status')
      }
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err)
      setError('Erro de conexão')
    }
  }

  // Atualizar andamento de um passo
  const atualizarAndamentoPasso = async (passoId: string, status: string, observacoes?: string) => {
    if (!selectedSinistro) return

    try {
      const response = await fetch('/api/andamento-simples', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sinistroId: selectedSinistro.sinistro.id,
          passoId,
          status,
          observacoes,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Recarregar andamento
        await carregarAndamento(selectedSinistro.sinistro.id)

        // Recarregar dados do sinistro (pode ter mudado para concluído)
        await carregarDetalhes(selectedSinistro.sinistro.id)

        // Recarregar lista de sinistros
        setTimeout(() => carregarSinistros(true), 500)
      } else {
        setError(result.error || 'Erro ao atualizar andamento')
      }
    } catch (err: any) {
      console.error('Erro ao atualizar andamento:', err)
      setError('Erro de conexão')
    }
  }

  // Adicionar novo passo personalizado
  const adicionarNovoPasso = async () => {
    if (!selectedSinistro || !novoPassoData.nome.trim() || !novoPassoData.descricao.trim()) return

    try {
      const response = await fetch('/api/andamento-simples', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sinistroId: selectedSinistro.sinistro.id,
          novoPasso: novoPassoData,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        // Recarregar andamento
        await carregarAndamento(selectedSinistro.sinistro.id)

        // Limpar formulário
        setNovoPassoData({ nome: '', descricao: '' })
        setShowNovoPassoForm(false)

        // Recarregar lista de sinistros e passos personalizados
        setTimeout(() => {
          carregarSinistros(true)
          carregarPassosPersonalizados()
        }, 500)
      } else {
        setError(result.error || 'Erro ao adicionar novo passo')
      }
    } catch (err: any) {
      console.error('Erro ao adicionar novo passo:', err)
      setError('Erro de conexão')
    }
  }

  // Remover passo personalizado
  const removerPassoPersonalizado = async (passoId: string) => {
    if (!selectedSinistro) return

    if (!confirm('Tem certeza que deseja remover este passo personalizado?')) return

    try {
      const response = await fetch(
        `/api/andamento-simples?sinistroId=${selectedSinistro.sinistro.id}&passoId=${passoId}`,
        {
          method: 'DELETE',
        }
      )

      const result = await response.json()

      if (response.ok) {
        // Recarregar andamento
        await carregarAndamento(selectedSinistro.sinistro.id)

        // Recarregar lista de sinistros e passos personalizados
        setTimeout(() => {
          carregarSinistros(true)
          carregarPassosPersonalizados()
        }, 500)
      } else {
        setError(result.error || 'Erro ao remover passo')
      }
    } catch (err: any) {
      console.error('Erro ao remover passo:', err)
      setError('Erro de conexão')
    }
  }

  // Função original mantida para compatibilidade (será removida)
  const atualizarStatus = async (sinistroId: string, novoStatus: string) => {
    try {
      console.log('Atualizando status:', sinistroId, novoStatus)

      // Obter data atual no fuso de Brasília
      const obterDataAtualBrasilia = () => {
        const agora = new Date()

        // Converter para horário de Brasília usando toLocaleString
        const brasiliaString = agora.toLocaleString('pt-BR', {
          timeZone: 'America/Sao_Paulo',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })

        // Parsear o resultado (formato: "10/07/2025, 10:18:37")
        const [dataParte, horaParte] = brasiliaString.split(', ')
        const [dia, mes, ano] = dataParte.split('/')
        const [hora, min, seg] = horaParte.split(':')

        // Criar data no formato ISO
        const dataFormatada = `${ano}-${mes}-${dia}T${hora}:${min}:${seg}.000-03:00`

        console.log('🕐 Atualização de status - Conversão CORRIGIDA:', {
          original_UTC: agora.toISOString(),
          brasilia_locale: brasiliaString,
          resultado_final: dataFormatada,
        })

        return dataFormatada
      }

      const dataAtualBrasilia = obterDataAtualBrasilia()

      const { error } = await supabase
        .from('sinistros')
        .update({
          status: novoStatus,
          data_atualizacao: dataAtualBrasilia,
        })
        .eq('id', sinistroId)

      if (error) {
        console.error('Erro Supabase:', error)
        throw error
      }

      // Registrar log
      await supabase.from('log_atividades').insert([
        {
          sinistro_id: sinistroId,
          acao: 'STATUS_ALTERADO',
          descricao: `Status alterado para: ${novoStatus}`,
          status_novo: novoStatus,
          usuario_nome: 'Gerente',
          created_at: dataAtualBrasilia,
        },
      ])

      // Atualizar o estado local imediatamente para feedback visual
      setSinistros((prev) => prev.map((s) => (s.id === sinistroId ? { ...s, status: novoStatus } : s)))

      // Recarregar dados do servidor
      setTimeout(() => carregarSinistros(true), 500)

      if (selectedSinistro?.sinistro.id === sinistroId) {
        await carregarDetalhes(sinistroId)
      }
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err)
      setError(err.message || 'Erro ao atualizar status')
    }
  }

  // Filtrar sinistros
  const sinistrosFiltrados = sinistros.filter((sinistro) => {
    const matchesSearch =
      sinistro.numero_sinistro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.cnh_proprio_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.crlv_proprio_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.cnh_proprio_cpf?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'todos' || sinistro.status === statusFilter
    const matchesTipo =
      tipoFilter === 'todos' ||
      (sinistro.tipo_atendimento === 'assistencia' && tipoFilter === 'assistencia') ||
      (sinistro.tipo_atendimento !== 'assistencia' && sinistro.tipo_sinistro === tipoFilter)

    // Debug dos filtros
    console.log(`Filtro Debug - Sinistro ${sinistro.numero_sinistro}:`, {
      statusFilter,
      tipoFilter,
      sinistroStatus: sinistro.status,
      sinistroTipo: sinistro.tipo_sinistro,
      matchesStatus,
      matchesTipo,
      incluido: matchesSearch && matchesStatus && matchesTipo,
    })

    // Auto-refresh
    console.log('Auto-refresh executando...')

    // Filtros alterados
    return matchesSearch && matchesStatus && matchesTipo
  })


  useEffect(() => {
    carregarSinistros()

    // Auto-atualização a cada 10 segundos
    const interval = setInterval(() => {
      console.log('Auto-refresh executando...')
      carregarSinistros(true)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Carregar passos personalizados inicialmente
  useEffect(() => {
    const timer = setTimeout(() => {
      if (sinistros.length > 0) {
        carregarPassosPersonalizados()
      }
    }, 1000) // Aguardar 1 segundo após carregar sinistros

    return () => clearTimeout(timer)
  }, []) // Apenas uma vez

  // Carregar passos personalizados quando sinistros mudarem
  useEffect(() => {
    if (sinistros.length > 0) {
      console.log('🔄 Carregando passos personalizados para', sinistros.length, 'sinistros')
      carregarPassosPersonalizados()
    }
  }, [sinistros]) // Executa sempre que sinistros mudar

  // Log para debug dos filtros
  useEffect(() => {
    console.log('Filtros alterados:', { statusFilter, tipoFilter })
    console.log('Total sinistros:', sinistros.length)
    console.log('Sinistros filtrados:', sinistrosFiltrados.length)
  }, [statusFilter, tipoFilter, sinistros])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className='min-h-screen bg-gradient-to-br from-background-gradient-light to-background'>
        <main className='container mx-auto px-3 py-4 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6'>
          <GerenteHeader />

          <GerenteEstatisticas sinistros={sinistros} />

          <GerenteFiltros
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            tipoFilter={tipoFilter}
            setTipoFilter={setTipoFilter}
          />

          <GerenteListaSinistros
            sinistrosFiltrados={sinistrosFiltrados}
            passosPersonalizados={passosPersonalizados}
            formatarData={formatarData}
            formatarTodasAssistencias={formatarTodasAssistencias}
            carregarDetalhes={carregarDetalhes}
            carregarAndamento={carregarAndamento}
            loadingDetalhes={loadingDetalhes}
            selectedSinistro={selectedSinistro}
            andamentoSinistro={andamentoSinistro}
            loadingAndamento={loadingAndamento}
            atualizarStatusSinistro={atualizarStatusSinistro}
            atualizarAndamentoPasso={atualizarAndamentoPasso}
            adicionarNovoPasso={adicionarNovoPasso}
            removerPassoPersonalizado={removerPassoPersonalizado}
            showNovoPassoForm={showNovoPassoForm}
            novoPassoData={novoPassoData}
            setNovoPassoData={setNovoPassoData}
            setShowNovoPassoForm={setShowNovoPassoForm}
            DetalhesSinistro={DetalhesSinistro}
          />
          {/* Error Alert */}
          {error && (
            <Alert className='border-red-200 bg-red-50'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-700'>{error}</AlertDescription>
            </Alert>
          )}
        </main>
      </div>
    </AuthGuard>
  )
}

