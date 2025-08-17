'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { validarCPF, validarPlaca } from '@/lib/validations'
import { gerarNumeroSinistroPadrao } from '@/lib/numero-sinistro'

interface ModalNovaOcorrenciaProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

interface FormData {
  nomeCompleto: string
  cpf: string
  telefone: string
  tipoAtendimento: 'sinistro' | 'assistencia' | ''
  tipoSinistro: string
  tipoAssistencia: string
  placaVeiculo: string
  marcaVeiculo: string
  modeloVeiculo: string
  observacoes: string
}

const tiposSinistro = [
  { value: 'colisao', label: 'Colisão' },
  { value: 'furto', label: 'Furto' },
  { value: 'roubo', label: 'Roubo' },
  { value: 'pequenos_reparos', label: 'Pequenos Reparos' }
]

const tiposAssistencia = [
  { value: 'hotel', label: 'Hotel' },
  { value: 'guincho', label: 'Guincho' },
  { value: 'taxi', label: 'Táxi' },
  { value: 'pane_seca', label: 'Pane Seca' },
  { value: 'pane_mecanica', label: 'Pane Mecânica' },
  { value: 'pane_eletrica', label: 'Pane Elétrica' },
  { value: 'trocar_pneu', label: 'Trocar Pneu' }
]

