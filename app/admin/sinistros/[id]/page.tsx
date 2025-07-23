"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'
import { 
  Shield, 
  ArrowLeft, 
  Calendar,
  Car,
  FileText,
  Phone,
  Clock,
  User,
  Sun,
  Moon,
  LogOut,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  CreditCard,
  Camera,
  Info,
  Wrench,
  Edit,
  Download,
  MoreVertical,
  Settings
} from 'lucide-react'

interface SinistroDetalhes {
  id: string
  numero_sinistro: string
  tipo_atendimento: string
  tipo_sinistro?: string
  tipo_assistencia?: string
  assistencia_adicional?: boolean
  status: string
  data_criacao: string
  data_atualizacao: string
  documentos_furtados?: boolean
  outros_veiculos_envolvidos?: boolean
  nome_completo_furto?: string
  cpf_furto?: string
  placa_veiculo_furto?: string
  total_assistencias?: number
  assistencias_tipos?: string
  // CNH Próprio
  cnh_proprio_nome?: string
  cnh_proprio_cpf?: string
  cnh_proprio_rg?: string
  cnh_proprio_categoria?: string
  cnh_proprio_numero?: string
  cnh_proprio_validade?: string
  // CRLV Próprio
  crlv_proprio_marca?: string
  crlv_proprio_modelo?: string
  crlv_proprio_ano?: string
  crlv_proprio_cor?: string
  crlv_proprio_combustivel?: string
  crlv_proprio_placa?: string
  crlv_proprio_renavam?: string
  crlv_proprio_chassi?: string
  crlv_proprio_proprietario?: string
  // CNH Terceiros
  cnh_terceiros_nome?: string
  cnh_terceiros_cpf?: string
  cnh_terceiros_rg?: string
  cnh_terceiros_categoria?: string
  cnh_terceiros_numero?: string
  cnh_terceiros_validade?: string
  // CRLV Terceiros
  crlv_terceiros_marca?: string
  crlv_terceiros_modelo?: string
  crlv_terceiros_ano?: string
  crlv_terceiros_cor?: string
  crlv_terceiros_combustivel?: string
  crlv_terceiros_placa?: string
  crlv_terceiros_renavam?: string
  crlv_terceiros_chassi?: string
  crlv_terceiros_proprietario?: string
  // Contadores
  total_arquivos?: number
  fotos_veiculo?: number
  total_dados_cnh?: number
  total_dados_crlv?: number
}

