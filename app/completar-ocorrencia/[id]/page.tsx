'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, FileText, Car, User, Phone, Shield, Clock, MapPin, Calendar } from 'lucide-react'
import { FormProvider } from '@/context/form-context'
import DocumentosForm from '@/components/documentos-form'
import Link from 'next/link'

interface SinistroData {
  id: string
  numero_sinistro: string
  tipo_atendimento: string
  tipo_sinistro?: string
  tipo_assistencia?: string
  status: string
  cnh_proprio_nome?: string
  cnh_proprio_cpf?: string
  crlv_proprio_placa?: string
  crlv_proprio_marca?: string
  crlv_proprio_modelo?: string
  observacoes_gerente?: string
  telefone_cliente?: string
  created_by_manager: boolean
}

export default function CompletarOcorrenciaPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const sinistroId = params.id as string
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sinistroData, setSinistroData] = useState<SinistroData | null>(null)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    if (!sinistroId || !token) {
      setError('Link inválido - parâmetros obrigatórios não encontrados')
      setLoading(false)
      return
    }

    const validarToken = async () => {
      try {
        const response = await fetch(`/api/completar-link?sinistroId=${sinistroId}&token=${token}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Erro ao validar token')
        }

        if (result.success && result.valid) {
          setSinistroData(result.sinistro)
          setValidToken(true)
        } else {
          throw new Error('Token inválido')
        }
      } catch (err: any) {
        console.error('Erro ao validar token:', err)
        setError(err.message || 'Erro ao validar acesso')
      } finally {
        setLoading(false)
      }
    }

    validarToken()
  }, [sinistroId, token])

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center'>
        <Card className='max-w-md mx-auto'>
          <CardContent className='p-8 text-center'>
            <Loader2 className='w-12 h-12 animate-spin text-blue-600 mx-auto mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Validando acesso...</h3>
            <p className='text-gray-600'>Aguarde enquanto verificamos suas credenciais.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !validToken || !sinistroData) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
        <Card className='max-w-md mx-auto'>
          <CardContent className='p-8 text-center'>
            <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
            <h3 className='text-xl font-bold text-red-700 mb-4'>Acesso Negado</h3>
            <Alert className='border-red-200 bg-red-50 mb-6'>
              <AlertCircle className='h-4 w-4 text-red-600' />
              <AlertDescription className='text-red-700'>
                {error || 'Link inválido ou expirado'}
              </AlertDescription>
            </Alert>
            <div className='space-y-3'>
              <p className='text-gray-600 text-sm'>
                Possíveis motivos:
              </p>
              <ul className='text-xs text-gray-500 text-left space-y-1'>
                <li>• Link expirado (válido por 30 dias)</li>
                <li>• Token inválido ou já utilizado</li>
                <li>• Sinistro não encontrado</li>
              </ul>
              <div className='pt-4'>
                <Link href='/'>
                  <Button variant='outline' className='w-full'>
                    Voltar ao Início
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se o sinistro já foi concluído, mostrar mensagem
  if (sinistroData.status === 'concluido') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4'>
        <Card className='max-w-md mx-auto'>
          <CardContent className='p-8 text-center'>
            <CheckCircle2 className='w-16 h-16 text-green-500 mx-auto mb-4' />
            <h3 className='text-xl font-bold text-green-700 mb-4'>Documentação Completa</h3>
            <p className='text-gray-600 mb-6'>
              A documentação para o sinistro <strong>#{sinistroData.numero_sinistro}</strong> já foi completada.
            </p>
            <Link href='/'>
              <Button className='w-full'>
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatarDataExpiracao = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return 'Data inválida'
    }
  }

  const formatarTipo = () => {
    if (sinistroData.tipo_atendimento === 'assistencia') {
      const tipos: { [key: string]: string } = {
        hotel: 'Hotel',
        guincho: 'Guincho',
        taxi: 'Táxi',
        pane_seca: 'Pane Seca',
        pane_mecanica: 'Pane Mecânica', 
        pane_eletrica: 'Pane Elétrica',
        trocar_pneu: 'Trocar Pneu'
      }
      return tipos[sinistroData.tipo_assistencia || ''] || sinistroData.tipo_assistencia
    }
    
    const tipos: { [key: string]: string } = {
      colisao: 'Colisão',
      furto: 'Furto',
      roubo: 'Roubo', 
      pequenos_reparos: 'Pequenos Reparos'
    }
    return tipos[sinistroData.tipo_sinistro || ''] || sinistroData.tipo_sinistro
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header com informações básicas */}
      <div className='bg-white shadow-sm border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Completar Documentação
              </h1>
              <p className='text-sm text-gray-600'>
                Sinistro #{sinistroData.numero_sinistro} • {formatarTipo()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informações pré-preenchidas compactas */}
      <div className='bg-blue-50 border-b border-blue-200'>
        <div className='container mx-auto px-4 py-4'>
          <div className='max-w-4xl mx-auto'>
            <h2 className='text-sm font-medium text-blue-800 mb-3'>Dados Pré-preenchidos:</h2>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              {sinistroData.cnh_proprio_nome && (
                <div>
                  <span className='text-blue-600 font-medium'>Nome:</span>
                  <div className='text-blue-800'>{sinistroData.cnh_proprio_nome}</div>
                </div>
              )}
              {sinistroData.cnh_proprio_cpf && (
                <div>
                  <span className='text-blue-600 font-medium'>CPF:</span>
                  <div className='text-blue-800 font-mono'>{sinistroData.cnh_proprio_cpf}</div>
                </div>
              )}
              {sinistroData.telefone_cliente && (
                <div>
                  <span className='text-blue-600 font-medium'>WhatsApp:</span>
                  <div className='text-blue-800 font-mono'>{sinistroData.telefone_cliente}</div>
                </div>
              )}
              {sinistroData.crlv_proprio_placa && (
                <div>
                  <span className='text-blue-600 font-medium'>Veículo:</span>
                  <div className='text-blue-800'>
                    <div className='font-mono'>{sinistroData.crlv_proprio_placa}</div>
                    {(sinistroData.crlv_proprio_marca || sinistroData.crlv_proprio_modelo) && (
                      <div className='text-xs text-blue-600'>
                        {sinistroData.crlv_proprio_marca} {sinistroData.crlv_proprio_modelo}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {sinistroData.observacoes_gerente && (
              <div className='mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200'>
                <span className='text-blue-800 font-medium text-sm'>Observações do Atendente:</span>
                <div className='text-blue-700 text-sm mt-1'>{sinistroData.observacoes_gerente}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulário direto */}
      <div className='container mx-auto px-4 py-6'>
        <div className='max-w-4xl mx-auto'>
          <FormProvider 
            initialData={{
              tipoAtendimento: sinistroData.tipo_atendimento,
              tipoSinistro: sinistroData.tipo_sinistro,
              tipoAssistencia: sinistroData.tipo_assistencia,
              nomeCompleto: sinistroData.cnh_proprio_nome,
              cpf: sinistroData.cnh_proprio_cpf,
              placa: sinistroData.crlv_proprio_placa,
              marca: sinistroData.crlv_proprio_marca,
              modelo: sinistroData.crlv_proprio_modelo,
              sinistroId: sinistroData.id,
              currentStep: 6
            }}
          >
            <DocumentosForm />
          </FormProvider>
        </div>
      </div>
    </div>
  )
}