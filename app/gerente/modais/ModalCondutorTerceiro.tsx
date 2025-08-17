'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, User, CheckCircle2 } from 'lucide-react'
import { validarCPF } from '@/lib/validations'

interface ModalCondutorTerceiroProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sinistroId: string
  onSuccess: () => void
  condutorEditar?: any // Para edição
}

interface FormData {
  nome: string
  cpf: string
  rg: string
  dataNascimento: string
  categoria: string
  numeroRegistro: string
  dataVencimento: string
}

const categoriasCNH = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE']

export default function ModalCondutorTerceiro({
  open,
  onOpenChange,
  sinistroId,
  onSuccess,
  condutorEditar
}: ModalCondutorTerceiroProps) {
  const [formData, setFormData] = useState<FormData>({
    nome: condutorEditar?.nome || '',
    cpf: condutorEditar?.cpf || '',
    rg: condutorEditar?.rg || '',
    dataNascimento: condutorEditar?.data_nascimento?.split('T')[0] || '',
    categoria: condutorEditar?.categoria || '',
    numeroRegistro: condutorEditar?.numero_registro || '',
    dataVencimento: condutorEditar?.data_vencimento?.split('T')[0] || ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const isEdicao = !!condutorEditar

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const formatarCPF = (value: string) => {
    const digits = value.replace(/\D/g, '')
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  const validarFormulario = (): string | null => {
    if (!formData.nome.trim()) {
      return 'Nome é obrigatório'
    }

    if (!formData.cpf.trim()) {
      return 'CPF é obrigatório'
    }

    if (!validarCPF(formData.cpf)) {
      return 'CPF inválido'
    }

    return null
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
      const url = '/api/terceiros'
      const method = isEdicao ? 'PUT' : 'POST'
      
      const payload = {
        tipo: 'condutor',
        ...(isEdicao ? { id: condutorEditar.id } : { sinistroId }),
        nome: formData.nome,
        cpf: formData.cpf.replace(/\D/g, ''),
        rg: formData.rg || null,
        dataNascimento: formData.dataNascimento || null,
        categoria: formData.categoria || null,
        numeroRegistro: formData.numeroRegistro || null,
        dataVencimento: formData.dataVencimento || null
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao salvar condutor terceiro')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onOpenChange(false)
        resetForm()
      }, 1500)

    } catch (err: any) {
      console.error('Erro ao salvar condutor terceiro:', err)
      setError(err.message || 'Erro ao salvar condutor terceiro')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      categoria: '',
      numeroRegistro: '',
      dataVencimento: ''
    })
    setSuccess(false)
    setError(null)
  }

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false)
      if (!isEdicao) resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2'>
            <User className='w-5 h-5 text-blue-600' />
            {isEdicao ? 'Editar Condutor Terceiro' : 'Adicionar Condutor Terceiro'}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className='text-center py-8'>
            <CheckCircle2 className='w-16 h-16 text-green-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-green-700 mb-2'>
              Condutor {isEdicao ? 'atualizado' : 'adicionado'} com sucesso!
            </h3>
            <p className='text-gray-600'>
              Os dados do condutor terceiro foram salvos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Nome Completo */}
            <div>
              <Label htmlFor='nome'>Nome Completo *</Label>
              <Input
                id='nome'
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder='Digite o nome completo'
                disabled={loading}
              />
            </div>

            {/* CPF */}
            <div>
              <Label htmlFor='cpf'>CPF *</Label>
              <Input
                id='cpf'
                value={formatarCPF(formData.cpf)}
                onChange={(e) => handleInputChange('cpf', e.target.value.replace(/\D/g, ''))}
                placeholder='000.000.000-00'
                maxLength={14}
                disabled={loading}
              />
            </div>

            {/* RG */}
            <div>
              <Label htmlFor='rg'>RG</Label>
              <Input
                id='rg'
                value={formData.rg}
                onChange={(e) => handleInputChange('rg', e.target.value)}
                placeholder='Digite o RG'
                disabled={loading}
              />
            </div>

            {/* Data de Nascimento */}
            <div>
              <Label htmlFor='dataNascimento'>Data de Nascimento</Label>
              <Input
                id='dataNascimento'
                type='date'
                value={formData.dataNascimento}
                onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Categoria CNH */}
            <div>
              <Label htmlFor='categoria'>Categoria CNH</Label>
              <select
                id='categoria'
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                disabled={loading}
                className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <option value=''>Selecione a categoria</option>
                {categoriasCNH.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Número de Registro */}
            <div>
              <Label htmlFor='numeroRegistro'>Número de Registro CNH</Label>
              <Input
                id='numeroRegistro'
                value={formData.numeroRegistro}
                onChange={(e) => handleInputChange('numeroRegistro', e.target.value)}
                placeholder='Digite o número de registro'
                disabled={loading}
              />
            </div>

            {/* Data de Vencimento */}
            <div>
              <Label htmlFor='dataVencimento'>Data de Vencimento CNH</Label>
              <Input
                id='dataVencimento'
                type='date'
                value={formData.dataVencimento}
                onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
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

            {/* Botões */}
            <div className='flex gap-3 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={handleClose}
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
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdicao ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}