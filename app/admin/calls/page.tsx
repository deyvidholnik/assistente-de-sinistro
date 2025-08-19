'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTheme } from 'next-themes'
import { Phone, Clock, Users, Search, Filter, Sun, Moon, RefreshCw, PhoneCall, Timer, BarChart3 } from 'lucide-react'

interface CallRecord {
  id: number
  agent_name: string
  from_number: string
  to_number: string
  start_timestamp: number
  end_timestamp: number
  duration_ms: number
  transcript: string | null
  recording_url: string | null
}

interface CallMetrics {
  totalCalls: number
  totalMinutes: number
  averageMinutes: number
  uniqueAgents: string[]
  callsByAgent: Record<string, number>
}

interface CallsResponse {
  calls: CallRecord[]
  metrics: CallMetrics
  error?: string
}

export default function AdminCallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>([])
  const [metrics, setMetrics] = useState<CallMetrics>({
    totalCalls: 0,
    totalMinutes: 0,
    averageMinutes: 0,
    uniqueAgents: [],
    callsByAgent: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const isDark = theme === 'dark'

  const handleGoBack = () => {
    console.log('🔙 Voltando para dashboard admin...')
    // Usar router.replace para evitar problemas de navegação
    router.replace('/admin/dashboard')
  }

  const loadCalls = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()

      if (searchTerm.trim()) params.set('search', searchTerm.trim())
      if (selectedAgent !== 'all') params.set('agent', selectedAgent)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      const response = await fetch(`/api/calls?${params}`)
      const data: CallsResponse = await response.json()

      if (response.ok) {
        setCalls(data.calls)
        setMetrics(data.metrics)
        setLastUpdate(new Date())
      } else {
        setError(data.error || 'Erro ao carregar chamadas')
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Erro ao carregar chamadas:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCalls()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh chamadas IA...')
      loadCalls()
    }, 3 * 60 * 1000)

    return () => clearInterval(interval)
  }, [searchTerm, selectedAgent, dateFrom, dateTo])

  useEffect(() => {
    if (searchTerm || selectedAgent !== 'all' || dateFrom || dateTo) {
      const timeoutId = setTimeout(() => {
        loadCalls()
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }, [searchTerm, selectedAgent, dateFrom, dateTo])

  const formatDuration = (durationMs: number) => {
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)

    if (minutes > 0) {
      return `${minutes}min ${seconds}s`
    } else {
      return `${seconds}s`
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading && calls.length === 0) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-300 ${
          isDark
            ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
            : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
        }`}
      >
        <div className='text-center'>
          <RefreshCw className='w-8 h-8 animate-spin mx-auto mb-4 text-blue-600' />
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Carregando chamadas IA...</p>
        </div>
      </div>
    )
  }

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
          isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'
        }`}
      >
        <div className='container mx-auto px-4 py-3 md:py-4'>
          <div className='flex items-center justify-between'>
            {/* Botão Voltar - Lado Esquerdo */}
            <Button
              variant='ghost'
              size='sm'
              onClick={handleGoBack}
              className={`hover:bg-opacity-20 transition-all duration-300 ${
                isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
              }`}
            >
              ←
            </Button>

            {/* Logo e Título - Centro */}
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
                <h1 className='text-lg md:text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent'>
                  PV Auto Proteção
                </h1>
                <p
                  className={`text-xs md:text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Admin - Chamadas IA
                </p>
              </div>
            </div>

            {/* Botões - Lado Direito */}
            <div className='flex items-center space-x-2 md:space-x-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`hover:bg-opacity-20 transition-all duration-300 ${
                  isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
              </Button>

              <Button
                variant='ghost'
                size='sm'
                onClick={loadCalls}
                disabled={loading}
                className={`hover:bg-opacity-20 transition-all duration-300 ${
                  isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-6 md:py-8'>
        {/* Título e última atualização */}
        <div className='text-center mb-8 md:mb-12'>
          <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
            Histórico de Chamadas IA
          </h1>
          <p
            className={`text-lg md:text-xl mb-4 transition-colors duration-300 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Monitoramento e análise das chamadas da inteligência artificial
          </p>
          {lastUpdate && (
            <Badge
              variant='outline'
              className={`text-xs ${isDark ? 'border-gray-500 text-gray-300' : 'border-gray-300 text-gray-600'}`}
            >
              <Clock className='w-3 h-3 mr-1' />
              Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
            </Badge>
          )}
        </div>

        {/* Métricas */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8'>
          <Card
            className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}
          >
            <CardContent className='p-4 md:p-6 text-center'>
              <div className='w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4'>
                <PhoneCall className='w-6 h-6 md:w-8 md:h-8 text-white' />
              </div>
              <div className='text-2xl md:text-3xl font-bold mb-1 text-blue-600'>{metrics.totalCalls}</div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Total de Chamadas
              </div>
            </CardContent>
          </Card>

          <Card
            className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-purple-50 to-pink-50'
            }`}
          >
            <CardContent className='p-4 md:p-6 text-center'>
              <div className='w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4'>
                <Timer className='w-6 h-6 md:w-8 md:h-8 text-white' />
              </div>
              <div className='text-2xl md:text-3xl font-bold mb-1 text-purple-600'>{metrics.totalMinutes}</div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Minutos Totais</div>
            </CardContent>
          </Card>

          <Card
            className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-green-50 to-emerald-50'
            }`}
          >
            <CardContent className='p-4 md:p-6 text-center'>
              <div className='w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4'>
                <BarChart3 className='w-6 h-6 md:w-8 md:h-8 text-white' />
              </div>
              <div className='text-2xl md:text-3xl font-bold mb-1 text-green-600'>{metrics.averageMinutes}</div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Média (min)</div>
            </CardContent>
          </Card>

          <Card
            className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
              isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-indigo-50 to-blue-50'
            }`}
          >
            <CardContent className='p-4 md:p-6 text-center'>
              <div className='w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 md:mb-4'>
                <Users className='w-6 h-6 md:w-8 md:h-8 text-white' />
              </div>
              <div className='text-2xl md:text-3xl font-bold mb-1 text-indigo-600'>{metrics.uniqueAgents.length}</div>
              <div className={`text-xs md:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Agentes Ativos</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className={`border-0 shadow-lg mb-8 bg-card/50 `}>
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 text-lg md:text-xl ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
            >
              <Filter className='w-5 h-5' />
              Filtros de Pesquisa
            </CardTitle>
          </CardHeader>
          <CardContent className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <Label
                htmlFor='search'
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Buscar
              </Label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                <Input
                  id='search'
                  placeholder='Agente, números...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10 text-foreground'
                />
              </div>
            </div>

            <div>
              <Label
                htmlFor='agent'
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Agente
              </Label>
              <select
                id='agent'
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className={`w-full px-3 py-3  rounded-md text-sm ${
                  isDark ? 'bg-input border-gray-600 ' : 'bg-input border-gray-300 text-gray-500'
                }`}
              >
                <option value='all'>Todos os agentes</option>
                {metrics.uniqueAgents.map((agent) => (
                  <option
                    key={agent}
                    value={agent}
                  >
                    {agent}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label
                htmlFor='dateFrom'
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Data Inicial
              </Label>
              <Input
                id='dateFrom'
                className='text-muted-foreground'
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label
                htmlFor='dateTo'
                className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
              >
                Data Final
              </Label>
              <Input
                id='dateTo'
                className='text-muted-foreground'
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className='border-red-200 bg-red-50 mb-6'>
            <CardContent className='p-4'>
              <p className='text-red-700 text-center'>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Lista de Chamadas */}
        <Card className={`border-0 shadow-lg ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-white/50'}`}>
          <CardHeader>
            <CardTitle
              className={`flex items-center gap-2 text-lg md:text-xl ${isDark ? 'text-gray-100' : 'text-gray-800'}`}
            >
              <Phone className='w-5 h-5' />
              Histórico de Chamadas ({calls.length})
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {calls.length === 0 ? (
              <div className='text-center py-8'>
                <PhoneCall className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {loading ? 'Carregando chamadas...' : 'Nenhuma chamada encontrada'}
                </p>
              </div>
            ) : (
              calls.map((call) => (
                <Card
                  key={call.id}
                  className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-card-foreground/50 `}
                >
                  <CardContent className='p-4'>
                    <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                      <div>
                        <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Agente:</Label>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{call.agent_name}</p>
                      </div>
                      <div>
                        <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Números:</Label>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {call.from_number} → {call.to_number}
                        </p>
                      </div>
                      <div>
                        <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Duração:</Label>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {formatDuration(call.duration_ms)}
                        </p>
                      </div>
                      <div>
                        <Label className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Data/Hora:</Label>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDate(call.start_timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className='mt-4 flex justify-between items-center'>
                      <div className='flex gap-2'>
                        {call.transcript && (
                          <Badge
                            variant='secondary'
                            className='text-xs'
                          >
                            Transcrição disponível
                          </Badge>
                        )}
                        {call.recording_url && (
                          <Badge
                            variant='secondary'
                            className='text-xs'
                          >
                            Gravação disponível
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => router.push(`/admin/calls/${call.id}`)}
                        className='flex items-center gap-2 text-muted-foreground hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600'
                      >
                        <Phone className='w-4 h-4' />
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
