import { Card, CardContent } from '@/components/ui/card'
import { FileText, User } from 'lucide-react'
import { formatarData } from '../../gerente-formatters'

interface HistoricoItemProps {
  log: any
  index: number
}

export default function HistoricoItem({ log, index }: HistoricoItemProps) {
  return (
    <Card
      key={index}
      className='border-l-4 border-l-brand-primary/20'
    >
      <CardContent className='p-3 lg:p-4'>
        {/* Mobile: Layout compacto */}
        <div className='lg:hidden'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 w-8 h-8 bg-muted rounded-lg flex items-center justify-center'>
              <FileText className='w-4 h-4 text-muted-foreground' />
            </div>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center justify-between mb-1'>
                <h4 className='font-medium text-sm truncate'>{log.acao}</h4>
                <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0'>
                  {formatarData(log.created_at).split(' ')[0]}
                </span>
              </div>
              <p className='text-xs text-muted-foreground mb-2 line-clamp-2'>{log.descricao}</p>
              <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground'>
                  {formatarData(log.created_at).split(' ')[1]}
                </span>
                {log.usuario_nome && (
                  <span className='text-xs text-brand-primary font-medium flex items-center gap-1'>
                    <User className='w-3 h-3' />
                    {log.usuario_nome}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Layout original */}
        <div className='hidden lg:block'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-3'>
            <div className='flex items-center gap-2'>
              <FileText className='w-5 h-5 text-muted-foreground' />
              <span className='font-medium text-base'>{log.acao}</span>
            </div>
            <div className='flex flex-col lg:items-end gap-1'>
              <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded'>
                {formatarData(log.created_at)}
              </span>
              {log.usuario_nome && (
                <span className='text-xs text-brand-primary font-medium flex items-center gap-1'>
                  <User className='w-3 h-3' />
                  {log.usuario_nome}
                </span>
              )}
            </div>
          </div>
          <p className='text-sm text-muted-foreground bg-muted p-2 rounded border-border border'>{log.descricao}</p>
        </div>
      </CardContent>
    </Card>
  )
}