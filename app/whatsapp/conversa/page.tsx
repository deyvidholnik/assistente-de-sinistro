"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useAdminAuth } from '@/context/admin-auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft,
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Mic,
  Play,
  Pause,
  Bot,
  User,
  ChevronDown
} from 'lucide-react'

interface Mensagem {
  id: number
  type: 'client' | 'ai' | 'admin' | 'audio'
  content: string
  created_at: string
  is_sent: boolean
}

interface MensagensResponse {
  mensagens: Mensagem[]
  total: number
  error?: string
}

export default function WhatsAppConversaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { loading: authLoading, isAuthenticated } = useAdminAuth()
  
  const contactId = searchParams.get('id')
  const contactName = searchParams.get('nome') || 'Contato'
  const contactPhone = searchParams.get('fone')
  const fromPage = searchParams.get('from')
  
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [novaMensagem, setNovaMensagem] = useState('')
  const [hasInitialLoad, setHasInitialLoad] = useState(true)
  const [showSearch, setShowSearch] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [contactData, setContactData] = useState<any>(null)
  const [isNearBottom, setIsNearBottom] = useState(true)
  const [lastUpdateMessages, setLastUpdateMessages] = useState<Date | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [lastMessageId, setLastMessageId] = useState<number | null>(null)
  const [userScrolledUp, setUserScrolledUp] = useState(false)
  const [hasNewMessages, setHasNewMessages] = useState(false)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const [separadorFixo, setSeparadorFixo] = useState<string>('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const separadoresRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const gruposRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Verificar autenticação
  useEffect(() => {
    // Se ainda está carregando, aguardar
    if (authLoading) return

    // Se não está autenticado, redirecionar para login
    if (!isAuthenticated) {
      console.log('🚪 Usuário não autenticado na conversa WhatsApp, redirecionando para login')
      router.replace('/admin/login')
      return
    }
  }, [authLoading, isAuthenticated, router])

  // Gerar ID único para mensagens locais (evitar conflitos de timing)
  const generateUniqueId = () => {
    return Date.now() + Math.random() * 1000
  }

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    try {
      // Criar um som de campainha usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      // Configurar som de campainha
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime) // Frequência alta
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1) // Frequência baixa
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2) // Frequência alta novamente
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      console.log('🔔 Som de notificação tocado')
    } catch (error) {
      console.warn('⚠️ Não foi possível tocar som de notificação:', error)
    }
  }

  useEffect(() => {
    console.log('🔧 useEffect executado - contactPhone:', contactPhone)
    console.log('🔧 Estado isFirstLoad no useEffect:', isFirstLoad)
    
    loadMensagens()
    loadContactData()

    // Auto-refresh das mensagens a cada 5 segundos
    const interval = setInterval(() => {
      console.log('⏰ ==================== AUTO-REFRESH TRIGGER ====================')
      console.log('⏰ Telefone:', contactPhone, '| Primeiro carregamento:', isFirstLoad)
      if (contactPhone) {
        loadMensagensAutoRefresh()
      } else {
        console.log('⚠️ contactPhone não existe, pulando auto-refresh')
      }
    }, 5000) // 5 segundos

    return () => clearInterval(interval)
  }, [contactPhone])

  // Auto scroll para o final das mensagens (somente quando necessário)
  useEffect(() => {
    if (shouldAutoScroll) {
      console.log('🔽 Executando scroll automático...')
      // Pequeno delay para garantir que o DOM seja atualizado
      setTimeout(() => {
        scrollToBottom()
        setShouldAutoScroll(false) // Reset flag após scroll
      }, 100)
    }
  }, [shouldAutoScroll]) // REMOVIDO mensagens da dependência

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const goToLatestMessages = () => {
    setHasNewMessages(false)
    setUserScrolledUp(false)
    scrollToBottom()
    console.log('📱 Usuário clicou para ir às mensagens mais recentes')
  }

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current
      const isNear = scrollHeight - scrollTop - clientHeight < 50 // Reduzido para 50px - mais restritivo
      
      // Detectar se usuário fez scroll manual para cima
      if (!isNear && !userScrolledUp) {
        setUserScrolledUp(true)
        console.log('👆 Usuário fez scroll manual para cima')
      } else if (isNear && userScrolledUp) {
        setUserScrolledUp(false)
        setHasNewMessages(false) // Limpar flag de novas mensagens quando voltar para o final
        console.log('👇 Usuário voltou para o final - limpando flag de novas mensagens')
      }
      
      setIsNearBottom(isNear)
    }
  }

  const loadContactData = async () => {
    if (!contactId) return
    
    try {
      const response = await fetch(`/api/whatsapp?id=${contactId}`)
      const data = await response.json()
      
      if (response.ok && data.contatos.length > 0) {
        setContactData(data.contatos[0])
      }
    } catch (error) {
      console.error('Erro ao carregar dados do contato:', error)
    }
  }

  // Função específica para auto-refresh (nunca é primeiro carregamento)
  const loadMensagensAutoRefresh = useCallback(async () => {
    try {
      setIsAutoRefreshing(true)
      console.log('🔄 AUTO-REFRESH loadMensagensAutoRefresh executada')
      
      if (!contactPhone) {
        console.error('❌ Telefone do contato não fornecido')
        setIsAutoRefreshing(false)
        return
      }

      console.log('🔍 Carregando mensagens para auto-refresh:', contactPhone)
      
      const response = await fetch(`/api/whatsapp/mensagens?fone=${encodeURIComponent(contactPhone)}`)
      const data: MensagensResponse = await response.json()

      if (response.ok) {
        setLastUpdateMessages(new Date())
        
        // SEMPRE tratar como auto-refresh (verificar novas mensagens)
        console.log('🔄 AUTO-REFRESH - Verificando novas mensagens')
        console.log('🔍 Último ID conhecido:', lastMessageId)
        console.log('🔍 Total de mensagens recebidas:', data.mensagens.length)
        
        // Verificar novas mensagens de forma robusta
        setMensagens(prev => {
          let referenceId = lastMessageId
          
          // Se lastMessageId é null, usar o maior ID das mensagens existentes como referência
          if (referenceId === null && prev.length > 0) {
            referenceId = Math.max(...prev.map(m => m.id))
            console.log('🔧 AUTO-REFRESH: lastMessageId era null, usando maior ID existente como referência:', referenceId)
          }
          
          // Se ainda é null (não há mensagens no estado), carregar todas como novas
          const novasMensagens = referenceId === null 
            ? data.mensagens 
            : data.mensagens.filter(msg => msg.id > referenceId)
          
          console.log('🔍 Mensagens filtradas como novas:', novasMensagens.length)
          console.log('🔍 IDs filtrados como novos:', novasMensagens.map(m => m.id))
          
          if (novasMensagens.length > 0) {
            console.log('✅ CANDIDATAS a novas mensagens:', novasMensagens.length)
            console.log('🆔 IDs candidatos:', novasMensagens.map(m => m.id))
            
            // Verificar se realmente há mensagens novas que não existem no estado atual
            const existingIds = new Set(prev.map(m => m.id))
            console.log('🔍 IDs existentes no estado:', Array.from(existingIds).sort((a, b) => a - b))
            const mensagensRealmenteNovas = novasMensagens.filter(msg => !existingIds.has(msg.id))
            
            console.log('📝 AUTO-REFRESH: Mensagens realmente novas:', mensagensRealmenteNovas.length)
            console.log('📝 IDs realmente novos:', mensagensRealmenteNovas.map(m => m.id))
            
            if (mensagensRealmenteNovas.length > 0) {
              // Atualizar ID da última mensagem
              const newLastId = Math.max(...data.mensagens.map(m => m.id))
              setLastMessageId(newLastId)
              console.log('🆔 Novo último ID salvo:', newLastId)
              
              // Só tocar campainha se há mensagens REALMENTE novas
              console.log('📱 AUTO-REFRESH: Mensagens REALMENTE novas = TOCANDO CAMPAINHA')
              setHasNewMessages(true)
              playNotificationSound()
              
              return [...prev, ...mensagensRealmenteNovas]
            } else {
              console.log('📭 AUTO-REFRESH: Nenhuma mensagem realmente nova encontrada')
              return prev
            }
          } else {
            console.log('📭 AUTO-REFRESH: Nenhuma mensagem nova detectada')
            return prev
          }
                 })
      } else {
        console.error('❌ Erro ao carregar mensagens no auto-refresh:', data.error)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens no auto-refresh:', error)
    } finally {
      setIsAutoRefreshing(false)
      console.log('🏁 Fim do auto-refresh')
    }
  }, [contactPhone])

  const loadMensagens = async () => {
    try {
      // Carregamento em andamento
      console.log('🚀 INÍCIO loadMensagens - isFirstLoad:', isFirstLoad)
      
      if (!contactPhone) {
        console.error('❌ Telefone do contato não fornecido')
        return
      }

      console.log('🔍 Carregando mensagens para:', contactPhone)
      
      const response = await fetch(`/api/whatsapp/mensagens?fone=${encodeURIComponent(contactPhone)}`)
      const data: MensagensResponse = await response.json()

      if (response.ok) {
        setLastUpdateMessages(new Date())
        
        if (isFirstLoad) {
          // Primeiro carregamento: carregar todas as mensagens
          setMensagens(data.mensagens)
          console.log('✅ Mensagens carregadas (primeiro load):', data.mensagens.length)
          
          // Salvar ID da última mensagem
          if (data.mensagens.length > 0) {
            setLastMessageId(data.mensagens[data.mensagens.length - 1].id)
          }
          
          // Scroll para baixo APENAS no primeiro carregamento
          setShouldAutoScroll(true)
          
          // IMPORTANTE: Marcar que não é mais primeiro carregamento
          setIsFirstLoad(false)
          console.log('🔧 isFirstLoad definido como FALSE - próximos serão updates incrementais')
        } else {
          // Carregamentos subsequentes: verificar novas mensagens
          console.log('🔄 LOAD-MENSAGENS - Verificando novas mensagens (carregamento subsequente)')
          console.log('🔍 Último ID conhecido:', lastMessageId)
          console.log('🔍 Total de mensagens recebidas:', data.mensagens.length)
          
          // Verificar novas mensagens de forma robusta
          setMensagens(prev => {
            let referenceId = lastMessageId
            
            // Se lastMessageId é null, usar o maior ID das mensagens existentes como referência
            if (referenceId === null && prev.length > 0) {
              referenceId = Math.max(...prev.map(m => m.id))
              console.log('🔧 LOAD-MENSAGENS: lastMessageId era null, usando maior ID existente como referência:', referenceId)
            }
            
            // Se ainda é null (não há mensagens no estado), carregar todas como novas
            const novasMensagens = referenceId === null 
              ? data.mensagens 
              : data.mensagens.filter(msg => msg.id > referenceId)
            
            console.log('🔍 Mensagens filtradas como novas:', novasMensagens.length)
            console.log('🔍 IDs filtrados como novos:', novasMensagens.map(m => m.id))
            
            if (novasMensagens.length > 0) {
              console.log('✅ CANDIDATAS a novas mensagens:', novasMensagens.length)
              console.log('🆔 IDs candidatos:', novasMensagens.map(m => m.id))
              
              // Verificar se realmente há mensagens novas que não existem no estado atual
              const existingIds = new Set(prev.map(m => m.id))
              console.log('🔍 IDs existentes no estado:', Array.from(existingIds).sort((a, b) => a - b))
              const mensagensRealmenteNovas = novasMensagens.filter(msg => !existingIds.has(msg.id))
              
              console.log('📝 LOAD-MENSAGENS: Mensagens realmente novas:', mensagensRealmenteNovas.length)
              console.log('📝 IDs realmente novos:', mensagensRealmenteNovas.map(m => m.id))
              
              if (mensagensRealmenteNovas.length > 0) {
                // Atualizar ID da última mensagem
                const newLastId = Math.max(...data.mensagens.map(m => m.id))
                setLastMessageId(newLastId)
                console.log('🆔 Novo último ID salvo:', newLastId)
                
                // Só tocar campainha se há mensagens REALMENTE novas
                console.log('📱 LOAD-MENSAGENS: Mensagens REALMENTE novas = TOCANDO CAMPAINHA')
                setHasNewMessages(true)
                playNotificationSound()
                
                return [...prev, ...mensagensRealmenteNovas]
              } else {
                console.log('📭 LOAD-MENSAGENS: Nenhuma mensagem realmente nova encontrada')
                return prev
              }
            } else {
              console.log('📭 LOAD-MENSAGENS: Nenhuma mensagem nova detectada')
              return prev
            }
          })
        }
      } else {
        console.error('❌ Erro ao carregar mensagens:', data.error)
        if (isFirstLoad) {
          setMensagens([])
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar mensagens:', error)
      if (isFirstLoad) {
        setMensagens([])
      }
    } finally {
      // Carregamento finalizado
      console.log('🏁 Fim do carregamento de mensagens')
    }
  }

  const handleGoBack = () => {
    // Preservar o fromPage quando voltar para a lista principal
    const url = fromPage ? `/whatsapp?from=${fromPage}` : '/whatsapp'
    console.log('🔄 Voltando para WhatsApp principal com fromPage preservado:', url)
    router.replace(url)
  }

  const formatarHora = (timestamp: string) => {
    const data = new Date(timestamp)
    return data.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const enviarMensagem = () => {
    if (novaMensagem.trim()) {
      const novaMensagemObj: Mensagem = {
        id: generateUniqueId(),
        type: 'admin',
        content: novaMensagem.trim(),
        created_at: new Date().toISOString(),
        is_sent: true
      }
      
      setMensagens(prev => {
        // Verificar se já existe uma mensagem com este ID
        const existingIds = new Set(prev.map(m => m.id))
        if (existingIds.has(novaMensagemObj.id)) {
          console.log('⚠️ Mensagem duplicada detectada ao enviar, ignorando')
          return prev
        }
        return [...prev, novaMensagemObj]
      })
      setNovaMensagem('')
      
      // Atualizar ID da última mensagem
      setLastMessageId(novaMensagemObj.id)
      
      // Forçar scroll para baixo ao enviar mensagem
      setShouldAutoScroll(true)
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      console.log('Arquivo selecionado:', file.name)
      // Aqui você pode implementar o upload do arquivo
      // Por enquanto, vou apenas simular uma mensagem
      const fileMessage: Mensagem = {
        id: generateUniqueId(),
        type: 'admin',
        content: `📁 Arquivo: ${file.name}`,
        created_at: new Date().toISOString(),
        is_sent: true
      }
      setMensagens(prev => {
        // Verificar se já existe uma mensagem com este ID
        const existingIds = new Set(prev.map(m => m.id))
        if (existingIds.has(fileMessage.id)) {
          console.log('⚠️ Mensagem de arquivo duplicada detectada, ignorando')
          return prev
        }
        return [...prev, fileMessage]
      })
      setLastMessageId(fileMessage.id)
      setShouldAutoScroll(true) // Forçar scroll para baixo
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      // Parar gravação
      setIsRecording(false)
      console.log('Parando gravação...')
      // Aqui você implementaria a lógica para parar a gravação
      
      // Simular áudio gravado
      const audioMessage: Mensagem = {
        id: generateUniqueId(),
        type: 'admin',
        content: '🎵 Áudio gravado',
        created_at: new Date().toISOString(),
        is_sent: true
      }
      setMensagens(prev => {
        // Verificar se já existe uma mensagem com este ID
        const existingIds = new Set(prev.map(m => m.id))
        if (existingIds.has(audioMessage.id)) {
          console.log('⚠️ Mensagem de áudio duplicada detectada, ignorando')
          return prev
        }
        return [...prev, audioMessage]
      })
      setLastMessageId(audioMessage.id)
      setShouldAutoScroll(true) // Forçar scroll para baixo
    } else {
      // Iniciar gravação
      setIsRecording(true)
      console.log('Iniciando gravação...')
      // Aqui você implementaria a lógica para iniciar a gravação
    }
  }

  const formatPhone = (phone: string) => {
    // Formatar telefone brasileiro
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 13 && cleaned.startsWith('55')) {
      return `+${cleaned.slice(0, 2)} (${cleaned.slice(2, 4)}) ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
    }
    return phone
  }

  // Função para formatar a data do separador
  const formatarDataSeparador = (dataStr: string) => {
    const data = new Date(dataStr)
    const hoje = new Date()
    const ontem = new Date()
    ontem.setDate(hoje.getDate() - 1)
    
    // Normalizar as datas para comparação (remover horas)
    const dataNormalizada = new Date(data.getFullYear(), data.getMonth(), data.getDate())
    const hojeNormalizada = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
    const ontemNormalizada = new Date(ontem.getFullYear(), ontem.getMonth(), ontem.getDate())
    
    if (dataNormalizada.getTime() === hojeNormalizada.getTime()) {
      return 'Hoje'
    } else if (dataNormalizada.getTime() === ontemNormalizada.getTime()) {
      return 'Ontem'
    } else {
      // Calcular diferença em dias
      const diffDias = Math.floor((hojeNormalizada.getTime() - dataNormalizada.getTime()) / (1000 * 60 * 60 * 24))
      
      if (diffDias <= 7) {
        // Mostrar dia da semana para última semana
        const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
        return diasSemana[data.getDay()]
      } else {
        // Mostrar data completa para mensagens mais antigas
        return data.toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        })
      }
    }
  }

  // Função para agrupar mensagens por data
  const agruparMensagensPorData = (mensagens: Mensagem[]) => {
    const grupos: { [key: string]: Mensagem[] } = {}
    
    mensagens.forEach(mensagem => {
      const data = new Date(mensagem.created_at)
      const chaveData = data.toDateString() // "Mon Jan 01 2024"
      
      if (!grupos[chaveData]) {
        grupos[chaveData] = []
      }
      grupos[chaveData].push(mensagem)
    })
    
    return grupos
  }

  const filteredMessages = searchTerm 
    ? mensagens.filter(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : mensagens

  // Função para verificar separadores na tela
  const verificarSeparadores = useCallback(() => {
    const centroTela = window.innerHeight / 2
    console.log('🔍 Verificando separadores - Centro da tela:', centroTela.toFixed(0) + 'px')
    
    // Pegar todos os separadores na DOM
    const todosSeparadores = Object.entries(separadoresRefs.current)
      .filter(([key, ref]) => ref) // Só os que existem
      .map(([key, ref]) => {
        const rect = ref!.getBoundingClientRect()
        const label = ref!.getAttribute('data-separador') || ''
        return {
          key,
          label,
          posicaoTopo: rect.top,
          posicaoBottom: rect.bottom,
          elemento: ref
        }
      })
      .sort((a, b) => a.posicaoTopo - b.posicaoTopo)

    console.log('📊 Todos os separadores encontrados:', todosSeparadores.map(s => 
      `${s.label}: ${s.posicaoTopo.toFixed(0)}px`
    ))

    // Encontrar separadores visíveis (entre -50px e altura da tela + 50px)
    const separadoresVisiveis = todosSeparadores.filter(s => 
      s.posicaoBottom > -50 && s.posicaoTopo < window.innerHeight + 50
    )

    console.log('👁️ Separadores na área visível:', separadoresVisiveis.map(s => 
      `${s.label}: ${s.posicaoTopo.toFixed(0)}px`
    ))

    if (separadoresVisiveis.length > 0) {
      let separadorEscolhido = null

      // Aplicar sua regra: tag na metade inferior → separador anterior
      for (let i = 0; i < separadoresVisiveis.length; i++) {
        const atual = separadoresVisiveis[i]
        
        // Se a tag está na metade inferior da tela
        if (atual.posicaoTopo > centroTela) {
          // Usar separador anterior (se existir)
          const anterior = separadoresVisiveis[i - 1] || todosSeparadores[todosSeparadores.indexOf(atual) - 1]
          if (anterior) {
            separadorEscolhido = anterior.label
            console.log('⬇️ Tag', atual.label, 'na metade inferior (pos:', atual.posicaoTopo.toFixed(0), ') → usando anterior:', anterior.label)
          } else {
            separadorEscolhido = atual.label
            console.log('⬇️ Tag', atual.label, 'na metade inferior mas é a primeira → usando atual:', atual.label)
          }
          break
        }
        // Se está na metade superior, continua para ver se tem outro na inferior
        else {
          separadorEscolhido = atual.label
          console.log('⬆️ Tag', atual.label, 'na metade superior (pos:', atual.posicaoTopo.toFixed(0), ') → usando atual')
        }
      }

      if (separadorEscolhido && separadorEscolhido !== separadorFixo) {
        console.log('🔄 MUDANDO separador fixo:', separadorFixo, '→', separadorEscolhido)
        setSeparadorFixo(separadorEscolhido)
      } else {
        console.log('✅ Separador fixo mantido:', separadorFixo)
      }
    }
  }, [separadorFixo])

  // Usar scroll listener em vez de intersection observer
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    // Verificar separadores no scroll
    const handleScroll = () => {
      verificarSeparadores()
    }

    // Verificar separadores quando mensagens carregam
    const timer = setTimeout(() => {
      verificarSeparadores()
    }, 500)

    container.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      clearTimeout(timer)
    }
  }, [verificarSeparadores, filteredMessages])

  const AudioWaveform = ({ duration }: { duration: string }) => (
    <div className="flex items-center space-x-2 bg-green-700 text-white p-3 rounded-lg max-w-xs">
      <Button size="sm" variant="ghost" className="p-1 h-8 w-8">
        <Play className="w-4 h-4" />
      </Button>
      <div className="flex-1 flex items-center space-x-1">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="bg-green-300 rounded-full"
            style={{
              width: '2px',
              height: `${Math.random() * 16 + 4}px`
            }}
          />
        ))}
      </div>
      <span className="text-xs text-green-100">{duration}</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-900 text-white flex justify-center overflow-hidden touch-pan-y">
      <div className="w-full max-w-[800px] flex flex-col relative" style={{ height: '100dvh', maxHeight: '100dvh' }}>
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-gray-300 hover:text-white hover:bg-gray-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600">
                <Image
                  src={contactData?.foto_url || "/placeholder-user.jpg"}
                  alt={contactName}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1">
                <h2 className="text-lg font-medium text-white">{contactName}</h2>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-400">{contactPhone ? formatPhone(contactPhone) : 'Carregando...'}</p>
                  {isAutoRefreshing && (
                    <span className="text-xs text-green-400 animate-pulse">🔄 atualizando...</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-300 hover:text-white"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Campo de Busca */}
          {showSearch && (
            <div className="mt-4">
              <Input
                placeholder="Buscar nas mensagens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                autoFocus
              />
            </div>
          )}
        </div>

        {/* Separador Fixo no Topo */}
        {separadorFixo && (
          <div className="sticky top-0 z-20 py-2 flex-shrink-0">
            <div className="flex justify-center">
              <div className="bg-gray-800 text-gray-300 px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                {separadorFixo}
              </div>
            </div>
          </div>
        )}

        {/* Área de Mensagens */}
        <div 
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="p-4 space-y-4"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23374151' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            minHeight: 0,
            // ✅ MOBILE: Altura responsiva para garantir header e footer visíveis simultaneamente
            // Header fixo + Footer fixo + margem de segurança para mobile
            height: 'calc(100dvh - 180px)',
            maxHeight: 'calc(100dvh - 180px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch' // iOS smooth scrolling
          }}
        >
          {filteredMessages.length === 0 && hasInitialLoad ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-400">Nenhuma mensagem encontrada</div>
            </div>
          ) : hasInitialLoad ? (
            (() => {
              const gruposPorData = agruparMensagensPorData(filteredMessages)
              const datasOrdenadas = Object.keys(gruposPorData).sort((a, b) => 
                new Date(a).getTime() - new Date(b).getTime()
              )
              
              return datasOrdenadas.map(chaveData => {
                const mensagensDoGrupo = gruposPorData[chaveData]
                const primeiraMsg = mensagensDoGrupo[0]
                const labelData = formatarDataSeparador(primeiraMsg.created_at)
                
                return (
                  <div key={chaveData}>
                    {/* Separador de data */}
                    <div 
                      ref={(el) => {
                        separadoresRefs.current[chaveData] = el
                      }}
                      data-separador={labelData}
                      className="flex justify-center my-6"
                    >
                      <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                        {labelData}
                      </div>
                    </div>
                    
                    {/* Mensagens do grupo */}
                    <div className="space-y-4">
                      {mensagensDoGrupo.map((mensagem) => {
                        // Determinar lado e cores baseado no tipo
                        const isClient = mensagem.type === 'client'
                        const isAI = mensagem.type === 'ai'
                        const isAdmin = mensagem.type === 'admin'
                        
                        // Cores diferentes para cada tipo
                        let bgColor = ''
                        let textColor = 'text-white'
                        let icon = null
                        
                        if (isClient) {
                          bgColor = 'bg-gray-700' // Cliente - cinza escuro
                        } else if (isAI) {
                          bgColor = 'bg-blue-600' // AI - azul
                          icon = <Bot className="w-3 h-3" />
                        } else if (isAdmin) {
                          bgColor = 'bg-green-600' // Admin - verde
                          icon = <User className="w-3 h-3" />
                        }
                        
                        return (
                          <div
                            key={mensagem.id}
                            className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}
                          >
                            <div className={`max-w-[70%] ${isClient ? 'mr-auto' : 'ml-auto'}`}>
                              {mensagem.type === 'audio' ? (
                                <div className={`${bgColor} rounded-lg`}>
                                  <AudioWaveform duration={mensagem.content} />
                                  <div className="px-3 pb-1">
                                    <span className="text-xs text-gray-300">{formatarHora(mensagem.created_at)}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className={`p-3 rounded-lg ${bgColor} ${textColor}`}>
                                  <p className="text-sm whitespace-pre-wrap">{mensagem.content}</p>
                                  <div className="flex items-center justify-end mt-1 space-x-1">
                                    {icon && (
                                      <div className="opacity-70">
                                        {icon}
                                      </div>
                                    )}
                                    <span className="text-xs opacity-70">{formatarHora(mensagem.created_at)}</span>
                                    {!isClient && (
                                      <div className="text-blue-300">
                                        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                                          <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l3.61 3.463c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z"/>
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            })()
           ) : null}
           {/* Ref para scroll automático */}
           <div ref={messagesEndRef} />
        </div>

        {/* Botão para ir às mensagens mais recentes */}
        {hasNewMessages && (
          <div className="absolute bottom-32 right-4 z-10">
            <Button
              onClick={goToLatestMessages}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full p-3 shadow-lg animate-pulse"
              size="sm"
            >
              <span className="flex items-center space-x-1">
                <ChevronDown className="w-4 h-4" />
                <span className="text-xs font-medium">Nova</span>
              </span>
            </Button>
          </div>
        )}

        {/* Input de Mensagem */}
        <div className="bg-gray-800 border-t border-gray-700 p-4 flex-shrink-0">
          <div className="flex items-center space-x-3">
            {/* Input de arquivo oculto */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: 'none' }}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            />
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-white"
              onClick={handleFileSelect}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            
            <div className="flex-1 relative">
              <Input
                value={novaMensagem}
                onChange={(e) => setNovaMensagem(e.target.value)}
                placeholder="Digite uma mensagem"
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-lg pr-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    enviarMensagem()
                  }
                }}
              />
            </div>
            
            {novaMensagem.trim() ? (
              <Button 
                onClick={enviarMensagem}
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className={`transition-colors ${
                  isRecording 
                    ? 'text-red-500 hover:text-red-400 animate-pulse' 
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={toggleRecording}
              >
                <Mic className="w-5 h-5" />
              </Button>
            )}
          </div>
          
          {/* Indicador de gravação */}
          {isRecording && (
            <div className="mt-2 flex items-center justify-center space-x-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Gravando áudio...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 