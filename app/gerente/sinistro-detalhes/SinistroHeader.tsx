import { Badge } from '@/components/ui/badge'
import {
  Info,
  Calendar,
  Headphones,
  Car,
  Shield,
  AlertTriangle,
  Wrench,
} from 'lucide-react'
import { formatarData, formatarTodasAssistencias } from '../gerente-formatters'
import { StatusBadge } from './cards'

interface SinistroHeaderProps {
  sinistro: any
}

export default function SinistroHeader({ sinistro }: SinistroHeaderProps) {
  const renderTipoIcon = () => {
    if (sinistro.tipo_atendimento === 'assistencia') {
      return <Headphones className='w-4 h-4 inline mr-1 text-status-info' />
    }
    
    switch (sinistro.tipo_sinistro) {
      case 'colisao':
        return <Car className='w-4 h-4 inline mr-1 text-status-warning' />
      case 'furto':
        return <Shield className='w-4 h-4 inline mr-1 text-status-error' />
      case 'roubo':
        return <AlertTriangle className='w-4 h-4 inline mr-1 text-status-error' />
      case 'pequenos_reparos':
        return <Wrench className='w-4 h-4 inline mr-1 text-status-success' />
      default:
        return null
    }
  }

  const renderTipoLabel = () => {
    if (sinistro.tipo_atendimento === 'assistencia') {
      return formatarTodasAssistencias(sinistro)
    }
    
    switch (sinistro.tipo_sinistro) {
      case 'colisao':
        return 'Colisão'
      case 'furto':
        return 'Furto'
      case 'roubo':
        return 'Roubo'
      case 'pequenos_reparos':
        return 'Pequenos Reparos'
      default:
        return 'Tipo não identificado'
    }
  }

  const renderDesktopTipoIcon = () => {
    if (sinistro.tipo_atendimento === 'assistencia') {
      return <Headphones className='w-5 h-5 text-status-info' />
    }
    
    switch (sinistro.tipo_sinistro) {
      case 'colisao':
        return <Car className='w-5 h-5 text-status-warning' />
      case 'furto':
        return <Shield className='w-5 h-5 text-status-error' />
      case 'roubo':
        return <AlertTriangle className='w-5 h-5 text-status-error' />
      case 'pequenos_reparos':
        return <Wrench className='w-5 h-5 text-status-success' />
      default:
        return null
    }
  }

  return (
    <div className='rounded-lg bg-card/50 p-3 md:p-6 border border-border-light'>
      {/* Mobile Layout */}
      <div className='md:hidden space-y-3'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='flex items-center gap-2 text-xs text-muted-foreground mb-1'>
              <Info className='w-3 h-3 text-brand-primary' />
              <span>Sinistro</span>
            </div>
            <h1 className='text-xl font-bold text-foreground'>#{sinistro.numero_sinistro}</h1>
          </div>
          <StatusBadge status={sinistro.status} size='sm' />
        </div>

        <div className='bg-surface-elevated rounded-lg p-2 border border-border-light'>
          <div className='flex items-center gap-2 text-xs text-muted-foreground mb-1'>
            <Calendar className='w-3 h-3 text-brand-primary' />
            <span>{formatarData(sinistro.data_criacao)}</span>
          </div>
          <div className='text-sm font-medium text-foreground'>
            {renderTipoIcon()}
            {renderTipoLabel()}
            {/* Mostrar assistências adicionais para sinistros */}
            {sinistro.tipo_atendimento !== 'assistencia' && sinistro.assistencias_tipos && sinistro.assistencias_tipos.length > 0 && (
              <span className='ml-2 text-sm text-muted-foreground'>- {formatarTodasAssistencias(sinistro)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className='hidden md:flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6'>
        <div className='space-y-1'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Info className='w-4 h-4 text-brand-primary' />
            <span>Sinistro</span>
          </div>
          <h1 className='text-3xl font-bold text-foreground bg-gradient-to-r from-gradient-primary-start to-gradient-primary-end bg-clip-text text-transparent'>
            #{sinistro.numero_sinistro}
          </h1>
          <div className='flex items-center gap-2 text-muted-foreground'>
            <Calendar className='w-4 h-4 text-brand-primary' />
            <span>{formatarData(sinistro.data_criacao)}</span>
          </div>
        </div>

        <div className='flex flex-col lg:items-end gap-3'>
          <StatusBadge status={sinistro.status} size='md' />

          <div className='text-right'>
            <div className='text-sm text-muted-foreground'>
              {sinistro.tipo_atendimento === 'assistencia' ? 'Tipo de Assistência' : 'Tipo de Sinistro'}
            </div>
            <div className='text-lg font-semibold text-foreground capitalize flex items-center gap-2'>
              {sinistro.tipo_atendimento === 'assistencia' ? (
                <div className='flex items-center gap-2 flex-wrap'>
                  <div className='flex items-center gap-2'>
                    {renderDesktopTipoIcon()}
                    {formatarTodasAssistencias(sinistro)}
                  </div>
                </div>
              ) : (
                <>
                  {renderDesktopTipoIcon()}
                  {renderTipoLabel()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}