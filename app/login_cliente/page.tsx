"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTheme } from '@/context/theme-context'
import { supabase } from '@/lib/supabase'
import { Loader2, Shield, ArrowLeft, Sun, Moon, User, Calendar } from 'lucide-react'

export default function LoginClientePage() {
  const [cpf, setCpf] = useState('')
  const [dataNascimento, setDataNascimento] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { darkMode, toggleDarkMode } = useTheme()
  const router = useRouter()

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
      setError('CPF deve ter 11 dígitos')
      return
    }

    if (!dataNascimento) {
      setError('Data de nascimento é obrigatória')
      return
    }

    setLoading(true)

    try {
      // Buscar sinistros do cliente no Supabase
      const cpfLimpo = cpf.replace(/\D/g, '')
      const cpfFormatado = cpf
      
      console.log('🔍 Tentando login com:', {
        cpfOriginal: cpf,
        cpfLimpo: cpfLimpo,
        cpfFormatado: cpfFormatado
      })

      // Primeiro, vamos buscar todos os registros para ver o formato dos CPFs
      const { data: todosCpfs, error: errorTodos } = await supabase
        .from('view_sinistros_completos')
        .select('cnh_proprio_cpf')
        .not('cnh_proprio_cpf', 'is', null)
      
      if (!errorTodos && todosCpfs) {
        console.log('📊 CPFs encontrados no banco:', todosCpfs.map(item => item.cnh_proprio_cpf))
      }

      // Buscar por CPF limpo OU formatado
      let { data: sinistros, error } = await supabase
        .from('view_sinistros_completos')
        .select(`
          id,
          numero_sinistro,
          tipo_atendimento,
          tipo_sinistro,
          tipo_assistencia,
          status,
          data_criacao,
          data_atualizacao,
          cnh_proprio_nome,
          cnh_proprio_cpf,
          crlv_proprio_placa,
          crlv_proprio_marca,
          crlv_proprio_modelo,
          crlv_proprio_ano,
          total_fotos,
          total_arquivos
        `)
        .or(`cnh_proprio_cpf.eq.${cpfLimpo},cnh_proprio_cpf.eq.${cpfFormatado}`)
        .order('data_criacao', { ascending: false })

      console.log('📋 Resultado da busca na view:', {
        error: error,
        quantidadeSinistros: sinistros?.length || 0,
        sinistros: sinistros
      })

      // Se a view falhou ou não retornou resultados, tentar busca direta nas tabelas
      if (error || !sinistros || sinistros.length === 0) {
        console.log('🔄 Tentando busca alternativa nas tabelas...')
        
        const { data: cnhData, error: cnhError } = await supabase
          .from('dados_cnh')
          .select(`
            sinistro_id,
            nome,
            cpf,
            sinistros!inner(
              id,
              numero_sinistro,
              tipo_atendimento,
              tipo_sinistro,
              tipo_assistencia,
              status,
              data_criacao,
              data_atualizacao
            )
          `)
          .eq('tipo_titular', 'proprio')
          .or(`cpf.eq.${cpfLimpo},cpf.eq.${cpfFormatado}`)

        console.log('📋 Resultado da busca alternativa:', {
          error: cnhError,
          quantidadeRegistros: cnhData?.length || 0,
          dados: cnhData
        })

        if (cnhError) {
          console.error('❌ Erro na busca alternativa:', cnhError)
          setError('Erro ao consultar dados. Tente novamente.')
          return
        }

        if (!cnhData || cnhData.length === 0) {
          setError(`Não foram encontrados registros para este CPF (${cpfLimpo}). Verifique seus dados ou entre em contato conosco.`)
          return
        }

                 // Converter dados da busca alternativa para o formato esperado
         sinistros = cnhData.map(item => {
           const sinistro = Array.isArray(item.sinistros) ? item.sinistros[0] : item.sinistros
           return {
             id: sinistro.id,
             numero_sinistro: sinistro.numero_sinistro,
             tipo_atendimento: sinistro.tipo_atendimento,
             tipo_sinistro: sinistro.tipo_sinistro,
             tipo_assistencia: sinistro.tipo_assistencia,
             status: sinistro.status,
             data_criacao: sinistro.data_criacao,
             data_atualizacao: sinistro.data_atualizacao,
             cnh_proprio_nome: item.nome,
             cnh_proprio_cpf: item.cpf,
             crlv_proprio_placa: '',
             crlv_proprio_marca: '',
             crlv_proprio_modelo: '',
             crlv_proprio_ano: 0,
             total_fotos: 0,
             total_arquivos: 0
           }
         })
      }

      if (!sinistros || sinistros.length === 0) {
        setError(`Não foram encontrados registros para este CPF (${cpfLimpo}). Verifique seus dados ou entre em contato conosco.`)
        return
      }

      console.log('✅ Login bem-sucedido! Sinistros encontrados:', sinistros.length)

      // Salvar dados do cliente no localStorage
      localStorage.setItem('clienteLogado', JSON.stringify({
        cpf,
        dataNascimento,
        loginTime: new Date().toISOString(),
        sinistros: sinistros
      }))

      router.push('/dashboard_cliente')
    } catch (err: any) {
      console.error('Erro no login:', err)
      setError('Erro ao fazer login. Verifique seus dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'}`}>
      {/* Header */}
      <header className={`backdrop-blur-sm border-b sticky top-0 z-50 transition-all duration-300 ${darkMode ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'}`}>
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="relative w-12 h-12 md:w-14 md:h-14">
                <Image
                  src="/images/logo.png"
                  alt="PV Auto Proteção"
                  width={56}
                  height={56}
                  className="object-contain rounded-full"
                />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-800 to-purple-800 bg-clip-text text-transparent">
                  PV Auto Proteção
                </h1>
                <p className={`text-xs md:text-sm transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Proteção Veicular</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleDarkMode}
                className={`hover:bg-opacity-20 transition-all duration-300 ${darkMode ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Link href="/">
                <Button variant="ghost" className={`hover:bg-opacity-20 transition-all duration-300 ${darkMode ? 'hover:bg-white text-gray-300' : 'hover:bg-blue-50 text-gray-700'}`}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
        <div className="w-full max-w-md">
          {/* Logo e título */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Área do Cliente
            </h1>
            <p className={`transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Acesse sua conta para acompanhar sinistros e assistências
            </p>
          </div>

          {/* Card de login */}
          <Card className={`shadow-xl border-0 transition-all duration-300 ${darkMode ? 'bg-gray-800/50 backdrop-blur-sm border border-gray-700/50' : 'bg-white'}`}>
            <CardHeader className="text-center pb-4">
              <CardTitle className={`text-xl font-semibold transition-colors duration-300 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                Faça seu Login
              </CardTitle>
              <p className={`text-sm mt-2 transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Digite seu CPF e data de nascimento para acessar
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campo de CPF */}
                <div className="space-y-2">
                  <Label htmlFor="cpf" className={`text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={cpf}
                    onChange={handleCPFChange}
                    placeholder="000.000.000-00"
                    required
                    className={`h-11 transition-all duration-300 ${darkMode ? 'bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    disabled={loading}
                  />
                </div>

                {/* Campo de data de nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento" className={`text-sm font-medium transition-colors duration-300 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data de Nascimento
                  </Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    required
                    className={`h-11 transition-all duration-300 ${darkMode ? 'bg-gray-700/50 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                    disabled={loading}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <Alert className={`transition-all duration-300 ${darkMode ? 'border-red-600 bg-red-900/20' : 'border-red-200 bg-red-50'}`}>
                    <AlertDescription className={`text-sm transition-colors duration-300 ${darkMode ? 'text-red-300' : 'text-red-700'}`}>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Botão de login */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  disabled={loading || !cpf || !dataNascimento}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entrando...
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              {/* Info adicional */}
              <div className={`mt-6 pt-4 border-t transition-all duration-300 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <p className={`text-xs text-center transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Primeira vez aqui? Seus dados foram cadastrados quando você contratou a proteção veicular.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 