import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Car, Edit2, Trash2, Camera } from 'lucide-react'

interface VeiculoCardProps {
  crlv: any
  index: number
  onEditar?: (veiculo: any) => void
  onRemover?: (veiculoId: string) => void
  onAdicionarFotos?: (veiculoId: string) => void
  showActions?: boolean
}

export default function VeiculoCard({ 
  crlv, 
  index, 
  onEditar, 
  onRemover, 
  onAdicionarFotos,
  showActions = false 
}: VeiculoCardProps) {
  const isProprio = crlv.tipo_veiculo === 'proprio'
  
  return (
    <Card
      key={index}
      className={isProprio ? 'border-l-4 border-l-status-success' : 'border-l-4 border-l-brand-secondary'}
    >
      <CardHeader className='pb-2 lg:pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-base lg:text-lg flex items-center gap-2 text-foreground'>
            <Car
              className={`w-5 h-5 ${isProprio ? 'text-status-success' : 'text-brand-secondary'}`}
            />
            {isProprio ? 'Veículo Principal' : 'Veículo Terceiro'}
          </CardTitle>
          
          {showActions && (
            <div className='flex items-center gap-2'>
              {onAdicionarFotos && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onAdicionarFotos(crlv.id)}
                  className='h-8 px-2'
                >
                  <Camera className='w-4 h-4' />
                </Button>
              )}
              {onEditar && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onEditar(crlv)}
                  className='h-8 px-2'
                >
                  <Edit2 className='w-4 h-4' />
                </Button>
              )}
              {onRemover && (
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => onRemover(crlv.id)}
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
          <div className='bg-status-success/10 rounded-lg p-3 border-border border border-status-success/20'>
            <div className='text-xs text-status-success mb-1 text-center font-medium'>Placa do Veículo</div>
            <div className='font-mono text-lg font-bold text-center text-status-success bg-card/50 py-2 rounded border'>
              {crlv.placa}
            </div>
          </div>
          <div className='bg-muted rounded-lg p-3'>
            <div className='text-xs text-muted-foreground mb-1'>Marca/Modelo</div>
            <div className='font-medium text-sm text-foreground'>
              {crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>Ano Fabr.</div>
              <div className='text-sm font-medium text-foreground'>{crlv.ano_fabricacao || 'Não informado'}</div>
            </div>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>Ano Modelo</div>
              <div className='text-sm font-medium text-foreground'>{crlv.ano_modelo || 'Não informado'}</div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>Cor</div>
              <div className='text-sm text-foreground'>
                {crlv.cor ? (
                  <Badge
                    variant='outline'
                    className='bg-muted border-border text-xs text-foreground'
                  >
                    {crlv.cor}
                  </Badge>
                ) : (
                  <span className='text-foreground'>Não informado</span>
                )}
              </div>
            </div>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>Combustível</div>
              <div className='text-sm text-foreground'>
                {crlv.combustivel ? (
                  <Badge
                    variant='outline'
                    className='bg-status-success/10 border-status-success/20 text-status-success text-xs'
                  >
                    {crlv.combustivel}
                  </Badge>
                ) : (
                  <span className='text-foreground'>Não informado</span>
                )}
              </div>
            </div>
          </div>
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>RENAVAM</div>
              <div className='font-mono text-sm text-foreground'>{crlv.renavam || 'Não informado'}</div>
            </div>
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>Chassi</div>
              <div className='font-mono text-xs break-all text-foreground'>{crlv.chassi || 'Não informado'}</div>
            </div>
          </div>
          {crlv.proprietario && (
            <div className='bg-muted rounded-lg p-3'>
              <div className='text-xs text-muted-foreground mb-1'>Proprietário</div>
              <div className='font-medium text-sm text-foreground'>{crlv.proprietario}</div>
            </div>
          )}
        </div>

        {/* Desktop: Layout original */}
        <div className='hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Placa</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border font-mono text-lg font-bold text-center text-foreground'>
              {crlv.placa}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>RENAVAM</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border font-mono text-foreground'>
              {crlv.renavam || 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Chassi</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border font-mono text-xs text-foreground'>
              {crlv.chassi || 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Marca/Modelo</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border font-medium text-foreground'>
              {crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Ano Fabricação</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border text-center font-medium text-foreground'>
              {crlv.ano_fabricacao || 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Ano Modelo</Label>
            <p className='text-sm bg-muted p-2 rounded border-border border text-center font-medium text-foreground'>
              {crlv.ano_modelo || 'Não informado'}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Cor</Label>
            <p className='text-sm bg-muted p-2 rounded border text-foreground'>
              {crlv.cor ? (
                <Badge
                  variant='outline'
                  className='bg-muted border-border text-foreground'
                >
                  {crlv.cor}
                </Badge>
              ) : (
                <span className='text-foreground'>Não informado</span>
              )}
            </p>
          </div>
          <div className='space-y-2'>
            <Label className='text-sm font-medium text-muted-foreground'>Combustível</Label>
            <p className='text-sm bg-muted p-2 rounded border text-foreground'>
              {crlv.combustivel ? (
                <Badge
                  variant='outline'
                  className='bg-status-success/10 border-status-success/20 text-status-success'
                >
                  {crlv.combustivel}
                </Badge>
              ) : (
                <span className='text-foreground'>Não informado</span>
              )}
            </p>
          </div>
          {crlv.proprietario && (
            <div className='space-y-2 lg:col-span-2'>
              <Label className='text-sm font-medium text-muted-foreground'>Proprietário</Label>
              <p className='text-sm bg-muted p-2 rounded border-border border font-medium text-foreground'>{crlv.proprietario}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}