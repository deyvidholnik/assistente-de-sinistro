'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sun, Moon, LogOut, Wifi, WifiOff, Loader2, ArrowLeft } from 'lucide-react'
import { useAdminAuth } from '@/context/admin-auth-context'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'

interface GerenteHeaderProps {
  realtimeStatus?: 'CONNECTING' | 'SUBSCRIBED' | 'ERROR'
}

export function GerenteHeader({ realtimeStatus = 'CONNECTING' }: GerenteHeaderProps) {
  const { user, signOut } = useAdminAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'
  
  // Estado para controlar se deve mostrar o botão de voltar
  const [showBackButton, setShowBackButton] = useState(false)
  
  // Verificar se veio do admin/dashboard
  useEffect(() => {
    const from = searchParams.get('from')
    setShowBackButton(from === 'admin')
  }, [searchParams])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Erro no logout:', error)
      // Fallback caso o signOut falhe
      localStorage.removeItem('adminLogado')
      router.push('/admin/login')
    }
  }

  // Função para voltar ao admin/dashboard
  const handleBackToAdmin = () => {
    router.push('/admin/dashboard')
  }

  // Função para renderizar ícone de status realtime
  const renderRealtimeIcon = () => {
    switch (realtimeStatus) {
      case 'SUBSCRIBED':
        return <Wifi className='w-4 h-4 text-green-500' />
      case 'ERROR':
        return <WifiOff className='w-4 h-4 text-red-500' />
      case 'CONNECTING':
      default:
        return <Loader2 className='w-4 h-4 text-yellow-500 animate-spin' />
    }
  }

  const getRealtimeTitle = () => {
    switch (realtimeStatus) {
      case 'SUBSCRIBED':
        return 'Atualizações em tempo real ativas'
      case 'ERROR':
        return 'Erro na conexão de tempo real'
      case 'CONNECTING':
      default:
        return 'Conectando ao tempo real...'
    }
  }

  return (
    <header
      className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${
        isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'
      }`}
    >
      <div className='container mx-auto px-4 py-3 md:py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 md:space-x-3 min-w-0 flex-1'>
            {/* Botão de voltar - só aparece se veio do admin */}
            {showBackButton && (
              <Button
                onClick={handleBackToAdmin}
                variant='ghost'
                size='sm'
                className={`hover:bg-opacity-20 transition-all duration-300 ${
                  isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                } p-2 flex-shrink-0`}
                title='Voltar ao Dashboard Admin'
              >
                <ArrowLeft className='w-4 h-4' />
              </Button>
            )}
            
            <div className='relative w-10 h-10 md:w-14 md:h-14 flex-shrink-0'>
              <Image
                src='/images/logo.png'
                alt='PV Auto Proteção'
                width={56}
                height={56}
                className='object-contain rounded-full'
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
            <div className='min-w-0 flex-1'>
              <h1 className='text-sm md:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent whitespace-nowrap'>
                PV Auto Proteção
              </h1>
              <p
                className={`text-xs md:text-sm transition-colors duration-300 ${
                  isDark ? 'text-gray-300' : 'text-gray-600'
                } hidden md:block`}
              >
                Gerenciamento de Ocorrências
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-1 md:space-x-4 flex-shrink-0'>
            {/* Status Realtime */}
            <div 
              className='p-2 rounded-lg transition-all duration-300 cursor-help'
              title={getRealtimeTitle()}
            >
              {renderRealtimeIcon()}
            </div>

            {/* Tema */}
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className={`hover:bg-opacity-20 transition-all duration-300 ${
                isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
              } p-2`}
            >
              {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
            </Button>

            {/* User menu mobile/desktop */}
            <div className='flex items-center'>
              {/* Nome do usuário - compacto no mobile, completo no desktop */}
              <div
                className={`text-xs md:text-sm ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                } mr-2 truncate max-w-[100px] md:max-w-none`}
              >
                <span className='hidden md:inline'>Olá, </span>
                {user?.full_name || user?.email}
              </div>

              {/* Botão logout */}
              <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                className={`hover:bg-opacity-20 transition-all duration-300 ${
                  isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                } p-2`}
                title={`Sair (${user?.full_name || user?.email})`}
              >
                <LogOut className='w-4 h-4' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}