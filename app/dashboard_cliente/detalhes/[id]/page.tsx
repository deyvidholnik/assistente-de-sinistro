'use client'

import { useState, useEffect } from 'react'
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
  MapPin,
  Phone,
  Clock,
  User,
  Eye,
  Download,
  Sun,
  Moon,
  LogOut,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  CreditCard,
  Camera,
  Upload,
  Info,
  Wrench,
} from 'lucide-react'

interface SinistroDetalhes {
  id: string
  numero_sinistro: string
  tipo_atendimento: string
  tipo_sinistro?: string
  tipo_assistencia?: string
  status: string
  data_criacao: string
  data_atualizacao: string
  documentos_furtados?: boolean
  outros_veiculos_envolvidos?: boolean
  nome_completo_furto?: string
  cpf_furto?: string
  placa_veiculo_furto?: string
  cnh_proprio_nome?: string
  cnh_proprio_cpf?: string
  cnh_proprio_rg?: string
  cnh_proprio_categoria?: string
  cnh_proprio_numero?: string
  cnh_proprio_vencimento?: string
  crlv_proprio_placa?: string
  crlv_proprio_marca?: string
  crlv_proprio_modelo?: string
  crlv_proprio_ano?: number
  crlv_proprio_cor?: string
  crlv_proprio_combustivel?: string
  crlv_proprio_renavam?: string
  crlv_proprio_chassi?: string
  crlv_proprio_proprietario?: string
  cnh_terceiros_nome?: string
  cnh_terceiros_cpf?: string
  crlv_terceiro_placa?: string
  crlv_terceiro_marca?: string
  crlv_terceiro_modelo?: string
  total_fotos?: number
  total_arquivos?: number
  assistencia_adicional?: boolean
  assistencias_tipos?: string[] | string
  total_assistencias?: number
}

