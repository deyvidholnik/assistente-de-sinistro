import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Camera, FileText } from 'lucide-react'

interface ArquivoCardProps {
  arquivo: any
  index: number
}

export default function ArquivoCard({ arquivo, index }: ArquivoCardProps) {
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
      default:
        return { badge: 'Foto', label: 'Documento' }
    }
  }

  const tipoInfo = getTipoLabel(arquivo.tipo_arquivo)
  const isImage = arquivo.url_arquivo && (arquivo.tipo_mime?.startsWith('image/') || arquivo.tipo_arquivo === 'foto_veiculo')

  return (
    <div
      key={index}
      className='group relative overflow-hidden rounded-lg md:rounded-2xl bg-card/50 hover:border-brand-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-brand-primary/10'
    >
      {/* Preview da imagem ou ícone */}
      <div className='relative h-32 md:h-48 bg-gradient-to-br from-muted to-muted/70'>
        {isImage ? (
          <img
            src={arquivo.url_arquivo}
            alt={arquivo.nome_original}
            className='w-full h-32 md:h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300'
            onClick={() => window.open(arquivo.url_arquivo, '_blank')}
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              target.nextElementSibling?.classList.remove('hidden')
            }}
          />
        ) : (
          <div className='w-full h-32 md:h-48 flex items-center justify-center'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3'>
                {arquivo.tipo_arquivo === 'foto_veiculo' ? (
                  <Camera className='w-8 h-8 text-muted-foreground' />
                ) : (
                  <FileText className='w-8 h-8 text-muted-foreground' />
                )}
              </div>
              <p className='text-sm text-muted-foreground font-medium'>
                {tipoInfo.label}
              </p>
            </div>
          </div>
        )}

        {/* Overlay com badge do tipo */}
        <div className='absolute top-3 left-3'>
          <Badge
            variant='secondary'
            className='text-xs font-medium shadow-sm'
          >
            {tipoInfo.badge}
          </Badge>
        </div>

        {/* Botão de ação */}
        {arquivo.url_arquivo && (
          <div className='absolute top-3 right-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => window.open(arquivo.url_arquivo, '_blank')}
              className='h-8 w-8 p-0 bg-card/50/90 border-border hover:bg-card/50 hover:scale-105 transition-all duration-200 shadow-sm'
              title='Abrir arquivo'
            >
              <Download className='w-3 h-3' />
            </Button>
          </div>
        )}
      </div>

      {/* Informações do arquivo */}
      <div className='p-2 md:p-4'>
        <h4
          className='font-semibold text-sm md:text-base text-foreground mb-1 truncate'
          title={arquivo.nome_original}
        >
          {arquivo.nome_original}
        </h4>
        {arquivo.titulo_foto && (
          <p className='text-xs md:text-sm text-brand-primary mb-1 md:mb-2 truncate'>{arquivo.titulo_foto}</p>
        )}
        <div className='flex items-center justify-between'>
          <span className='text-xs font-medium text-muted-foreground bg-muted px-1 md:px-2 py-1 rounded-full'>
            {(arquivo.tamanho_arquivo / 1024).toFixed(1)}KB
          </span>
          {arquivo.tipo_mime && (
            <span className='text-xs font-medium text-muted-foreground uppercase bg-muted px-1 md:px-2 py-1 rounded-full'>
              {arquivo.tipo_mime.split('/')[1]}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}