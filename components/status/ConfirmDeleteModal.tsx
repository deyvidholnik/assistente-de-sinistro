'use client'

import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog'
import { AlertTriangle } from 'lucide-react'

interface StatusPersonalizado {
  id: string
  nome: string
  cor: string
  icone: string
  ordem: number
  ativo: boolean
}

interface ConfirmDeleteModalProps {
  status: StatusPersonalizado
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDeleteModal({ status, onConfirm, onCancel }: ConfirmDeleteModalProps) {
  const statusLabel = status.nome.charAt(0).toUpperCase() + status.nome.slice(1).replace(/_/g, ' ')

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <AlertTriangle className='w-5 h-5 text-destructive' />
            Remover Status
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
            <p className='text-sm text-foreground mb-3'>
              Tem certeza que deseja remover o status:
            </p>
            
            <div className='flex items-center gap-2'>
              <div 
                className='inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full border'
                style={{
                  backgroundColor: `${status.cor}15`,
                  color: status.cor,
                  borderColor: `${status.cor}40`
                }}
              >
                {statusLabel}
              </div>
            </div>
          </div>

          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>⚠️ Esta ação não pode ser desfeita.</p>
            <p>⚠️ O status será desativado e não aparecerá mais nas opções disponíveis.</p>
            <p>⚠️ Sinistros que já usam este status não serão afetados.</p>
          </div>
        </div>

        <DialogFooter className='flex gap-2'>
          <Button variant='outline' onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant='destructive' onClick={onConfirm}>
            Remover Status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}