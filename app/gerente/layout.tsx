"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Loader2, Shield } from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context'

function GerenteLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, user, initializing } = useAdminAuth()
  const pathname = usePathname()
  const router = useRouter()

  // ✅ PROTEÇÃO ANTI-LOOP: Controle de redirecionamento
  const redirectedRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  // ✅ TIMEOUT DE SEGURANÇA: Resetar proteção após 5 segundos
  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      redirectedRef.current = false
      // console.log('🔄 GERENTE: Proteção anti-loop resetada')
    }, 5000)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // ✅ CORRIGIDO: Efeito para redirecionamentos seguros sem race conditions
  useEffect(() => {
    // ✅ CRÍTICO: Aguardar inicialização completa
    if (initializing) {
      // console.log('⏳ GERENTE: Aguardando inicialização...')
      return
    }
    
    // ✅ CRÍTICO: Aguardar loading também
    if (loading) {
      // console.log('⏳ GERENTE: Aguardando carregamento...')
      return
    }

    // ✅ PROTEÇÃO: Evitar redirecionamentos múltiplos
    if (redirectedRef.current) {
      // console.log('🛡️ GERENTE: Redirecionamento já executado, ignorando')
      return
    }

    // ✅ Verificar autenticação APÓS inicialização
    if (!isAuthenticated) {
      // console.log('❌ GERENTE: Não autenticado, redirecionando para login')
      redirectedRef.current = true
      router.replace('/admin/login')
      return
    }

    // ✅ Verificar se é manager ou admin
    if (user?.user_level !== 'manager' && user?.user_level !== 'admin') {
      // console.log('❌ GERENTE: Sem permissão (nível:', user?.user_level + '), redirecionando para login')
      redirectedRef.current = true
      router.replace('/admin/login')
      return
    }

    // console.log('✅ GERENTE: Autenticado com sucesso -', user.username, 'nível:', user.user_level)
  }, [loading, isAuthenticated, user, router, initializing])

  // ✅ CORRIGIDO: Mostrar loading enquanto verifica autenticação ou inicializa
  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-gradient-light via-background-gradient-medium to-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary mb-4 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  // ✅ CORRIGIDO: Bloquear renderização se não autenticado (enquanto redireciona)
  if (!isAuthenticated || (user?.user_level !== 'manager' && user?.user_level !== 'admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-gradient-light via-background-gradient-medium to-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary mb-4 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    )
  }

  // Verificar se é manager ou admin
  if (user?.user_level !== 'manager' && user?.user_level !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-gradient-light via-background-gradient-medium to-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary mb-4 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
          <p className="text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function GerenteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <GerenteLayoutContent>{children}</GerenteLayoutContent>
    </AdminAuthProvider>
  )
} 