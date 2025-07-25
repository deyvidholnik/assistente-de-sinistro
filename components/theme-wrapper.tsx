"use client"

import { useEffect, useState } from 'react'

interface ThemeWrapperProps {
  children: React.ReactNode
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // ✅ Habilitar transições após hidratação
    const timer = setTimeout(() => {
      document.documentElement.classList.add('theme-loaded')
      document.documentElement.classList.add('theme-transitions')
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // ✅ Renderizar normalmente - o script no head já cuida do tema
  return <>{children}</>
} 