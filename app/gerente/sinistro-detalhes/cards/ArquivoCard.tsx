import { Camera, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ArquivoCardProps {
  arquivo: any
  index: number
  onDelete?: (arquivoId: string) => void
}

export default function ArquivoCard({ arquivo, index, onDelete }: ArquivoCardProps) {
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



  return (
    <div
      key={index}
      className='group relative overflow-hidden rounded-lg md:rounded-2xl bg-card/50 hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10'
    >
      {/* Preview da imagem ou ícone */}
      <div className='relative h-40 md:h-56 bg-gradient-to-br from-muted to-muted/70'>
        {isImage && urlArquivo ? (
          <img
            src={urlArquivo}
            alt={nomeArquivo}
            className='w-full h-40 md:h-56 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300'
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
        ) : null}
        
        {/* Fallback sempre presente mas inicialmente oculto */}
        <div className={`fallback-icon ${isImage && urlArquivo ? 'hidden' : ''} w-full h-40 md:h-56 flex items-center justify-center`}>
          <div className='text-center'>
            <div className='w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3'>
              {arquivo.tipo_arquivo === 'foto_veiculo' || isImage ? (
                <Camera className='w-8 h-8 text-muted-foreground' />
              ) : (
                <FileText className='w-8 h-8 text-muted-foreground' />
              )}
            </div>
            <p className='text-sm text-muted-foreground font-medium'>
              {isImage ? 'Erro ao carregar imagem' : tipoInfo.label}
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

    </div>
  )
}