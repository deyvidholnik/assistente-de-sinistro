"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { 
  User, 
  LogOut, 
  ChevronDown, 
  Shield,
  Mail,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/context/auth-context'

export function UserProfile() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      console.log('🚪 Fazendo logout...')
      await signOut()
    } catch (error) {
      console.error('❌ Erro no logout:', error)
    }
  }

  if (!user) {
    return null
  }

  // Obter iniciais do email para avatar
  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  // Formatnar data de criação da conta
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 sm:gap-3 h-auto p-2 sm:p-3 hover:bg-gray-50 rounded-lg border border-gray-200"
      >
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
          <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm">
            {getInitials(user.email || 'U')}
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            {user.email?.split('@')[0] || 'Usuário'}
          </span>
          <span className="text-xs text-gray-500">Gerente de Sinistros</span>
        </div>
        <ChevronDown 
          className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Card do perfil */}
          <Card className="absolute right-0 top-full mt-2 w-64 sm:w-72 md:w-80 shadow-lg border z-20 max-w-[calc(100vw-2rem)]">
            <CardContent className="p-3 sm:p-4">
              {/* Header do perfil */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {user.email?.split('@')[0] || 'Usuário'}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>Gerente de Sinistros</span>
                  </div>
                </div>
              </div>

              {/* Informações do usuário */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{user.email}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">ID: {user.id.substring(0, 8)}...</span>
                </div>

                {user.created_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">
                      Conta criada em {formatDate(user.created_at)}
                    </span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-green-50 rounded-md">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">Online</span>
              </div>

              {/* Botão de logout */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 