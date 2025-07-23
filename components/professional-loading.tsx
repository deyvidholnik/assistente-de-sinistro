"use client"

import Image from 'next/image'
import { Shield, Car, CheckCircle, Clock, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ProfessionalLoadingProps {
  message?: string
  submessage?: string
  showProgress?: boolean
  variant?: 'default' | 'dashboard' | 'admin' | 'auth'
}

export default function ProfessionalLoading({ 
  message = "Carregando...", 
  submessage = "Processando informações de proteção veicular",
  showProgress = true,
  variant = 'default'
}: ProfessionalLoadingProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { icon: Shield, text: "Verificando proteção", color: "text-blue-500" },
    { icon: Car, text: "Carregando dados", color: "text-green-500" },
    { icon: CheckCircle, text: "Validando informações", color: "text-purple-500" },
    { icon: Clock, text: "Finalizando", color: "text-orange-500" }
  ]

  useEffect(() => {
    if (!showProgress) return

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) return prev
        return prev + Math.random() * 15
      })
    }, 200)

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % steps.length)
    }, 1000)

    return () => {
      clearInterval(progressInterval)
      clearInterval(stepInterval)
    }
  }, [showProgress])

  const getVariantStyles = () => {
    switch (variant) {
      case 'admin':
        return {
          bg: 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900',
          accent: 'from-amber-400 to-orange-500',
          title: 'Dashboard Administrativo'
        }
      case 'auth':
        return {
          bg: 'bg-gradient-to-br from-emerald-50 via-blue-50 to-indigo-50',
          accent: 'from-emerald-500 to-blue-500',
          title: 'Área de Acesso'
        }
      case 'dashboard':
        return {
          bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
          accent: 'from-blue-500 to-purple-500',
          title: 'Dashboard Cliente'
        }
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50',
          accent: 'from-blue-500 to-indigo-500',
          title: 'PV Auto Proteção'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className={`min-h-screen flex items-center justify-center transition-all duration-300 ${styles.bg}`}>
      <div className="text-center max-w-lg mx-auto px-6">
        {/* Logo e Branding */}
        <div className="mb-8">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className={`absolute inset-0 bg-gradient-to-r ${styles.accent} rounded-full blur-lg opacity-20 animate-pulse`}></div>
            <div className={`relative w-20 h-20 bg-gradient-to-r ${styles.accent} rounded-full flex items-center justify-center shadow-xl`}>
              <Image
                src="/images/logo.png"
                alt="PV Auto Proteção"
                width={48}
                height={48}
                className="object-contain rounded-full"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </div>
          <h1 className={`text-2xl font-bold bg-gradient-to-r ${styles.accent} bg-clip-text text-transparent mb-2`}>
            {styles.title}
          </h1>
          <p className="text-gray-600 text-sm font-medium">
            Sua proteção veicular em primeiro lugar
          </p>
        </div>

        {/* Animação Central */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="relative">
              {/* Carro */}
              <div className={`w-14 h-8 bg-gradient-to-r ${styles.accent} rounded-lg relative shadow-lg transform transition-transform duration-1000 hover:scale-105`}>
                <div className="absolute top-1 left-2 w-2 h-1.5 bg-white rounded-sm opacity-80"></div>
                <div className="absolute top-1 right-2 w-2 h-1.5 bg-white rounded-sm opacity-80"></div>
                <div className="absolute -bottom-0.5 left-1 w-2 h-2 bg-gray-800 rounded-full"></div>
                <div className="absolute -bottom-0.5 right-1 w-2 h-2 bg-gray-800 rounded-full"></div>
              </div>
              
              {/* Escudo de Proteção */}
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-pulse shadow-lg">
                <Shield className="w-2.5 h-2.5 text-white" />
              </div>
              
              {/* Ondas de Proteção */}
              <div className="absolute inset-0 animate-ping">
                <div className="w-16 h-10 border-2 border-blue-400 rounded-lg opacity-30"></div>
              </div>
            </div>
          </div>

          {/* Indicadores de Etapas */}
          {showProgress && (
            <div className="flex items-center justify-center space-x-6 mb-6">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r ' + styles.accent + ' shadow-lg scale-110' 
                        : isCompleted 
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}>
                      <Icon className={`w-4 h-4 ${isActive || isCompleted ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <span className={`text-xs mt-1 transition-colors duration-300 ${
                      isActive ? step.color + ' font-semibold' : 'text-gray-400'
                    }`}>
                      {step.text}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Barra de Progresso */}
          {showProgress && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6 overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${styles.accent} rounded-full transition-all duration-500 ease-out relative`}
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
              </div>
            </div>
          )}
        </div>

        {/* Mensagens */}
        <div className="space-y-3 mb-8">
          <h2 className="text-lg font-semibold text-gray-800">
            {message}
          </h2>
          <p className="text-sm text-gray-600">
            {submessage}
          </p>
          {showProgress && (
            <p className="text-xs text-gray-500">
              {Math.round(progress)}% concluído
            </p>
          )}
        </div>

        {/* Indicadores de Segurança */}
        <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Conexão Segura</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span>SSL Criptografado</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
            <span>Dados Protegidos</span>
          </div>
        </div>
      </div>
    </div>
  )
} 