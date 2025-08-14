"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAdminAuth } from '@/context/admin-auth-context'
import { useRouter } from 'next/navigation'

export function GerenteHeader() {
  const { user } = useAdminAuth()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  return (
    <header className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-6 mb-3 sm:mb-6">
      <div className="flex items-center justify-between gap-3">
        {/* Logo e Título - Centro */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img 
            src="/images/logo.png" 
            alt="PV Auto Proteção" 
            className="h-10 w-10 sm:h-14 sm:w-14 object-cover rounded-full border-2 border-gray-200 shadow-sm flex-shrink-0"
          />
          <div>
            <h1 className="text-base sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
              PV Auto Proteção
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-tight">
              Gerenciamento de Ocorrências
            </p>
          </div>
        </div>
     
        
        {/* User Info e Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.full_name || user?.email}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.user_level}
            </p>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  )
}