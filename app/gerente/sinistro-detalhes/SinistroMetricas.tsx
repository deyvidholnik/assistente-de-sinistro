import { FolderOpen, Clock } from 'lucide-react'

interface SinistroMetricasProps {
  sinistro: any
}

export default function SinistroMetricas({ sinistro }: SinistroMetricasProps) {
  const calcularDias = () => {
    return Math.ceil((new Date().getTime() - new Date(sinistro.data_criacao).getTime()) / (1000 * 60 * 60 * 24))
  }

  const scrollToArquivos = () => {
    const arquivosSection = document.getElementById('arquivos-section')
    if (arquivosSection) {
      arquivosSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className='grid grid-cols-2 gap-2 md:gap-4'>
      <div
        className='rounded-lg bg-card/50 p-2 md:p-4 text-center cursor-pointer hover:shadow-md hover:border-brand-primary transition-all duration-200 border border-border-light'
        onClick={scrollToArquivos}
      >
        <FolderOpen className='w-4 h-4 md:w-6 md:h-6 text-brand-primary mx-auto mb-1 md:mb-2' />
        <div className='text-lg md:text-2xl font-bold text-foreground'>{sinistro.total_arquivos || 0}</div>
        <div className='text-xs md:text-sm text-muted-foreground'>Arquivos</div>
        <div className='text-xs text-brand-primary mt-1 hidden md:block opacity-0 hover:opacity-100 transition-opacity'>
          Clique para ver arquivos
        </div>
      </div>
      
      <div className='rounded-lg bg-card/50 p-2 md:p-4 text-center border border-border-light'>
        <Clock className='w-4 h-4 md:w-6 md:h-6 text-muted-foreground mx-auto mb-1 md:mb-2' />
        <div className='text-lg md:text-2xl font-bold text-foreground'>
          {calcularDias()}
        </div>
        <div className='text-xs md:text-sm text-muted-foreground'>Dias</div>
      </div>
    </div>
  )
}