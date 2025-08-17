import { Headphones } from 'lucide-react'
import { formatarTipoAssistencia } from '../gerente-formatters'

interface SinistroAssistenciasAdicionaisProps {
  sinistro: any
}

export default function SinistroAssistenciasAdicionais({ sinistro }: SinistroAssistenciasAdicionaisProps) {
  if (!sinistro.assistencia_adicional || !sinistro.assistencias_tipos || sinistro.assistencias_tipos.length === 0) {
    return null
  }

  const assistenciasArray = Array.isArray(sinistro.assistencias_tipos)
    ? sinistro.assistencias_tipos
    : typeof sinistro.assistencias_tipos === 'string'
    ? sinistro.assistencias_tipos.split(',')
    : []

  const assistenciaInfo: { [key: string]: { label: string; icon: string; color: string } } = {
    guincho: { label: 'Guincho', icon: '🚛', color: 'bg-status-info/10 text-status-info border-status-info' },
    taxi: { label: 'Táxi', icon: '🚕', color: 'bg-status-warning/10 text-status-warning border-status-warning' },
    hotel: { label: 'Hotel', icon: '🏨', color: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary' },
    mecanica: { label: 'Mecânica', icon: '🔧', color: 'bg-status-success/10 text-status-success border-status-success' },
    vidraceiro: {
      label: 'Vidraceiro',
      icon: '🪟',
      color: 'bg-brand-primary/10 text-brand-primary border-brand-primary',
    },
    borracheiro: {
      label: 'Borracheiro',
      icon: '🛞',
      color: 'bg-status-warning/10 text-status-warning border-status-warning',
    },
    eletricista: { label: 'Eletricista', icon: '⚡', color: 'bg-status-error/10 text-status-error border-status-error' },
  }

  return (
    <div className='space-y-3'>
      <h3 className='text-base md:text-lg font-semibold text-foreground px-1'>Assistências Adicionais</h3>
      <div className='border border-status-info bg-status-info/10 rounded-lg p-3 md:p-6'>
        <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
          <div className='w-8 h-8 md:w-10 md:h-10 bg-status-info/20 rounded-lg flex items-center justify-center'>
            <Headphones className='w-4 h-4 md:w-5 md:h-5 text-status-info' />
          </div>
          <div>
            <h4 className='text-base md:text-lg font-semibold text-status-info'>Serviços Adicionais Solicitados</h4>
            <p className='text-xs md:text-sm text-status-info/80 hidden md:block'>
              Lista de assistências extras solicitadas pelo cliente
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
          {assistenciasArray.map((tipo: string, index: number) => {
            const tipoLimpo = tipo.trim()
            const info = assistenciaInfo[tipoLimpo] || {
              label: tipoLimpo,
              icon: '🛠️',
              color: 'bg-muted text-foreground border-border',
            }

            return (
              <div
                key={index}
                className={`p-3 rounded-lg ${info.color} border shadow-sm`}
              >
                <div className='flex items-center gap-2'>
                  <span className='text-lg'>{info.icon}</span>
                  <span className='font-medium text-sm'>{info.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}