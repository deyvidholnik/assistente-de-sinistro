"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useTheme } from 'next-themes'
import { useAdminAuth } from '@/context/admin-auth-context'
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff,
  Sun,
  Moon,
  AlertCircle,
  Loader2,
  Mail
} from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState('')
  const [initialCheckDone, setInitialCheckDone] = useState(false)
  
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, user, loading, signIn, signOut } = useAdminAuth()
  const router = useRouter()
  const redirectAttempted = useRef(false)

  // Timeout de segurança para evitar loading infinito - apenas na página de login
  useEffect(() => {
    if (window.location.pathname !== '/admin/login') return

    const timeoutId = setTimeout(() => {
      if (loading) {
        // Se ainda estiver carregando após 10 segundos, algo está errado
        setError('Tempo limite de inicialização excedido. Tente fazer login.')
        setInitialCheckDone(true)
      }
    }, 10000) // 10 segundos

    return () => clearTimeout(timeoutId)
  }, [loading])

  // Verificação imediata do localStorage na montagem do componente
  useEffect(() => {
    // IMPORTANTE: Só fazer redirecionamento se estivermos REALMENTE na página de login
    const currentPath = window.location.pathname
    if (currentPath !== '/admin/login') {
      setInitialCheckDone(true)
      return
    }

    // Verificar localStorage imediatamente para usuários já logados
    const checkLocalStorageAuth = () => {
      try {
        const adminData = localStorage.getItem('adminLogado')
        if (adminData) {
          const parsed = JSON.parse(adminData)
          const userLevel = parsed?.user?.user_level
          
          if (userLevel === 'admin' || userLevel === 'manager') {
            const targetPath = userLevel === 'admin' ? '/admin/dashboard' : '/gerente'
            console.log('🚀 Usuário já logado detectado via localStorage, redirecionando para:', targetPath)
            window.location.href = targetPath
            return true
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar localStorage:', error)
      }
      return false
    }
    
    // Verificação imediata apenas se estiver na página de login
    const wasRedirected = checkLocalStorageAuth()
    
    // Marcar que a verificação inicial foi feita se não houve redirecionamento
    if (!wasRedirected) {
      setInitialCheckDone(true)
    }
    
    // Se não foi redirecionado via localStorage, aguardar contexto
    if (!wasRedirected && !loading && isAuthenticated && user && currentPath === '/admin/login') {
      const targetPath = user.user_level === 'admin' ? '/admin/dashboard' : '/gerente'
      console.log('🚀 Usuário logado detectado via contexto, redirecionando para:', targetPath)
      
      // Usar router.replace para não ficar no histórico
      router.replace(targetPath)
      
      // Fallback com window.location se o router falhar
      setTimeout(() => {
        if (window.location.pathname === '/admin/login') {
          window.location.href = targetPath
        }
      }, 1000) // 1 segundo de timeout
    }
  }, [loading, isAuthenticated, user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Email e senha são obrigatórios')
      return
    }

    setIsLoggingIn(true)
    setError('')

    try {
      console.log('🔐 Iniciando processo de login para:', email)
      await signIn(email, password)
      
      console.log('✅ Login realizado, aguardando dados no localStorage...')
      
      // Aguardar um momento para o contexto salvar no localStorage
      setTimeout(() => {
        const adminData = localStorage.getItem('adminLogado')
        console.log('🔍 Verificando localStorage após login:', adminData)
        
        if (adminData) {
          try {
            const parsed = JSON.parse(adminData)
            const userLevel = parsed?.user?.user_level
            
            if (userLevel) {
              const targetPath = userLevel === 'admin' ? '/admin/dashboard' : '/gerente'
              console.log('🚀 Redirecionando para:', targetPath)
              window.location.href = targetPath
            } else {
              console.error('❌ user_level não encontrado:', parsed)
              setError('Dados de usuário inválidos')
              setIsLoggingIn(false)
            }
          } catch (parseError) {
            console.error('❌ Erro ao parsear localStorage:', parseError)
            setError('Erro nos dados salvos')
            setIsLoggingIn(false)
          }
        } else {
          console.error('❌ adminLogado não encontrado no localStorage')
          setError('Falha ao salvar dados de login')
          setIsLoggingIn(false)
        }
      }, 1500) // Aguardar 1.5 segundos para garantir que o contexto salvou
      
    } catch (err: any) {
      console.error('❌ Erro no login:', err)
      setError(err.message || 'Erro ao fazer login')
      setIsLoggingIn(false)
    }
  }

  const isDark = theme === 'dark'

  // Verificar se há dados no localStorage para mostrar loading de redirecionamento
  const hasLocalStorageAuth = (() => {
    try {
      const adminData = localStorage.getItem('adminLogado')
      if (adminData) {
        const parsed = JSON.parse(adminData)
        return parsed?.user?.user_level === 'admin' || parsed?.user?.user_level === 'manager'
      }
    } catch {
      return false
    }
    return false
  })()

  // Loading inicial do contexto, verificação inicial ou redirecionamento se já autenticado
  if (!initialCheckDone || (loading && !error) || (isAuthenticated && user) || hasLocalStorageAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-background-gradient-light via-background-gradient-medium to-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary mb-4 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
          <p className="text-muted-foreground">
            {hasLocalStorageAuth || (isAuthenticated && user)
              ? 'Redirecionando...' 
              : !initialCheckDone
                ? 'Verificando login...'
                : loading 
                  ? 'Inicializando sistema...' 
                  : 'Verificando autenticação...'}
          </p>
        </div>
      </div>
    )
  }

  // Mostrar loading apenas quando está fazendo login
  if (isLoggingIn) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-all duration-300 bg-gradient-to-br from-background-gradient-light via-background-gradient-medium to-background">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary mb-4 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-primary" />
          <p className="text-muted-foreground">Fazendo login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen transition-all duration-300 bg-gradient-to-br from-background-gradient-light via-background-gradient-medium to-background">
      {/* Header Simplificado */}
      <header className="backdrop-blur-sm border-b transition-all duration-300 bg-card/80 border-border">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image
                  src="/images/logo.png"
                  alt="PV Auto Proteção"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  PV Auto Proteção
                </h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Sistema de Gestão
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="hidden md:flex bg-brand-primary text-brand-primary-foreground">
                <Shield className="w-3 h-3 mr-1" />
                Sistema Interno
              </Badge>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="hover:bg-surface-hover hover:text-accent-foreground transition-all duration-300"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal Centralizado */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl transition-all duration-300 bg-card/90 border-border backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-foreground">
                Login do Sistema
              </CardTitle>
              <p className="text-center text-sm text-muted-foreground">
                Acesse o sistema de gestão
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Digite seu email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 transition-all duration-200 bg-input border-border text-foreground placeholder-muted-foreground focus:border-brand-primary"
                      required
                      autoComplete="email"
                      disabled={isLoggingIn}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-muted-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 transition-all duration-200 bg-input border-border text-foreground placeholder-muted-foreground focus:border-brand-primary"
                      required
                      autoComplete="current-password"
                      disabled={isLoggingIn}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoggingIn}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-md border flex items-center space-x-2 bg-destructive/20 border-destructive text-destructive-foreground">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground font-medium py-2.5"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verificando credenciais...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Entrar
                    </>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Acesso restrito a usuários autorizados
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 PV Auto Proteção. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 