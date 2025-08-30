"use client"

import { usePathname } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, user, initializing } = useAdminAuth()
  const pathname = usePathname()

  // Não verificar autenticação na página de login
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

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

  // Verificar localStorage como fallback
  let hasLocalStorageAuth = false
  
  try {
    const adminData = localStorage.getItem('adminLogado')
    if (adminData) {
      const parsed = JSON.parse(adminData)
      // CRÍTICO: Apenas ADMIN e MANAGER podem acessar /admin/* (funcionario NÃO)
      hasLocalStorageAuth = parsed?.user?.user_level === 'admin' || parsed?.user?.user_level === 'manager'
    }
  } catch (error) {
    console.error('❌ Erro ao parsear adminLogado do localStorage:', error)
    // Se há erro no localStorage, limpá-lo
    localStorage.removeItem('adminLogado')
  }

  // ✅ CRÍTICO: Permitir acesso apenas para ADMIN e MANAGER (funcionario NÃO)
  const isAdminOrManager = user?.user_level === 'admin' || user?.user_level === 'manager'
  const shouldAllowAccess = (isAuthenticated && isAdminOrManager) || hasLocalStorageAuth

  // Bloquear renderização se não autenticado em nenhum dos sistemas
  if (!shouldAllowAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background-gradient-light via-background-gradient-medium to-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary mb-4 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="mb-4">
            <p className="text-lg font-semibold text-foreground mb-2">Acesso Negado</p>
            <p className="text-muted-foreground mb-4">
              Você não tem permissão para acessar esta área
            </p>
          </div>
          <a 
            href="/admin/login"
            className="inline-flex items-center px-4 py-2 bg-brand-primary text-brand-primary-foreground rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            <Shield className="w-4 h-4 mr-2" />
            Fazer Login
          </a>
        </div>
      </div>
    )
  }

  // Renderizar conteúdo se autenticado
  return <>{children}</>
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthProvider>
  )
} 