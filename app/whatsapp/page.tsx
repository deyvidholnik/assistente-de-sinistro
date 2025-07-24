"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAdminAuth } from '@/context/admin-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  ArrowLeft,
  Loader2
} from 'lucide-react'

interface ContatoWhatsApp {
  id: number
  name: string
  fone: string
  foto_url: string
  created_at: string
  ultimaMensagem: {
    type: string
    content: string
    created_at: string
  } | null
  mensagensNaoLidas?: number
}

// Componente Avatar com fotos reais + fallback colorido
function AvatarContato({ nome, fotoUrl }: { nome: string, fotoUrl?: string }) {
  const [imagemFalhou, setImagemFalhou] = useState(false)
  const iniciais = nome.substring(0, 2).toUpperCase()
  
  // Cores baseadas no primeiro caractere do nome
  const cores = {
    'A': 'from-red-500 to-red-600', 'B': 'from-blue-500 to-blue-600', 
    'C': 'from-green-500 to-green-600', 'D': 'from-purple-500 to-purple-600',
    'E': 'from-yellow-500 to-yellow-600', 'F': 'from-pink-500 to-pink-600',
    'G': 'from-indigo-500 to-indigo-600', 'H': 'from-orange-500 to-orange-600',
    'I': 'from-teal-500 to-teal-600', 'J': 'from-cyan-500 to-cyan-600',
    'K': 'from-emerald-500 to-emerald-600', 'L': 'from-lime-500 to-lime-600',
    'M': 'from-amber-500 to-amber-600', 'N': 'from-rose-500 to-rose-600',
    'O': 'from-violet-500 to-violet-600', 'P': 'from-fuchsia-500 to-fuchsia-600',
    'Q': 'from-sky-500 to-sky-600', 'R': 'from-red-400 to-red-500',
    'S': 'from-blue-400 to-blue-500', 'T': 'from-green-400 to-green-500',
    'U': 'from-purple-400 to-purple-500', 'V': 'from-yellow-400 to-yellow-500',
    'W': 'from-pink-400 to-pink-500', 'X': 'from-indigo-400 to-indigo-500',
    'Y': 'from-orange-400 to-orange-500', 'Z': 'from-teal-400 to-teal-500'
  }

  const primeiraLetra = iniciais[0] as keyof typeof cores
  const corGradiente = cores[primeiraLetra] || 'from-gray-500 to-gray-600'

  const temFoto = fotoUrl && fotoUrl !== 'NENHUMA' && !imagemFalhou

  return (
    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
      {temFoto ? (
        <img
          src={fotoUrl}
          alt={nome}
          className="w-full h-full object-cover"
          onLoad={() => {
            console.log(`✅ Foto carregada: ${nome}`)
          }}
          onError={() => {
            console.log(`❌ Erro na foto de ${nome}, usando fallback`)
            setImagemFalhou(true)
          }}
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-br ${corGradiente} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
          {iniciais}
        </div>
      )}
    </div>
  )
}

interface ContatosResponse {
  contatos: ContatoWhatsApp[]
  total: number
  error?: string
}

