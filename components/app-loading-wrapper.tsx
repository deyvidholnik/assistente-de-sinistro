"use client"

import { useState, useEffect } from 'react'
import SpectacularLoading from './spectacular-loading'
import { AnimatePresence } from 'framer-motion'

interface AppLoadingWrapperProps {
  children: React.ReactNode
}

export default function AppLoadingWrapper({ children }: AppLoadingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showApp, setShowApp] = useState(false)
  const [shouldShowLoading, setShouldShowLoading] = useState(false)

  useEffect(() => {
    // Verificar se deve mostrar loading (primeira visita ou forçar)
    const hasSeenLoading = sessionStorage.getItem('hasSeenSpectacularLoading')
    const forceLoading = new URLSearchParams(window.location.search).get('loading') === 'true'
    
    if (!hasSeenLoading || forceLoading) {
      setShouldShowLoading(true)
      sessionStorage.setItem('hasSeenSpectacularLoading', 'true')
      
      // Loading por 4 segundos (mais realista)
      const timer = setTimeout(() => {
        setIsLoading(false)
        setTimeout(() => setShowApp(true), 500)
      }, 4000)

      return () => clearTimeout(timer)
    } else {
      // Pular loading se já viu antes
      setIsLoading(false)
      setShowApp(true)
    }
  }, [])

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && shouldShowLoading && (
          <SpectacularLoading
            key="loading"
            onComplete={() => {
              setIsLoading(false)
              setTimeout(() => setShowApp(true), 500)
            }}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {showApp && (
          <div key="app">
            {children}
          </div>
        )}
      </AnimatePresence>
    </>
  )
} 