export default function AdminSinistroDetalhesPage() {
  const [sinistro, setSinistro] = useState<SinistroDetalhes | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const params = useParams()

  const isDark = theme === 'dark'
  const id = params.id as string

  useEffect(() => {
    // Verificar se é admin
    const adminData = localStorage.getItem('adminLogado')
    if (!adminData) {
      router.push('/admin/login')
      return
    }

    loadSinistroDetails()
  }, [id, router])

  const loadSinistroDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Carregando sinistro ID:', id)

      const { data, error: supabaseError } = await supabase
        .from('sinistros')
        .select(`
          *,
          dados_cnh(*),
          dados_crlv(*),
          arquivos_sinistro(*)
        `)
        .eq('id', id)
        .maybeSingle()

      if (supabaseError) {
        console.error('❌ Erro no Supabase:', supabaseError)
        if (supabaseError.code === 'PGRST116') {
          throw new Error('Sinistro não encontrado no sistema')
        }
        throw new Error(`Erro ao carregar dados: ${supabaseError.message}`)
      }

      if (!data) {
        throw new Error('Sinistro não encontrado')
      }

      console.log('✅ Dados carregados:', data)

      // Processar dados com verificações de segurança
      const dadosCnh = data.dados_cnh || []
      const dadosCrlv = data.dados_crlv || []
      const arquivos = data.arquivos_sinistro || []

      const sinistroCompleto: SinistroDetalhes = {
        ...data,
        // CNH Próprio
        cnh_proprio_nome: dadosCnh.find((c: any) => c.tipo === 'proprio')?.nome,
        cnh_proprio_cpf: dadosCnh.find((c: any) => c.tipo === 'proprio')?.cpf,
        cnh_proprio_rg: dadosCnh.find((c: any) => c.tipo === 'proprio')?.rg,
        cnh_proprio_categoria: dadosCnh.find((c: any) => c.tipo === 'proprio')?.categoria,
        cnh_proprio_numero: dadosCnh.find((c: any) => c.tipo === 'proprio')?.numero,
        cnh_proprio_validade: dadosCnh.find((c: any) => c.tipo === 'proprio')?.validade,
        // CRLV Próprio
        crlv_proprio_marca: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.marca,
        crlv_proprio_modelo: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.modelo,
        crlv_proprio_ano: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.ano,
        crlv_proprio_cor: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.cor,
        crlv_proprio_combustivel: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.combustivel,
        crlv_proprio_placa: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.placa,
        crlv_proprio_renavam: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.renavam,
        crlv_proprio_chassi: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.chassi,
        crlv_proprio_proprietario: dadosCrlv.find((c: any) => c.tipo === 'proprio')?.proprietario,
        // CNH Terceiros
        cnh_terceiros_nome: dadosCnh.find((c: any) => c.tipo === 'terceiro')?.nome,
        cnh_terceiros_cpf: dadosCnh.find((c: any) => c.tipo === 'terceiro')?.cpf,
        cnh_terceiros_rg: dadosCnh.find((c: any) => c.tipo === 'terceiro')?.rg,
        cnh_terceiros_categoria: dadosCnh.find((c: any) => c.tipo === 'terceiro')?.categoria,
        cnh_terceiros_numero: dadosCnh.find((c: any) => c.tipo === 'terceiro')?.numero,
        cnh_terceiros_validade: dadosCnh.find((c: any) => c.tipo === 'terceiro')?.validade,
        // CRLV Terceiros
        crlv_terceiros_marca: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.marca,
        crlv_terceiros_modelo: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.modelo,
        crlv_terceiros_ano: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.ano,
        crlv_terceiros_cor: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.cor,
        crlv_terceiros_combustivel: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.combustivel,
        crlv_terceiros_placa: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.placa,
        crlv_terceiros_renavam: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.renavam,
        crlv_terceiros_chassi: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.chassi,
        crlv_terceiros_proprietario: dadosCrlv.find((c: any) => c.tipo === 'terceiro')?.proprietario,
        // Contadores
        total_arquivos: arquivos.length,
        fotos_veiculo: arquivos.filter((a: any) => a.tipo_arquivo === 'foto_veiculo').length,
        total_dados_cnh: dadosCnh.length,
        total_dados_crlv: dadosCrlv.length
      }

      setSinistro(sinistroCompleto)
    } catch (err: any) {
      console.error('❌ Erro ao carregar sinistro:', err)
      console.error('ID do sinistro:', id)
      
      let errorMessage = 'Erro ao carregar dados'
      if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
      case 'aprovado':
        return isDark ? 'bg-green-900/50 text-green-300 border-green-700' : 'bg-green-100 text-green-800 border-green-200'
      case 'em_analise':
        return isDark ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pendente':
        return isDark ? 'bg-blue-900/50 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejeitado':
        return isDark ? 'bg-red-900/50 text-red-300 border-red-700' : 'bg-red-100 text-red-800 border-red-200'
      default:
        return isDark ? 'bg-gray-900/50 text-gray-300 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
      case 'aprovado':
        return <CheckCircle className="w-4 h-4" />
      case 'em_analise':
        return <Clock className="w-4 h-4" />
      case 'pendente':
        return <AlertCircle className="w-4 h-4" />
      case 'rejeitado':
        return <XCircle className="w-4 h-4" />
      default:
        return <Info className="w-4 h-4" />
    }
  }

  // Função para formatar tipo de assistência
  const formatarTipoAssistencia = (tipo: string | undefined) => {
    if (!tipo) return ''
    
    const tipos: { [key: string]: string } = {
      'hotel': 'Hospedagem de Emergência',
      'guincho': 'Reboque do Veículo',
      'taxi': 'Transporte Alternativo',
      'pane_seca': 'Pane Seca (Combustível)',
      'pane_mecanica': 'Pane Mecânica',
      'pane_eletrica': 'Pane Elétrica',
      'trocar_pneu': 'Troca de Pneu'
    }
    
    return tipos[tipo] || tipo.replace(/_/g, ' ')
  }

  // Função para formatar todas as assistências (principal + adicionais)
  const formatarTodasAssistencias = (sinistro: SinistroDetalhes) => {
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
        .filter(tipo => tipo) // Remover valores vazios
        .map(tipo => formatarTipoAssistencia(tipo))
      assistencias.push(...assistenciasAdicionais)
    }
    
    return assistencias.length > 0 ? assistencias.join(', ') : ''
  }

  const getTipoTexto = (sinistro: SinistroDetalhes) => {
    if (sinistro.tipo_atendimento === 'assistencia') {
      const todasAssistencias = formatarTodasAssistencias(sinistro)
      return todasAssistencias || 'Assistência'
    } else {
      switch (sinistro.tipo_sinistro) {
        case 'colisao': return 'Colisão'
        case 'furto': return 'Furto'
        case 'roubo': return 'Roubo'
        case 'pequenos_reparos': return 'Pequenos Reparos'
        default: return 'Sinistro'
      }
    }
  }

  const getTipoIcon = (sinistro: SinistroDetalhes) => {
    if (sinistro.tipo_atendimento === 'assistencia') {
      return <Wrench className="w-5 h-5 text-purple-600" />
    } else {
      switch (sinistro.tipo_sinistro) {
        case 'colisao': return <Car className="w-5 h-5 text-red-600" />
        case 'furto': case 'roubo': return <Shield className="w-5 h-5 text-orange-600" />
        case 'pequenos_reparos': return <Wrench className="w-5 h-5 text-green-600" />
        default: return <FileText className="w-5 h-5 text-gray-600" />
      }
    }
  }

  const formatCPF = (cpf: string) => {
    if (!cpf) return 'Não informado'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPlaca = (placa: string) => {
    if (!placa) return 'Não informado'
    return placa.toUpperCase()
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Não informado'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('adminLogado')
    router.push('/')
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando detalhes do sinistro...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={loadSinistroDetails} className="w-full">
                Tentar novamente
              </Button>
              <Link href="/admin/dashboard">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!sinistro) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Sinistro não encontrado</h3>
            <p className="text-gray-600 mb-4">O sinistro solicitado não foi encontrado.</p>
            <Link href="/admin/dashboard">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'}`}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className={`hover:bg-opacity-20 transition-all duration-300 ${isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image
                  src="/images/logo.png"
                  alt="PV Auto Proteção"
                  width={56}
                  height={56}
                  className="object-contain rounded-full"
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  PV Auto Proteção
                </h1>
                <p className={`text-xs md:text-sm transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  Detalhes do Sinistro - Admin
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`hover:bg-opacity-20 transition-all duration-300 ${isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={`hover:bg-opacity-20 transition-all duration-300 ${isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Título e Status */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            {getTipoIcon(sinistro)}
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {sinistro.numero_sinistro}
            </h1>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge className={`px-3 py-1 ${getStatusColor(sinistro.status)} border`}>
              <div className="flex items-center gap-2">
                {getStatusIcon(sinistro.status)}
                <span className="font-medium">
                  {sinistro.status === 'concluido' ? 'Concluído' :
                   sinistro.status === 'aprovado' ? 'Aprovado' :
                   sinistro.status === 'em_analise' ? 'Em Análise' :
                   sinistro.status === 'rejeitado' ? 'Rejeitado' :
                   sinistro.status}
                </span>
              </div>
            </Badge>
            <Badge variant="outline">
              {getTipoTexto(sinistro)}
            </Badge>
            <Badge variant="outline">
              <Calendar className="w-3 h-3 mr-1" />
              {formatDate(sinistro.data_criacao)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Informações Gerais */}
          <Card className={`border-0 shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <Info className="w-5 h-5 text-blue-600" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nome do Cliente</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.cnh_proprio_nome || sinistro.nome_completo_furto || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>CPF do Cliente</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatCPF(sinistro.cnh_proprio_cpf || sinistro.cpf_furto || '')}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tipo Atendimento</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.tipo_atendimento === 'assistencia' ? 'Assistência' : 'Sinistro'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.status === 'concluido' ? 'Concluído' :
                     sinistro.status === 'aprovado' ? 'Aprovado' :
                     sinistro.status === 'em_analise' ? 'Em Análise' :
                     sinistro.status === 'rejeitado' ? 'Rejeitado' :
                     sinistro.status}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Data Criação</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatDate(sinistro.data_criacao)}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Última Atualização</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatDate(sinistro.data_atualizacao)}
                  </p>
                </div>
              </div>

              {/* Informações específicas do tipo */}
              {sinistro.tipo_atendimento === 'assistencia' && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-800 dark:text-purple-300">
                      {sinistro.assistencia_adicional ? 'Assistências Solicitadas' : 'Tipo de Assistência'}
                    </h4>
                    {sinistro.assistencia_adicional && (
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                        {sinistro.total_assistencias || 0} assistências
                      </span>
                    )}
                  </div>
                  <div className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatarTodasAssistencias(sinistro) || 'Não especificado'}
                  </div>
                  {sinistro.assistencia_adicional && (
                    <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
                      ✓ Cliente solicitou assistências adicionais no mesmo chamado
                    </div>
                  )}
                </div>
              )}

              {sinistro.tipo_atendimento === 'sinistro' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tipo de Sinistro</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.tipo_sinistro === 'colisao' ? 'Colisão' :
                         sinistro.tipo_sinistro === 'furto' ? 'Furto' :
                         sinistro.tipo_sinistro === 'roubo' ? 'Roubo' :
                         sinistro.tipo_sinistro === 'pequenos_reparos' ? 'Pequenos Reparos' :
                         sinistro.tipo_sinistro || 'Não especificado'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Outros Veículos</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.outros_veiculos_envolvidos ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Documentos Furtados</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.documentos_furtados ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>

                  {(sinistro.tipo_sinistro === 'furto' || sinistro.tipo_sinistro === 'roubo') && (
                    <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <h4 className="font-medium text-orange-800 dark:text-orange-300">Dados do Furto/Roubo</h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nome Completo</label>
                          <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                            {sinistro.nome_completo_furto || 'Não informado'}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>CPF</label>
                            <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {formatCPF(sinistro.cpf_furto || '')}
                            </p>
                          </div>
                          <div>
                            <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Placa do Veículo</label>
                            <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                              {formatPlaca(sinistro.placa_veiculo_furto || '')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Resumo de Documentos */}
          <Card className={`border-0 shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <FileText className="w-5 h-5 text-green-600" />
                Resumo de Documentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Camera className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-600">{sinistro.total_arquivos || 0}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Arquivos</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <Car className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{sinistro.fotos_veiculo || 0}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Fotos Veículo</p>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <CreditCard className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{sinistro.total_dados_cnh || 0}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>CNH Registradas</p>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{sinistro.total_dados_crlv || 0}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>CRLV Registrados</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dados do Solicitante (CNH Próprio) */}
        {sinistro.cnh_proprio_nome && (
          <Card className={`border-0 shadow-lg transition-all duration-300 mb-6 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <User className="w-5 h-5 text-blue-600" />
                Dados do Solicitante (CNH)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nome Completo</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.cnh_proprio_nome}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>CPF</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatCPF(sinistro.cnh_proprio_cpf || '')}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>RG</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.cnh_proprio_rg || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Categoria</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.cnh_proprio_categoria || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Número CNH</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.cnh_proprio_numero || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Validade</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.cnh_proprio_validade ? 
                      new Date(sinistro.cnh_proprio_validade).toLocaleDateString('pt-BR') : 
                      'Não informado'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados do Veículo (CRLV Próprio) */}
        {sinistro.crlv_proprio_marca && (
          <Card className={`border-0 shadow-lg transition-all duration-300 mb-6 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <Car className="w-5 h-5 text-green-600" />
                Dados do Veículo (CRLV)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Marca</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.crlv_proprio_marca}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Modelo</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.crlv_proprio_modelo || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ano</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.crlv_proprio_ano || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cor</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.crlv_proprio_cor || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Combustível</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.crlv_proprio_combustivel || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Placa</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatPlaca(sinistro.crlv_proprio_placa || '')}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>RENAVAM</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.crlv_proprio_renavam || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chassi</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.crlv_proprio_chassi || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Proprietário</label>
                  <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {sinistro.crlv_proprio_proprietario || 'Não informado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados de Terceiros */}
        {(sinistro.cnh_terceiros_nome || sinistro.crlv_terceiros_marca) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* CNH Terceiros */}
            {sinistro.cnh_terceiros_nome && (
              <Card className={`border-0 shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <Users className="w-5 h-5 text-purple-600" />
                    CNH Terceiros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nome Completo</label>
                    <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {sinistro.cnh_terceiros_nome}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>CPF</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {formatCPF(sinistro.cnh_terceiros_cpf || '')}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>RG</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.cnh_terceiros_rg || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Categoria</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.cnh_terceiros_categoria || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Número CNH</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.cnh_terceiros_numero || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Validade</label>
                    <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {sinistro.cnh_terceiros_validade ? 
                        new Date(sinistro.cnh_terceiros_validade).toLocaleDateString('pt-BR') : 
                        'Não informado'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* CRLV Terceiros */}
            {sinistro.crlv_terceiros_marca && (
              <Card className={`border-0 shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    <Car className="w-5 h-5 text-orange-600" />
                    CRLV Terceiros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Marca</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.crlv_terceiros_marca}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Modelo</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.crlv_terceiros_modelo || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Ano</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.crlv_terceiros_ano || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cor</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.crlv_terceiros_cor || 'Não informado'}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Combustível</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.crlv_terceiros_combustivel || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Placa</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {formatPlaca(sinistro.crlv_terceiros_placa || '')}
                      </p>
                    </div>
                    <div>
                      <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>RENAVAM</label>
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {sinistro.crlv_terceiros_renavam || 'Não informado'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chassi</label>
                    <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {sinistro.crlv_terceiros_chassi || 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Proprietário</label>
                    <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {sinistro.crlv_terceiros_proprietario || 'Não informado'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Ações Admin */}
        <Card className={`border-0 shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              <Settings className="w-5 h-5 text-gray-600" />
              Ações Administrativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar Status
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar Documentos
              </Button>
              <Button variant="outline" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                Contatar Cliente
              </Button>
              <Button variant="outline" size="sm">
                <MoreVertical className="w-4 h-4 mr-2" />
                Mais Opções
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botão Voltar */}
        <div className="mt-8 text-center">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 