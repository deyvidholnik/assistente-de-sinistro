'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, AlertCircle, CheckCircle, Loader2, Video } from 'lucide-react'
import { Button } from './button'
import { Card } from './card'
import { cn } from '@/lib/utils'

export interface FileUploadFile extends File {
  id: string
  progress?: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  error?: string
  url?: string
  originalFile: File
}

interface FileUploadProps {
  onFilesChange: (files: FileUploadFile[]) => void
  onUpload: (files: FileUploadFile[]) => Promise<void>
  accept?: Record<string, string[]>
  maxSize?: number
  maxFiles?: number
  disabled?: boolean
  className?: string
}

export function FileUpload({
  onFilesChange,
  onUpload,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
    'video/*': ['.mp4', '.webm', '.mov', '.avi']
  },
  maxSize = 100 * 1024 * 1024, // 100MB
  maxFiles = 5,
  disabled = false,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<FileUploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (disabled) return

    console.log('📁 Arquivos aceitos pelo dropzone:', acceptedFiles.map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })))

    const newFiles: FileUploadFile[] = acceptedFiles.map(file => {
      console.log('📁 Processando arquivo:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // Criar um objeto simples que preserva o File original
      const fileWithMetadata = {
        ...file,
        id: Math.random().toString(36).substring(7),
        status: 'pending' as const,
        originalFile: file,
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        arrayBuffer: file.arrayBuffer.bind(file),
        slice: file.slice.bind(file),
        stream: file.stream.bind(file),
        text: file.text.bind(file)
      }
      
      return fileWithMetadata as FileUploadFile
    })

    console.log('📁 Arquivos processados:', newFiles.length, 'arquivos')

    const updatedFiles = [...files, ...newFiles].slice(0, maxFiles)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)

    if (rejectedFiles.length > 0) {
      console.warn('Arquivos rejeitados:', rejectedFiles)
    }
  }, [files, onFilesChange, maxFiles, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: maxFiles - files.length,
    disabled: disabled || isUploading
  })

  const removeFile = (fileId: string) => {
    if (disabled || isUploading) return
    
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const handleUpload = async () => {
    if (files.length === 0 || isUploading) return

    setIsUploading(true)
    try {
      await onUpload(files)
    } catch (error) {
      console.error('Erro no upload:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const updateFileStatus = (fileId: string, updates: Partial<FileUploadFile>) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, ...updates } : f
    ))
  }

  const getFileIcon = (file: FileUploadFile) => {
    if (file.status === 'uploading') return <Loader2 className='w-4 h-4 animate-spin' />
    if (file.status === 'success') return <CheckCircle className='w-4 h-4 text-green-500' />
    if (file.status === 'error') return <AlertCircle className='w-4 h-4 text-red-500' />
    
    // Show video icon for video files
    if (file.type?.startsWith('video/')) {
      return <Video className='w-4 h-4 text-blue-500' />
    }
    
    return <File className='w-4 h-4' />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const pendingFiles = files.filter(f => f.status === 'pending')
  const canUpload = pendingFiles.length > 0 && !isUploading

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop Zone */}
      <Card
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragActive ? 'border-primary bg-primary/5' : 'border-border',
          (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className='p-6 text-center'>
          <Upload className='w-8 h-8 mx-auto mb-4 text-muted-foreground' />
          <p className='text-sm font-medium text-foreground mb-2'>
            {isDragActive
              ? 'Solte os arquivos aqui...'
              : 'Arraste arquivos aqui ou clique para selecionar'
            }
          </p>
          <p className='text-xs text-muted-foreground'>
            Máximo {maxFiles} arquivos, até {formatFileSize(maxSize)} cada
          </p>
          <p className='text-xs text-muted-foreground mt-1'>
            Suporte: PDF, Imagens, Word, TXT, Vídeos
          </p>
        </div>
      </Card>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-foreground'>
            Arquivos Selecionados ({files.length}/{maxFiles})
          </h4>
          <div className='space-y-2'>
            {files.map((file) => (
              <Card key={file.id} className='p-3'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    {getFileIcon(file)}
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-foreground truncate'>
                        {file.name}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        {formatFileSize(file.size)}
                        {file.status === 'error' && file.error && (
                          <span className='text-red-500 ml-2'>• {file.error}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {file.status === 'uploading' && typeof file.progress === 'number' && (
                    <div className='w-20 h-2 bg-secondary rounded-full overflow-hidden mr-3'>
                      <div 
                        className='h-full bg-primary transition-all duration-300'
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Remove Button */}
                  {file.status !== 'uploading' && (
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => removeFile(file.id)}
                      disabled={disabled || isUploading}
                      className='h-8 w-8 p-0'
                    >
                      <X className='w-4 h-4' />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {canUpload && (
        <div className='flex justify-end'>
          <Button 
            onClick={handleUpload}
            disabled={!canUpload}
            className='min-w-32'
          >
            {isUploading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Enviando...
              </>
            ) : (
              <>
                <Upload className='w-4 h-4 mr-2' />
                Enviar {pendingFiles.length} arquivo{pendingFiles.length > 1 ? 's' : ''}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}