import { Card, CardContent } from '@/components/ui/card'
import { User } from 'lucide-react'
import { CondutorCard } from './cards'

interface SinistroCondutoresProps {
  dadosCnh: any[]
}

export default function SinistroCondutores({ dadosCnh }: SinistroCondutoresProps) {
  return (
    <div className='space-y-3 md:space-y-6'>
      <div className='rounded-lg bg-card/50 p-3 md:p-6 border border-border'>
        <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
          <div className='w-8 h-8 md:w-10 md:h-10 bg-muted rounded-lg flex items-center justify-center'>
            <User className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
          </div>
          <div>
            <h3 className='text-base md:text-lg font-semibold text-foreground'>Condutores</h3>
            <p className='text-xs md:text-sm text-muted-foreground hidden md:block'>Informações dos condutores envolvidos</p>
          </div>
        </div>
        
        {dadosCnh.length === 0 ? (
          <Card>
            <CardContent className='p-8 text-center'>
              <div className='w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4'>
                <User className='w-8 h-8 text-muted-foreground' />
              </div>
              <p className='text-muted-foreground'>Nenhum dado de CNH encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {dadosCnh.map((cnh, index) => (
              <CondutorCard key={index} cnh={cnh} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}