export default function AdminWhatsAppPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading: authLoading, isAuthenticated } = useAdminAuth()
  
  // Capturar página de origem
  const fromPage = searchParams.get('from')
  
  // Log para debug
  console.log('📱 WhatsApp page loaded - fromPage:', fromPage)
  
  const [contatos, setContatos] = useState<ContatoWhatsApp[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [previousContatos, setPreviousContatos] = useState<ContatoWhatsApp[]>([])
  const [conversasVisualizadas, setConversasVisualizadas] = useState<{[key: number]: string}>(() => {
    // Carregar do localStorage na inicialização
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('whatsapp_conversas_visualizadas')
      return saved ? JSON.parse(saved) : {}
    }
    return {}
  })

  // Função para buscar count de mensagens não lidas de um contato
  const getUnreadCount = async (fone: string, ultimaVisualizacao?: string): Promise<number> => {
    try {
      const response = await fetch(`/api/whatsapp/mensagens?fone=${fone}`)
      const data = await response.json()
      
      if (!response.ok || !data.mensagens) return 0
      
      // Se não há timestamp de visualização, contar mensagens recentes (últimas 2 horas)
      if (!ultimaVisualizacao) {
        const duasHorasAtras = new Date(Date.now() - 2 * 60 * 60 * 1000)
        return data.mensagens.filter((msg: any) => 
          msg.type === 'client' && 
          new Date(msg.created_at) > duasHorasAtras
        ).length
      }
      
      // Contar mensagens recebidas após a última visualização
      const dataVisualizacao = new Date(ultimaVisualizacao)
      const naoLidas = data.mensagens.filter((msg: any) => 
        msg.type === 'client' && 
        new Date(msg.created_at) > dataVisualizacao
      ).length
      
      console.log('📊 Count não lidas para', fone, ':', naoLidas, '(após', ultimaVisualizacao, ')')
      return naoLidas
      
    } catch (error) {
      console.error('❌ Erro ao buscar count de mensagens:', error)
      return 0
    }
  }

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    console.log('🔔 Nova mensagem WhatsApp - tocando notificação')
    
    // Feedback visual
    document.title = '🔔 Nova Mensagem - WhatsApp'
    document.body.style.backgroundColor = '#ff0000'
    
    // Reset visual após 3s
    setTimeout(() => {
      document.body.style.backgroundColor = ''
      document.title = 'WhatsApp Admin'
    }, 3000)
    
    // Tocar som
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      if (ctx.state === 'suspended') {
        ctx.resume()
      }
      
      // Campainha dupla
      const playBeep = (freq: number, delay: number) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0, ctx.currentTime + delay)
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + delay + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.2)
        
        osc.start(ctx.currentTime + delay)
        osc.stop(ctx.currentTime + delay + 0.2)
      }
      
      playBeep(1200, 0)     // Primeiro beep
      playBeep(1000, 0.3)   // Segundo beep
      
    } catch (e) {
      console.warn('Não foi possível tocar som de notificação:', e)
    }
  }

  // Verificar autenticação
  useEffect(() => {
    // Se ainda está carregando, aguardar
    if (authLoading) return

    // Se não está autenticado, redirecionar para login
    if (!isAuthenticated) {
      console.log('🚪 Usuário não autenticado no WhatsApp, redirecionando para login')
      router.replace('/admin/login')
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    // Só carregar dados se estiver autenticado
    if (!authLoading && !isAuthenticated) {
      return
    }

    // Ativar contexto de áudio na primeira interação
    const enableAudio = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        if (audioContext.state === 'suspended') {
          audioContext.resume()
          console.log('🔊 Contexto de áudio ativado')
        }
      } catch (error) {
        console.warn('⚠️ Erro ao ativar áudio:', error)
      }
    }

    // Adicionar listeners para ativar áudio
    document.addEventListener('click', enableAudio, { once: true })
    document.addEventListener('keydown', enableAudio, { once: true })

    loadContatos()

    // Auto-refresh a cada 5 segundos
    const interval = setInterval(() => {
      if (!isFirstLoad) {
        console.log('🔄 Auto-atualizando contatos WhatsApp...')
      }
      loadContatos()
    }, 5000) // 5 segundos

    return () => {
      clearInterval(interval)
      document.removeEventListener('click', enableAudio)
      document.removeEventListener('keydown', enableAudio)
    }
  }, [router])

  const loadContatos = async () => {
    try {
      setError(null)
      // Só mostrar loading no primeiro carregamento
      if (isFirstLoad) {
        setLoading(true)
      }
      
      const response = await fetch('/api/whatsapp')
      const data: ContatosResponse = await response.json()

      if (response.ok) {
        if (isFirstLoad) {
          console.log('✅ Carregando contatos WhatsApp...')
        }
        
        // Ordenar contatos pela data da última mensagem (mais recente primeiro)
        const contatosOrdenados = [...data.contatos].sort((a, b) => {
          const dataA = a.ultimaMensagem?.created_at || a.created_at
          const dataB = b.ultimaMensagem?.created_at || b.created_at
          return new Date(dataB).getTime() - new Date(dataA).getTime()
        })
        
        // DETECTAR NOVA MENSAGEM
        let hasNewMessages = false
        
        if (!isFirstLoad && previousContatos.length > 0) {
          // Para cada contato, verificar mudanças
          contatosOrdenados.forEach(contato => {
            const anterior = previousContatos.find(p => p.id === contato.id)
            
            if (!anterior) return
            
            // Comparar última mensagem
            const msgAtual = contato.ultimaMensagem
            const msgAnterior = anterior.ultimaMensagem
            
            // Se mudou a data da última mensagem e é mensagem recebida
            if (msgAtual?.created_at !== msgAnterior?.created_at && msgAtual?.type === 'client') {
              console.log('🚨 Nova mensagem WhatsApp de:', contato.name)
              hasNewMessages = true
              
              // Tocar som e mostrar notificação
              playNotificationSound()
            }
          })
        }
        
        // CALCULAR BADGES
        const contatosComBadge = contatosOrdenados.map(contato => {
          // Se tem mensagem recebida recente
          if (contato.ultimaMensagem?.type === 'client') {
            const agora = new Date()
            const msgData = new Date(contato.ultimaMensagem.created_at)
            const minutosAtras = Math.floor((agora.getTime() - msgData.getTime()) / (1000 * 60))
            
            // Se mensagem é recente (últimas 4 horas)
            if (minutosAtras < 240) {
              // Verificar se foi visualizada
              const visualizada = conversasVisualizadas[contato.id]
              if (visualizada) {
                const dataVisu = new Date(visualizada)
                if (dataVisu > msgData) {
                  return { ...contato, mensagensNaoLidas: undefined }
                }
              }
              
              // Calcular badge baseado no tempo (1-9)
              const badge = Math.max(1, Math.min(Math.floor(minutosAtras / 30) + 1, 9))
              return { ...contato, mensagensNaoLidas: badge }
            }
          }
          
          return { ...contato, mensagensNaoLidas: undefined }
        })
        
        // Salvar estado anterior para próxima comparação
        setPreviousContatos(contatosComBadge)
        
        setContatos(contatosComBadge)
        setLastUpdate(new Date())
        if (isFirstLoad) {
          console.log('✅ Contatos carregados:', contatosComBadge.length)
        }
      } else {
        setError(data.error || 'Erro ao carregar contatos')
      }
    } catch (err) {
      setError('Erro de conexão')
      console.error('Erro ao carregar contatos:', err)
    } finally {
      // Só alterar loading no primeiro carregamento
      if (isFirstLoad) {
        setLoading(false)
        setIsFirstLoad(false)
      }
    }
  }

  const handleGoBack = () => {
    console.log('🔄 WhatsApp handleGoBack - fromPage:', fromPage)
    switch (fromPage) {
      case 'gerente':
        console.log('🏢 Redirecionando para /gerente')
        router.replace('/gerente')
        break
      case 'dashboard':
        console.log('📊 Redirecionando para /admin/dashboard')
        router.replace('/admin/dashboard')
        break
      default:
        console.log('⬅️ Usando router.back() - fromPage:', fromPage)
        router.back()
    }
  }

  const formatarTempo = (timestamp: string) => {
    if (!timestamp) return ''
    
    const data = new Date(timestamp)
    const agora = new Date()
    
    // Calcular diferença em dias de forma mais precisa
    const dataInicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const dataMensagem = new Date(data.getFullYear(), data.getMonth(), data.getDate())
    const diffDias = Math.floor((dataInicio.getTime() - dataMensagem.getTime()) / (1000 * 60 * 60 * 24))
    
    // Se for hoje, mostrar horário
    if (diffDias === 0) {
      const diffMinutos = Math.floor((agora.getTime() - data.getTime()) / (1000 * 60))
      if (diffMinutos < 1) return 'agora'
      if (diffMinutos < 60) return `${diffMinutos}min`
      return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`
    }
    
    // Se for ontem
    if (diffDias === 1) return 'ontem'
    
    // Se for esta semana (2-7 dias atrás), mostrar dia da semana
    if (diffDias >= 2 && diffDias <= 7) {
      return ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'][data.getDay()]
    }
    
    // Se for mais antigo (mais de uma semana), mostrar data no formato dd/MM/yy
    const dia = String(data.getDate()).padStart(2, '0')
    const mes = String(data.getMonth() + 1).padStart(2, '0')
    const ano = String(data.getFullYear()).slice(-2) // Últimos 2 dígitos do ano
    return `${dia}/${mes}/${ano}`
  }

  const truncateMessage = (message: string, maxLength: number = 150) => {
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
  }

  const filteredContatos = contatos.filter(contato =>
    contato.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contato.fone.includes(searchTerm) ||
    (contato.ultimaMensagem?.content.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center">
      <div className="w-full max-w-[800px]">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-gray-300 hover:text-white hover:bg-gray-700 mr-3"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-medium">WhatsApp Business</h1>
                  
                  {/* Indicador de mensagens não lidas no header */}
                  {contatos.filter(c => (c.mensagensNaoLidas || 0) > 0).length > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 animate-pulse">
                      {contatos.reduce((total, c) => total + (c.mensagensNaoLidas || 0), 0)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-300 hover:text-white"
                onClick={() => {
                  setShowSearch(!showSearch)
                  if (showSearch) {
                    setSearchTerm('') // Limpar pesquisa ao ocultar
                  }
                }}
              >
                <Search className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Campo de Busca - Oculto por padrão */}
          {showSearch && (
            <div className="px-4 pb-4">
              <Input
                placeholder="Pesquisar conversas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          {loading && isFirstLoad ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-green-400" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-400">
              {error}
            </div>
          ) : filteredContatos.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Nenhuma conversa encontrada
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {filteredContatos.map((contato, index) => (
                <div
                  key={contato.id}
                  className="flex items-center p-4 hover:bg-gray-800 cursor-pointer transition-colors"
                  onClick={() => {
                    console.log('👆 Clicando na conversa:', contato.name, '| ID:', contato.id)
                    
                    // Marcar conversa como visualizada permanentemente  
                    setConversasVisualizadas(prev => {
                      const agora = new Date().toISOString()
                      const newObj = {...prev, [contato.id]: agora}
                      console.log('📖 Conversa marcada como visualizada:', contato.name, 'em:', agora)
                      console.log('📖 Lista de visualizadas:', Object.keys(newObj))
                      
                      // Salvar no localStorage
                      localStorage.setItem('whatsapp_conversas_visualizadas', JSON.stringify(newObj))
                      return newObj
                    })
                    
                    // Remover badge imediatamente do estado atual
                    setContatos(prev => prev.map(c => 
                      c.id === contato.id ? { ...c, mensagensNaoLidas: undefined } : c
                    ))
                    
                    router.push(`/whatsapp/conversa?id=${contato.id}&nome=${encodeURIComponent(contato.name)}&fone=${contato.fone}&from=${fromPage || 'whatsapp'}`)
                  }}
                >
                  {/* Avatar com foto real ou fallback colorido */}
                  <div className="relative flex-shrink-0 mr-3">
                    <AvatarContato nome={contato.name} fotoUrl={contato.foto_url} />
                  </div>

                  {/* Conteúdo da Conversa */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-medium truncate text-gray-200">
                        {contato.name}
                      </h3>
                      <div className="flex flex-col items-end space-y-1">
                        {/* Horário da última mensagem da conversa */}
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {contato.ultimaMensagem ? formatarTempo(contato.ultimaMensagem.created_at) : formatarTempo(contato.created_at)}
                        </span>
                        {/* Badge de mensagens não lidas */}
                        {(contato.mensagensNaoLidas || 0) > 0 && (
                          <span className="bg-green-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center animate-pulse">
                            {(contato.mensagensNaoLidas || 0) > 9 ? '9+' : contato.mensagensNaoLidas}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="flex-1 min-w-0">
                        {contato.ultimaMensagem ? (
                          <p className="text-sm truncate text-gray-400">
                            {contato.ultimaMensagem.type === 'received' ? '' : '✓ '}
                            {truncateMessage(contato.ultimaMensagem.content)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            Nenhuma mensagem ainda
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simulação de contatos como na imagem original - se não houver dados reais */}
        {!loading && !error && filteredContatos.length === 0 && !searchTerm && (
          <div className="divide-y divide-gray-700">
            {/* Exemplos de conversas como na imagem */}
            <div className="flex items-center p-4 hover:bg-gray-800 cursor-pointer">
              <div className="relative flex-shrink-0 mr-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
                  CT
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-medium text-white">CT 6.0 [ALUNOS] #6</h3>
                  <span className="text-xs text-gray-400">12:31</span>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-300 truncate">~ Lídia Lucena: 🔴 Live da Análise Semanal! 🔴 Todo D...</p>
                </div>
              </div>
            </div>

            <div className="flex items-center p-4 hover:bg-gray-800 cursor-pointer">
              <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
                <Image src="/placeholder-user.jpg" alt="Família" width={48} height={48} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-medium text-white flex items-center">
                    Família Buscapé Unida 
                    <span className="ml-1">👨‍👩‍👧‍👦❤️</span>
                  </h3>
                  <span className="text-xs text-gray-400">12:29</span>
                </div>
                <div className="flex items-center">
                  <p className="text-sm text-gray-300 truncate">Jane Andreia: Já embarcaram de SP pra bsb</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 