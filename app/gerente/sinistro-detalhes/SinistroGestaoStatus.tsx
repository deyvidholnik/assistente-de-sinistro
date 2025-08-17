import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { StatusBadge } from './cards'

interface SinistroGestaoStatusProps {
  sinistro: any
  onAtualizarStatus?: (sinistroId: string, novoStatus: string, observacoes?: string) => Promise<void>
}

export default function SinistroGestaoStatus({ sinistro, onAtualizarStatus }: SinistroGestaoStatusProps) {
  return (
    <div className='rounded-lg bg-card/50 p-3 md:p-6 border border-border-light'>
      <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
        <div className='w-8 h-8 md:w-10 md:h-10 bg-muted rounded-lg flex items-center justify-center'>
          <Settings className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
        </div>
        <div>
          <h3 className='text-base md:text-lg font-semibold text-foreground'>Gestão de Status</h3>
          <p className='text-xs md:text-sm text-muted-foreground hidden md:block'>Controle o andamento do sinistro</p>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <Label
            htmlFor='status-select'
            className='text-sm font-medium text-foreground'
          >
            Alterar Status do Sinistro
          </Label>
          <select
            id='status-select'
            value={sinistro.status}
            onChange={(e) => {
              if (onAtualizarStatus) {
                onAtualizarStatus(sinistro.id, e.target.value)
              }
            }}
            className='w-full px-3 py-2 border border-border rounded-lg bg-card/50 text-foreground focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-all duration-200'
          >
            <option value='pendente'>Pendente</option>
            <option value='em_analise'>Em Análise</option>
            <option value='aprovado'>Aprovado</option>
            <option value='rejeitado'>Rejeitado</option>
            <option value='concluido'>Concluído</option>
          </select>
        </div>

        <div className='space-y-2'>
          <Label className='text-sm font-medium text-foreground'>Status Atual</Label>
          <div className='flex items-center'>
            <StatusBadge status={sinistro.status} size='md' />
          </div>
        </div>
      </div>
    </div>
  )
}