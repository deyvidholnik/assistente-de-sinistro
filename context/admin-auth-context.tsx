"use client"

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface UserInfo {
  id: number
  username: string
  email: string
  full_name: string
  user_level: 'admin' | 'manager' | 'funcionario'
  created_at: string
  updated_at: string
  last_login?: string
  is_active: boolean
  uid_auth?: string
}

interface AdminAuthContextType {
  user: UserInfo | null
  authUser: User | null
  session: Session | null
  loading: boolean
  // ✅ NOVO: Estado de inicialização para evitar redirects prematuros
  initializing: boolean
  // ✅ CORRIGIDO: isAuthenticated agora considera localStorage
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<UserInfo>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(false)
  // ✅ NOVO: Controle de inicialização
  const [initializing, setInitializing] = useState(true)
  
  const mounted = useRef(true)
  const router = useRouter()

  // ✅ CORRIGIDO: isAuthenticated considera localStorage + inicialização
  const isAuthenticated = !initializing && !!user && (user.user_level === 'admin' || user.user_level === 'manager' || user.user_level === 'funcionario')

  // Buscar informações do usuário
  const fetchUserInfo = async (uid: string): Promise<UserInfo | null> => {
    try {
      const { data: userInfo, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('uid_auth', uid)
        .maybeSingle()

      if (error) {
        console.error('❌ Erro ao buscar informações do usuário:', error)
        return null
      }

      if (!userInfo) {
        console.log('⚠️ Usuário não encontrado na tabela user_info')
        return null
      }

      if (userInfo.user_level !== 'admin' && userInfo.user_level !== 'manager' && userInfo.user_level !== 'funcionario') {
        console.log('⚠️ Usuário não tem permissão de admin/manager/funcionario')
        return null
      }

      return userInfo
    } catch (error) {
      console.error('❌ Erro na busca de informações do usuário:', error)
      return null
    }
  }

  // ✅ NOVO: Verificação segura do localStorage
  const getLocalStorageUser = (): UserInfo | null => {
    try {
      if (typeof window === 'undefined') return null
      
      const adminData = localStorage.getItem('adminLogado')
      if (!adminData) return null

      const parsed = JSON.parse(adminData)
      if (parsed?.user && (parsed.user.user_level === 'admin' || parsed.user.user_level === 'manager' || parsed.user.user_level === 'funcionario')) {
        return parsed.user
      }
    } catch (error) {
      console.error('❌ Erro ao verificar localStorage:', error)
      localStorage.removeItem('adminLogado')
    }
    return null
  }

  // ✅ NOVO: Verificação inicial sem race conditions
  const initializeAuth = async () => {
    // console.log('🚀 Inicializando autenticação admin...')
    
    try {
      // 1. Verificar localStorage primeiro (rápido)
      const localUser = getLocalStorageUser()
      if (localUser) {
        // console.log('⚡ Usuário detectado via localStorage')
        setUser(localUser)
        // ✅ IMPORTANTE: Marcar como não inicializando para permitir acesso
        setInitializing(false)
        
        // 2. Verificar sessão Supabase em background (sem bloquear)
        setTimeout(async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              // console.log('🔄 Sincronizando com sessão Supabase')
              setAuthUser(session.user)
              setSession(session)
              
              // Atualizar dados do usuário se necessário
              const userInfo = await fetchUserInfo(session.user.id)
              if (userInfo && mounted.current) {
                setUser(userInfo)
                localStorage.setItem('adminLogado', JSON.stringify({ 
                  user: userInfo, 
                  timestamp: Date.now() 
                }))
              }
            }
          } catch (error) {
            console.error('❌ Erro na sincronização background:', error)
          }
        }, 100)
        
        return
      }

      // 3. Se não há localStorage, verificar sessão Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // console.log('🔐 Sessão Supabase detectada')
        setAuthUser(session.user)
        setSession(session)

