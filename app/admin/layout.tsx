"use client"

import { usePathname } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, isAdmin, user } = useAdminAuth()
  const pathname = usePathname()

  // Não verificar autenticação na página de login
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
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
  const adminData = localStorage.getItem('adminLogado')
  let hasLocalStorageAuth = false
  
  if (adminData) {
    try {
      const parsed = JSON.parse(adminData)
      // CRÍTICO: Apenas ADMIN pode acessar /admin/* 
      hasLocalStorageAuth = parsed?.user?.user_level === 'admin'
    } catch (error) {
      console.error('❌ Erro ao parsear adminLogado do localStorage:', error)
    }
  }

  // CRÍTICO: Permitir acesso APENAS para ADMIN (não manager)
  const shouldAllowAccess = (isAuthenticated && isAdmin) || hasLocalStorageAuth

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