import { supabase } from './supabase'
import { User, Session } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatar_url?: string
}

export const authService = {
  // Login com email e senha
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error('❌ Erro no login:', error)
      throw error
    }
    
    console.log('✅ Login realizado:', data.user?.email)
    return { user: data.user, session: data.session }
  },

  // Logout
  async signOut() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('❌ Erro no logout:', error)
      throw error
    }
    
    console.log('✅ Logout realizado')
  },

  // Obter usuário atual
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  // Obter sessão atual
  async getCurrentSession(): Promise<Session | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  },

  // Escutar mudanças de autenticação
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      // Apenas log para eventos importantes
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        console.log('🔄 Auth event:', event, session?.user?.email)
      }
      callback(session?.user || null)
    })
  },

  // Verificar se está autenticado
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getCurrentSession()
    return !!session
  }
} 