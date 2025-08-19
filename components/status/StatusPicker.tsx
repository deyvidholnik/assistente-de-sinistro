'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Clock4,
  Eye,
  CheckCircle,
  XCircle,
  PlayCircle,
  Circle,
  FileText,
  CheckCircle2,
  AlertCircle,
  Hourglass,
  Target,
  Flag,
  Star,
  Settings,
  User,
  Phone,
  Mail,
  Calendar,
  Archive,
} from 'lucide-react'

interface StatusPickerProps {
  onSave: (status: { nome: string; cor: string; icone: string }) => void
  onCancel: () => void
}

const cores = [
  '#6B7280', // Gray
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
]

const icones = [
  { name: 'circle', component: Circle, label: 'Círculo' },
  { name: 'clock', component: Clock4, label: 'Relógio' },
  { name: 'eye', component: Eye, label: 'Olho' },
  { name: 'check-circle', component: CheckCircle, label: 'Check' },
  { name: 'check-circle-2', component: CheckCircle2, label: 'Check 2' },
  { name: 'x-circle', component: XCircle, label: 'X' },
  { name: 'play-circle', component: PlayCircle, label: 'Play' },
  { name: 'file-text', component: FileText, label: 'Arquivo' },
  { name: 'alert-circle', component: AlertCircle, label: 'Alerta' },
  { name: 'hourglass', component: Hourglass, label: 'Ampulheta' },
  { name: 'target', component: Target, label: 'Alvo' },
  { name: 'flag', component: Flag, label: 'Bandeira' },
  { name: 'star', component: Star, label: 'Estrela' },
  { name: 'settings', component: Settings, label: 'Engrenagem' },
  { name: 'user', component: User, label: 'Usuário' },
  { name: 'phone', component: Phone, label: 'Telefone' },
  { name: 'mail', component: Mail, label: 'Email' },
  { name: 'calendar', component: Calendar, label: 'Calendário' },
  { name: 'archive', component: Archive, label: 'Arquivo' },
]

export default function StatusPicker({ onSave, onCancel }: StatusPickerProps) {
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState('#3B82F6')
  const [icone, setIcone] = useState('circle')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome.trim()) {
      setError('Nome é obrigatório')
      return
    }

    if (nome.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres')
      return
    }

    if (nome.trim().length > 50) {
      setError('Nome deve ter no máximo 50 caracteres')
      return
    }

    // Validar caracteres especiais
    if (!/^[a-zA-Z0-9\s_-]+$/.test(nome.trim())) {
      setError('Nome pode conter apenas letras, números, espaços, hífens e underscores')
      return
    }

    setError('')

    const nomeFormatado = nome.trim().toLowerCase().replace(/\s+/g, '_')

    onSave({
      nome: nomeFormatado,
      cor,
      icone,
    })
  }

  const iconeSelecionado = icones.find((i) => i.name === icone)
  const IconeComponent = iconeSelecionado?.component || Circle

  return (
    <Dialog
      open={true}
      onOpenChange={onCancel}
    >
      <DialogContent className='sm:max-w-md p-4'>
        <DialogHeader>
          <DialogTitle>Criar Novo Status</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          {error && (
            <div className='p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg'>
              {error}
            </div>
          )}

          {/* Nome */}
          <div className='space-y-2 p-2'>
            <Label htmlFor='nome'>Nome do Status</Label>
            <Input
              id='nome'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder='Ex: Aguardando Revisão'
              maxLength={50}
            />
            <p className='text-xs text-muted-foreground'>{nome.length}/50 caracteres</p>
          </div>

          {/* Preview */}
          {nome && (
            <div className='space-y-2'>
              <Label>Preview</Label>
              <div className='flex items-center gap-2 p-3 border rounded-lg bg-muted/50'>
                <div
                  className='inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full border'
                  style={{
                    backgroundColor: `${cor}15`,
                    color: cor,
                    borderColor: `${cor}40`,
                  }}
                >
                  <IconeComponent className='w-3 h-3' />
                  {nome.charAt(0).toUpperCase() + nome.slice(1)}
                </div>
              </div>
            </div>
          )}

          {/* Cor */}
          <div className='space-y-2 p-2'>
            <Label>Cor</Label>
            <div className='grid grid-cols-5 gap-2'>
              {cores.map((corOption) => (
                <button
                  key={corOption}
                  type='button'
                  onClick={() => setCor(corOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${
                    cor === corOption ? 'border-foreground' : 'border-border'
                  }`}
                  style={{ backgroundColor: corOption }}
                />
              ))}
            </div>
            <div className='flex items-center gap-2'>
              <Input
                type='color'
                value={cor}
                onChange={(e) => setCor(e.target.value)}
                className='w-12 h-8 p-1 cursor-pointer'
              />
              <span className='text-sm text-muted-foreground'>{cor}</span>
            </div>
          </div>

          {/* Ícone */}
          <div className='space-y-2'>
            <Label>Ícone</Label>
            <div className='grid grid-cols-6 gap-2  overflow-y-auto'>
              {icones.map((iconeOption) => {
                const IconeOption = iconeOption.component
                return (
                  <button
                    key={iconeOption.name}
                    type='button'
                    onClick={() => setIcone(iconeOption.name)}
                    className={`p-2 rounded-lg border transition-all hover:bg-muted ${
                      icone === iconeOption.name ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    title={iconeOption.label}
                  >
                    <IconeOption className='w-4 h-4 mx-auto' />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Botões */}
          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type='submit'
              disabled={!nome.trim()}
            >
              Criar Status
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
