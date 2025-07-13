"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from '@/context/theme-context'
import { 
  Shield, 
  ArrowLeft, 
  Sun, 
  Moon, 
  User, 
  Car, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MapPin,
  Calendar,
  Phone,
  Mail
} from 'lucide-react'

interface SinistroCompleto {
  id: string
  numero_sinistro: string
  tipo_atendimento: 'sinistro' | 'assistencia'
  tipo_sinistro?: 'colisao' | 'furto' | 'roubo' | 'pequenos_reparos'
  tipo_assistencia?: 'hotel' | 'guincho' | 'taxi' | 'pane_seca' | 'pane_mecanica' | 'pane_eletrica' | 'trocar_pneu'
  status: 'pendente' | 'em_analise' | 'aprovado' | 'rejeitado' | 'concluido'
  data_criacao: string
  data_atualizacao: string
  cnh_proprio_nome: string
  cnh_proprio_cpf: string
  crlv_proprio_placa: string
  crlv_proprio_marca: string
  crlv_proprio_modelo: string
  crlv_proprio_ano: number
  total_fotos: number
  total_arquivos: number
}

export default function DetalhesPage() {
  const [registro, setRegistro] = useState<SinistroCompleto | null>(null)
  const [loading, setLoading] = useState(true)
  
  const { darkMode, toggleDarkMode } = useTheme()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    const dadosCliente = localStorage.getItem('clienteLogado')
    if (!dadosCliente) {
      router.push('/login_cliente')
      return
    }

    const dadosParseados = JSON.parse(dadosCliente)
    if (dadosParseados.sinistros) {
      const registroEncontrado = dadosParseados.sinistros.find((s: SinistroCompleto) => s.id === id)
      setRegistro(registroEncontrado || null)
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
        return <CheckCircle className="w-4 h-4" />
      case 'em_analise':
        return <Clock className="w-4 h-4" />
      case 'pendente':
        return <AlertCircle className="w-4 h-4" />
      case 'rejeitado':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getTipoTexto = (registro: SinistroCompleto) => {
    if (registro.tipo_atendimento === 'sinistro') {
      return registro.tipo_sinistro ? registro.tipo_sinistro.charAt(0).toUpperCase() + registro.tipo_sinistro.slice(1) : 'Sinistro'
    } else {
      return registro.tipo_assistencia ? registro.tipo_assistencia.charAt(0).toUpperCase() + registro.tipo_assistencia.slice(1).replace('_', ' ') : 'Assistência'
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando detalhes...
          </p>
        </div>
      </div>
    )
  }

  if (!registro) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Registro não encontrado
          </h1>
          <p className={`mb-6 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            O registro solicitado não foi encontrado.
          </p>
          <Link href="/dashboard_cliente">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isAssistencia = registro.tipo_atendimento === 'assistencia'

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'}`}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image
                  src="/images/logo.png"
                  alt="PV Auto Proteção"
                  width={56}
                  height={56}
                  className="object-contain rounded-full"
                />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                  PV Auto Proteção
                </h1>
                <p className={`text-xs md:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Detalhes do Atendimento
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className={`hover:bg-opacity-20 transition-all duration-300 ${darkMode ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Link href="/dashboard_cliente">
                <Button variant="ghost" className={`hover:bg-opacity-20 transition-all duration-300 ${darkMode ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Cabeçalho do Registro */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-r ${isAssistencia ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'} rounded-full flex items-center justify-center`}>
                {isAssistencia ? <Phone className="w-8 h-8 text-white" /> : <Car className="w-8 h-8 text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {getTipoTexto(registro)}
                  </h1>
                  <Badge variant="outline" className={`${isAssistencia ? 'border-purple-300 text-purple-700' : 'border-blue-300 text-blue-700'}`}>
                    {isAssistencia ? 'Assistência' : 'Sinistro'}
                  </Badge>
                </div>
                <p className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {registro.numero_sinistro}
                </p>
              </div>
            </div>
            <Badge className={`${getStatusColor(registro.status)} border px-3 py-1`}>
              {getStatusIcon(registro.status)}
              <span className="ml-2 capitalize font-medium">{registro.status.replace('_', ' ')}</span>
            </Badge>
          </div>
        </div>

        {/* Cards de Informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Informações Gerais */}
          <Card className={`border-0 shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                <FileText className="w-5 h-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Número do Registro
                  </p>
                  <p className={`text-sm font-mono transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {registro.numero_sinistro}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Tipo de Atendimento
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {getTipoTexto(registro)}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Data de Abertura
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {new Date(registro.data_criacao).toLocaleDateString('pt-BR')} às {new Date(registro.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Última Atualização
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {new Date(registro.data_atualizacao).toLocaleDateString('pt-BR')} às {new Date(registro.data_atualizacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dados do Solicitante */}
          <Card className={`border-0 shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                <User className="w-5 h-5" />
                Dados do Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Nome Completo
                </p>
                <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {registro.cnh_proprio_nome}
                </p>
              </div>
              <div>
                <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  CPF
                </p>
                <p className={`text-sm font-mono transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {registro.cnh_proprio_cpf}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dados do Veículo (apenas para sinistros) */}
        {!isAssistencia && (
          <Card className={`border-0 shadow-lg mb-8 transition-all duration-300 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                <Car className="w-5 h-5" />
                Dados do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Placa
                  </p>
                  <p className={`text-sm font-mono transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {registro.crlv_proprio_placa}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Marca
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {registro.crlv_proprio_marca}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Modelo
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {registro.crlv_proprio_modelo}
                  </p>
                </div>
                <div>
                  <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Ano
                  </p>
                  <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {registro.crlv_proprio_ano}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Arquivos e Fotos */}
        <Card className={`border-0 shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <FileText className="w-5 h-5" />
              Documentação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Total de Arquivos
                </p>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className={`text-lg font-semibold transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {registro.total_arquivos}
                  </span>
                  <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    arquivo(s)
                  </span>
                </div>
              </div>
              <div>
                <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Fotos do Veículo
                </p>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span className={`text-lg font-semibold transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {registro.total_fotos}
                  </span>
                  <span className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    foto(s)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 