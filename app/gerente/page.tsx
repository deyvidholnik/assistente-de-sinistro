'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { ModalNovaOcorrencia } from './modal-nova-ocorrencia'
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
  
  // Callback otimizado para mudanças no novo passo
  const handleNovoPassoChange = useCallback((data: { nome: string; descricao: string }) => {
    setNovoPassoData(data)
  }, [])
  
  // Estados de paginação
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [itensPorPagina, setItensPorPagina] = useState(20)

  // Estado do modal de nova ocorrência
  const [showModalNovaOcorrencia, setShowModalNovaOcorrencia] = useState(false)
  
  // Estado da conexão Realtime
  const [realtimeStatus, setRealtimeStatus] = useState<'CONNECTING' | 'SUBSCRIBED' | 'ERROR'>('CONNECTING')

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

      // Remover duplicados por ID antes de definir o estado
      const sinistrosUnicos = data ? data.filter((sinistro, index, array) => 
        array.findIndex(s => s.id === sinistro.id) === index
      ) : []
      
      setSinistros(sinistrosUnicos)

      // Debug específico para assistências adicionais
      const comAssistenciaAdicional = data?.filter((s) => s.assistencia_adicional === true) || []
      const comTiposAssistencia = data?.filter((s) => s.assistencias_tipos) || []

      // Debug de assistências removido


      // Debug para assistências normais removido
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
      // Buscar dados do sinistro - removendo .single() para evitar erro de múltiplas linhas
      const { data: sinistroResponse, error: sinistroError } = await supabase
        .from('view_sinistros_completos')
        .select('*')
        .eq('id', sinistroId)
        .limit(1)

      if (sinistroError) throw sinistroError
      
      // Usar a primeira linha se houver múltiplas (fallback para evitar erro)
      const sinistroData = Array.isArray(sinistroResponse) ? sinistroResponse[0] : sinistroResponse

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

      // Debug de arquivos removido

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
  const carregarAndamento = async (sinistroId: string, statusSinistro?: string) => {
    setLoadingAndamento(true)

    try {
      const response = await fetch(`/api/andamento-simples?sinistroId=${sinistroId}`)
      const result = await response.json()

      if (response.ok) {
        setAndamentoSinistro(result.andamento || [])

        // Atualizar andamento completo para este sinistro
        const todosOsPassosDoSinistro = result.andamento || []
        setPassosPersonalizados((prev) => ({
          ...prev,
          [sinistroId]: todosOsPassosDoSinistro,
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
      const sinistrosComAndamento = sinistros

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
            const todosOsPassosDoSinistro = data.andamento || []
            if (todosOsPassosDoSinistro.length > 0) {
              return { sinistroId: sinistro.id, passos: todosOsPassosDoSinistro }
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

  // Função helper para verificar atualização no servidor
  const verificarERecarregarStatus = (sinistroId: string, statusEsperado: string) => {
    // Em vez de verificar o servidor, vamos preservar a atualização local
    // e fazer uma recarga inteligente que não sobrescreve atualizações recentes
    setTimeout(() => {
      setSinistros(prevSinistros => {
        // Preservar qualquer sinistro que foi atualizado recentemente
        const sinistroAtualLocal = prevSinistros.find(s => s.id === sinistroId)
        if (sinistroAtualLocal?.status === statusEsperado) {
          // Status local já correto
          // Aguardar mais um pouco antes de recarregar do servidor
          setTimeout(() => carregarSinistros(true), 2000)
          return prevSinistros // manter estado atual
        } else {
          // Se não encontrou ou status diferente, recarregar imediatamente
          carregarSinistros(true)
          return prevSinistros
        }
      })
    }, 500)
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
        // Garantir que o status seja em lowercase para consistency
        const statusNormalizado = novoStatus.toLowerCase()
        
        // Atualizar o estado local imediatamente para feedback visual
        setSinistros((prev) => prev.map((s) => (s.id === sinistroId ? { ...s, status: statusNormalizado } : s)))

        // Usar função helper para verificar e recarregar
        verificarERecarregarStatus(sinistroId, statusNormalizado)

        if (selectedSinistro?.sinistro.id === sinistroId) {
          await carregarDetalhes(sinistroId)

          // Carregar andamento para qualquer status
          await carregarAndamento(sinistroId, novoStatus)
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
        await carregarAndamento(selectedSinistro.sinistro.id, selectedSinistro.sinistro.status)

        // Recarregar dados do sinistro (pode ter mudado para concluído)
        await carregarDetalhes(selectedSinistro.sinistro.id)

        // Recarregar lista de sinistros com delay menor já que não há mudança de status aqui
        setTimeout(() => carregarSinistros(true), 1000)
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
        await carregarAndamento(selectedSinistro.sinistro.id, selectedSinistro.sinistro.status)

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
        await carregarAndamento(selectedSinistro.sinistro.id, selectedSinistro.sinistro.status)

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
      // Atualizando status

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

        // Debug de timezone removido

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

      // Recarregar dados do servidor com delay
      setTimeout(() => carregarSinistros(true), 1000)

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

    // Debug reduzido apenas quando necessário (pode ser ativado via flag)
    // console.log(`Filtro Debug - Sinistro ${sinistro.numero_sinistro}:`, { matchesSearch, matchesStatus, matchesTipo })

    // Filtros alterados
    return matchesSearch && matchesStatus && matchesTipo
  })

  useEffect(() => {
    carregarSinistros()

    // Configurar Supabase Realtime para atualizações automáticas
    const channel = supabase
      .channel('sinistros-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Escuta INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'sinistros'
        },
        (payload) => {
          // Realtime: sinistros atualizado
          
          // Recarregar dados quando houver mudanças
          carregarSinistros(true)
          
          // Se estava visualizando detalhes do sinistro que mudou, recarregar
          if (selectedSinistro && payload.new?.id === selectedSinistro.sinistro.id) {
            carregarDetalhes(payload.new.id)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'log_atividades'
        },
        (payload) => {
          // Realtime: log_atividades atualizado
          
          // Se estava visualizando detalhes de um sinistro, recarregar apenas se for o mesmo
          if (selectedSinistro && payload.new?.sinistro_id === selectedSinistro.sinistro.id) {
            carregarDetalhes(selectedSinistro.sinistro.id)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'arquivos_sinistro'
        },
        (payload) => {
          // Realtime: arquivos_sinistro atualizado
          
          // Se estava visualizando detalhes de um sinistro, recarregar apenas se for o mesmo
          if (selectedSinistro && payload.new?.sinistro_id === selectedSinistro.sinistro.id) {
            carregarDetalhes(selectedSinistro.sinistro.id)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Realtime conectado
          setRealtimeStatus('SUBSCRIBED')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Erro na conexão Realtime')
          setRealtimeStatus('ERROR')
        }
      })

    // Cleanup: unsubscribe quando componente desmonta
    return () => {
      // Desconectando Realtime
      supabase.removeChannel(channel)
    }
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
      // Carregando passos personalizados
      carregarPassosPersonalizados()
    }
  }, [sinistros]) // Executa sempre que sinistros mudar

  // Lógica de paginação
  const totalItens = sinistrosFiltrados.length
  const totalPaginas = Math.ceil(totalItens / itensPorPagina)
  const indiceInicio = (paginaAtual - 1) * itensPorPagina
  const indiceFim = indiceInicio + itensPorPagina
  const sinistrosPaginados = sinistrosFiltrados.slice(indiceInicio, indiceFim)
    // Dupla verificação para garantir que não há duplicados por ID
    .filter((sinistro, index, array) => array.findIndex(s => s.id === sinistro.id) === index)

  // Handlers de paginação
  const handleMudarPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina)
  }

  const handleMudarItensPorPagina = (novaQuantidade: number) => {
    setItensPorPagina(novaQuantidade)
    setPaginaAtual(1) // Reset para primeira página
  }

  // Reset página quando filtros mudam
  useEffect(() => {
    setPaginaAtual(1)
  }, [statusFilter, tipoFilter, searchTerm])

  // Log para debug dos filtros (comentado para reduzir spam no console)
  // useEffect(() => {
  //   console.log('Filtros alterados:', { statusFilter, tipoFilter })
  //   console.log('Total sinistros:', sinistros.length)
  //   console.log('Sinistros filtrados:', sinistrosFiltrados.length)
  // }, [statusFilter, tipoFilter, sinistros])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin' />
      </div>
    )
  }

  return (
    <AuthGuard>
      <div
        className={`min-h-screen  dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50
        `}
      >
        <GerenteHeader realtimeStatus={realtimeStatus} />
        <main className='container mx-auto px-3 py-4 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6'>
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
            sinistrosFiltrados={sinistrosPaginados}
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
            setNovoPassoData={handleNovoPassoChange}
            setShowNovoPassoForm={setShowNovoPassoForm}
            DetalhesSinistro={DetalhesSinistro}
            // Props de paginação
            paginaAtual={paginaAtual}
            totalPaginas={totalPaginas}
            itensPorPagina={itensPorPagina}
            totalItens={totalItens}
            onMudarPagina={handleMudarPagina}
            onMudarItensPorPagina={handleMudarItensPorPagina}
            onNovaOcorrencia={() => setShowModalNovaOcorrencia(true)}
          />

          {/* Modal Nova Ocorrência */}
          <ModalNovaOcorrencia
            open={showModalNovaOcorrencia}
            onOpenChange={setShowModalNovaOcorrencia}
            onSuccess={() => {
              carregarSinistros()
            }}
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
