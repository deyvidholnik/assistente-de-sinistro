'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Car, CheckCircle2, Camera } from 'lucide-react'
import { validarPlaca } from '@/lib/validations'

interface ModalVeiculoTerceiroProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sinistroId: string
  onSuccess: () => void
  onSuccessWithPhotos?: () => void
  veiculoEditar?: any // Para edição
}

interface FormData {
  placa: string
  renavam: string
  chassi: string
  marca: string
  modelo: string
  anoFabricacao: string
  anoModelo: string
  cor: string
  combustivel: string
  proprietario: string
}

const tiposCombustivel = ['Flex', 'Gasolina', 'Álcool', 'Diesel', 'Elétrico', 'Híbrido', 'GNV']

export default function ModalVeiculoTerceiro({
  open,
  onOpenChange,
  sinistroId,
  onSuccess,
  onSuccessWithPhotos,
  veiculoEditar
}: ModalVeiculoTerceiroProps) {
  const [formData, setFormData] = useState<FormData>({
    placa: veiculoEditar?.placa || '',
    renavam: veiculoEditar?.renavam || '',
    chassi: veiculoEditar?.chassi || '',
    marca: veiculoEditar?.marca || '',
    modelo: veiculoEditar?.modelo || '',
    anoFabricacao: veiculoEditar?.ano_fabricacao?.toString() || '',
    anoModelo: veiculoEditar?.ano_modelo?.toString() || '',
    cor: veiculoEditar?.cor || '',
    combustivel: veiculoEditar?.combustivel || '',
    proprietario: veiculoEditar?.proprietario || ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [actionType, setActionType] = useState<'save' | 'save-photos'>('save')

  const isEdicao = !!veiculoEditar

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const formatarPlaca = (value: string) => {
    const clean = value.replace(/[^A-Z0-9]/g, '').toUpperCase()
    
    // Formato antigo: ABC-1234
    if (clean.length <= 7) {
      return clean.replace(/^([A-Z]{3})([0-9]{1,4})$/, '$1-$2')
    }
    
    // Formato Mercosul: ABC1D23
    return clean.slice(0, 7)
  }

  const validarFormulario = (): string | null => {
    if (!formData.placa.trim()) {
      return 'Placa é obrigatória'
    }

    if (!validarPlaca(formData.placa)) {
      return 'Placa inválida. Use formato ABC-1234 ou ABC1D23'
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent, withPhotos = false) => {
    e.preventDefault()
    
    const validationError = validarFormulario()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError(null)
    setActionType(withPhotos ? 'save-photos' : 'save')

    try {
      const url = '/api/terceiros'
      const method = isEdicao ? 'PUT' : 'POST'
      
      const payload = {
        tipo: 'veiculo',
        ...(isEdicao ? { id: veiculoEditar.id } : { sinistroId }),
        placa: formData.placa.replace(/[^A-Z0-9]/g, ''),
        renavam: formData.renavam || null,
        chassi: formData.chassi || null,
        marca: formData.marca || null,
        modelo: formData.modelo || null,
        anoFabricacao: formData.anoFabricacao ? parseInt(formData.anoFabricacao) : null,
        anoModelo: formData.anoModelo ? parseInt(formData.anoModelo) : null,
        cor: formData.cor || null,
        combustivel: formData.combustivel || null,
        proprietario: formData.proprietario || null
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
        throw new Error(data.error || 'Erro ao salvar veículo terceiro')
      }

      setSuccess(true)
      setTimeout(() => {
        if (withPhotos && onSuccessWithPhotos) {
          onSuccessWithPhotos()
        } else {
          onSuccess()
        }
        onOpenChange(false)
        resetForm()
      }, 1500)

    } catch (err: any) {
      console.error('Erro ao salvar veículo terceiro:', err)
      setError(err.message || 'Erro ao salvar veículo terceiro')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      placa: '',
      renavam: '',
      chassi: '',
      marca: '',
      modelo: '',
      anoFabricacao: '',
      anoModelo: '',
      cor: '',
      combustivel: '',
      proprietario: ''
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
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2'>
            <Car className='w-5 h-5 text-blue-600' />
            {isEdicao ? 'Editar Veículo Terceiro' : 'Adicionar Veículo Terceiro'}
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className='text-center py-8'>
            <CheckCircle2 className='w-16 h-16 text-green-500 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-green-700 mb-2'>
              Veículo {isEdicao ? 'atualizado' : 'adicionado'} com sucesso!
            </h3>
            <p className='text-gray-600'>
              {actionType === 'save-photos' 
                ? 'Abrindo interface de fotos...' 
                : 'Os dados do veículo terceiro foram salvos.'
              }
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => handleSubmit(e, false)} className='space-y-4'>
            {/* Placa */}
            <div>
              <Label htmlFor='placa'>Placa *</Label>
              <Input
                id='placa'
                value={formatarPlaca(formData.placa)}
                onChange={(e) => handleInputChange('placa', e.target.value)}
                placeholder='ABC-1234 ou ABC1D23'
                maxLength={8}
                disabled={loading}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            {/* Renavam e Chassi */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='renavam'>Renavam</Label>
                <Input
                  id='renavam'
                  value={formData.renavam}
                  onChange={(e) => handleInputChange('renavam', e.target.value)}
                  placeholder='Digite o Renavam'
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor='chassi'>Chassi</Label>
                <Input
                  id='chassi'
                  value={formData.chassi}
                  onChange={(e) => handleInputChange('chassi', e.target.value.toUpperCase())}
                  placeholder='Digite o chassi'
                  maxLength={17}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Marca e Modelo */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='marca'>Marca</Label>
                <Input
                  id='marca'
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  placeholder='Ex: Toyota'
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor='modelo'>Modelo</Label>
                <Input
                  id='modelo'
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  placeholder='Ex: Corolla'
                  disabled={loading}
                />
              </div>
            </div>

            {/* Ano de Fabricação e Modelo */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='anoFabricacao'>Ano de Fabricação</Label>
                <Input
                  id='anoFabricacao'
                  type='number'
                  value={formData.anoFabricacao}
                  onChange={(e) => handleInputChange('anoFabricacao', e.target.value)}
                  placeholder='2020'
                  min='1900'
                  max={new Date().getFullYear() + 1}
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor='anoModelo'>Ano do Modelo</Label>
                <Input
                  id='anoModelo'
                  type='number'
                  value={formData.anoModelo}
                  onChange={(e) => handleInputChange('anoModelo', e.target.value)}
                  placeholder='2021'
                  min='1900'
                  max={new Date().getFullYear() + 1}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Cor e Combustível */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='cor'>Cor</Label>
                <Input
                  id='cor'
                  value={formData.cor}
                  onChange={(e) => handleInputChange('cor', e.target.value)}
                  placeholder='Ex: Branco'
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor='combustivel'>Combustível</Label>
                <select
                  id='combustivel'
                  value={formData.combustivel}
                  onChange={(e) => handleInputChange('combustivel', e.target.value)}
                  disabled={loading}
                  className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                >
                  <option value=''>Selecione o combustível</option>
                  {tiposCombustivel.map(tipo => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Proprietário */}
            <div>
              <Label htmlFor='proprietario'>Proprietário</Label>
              <Input
                id='proprietario'
                value={formData.proprietario}
                onChange={(e) => handleInputChange('proprietario', e.target.value)}
                placeholder='Nome do proprietário'
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
                {loading && actionType === 'save' && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                {isEdicao ? 'Atualizar' : 'Salvar'}
              </Button>
              {!isEdicao && onSuccessWithPhotos && (
                <Button
                  type='button'
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={loading}
                  className='flex-1 bg-purple-600 hover:bg-purple-700'
                >
                  {loading && actionType === 'save-photos' && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  <Camera className='mr-2 h-4 w-4' />
                  Salvar e Adicionar Fotos
                </Button>
              )}
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}