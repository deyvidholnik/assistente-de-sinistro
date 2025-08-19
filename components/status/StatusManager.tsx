'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Settings } from 'lucide-react'
import StatusPicker from './StatusPicker'
import ConfirmDeleteModal from './ConfirmDeleteModal'

interface StatusPersonalizado {
  id: string
  nome: string
  cor: string
  icone: string
  ordem: number
  ativo: boolean
}

interface StatusManagerProps {
  onStatusChange?: () => void
}

export default function StatusManager({ onStatusChange }: StatusManagerProps) {
  const [statusList, setStatusList] = useState<StatusPersonalizado[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [statusToDelete, setStatusToDelete] = useState<StatusPersonalizado | null>(null)

  const buscarStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/status-personalizados')
      if (response.ok) {
        const data = await response.json()
        setStatusList(data.status || [])
      } else {
        console.error('Erro ao buscar status:', response.statusText)
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

  const handleAddStatus = async (novoStatus: { nome: string; cor: string; icone: string }) => {
    try {
      const response = await fetch('/api/status-personalizados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoStatus)
      })

      if (response.ok) {
        await buscarStatus()
        setShowAddModal(false)
        onStatusChange?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar status')
      }
    } catch (error) {
      console.error('Erro ao criar status:', error)
      alert('Erro ao criar status')
    }
  }

  const handleDeleteStatus = async (statusId: string) => {
    try {
      const response = await fetch(`/api/status-personalizados?id=${statusId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await buscarStatus()
        setShowDeleteModal(false)
        setStatusToDelete(null)
        onStatusChange?.()
      } else {
        const error = await response.json()
        if (error.emUso) {
          alert('Este status não pode ser removido pois está sendo usado por sinistros ativos.')
        } else {
          alert(error.error || 'Erro ao remover status')
        }
      }
    } catch (error) {
      console.error('Erro ao remover status:', error)
      alert('Erro ao remover status')
    }
  }

  const openDeleteModal = (status: StatusPersonalizado) => {
    setStatusToDelete(status)
    setShowDeleteModal(true)
  }

  if (loading) {
    return (
      <div className='rounded-lg bg-card/50 p-3 md:p-6'>
        <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
          <div className='w-8 h-8 md:w-10 md:h-10 bg-muted rounded-lg flex items-center justify-center'>
            <Settings className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
          </div>
          <div>
            <h3 className='text-base md:text-lg font-semibold text-foreground'>Gerenciar Status</h3>
            <p className='text-xs md:text-sm text-muted-foreground hidden md:block'>Configure os status disponíveis</p>
          </div>
        </div>
        
        <div className='space-y-3'>
          <div className='h-4 bg-muted animate-pulse rounded' />
          <div className='flex gap-2'>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className='w-20 h-6 bg-muted animate-pulse rounded' />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-medium text-foreground'>Status Disponíveis:</h4>
          <Button
            size='sm'
            onClick={() => setShowAddModal(true)}
            className='flex items-center gap-1'
          >
            <Plus className='w-4 h-4' />
            <span className='hidden md:inline'>Adicionar</span>
          </Button>
        </div>
        
        {statusList.length === 0 ? (
          <p className='text-sm text-muted-foreground'>Nenhum status encontrado.</p>
        ) : (
          <div className='flex flex-wrap gap-2'>
            {statusList.map((status) => (
              <div key={status.id} className='flex items-center gap-1 group'>
                <Badge
                  variant='secondary'
                  className='flex items-center gap-1'
                  style={{
                    backgroundColor: `${status.cor}15`,
                    color: status.cor,
                    borderColor: `${status.cor}40`
                  }}
                >
                  {status.nome.charAt(0).toUpperCase() + status.nome.slice(1).replace(/_/g, ' ')}
                </Badge>
                
                <Button
                  size='sm'
                  variant='ghost'
                  onClick={() => openDeleteModal(status)}
                  className='w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive'
                >
                  <Trash2 className='w-3 h-3' />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <StatusPicker
          onSave={handleAddStatus}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {showDeleteModal && statusToDelete && (
        <ConfirmDeleteModal
          status={statusToDelete}
          onConfirm={() => handleDeleteStatus(statusToDelete.id)}
          onCancel={() => {
            setShowDeleteModal(false)
            setStatusToDelete(null)
          }}
        />
      )}
    </>
  )
}