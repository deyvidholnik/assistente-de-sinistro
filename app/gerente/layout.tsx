"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, Shield } from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/context/admin-auth-context'

function GerenteLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, isAuthenticated, user } = useAdminAuth()
  const pathname = usePathname()
  const router = useRouter()

  // Efeito para redirecionamentos seguros
  useEffect(() => {
    if (!loading) {
      // Redirecionar para login se não autenticado
      if (!isAuthenticated) {
        console.log('❌ Não autenticado, redirecionando para login')
        router.replace('/admin/login')
        return
      }

      // Verificar se é manager ou admin
      if (user?.user_level !== 'manager' && user?.user_level !== 'admin') {
        console.log('❌ Sem permissão, redirecionando para login')
        router.replace('/admin/login')
        return
      }
    }
  }, [loading, isAuthenticated, user, router])

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

  // Bloquear renderização se não autenticado (enquanto redireciona)
  if (!isAuthenticated) {
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