'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTheme } from 'next-themes'
import { supabase } from '@/lib/supabase'
import { Loader2, Shield, ArrowLeft, Sun, Moon, User } from 'lucide-react'

export default function LoginClientePage() {
  const [cpf, setCpf] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const isDark = theme === 'dark'

  const formatCPF = (value: string) => {
    const cpf = value.replace(/\D/g, '')
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.replace(/\D/g, '').length <= 11) {
      setCpf(formatCPF(value))
    }
  }

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '')
    return cleanCPF.length === 11
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateCPF(cpf)) {
      setError('CPF inválido')
      return
    }

    setLoading(true)

    try {
      // Buscar sinistros em todas as colunas onde o CPF pode aparecer usando a view completa
      console.log('🔍 Buscando sinistros na view_sinistros_completos para CPF formatado:', cpf)

      // Tentar buscar com CPF formatado e sem formatação
      const cpfLimpo = cpf.replace(/\D/g, '')
      console.log('🧹 CPF limpo:', cpfLimpo)

      const { data: sinistros, error: supabaseError } = await supabase
        .from('view_sinistros_completos')
        .select('*')
        .or(
          `cpf_furto.eq.${cpfLimpo},cpf_furto.eq.${cpf},cnh_proprio_cpf.eq.${cpfLimpo},cnh_proprio_cpf.eq.${cpf},cnh_terceiro_cpf.eq.${cpfLimpo},cnh_terceiro_cpf.eq.${cpf}`
        )
        .order('data_criacao', { ascending: false })

      console.log('📊 Resultado da busca:', { sinistros, supabaseError })

      if (supabaseError) {
        console.error('❌ Erro no Supabase:', supabaseError)
        throw new Error('Erro ao buscar dados. Tente novamente.')
      }

      if (!sinistros || sinistros.length === 0) {
        console.log('⚠️ Nenhum sinistro encontrado para CPF em todas as colunas:', cpf)
        setError('Nenhuma ocorrência encontrada com o CPF informado')
        return
      }

      console.log('✅ Sinistros encontrados:', sinistros)

      // Buscar o nome do cliente em diferentes colunas
      const nomeCliente =
        sinistros[0]?.nome_completo_furto ||
        sinistros[0]?.cnh_proprio_nome ||
        sinistros[0]?.cnh_terceiros_nome ||
        'Cliente'

      // Salvar dados no localStorage (não sessionStorage)
      localStorage.setItem(
        'clienteLogado',
        JSON.stringify({
          cpf: cpfLimpo, // Salvar CPF limpo para consultas futuras
          cpfFormatado: cpf, // Manter CPF formatado para exibição
          nome: nomeCliente,
          loginTime: new Date().toISOString(),
          sinistros: sinistros,
        })
      )

      // Redirecionar para dashboard
      router.push('/dashboard_cliente')
    } catch (err: any) {
      console.error('❌ Erro no login:', err)
      setError(err.message || 'Erro interno. Tente novamente mais tarde.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen transition-all duration-300 bg-gradient-to-br from-background-gradient-light via-background-gradient-medium to-background'>
      {/* Header */}
      <header className='backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 bg-gray-900/80 border-border'>
        <div className='container mx-auto px-4 py-3 md:py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-2 md:space-x-3'>
              <div className='relative w-12 h-12 md:w-14 md:h-14'>
                <Image
                  src='/images/logo.png'
                  alt='PV Auto Proteção'
                  width={56}
                  height={56}
                  className='object-contain rounded-full'
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
              <div>
                <h1 className='text-lg md:text-xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent'>
                  PV Auto Proteção
                </h1>
                <p
                  className={`text-xs md:text-sm transition-colors duration-300 ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Proteção Veicular
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-2 md:space-x-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className='hover:bg-surface-hover hover:text-accent-foreground transition-all duration-300'
              >
                {isDark ? <Sun className='w-4 h-4' /> : <Moon className='w-4 h-4' />}
              </Button>
              <Link href='/'>
                <Button
                  variant='ghost'
                  className='hover:bg-surface-hover hover:text-accent-foreground transition-all duration-300'
                >
                  <ArrowLeft className='w-4 h-4 mr-2' />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex items-center justify-center min-h-[calc(100vh-80px)] p-4'>
        <div className='w-full max-w-md'>
          <Card className='shadow-2xl transition-all duration-300 bg-card/90 border-border backdrop-blur-sm'>
            <CardHeader className='text-center space-y-4'>
              <div className='flex justify-center'>
                <div className='w-16 h-16 rounded-full flex items-center justify-center bg-brand-primary'>
                  <User className='w-8 h-8 text-white' />
                </div>
              </div>
              <div>
                <CardTitle className='text-2xl font-bold transition-colors duration-300 text-foreground'>
                  Acompanhar Ocorrência
                </CardTitle>
                <p className='mt-2 text-sm text-muted-foreground'>Digite seu CPF para ver todas as suas ocorrências</p>
              </div>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit}
                className='space-y-4'
              >
                <div className='space-y-2'>
                  <Label
                    htmlFor='cpf'
                    className='text-sm font-medium text-muted-foreground'
                  >
                    CPF
                  </Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                      id='cpf'
                      type='text'
                      placeholder='000.000.000-00'
                      value={cpf}
                      onChange={handleCPFChange}
                      className='pl-10 bg-input border-border text-foreground placeholder-muted-foreground'
                      required
                    />
                  </div>
                </div>

                {error && (
                  <Alert variant='destructive'>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type='submit'
                  disabled={loading}
                  className='w-full bg-brand-primary hover:bg-brand-primary/90 text-brand-primary-foreground font-medium py-2.5'
                >
                  {loading ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Verificando...
                    </>
                  ) : (
                    <>
                      <Shield className='w-4 h-4 mr-2' />
                      Acessar
                    </>
                  )}
                </Button>
              </form>

              <div className={`mt-6 text-center pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Dados protegidos e criptografados
                </p>
              </div>
            </CardContent>
          </Card>

          <div className='mt-6 text-center'>
            <div className='mt-12 text-center mb-16'>
              <Link href='/admin/login'>
                <Button
                  variant='outline'
                  className='w-full transition-all duration-300 border-brand-primary text-brand-primary hover:bg-brand-primary/10'
                >
                  <Shield className='w-4 h-4 mr-2' />
                  Acessar Sistema
                </Button>
              </Link>
            </div>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              © 2025 PV Auto Proteção. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
