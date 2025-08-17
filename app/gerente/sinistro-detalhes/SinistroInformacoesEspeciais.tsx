import { AlertTriangle, Users } from 'lucide-react'

interface SinistroInformacoesEspeciaisProps {
  sinistro: any
}

export default function SinistroInformacoesEspeciais({ sinistro }: SinistroInformacoesEspeciaisProps) {
  if (!sinistro.documentos_furtados && !sinistro.outros_veiculos_envolvidos) {
    return null
  }

  return (
    <div className='space-y-3'>
      <h3 className='text-base md:text-lg font-semibold text-foreground px-1'>Informações Especiais</h3>
      <div className='grid grid-cols-1 gap-3 md:gap-4'>
        {sinistro.documentos_furtados && (
          <div className='border-2 border-status-error bg-destructive/10 rounded-lg p-3'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-6 h-6 bg-destructive/20 rounded-full flex items-center justify-center'>
                <AlertTriangle className='w-3 h-3 text-status-error' />
              </div>
              <div>
                <h4 className='font-semibold text-sm text-destructive'>Documentos Furtados</h4>
              </div>
            </div>
            <div className='space-y-2'>
              <div>
                <div className='text-xs font-medium text-destructive/80 mb-1'>Nome</div>
                <div className='text-sm text-destructive break-words'>
                  {sinistro.nome_completo_furto || 'Não informado'}
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <div className='text-xs font-medium text-destructive/80 mb-1'>CPF</div>
                  <div className='text-xs font-mono text-destructive'>{sinistro.cpf_furto || 'N/A'}</div>
                </div>
                <div>
                  <div className='text-xs font-medium text-destructive/80 mb-1'>Placa</div>
                  <div className='text-xs font-mono text-destructive'>{sinistro.placa_veiculo_furto || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {sinistro.outros_veiculos_envolvidos && (
          <div className='border-2 border-status-warning bg-status-warning/10 rounded-lg p-3'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='w-6 h-6 bg-status-warning/20 rounded-full flex items-center justify-center'>
                <Users className='w-3 h-3 text-status-warning' />
              </div>
              <div>
                <h4 className='font-semibold text-sm text-status-warning'>Terceiros Envolvidos</h4>
              </div>
            </div>
            <div className='text-xs text-status-warning/90'>
              Este sinistro envolve múltiplos veículos. Verifique a seção de veículos para mais detalhes.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}