'use client'

import { useState, useEffect } from 'react'
import { FolderOpen, Plus, Upload } from 'lucide-react'
import { ArquivoCard } from './cards'
import { Button } from '@/components/ui/button'
import { FileUpload, FileUploadFile } from '@/components/ui/file-upload'
import { useFileUpload } from '@/hooks/useFileUpload'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface SinistroArquivosProps {
  arquivos: any[]
  sinistroId: string
  onArquivosUpdate?: (novosArquivos: any[]) => void
}

export default function SinistroArquivos({ arquivos, sinistroId, onArquivosUpdate }: SinistroArquivosProps) {
  const [isUploadVisible, setIsUploadVisible] = useState(false)
  const [files, setFiles] = useState<FileUploadFile[]>([])
  const [todosArquivos, setTodosArquivos] = useState(arquivos)
  const [isLoading, setIsLoading] = useState(false)
  const [arquivosCarregados, setArquivosCarregados] = useState(false)
  const { toast } = useToast()

  const { uploadFiles, isUploading, uploadedFiles, setUploadedFiles, loadFiles, deleteFile } = useFileUpload({
    sinistroId,
    onSuccess: (arquivo) => {
      toast({
        title: 'Upload realizado!',
        description: `Arquivo "${arquivo.nome}" foi enviado com sucesso.`,
      })
      
      const novosArquivos = [...todosArquivos, arquivo]
      setTodosArquivos(novosArquivos)
      onArquivosUpdate?.(novosArquivos)
      
      // Limpar arquivos selecionados após upload bem-sucedido
      setFiles([])
      setIsUploadVisible(false)
    },
    onError: (error) => {
      toast({
        title: 'Erro no upload',
        description: error,
        variant: 'destructive',
      })
    }
  })

  // Carregar arquivos do banco apenas uma vez quando componente for montado
  useEffect(() => {
    if (!sinistroId || arquivosCarregados) return

    const carregarArquivos = async () => {
      setIsLoading(true)
      try {
        const arquivosDoBanco = await loadFiles()
        if (arquivosDoBanco && arquivosDoBanco.length > 0) {
          setTodosArquivos(arquivosDoBanco)
          onArquivosUpdate?.(arquivosDoBanco)
        } else {
          // Se não há arquivos no banco, usar os da prop
          setTodosArquivos(arquivos)
        }
        setArquivosCarregados(true)
      } catch (error) {
        console.error('Erro ao carregar arquivos:', error)
        setTodosArquivos(arquivos)
        setArquivosCarregados(true)
      } finally {
        setIsLoading(false)
      }
    }

    carregarArquivos()
  }, [sinistroId, arquivosCarregados])

  // Inicializar com arquivos das props se não tiver sinistroId
  useEffect(() => {
    if (!sinistroId) {
      setTodosArquivos(arquivos)
      setArquivosCarregados(true)
    }
  }, [sinistroId, arquivos])

  const handleUpload = async (filesToUpload: FileUploadFile[]) => {
    await uploadFiles(filesToUpload)
  }

  const handleDelete = async (arquivoId: string) => {
    const sucesso = await deleteFile(arquivoId)
    if (sucesso) {
      // Remover arquivo da lista local
      const novosArquivos = todosArquivos.filter(arquivo => arquivo.id !== arquivoId)
      setTodosArquivos(novosArquivos)
      onArquivosUpdate?.(novosArquivos)
      
      toast({
        title: 'Arquivo deletado!',
        description: 'O arquivo foi removido com sucesso.',
      })
    }
  }
  return (
    <div
      id='arquivos-section'
      className='space-y-3 md:space-y-6'
    >
      <div className='rounded-lg bg-card/50 p-3 md:p-6'>
        <div className='flex items-center justify-between mb-3 md:mb-6'>
          <div className='flex items-center gap-2 md:gap-3'>
            <div className='w-8 h-8 md:w-10 md:h-10 bg-muted rounded-lg flex items-center justify-center'>
              <FolderOpen className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
            </div>
            <div>
              <h3 className='text-base md:text-lg font-semibold text-foreground'>Arquivos</h3>
              <p className='text-xs md:text-sm text-muted-foreground hidden md:block'>Documentos e fotos anexados</p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsUploadVisible(!isUploadVisible)}
            size='sm'
            variant={isUploadVisible ? 'secondary' : 'default'}
            disabled={isUploading}
            className='ml-2'
          >
            {isUploadVisible ? (
              <>
                <Upload className='w-4 h-4 mr-2' />
                Cancelar
              </>
            ) : (
              <>
                <Plus className='w-4 h-4 mr-2' />
                Adicionar
              </>
            )}
          </Button>
        </div>

        {/* Área de Upload */}
        {isUploadVisible && (
          <Card className='p-4 mb-4 border-dashed border-2'>
            <FileUpload
              onFilesChange={setFiles}
              onUpload={handleUpload}
              maxFiles={5}
              disabled={isUploading}
            />
          </Card>
        )}

        {/* Layout unificado moderno */}
        {isLoading ? (
          <div className='text-center py-12'>
            <div className='w-24 h-24 bg-muted rounded-xl flex items-center justify-center mx-auto mb-6'>
              <FolderOpen className='w-12 h-12 text-muted-foreground animate-pulse' />
            </div>
            <h3 className='text-lg font-semibold text-foreground mb-2'>Carregando arquivos...</h3>
            <p className='text-muted-foreground'>Aguarde enquanto buscamos os arquivos deste sinistro.</p>
          </div>
        ) : todosArquivos.length === 0 ? (
          <div className='text-center py-12'>
            <div className='w-24 h-24 bg-muted rounded-xl flex items-center justify-center mx-auto mb-6'>
              <FolderOpen className='w-12 h-12 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-semibold text-foreground mb-2'>Nenhum arquivo encontrado</h3>
            <p className='text-muted-foreground mb-4'>Este sinistro ainda não possui arquivos anexados.</p>
            
            {!isUploadVisible && (
              <Button
                onClick={() => setIsUploadVisible(true)}
                variant='outline'
                size='lg'
              >
                <Plus className='w-4 h-4 mr-2' />
                Adicionar primeiro arquivo
              </Button>
            )}
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4'>
            {todosArquivos.map((arquivo, index) => (
              <ArquivoCard 
                key={arquivo.id || index} 
                arquivo={arquivo} 
                index={index} 
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}