export function ModalNovaOcorrencia({ open, onOpenChange, onSuccess }: ModalNovaOcorrenciaProps) {
  const [formData, setFormData] = useState<FormData>({
    nomeCompleto: '',
    cpf: '',
    telefone: '',
    tipoAtendimento: '',
    tipoSinistro: '',
    tipoAssistencia: '',
    placaVeiculo: '',
    marcaVeiculo: '',
    modeloVeiculo: '',
    observacoes: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  const validarFormulario = (): string | null => {
    if (!formData.nomeCompleto.trim()) return 'Nome completo é obrigatório'
    if (!formData.cpf.trim()) return 'CPF é obrigatório'
    if (!validarCPF(formData.cpf)) return 'CPF inválido'
    if (!formData.telefone.trim()) return 'Telefone é obrigatório'
    if (!formData.tipoAtendimento) return 'Tipo de atendimento é obrigatório'
    
    if (formData.tipoAtendimento === 'sinistro' && !formData.tipoSinistro) {
      return 'Tipo de sinistro é obrigatório'
    }
    
    if (formData.tipoAtendimento === 'assistencia' && !formData.tipoAssistencia) {
      return 'Tipo de assistência é obrigatório'
    }

    if (formData.placaVeiculo.trim() && !validarPlaca(formData.placaVeiculo)) {
      return 'Placa do veículo inválida'
    }

    return null
  }


  const gerarToken = () => {
    return crypto.randomUUID()
  }

  const obterDataAtualBrasilia = () => {
    const agora = new Date()
    const brasiliaString = agora.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })

    const [dataParte, horaParte] = brasiliaString.split(', ')
    const [dia, mes, ano] = dataParte.split('/')
    const [hora, min, seg] = horaParte.split(':')

    return `${ano}-${mes}-${dia}T${hora}:${min}:${seg}.000-03:00`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationError = validarFormulario()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const numeroSinistro = await gerarNumeroSinistroPadrao()
      const token = gerarToken()
      const dataAtual = obterDataAtualBrasilia()
      
      // Data de expiração do token (30 dias)
      const tokenExpiry = new Date()
      tokenExpiry.setDate(tokenExpiry.getDate() + 30)
      
      // Dados completos do sinistro com todas as colunas
      const sinistroData = {
        numero_sinistro: numeroSinistro,
        tipo_atendimento: formData.tipoAtendimento,
        tipo_sinistro: formData.tipoAtendimento === 'sinistro' ? formData.tipoSinistro : null,
        tipo_assistencia: formData.tipoAtendimento === 'assistencia' ? formData.tipoAssistencia : null,
        status: 'aguardando_documentos',
        data_criacao: dataAtual,
        data_atualizacao: dataAtual,
        documentos_furtados: false,
        outros_veiculos_envolvidos: false,
        total_fotos: 0,
        total_arquivos: 0,
        completion_token: token,
        token_expires_at: tokenExpiry.toISOString(),
        created_by_manager: true,
        cnh_proprio_nome: formData.nomeCompleto,
        cnh_proprio_cpf: formData.cpf,
        telefone_cliente: formData.telefone.trim() || null,
        observacoes_gerente: formData.observacoes || null,
        // Dados do veículo se fornecidos
        crlv_proprio_placa: formData.placaVeiculo.trim() ? formData.placaVeiculo.toUpperCase() : null,
        crlv_proprio_marca: formData.marcaVeiculo.trim() || null,
        crlv_proprio_modelo: formData.modeloVeiculo.trim() || null
      }

      const { data, error: insertError } = await supabase
        .from('sinistros')
        .insert([sinistroData])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Registrar log da criação
      await supabase.from('log_atividades').insert([
        {
          sinistro_id: data.id,
          acao: 'SINISTRO_CRIADO',
          descricao: `Sinistro criado pelo gerente - ${formData.tipoAtendimento}`,
          status_novo: 'aguardando_documentos',
          usuario_nome: 'Gerente',
          created_at: dataAtual,
        },
      ])

      // Telefone já salvo na coluna específica telefone_cliente

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        // Reset form
        setFormData({
          nomeCompleto: '',
          cpf: '',
          telefone: '',
          tipoAtendimento: '',
          tipoSinistro: '',
          tipoAssistencia: '',
          placaVeiculo: '',
          marcaVeiculo: '',
          modeloVeiculo: '',
          observacoes: ''
        })
        setSuccess(false)
      }, 1500)

    } catch (err: any) {
      console.error('Erro ao criar ocorrência:', err)
      setError(err.message || 'Erro ao criar ocorrência')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
            Nova Ocorrência
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className='text-center py-8'>
            <CheckCircle2 className='w-16 h-16 text-green-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-green-700 mb-2'>
              Ocorrência criada com sucesso!
            </h3>
            <p className='text-gray-600'>
              Agora você pode compartilhar o link para completar a documentação.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Dados Pessoais */}
            <div className='space-y-4'>
              <div>
                <Label htmlFor='nomeCompleto'>Nome Completo *</Label>
                <Input
                  id='nomeCompleto'
                  value={formData.nomeCompleto}
                  onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                  placeholder='Digite o nome completo'
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor='cpf'>CPF *</Label>
                <Input
                  id='cpf'
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder='000.000.000-00'
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor='telefone'>Telefone/WhatsApp *</Label>
                <Input
                  id='telefone'
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder='(11) 99999-9999'
                  disabled={loading}
                />
              </div>
            </div>

            {/* Tipo de Atendimento */}
            <div>
              <Label htmlFor='tipoAtendimento'>Tipo de Atendimento *</Label>
              <select
                id='tipoAtendimento'
                value={formData.tipoAtendimento}
                onChange={(e) => handleInputChange('tipoAtendimento', e.target.value)}
                disabled={loading}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <option value=''>Selecione o tipo</option>
                <option value='sinistro'>Sinistro</option>
                <option value='assistencia'>Assistência</option>
              </select>
            </div>

            {/* Tipo Específico */}
            {formData.tipoAtendimento === 'sinistro' && (
              <div>
                <Label htmlFor='tipoSinistro'>Tipo de Sinistro *</Label>
                <select
                  id='tipoSinistro'
                  value={formData.tipoSinistro}
                  onChange={(e) => handleInputChange('tipoSinistro', e.target.value)}
                  disabled={loading}
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value=''>Selecione o tipo de sinistro</option>
                  {tiposSinistro.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {formData.tipoAtendimento === 'assistencia' && (
              <div>
                <Label htmlFor='tipoAssistencia'>Tipo de Assistência *</Label>
                <select
                  id='tipoAssistencia'
                  value={formData.tipoAssistencia}
                  onChange={(e) => handleInputChange('tipoAssistencia', e.target.value)}
                  disabled={loading}
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value=''>Selecione o tipo de assistência</option>
                  {tiposAssistencia.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Dados do Veículo */}
            <div className='space-y-4 border-t pt-4'>
              <h4 className='font-medium text-gray-700'>Dados do Veículo (opcional)</h4>
              
              <div>
                <Label htmlFor='placaVeiculo'>Placa</Label>
                <Input
                  id='placaVeiculo'
                  value={formData.placaVeiculo}
                  onChange={(e) => handleInputChange('placaVeiculo', e.target.value.toUpperCase())}
                  placeholder='ABC-1234 ou ABC1D23'
                  disabled={loading}
                />
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <Label htmlFor='marcaVeiculo'>Marca</Label>
                  <Input
                    id='marcaVeiculo'
                    value={formData.marcaVeiculo}
                    onChange={(e) => handleInputChange('marcaVeiculo', e.target.value)}
                    placeholder='Toyota'
                    disabled={loading}
                  />
                </div>
                <div>
                  <Label htmlFor='modeloVeiculo'>Modelo</Label>
                  <Input
                    id='modeloVeiculo'
                    value={formData.modeloVeiculo}
                    onChange={(e) => handleInputChange('modeloVeiculo', e.target.value)}
                    placeholder='Corolla'
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <Label htmlFor='observacoes'>Observações</Label>
              <Textarea
                id='observacoes'
                value={formData.observacoes}
                onChange={(e) => handleInputChange('observacoes', e.target.value)}
                placeholder='Informações adicionais...'
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Error Alert */}
            {error && (
              <Alert className='border-red-200 bg-red-50'>
                <AlertCircle className='h-4 w-4 text-red-600' />
                <AlertDescription className='text-red-700'>{error}</AlertDescription>
              </Alert>
            )}

            {/* Buttons */}
            <div className='flex gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className='flex-1'
              >
                Cancelar
              </Button>
              <Button
                type='submit'
                disabled={loading}
                className='flex-1'
              >
                {loading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin mr-2' />
                    Criando...
                  </>
                ) : (
                  'Criar Ocorrência'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}