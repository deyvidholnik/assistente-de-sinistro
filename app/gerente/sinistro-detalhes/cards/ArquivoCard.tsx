import { Camera, FileText, Trash2, Loader2, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { convertPdfToImage, isPdfFile } from '@/lib/pdf-utils'
import { converterNomeArquivoParaTitulo } from '@/lib/nome-arquivo-utils'

interface ArquivoCardProps {
  arquivo: any
  index: number
  onDelete?: (arquivoId: string) => void
}

export default function ArquivoCard({ arquivo, index, onDelete }: ArquivoCardProps) {
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null)
  const [isLoadingPdf, setIsLoadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'cnh_proprio':
        return { badge: 'CNH', label: 'CNH Principal' }
      case 'cnh_terceiro':
        return { badge: 'CNH 3º', label: 'CNH Terceiro' }
      case 'crlv_proprio':
        return { badge: 'CRLV', label: 'CRLV Principal' }
      case 'crlv_terceiro':
        return { badge: 'CRLV 3º', label: 'CRLV Terceiro' }
      case 'boletim_ocorrencia':
        return { badge: 'B.O.', label: 'Boletim de Ocorrência' }
      case 'foto_veiculo':
        return { badge: 'Foto', label: 'Foto do Veículo' }
      case 'documento_adicional':
        return { badge: 'Doc', label: 'Documento Adicional' }
      case 'video_proprio':
        return { badge: 'Vídeo', label: 'Vídeo Principal' }
      case 'video_terceiro':
        return { badge: 'Vídeo 3º', label: 'Vídeo Terceiro' }
      default:
        return { badge: 'Arquivo', label: 'Documento' }
    }
  }

  const nomeArquivo = arquivo.nome_original || arquivo.nome || 'Arquivo sem nome'
  const urlArquivo = arquivo.url_arquivo || arquivo.url
  const tipoInfo = getTipoLabel(arquivo.tipo_arquivo || arquivo.tipo)
  
  const isImage = urlArquivo && (
    arquivo.tipo_mime?.startsWith('image/') || 
    arquivo.tipo_arquivo === 'foto_veiculo' ||
    arquivo.tipo_arquivo === 'documento_adicional' ||
    arquivo.tipo === 'documento_adicional' ||
    // Detectar por extensão do arquivo
    nomeArquivo.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/)
  )

  const isPdf = urlArquivo && (
    arquivo.tipo_mime === 'application/pdf' ||
    nomeArquivo.toLowerCase().endsWith('.pdf')
  )

  const isVideo = urlArquivo && (
    arquivo.tipo_arquivo === 'video_proprio' ||
    arquivo.tipo_arquivo === 'video_terceiro' ||
    arquivo.tipo_mime?.startsWith('video/') ||
    nomeArquivo.toLowerCase().match(/\.(mp4|webm|mov|avi)$/)
  )

  // Efeito para converter PDF em imagem quando necessário
  useEffect(() => {
    if (!isPdf || !urlArquivo) return

    const convertPdfForPreview = async () => {
      setIsLoadingPdf(true)
      setPdfError(null)
      
      try {
        // Buscar o arquivo PDF
        const response = await fetch(urlArquivo)
        if (!response.ok) {
          throw new Error('Não foi possível baixar o arquivo PDF')
        }
        
        const blob = await response.blob()
        const file = new File([blob], nomeArquivo, { type: 'application/pdf' })
        
        // Converter para imagem
        const base64Image = await convertPdfToImage(file)
        setPdfPreviewUrl(`data:image/png;base64,${base64Image}`)
      } catch (error) {
        console.error('Erro ao converter PDF:', error)
        setPdfError('Erro ao processar PDF')
      } finally {
        setIsLoadingPdf(false)
      }
    }

    convertPdfForPreview()
  }, [isPdf, urlArquivo, nomeArquivo])

  // URL da preview final (imagem original, PDF convertido ou vídeo)
  const finalPreviewUrl = isPdf ? pdfPreviewUrl : urlArquivo
  const canShowPreview = isImage || (isPdf && pdfPreviewUrl) || isVideo



  return (
    <div
      key={index}
      className='group relative overflow-hidden rounded-lg md:rounded-2xl bg-card/50 hover:border-brand-primary/50 transition-all duration-300 hover:shadow-lg'
    >
      {/* Preview da imagem ou ícone */}
      <div className='relative h-40 md:h-56 bg-gradient-to-br from-muted to-muted/70'>
        {/* Loading state para PDF */}
        {isPdf && isLoadingPdf ? (
          <div className='w-full h-40 md:h-56 flex items-center justify-center'>
            <div className='text-center'>
              <Loader2 className='w-8 h-8 text-muted-foreground animate-spin mx-auto mb-3' />
              <p className='text-sm text-muted-foreground font-medium'>
                Processando PDF...
              </p>
            </div>
          </div>
        ) : canShowPreview && finalPreviewUrl ? (
          isVideo ? (
            <video
              controls
              className='w-full h-40 md:h-56 object-cover cursor-pointer transition-transform duration-300'
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                const target = e.target as HTMLVideoElement
                target.style.display = 'none'
                const fallback = target.parentElement?.querySelector('.fallback-icon')
                if (fallback) {
                  fallback.classList.remove('hidden')
                }
              }}
            >
              <source src={urlArquivo} type={arquivo.tipo_mime || 'video/mp4'} />
              Seu navegador não suporta vídeos.
            </video>
          ) : (
            <img
              src={finalPreviewUrl}
              alt={nomeArquivo}
              className='w-full h-40 md:h-56 object-cover cursor-pointer transition-transform duration-300'
              onClick={() => window.open(urlArquivo, '_blank')}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const fallback = target.parentElement?.querySelector('.fallback-icon')
                if (fallback) {
                  fallback.classList.remove('hidden')
                }
              }}
            />
          )
        ) : null}
        
        {/* Badge PDF */}
        {isPdf && finalPreviewUrl && (
          <div className='absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded'>
            PDF
          </div>
        )}
        
        {/* Badge Vídeo */}
        {isVideo && (
          <div className='absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded'>
            VÍDEO
          </div>
        )}
        
        {/* Fallback sempre presente mas inicialmente oculto */}
        <div className={`fallback-icon ${canShowPreview && finalPreviewUrl ? 'hidden' : ''} w-full h-40 md:h-56 flex items-center justify-center`}>
          <div className='text-center'>
            <div className='w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3'>
              {arquivo.tipo_arquivo === 'foto_veiculo' || isImage ? (
                <Camera className='w-8 h-8 text-muted-foreground' />
              ) : isVideo ? (
                <Play className='w-8 h-8 text-muted-foreground' />
              ) : (
                <FileText className='w-8 h-8 text-muted-foreground' />
              )}
            </div>
            <p className='text-sm text-muted-foreground font-medium'>
              {pdfError || (canShowPreview ? 'Erro ao carregar' : tipoInfo.label)}
            </p>
          </div>
        </div>

        {/* Botão de deletar */}
        {onDelete && (
          <div className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
            <Button
              variant='destructive'
              size='sm'
              className='h-8 w-8 p-0 rounded-full shadow-lg'
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm(`Tem certeza que deseja deletar o arquivo "${nomeArquivo}"?`)) {
                  onDelete(arquivo.id)
                }
              }}
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </div>
        )}

      </div>

      {/* Nome do arquivo */}
      <div className='absolute bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm p-3 rounded-b-lg md:rounded-b-2xl'>
        <p className='text-sm font-medium text-white truncate' title={nomeArquivo}>
          {arquivo.nome_arquivo ? converterNomeArquivoParaTitulo(arquivo.nome_arquivo) : (arquivo.titulo_foto || tipoInfo.label)}
        </p>
      </div>

    </div>
  )
}