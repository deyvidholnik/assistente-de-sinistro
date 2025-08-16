import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Activity,
  CheckCircle,
  XCircle,
  Calendar,
  Plus,
  X,
  Loader2,
  Settings,
  PlayCircle,
  Clock4,
} from 'lucide-react'
import { formatarData } from '../gerente-formatters'
import { StatusBadge } from './cards'

interface SinistroAndamentoProcessoProps {
  sinistro: any
  andamento?: any[]
  loadingAndamento?: boolean
  onAtualizarAndamento?: (passoId: string, status: string, observacoes?: string) => Promise<void>
  onAdicionarNovoPasso?: () => Promise<void>
  onRemoverPasso?: (passoId: string) => Promise<void>
  showNovoPassoForm?: boolean
  novoPassoData?: { nome: string; descricao: string }
  onNovoPassoChange?: (data: { nome: string; descricao: string }) => void
  onToggleNovoPassoForm?: (show: boolean) => void
}

export default function SinistroAndamentoProcesso({
  sinistro,
  andamento = [],
  loadingAndamento = false,
  onAtualizarAndamento,
  onAdicionarNovoPasso,
  onRemoverPasso,
  showNovoPassoForm = false,
  novoPassoData = { nome: '', descricao: '' },
  onNovoPassoChange,
  onToggleNovoPassoForm,
}: SinistroAndamentoProcessoProps) {
  // Só mostra para sinistros em análise, aprovados e rejeitados
  if (!['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status)) {
    return (
      <Card>
        <CardContent className='p-6 text-center'>
          <div className='text-muted-foreground'>
            <p className='font-medium text-foreground'>Andamento do Processo</p>
            <p className='text-sm mt-2'>
              O acompanhamento detalhado dos passos estará disponível quando o sinistro estiver em análise, aprovado
              ou rejeitado.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg flex items-center gap-2 text-foreground'>
          <Activity className='w-5 h-5 text-muted-foreground' />
          Andamento do Processo
        </CardTitle>
        <p className='text-sm text-muted-foreground'>Acompanhe cada etapa do processo do sinistro</p>
      </CardHeader>
      <CardContent>
        {loadingAndamento ? (
          <div className='flex items-center justify-center p-8'>
            <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
            <span className='ml-2 text-sm text-muted-foreground'>Carregando andamento...</span>
          </div>
        ) : (
          <div className='space-y-3'>
            {/* Mostrar apenas passos personalizados */}
            {andamento
              .filter((item) => item.personalizado)
              .map((item, index) => (
                <Card key={item.id}>
                  <CardContent className='p-4'>
                    {/* Header do Passo - Mobile First */}
                    <div className='space-y-3'>
                      <div className='flex items-start justify-between gap-2'>
                        <div className='flex items-center gap-2 flex-1 min-w-0'>
                          <div
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                              item.status === 'concluido'
                                ? 'bg-status-success'
                                : item.status === 'em_andamento'
                                ? 'bg-brand-primary'
                                : 'bg-muted'
                            }`}
                          />
                          <h4 className='font-medium text-sm lg:text-base truncate text-foreground'>{item.nome}</h4>
                          <Badge
                            variant='outline'
                            className='text-xs bg-muted border-border text-muted-foreground'
                          >
                            Custom
                          </Badge>
                        </div>
                        {onRemoverPasso && (
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => onRemoverPasso(item.id.toString())}
                            className='h-6 w-6 p-0 flex-shrink-0'
                            title='Remover passo personalizado'
                          >
                            <X className='w-3 h-3' />
                          </Button>
                        )}
                      </div>

                      {/* Status Badge e Select */}
                      <div className='flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4'>
                        <StatusBadge status={item.status} size='sm' />
                        <select
                          value={item.status}
                          onChange={(e) => {
                            if (onAtualizarAndamento) {
                              onAtualizarAndamento(item.id.toString(), e.target.value)
                            }
                          }}
                          className='px-2 py-1 text-xs border border-border rounded bg-card/50 focus:outline-none focus:ring-1 focus:ring-brand-primary lg:ml-auto text-foreground'
                        >
                          <option value='pendente'>Pendente</option>
                          <option value='em_andamento'>Em Andamento</option>
                          <option value='concluido'>Concluído</option>
                        </select>
                      </div>
                    </div>

                    {/* Descrição */}
                    <p className='text-sm text-muted-foreground mt-3 mb-2'>{item.descricao}</p>

                    {/* Observações */}
                    {item.observacoes && (
                      <div className='text-sm text-brand-primary bg-brand-primary/10 p-2 rounded mt-2'>
                        <strong className='text-brand-primary'>Observações:</strong> <span className='text-foreground'>{item.observacoes}</span>
                      </div>
                    )}

                    {/* Timestamps */}
                    {(item.data_inicio || item.data_conclusao) && (
                      <div className='flex flex-col lg:flex-row lg:justify-between gap-1 text-xs text-muted-foreground mt-3 pt-2 border-t border-border-light'>
                        {item.data_inicio && (
                          <span className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            Iniciado: {formatarData(item.data_inicio)}
                          </span>
                        )}
                        {item.data_conclusao && (
                          <span className='flex items-center gap-1'>
                            <CheckCircle className='w-3 h-3' />
                            Concluído: {formatarData(item.data_conclusao)}
                          </span>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

            {/* Formulário para adicionar novo passo */}
            <Card className='border-dashed border-2 border-border'>
              <CardContent className='p-4'>
                {!showNovoPassoForm ? (
                  <Button
                    onClick={() => onToggleNovoPassoForm?.(true)}
                    variant='outline'
                    className='w-full border-dashed border-2 border-border hover:border-brand-primary hover:bg-brand-primary/5'
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    Adicionar Passo Personalizado
                  </Button>
                ) : (
                  <div className='space-y-4'>
                    <div className='flex items-center gap-2 mb-4'>
                      <Settings className='w-5 h-5 text-muted-foreground' />
                      <h4 className='font-medium text-lg text-foreground'>Novo Passo Personalizado</h4>
                    </div>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='novo-passo-nome'
                          className='text-sm font-medium text-foreground'
                        >
                          Nome do Passo *
                        </Label>
                        <Input
                          id='novo-passo-nome'
                          value={novoPassoData.nome}
                          onChange={(e) => onNovoPassoChange?.({ ...novoPassoData, nome: e.target.value })}
                          placeholder='Ex: Vistoria Adicional'
                          className='focus:ring-2 focus:ring-brand-primary'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label
                          htmlFor='novo-passo-descricao'
                          className='text-sm font-medium text-foreground'
                        >
                          Descrição *
                        </Label>
                        <Input
                          id='novo-passo-descricao'
                          value={novoPassoData.descricao}
                          onChange={(e) => onNovoPassoChange?.({ ...novoPassoData, descricao: e.target.value })}
                          placeholder='Ex: Vistoria adicional solicitada pelo cliente'
                          className='focus:ring-2 focus:ring-brand-primary'
                        />
                      </div>
                    </div>
                    <div className='flex flex-col lg:flex-row gap-2'>
                      <Button
                        onClick={onAdicionarNovoPasso}
                        disabled={!novoPassoData.nome.trim() || !novoPassoData.descricao.trim()}
                        className='flex-1'
                      >
                        <CheckCircle className='w-4 h-4 mr-2' />
                        Adicionar Passo
                      </Button>
                      <Button
                        onClick={() => onToggleNovoPassoForm?.(false)}
                        variant='outline'
                        className='flex-1'
                      >
                        <X className='w-4 h-4 mr-2' />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}