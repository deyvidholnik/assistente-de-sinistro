import { Badge } from '@/components/ui/badge'
import {
  Info,
  Calendar,
  Headphones,
  Car,
  Shield,
  AlertTriangle,
  Wrench,
  User,
  Phone,
  Hash,
  UserCheck,
} from 'lucide-react'
import { formatarData, formatarTodasAssistencias } from '../gerente-formatters'
import { StatusBadge } from './cards'

interface SinistroHeaderProps {
  sinistro: any
}

export default function SinistroHeader({ sinistro }: SinistroHeaderProps) {
  // Função para extrair telefone das observações
  const extrairTelefone = (observacoes: string) => {
    if (!observacoes) return null
    const match = observacoes.match(/(?:TelefoneWhatsApp|Telefone):\s*(\([0-9]{2}\)\s*[0-9]{4,5}-?[0-9]{4})/i)
    return match ? match[1] : null
  }

  // Função para limpar observações removendo o telefone
  const limparObservacoes = (observacoes: string) => {
    if (!observacoes) return null
    return observacoes.replace(/(?:TelefoneWhatsApp|Telefone):\s*\([0-9]{2}\)\s*[0-9]{4,5}-?[0-9]{4}/gi, '').trim() || null
  }

  const telefone = sinistro.telefone_cliente || extrairTelefone(sinistro.observacoes_gerente)
  const observacoesLimpas = limparObservacoes(sinistro.observacoes_gerente)
  
  // Debug removido
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
    <div className='rounded-lg bg-card/50 p-3 md:p-6 '>
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

        <div className='bg-surface-elevated rounded-lg p-2 '>
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
          {/* Informações de criação pelo gestor */}
          {sinistro.created_by_manager && (
            <div className='mt-2 pt-2 border-t border-muted'>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <User className='w-3 h-3 text-brand-secondary' />
                <span>Criado pelo Gestor</span>
              </div>
              {observacoesLimpas && (
                <div className='mt-1 text-xs text-muted-foreground'>
                  <span className='font-medium'>Observações:</span> {observacoesLimpas}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informações adicionais do Cliente */}
        <div className='space-y-2'>
          {/* Nome do Cliente */}
          {(sinistro.cnh_proprio_nome || sinistro.nome_completo_furto) && (
            <div className='bg-surface-elevated rounded-lg p-2 '>
              <div className='flex items-center gap-2 text-xs text-muted-foreground mb-1'>
                <UserCheck className='w-3 h-3 text-brand-primary' />
                <span>Cliente</span>
              </div>
              <div className='text-sm font-medium text-foreground'>
                {sinistro.cnh_proprio_nome || sinistro.nome_completo_furto}
              </div>
            </div>
          )}

          {/* Placa do Veículo */}
          {(sinistro.crlv_proprio_placa || sinistro.placa_veiculo_furto) && (
            <div className='bg-surface-elevated rounded-lg p-2 '>
              <div className='flex items-center gap-2 text-xs text-muted-foreground mb-1'>
                <Hash className='w-3 h-3 text-brand-primary' />
                <span>Placa</span>
              </div>
              <div className='text-sm font-medium text-foreground'>
                {sinistro.crlv_proprio_placa || sinistro.placa_veiculo_furto}
              </div>
            </div>
          )}

          {/* Telefone do Cliente */}
          {telefone && (
            <div className='bg-surface-elevated rounded-lg p-2 '>
              <div className='flex items-center gap-2 text-xs text-muted-foreground mb-1'>
                <Phone className='w-3 h-3 text-brand-primary' />
                <span>Telefone</span>
              </div>
              <div className='text-sm font-medium text-foreground'>
                {telefone}
              </div>
            </div>
          )}
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
          {/* Informações de criação pelo gestor */}
          {sinistro.created_by_manager && (
            <div className='mt-2 flex items-center gap-2 text-sm text-muted-foreground'>
              <User className='w-4 h-4 text-brand-secondary' />
              <span>Criado pelo Gestor</span>
            </div>
          )}
          
          {/* Informações adicionais */}
          <div className='mt-3 space-y-2'>
            {/* Nome do Cliente */}
            {(sinistro.cnh_proprio_nome || sinistro.nome_completo_furto) && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <UserCheck className='w-4 h-4 text-brand-primary' />
                <span>Cliente:</span>
                <span className='font-medium text-foreground'>
                  {sinistro.cnh_proprio_nome || sinistro.nome_completo_furto}
                </span>
              </div>
            )}
            
            {/* Placa do Veículo */}
            {(sinistro.crlv_proprio_placa || sinistro.placa_veiculo_furto) && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Hash className='w-4 h-4 text-brand-primary' />
                <span>Placa:</span>
                <span className='font-medium text-foreground'>
                  {sinistro.crlv_proprio_placa || sinistro.placa_veiculo_furto}
                </span>
              </div>
            )}
            
            {/* Telefone do Cliente */}
            {telefone && (
              <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <Phone className='w-4 h-4 text-brand-primary' />
                <span>Telefone:</span>
                <span className='font-medium text-foreground'>
                  {telefone}
                </span>
              </div>
            )}
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
          
          {/* Observações do gerente na versão desktop */}
          {sinistro.created_by_manager && observacoesLimpas && (
            <div className='mt-3 p-3 bg-surface-elevated rounded-lg  lg:max-w-md'>
              <div className='text-sm text-muted-foreground mb-1'>Observações do Gestor:</div>
              <div className='text-sm text-foreground'>{observacoesLimpas}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}