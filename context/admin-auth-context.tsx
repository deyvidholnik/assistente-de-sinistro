"use client"

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AdminUser {
  id: number
  username: string
  email: string
  user_level: string
  full_name: string
  created_at: string
  updated_at: string
  last_login: string | null
  is_active: boolean
  uid_auth: string
}

interface AdminAuthContextType {
  user: AdminUser | null
  authUser: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [authUser, setAuthUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para buscar dados do usuário - memoizada para evitar re-criação
  const fetchUserInfo = useCallback(async (userId: string) => {
    try {
      const { data: userInfo, error } = await supabase
        .from('user_info')
        .select('*')
        .eq('uid_auth', userId)
        .eq('is_active', true)
        .maybeSingle() // Usar maybeSingle() ao invés de single() para permitir resultados vazios
      
      if (error) {
        console.error('❌ Erro ao buscar user_info:', error)
        return null
      }
      
      // Se não encontrou usuário, não é erro - apenas não é admin/manager
      if (!userInfo) {
        return null
      }
      
      if (userInfo && (userInfo.user_level === 'admin' || userInfo.user_level === 'manager')) {
        return userInfo
      }
      
      return null
    } catch (err) {
      console.error('❌ Erro crítico ao processar dados do usuário:', err)
      return null
    }
  }, [])

  useEffect(() => {
    let mounted = true

    // Timeout de segurança para evitar loading infinito
    const loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        setLoading(false)
      }
    }, 5000) // 5 segundos

    // Verificar localStorage primeiro para detecção mais rápida
    const checkLocalStorage = () => {
      try {
        const adminData = localStorage.getItem('adminLogado')
        if (adminData) {
          const parsed = JSON.parse(adminData)
          if (parsed?.user && (parsed.user.user_level === 'admin' || parsed.user.user_level === 'manager')) {
            console.log('⚡ Usuário detectado via localStorage (inicialização rápida)')
            return parsed.user
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar localStorage na inicialização:', error)
      }
      return null
    }

    // Verificar sessão atual na inicialização
    const checkSession = async () => {
      try {
        // Verificação rápida via localStorage primeiro
        const localUser = checkLocalStorage()
        if (localUser && mounted) {
          setUser(localUser)
          // Continuar verificação do Supabase em segundo plano para sincronizar
        }

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return
        
        if (session?.user) {
          setAuthUser(session.user)
          setSession(session)
          
          // Buscar informações do usuário
          const userInfo = await fetchUserInfo(session.user.id)
          
          if (!mounted) return
          
          // Se usuário está logado mas não tem permissões, fazer logout
          if (!userInfo) {
            await supabase.auth.signOut()
            localStorage.removeItem('adminLogado') // Limpar localStorage também
            setUser(null)
            setAuthUser(null)
            setSession(null)
          } else {
            setUser(userInfo)
            // Sincronizar localStorage com dados atualizados
            const adminData = {
              user: userInfo,
              timestamp: new Date().toISOString()
            }
            localStorage.setItem('adminLogado', JSON.stringify(adminData))
          }
        } else {
          // Se não há sessão no Supabase, limpar localStorage também
          localStorage.removeItem('adminLogado')
          setUser(null)
          setAuthUser(null)
          setSession(null)
        }
      } catch (error) {
        console.error('❌ Erro ao verificar sessão admin:', error)
        if (mounted) {
          setUser(null)
          setAuthUser(null)
          setSession(null)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    checkSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      // Reduzir logs - apenas quando há mudança significativa
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('🔄 Auth state change:', event, session?.user?.email)
      }
      
      setSession(session)
      setAuthUser(session?.user || null)
      
      let userInfo = null
      if (session?.user) {
        userInfo = await fetchUserInfo(session.user.id)
        if (mounted) {
          // Se usuário está logado mas não tem permissões, fazer logout
          if (!userInfo) {
            console.log('🚪 Usuário sem permissões admin/manager, fazendo logout automático')
            await supabase.auth.signOut()
            setUser(null)
            setAuthUser(null)
            setSession(null)
            return
          }
          
          setUser(userInfo)
        }
      } else {
        if (mounted) {
          setUser(null)
        }
      }
      
      if (mounted) {
        setLoading(false)
        console.log('🏁 Auth state change finalizado:', { 
          isAuthenticated: !!userInfo && !!session?.user,
          userLevel: userInfo?.user_level 
        })
      }
    })

    return () => {
      mounted = false
      clearTimeout(loadingTimeout)
      subscription.unsubscribe()
    }
  }, [fetchUserInfo])

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true)
    try {
      console.log('🔐 Fazendo login direto no cliente via Supabase Auth...')
      
      // Fazer login direto no cliente
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError || !authData.user) {
        console.error('❌ Erro de autenticação:', authError)
        throw new Error(authError?.message || 'Credenciais inválidas')
      }

      console.log('✅ Login no Supabase Auth bem-sucedido')

      // Buscar informações do usuário na tabela user_info
      const userInfo = await fetchUserInfo(authData.user.id)

      if (!userInfo) {
        console.error('❌ Usuário não encontrado na tabela user_info')
        await supabase.auth.signOut()
        throw new Error('Usuário não encontrado no sistema')
      }

      // Verificar se tem permissão de admin ou manager
      if (userInfo.user_level !== 'admin' && userInfo.user_level !== 'manager') {
        console.error('❌ Usuário sem permissão de acesso:', userInfo.user_level)
        await supabase.auth.signOut()
        throw new Error('Usuário sem permissão de acesso administrativo')
      }

      console.log('✅ Login bem-sucedido para:', userInfo.user_level)
      
      // Salvar no localStorage para compatibilidade com dashboard
      const adminData = {
        user: userInfo,
        timestamp: new Date().toISOString()
      }
      
      console.log('💾 Salvando dados no localStorage:', adminData)
      localStorage.setItem('adminLogado', JSON.stringify(adminData))
      
      // Verificar se foi salvo corretamente
      const savedData = localStorage.getItem('adminLogado')
      console.log('🔍 Dados salvos verificados:', savedData ? JSON.parse(savedData) : 'NULL')
      
      console.log('💾 Dados salvos no localStorage')

      // Atualizar contexto
      setUser(userInfo)
      setAuthUser(authData.user)
      setSession(authData.session)

      console.log('🎯 Contexto atualizado - isAuthenticated será true agora')

    } catch (error: any) {
      console.error('❌ Erro no login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      console.log('🚪 Fazendo logout completo...')
      
      // Limpar localStorage primeiro
      localStorage.removeItem('adminLogado')
      console.log('🗑️ localStorage limpo')
      
      // Limpar estado imediatamente
      setUser(null)
      setAuthUser(null)
      setSession(null)
      console.log('🧹 Estado local limpo')
      
      // Logout do Supabase por último
      await supabase.auth.signOut()
      console.log('🚪 Sessão Supabase encerrada')
      
      console.log('✅ Logout completo realizado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao fazer logout:', error)
      // Mesmo com erro, garantir que o estado local está limpo
      setUser(null)
      setAuthUser(null)
      setSession(null)
      localStorage.removeItem('adminLogado')
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    authUser,
    session,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user && !!authUser,
    isAdmin: user?.user_level === 'admin' // CRÍTICO: APENAS ADMIN pode acessar /admin/*
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider')
  }
  return context
} 