'use client'

import { useState, useCallback } from 'react'
import { FileUploadFile } from '@/components/ui/file-upload'

interface UseFileUploadOptions {
  sinistroId: string
  onSuccess?: (arquivo: any) => void
  onError?: (error: string) => void
  onProgressUpdate?: (fileId: string, progress: number) => void
}

interface UploadResponse {
  success: boolean
  arquivo?: {
    id: string
    nome: string
    url: string
    tipo: string
    tamanho: number
    data_upload: string
  }
  error?: string
  details?: string
}

export function useFileUpload({ 
  sinistroId, 
  onSuccess, 
  onError,
  onProgressUpdate 
}: UseFileUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  const uploadFiles = useCallback(async (files: FileUploadFile[]) => {
    if (!sinistroId || files.length === 0) return

    setIsUploading(true)
    const results: any[] = []

    try {
      // Upload sequencial para controle melhor de progresso
      for (const file of files) {
        if (file.status !== 'pending') continue

        // Atualizar status para uploading
        file.status = 'uploading'
        file.progress = 0

        try {
          const formData = new FormData()
          // Usar o arquivo original preservado
          let fileToUpload: File
          
          if (file instanceof File) {
            fileToUpload = file
          } else if (file.originalFile && file.originalFile instanceof File) {
            fileToUpload = file.originalFile
          } else {
            console.error('❌ Arquivo não é uma instância de File:', file)
            throw new Error('Arquivo inválido para upload')
          }
          
          formData.append('arquivo', fileToUpload)
          formData.append('sinistroId', sinistroId)
          formData.append('tipo', 'documento_adicional')
          
          console.log('📤 Arquivo original:', {
            name: file.name,
            size: file.size,
            type: file.type,
            id: file.id,
            status: file.status
          })
          console.log('📤 File para upload:', {
            name: fileToUpload.name,
            size: fileToUpload.size,
            type: fileToUpload.type
          })
          console.log('📤 Enviando FormData:', {
            arquivo: {
              name: fileToUpload.name,
              size: fileToUpload.size,
              type: fileToUpload.type
            },
            sinistroId,
            tipo: 'documento_adicional'
          })

          // Simular progresso (em implementação real, você usaria XMLHttpRequest para progresso real)
          const progressInterval = setInterval(() => {
            if (file.progress !== undefined && file.progress < 90) {
              file.progress += 10
              onProgressUpdate?.(file.id, file.progress)
            }
          }, 200)

          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })

          clearInterval(progressInterval)

          const result: UploadResponse = await response.json()

          if (result.success && result.arquivo) {
            file.status = 'success'
            file.progress = 100
            file.url = result.arquivo.url
            
            results.push(result.arquivo)
            setUploadedFiles(prev => [...prev, result.arquivo])
            onSuccess?.(result.arquivo)
          } else {
            file.status = 'error'
            file.error = result.error || 'Erro desconhecido'
            onError?.(file.error)
          }
        } catch (error) {
          file.status = 'error'
          file.error = 'Erro de conexão'
          onError?.(file.error)
        }
      }
    } finally {
      setIsUploading(false)
    }

    return results
  }, [sinistroId, onSuccess, onError, onProgressUpdate])

  const deleteFile = useCallback(async (arquivoId: string) => {
    try {
      const response = await fetch(`/api/upload?arquivoId=${arquivoId}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setUploadedFiles(prev => prev.filter(f => f.id !== arquivoId))
        return true
      } else {
        onError?.(result.error || 'Erro ao deletar arquivo')
        return false
      }
    } catch (error) {
      onError?.('Erro de conexão ao deletar arquivo')
      return false
    }
  }, [onError])

  const loadFiles = useCallback(async () => {
    if (!sinistroId) return

    try {
      const response = await fetch(`/api/upload?sinistroId=${sinistroId}`)
      const result = await response.json()

      if (result.success) {
        setUploadedFiles(result.arquivos || [])
        return result.arquivos
      } else {
        onError?.(result.error || 'Erro ao carregar arquivos')
        return []
      }
    } catch (error) {
      onError?.('Erro de conexão ao carregar arquivos')
      return []
    }
  }, [sinistroId]) // Removido onError das dependências

  return {
    uploadFiles,
    deleteFile,
    loadFiles,
    isUploading,
    uploadedFiles,
    setUploadedFiles
  }
}