        const userInfo = await fetchUserInfo(session.user.id)
        if (userInfo && mounted.current) {
          setUser(userInfo)
          localStorage.setItem('adminLogado', JSON.stringify({ 
            user: userInfo, 
            timestamp: Date.now() 
          }))
        }
      }

    } catch (error) {
      console.error('❌ Erro na inicialização da autenticação:', error)
    } finally {
      // ✅ SEMPRE marcar inicialização como completa
      if (mounted.current) {
        setInitializing(false)
      }
    }
  }

  // Login
  const signIn = async (email: string, password: string): Promise<UserInfo> => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // ✅ Traduzir mensagens de erro para português
        let errorMessage = error.message
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado'
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos'
        } else if (error.message.includes('User not found')) {
          errorMessage = 'Usuário não encontrado'
        } else if (error.message.includes('signup_disabled')) {
          errorMessage = 'Cadastro de novos usuários desabilitado'
        } else if (error.message.includes('email_address_invalid')) {
          errorMessage = 'Endereço de email inválido'
        } else if (error.message.includes('password_too_short')) {
          errorMessage = 'Senha muito curta'
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Erro de conexão. Verifique sua internet'
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tempo limite de conexão excedido'
        }
        throw new Error(errorMessage)
      }
      
      if (!data.user) throw new Error('Usuário não encontrado')

      const userInfo = await fetchUserInfo(data.user.id)
      if (!userInfo) {
        await supabase.auth.signOut()
        throw new Error('Usuário não tem permissões adequadas')
      }

      // Atualizar estados
      setAuthUser(data.user)
      setSession(data.session)
      setUser(userInfo)

      // Salvar no localStorage
      localStorage.setItem('adminLogado', JSON.stringify({ 
        user: userInfo, 
        timestamp: Date.now() 
      }))

      // console.log('✅ Login admin realizado com sucesso')
      return userInfo

    } catch (error: any) {
      console.error('❌ Erro no login admin:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout
  const signOut = async (): Promise<void> => {
    setLoading(true)
    try {
      // Limpar estados
      setUser(null)
      setAuthUser(null)
      setSession(null)
      
      // Limpar localStorage
      localStorage.removeItem('adminLogado')
      localStorage.removeItem('clienteLogado')
      
      // Fazer logout no Supabase
      await supabase.auth.signOut()
      
      // console.log('✅ Logout realizado com sucesso')
      
      // Redirecionar
      router.replace('/admin/login')
      
    } catch (error) {
      console.error('❌ Erro no logout:', error)
    } finally {
      setLoading(false)
    }
  }

  // Refresh user
  const refreshUser = async (): Promise<void> => {
    if (!authUser) return

    try {
      const userInfo = await fetchUserInfo(authUser.id)
      if (userInfo && mounted.current) {
        setUser(userInfo)
        localStorage.setItem('adminLogado', JSON.stringify({ 
          user: userInfo, 
          timestamp: Date.now() 
        }))
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error)
    }
  }

  // Inicialização
  useEffect(() => {
    mounted.current = true
    initializeAuth()
    
    return () => {
      mounted.current = false
    }
  }, [])

  // ✅ CORRIGIDO: Listener de mudanças de auth mais robusto
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('🔄 Auth state change:', event)
      
      if (!mounted.current) return

      if (event === 'SIGNED_OUT') {
        setUser(null)
        setAuthUser(null)
        setSession(null)
        localStorage.removeItem('adminLogado')
      } else if (event === 'SIGNED_IN' && session?.user) {
        setAuthUser(session.user)
        setSession(session)
        
        // Buscar informações do usuário apenas se não existir
        if (!user) {
          const userInfo = await fetchUserInfo(session.user.id)
          if (userInfo && mounted.current) {
            setUser(userInfo)
            localStorage.setItem('adminLogado', JSON.stringify({ 
              user: userInfo, 
              timestamp: Date.now() 
            }))
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [user]) // ✅ Dependência do user para evitar loops

  const value: AdminAuthContextType = {
    user,
    authUser,
    session,
    loading,
    initializing,
    isAuthenticated,
    signIn,
    signOut,
    refreshUser
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider')
  }
  return context
} 