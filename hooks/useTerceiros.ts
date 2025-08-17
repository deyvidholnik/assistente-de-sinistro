import { useState, useCallback } from 'react'

interface UseTerceirosProps {
  sinistroId: string
  onRefresh?: () => void
}

export function useTerceiros({ sinistroId, onRefresh }: UseTerceirosProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Função para adicionar condutor terceiro
  const adicionarCondutor = useCallback(async (dados: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/terceiros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'condutor',
          sinistroId,
          ...dados
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao adicionar condutor terceiro')
      }

      onRefresh?.()
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sinistroId, onRefresh])

  // Função para editar condutor terceiro
  const editarCondutor = useCallback(async (id: string, dados: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/terceiros', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'condutor',
          id,
          ...dados
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao editar condutor terceiro')
      }

      onRefresh?.()
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [onRefresh])

  // Função para remover condutor terceiro
  const removerCondutor = useCallback(async (id: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja remover este condutor terceiro?')
    if (!confirmacao) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/terceiros?tipo=condutor&id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao remover condutor terceiro')
      }

      onRefresh?.()
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [onRefresh])

  // Função para adicionar veículo terceiro
  const adicionarVeiculo = useCallback(async (dados: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/terceiros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'veiculo',
          sinistroId,
          ...dados
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao adicionar veículo terceiro')
      }

      onRefresh?.()
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [sinistroId, onRefresh])

  // Função para editar veículo terceiro
  const editarVeiculo = useCallback(async (id: string, dados: any) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/terceiros', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'veiculo',
          id,
          ...dados
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao editar veículo terceiro')
      }

      onRefresh?.()
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [onRefresh])

  // Função para remover veículo terceiro
  const removerVeiculo = useCallback(async (id: string) => {
    const confirmacao = window.confirm('Tem certeza que deseja remover este veículo terceiro?')
    if (!confirmacao) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/terceiros?tipo=veiculo&id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao remover veículo terceiro')
      }

      onRefresh?.()
      return result
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [onRefresh])

  return {
    loading,
    error,
    adicionarCondutor,
    editarCondutor,
    removerCondutor,
    adicionarVeiculo,
    editarVeiculo,
    removerVeiculo,
    clearError: () => setError(null)
  }
}