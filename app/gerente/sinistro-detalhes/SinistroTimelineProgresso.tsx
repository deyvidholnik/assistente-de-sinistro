import { TrendingUp, FileCheck, Eye, CheckCircle, XCircle } from 'lucide-react'

interface SinistroTimelineProgressoProps {
  sinistro: any
}

export default function SinistroTimelineProgresso({ sinistro }: SinistroTimelineProgressoProps) {
  const isStepCompleted = (requiredStatuses: string[]) => {
    return requiredStatuses.includes(sinistro.status)
  }

  return (
    <div className='rounded-lg bg-card/50 p-3 md:p-6 border border-border-light'>
      <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
        <TrendingUp className='w-4 h-4 md:w-5 md:h-5 text-muted-foreground' />
        <div>
          <h3 className='text-base md:text-lg font-semibold text-foreground'>Progresso</h3>
          <p className='text-xs md:text-sm text-muted-foreground hidden md:block'>Acompanhe o andamento do processo</p>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4'>
        {/* Etapa 1: Criado */}
        <div
          className={`p-2 md:p-4 border rounded-lg transition-colors ${
            isStepCompleted(['pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido'])
              ? 'border-status-success bg-status-success/10'
              : 'border-border bg-muted'
          }`}
        >
          <div className='text-center'>
            <FileCheck
              className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                isStepCompleted(['pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido'])
                  ? 'text-status-success'
                  : 'text-muted-foreground'
              }`}
            />
            <div className='text-xs font-medium text-muted-foreground mb-1'>Criado</div>
            <div className='text-xs md:text-sm font-semibold text-foreground'>Concluído</div>
          </div>
        </div>

        {/* Etapa 2: Análise */}
        <div
          className={`p-2 md:p-4 border rounded-lg transition-colors ${
            isStepCompleted(['em_analise', 'aprovado', 'rejeitado', 'concluido'])
              ? 'border-status-info bg-status-info/10'
              : 'border-border bg-muted'
          }`}
        >
          <div className='text-center'>
            <Eye
              className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                isStepCompleted(['em_analise', 'aprovado', 'rejeitado', 'concluido'])
                  ? 'text-status-info'
                  : 'text-muted-foreground'
              }`}
            />
            <div className='text-xs font-medium text-muted-foreground mb-1'>Análise</div>
            <div className='text-xs md:text-sm font-semibold text-foreground'>
              {isStepCompleted(['em_analise', 'aprovado', 'rejeitado', 'concluido']) ? 'Concluído' : 'Pendente'}
            </div>
          </div>
        </div>

        {/* Etapa 3: Decisão */}
        <div
          className={`p-2 md:p-4 border rounded-lg transition-colors ${
            ['aprovado', 'concluido'].includes(sinistro.status)
              ? 'border-status-success bg-status-success/10'
              : sinistro.status === 'rejeitado'
              ? 'border-status-error bg-status-error/10'
              : 'border-border bg-muted'
          }`}
        >
          <div className='text-center'>
            {sinistro.status === 'rejeitado' ? (
              <XCircle className='w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-status-error' />
            ) : (
              <CheckCircle
                className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  ['aprovado', 'concluido'].includes(sinistro.status) ? 'text-status-success' : 'text-muted-foreground'
                }`}
              />
            )}
            <div className='text-xs font-medium text-muted-foreground mb-1'>Decisão</div>
            <div className='text-xs md:text-sm font-semibold text-foreground'>
              {sinistro.status === 'aprovado'
                ? 'Aprovado'
                : sinistro.status === 'rejeitado'
                ? 'Rejeitado'
                : sinistro.status === 'concluido'
                ? 'Aprovado'
                : 'Pendente'}
            </div>
          </div>
        </div>

        {/* Etapa 4: Final */}
        <div
          className={`p-2 md:p-4 border rounded-lg transition-colors ${
            sinistro.status === 'concluido' ? 'border-status-success bg-status-success/10' : 'border-border bg-muted'
          }`}
        >
          <div className='text-center'>
            <CheckCircle
              className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                sinistro.status === 'concluido' ? 'text-status-success' : 'text-muted-foreground'
              }`}
            />
            <div className='text-xs font-medium text-muted-foreground mb-1'>Final</div>
            <div className='text-xs md:text-sm font-semibold text-foreground'>
              {sinistro.status === 'concluido' ? 'Concluído' : 'Pendente'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}