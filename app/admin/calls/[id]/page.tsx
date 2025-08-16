"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { 
  ArrowLeft, 
  Phone, 
  Clock, 
  Calendar,
  Play,
  Pause,
  Volume2,
  FileText,
  User,
  PhoneCall,
  Timer,
  Download,
  Copy,
  CheckCircle
} from 'lucide-react'

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

export default function CallDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const audioRef = useRef<HTMLAudioElement>(null)
  
  const [call, setCall] = useState<CallRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCallDetails(params.id as string)
    }
  }, [params.id])

  const fetchCallDetails = async (callId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/calls?id=${callId}`)
      
      if (!response.ok) {
        throw new Error('Falha ao carregar detalhes da chamada')
      }
      
      const data = await response.json()
      
      if (data.calls && data.calls.length > 0) {
        setCall(data.calls[0])
      } else {
        setError('Chamada não encontrada')
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes da chamada:', error)
      setError('Erro ao carregar detalhes da chamada')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const formatDuration = (durationMs: number) => {
    const seconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
  }

  const copyTranscript = async () => {
    if (call?.transcript) {
      try {
        await navigator.clipboard.writeText(call.transcript)
        setCopySuccess(true)
        setTimeout(() => setCopySuccess(false), 2000)
      } catch (err) {
        console.error('Erro ao copiar transcrição:', err)
      }
    }
  }

  const downloadAudio = () => {
    if (call?.recording_url) {
      const link = document.createElement('a')
      link.href = call.recording_url
      link.download = `chamada-${call.id}-${call.agent_name}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-6`}></div>
            <div className={`h-64 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !call) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/calls')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-8 text-center">
              <PhoneCall className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <p className="text-red-700 text-lg">{error || 'Chamada não encontrada'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/calls')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            Detalhes da Chamada #{call.id}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informações da Chamada */}
          <Card className={`border-0 shadow-lg ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                <Phone className="w-5 h-5" />
                Informações da Chamada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Agente
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-blue-500" />
                    <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {call.agent_name}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Duração
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Timer className="w-4 h-4 text-green-500" />
                    <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {formatDuration(call.duration_ms)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Número de Origem
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <PhoneCall className="w-4 h-4 text-purple-500" />
                    <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {call.from_number}
                    </span>
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Número de Destino
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <PhoneCall className="w-4 h-4 text-orange-500" />
                    <span className={`font-mono ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {call.to_number}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Data e Hora
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className={`${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    {formatDate(call.start_timestamp)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {call.transcript && (
                  <Badge variant="secondary" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Transcrição disponível
                  </Badge>
                )}
                {call.recording_url && (
                  <Badge variant="secondary" className="text-xs">
                    <Volume2 className="w-3 h-3 mr-1" />
                    Gravação disponível
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Player de Áudio */}
          {call.recording_url && (
            <Card className={`border-0 shadow-lg ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50'}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    <Volume2 className="w-5 h-5" />
                    Gravação da Chamada
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAudio}
                    className="flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <audio
                  ref={audioRef}
                  src={call.recording_url}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={() => setIsPlaying(false)}
                  preload="metadata"
                />

                {/* Controles de Reprodução */}
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={togglePlayPause}
                    className="flex  items-center gap-2"
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                    {isPlaying ? 'Pausar' : 'Reproduzir'}
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTime(currentTime)}
                      </span>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {formatTime(duration)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Controle de Volume */}
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Transcrição Completa */}
        {call.transcript && (
          <Card className={`mt-6 border-0 shadow-lg ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className={`flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  <FileText className="w-5 h-5" />
                  Transcrição Completa
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyTranscript}
                  className="flex items-center gap-1"
                >
                  {copySuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className={`p-6 rounded-lg border-2 border-dashed ${isDark ? 'bg-gray-900/50 border-gray-600 text-gray-200' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
                <p className="whitespace-pre-wrap leading-relaxed text-sm">
                  {call.transcript}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Se não há transcrição nem gravação */}
        {!call.transcript && !call.recording_url && (
          <Card className={`mt-6 border-0 shadow-lg ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/50'}`}>
            <CardContent className="p-8 text-center">
              <PhoneCall className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Nenhuma transcrição ou gravação disponível para esta chamada
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 