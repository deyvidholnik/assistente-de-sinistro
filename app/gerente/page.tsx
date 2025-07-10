"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  Image as ImageIcon
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


interface Sinistro {
  id: string
  numero_sinistro: string
  tipo_sinistro: string
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
      console.log('📋 Sinistros carregados:', data?.length || 0)
      console.log('🔍 Exemplo de sinistro:', data?.[0])
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

      console.log(`📁 Arquivos encontrados para sinistro ${sinistroId}:`, arquivosData?.length || 0)
      console.log('📋 Detalhes dos arquivos:', arquivosData)

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

  // Atualizar status do sinistro
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
    const matchesTipo = tipoFilter === "todos" || sinistro.tipo_sinistro === tipoFilter

    // Debug dos filtros
    if (statusFilter !== "todos" || tipoFilter !== "todos") {
      console.log(`🔍 Filtro Debug - Sinistro ${sinistro.numero_sinistro}:`, {
        statusFilter,
        tipoFilter,
        sinistroStatus: sinistro.status,
        sinistroTipo: sinistro.tipo_sinistro,
        matchesStatus,
        matchesTipo,
        incluido: matchesSearch && matchesStatus && matchesTipo
      })
    }

    return matchesSearch && matchesStatus && matchesTipo
  })

  // Estatísticas
  const stats = {
    total: sinistros.length,
    pendentes: sinistros.filter(s => s.status === 'pendente').length,
    emAnalise: sinistros.filter(s => s.status === 'em_analise').length,
    aprovados: sinistros.filter(s => s.status === 'aprovado').length,
    rejeitados: sinistros.filter(s => s.status === 'rejeitado').length
  }

  useEffect(() => {
    carregarSinistros()
    
    // Auto-atualização a cada 10 segundos
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh executando...')
      carregarSinistros(true)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  // Log para debug dos filtros
  useEffect(() => {
    console.log('🔄 Filtros alterados:', { statusFilter, tipoFilter })
    console.log('📊 Total sinistros:', sinistros.length)
    console.log('🎯 Sinistros filtrados:', sinistrosFiltrados.length)
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
                  Gerenciamento de Sinistros
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card className="hover:shadow-md transition-shadow border-gray-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-amber-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pendentes}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-blue-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Em Análise</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.emAnalise}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-green-200">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Aprovados</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.aprovados}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-red-200 col-span-2 sm:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rejeitados</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejeitados}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-sm font-medium text-gray-700">Buscar</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Número, nome, placa ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10"
                />
              </div>
            </div>
            <div className="w-full sm:w-36">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">Status</Label>
              <select 
                id="status"
                value={statusFilter}
                onChange={(e) => {
                  console.log('🎯 Mudando status filter de', statusFilter, 'para', e.target.value)
                  setStatusFilter(e.target.value)
                }}
                className="mt-1 h-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os status</option>
                <option value="pendente">Pendente</option>
                <option value="em_analise">Em Análise</option>
                <option value="aprovado">Aprovado</option>
                <option value="rejeitado">Rejeitado</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
            <div className="w-full sm:w-32">
              <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">Tipo</Label>
              <select 
                id="tipo"
                value={tipoFilter}
                onChange={(e) => {
                  console.log('🎯 Mudando tipo filter de', tipoFilter, 'para', e.target.value)
                  setTipoFilter(e.target.value)
                }}
                className="mt-1 h-10 w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="todos">Todos os tipos</option>
                <option value="colisao">Colisão</option>
                <option value="furto">Furto</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sinistros */}
      <div className="grid gap-4">
        {sinistrosFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum sinistro encontrado</p>
            </CardContent>
          </Card>
        ) : (
          sinistrosFiltrados.map((sinistro) => (
            <Card key={sinistro.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="font-mono text-xs">
                      {sinistro.numero_sinistro}
                    </Badge>
                    <Badge variant={sinistro.tipo_sinistro === 'colisao' ? 'destructive' : 'secondary'} className="text-xs">
                      {sinistro.tipo_sinistro === 'colisao' ? 'Colisão' : 'Furto'}
                    </Badge>
                    <Badge 
                      variant={
                        sinistro.status === 'pendente' ? 'secondary' :
                        sinistro.status === 'em_analise' ? 'outline' :
                        sinistro.status === 'aprovado' ? 'default' :
                        'destructive'
                      }
                      className="text-xs"
                    >
                      {sinistro.status === 'pendente' ? 'Pendente' :
                       sinistro.status === 'em_analise' ? 'Em Análise' :
                       sinistro.status === 'aprovado' ? 'Aprovado' :
                       sinistro.status === 'rejeitado' ? 'Rejeitado' :
                       'Concluído'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <select 
                      value={sinistro.status}
                      onChange={(e) => {
                        console.log('🔄 Mudando status do sinistro', sinistro.numero_sinistro, 'de', sinistro.status, 'para', e.target.value)
                        atualizarStatus(sinistro.id, e.target.value)
                      }}
                      className="w-28 sm:w-32 h-8 text-xs px-2 py-1 border border-gray-300 rounded bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_analise">Em Análise</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="rejeitado">Rejeitado</option>
                      <option value="concluido">Concluído</option>
                    </select>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => carregarDetalhes(sinistro.id)}
                          className="h-8 text-xs"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Ver Detalhes</span>
                          <span className="sm:hidden">Ver</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby="dialog-description">
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
                          <DetalhesSinistro dados={selectedSinistro} />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>{sinistro.cnh_proprio_nome || sinistro.nome_completo_furto || 'Nome não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span>
                      {sinistro.crlv_proprio_placa || sinistro.placa_veiculo_furto || 'Placa não informada'} - 
                      {sinistro.crlv_proprio_marca && sinistro.crlv_proprio_modelo ? 
                        ` ${sinistro.crlv_proprio_marca} ${sinistro.crlv_proprio_modelo}` : 
                        ' Veículo não identificado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{formatarData(sinistro.data_criacao)}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                    <span className="text-gray-600">{sinistro.total_arquivos} arquivos</span>
                  </div>
                  {sinistro.outros_veiculos_envolvidos && (
                    <Badge variant="outline" className="text-xs">
                      Terceiros
                    </Badge>
                  )}
                  {sinistro.documentos_furtados && (
                    <Badge variant="outline" className="text-xs">
                      Docs Furtados
                    </Badge>
                  )}
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
function DetalhesSinistro({ dados }: { dados: SinistroDetalhado }) {
  const { sinistro, dadosCnh, dadosCrlv, arquivos, logs } = dados

  return (
    <Tabs defaultValue="geral" className="w-full">
      <TabsList className="grid w-full grid-cols-5" role="tablist" aria-label="Navegação dos detalhes do sinistro">
        <TabsTrigger value="geral" role="tab" id="geral-tab">Geral</TabsTrigger>
        <TabsTrigger value="condutores" role="tab" id="condutores-tab">Condutores</TabsTrigger>
        <TabsTrigger value="veiculos" role="tab" id="veiculos-tab">Veículos</TabsTrigger>
        <TabsTrigger value="arquivos" role="tab" id="arquivos-tab">Arquivos</TabsTrigger>
        <TabsTrigger value="historico" role="tab" id="historico-tab">Histórico</TabsTrigger>
      </TabsList>

      <TabsContent value="geral" className="space-y-4" role="tabpanel" aria-labelledby="geral-tab">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Número do Sinistro</Label>
            <p className="font-mono text-lg">{sinistro.numero_sinistro}</p>
          </div>
          <div>
            <Label>Status</Label>
            <Badge className="ml-2">
              {sinistro.status === 'pendente' ? 'Pendente' :
               sinistro.status === 'em_analise' ? 'Em Análise' :
               sinistro.status === 'aprovado' ? 'Aprovado' :
               sinistro.status === 'rejeitado' ? 'Rejeitado' :
               'Concluído'}
            </Badge>
          </div>
          <div>
            <Label>Tipo de Sinistro</Label>
            <p>{sinistro.tipo_sinistro === 'colisao' ? 'Colisão' : 'Furto'}</p>
          </div>
          <div>
            <Label>Data de Criação</Label>
            <p>{formatarData(sinistro.data_criacao)}</p>
          </div>
        </div>

        {sinistro.documentos_furtados && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <h4 className="font-semibold text-red-800 mb-2">Documentos Furtados</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div>
                <Label>Nome</Label>
                <p>{sinistro.nome_completo_furto || 'Não informado'}</p>
              </div>
              <div>
                <Label>CPF</Label>
                <p>{sinistro.cpf_furto || 'Não informado'}</p>
              </div>
              <div>
                <Label>Placa</Label>
                <p>{sinistro.placa_veiculo_furto || 'Não informada'}</p>
              </div>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="condutores" className="space-y-4" role="tabpanel" aria-labelledby="condutores-tab">
        {dadosCnh.map((cnh, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">
                {cnh.tipo_titular === 'proprio' ? 'Condutor Principal' : 'Condutor Terceiro'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <p>{cnh.nome}</p>
                </div>
                <div>
                  <Label>CPF</Label>
                  <p>{cnh.cpf}</p>
                </div>
                <div>
                  <Label>RG</Label>
                  <p>{cnh.rg || 'Não informado'}</p>
                </div>
                <div>
                  <Label>Data de Nascimento</Label>
                  <p>{cnh.data_nascimento ? formatarDataSemHora(cnh.data_nascimento) : 'Não informado'}</p>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <p>{cnh.categoria || 'Não informado'}</p>
                </div>
                <div>
                  <Label>Número de Registro</Label>
                  <p>{cnh.numero_registro || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="veiculos" className="space-y-4" role="tabpanel" aria-labelledby="veiculos-tab">
        {dadosCrlv.map((crlv, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">
                {crlv.tipo_veiculo === 'proprio' ? 'Veículo Principal' : 'Veículo Terceiro'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Placa</Label>
                  <p className="font-mono">{crlv.placa}</p>
                </div>
                <div>
                  <Label>RENAVAM</Label>
                  <p>{crlv.renavam || 'Não informado'}</p>
                </div>
                <div>
                  <Label>Chassi</Label>
                  <p>{crlv.chassi || 'Não informado'}</p>
                </div>
                <div>
                  <Label>Marca/Modelo</Label>
                  <p>{crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}</p>
                </div>
                <div>
                  <Label>Ano Fabricação</Label>
                  <p>{crlv.ano_fabricacao || 'Não informado'}</p>
                </div>
                <div>
                  <Label>Ano Modelo</Label>
                  <p>{crlv.ano_modelo || 'Não informado'}</p>
                </div>
                <div>
                  <Label>Cor</Label>
                  <p>{crlv.cor || 'Não informado'}</p>
                </div>
                <div>
                  <Label>Combustível</Label>
                  <p>{crlv.combustivel || 'Não informado'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="arquivos" className="space-y-4" role="tabpanel" aria-labelledby="arquivos-tab">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {arquivos.map((arquivo, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Preview da imagem */}
                {arquivo.url_arquivo && (arquivo.tipo_mime?.startsWith('image/') || arquivo.tipo_arquivo === 'foto_veiculo') && (
                  <div className="relative">
                    <img 
                      src={arquivo.url_arquivo} 
                      alt={arquivo.nome_original}
                      className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(arquivo.url_arquivo, '_blank')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    {/* Fallback para quando imagem não carrega */}
                    <div className="hidden w-full h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-center">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Preview não disponível</p>
                      </div>
                    </div>
                    {/* Overlay com tipo de arquivo */}
                    <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                      {arquivo.tipo_arquivo === 'foto_veiculo' ? 'Foto' : 'Documento'}
                    </div>
                  </div>
                )}
                
                {/* Conteúdo do card */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {arquivo.tipo_arquivo === 'foto_veiculo' ? (
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FileText className="w-5 h-5 text-gray-600" />
                      )}
                      <span className="text-sm font-medium">
                        {arquivo.tipo_arquivo === 'cnh_proprio' ? 'CNH Próprio' :
                         arquivo.tipo_arquivo === 'cnh_terceiro' ? 'CNH Terceiro' :
                         arquivo.tipo_arquivo === 'crlv_proprio' ? 'CRLV Próprio' :
                         arquivo.tipo_arquivo === 'crlv_terceiro' ? 'CRLV Terceiro' :
                         arquivo.tipo_arquivo === 'boletim_ocorrencia' ? 'Boletim de Ocorrência' :
                         'Foto do Veículo'}
                      </span>
                    </div>
                    {arquivo.url_arquivo && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(arquivo.url_arquivo, '_blank')}
                        title="Abrir em nova aba"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2 truncate" title={arquivo.nome_original}>
                    {arquivo.nome_original}
                  </p>
                  {arquivo.titulo_foto && (
                    <p className="text-xs font-medium text-blue-600 mb-2">
                      {arquivo.titulo_foto}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{(arquivo.tamanho_arquivo / 1024).toFixed(1)}KB</span>
                    {arquivo.tipo_mime && (
                      <span className="uppercase">{arquivo.tipo_mime.split('/')[1]}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensagem quando não há arquivos */}
        {arquivos.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum arquivo encontrado</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="historico" className="space-y-4" role="tabpanel" aria-labelledby="historico-tab">
        <div className="space-y-3">
          {logs.map((log, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{log.acao}</span>
                  <span className="text-xs text-gray-500">
                    {formatarData(log.created_at)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{log.descricao}</p>
                {log.usuario_nome && (
                  <p className="text-xs text-gray-500 mt-1">Por: {log.usuario_nome}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
} 