export default function SinistroDetalhesPage() {
  const [loading, setLoading] = useState(true)
  const [sinistro, setSinistro] = useState<SinistroDetalhes | null>(null)
  const [error, setError] = useState('')

  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const params = useParams()

  const isDark = theme === 'dark'
  const id = params.id as string

  useEffect(() => {
    const dadosCliente = localStorage.getItem('clienteLogado')
    const dadosAdmin = localStorage.getItem('adminLogado')

    // Se não há cliente nem admin logado, redirecionar para login
    if (!dadosCliente && !dadosAdmin) {
      router.push('/login_cliente')
      return
    }

    // Se tem cliente logado, buscar nos dados do cliente
    if (dadosCliente) {
      const dadosParseados = JSON.parse(dadosCliente)
      if (dadosParseados.sinistros) {
        const registroEncontrado = dadosParseados.sinistros.find((s: SinistroDetalhes) => s.id === id)
        setSinistro(registroEncontrado || null)
      }
      setLoading(false)
      return
    }

    // Se é admin, buscar dados do sinistro via API
    if (dadosAdmin) {
      loadSinistroDetails(id)
      return
    }

    setLoading(false)
  }, [id, router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
      case 'aprovado':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'em_analise':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pendente':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'rejeitado':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
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
        return <XCircle className='w-4 h-4' />
      default:
        return <Info className='w-4 h-4' />
    }
  }

  const getTipoTexto = (sinistro: SinistroDetalhes) => {
    if (sinistro.tipo_atendimento === 'assistencia') {
      switch (sinistro.tipo_assistencia) {
        case 'hotel':
          return 'Hospedagem de Emergência'
        case 'guincho':
          return 'Reboque do Veículo'
        case 'taxi':
          return 'Transporte Alternativo'
        case 'pane_seca':
          return 'Pane Seca (Combustível)'
        case 'pane_mecanica':
          return 'Pane Mecânica'
        case 'pane_eletrica':
          return 'Pane Elétrica'
        case 'trocar_pneu':
          return 'Troca de Pneu'
        default:
          return 'Assistência'
      }
    } else {
      switch (sinistro.tipo_sinistro) {
        case 'colisao':
          return 'Colisão'
        case 'furto':
          return 'Furto'
        case 'roubo':
          return 'Roubo'
        case 'pequenos_reparos':
          return 'Pequenos Reparos'
        default:
          return 'Sinistro'
      }
    }
  }

  const getTipoIcon = (sinistro: SinistroDetalhes) => {
    if (sinistro.tipo_atendimento === 'assistencia') {
      switch (sinistro.tipo_assistencia) {
        case 'hotel':
          return <MapPin className='w-4 h-4' />
        case 'guincho':
          return <Car className='w-4 h-4' />
        case 'taxi':
          return <Car className='w-4 h-4' />
        case 'pane_seca':
          return <Wrench className='w-4 h-4' />
        case 'pane_mecanica':
          return <Wrench className='w-4 h-4' />
        case 'pane_eletrica':
          return <Wrench className='w-4 h-4' />
        case 'trocar_pneu':
          return <Wrench className='w-4 h-4' />
        default:
          return <Phone className='w-4 h-4' />
      }
    } else {
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
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const formatPlaca = (placa: string) => {
    if (placa.length === 7) {
      return placa.replace(/(\w{3})(\w{4})/, '$1-$2')
    }
    return placa
  }

  const formatarAssistenciasAdicionais = (sinistro: SinistroDetalhes) => {
    if (!sinistro.assistencias_tipos) return []

    const tipos = Array.isArray(sinistro.assistencias_tipos)
      ? sinistro.assistencias_tipos
      : sinistro.assistencias_tipos.split(',')

    return tipos.map((tipo) => tipo.trim()).filter(Boolean)
  }

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}
      >
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4'></div>
          <p className={`transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando detalhes...
          </p>
        </div>
      </div>
    )
  }

  if (!sinistro) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}
      >
        <div className='text-center'>
          <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h1
            className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
              isDark ? 'text-gray-100' : 'text-gray-900'
            }`}
          >
            Registro não encontrado
          </h1>
          <p className={`mb-6 transition-colors duration-300 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            O registro solicitado não foi encontrado.
          </p>
          <Link href='/dashboard_cliente'>
            <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isAssistencia = sinistro.tipo_atendimento === 'assistencia'

  return (
    <div
      className={`min-h-screen transition-all duration-300 ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}
    >
      {/* Header */}
      <header
        className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${
          isDark ? 'bg-gray-900/80 ' : 'bg-white/80 '
        }`}
      >
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
                <p
                  className={`text-xs md:text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Detalhes do Atendimento
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2 md:space-x-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`hover:bg-opacity-20 transition-all duration-300 ${
                  isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
              </Button>
              <Link href='/dashboard_cliente'>
                <Button
                  variant='ghost'
                  className={`hover:bg-opacity-20 transition-all duration-300 ${
                    isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                  }`}
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-8'>
        {/* Cabeçalho do Registro */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-4'>
              <div
                className={`w-16 h-16 bg-gradient-to-r ${
                  isAssistencia ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'
                } rounded-full flex items-center justify-center`}
              >
                {getTipoIcon(sinistro)}
              </div>
              <div>
                <div className='flex items-center gap-3 mb-2'>
                  <h1
                    className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {getTipoTexto(sinistro)}
                  </h1>
                  <Badge
                    variant='outline'
                    className={`${
                      isAssistencia ? 'border-purple-300 text-purple-700' : 'border-blue-300 text-blue-700'
                    }`}
                  >
                    {isAssistencia ? 'Assistência' : 'Sinistro'}
                  </Badge>
                </div>
                <p
                  className={`text-sm md:text-base transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {sinistro.numero_sinistro}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(sinistro.status)} border px-3 py-1`}>
              {getStatusIcon(sinistro.status)}
              <span className='ml-2 capitalize font-medium'>{sinistro.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>

        {/* Cards de Informações */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Informações Gerais */}
          <Card
            className={`border-0 shadow-lg transition-all duration-300 ${
              isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                <FileText className='w-5 h-5' />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Número do Registro
                  </p>
                  <p
                    className={`text-sm font-mono transition-colors duration-300 ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {sinistro.numero_sinistro}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Tipo de Atendimento
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {getTipoTexto(sinistro)}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Data de Abertura
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {formatDate(sinistro.data_criacao)}
                  </p>
                </div>
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Última Atualização
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {formatDate(sinistro.data_atualizacao)}
                  </p>
                </div>
              </div>

              {/* Informações específicas para furto/roubo */}
              {(sinistro.tipo_sinistro === 'furto' || sinistro.tipo_sinistro === 'roubo') && (
                <div className='border-t pt-4'>
                  <h4
                    className={`font-medium mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    Detalhes do {sinistro.tipo_sinistro === 'furto' ? 'Furto' : 'Roubo'}
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {sinistro.documentos_furtados !== undefined && (
                      <div>
                        <p
                          className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          Documentos Furtados
                        </p>
                        <Badge variant={sinistro.documentos_furtados ? 'destructive' : 'secondary'}>
                          {sinistro.documentos_furtados ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                    )}
                    {sinistro.outros_veiculos_envolvidos !== undefined && (
                      <div>
                        <p
                          className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          Outros Veículos Envolvidos
                        </p>
                        <Badge variant={sinistro.outros_veiculos_envolvidos ? 'default' : 'secondary'}>
                          {sinistro.outros_veiculos_envolvidos ? 'Sim' : 'Não'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Solicitante */}
          <Card
            className={`border-0 shadow-lg transition-all duration-300 ${
              isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                <User className='w-5 h-5' />
                Dados do Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {sinistro.cnh_proprio_nome && (
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Nome Completo
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {sinistro.cnh_proprio_nome}
                  </p>
                </div>
              )}

              {sinistro.cnh_proprio_cpf && (
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    CPF
                  </p>
                  <p
                    className={`text-sm font-mono transition-colors duration-300 ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {formatCPF(sinistro.cnh_proprio_cpf)}
                  </p>
                </div>
              )}

              {sinistro.cnh_proprio_rg && (
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    RG
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {sinistro.cnh_proprio_rg}
                  </p>
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {sinistro.cnh_proprio_categoria && (
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Categoria CNH
                    </p>
                    <p
                      className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      {sinistro.cnh_proprio_categoria}
                    </p>
                  </div>
                )}

                {sinistro.cnh_proprio_numero && (
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Número CNH
                    </p>
                    <p
                      className={`text-sm font-mono transition-colors duration-300 ${
                        isDark ? 'text-gray-100' : 'text-gray-900'
                      }`}
                    >
                      {sinistro.cnh_proprio_numero}
                    </p>
                  </div>
                )}
              </div>

              {sinistro.cnh_proprio_vencimento && (
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Vencimento CNH
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {new Date(sinistro.cnh_proprio_vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              )}

              {/* Dados de furto sem documentos */}
              {(sinistro.nome_completo_furto || sinistro.cpf_furto || sinistro.placa_veiculo_furto) && (
                <div className='border-t pt-4'>
                  <h4
                    className={`font-medium mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    Dados Informados (Furto sem Documentos)
                  </h4>
                  {sinistro.nome_completo_furto && (
                    <div className='mb-2'>
                      <p
                        className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Nome Completo
                      </p>
                      <p
                        className={`text-sm transition-colors duration-300 ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        {sinistro.nome_completo_furto}
                      </p>
                    </div>
                  )}
                  {sinistro.cpf_furto && (
                    <div className='mb-2'>
                      <p
                        className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        CPF
                      </p>
                      <p
                        className={`text-sm font-mono transition-colors duration-300 ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        {formatCPF(sinistro.cpf_furto)}
                      </p>
                    </div>
                  )}
                  {sinistro.placa_veiculo_furto && (
                    <div>
                      <p
                        className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                          isDark ? 'text-gray-300' : 'text-gray-600'
                        }`}
                      >
                        Placa do Veículo
                      </p>
                      <p
                        className={`text-sm font-mono transition-colors duration-300 ${
                          isDark ? 'text-gray-100' : 'text-gray-900'
                        }`}
                      >
                        {formatPlaca(sinistro.placa_veiculo_furto)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Assistências Adicionais */}
        {sinistro.assistencia_adicional &&
          sinistro.assistencias_tipos &&
          formatarAssistenciasAdicionais(sinistro).length > 0 && (
            <Card
              className={`border-0 shadow-lg mb-8 transition-all duration-300 ${
                isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 transition-colors duration-300 ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  <Phone className='w-5 h-5' />
                  Assistências Adicionais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={`text-sm mb-4 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Serviços adicionais solicitados junto com esta ocorrência:
                </p>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
                  {formatarAssistenciasAdicionais(sinistro).map((tipo, index) => {
                    const tipoLimpo = tipo.trim()
                    const assistenciaInfo: { [key: string]: { label: string; icon: string; color: string } } = {
                      guincho: { label: 'Guincho', icon: '🚛', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                      taxi: { label: 'Táxi', icon: '🚕', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                      hotel: { label: 'Hotel', icon: '🏨', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                      mecanica: {
                        label: 'Mecânica',
                        icon: '🔧',
                        color: 'bg-green-100 text-green-800 border-green-200',
                      },
                      vidraceiro: {
                        label: 'Vidraceiro',
                        icon: '🪟',
                        color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                      },
                      borracheiro: {
                        label: 'Borracheiro',
                        icon: '🛞',
                        color: 'bg-orange-100 text-orange-800 border-orange-200',
                      },
                      eletricista: {
                        label: 'Eletricista',
                        icon: '⚡',
                        color: 'bg-red-100 text-red-800 border-red-200',
                      },
                    }
                    const info = assistenciaInfo[tipoLimpo] || {
                      label: tipoLimpo,
                      icon: '🛠️',
                      color: 'bg-gray-100 text-gray-800 border-gray-200',
                    }

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg ${info.color} border shadow-sm`}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='text-lg'>{info.icon}</span>
                          <span className='font-medium text-sm'>{info.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Dados do Veículo (apenas para sinistros com CRLV) */}
        {!isAssistencia && sinistro.crlv_proprio_placa && (
          <Card
            className={`border-0 shadow-lg mb-8 transition-all duration-300 ${
              isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                <Car className='w-5 h-5' />
                Dados do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div>
                  <p
                    className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    Placa
                  </p>
                  <p
                    className={`text-sm font-mono transition-colors duration-300 ${
                      isDark ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    {formatPlaca(sinistro.crlv_proprio_placa)}
                  </p>
                </div>
                {sinistro.crlv_proprio_marca && (
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Marca
                    </p>
                    <p
                      className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      {sinistro.crlv_proprio_marca}
                    </p>
                  </div>
                )}
                {sinistro.crlv_proprio_modelo && (
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Modelo
                    </p>
                    <p
                      className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      {sinistro.crlv_proprio_modelo}
                    </p>
                  </div>
                )}
                {sinistro.crlv_proprio_ano && (
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Ano
                    </p>
                    <p
                      className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      {sinistro.crlv_proprio_ano}
                    </p>
                  </div>
                )}
                {sinistro.crlv_proprio_cor && (
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Cor
                    </p>
                    <p
                      className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      {sinistro.crlv_proprio_cor}
                    </p>
                  </div>
                )}
                {sinistro.crlv_proprio_combustivel && (
                  <div>
                    <p
                      className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      Combustível
                    </p>
                    <p
                      className={`text-sm transition-colors duration-300 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}
                    >
                      {sinistro.crlv_proprio_combustivel}
                    </p>
                  </div>
                )}
              </div>

              {(sinistro.crlv_proprio_renavam ||
                sinistro.crlv_proprio_chassi ||
                sinistro.crlv_proprio_proprietario) && (
                <div className='border-t pt-4 mt-4'>
                  <h4
                    className={`font-medium mb-3 transition-colors duration-300 ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    Informações Adicionais
                  </h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {sinistro.crlv_proprio_renavam && (
                      <div>
                        <p
                          className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          RENAVAM
                        </p>
                        <p
                          className={`text-sm font-mono transition-colors duration-300 ${
                            isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {sinistro.crlv_proprio_renavam}
                        </p>
                      </div>
                    )}
                    {sinistro.crlv_proprio_chassi && (
                      <div>
                        <p
                          className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          Chassi
                        </p>
                        <p
                          className={`text-sm font-mono transition-colors duration-300 ${
                            isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {sinistro.crlv_proprio_chassi}
                        </p>
                      </div>
                    )}
                    {sinistro.crlv_proprio_proprietario && (
                      <div className='md:col-span-2'>
                        <p
                          className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          Proprietário
                        </p>
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {sinistro.crlv_proprio_proprietario}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dados de Terceiros */}
        {(sinistro.cnh_terceiros_nome || sinistro.crlv_terceiro_placa) && (
          <Card
            className={`border-0 shadow-lg mb-8 transition-all duration-300 ${
              isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`flex items-center gap-2 transition-colors duration-300 ${
                  isDark ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                <Users className='w-5 h-5' />
                Dados de Terceiros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* CNH Terceiro */}
                {sinistro.cnh_terceiros_nome && (
                  <div>
                    <h4
                      className={`font-medium mb-3 transition-colors duration-300 ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      Condutor Terceiro
                    </h4>
                    <div className='space-y-3'>
                      <div>
                        <p
                          className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          Nome Completo
                        </p>
                        <p
                          className={`text-sm transition-colors duration-300 ${
                            isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {sinistro.cnh_terceiros_nome}
                        </p>
                      </div>
                      {sinistro.cnh_terceiros_cpf && (
                        <div>
                          <p
                            className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                              isDark ? 'text-gray-300' : 'text-gray-600'
                            }`}
                          >
                            CPF
                          </p>
                          <p
                            className={`text-sm font-mono transition-colors duration-300 ${
                              isDark ? 'text-gray-100' : 'text-gray-900'
                            }`}
                          >
                            {formatCPF(sinistro.cnh_terceiros_cpf)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CRLV Terceiro */}
                {sinistro.crlv_terceiro_placa && (
                  <div>
                    <h4
                      className={`font-medium mb-3 transition-colors duration-300 ${
                        isDark ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      Veículo Terceiro
                    </h4>
                    <div className='space-y-3'>
                      <div>
                        <p
                          className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          Placa
                        </p>
                        <p
                          className={`text-sm font-mono transition-colors duration-300 ${
                            isDark ? 'text-gray-100' : 'text-gray-900'
                          }`}
                        >
                          {formatPlaca(sinistro.crlv_terceiro_placa)}
                        </p>
                      </div>
                      <div className='grid grid-cols-2 gap-3'>
                        {sinistro.crlv_terceiro_marca && (
                          <div>
                            <p
                              className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              Marca
                            </p>
                            <p
                              className={`text-sm transition-colors duration-300 ${
                                isDark ? 'text-gray-100' : 'text-gray-900'
                              }`}
                            >
                              {sinistro.crlv_terceiro_marca}
                            </p>
                          </div>
                        )}
                        {sinistro.crlv_terceiro_modelo && (
                          <div>
                            <p
                              className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                                isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}
                            >
                              Modelo
                            </p>
                            <p
                              className={`text-sm transition-colors duration-300 ${
                                isDark ? 'text-gray-100' : 'text-gray-900'
                              }`}
                            >
                              {sinistro.crlv_terceiro_modelo}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Arquivos e Fotos */}
        <Card
          className={`border-0 shadow-lg transition-all duration-300 ${
            isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'
          }`}
        >
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 transition-colors duration-300 ${
                isDark ? 'text-gray-100' : 'text-gray-900'
              }`}
            >
              <Camera className='w-5 h-5' />
              Documentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center'>
                <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Upload className='w-6 h-6 text-white' />
                </div>
                <p
                  className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Total de Arquivos
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  {sinistro.total_arquivos || 0}
                </p>
              </div>

              <div className='text-center'>
                <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Camera className='w-6 h-6 text-white' />
                </div>
                <p
                  className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Fotos do Veículo
                </p>
                <p
                  className={`text-2xl font-bold transition-colors duration-300 ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  {sinistro.total_fotos || 0}
                </p>
              </div>

              <div className='text-center'>
                <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <CheckCircle className='w-6 h-6 text-white' />
                </div>
                <p
                  className={`text-sm font-medium mb-1 transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Status Atual
                </p>
                <p
                  className={`text-lg font-bold capitalize transition-colors duration-300 ${
                    isDark ? 'text-gray-100' : 'text-gray-900'
                  }`}
                >
                  {sinistro.status.replace('_', ' ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
