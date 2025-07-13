"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useTheme } from '@/context/theme-context'
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
  CreditCard,
  Eye
} from 'lucide-react'

interface ClienteData {
  cpf: string
  dataNascimento: string
  loginTime: string
  sinistros?: SinistroCompleto[]
}

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

export default function DashboardClientePage() {
  const [clienteData, setClienteData] = useState<ClienteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [nomeCliente, setNomeCliente] = useState<string>('')
  
  const { darkMode, toggleDarkMode } = useTheme()
  const router = useRouter()

  // Combinar sinistros e assistências em uma lista única, ordenada por data
  const todosRegistros = useMemo(() => {
    if (!clienteData?.sinistros) return []
    
    return [...clienteData.sinistros]
      .sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime())
  }, [clienteData?.sinistros])

  const sinistros = todosRegistros.filter((s: SinistroCompleto) => s.tipo_atendimento === 'sinistro')
  const assistencias = todosRegistros.filter((s: SinistroCompleto) => s.tipo_atendimento === 'assistencia')

  const carregarDados = async () => {
    const dadosCliente = localStorage.getItem('clienteLogado')
    if (!dadosCliente) {
      router.push('/login_cliente')
      return
    }

    const dadosParseados = JSON.parse(dadosCliente)
    setClienteData(dadosParseados)
    
    // Extrair nome do primeiro sinistro/assistência
    if (dadosParseados.sinistros && dadosParseados.sinistros.length > 0) {
      const primeiroRegistro = dadosParseados.sinistros[0]
      setNomeCliente(primeiroRegistro.cnh_proprio_nome || 'Cliente')
    }
    
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
      carregarDados()
    }, 5 * 60 * 1000) // 5 minutos

    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('clienteLogado')
    router.push('/')
  }

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

  const getTipoIcon = (sinistro: SinistroCompleto) => {
    if (sinistro.tipo_atendimento === 'sinistro') {
      switch (sinistro.tipo_sinistro) {
        case 'colisao':
          return <Car className="w-4 h-4" />
        case 'furto':
        case 'roubo':
          return <Shield className="w-4 h-4" />
        case 'pequenos_reparos':
          return <Wrench className="w-4 h-4" />
        default:
          return <FileText className="w-4 h-4" />
      }
    } else {
      switch (sinistro.tipo_assistencia) {
        case 'guincho':
          return <Car className="w-4 h-4" />
        case 'pane_mecanica':
        case 'pane_eletrica':
        case 'trocar_pneu':
        case 'pane_seca':
          return <Wrench className="w-4 h-4" />
        case 'hotel':
          return <MapPin className="w-4 h-4" />
        case 'taxi':
          return <Car className="w-4 h-4" />
        default:
          return <FileText className="w-4 h-4" />
      }
    }
  }

  const getTipoTexto = (sinistro: SinistroCompleto) => {
    if (sinistro.tipo_atendimento === 'sinistro') {
      return sinistro.tipo_sinistro ? sinistro.tipo_sinistro.charAt(0).toUpperCase() + sinistro.tipo_sinistro.slice(1) : 'Sinistro'
    } else {
      return sinistro.tipo_assistencia ? sinistro.tipo_assistencia.charAt(0).toUpperCase() + sinistro.tipo_assistencia.slice(1).replace('_', ' ') : 'Assistência'
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mb-4"></div>
          <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Carregando...
          </p>
        </div>
      </div>
    )
  }

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
                  Área do Cliente
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
              <Button
                variant="ghost"
                onClick={handleLogout}
                className={`hover:bg-opacity-20 transition-all duration-300 ${darkMode ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                Bem-vindo, {nomeCliente}!
              </h1>
              <p className={`text-sm md:text-base transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                CPF: {clienteData?.cpf} • Último acesso: {clienteData?.loginTime ? new Date(clienteData.loginTime).toLocaleString('pt-BR') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className={`border-0 shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Sinistros
                  </p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {sinistros.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`border-0 shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Assistências
                  </p>
                  <p className={`text-2xl font-bold transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                    {assistencias.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista Unificada */}
        <div className="mb-6">
          <h2 className={`text-xl md:text-2xl font-bold mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            Histórico de Atendimentos
          </h2>
          <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
            {todosRegistros.length} registros encontrados, ordenados por data mais recente
          </p>
        </div>
          
          <div className="grid gap-4">
            {todosRegistros.map((registro) => {
              const isAssistencia = registro.tipo_atendimento === 'assistencia'
              const iconColor = isAssistencia ? 'from-purple-500 to-pink-500' : 'from-blue-500 to-cyan-500'
              
              return (
                <Card key={registro.id} className={`border-0 shadow-lg transition-all duration-300 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-r ${iconColor} rounded-full flex items-center justify-center`}>
                          {getTipoIcon(registro)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className={`text-lg transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                              {getTipoTexto(registro)}
                            </CardTitle>
                            <Badge variant="outline" className={`text-xs ${isAssistencia ? 'border-purple-300 text-purple-700' : 'border-blue-300 text-blue-700'}`}>
                              {isAssistencia ? 'Assistência' : 'Sinistro'}
                            </Badge>
                          </div>
                          <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {registro.numero_sinistro}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(registro.status)} border`}>
                        {getStatusIcon(registro.status)}
                        <span className="ml-1 capitalize">{registro.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {isAssistencia ? 'Solicitante' : 'Veículo'}
                        </p>
                        <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {isAssistencia 
                            ? registro.cnh_proprio_nome 
                            : `${registro.crlv_proprio_marca} ${registro.crlv_proprio_modelo} ${registro.crlv_proprio_ano} • ${registro.crlv_proprio_placa}`
                          }
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Data de Criação
                        </p>
                        <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          {new Date(registro.data_criacao).toLocaleDateString('pt-BR')} às {new Date(registro.data_criacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className={`text-sm font-medium mb-1 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Status
                      </p>
                      <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {registro.status.replace('_', ' ').charAt(0).toUpperCase() + registro.status.replace('_', ' ').slice(1)}
                      </p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Link href={`/dashboard_cliente/detalhes/${registro.id}`}>
                        <Button variant="outline" size="sm" className={`transition-all duration-300 ${darkMode ? 'border-gray-500 text-gray-300 hover:bg-gray-700/50' : ''}`}>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
      </div>
    </div>
  )
} 