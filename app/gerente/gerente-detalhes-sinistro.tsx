'use client'

import { useState } from 'react'
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
import ModalCondutorTerceiro from './modais/ModalCondutorTerceiro'
import ModalVeiculoTerceiro from './modais/ModalVeiculoTerceiro'
import { useTerceiros } from '@/hooks/useTerceiros'

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
  onRefreshDados?: () => void
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
  onRefreshDados,
}: DetalhesSinistroProps) {
  const { sinistro, dadosCnh, dadosCrlv, arquivos, logs } = dados

  // Estados para modais
  const [modalCondutorOpen, setModalCondutorOpen] = useState(false)
  const [modalVeiculoOpen, setModalVeiculoOpen] = useState(false)
  const [condutorEditando, setCondutorEditando] = useState<any>(null)
  const [veiculoEditando, setVeiculoEditando] = useState<any>(null)

  // Hook para gerenciar terceiros
  const terceiros = useTerceiros({
    sinistroId: sinistro.id,
    onRefresh: onRefreshDados
  })

  // Handlers para condutores
  const handleAdicionarCondutor = () => {
    setCondutorEditando(null)
    setModalCondutorOpen(true)
  }

  const handleEditarCondutor = (condutor: any) => {
    setCondutorEditando(condutor)
    setModalCondutorOpen(true)
  }

  const handleRemoverCondutor = async (condutorId: string) => {
    try {
      await terceiros.removerCondutor(condutorId)
    } catch (error) {
      console.error('Erro ao remover condutor:', error)
    }
  }

  // Handlers para veículos
  const handleAdicionarVeiculo = () => {
    setVeiculoEditando(null)
    setModalVeiculoOpen(true)
  }

  const handleEditarVeiculo = (veiculo: any) => {
    setVeiculoEditando(veiculo)
    setModalVeiculoOpen(true)
  }

  const handleRemoverVeiculo = async (veiculoId: string) => {
    try {
      await terceiros.removerVeiculo(veiculoId)
    } catch (error) {
      console.error('Erro ao remover veículo:', error)
    }
  }

  // Handler para fechar modais
  const handleCloseModals = () => {
    setModalCondutorOpen(false)
    setModalVeiculoOpen(false)
    setCondutorEditando(null)
    setVeiculoEditando(null)
  }

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
      <SinistroCondutores 
        dadosCnh={dadosCnh} 
        sinistroId={sinistro.id}
        onAdicionarCondutor={handleAdicionarCondutor}
        onEditarCondutor={handleEditarCondutor}
        onRemoverCondutor={handleRemoverCondutor}
        onRefresh={onRefreshDados}
      />

      {/* Seção Veículos */}
      <SinistroVeiculos 
        dadosCrlv={dadosCrlv} 
        sinistroId={sinistro.id}
        onAdicionarVeiculo={handleAdicionarVeiculo}
        onEditarVeiculo={handleEditarVeiculo}
        onRemoverVeiculo={handleRemoverVeiculo}
        onRefresh={onRefreshDados}
      />

      {/* Seção Arquivos */}
      <SinistroArquivos arquivos={arquivos} />


      {/* Seção Histórico */}
      <SinistroHistorico logs={logs} />

      {/* Modais */}
      <ModalCondutorTerceiro
        open={modalCondutorOpen}
        onOpenChange={setModalCondutorOpen}
        sinistroId={sinistro.id}
        onSuccess={handleCloseModals}
        condutorEditar={condutorEditando}
      />

      <ModalVeiculoTerceiro
        open={modalVeiculoOpen}
        onOpenChange={setModalVeiculoOpen}
        sinistroId={sinistro.id}
        onSuccess={handleCloseModals}
        veiculoEditar={veiculoEditando}
      />
    </div>
  )
}

export { DetalhesSinistro }