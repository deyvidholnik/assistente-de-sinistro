import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Activity, Plus, X } from 'lucide-react'
import { HistoricoItem } from './cards'

interface SinistroHistoricoProps {
  logs: any[]
}

export default function SinistroHistorico({ logs }: SinistroHistoricoProps) {
  const [historicoAberto, setHistoricoAberto] = useState(false)

  return (
    <div className='space-y-3 md:space-y-6'>
      <Collapsible
        open={historicoAberto}
        onOpenChange={setHistoricoAberto}
      >
        <div className='rounded-lg bg-card/50 p-3 md:p-6'>
          <CollapsibleTrigger asChild>
            <div className='flex items-center justify-between cursor-pointer hover:bg-muted -m-1 md:-m-2 p-1 md:p-2 rounded-lg transition-colors'>
              <div className='flex items-center gap-2 md:gap-3'>
                <div className='w-8 h-8 md:w-10 md:h-10 bg-muted rounded-lg flex items-center justify-center'>
                  <Activity className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
                </div>
                <div>
                  <h3 className='text-base md:text-lg font-semibold text-foreground'>Histórico</h3>
                  <p className='text-xs md:text-sm text-muted-foreground hidden md:inline'>
                    {historicoAberto ? ' (clique para fechar)' : ' (clique para abrir)'}
                  </p>
                </div>
              </div>
              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='text-xs'
                >
                  {logs.length}
                </Badge>
                {historicoAberto ? (
                  <X className='w-4 h-4 text-muted-foreground' />
                ) : (
                  <Plus className='w-4 h-4 text-muted-foreground' />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className='mt-4 md:mt-6'>
            {logs.length === 0 ? (
              <Card>
                <CardContent className='p-8 text-center'>
                  <div className='w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4'>
                    <Activity className='w-8 h-8 text-muted-foreground' />
                  </div>
                  <p className='text-muted-foreground'>Nenhum histórico encontrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className='space-y-3'>
                {/* Mobile: Layout compacto */}
                <div className='lg:hidden space-y-2'>
                  {logs.map((log, index) => (
                    <HistoricoItem key={index} log={log} index={index} />
                  ))}
                </div>

                {/* Desktop: Layout original */}
                <div className='hidden lg:block space-y-3'>
                  {logs.map((log, index) => (
                    <HistoricoItem key={index} log={log} index={index} />
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}