"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  Wrench
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { AuthGuard } from "@/components/auth-guard"
import { UserProfile } from "@/components/user-profile"

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

interface Sinistro {
  id: string
  numero_sinistro: string
  tipo_atendimento?: string
  tipo_sinistro?: string
  tipo_assistencia?: string
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
  cnh_terceiro_nome?: string
  cnh_terceiro_cpf?: string
  crlv_terceiro_placa?: string
  crlv_terceiro_marca?: string
  crlv_terceiro_modelo?: string
  total_fotos: number
  total_arquivos: number
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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("todos")
  const [tipoFilter, setTipoFilter] = useState<string>("todos")
  const [selectedSinistro, setSelectedSinistro] = useState<SinistroDetalhado | null>(null)
  const [loadingDetalhes, setLoadingDetalhes] = useState(false)
  const [andamentoSinistro, setAndamentoSinistro] = useState<any[]>([])
  const [loadingAndamento, setLoadingAndamento] = useState(false)
  const [passosPersonalizados, setPassosPersonalizados] = useState<Record<string, any[]>>({})
  const [showNovoPassoForm, setShowNovoPassoForm] = useState(false)
  const [novoPassoData, setNovoPassoData] = useState({ nome: '', descricao: '' })

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
      // Debug para assistências
      const assistencias = data?.filter(s => s.tipo_atendimento === 'assistencia')
      if (assistencias?.length > 0) {
        console.log('Assistências encontradas:', assistencias)
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
        logs: logsData || []
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
        setPassosPersonalizados(prev => ({
          ...prev,
          [sinistroId]: passosPersonalizadosDoSinistro
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
      const sinistrosComAndamento = sinistros.filter(s => ['em_analise', 'aprovado', 'rejeitado'].includes(s.status))
      
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
      
      resultados.forEach(resultado => {
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
          observacoes
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Atualizar o estado local
        setSinistros(prev => prev.map(s => 
          s.id === sinistroId ? { ...s, status: novoStatus } : s
        ))

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
          observacoes
        })
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
          novoPasso: novoPassoData
        })
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
      const response = await fetch(`/api/andamento-simples?sinistroId=${selectedSinistro.sinistro.id}&passoId=${passoId}`, {
        method: 'DELETE'
      })

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
          hour12: false
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
          resultado_final: dataFormatada
        })
        
