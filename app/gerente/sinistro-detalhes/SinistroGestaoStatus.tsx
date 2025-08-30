import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'
import { StatusBadge } from './cards'
import StatusManager from '@/components/status/StatusManager'
import { useState, useEffect, useMemo } from 'react'

interface StatusPersonalizado {
  id: string
  nome: string
  cor: string
  icone: string
  ordem: number
  ativo: boolean
}

interface SinistroGestaoStatusProps {
  sinistro: any
  onAtualizarStatus?: (sinistroId: string, novoStatus: string, observacoes?: string) => Promise<void>
}

export default function SinistroGestaoStatus({ sinistro, onAtualizarStatus }: SinistroGestaoStatusProps) {
  const [statusList, setStatusList] = useState<StatusPersonalizado[]>([])
  const [loading, setLoading] = useState(true)
  const [showStatusManager, setShowStatusManager] = useState(false)

  const buscarStatus = async () => {
    try {
      const response = await fetch('/api/status-personalizados')
      if (response.ok) {
        const data = await response.json()
        setStatusList(data.status || [])
      }
    } catch (error) {
      console.error('Erro ao buscar status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    buscarStatus()
  }, [])

  const handleStatusChange = () => {
    buscarStatus()
  }

  // Criar uma lista de status que sempre inclui o status atual do sinistro
  const statusOptions = useMemo(() => {
    const currentStatus = sinistro.status
    
    // Se ainda está carregando, criar uma opção temporária com o status atual
    if (loading) {
      return [{
        id: 'current',
        nome: currentStatus,
        cor: '#6b7280',
        icone: 'circle',
        ordem: 0,
        ativo: true
      }]
    }
    
    // Verificar se o status atual existe na lista
    const statusExisteNaLista = statusList.some(status => status.nome === currentStatus)
    
    if (!statusExisteNaLista && currentStatus) {
      // Adicionar o status atual no início da lista se não existir
      return [{
        id: 'current-' + currentStatus,
        nome: currentStatus,
        cor: '#6b7280',
        icone: 'circle',
        ordem: -1,
        ativo: true
      }, ...statusList]
    }
    
    return statusList
  }, [statusList, loading, sinistro.status])

  return (
    <div className='rounded-lg bg-card/50 p-3 md:p-6'>
      <div className='flex items-center justify-between mb-3 md:mb-6'>
        <div className='flex items-center gap-2 md:gap-3'>
          <div className='w-8 h-8 md:w-10 md:h-10 bg-muted rounded-lg flex items-center justify-center'>
            <Settings className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
          </div>
          <div>
            <h3 className='text-base md:text-lg font-semibold text-foreground'>
              {showStatusManager ? 'Gerenciar Status' : 'Gestão de Status'}
            </h3>
            <p className='text-xs md:text-sm text-muted-foreground hidden md:block'>
              {showStatusManager ? 'Configure os status disponíveis' : 'Controle o andamento do sinistro'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowStatusManager(!showStatusManager)}
          className='px-3 py-1.5 text-xs md:text-sm text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border rounded-lg transition-all duration-200 hover:shadow-sm'
        >
          {showStatusManager ? 'Voltar para Gestão' : 'Gerenciar Status'}
        </button>
      </div>

      {showStatusManager ? (
        <StatusManager onStatusChange={handleStatusChange} />
      ) : (
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
              disabled={loading}
            >
              {statusOptions.map((status) => (
                <option
                  key={status.id}
                  value={status.nome}
                >
                  {loading ? `${status.nome.charAt(0).toUpperCase() + status.nome.slice(1).replace(/_/g, ' ')} (carregando...)` : status.nome.charAt(0).toUpperCase() + status.nome.slice(1).replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium text-foreground'>Status Atual</Label>
            <div className='flex items-center'>
              <StatusBadge
                status={sinistro.status}
                size='md'
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
