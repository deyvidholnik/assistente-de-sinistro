"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Shield } from 'lucide-react'

export default function AdminRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se admin está logado
    const adminData = localStorage.getItem('adminLogado')
    
    if (adminData) {
      try {
        const parsed = JSON.parse(adminData)
        if (parsed.user && parsed.user.user_level === 'admin') {
          // Redirecionar para dashboard
          router.push('/admin/dashboard')
        } else {
          // Redirecionar para login
          router.push('/admin/login')
        }
      } catch (error) {
        router.push('/admin/login')
      }
    } else {
      // Redirecionar para login
      router.push('/admin/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
        <p className="text-gray-300">Redirecionando...</p>
      </div>
    </div>
  )
} 