        return dataFormatada
      }

      const dataAtualBrasilia = obterDataAtualBrasilia()
      
      const { error } = await supabase
        .from('sinistros')
        .update({ 
          status: novoStatus,
          data_atualizacao: dataAtualBrasilia
        })
        .eq('id', sinistroId)

      if (error) {
        console.error('Erro Supabase:', error)
        throw error
      }

      // Registrar log
      await supabase
        .from('log_atividades')
        .insert([{
          sinistro_id: sinistroId,
          acao: 'STATUS_ALTERADO',
          descricao: `Status alterado para: ${novoStatus}`,
          status_novo: novoStatus,
          usuario_nome: 'Gerente',
          created_at: dataAtualBrasilia
        }])

      // Atualizar o estado local imediatamente para feedback visual
      setSinistros(prev => prev.map(s => 
        s.id === sinistroId ? { ...s, status: novoStatus } : s
      ))

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
  const sinistrosFiltrados = sinistros.filter(sinistro => {
    const matchesSearch = 
      sinistro.numero_sinistro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.cnh_proprio_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.crlv_proprio_placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.cnh_proprio_cpf?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "todos" || sinistro.status === statusFilter
    const matchesTipo = tipoFilter === "todos" || 
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
      incluido: matchesSearch && matchesStatus && matchesTipo
    })
    
    // Auto-refresh
    console.log('Auto-refresh executando...')
    
    // Filtros alterados
    return matchesSearch && matchesStatus && matchesTipo
  })

  // Estatísticas
  const stats = {
    total: sinistros.length,
    pendentes: sinistros.filter(s => s.status === 'pendente').length,
    emAnalise: sinistros.filter(s => s.status === 'em_analise').length,
    aprovados: sinistros.filter(s => s.status === 'aprovado').length,
    rejeitados: sinistros.filter(s => s.status === 'rejeitado').length,
    concluidos: sinistros.filter(s => s.status === 'concluido').length
  }

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
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="container mx-auto px-3 py-4 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Header */}
        <header className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 mb-3 sm:mb-6">
          <div className="flex items-center justify-between gap-3">
            {/* Logo da empresa */}
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <img 
                src="/images/logo.png" 
                alt="PV Auto Proteção" 
                className="h-10 w-10 sm:h-14 sm:w-14 object-cover rounded-full border-2 border-gray-200 shadow-sm flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 truncate leading-tight">
                  PV Auto Proteção
                </h1>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base truncate leading-tight">
                  Gerenciamento de Ocorrências
                </p>
              </div>
            </div>
            
            {/* Perfil do usuário */}
            <div className="flex-shrink-0">
              <UserProfile />
            </div>
          </div>
        </header>

      {/* Estatísticas */}
      <div className=" grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
      <Card className="hover:shadow-lg transition-all border-l-4 border-l-gray-400 hover:border-l-gray-600">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-700 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Concluídos
                </p>
                <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.concluidos}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-amber-400 hover:border-l-amber-600">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-amber-700 flex items-center gap-1">
                  <Clock4 className="w-3 h-3" />
                  Pendentes
                </p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pendentes}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-400 hover:border-l-blue-600">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-700 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Em Análise
                </p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.emAnalise}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-400 hover:border-l-green-600">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-700 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Aprovados
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.aprovados}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-red-400 hover:border-l-red-600">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-red-700 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Rejeitados
                </p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejeitados}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all border-l-4 border-l-gray-400 hover:border-l-gray-600">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                  <BarChart3 className="w-3 h-3" />
                  Total
                </p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-l-4 border-l-indigo-400">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-4 h-4" />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Search className="w-3 h-3" />
                Buscar Ocorrência
              </Label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Número, nome, placa ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Badge className="w-3 h-3 rounded-full p-0" />
                Status da Ocorrência
              </Label>
              <select 
                id="status"
                value={statusFilter}
                onChange={(e) => {
                  console.log('Mudando status filter de', statusFilter, 'para', e.target.value)
                  setStatusFilter(e.target.value)
                }}
                className="mt-2 h-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="em_analise">Em Análise</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
            <div>
              <Label htmlFor="tipo" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <Car className="w-3 h-3" />
                Tipo de Atendimento
              </Label>
              <select 
                id="tipo"
                value={tipoFilter}
                onChange={(e) => {
                  console.log('Mudando tipo filter de', tipoFilter, 'para', e.target.value)
                  setTipoFilter(e.target.value)
                }}
                className="mt-2 h-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os tipos</option>
                <option value="assistencia">Assistência</option>
                <option value="colisao">Colisão</option>
                <option value="furto">Furto</option>
                <option value="roubo">Roubo</option>
                <option value="pequenos_reparos">Pequenos Reparos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sinistros */}
      <div className="grid gap-4">
        {sinistrosFiltrados.length === 0 ? (
                  <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum sinistro encontrado</h3>
            <p className="text-sm text-gray-500">
              Tente ajustar os filtros de busca para encontrar sinistros
            </p>
          </CardContent>
        </Card>
        ) : (
          sinistrosFiltrados.map((sinistro) => (
            <Card key={sinistro.id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-200 hover:border-l-blue-400">
              <CardContent className="p-4 sm:p-5">
                {/* Mobile Layout */}
                <div className="lg:hidden space-y-4">
                  {/* Linha 1: Número do sinistro + Status */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="font-mono text-sm font-bold bg-blue-50 border-blue-200 text-blue-800 px-3 py-1">
                      #{sinistro.numero_sinistro}
                    </Badge>
                    <Badge 
                      variant={
                        sinistro.status === 'concluido' ? 'default' :
                        sinistro.status === 'aprovado' ? 'secondary' :
                        sinistro.status === 'em_analise' ? 'outline' :
                        sinistro.status === 'rejeitado' ? 'destructive' :
                        'secondary'
                      }
                      className={`text-xs px-2 py-1 ${
                        sinistro.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                        sinistro.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        sinistro.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        sinistro.status === 'rejeitado' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {sinistro.status === 'concluido' ? 
                          <><CheckCircle className="w-3 h-3" /> Concluído</> :
                         sinistro.status === 'aprovado' ? 
                          <><CheckCircle className="w-3 h-3" /> Aprovado</> :
                         sinistro.status === 'em_analise' ? 
                          <><Eye className="w-3 h-3" /> Em Análise</> :
                         sinistro.status === 'rejeitado' ? 
                          <><XCircle className="w-3 h-3" /> Rejeitado</> :
                          <><Clock4 className="w-3 h-3" /> Pendente</>}
                      </div>
                    </Badge>
                  </div>

                  {/* Linha 2: Tipo de atendimento */}
                  <div className="flex justify-center">
                    <Badge 
                      variant={
                        sinistro.tipo_atendimento === 'assistencia' ? 'default' :
                        sinistro.tipo_sinistro === 'colisao' ? 'destructive' : 
                        sinistro.tipo_sinistro === 'pequenos_reparos' ? 'outline' :
                        'secondary'
                      }
                      className={`text-xs px-3 py-1 ${
                        sinistro.tipo_atendimento === 'assistencia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        sinistro.tipo_sinistro === 'colisao' ? 'bg-red-100 text-red-800 border-red-200' :
                        sinistro.tipo_sinistro === 'furto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        sinistro.tipo_sinistro === 'roubo' ? 'bg-red-100 text-red-800 border-red-200' :
                        sinistro.tipo_sinistro === 'pequenos_reparos' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        {(() => {
                          // Verificar assistência
                          if (sinistro.tipo_atendimento === 'assistencia') {
                            return (
                              <>
                                <Headphones className="w-3 h-3" /> 
                                Assistência - {formatarTipoAssistencia(sinistro.tipo_assistencia)}
                              </>
                            )
                          }
                          
                          // Verificar tipos de sinistro
                          switch (sinistro.tipo_sinistro) {
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
                          {sinistro.cnh_proprio_nome || sinistro.nome_completo_furto || 'Nome não informado'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs text-gray-500">Veículo</div>
                        <div className="text-sm font-medium font-mono">
                          {sinistro.crlv_proprio_placa || sinistro.placa_veiculo_furto || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {sinistro.crlv_proprio_marca && sinistro.crlv_proprio_modelo ? 
                            `${sinistro.crlv_proprio_marca} ${sinistro.crlv_proprio_modelo}` : 
                            'Modelo não identificado'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div className="text-xs text-gray-500">
                          {formatarData(sinistro.data_criacao)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="w-3 h-3" />
                        <span>{sinistro.total_arquivos} arquivos</span>
                      </div>
                    </div>
                  </div>

                  {/* Linha 4: Tags especiais */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {sinistro.outros_veiculos_envolvidos && (
                      <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                        <Users className="w-3 h-3 mr-1" />
                        Terceiros
                      </Badge>
                    )}
                    {sinistro.documentos_furtados && (
                      <Badge variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Docs Furtados
                      </Badge>
                    )}
                    
                    {/* Tags de passos personalizados */}
                    {passosPersonalizados[sinistro.id]?.slice(0, 2).map((passo, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className={`text-xs font-medium ${
                          passo.status === 'concluido' ? 'bg-green-50 border-green-200 text-green-700' :
                          passo.status === 'em_andamento' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                          'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        {passo.status === 'concluido' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                         passo.status === 'em_andamento' ? <PlayCircle className="w-3 h-3 mr-1" /> :
                         <Clock4 className="w-3 h-3 mr-1" />} 
                        {passo.nome}
                      </Badge>
                    ))}
                    
                    {/* Indicador de mais passos */}
                    {passosPersonalizados[sinistro.id] && passosPersonalizados[sinistro.id].length > 2 && (
                      <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                        +{passosPersonalizados[sinistro.id].length - 2} mais
                      </Badge>
                    )}
                  </div>

                  {/* Linha 5: Botão de ação */}
                  <div className="flex justify-center pt-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={async () => {
                            await carregarDetalhes(sinistro.id)
                            if (['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status)) {
                              await carregarAndamento(sinistro.id)
                            }
                          }}
                          className="h-9 text-sm hover:bg-blue-50 hover:border-blue-300 w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col" aria-describedby="dialog-description">
                        <DialogHeader>
                          <DialogTitle>Detalhes do Sinistro {sinistro.numero_sinistro}</DialogTitle>
                          <div id="dialog-description" className="sr-only">
                            Visualização completa dos dados do sinistro incluindo documentos, fotos e histórico
                          </div>
                        </DialogHeader>
                        {loadingDetalhes ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin" />
                          </div>
                        ) : selectedSinistro ? (
                          <DetalhesSinistro 
                            dados={selectedSinistro} 
                            andamento={andamentoSinistro}
                            loadingAndamento={loadingAndamento}
                            onAtualizarStatus={atualizarStatusSinistro}
                            onAtualizarAndamento={atualizarAndamentoPasso}
                            onAdicionarNovoPasso={adicionarNovoPasso}
                            onRemoverPasso={removerPassoPersonalizado}
                            showNovoPassoForm={showNovoPassoForm}
                            novoPassoData={novoPassoData}
                            onNovoPassoChange={setNovoPassoData}
                            onToggleNovoPassoForm={setShowNovoPassoForm}
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:block">
                  <div className="space-y-3">
                    {/* Linha 1: Número + Status + Botão */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="font-mono text-sm font-bold bg-blue-50 border-blue-200 text-blue-800 px-3 py-1">
                          #{sinistro.numero_sinistro}
                        </Badge>
                        <Badge 
                          variant={
                            sinistro.tipo_atendimento === 'assistencia' ? 'default' :
                            sinistro.tipo_sinistro === 'colisao' ? 'destructive' : 
                            sinistro.tipo_sinistro === 'pequenos_reparos' ? 'outline' :
                            'secondary'
                          }
                          className={`text-sm px-3 py-1 ${
                            sinistro.tipo_atendimento === 'assistencia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                            sinistro.tipo_sinistro === 'colisao' ? 'bg-red-100 text-red-800 border-red-200' :
                            sinistro.tipo_sinistro === 'furto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            sinistro.tipo_sinistro === 'roubo' ? 'bg-red-100 text-red-800 border-red-200' :
                            sinistro.tipo_sinistro === 'pequenos_reparos' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {(() => {
                              // Verificar assistência
                              if (sinistro.tipo_atendimento === 'assistencia') {
                                return (
                                  <>
                                    <Headphones className="w-3 h-3" /> 
                                    Assistência - {formatarTipoAssistencia(sinistro.tipo_assistencia)}
                                  </>
                                )
                              }
                              
                              // Verificar tipos de sinistro
                              switch (sinistro.tipo_sinistro) {
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
                            })()}
                          </div>
                        </Badge>
                        <Badge 
                          variant={
                            sinistro.status === 'concluido' ? 'default' :
                            sinistro.status === 'aprovado' ? 'secondary' :
                            sinistro.status === 'em_analise' ? 'outline' :
                            sinistro.status === 'rejeitado' ? 'destructive' :
                            'secondary'
                          }
                          className={`text-sm px-3 py-1 ${
                            sinistro.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                            sinistro.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            sinistro.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            sinistro.status === 'rejeitado' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {sinistro.status === 'concluido' ? 
                              <><CheckCircle className="w-3 h-3" /> Concluído</> :
                             sinistro.status === 'aprovado' ? 
                              <><CheckCircle className="w-3 h-3" /> Aprovado</> :
                             sinistro.status === 'em_analise' ? 
                              <><Eye className="w-3 h-3" /> Em Análise</> :
                             sinistro.status === 'rejeitado' ? 
                              <><XCircle className="w-3 h-3" /> Rejeitado</> :
                              <><Clock4 className="w-3 h-3" /> Pendente</>}
                          </div>
                        </Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                              await carregarDetalhes(sinistro.id)
                              if (['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status)) {
                                await carregarAndamento(sinistro.id)
                              }
                            }}
                            className="h-9 text-sm hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col" aria-describedby="dialog-description">
                          <DialogHeader>
                            <DialogTitle>Detalhes do Sinistro {sinistro.numero_sinistro}</DialogTitle>
                            <div id="dialog-description" className="sr-only">
                              Visualização completa dos dados do sinistro incluindo documentos, fotos e histórico
                            </div>
                          </DialogHeader>
                          {loadingDetalhes ? (
                            <div className="flex items-center justify-center p-8">
                              <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                          ) : selectedSinistro ? (
                            <DetalhesSinistro 
                              dados={selectedSinistro} 
                              andamento={andamentoSinistro}
                              loadingAndamento={loadingAndamento}
                              onAtualizarStatus={atualizarStatusSinistro}
                              onAtualizarAndamento={atualizarAndamentoPasso}
                              onAdicionarNovoPasso={adicionarNovoPasso}
                              onRemoverPasso={removerPassoPersonalizado}
                              showNovoPassoForm={showNovoPassoForm}
                              novoPassoData={novoPassoData}
                              onNovoPassoChange={setNovoPassoData}
                              onToggleNovoPassoForm={setShowNovoPassoForm}
                            />
                          ) : null}
                        </DialogContent>
                      </Dialog>
                    </div>

                    {/* Linha 2: Informações Principais */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs text-gray-500 block">Condutor</span>
                            <span className="text-sm font-medium truncate block">
                              {sinistro.cnh_proprio_nome || sinistro.nome_completo_furto || 'Nome não informado'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs text-gray-500 block">Veículo</span>
                            <span className="text-sm font-medium font-mono block">
                              {sinistro.crlv_proprio_placa || sinistro.placa_veiculo_furto || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-600 truncate block">
                              {sinistro.crlv_proprio_marca && sinistro.crlv_proprio_modelo ? 
                                `${sinistro.crlv_proprio_marca} ${sinistro.crlv_proprio_modelo}` : 
                                'Modelo não identificado'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                        <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <div>
                          <span className="text-xs text-gray-500">Criado em</span>
                          <span className="text-sm font-medium ml-2">{formatarData(sinistro.data_criacao)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Linha 3: Indicadores e Tags */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="w-3 h-3" />
                        <span>{sinistro.total_arquivos} arquivos anexados</span>
                      </div>
                      
                      {/* Tags de Indicadores e Passos */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {sinistro.outros_veiculos_envolvidos && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              Terceiros Envolvidos
                            </div>
                          </Badge>
                        )}
                        {sinistro.documentos_furtados && (
                          <Badge variant="outline" className="text-xs bg-red-50 border-red-200 text-red-700">
                            <div className="flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              Documentos Furtados
                            </div>
                          </Badge>
                        )}
                        
                        {/* Tags de passos personalizados com status */}
                        {passosPersonalizados[sinistro.id]?.map((passo, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className={`text-xs font-medium ${
                              passo.status === 'concluido' ? 'bg-green-50 border-green-200 text-green-700' :
                              passo.status === 'em_andamento' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                              'bg-gray-50 border-gray-200 text-gray-700'
                            }`}
                            title={`${passo.nome} - ${
                              passo.status === 'concluido' ? 'Concluído' :
                              passo.status === 'em_andamento' ? 'Em Andamento' :
                              'Pendente'
                            }`}
                          >
                            {passo.status === 'concluido' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                             passo.status === 'em_andamento' ? <PlayCircle className="w-3 h-3 mr-1" /> :
                             <Clock4 className="w-3 h-3 mr-1" />} {passo.nome}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
    </main>
    </div>
    </AuthGuard>
  )
}

// Componente para detalhes do sinistro  
interface DetalhesSinistroProps {
  dados: SinistroDetalhado
  andamento?: any[]
  loadingAndamento?: boolean
  onAtualizarStatus?: (sinistroId: string, novoStatus: string, observacoes?: string) => Promise<void>
  onAtualizarAndamento?: (passoId: string, status: string, observacoes?: string) => Promise<void>
  onAdicionarNovoPasso?: () => Promise<void>
  onRemoverPasso?: (passoId: string) => Promise<void>
  showNovoPassoForm?: boolean
  novoPassoData?: { nome: string; descricao: string }
  onNovoPassoChange?: (data: { nome: string; descricao: string }) => void
  onToggleNovoPassoForm?: (show: boolean) => void
}

function DetalhesSinistro({ 
  dados, 
  andamento = [], 
  loadingAndamento = false, 
  onAtualizarStatus, 
  onAtualizarAndamento,
  onAdicionarNovoPasso,
  onRemoverPasso,
  showNovoPassoForm = false,
  novoPassoData = { nome: '', descricao: '' },
  onNovoPassoChange,
  onToggleNovoPassoForm
}: DetalhesSinistroProps) {
  const { sinistro, dadosCnh, dadosCrlv, arquivos, logs } = dados
  const [historicoAberto, setHistoricoAberto] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-3 md:space-y-3 ">
      {/* Seção Geral */}
        {/* Header Principal */}
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          {/* Mobile Layout */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                  <Info className="w-3 h-3" />
                  <span>Sinistro</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">#{sinistro.numero_sinistro}</h1>
              </div>
              <Badge 
                variant={
                  sinistro.status === 'concluido' ? 'default' :
                  sinistro.status === 'aprovado' ? 'secondary' :
                  sinistro.status === 'em_analise' ? 'outline' :
                  sinistro.status === 'rejeitado' ? 'destructive' :
                  'secondary'
                }
                className={`text-xs px-2 py-1 ${
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
            
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <Calendar className="w-3 h-3" />
                <span>{formatarData(sinistro.data_criacao)}</span>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {sinistro.tipo_atendimento === 'assistencia' ? (
                  <>
                    <Headphones className="w-4 h-4 inline mr-1" />
                    {formatarTipoAssistencia(sinistro.tipo_assistencia)}
                  </>
                ) : sinistro.tipo_sinistro === 'colisao' ? (
                  <>
                    <Car className="w-4 h-4 inline mr-1" />
                    Colisão
                  </>
                ) : sinistro.tipo_sinistro === 'furto' ? (
                  <>
                    <Shield className="w-4 h-4 inline mr-1" />
                    Furto
                  </>
                ) : sinistro.tipo_sinistro === 'roubo' ? (
                  <>
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Roubo
                  </>
                ) : sinistro.tipo_sinistro === 'pequenos_reparos' ? (
                  <>
                    <Wrench className="w-4 h-4 inline mr-1" />
                    Pequenos Reparos
                  </>
                ) : (
                  'Tipo não identificado'
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>Sinistro</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">#{sinistro.numero_sinistro}</h1>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatarData(sinistro.data_criacao)}</span>
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
              
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {sinistro.tipo_atendimento === 'assistencia' ? 'Tipo de Assistência' : 'Tipo de Sinistro'}
                </div>
                <div className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
                  {sinistro.tipo_atendimento === 'assistencia' ? (
                    <>
                      <Headphones className="w-5 h-5" />
                      {formatarTipoAssistencia(sinistro.tipo_assistencia)}
                    </>
                  ) : sinistro.tipo_sinistro === 'colisao' ? (
                    <>
                      <Car className="w-5 h-5" />
                      Colisão
                    </>
                  ) : sinistro.tipo_sinistro === 'furto' ? (
                    <>
                      <Shield className="w-5 h-5" />
                      Furto
                    </>
                  ) : sinistro.tipo_sinistro === 'roubo' ? (
                    <>
                      <AlertTriangle className="w-5 h-5" />
                      Roubo
                    </>
                  ) : sinistro.tipo_sinistro === 'pequenos_reparos' ? (
                    <>
                      <Wrench className="w-5 h-5" />
                      Pequenos Reparos
                    </>
                  ) : (
                    <>Tipo não identificado</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <div 
            className="border border-gray-200 rounded-lg bg-white p-2 md:p-4 text-center cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
            onClick={() => {
              const arquivosSection = document.getElementById('arquivos-section');
              if (arquivosSection) {
                arquivosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
          >
            <FolderOpen className="w-4 h-4 md:w-6 md:h-6 text-blue-500 mx-auto mb-1 md:mb-2" />
            <div className="text-lg md:text-2xl font-bold text-gray-900">{sinistro.total_arquivos || 0}</div>
            <div className="text-xs md:text-sm text-gray-500">Arquivos</div>
            <div className="text-xs text-blue-600 mt-1 hidden md:block opacity-0 hover:opacity-100 transition-opacity">
              Clique para ver arquivos
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg bg-white p-2 md:p-4 text-center">
            <Clock className="w-4 h-4 md:w-6 md:h-6 text-gray-400 mx-auto mb-1 md:mb-2" />
            <div className="text-lg md:text-2xl font-bold text-gray-900">
              {Math.ceil((new Date().getTime() - new Date(sinistro.data_criacao).getTime()) / (1000 * 60 * 60 * 24))}
            </div>
            <div className="text-xs md:text-sm text-gray-500">Dias</div>
          </div>
        </div>

        {/* Informações especiais */}
        {(sinistro.documentos_furtados || sinistro.outros_veiculos_envolvidos) && (
          <div className="space-y-3">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 px-1">Informações Especiais</h3>
            <div className="grid grid-cols-1 gap-3 md:gap-4">
              {sinistro.documentos_furtados && (
                <div className="border border-red-200 bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-3 h-3 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-red-900">Documentos Furtados</h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs font-medium text-red-700 mb-1">Nome</div>
                      <div className="text-sm text-red-900 break-words">{sinistro.nome_completo_furto || 'Não informado'}</div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs font-medium text-red-700 mb-1">CPF</div>
                        <div className="text-xs font-mono text-red-900">{sinistro.cpf_furto || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-red-700 mb-1">Placa</div>
                        <div className="text-xs font-mono text-red-900">{sinistro.placa_veiculo_furto || 'N/A'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {sinistro.outros_veiculos_envolvidos && (
                <div className="border border-amber-200 bg-amber-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                      <Users className="w-3 h-3 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-amber-900">Terceiros Envolvidos</h4>
                    </div>
                  </div>
                  <div className="text-xs text-amber-700">
                    Este sinistro envolve múltiplos veículos. Verifique a seção de veículos para mais detalhes.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timeline de progresso */}
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Progresso</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Acompanhe o andamento do processo</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            <div className={`p-2 md:p-4 border rounded-lg transition-colors ${
              ['pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status) 
              ? 'border-green-200 bg-green-50' 
              : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-center">
                <FileCheck className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  ['pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status) 
                  ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className="text-xs font-medium text-gray-600 mb-1">Criado</div>
                <div className="text-xs md:text-sm font-semibold">Concluído</div>
              </div>
            </div>
            
            <div className={`p-2 md:p-4 border rounded-lg transition-colors ${
              ['em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status) 
              ? 'border-blue-200 bg-blue-50' 
              : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-center">
                <Eye className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  ['em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status) 
                  ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="text-xs font-medium text-gray-600 mb-1">Análise</div>
                <div className="text-xs md:text-sm font-semibold">
                  {['em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status) ? 'Concluído' : 'Pendente'}
                </div>
              </div>
            </div>
            
            <div className={`p-2 md:p-4 border rounded-lg transition-colors ${
              ['aprovado', 'concluido'].includes(sinistro.status) 
              ? 'border-green-200 bg-green-50' 
              : sinistro.status === 'rejeitado'
              ? 'border-red-200 bg-red-50'
              : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-center">
                {sinistro.status === 'rejeitado' ? (
                  <XCircle className="w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-red-600" />
                ) : (
                  <CheckCircle className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                    ['aprovado', 'concluido'].includes(sinistro.status) ? 'text-green-600' : 'text-gray-400'
                  }`} />
                )}
                <div className="text-xs font-medium text-gray-600 mb-1">Decisão</div>
                <div className="text-xs md:text-sm font-semibold">
                  {sinistro.status === 'aprovado' ? 'Aprovado' : 
                   sinistro.status === 'rejeitado' ? 'Rejeitado' :
                   sinistro.status === 'concluido' ? 'Aprovado' :
                   'Pendente'}
                </div>
              </div>
            </div>
            
            <div className={`p-2 md:p-4 border rounded-lg transition-colors ${
              sinistro.status === 'concluido' 
              ? 'border-green-200 bg-green-50' 
              : 'border-gray-200 bg-gray-50'
            }`}>
              <div className="text-center">
                <CheckCircle className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  sinistro.status === 'concluido' ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className="text-xs font-medium text-gray-600 mb-1">Final</div>
                <div className="text-xs md:text-sm font-semibold">
                  {sinistro.status === 'concluido' ? 'Concluído' : 'Pendente'}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Seção Gestão */}
        <div className="space-y-3 md:space-y-6">
          {/* Gestão de Status */}
          <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
            <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-semibold text-gray-900">Gestão de Status</h3>
                <p className="text-xs md:text-sm text-gray-600 hidden md:block">Controle o andamento do sinistro</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="status-select" className="text-sm font-medium text-gray-700">
                  Alterar Status do Sinistro
                </Label>
                <select
                  id="status-select"
                  value={sinistro.status}
                  onChange={(e) => {
                    if (onAtualizarStatus) {
                      onAtualizarStatus(sinistro.id, e.target.value)
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="pendente">Pendente</option>
                  <option value="em_analise">Em Análise</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Status Atual</Label>
                <div className="flex items-center">
                  <Badge 
                    variant={
                      sinistro.status === 'pendente' ? 'secondary' :
                      sinistro.status === 'em_analise' ? 'outline' :
                      sinistro.status === 'aprovado' ? 'default' :
                      sinistro.status === 'rejeitado' ? 'destructive' :
                      'secondary'
                    }
                    className="px-3 py-1"
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
          </div>

                    {/* Andamento do Processo - Para sinistros em análise, aprovados e rejeitados */}
          {['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status) && (
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-600" />
                  Andamento do Processo
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Acompanhe cada etapa do processo do sinistro
                </p>
              </CardHeader>
              <CardContent>
                {loadingAndamento ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-600">Carregando andamento...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Mostrar apenas passos personalizados */}
                    {andamento.filter(item => item.personalizado).map((item, index) => (
                      <Card key={item.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          {/* Header do Passo - Mobile First */}
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                  item.status === 'concluido' ? 'bg-green-500' :
                                  item.status === 'em_andamento' ? 'bg-blue-500' :
                                  'bg-gray-300'
                                }`} />
                                <h4 className="font-medium text-sm lg:text-base truncate">{item.nome}</h4>
                                <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                                  Custom
                                </Badge>
                              </div>
                              {onRemoverPasso && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => onRemoverPasso(item.id.toString())}
                                  className="h-6 w-6 p-0 flex-shrink-0"
                                  title="Remover passo personalizado"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                            
                            {/* Status Badge e Select */}
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4">
                              <Badge 
                                variant={
                                  item.status === 'concluido' ? 'default' :
                                  item.status === 'em_andamento' ? 'secondary' :
                                  'outline'
                                }
                                className="text-xs w-fit"
                              >
                                {item.status === 'concluido' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                                 item.status === 'em_andamento' ? <PlayCircle className="w-3 h-3 mr-1" /> :
                                 <Clock4 className="w-3 h-3 mr-1" />}
                                {item.status === 'concluido' ? 'Concluído' :
                                 item.status === 'em_andamento' ? 'Em Andamento' :
                                 'Pendente'}
                              </Badge>
                              <select
                                value={item.status}
                                onChange={(e) => {
                                  if (onAtualizarAndamento) {
                                    onAtualizarAndamento(item.id.toString(), e.target.value)
                                  }
                                }}
                                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 lg:ml-auto"
                              >
                                <option value="pendente">Pendente</option>
                                <option value="em_andamento">Em Andamento</option>
                                <option value="concluido">Concluído</option>
                              </select>
                            </div>
                          </div>
                          
                          {/* Descrição */}
                          <p className="text-sm text-gray-600 mt-3 mb-2">
                            {item.descricao}
                          </p>
                          
                          {/* Observações */}
                          {item.observacoes && (
                            <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2">
                              <strong>Observações:</strong> {item.observacoes}
                            </div>
                          )}
                          
                          {/* Timestamps */}
                          {(item.data_inicio || item.data_conclusao) && (
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-1 text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">
                              {item.data_inicio && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  Iniciado: {formatarData(item.data_inicio)}
                                </span>
                              )}
                              {item.data_conclusao && (
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Concluído: {formatarData(item.data_conclusao)}
                                </span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    {/* Formulário para adicionar novo passo */}
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-4">
                        {!showNovoPassoForm ? (
                          <Button
                            onClick={() => onToggleNovoPassoForm?.(true)}
                            variant="outline"
                            className="w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Passo Personalizado
                          </Button>
                        ) : (
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                              <Settings className="w-5 h-5 text-gray-600" />
                              <h4 className="font-medium text-lg">Novo Passo Personalizado</h4>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="novo-passo-nome" className="text-sm font-medium text-gray-600">
                                  Nome do Passo *
                                </Label>
                                <Input
                                  id="novo-passo-nome"
                                  value={novoPassoData.nome}
                                  onChange={(e) => onNovoPassoChange?.({ ...novoPassoData, nome: e.target.value })}
                                  placeholder="Ex: Vistoria Adicional"
                                  className="focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="novo-passo-descricao" className="text-sm font-medium text-gray-600">
                                  Descrição *
                                </Label>
                                <Input
                                  id="novo-passo-descricao"
                                  value={novoPassoData.descricao}
                                  onChange={(e) => onNovoPassoChange?.({ ...novoPassoData, descricao: e.target.value })}
                                  placeholder="Ex: Vistoria adicional solicitada pelo cliente"
                                  className="focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="flex flex-col lg:flex-row gap-2">
                              <Button
                                onClick={onAdicionarNovoPasso}
                                disabled={!novoPassoData.nome.trim() || !novoPassoData.descricao.trim()}
                                className="flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Adicionar Passo
                              </Button>
                              <Button
                                onClick={() => onToggleNovoPassoForm?.(false)}
                                variant="outline"
                                className="flex-1"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informação para outros status */}
          {!['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status) && (
            <Card>
              <CardContent className="p-6 text-center">
                                  <div className="text-gray-500">
                    <p className="font-medium">Andamento do Processo</p>
                    <p className="text-sm mt-2">
                      O acompanhamento detalhado dos passos estará disponível quando o sinistro estiver em análise, aprovado ou rejeitado.
                    </p>
                  </div>
              </CardContent>
            </Card>
          )}
        </div>

      {/* Seção Condutores */}
      <div className="space-y-3 md:space-y-6">
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
        {dadosCnh.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum dado de CNH encontrado</p>
            </CardContent>
          </Card>
        ) : (
          dadosCnh.map((cnh, index) => (
            <Card key={index} className={cnh.tipo_titular === 'proprio' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-orange-500'}>
              <CardHeader className="pb-2 lg:pb-3">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                  {cnh.tipo_titular === 'proprio' ? 
                    <User className="w-5 h-5 text-blue-600" /> : 
                    <Users className="w-5 h-5 text-orange-600" />}
                  {cnh.tipo_titular === 'proprio' ? 'Condutor Principal' : 'Condutor Terceiro'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile: Layout compacto */}
                <div className="lg:hidden space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Nome Completo</div>
                    <div className="font-medium text-sm">{cnh.nome}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">CPF</div>
                      <div className="font-mono text-sm">{cnh.cpf}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">RG</div>
                      <div className="text-sm">{cnh.rg || 'Não informado'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Nascimento</div>
                      <div className="text-sm">
                        {cnh.data_nascimento ? formatarDataSemHora(cnh.data_nascimento) : 'Não informado'}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Categoria</div>
                      <div className="text-sm">
                        {cnh.categoria ? (
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800 text-xs">
                            {cnh.categoria}
                          </Badge>
                        ) : (
                          'Não informado'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Número de Registro</div>
                    <div className="font-mono text-sm">{cnh.numero_registro || 'Não informado'}</div>
                  </div>
                </div>

                {/* Desktop: Layout original */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Nome Completo</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-medium">{cnh.nome}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">CPF</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono">{cnh.cpf}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">RG</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">{cnh.rg || 'Não informado'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Data de Nascimento</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">
                      {cnh.data_nascimento ? formatarDataSemHora(cnh.data_nascimento) : 'Não informado'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Categoria</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">
                      {cnh.categoria ? (
                        <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                          {cnh.categoria}
                        </Badge>
                      ) : (
                        'Não informado'
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Número de Registro</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono">{cnh.numero_registro || 'Não informado'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </div>
      </div>

      {/* Seção Veículos */}
      <div className="space-y-3 md:space-y-6">
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
        {dadosCrlv.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Car className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum dado de veículo encontrado</p>
            </CardContent>
          </Card>
        ) : (
          dadosCrlv.map((crlv, index) => (
            <Card key={index} className={crlv.tipo_veiculo === 'proprio' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-purple-500'}>
              <CardHeader className="pb-2 lg:pb-3">
                <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                  <Car className={`w-5 h-5 ${crlv.tipo_veiculo === 'proprio' ? 'text-green-600' : 'text-purple-600'}`} />
                  {crlv.tipo_veiculo === 'proprio' ? 'Veículo Principal' : 'Veículo Terceiro'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile: Layout compacto */}
                <div className="lg:hidden space-y-3">
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <div className="text-xs text-green-700 mb-1 text-center font-medium">Placa do Veículo</div>
                    <div className="font-mono text-lg font-bold text-center text-green-800 bg-white py-2 rounded border">
                      {crlv.placa}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Marca/Modelo</div>
                    <div className="font-medium text-sm">
                      {crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Ano Fabr.</div>
                      <div className="text-sm font-medium">{crlv.ano_fabricacao || 'Não informado'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Ano Modelo</div>
                      <div className="text-sm font-medium">{crlv.ano_modelo || 'Não informado'}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Cor</div>
                      <div className="text-sm">
                        {crlv.cor ? (
                          <Badge variant="outline" className="bg-gray-100 border-gray-300 text-xs">
                            {crlv.cor}
                          </Badge>
                        ) : (
                          'Não informado'
                        )}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Combustível</div>
                      <div className="text-sm">
                        {crlv.combustivel ? (
                          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800 text-xs">
                            {crlv.combustivel}
                          </Badge>
                        ) : (
                          'Não informado'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">RENAVAM</div>
                      <div className="font-mono text-sm">{crlv.renavam || 'Não informado'}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Chassi</div>
                      <div className="font-mono text-xs break-all">{crlv.chassi || 'Não informado'}</div>
                    </div>
                  </div>
                  {crlv.proprietario && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 mb-1">Proprietário</div>
                      <div className="font-medium text-sm">{crlv.proprietario}</div>
                    </div>
                  )}
                </div>

                {/* Desktop: Layout original */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Placa</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono text-lg font-bold text-center">
                      {crlv.placa}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">RENAVAM</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono">{crlv.renavam || 'Não informado'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Chassi</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono text-xs">{crlv.chassi || 'Não informado'}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Marca/Modelo</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-medium">
                      {crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Ano Fabricação</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border text-center font-medium">
                      {crlv.ano_fabricacao || 'Não informado'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Ano Modelo</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border text-center font-medium">
                      {crlv.ano_modelo || 'Não informado'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Cor</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">
                      {crlv.cor ? (
                        <Badge variant="outline" className="bg-gray-100 border-gray-300">
                          {crlv.cor}
                        </Badge>
                      ) : (
                        'Não informado'
                      )}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Combustível</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">
                      {crlv.combustivel ? (
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                          {crlv.combustivel}
                        </Badge>
                      ) : (
                        'Não informado'
                      )}
                    </p>
                  </div>
                  {crlv.proprietario && (
                    <div className="space-y-2 lg:col-span-2">
                      <Label className="text-sm font-medium text-gray-600">Proprietário</Label>
                      <p className="text-sm bg-gray-50 p-2 rounded border font-medium">{crlv.proprietario}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </div>
      </div>

      {/* Seção Arquivos */}
      <div id="arquivos-section" className="space-y-3 md:space-y-6">
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Arquivos</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Documentos e fotos anexados</p>
            </div>
          </div>
        

        {/* Layout unificado moderno */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4">
          {arquivos.map((arquivo, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg md:rounded-2xl bg-white border border-gray-200/50 hover:border-indigo-300/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
              {/* Preview da imagem ou ícone */}
              <div className="relative h-32 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100">
                {arquivo.url_arquivo && (arquivo.tipo_mime?.startsWith('image/') || arquivo.tipo_arquivo === 'foto_veiculo') ? (
                  <img 
                    src={arquivo.url_arquivo} 
                    alt={arquivo.nome_original}
                    className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300"
                    onClick={() => window.open(arquivo.url_arquivo, '_blank')}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                        {arquivo.tipo_arquivo === 'foto_veiculo' ? 
                          <Camera className="w-8 h-8 text-gray-500" /> : 
                          <FileText className="w-8 h-8 text-gray-500" />}
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {arquivo.tipo_arquivo === 'cnh_proprio' ? 'CNH Principal' :
                         arquivo.tipo_arquivo === 'cnh_terceiro' ? 'CNH Terceiro' :
                         arquivo.tipo_arquivo === 'crlv_proprio' ? 'CRLV Principal' :
                         arquivo.tipo_arquivo === 'crlv_terceiro' ? 'CRLV Terceiro' :
                         arquivo.tipo_arquivo === 'boletim_ocorrencia' ? 'Boletim de Ocorrência' :
                         'Documento'}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Overlay com badge do tipo */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="text-xs font-medium shadow-sm">
                    {arquivo.tipo_arquivo === 'cnh_proprio' ? 'CNH' :
                     arquivo.tipo_arquivo === 'cnh_terceiro' ? 'CNH 3º' :
                     arquivo.tipo_arquivo === 'crlv_proprio' ? 'CRLV' :
                     arquivo.tipo_arquivo === 'crlv_terceiro' ? 'CRLV 3º' :
                     arquivo.tipo_arquivo === 'boletim_ocorrencia' ? 'B.O.' :
                     'Foto'}
                  </Badge>
                </div>

                {/* Botão de ação */}
                {arquivo.url_arquivo && (
                  <div className="absolute top-3 right-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(arquivo.url_arquivo, '_blank')}
                      className="h-8 w-8 p-0 bg-white/90 border-gray-200 hover:bg-white hover:scale-105 transition-all duration-200 shadow-sm"
                      title="Abrir arquivo"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Informações do arquivo */}
              <div className="p-2 md:p-4">
                <h4 className="font-semibold text-sm md:text-base text-gray-800 mb-1 truncate" title={arquivo.nome_original}>
                  {arquivo.nome_original}
                </h4>
                {arquivo.titulo_foto && (
                  <p className="text-xs md:text-sm text-indigo-600 mb-1 md:mb-2 truncate">
                    {arquivo.titulo_foto}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1 md:px-2 py-1 rounded-full">
                    {(arquivo.tamanho_arquivo / 1024).toFixed(1)}KB
                  </span>
                  {arquivo.tipo_mime && (
                    <span className="text-xs font-medium text-gray-500 uppercase bg-gray-100 px-1 md:px-2 py-1 rounded-full">
                      {arquivo.tipo_mime.split('/')[1]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mensagem quando não há arquivos */}
        {arquivos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum arquivo encontrado</h3>
            <p className="text-gray-500">Este sinistro ainda não possui arquivos anexados.</p>
          </div>
        )}
        </div>
      </div>

      {/* Seção Histórico */}
      <div className="space-y-3 md:space-y-6">
        <Collapsible open={historicoAberto} onOpenChange={setHistoricoAberto}>
          <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-1 md:-m-2 p-1 md:p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">Histórico</h3>
                    <p className="text-xs md:text-sm text-gray-600 hidden md:inline">
                      {historicoAberto ? ' (clique para fechar)' : ' (clique para abrir)'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {logs.length}
                  </Badge>
                  {historicoAberto ? (
                    <X className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Plus className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 md:mt-6">
        {logs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">Nenhum histórico encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {/* Mobile: Layout compacto */}
            <div className="lg:hidden space-y-2">
              {logs.map((log, index) => (
                <Card key={index} className="border-l-4 border-l-indigo-200">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">{log.acao}</h4>
                          <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded flex-shrink-0">
                            {formatarData(log.created_at).split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {log.descricao}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatarData(log.created_at).split(' ')[1]}
                          </span>
                          {log.usuario_nome && (
                            <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {log.usuario_nome}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop: Layout original */}
            <div className="hidden lg:block space-y-3">
              {logs.map((log, index) => (
                <Card key={index} className="border-l-4 border-l-indigo-200">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="font-medium text-base">{log.acao}</span>
                      </div>
                      <div className="flex flex-col lg:items-end gap-1">
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                          {formatarData(log.created_at)}
                        </span>
                        {log.usuario_nome && (
                          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {log.usuario_nome}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
                      {log.descricao}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  )
} 