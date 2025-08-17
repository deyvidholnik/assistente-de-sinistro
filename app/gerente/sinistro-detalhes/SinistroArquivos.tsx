import { FolderOpen } from 'lucide-react'
import { ArquivoCard } from './cards'

interface SinistroArquivosProps {
  arquivos: any[]
}

export default function SinistroArquivos({ arquivos }: SinistroArquivosProps) {
  return (
    <div
      id='arquivos-section'
      className='space-y-3 md:space-y-6'
    >
      <div className='rounded-lg bg-card/50 p-3 md:p-6 border border-border-light'>
        <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
          <div className='w-8 h-8 md:w-10 md:h-10 bg-muted rounded-lg flex items-center justify-center'>
            <FolderOpen className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
          </div>
          <div>
            <h3 className='text-base md:text-lg font-semibold text-foreground'>Arquivos</h3>
            <p className='text-xs md:text-sm text-muted-foreground hidden md:block'>Documentos e fotos anexados</p>
          </div>
        </div>

        {/* Layout unificado moderno */}
        {arquivos.length === 0 ? (
          <div className='text-center py-12'>
            <div className='w-24 h-24 bg-muted rounded-xl flex items-center justify-center mx-auto mb-6'>
              <FolderOpen className='w-12 h-12 text-muted-foreground' />
            </div>
            <h3 className='text-lg font-semibold text-foreground mb-2'>Nenhum arquivo encontrado</h3>
            <p className='text-muted-foreground'>Este sinistro ainda não possui arquivos anexados.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4'>
            {arquivos.map((arquivo, index) => (
              <ArquivoCard key={index} arquivo={arquivo} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}