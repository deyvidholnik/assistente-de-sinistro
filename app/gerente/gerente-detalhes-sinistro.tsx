'use client'

import {
  SinistroHeader,
  SinistroMetricas,
  SinistroInformacoesEspeciais,
  SinistroAssistenciasAdicionais,
  SinistroTimelineProgresso,
  SinistroGestaoStatus,
  SinistroAndamentoProcesso,
  SinistroCondutores,
  SinistroVeiculos,
  SinistroArquivos,
  SinistroHistorico
} from './sinistro-detalhes'

interface SinistroDetalhado {
  sinistro: any
  dadosCnh: any[]
  dadosCrlv: any[]
  arquivos: any[]
  logs: any[]
}

// Componente para detalhes do sinistro
interface DetalhesSinistroProps {
  dados: SinistroDetalhado
  andamento?: any[]
  loadingAndamento?: boolean
  onAtualizarStatus?: (sinistroId: string, novoStatus: string, observacoes?: string) => Promise<void>
  onAtualizarAndamento?: (passoId: string, status: string, observacoes?: string) => Promise<void>
  onAdicionarNovoPasso?: () => Promise<void>
  onRemoverPasso?: (passoId: string) => Promise<void>
  showNovoPassoForm?: boolean
  novoPassoData?: { nome: string; descricao: string }
  onNovoPassoChange?: (data: { nome: string; descricao: string }) => void
  onToggleNovoPassoForm?: (show: boolean) => void
}

function DetalhesSinistro({
  dados,
  andamento = [],
  loadingAndamento = false,
  onAtualizarStatus,
  onAtualizarAndamento,
  onAdicionarNovoPasso,
  onRemoverPasso,
  showNovoPassoForm = false,
  novoPassoData = { nome: '', descricao: '' },
  onNovoPassoChange,
  onToggleNovoPassoForm,
}: DetalhesSinistroProps) {
  const { sinistro, dadosCnh, dadosCrlv, arquivos, logs } = dados

  return (
    <div className='flex flex-col px-4 py-4 rounded-sm space-y-3 md:space-y-3 dark:bg-gradient-to-br dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'>
      
      {/* Header Principal */}
      <SinistroHeader sinistro={sinistro} />

      {/* Métricas rápidas */}
      <SinistroMetricas sinistro={sinistro} />

      {/* Informações especiais */}
      <SinistroInformacoesEspeciais sinistro={sinistro} />

      {/* Seção Assistências Adicionais */}
      <SinistroAssistenciasAdicionais sinistro={sinistro} />

      {/* Timeline de progresso */}
      <SinistroTimelineProgresso sinistro={sinistro} />

      {/* Seção Gestão */}
      <div className='space-y-3 md:space-y-6'>
        {/* Gestão de Status */}
        <SinistroGestaoStatus sinistro={sinistro} onAtualizarStatus={onAtualizarStatus} />

        {/* Andamento do Processo */}
        <SinistroAndamentoProcesso
          sinistro={sinistro}
          andamento={andamento}
          loadingAndamento={loadingAndamento}
          onAtualizarAndamento={onAtualizarAndamento}
          onAdicionarNovoPasso={onAdicionarNovoPasso}
          onRemoverPasso={onRemoverPasso}
          showNovoPassoForm={showNovoPassoForm}
          novoPassoData={novoPassoData}
          onNovoPassoChange={onNovoPassoChange}
          onToggleNovoPassoForm={onToggleNovoPassoForm}
        />
      </div>

      {/* Seção Condutores */}
      <SinistroCondutores dadosCnh={dadosCnh} />

      {/* Seção Veículos */}
      <SinistroVeiculos dadosCrlv={dadosCrlv} />

      {/* Seção Arquivos */}
      <SinistroArquivos arquivos={arquivos} />

      {/* Seção Histórico */}
      <SinistroHistorico logs={logs} />
    </div>
  )
}

export { DetalhesSinistro }