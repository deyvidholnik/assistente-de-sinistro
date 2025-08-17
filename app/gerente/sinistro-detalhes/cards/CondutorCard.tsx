import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { User, Users, Edit2, Trash2, Camera } from 'lucide-react'
import { formatarDataSemHora } from '../../gerente-formatters'

interface CondutorCardProps {
  cnh: any
  index: number
  onEditar?: (condutor: any) => void
  onRemover?: (condutorId: string) => void
  onAdicionarFotos?: (condutorId: string) => void
  showActions?: boolean
}

export default function CondutorCard({ 
  cnh, 
  index, 
  onEditar, 
  onRemover, 
  onAdicionarFotos,
  showActions = false 
}: CondutorCardProps) {
  const isProprio = cnh.tipo_titular === 'proprio'
  
  return (
    <Card
      key={index}
      className={isProprio ? 'border-l-4 border-l-brand-primary' : 'border-l-4 border-l-status-warning'}
    >
      <CardHeader className='pb-2 lg:pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base lg:text-lg flex items-center gap-2 text-foreground'>
            {isProprio ? (
              <User className='w-5 h-5 text-brand-primary' />
            ) : (
              <Users className='w-5 h-5 text-status-warning' />
            )}
            {isProprio ? 'Condutor Principal' : 'Condutor Terceiro'}
          </CardTitle>
          
          {showActions && (
            <div className='flex items-center gap-2'>
              {onAdicionarFotos && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onAdicionarFotos(cnh.id)}
                  className='h-8 px-2'
                >
                  <Camera className='w-4 h-4' />
                </Button>
              )}
              {onEditar && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onEditar(cnh)}
                  className='h-8 px-2'
                >
                  <Edit2 className='w-4 h-4' />
                </Button>
              )}
              {onRemover && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onRemover(cnh.id)}
                  className='h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50'
                >
                  <Trash2 className='w-4 h-4' />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile: Layout compacto */}
        <div className='lg:hidden space-y-3'>
          <div className='bg-muted rounded-lg p-3'>
            <div className='text-xs text-muted-foreground mb-1'>Nome Completo</div>
            <div className='font-medium text-sm text-foreground'>{cnh.nome}</div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>CPF</div>
              <div className='font-mono text-sm text-foreground'>{cnh.cpf}</div>
            </div>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>RG</div>
              <div className='text-sm text-foreground'>{cnh.rg || 'Não informado'}</div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>Nascimento</div>
              <div className='text-sm text-foreground'>
                {cnh.data_nascimento ? formatarDataSemHora(cnh.data_nascimento) : 'Não informado'}
              </div>
            </div>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>Categoria</div>
              <div className='text-sm text-foreground'>
                {cnh.categoria ? (
                  <Badge
                    variant='outline'
                    className='bg-brand-primary/10 border-brand-primary/20 text-brand-primary text-xs'
                  >
                    {cnh.categoria}
                  </Badge>
                ) : (
                  <span className='text-foreground'>Não informado</span>
                )}
              </div>
            </div>
          </div>
          <div className='bg-muted rounded-lg p-3'>
            <div className='text-xs text-muted-foreground mb-1'>Número de Registro</div>
            <div className='font-mono text-sm text-foreground'>{cnh.numero_registro || 'Não informado'}</div>
          </div>
        </div>

        {/* Desktop: Layout original */}
        <div className='hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Nome Completo</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border font-medium text-foreground'>{cnh.nome}</p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>CPF</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border font-mono text-foreground'>{cnh.cpf}</p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>RG</Label>
            <p className='text-sm bg-muted p-2 rounded border text-foreground'>{cnh.rg || 'Não informado'}</p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Data de Nascimento</Label>
            <p className='text-sm bg-muted p-2 rounded border text-foreground'>
              {cnh.data_nascimento ? formatarDataSemHora(cnh.data_nascimento) : 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Categoria</Label>
            <p className='text-sm bg-muted p-2 rounded border text-foreground'>
              {cnh.categoria ? (
                <Badge
                  variant='outline'
                  className='bg-brand-primary/10 border-brand-primary/20 text-brand-primary'
                >
                  {cnh.categoria}
                </Badge>
              ) : (
                <span className='text-foreground'>Não informado</span>
              )}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Número de Registro</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border font-mono text-foreground'>
              {cnh.numero_registro || 'Não informado'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}