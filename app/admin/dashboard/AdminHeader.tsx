'use client'

import React from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sun, Moon, RefreshCw, LogOut } from 'lucide-react'

interface AdminUser {
  id: number
  username: string
  email: string
  full_name: string
  user_level: string
  last_login: string | null
}

interface AdminHeaderProps {
  adminUser: AdminUser | null
  theme: string | undefined
  setTheme: (theme: string) => void
  handleLogout: () => void
  loadMetrics: () => void
  metricsLoading: boolean
  isDark: boolean
}

export function AdminHeader({
  adminUser,
  theme,
  setTheme,
  handleLogout,
  loadMetrics,
  metricsLoading,
  isDark,
}: AdminHeaderProps) {
  return (
    <header
      className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${
        isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'
      }`}
    >
      <div className='container mx-auto px-4 py-3 md:py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2 md:space-x-3 min-w-0 flex-1'>
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
                Dashboard Administrativo
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-1 md:space-x-4 flex-shrink-0'>
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
                {adminUser?.full_name}
              </div>

              {/* Botão logout */}
              <Button
                variant='ghost'
                size='sm'
                onClick={handleLogout}
                className={`hover:bg-opacity-20 transition-all duration-300 ${
                  isDark ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                } p-2`}
                title={`Sair (${adminUser?.full_name})`}
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
