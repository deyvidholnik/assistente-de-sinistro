"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Info,
  Clock4,
  Eye,
  CheckCircle,
  XCircle,
  Calendar,
  Headphones,
  Car,
  Shield,
  AlertTriangle,
  Wrench,
  User,
  Users,
  FileText,
  Activity,
  Plus,
  X,
  Loader2,
  Download,
  Image as ImageIcon,
  FolderOpen,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  Clock,
  TrendingUp,
  Settings,
  FileCheck,
  PlayCircle,
  Camera
} from "lucide-react"

// Função simples para formatar datas
const formatarData = (data: string) => {
  try {
    return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR })
  } catch (error) {
    return 'Data inválida'
  }
}

const formatarDataSemHora = (data: string) => {
  try {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
  } catch (error) {
    return 'Data inválida'
  }
}

// Função para formatar tipo de assistência
const formatarTipoAssistencia = (tipo: string | undefined) => {
  if (!tipo) return ''
  
  const tipos: { [key: string]: string } = {
    'hotel': 'Hotel',
    'guincho': 'Guincho',
    'taxi': 'Táxi',
    'pane_seca': 'Pane Seca',
    'pane_mecanica': 'Pane Mecânica',
    'pane_eletrica': 'Pane Elétrica',
    'trocar_pneu': 'Trocar Pneu'
  }
  
  return tipos[tipo] || tipo.replace(/_/g, ' ')
}

// Função para formatar todas as assistências (principal + adicionais)
const formatarTodasAssistencias = (sinistro: any) => {
  const assistencias: string[] = []
  
  // Adicionar assistência principal
  if (sinistro.tipo_assistencia) {
    assistencias.push(formatarTipoAssistencia(sinistro.tipo_assistencia))
  }
  
  // Adicionar assistências adicionais
  if (sinistro.assistencias_tipos) {
    // Se é array, usar diretamente. Se é string, fazer split
    const tiposAdicionais = Array.isArray(sinistro.assistencias_tipos)
      ? sinistro.assistencias_tipos
      : sinistro.assistencias_tipos.split(', ')
    
    const assistenciasAdicionais = tiposAdicionais
      .filter((tipo: string) => tipo) // Remover valores vazios
      .map((tipo: string) => formatarTipoAssistencia(tipo))
    assistencias.push(...assistenciasAdicionais)
  }
  
  return assistencias.length > 0 ? assistencias.join(', ') : ''
}

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
}function DetalhesSinistro({
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
  const [historicoAberto, setHistoricoAberto] = useState(false)

  return (
    <div className='flex flex-col h-full overflow-y-auto space-y-3 md:space-y-3 '>
      {/* Seção Geral */}
      {/* Header Principal */}
      <div className='border border-gray-200 rounded-lg bg-white p-3 md:p-6'>
        {/* Mobile Layout */}
        <div className='md:hidden space-y-3'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center gap-2 text-xs text-gray-500 mb-1'>
                <Info className='w-3 h-3' />
                <span>Sinistro</span>
              </div>
              <h1 className='text-xl font-bold text-gray-900'>#{sinistro.numero_sinistro}</h1>
            </div>
            <Badge
              variant={
                sinistro.status === 'concluido'
                  ? 'default'
                  : sinistro.status === 'aprovado'
                  ? 'secondary'
                  : sinistro.status === 'em_analise'
                  ? 'outline'
                  : sinistro.status === 'rejeitado'
                  ? 'destructive'
                  : 'secondary'
              }
              className={`text-xs px-2 py-1 ${
                sinistro.status === 'concluido'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : sinistro.status === 'aprovado'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : sinistro.status === 'em_analise'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : sinistro.status === 'rejeitado'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              {sinistro.status === 'pendente' && <Clock4 className='w-3 h-3 mr-1' />}
              {sinistro.status === 'em_analise' && <Eye className='w-3 h-3 mr-1' />}
              {sinistro.status === 'aprovado' && <CheckCircle className='w-3 h-3 mr-1' />}
              {sinistro.status === 'rejeitado' && <XCircle className='w-3 h-3 mr-1' />}
              {sinistro.status === 'concluido' && <CheckCircle className='w-3 h-3 mr-1' />}
              {sinistro.status === 'pendente'
                ? 'Pendente'
                : sinistro.status === 'em_analise'
                ? 'Em Análise'
                : sinistro.status === 'aprovado'
                ? 'Aprovado'
                : sinistro.status === 'rejeitado'
                ? 'Rejeitado'
                : 'Concluído'}
            </Badge>
          </div>

          <div className='bg-gray-50 rounded-lg p-2'>
            <div className='flex items-center gap-2 text-xs text-gray-600 mb-1'>
              <Calendar className='w-3 h-3' />
              <span>{formatarData(sinistro.data_criacao)}</span>
            </div>
            <div className='text-sm font-medium text-gray-900'>
              {sinistro.tipo_atendimento === 'assistencia' ? (
                <>
                  <Headphones className='w-4 h-4 inline mr-1' />
                  {formatarTodasAssistencias(sinistro)}
                </>
              ) : (
                <>
                  {sinistro.tipo_sinistro === 'colisao' ? (
                    <>
                      <Car className='w-4 h-4 inline mr-1' />
                      Colisão
                    </>
                  ) : sinistro.tipo_sinistro === 'furto' ? (
                    <>
                      <Shield className='w-4 h-4 inline mr-1' />
                      Furto
                    </>
                  ) : sinistro.tipo_sinistro === 'roubo' ? (
                    <>
                      <AlertTriangle className='w-4 h-4 inline mr-1' />
                      Roubo
                    </>
                  ) : sinistro.tipo_sinistro === 'pequenos_reparos' ? (
                    <>
                      <Wrench className='w-4 h-4 inline mr-1' />
                      Pequenos Reparos
                    </>
                  ) : (
                    'Tipo não identificado'
                  )}
                  {/* Mostrar assistências adicionais para sinistros */}
                  {sinistro.assistencias_tipos && sinistro.assistencias_tipos.length > 0 && (
                    <span className='ml-2 text-sm text-gray-600'>- {formatarTodasAssistencias(sinistro)}</span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden md:flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2 text-sm text-gray-500'>
              <Info className='w-4 h-4' />
              <span>Sinistro</span>
            </div>
            <h1 className='text-3xl font-bold text-gray-900'>#{sinistro.numero_sinistro}</h1>
            <div className='flex items-center gap-2 text-gray-600'>
              <Calendar className='w-4 h-4' />
              <span>{formatarData(sinistro.data_criacao)}</span>
            </div>
          </div>

          <div className='flex flex-col lg:items-end gap-3'>
            <Badge
              variant={
                sinistro.status === 'concluido'
                  ? 'default'
                  : sinistro.status === 'aprovado'
                  ? 'secondary'
                  : sinistro.status === 'em_analise'
                  ? 'outline'
                  : sinistro.status === 'rejeitado'
                  ? 'destructive'
                  : 'secondary'
              }
              className={`w-fit ${
                sinistro.status === 'concluido'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : sinistro.status === 'aprovado'
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : sinistro.status === 'em_analise'
                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                  : sinistro.status === 'rejeitado'
                  ? 'bg-red-100 text-red-800 border-red-200'
                  : 'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              {sinistro.status === 'pendente' && <Clock4 className='w-3 h-3 mr-1' />}
              {sinistro.status === 'em_analise' && <Eye className='w-3 h-3 mr-1' />}
              {sinistro.status === 'aprovado' && <CheckCircle className='w-3 h-3 mr-1' />}
              {sinistro.status === 'rejeitado' && <XCircle className='w-3 h-3 mr-1' />}
              {sinistro.status === 'concluido' && <CheckCircle className='w-3 h-3 mr-1' />}
              {sinistro.status === 'pendente'
                ? 'Pendente'
                : sinistro.status === 'em_analise'
                ? 'Em Análise'
                : sinistro.status === 'aprovado'
                ? 'Aprovado'
                : sinistro.status === 'rejeitado'
                ? 'Rejeitado'
                : 'Concluído'}
            </Badge>

            <div className='text-right'>
              <div className='text-sm text-gray-500'>
                {sinistro.tipo_atendimento === 'assistencia' ? 'Tipo de Assistência' : 'Tipo de Sinistro'}
              </div>
              <div className='text-lg font-semibold text-gray-900 capitalize flex items-center gap-2'>
                {sinistro.tipo_atendimento === 'assistencia' ? (
                  <div className='flex items-center gap-2 flex-wrap'>
                    <div className='flex items-center gap-2'>
                      <Headphones className='w-5 h-5' />
                      {formatarTodasAssistencias(sinistro)}
                    </div>
                  </div>
                ) : sinistro.tipo_sinistro === 'colisao' ? (
                  <>
                    <Car className='w-5 h-5' />
                    Colisão
                  </>
                ) : sinistro.tipo_sinistro === 'furto' ? (
                  <>
                    <Shield className='w-5 h-5' />
                    Furto
                  </>
                ) : sinistro.tipo_sinistro === 'roubo' ? (
                  <>
                    <AlertTriangle className='w-5 h-5' />
                    Roubo
                  </>
                ) : sinistro.tipo_sinistro === 'pequenos_reparos' ? (
                  <>
                    <Wrench className='w-5 h-5' />
                    Pequenos Reparos
                  </>
                ) : (
                  <>Tipo não identificado</>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className='grid grid-cols-2 gap-2 md:gap-4'>
        <div
          className='border border-gray-200 rounded-lg bg-white p-2 md:p-4 text-center cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200'
          onClick={() => {
            const arquivosSection = document.getElementById('arquivos-section')
            if (arquivosSection) {
              arquivosSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
        >
          <FolderOpen className='w-4 h-4 md:w-6 md:h-6 text-blue-500 mx-auto mb-1 md:mb-2' />
          <div className='text-lg md:text-2xl font-bold text-gray-900'>{sinistro.total_arquivos || 0}</div>
          <div className='text-xs md:text-sm text-gray-500'>Arquivos</div>
          <div className='text-xs text-blue-600 mt-1 hidden md:block opacity-0 hover:opacity-100 transition-opacity'>
            Clique para ver arquivos
          </div>
        </div>
        <div className='border border-gray-200 rounded-lg bg-white p-2 md:p-4 text-center'>
          <Clock className='w-4 h-4 md:w-6 md:h-6 text-gray-400 mx-auto mb-1 md:mb-2' />
          <div className='text-lg md:text-2xl font-bold text-gray-900'>
            {Math.ceil((new Date().getTime() - new Date(sinistro.data_criacao).getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className='text-xs md:text-sm text-gray-500'>Dias</div>
        </div>
      </div>

      {/* Informações especiais */}
      {(sinistro.documentos_furtados || sinistro.outros_veiculos_envolvidos) && (
        <div className='space-y-3'>
          <h3 className='text-base md:text-lg font-semibold text-gray-900 px-1'>Informações Especiais</h3>
          <div className='grid grid-cols-1 gap-3 md:gap-4'>
            {sinistro.documentos_furtados && (
              <div className='border border-red-200 bg-red-50 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-6 h-6 bg-red-100 rounded-full flex items-center justify-center'>
                    <AlertTriangle className='w-3 h-3 text-red-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-sm text-red-900'>Documentos Furtados</h4>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div>
                    <div className='text-xs font-medium text-red-700 mb-1'>Nome</div>
                    <div className='text-sm text-red-900 break-words'>
                      {sinistro.nome_completo_furto || 'Não informado'}
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <div className='text-xs font-medium text-red-700 mb-1'>CPF</div>
                      <div className='text-xs font-mono text-red-900'>{sinistro.cpf_furto || 'N/A'}</div>
                    </div>
                    <div>
                      <div className='text-xs font-medium text-red-700 mb-1'>Placa</div>
                      <div className='text-xs font-mono text-red-900'>{sinistro.placa_veiculo_furto || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sinistro.outros_veiculos_envolvidos && (
              <div className='border border-amber-200 bg-amber-50 rounded-lg p-3'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center'>
                    <Users className='w-3 h-3 text-amber-600' />
                  </div>
                  <div>
                    <h4 className='font-semibold text-sm text-amber-900'>Terceiros Envolvidos</h4>
                  </div>
                </div>
                <div className='text-xs text-amber-700'>
                  Este sinistro envolve múltiplos veículos. Verifique a seção de veículos para mais detalhes.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Seção Assistências Adicionais */}
      {sinistro.assistencia_adicional && sinistro.assistencias_tipos && sinistro.assistencias_tipos.length > 0 && (
        <div className='space-y-3'>
          <h3 className='text-base md:text-lg font-semibold text-gray-900 px-1'>Assistências Adicionais</h3>
          <div className='border border-blue-200 bg-blue-50 rounded-lg p-3 md:p-6'>
            <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
              <div className='w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                <Headphones className='w-4 h-4 md:w-5 md:h-5 text-blue-600' />
              </div>
              <div>
                <h4 className='text-base md:text-lg font-semibold text-blue-900'>Serviços Adicionais Solicitados</h4>
                <p className='text-xs md:text-sm text-blue-700 hidden md:block'>
                  Lista de assistências extras solicitadas pelo cliente
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
              {(Array.isArray(sinistro.assistencias_tipos)
                ? sinistro.assistencias_tipos
                : typeof sinistro.assistencias_tipos === 'string'
                ? sinistro.assistencias_tipos.split(',')
                : []
              ).map((tipo: string, index: number) => {
                const tipoLimpo = tipo.trim()
                const assistenciaInfo: { [key: string]: { label: string; icon: string; color: string } } = {
                  guincho: { label: 'Guincho', icon: '🚛', color: 'bg-blue-100 text-blue-800 border-blue-200' },
                  taxi: { label: 'Táxi', icon: '🚕', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
                  hotel: { label: 'Hotel', icon: '🏨', color: 'bg-purple-100 text-purple-800 border-purple-200' },
                  mecanica: { label: 'Mecânica', icon: '🔧', color: 'bg-green-100 text-green-800 border-green-200' },
                  vidraceiro: {
                    label: 'Vidraceiro',
                    icon: '🪟',
                    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                  },
                  borracheiro: {
                    label: 'Borracheiro',
                    icon: '🛞',
                    color: 'bg-orange-100 text-orange-800 border-orange-200',
                  },
                  eletricista: { label: 'Eletricista', icon: '⚡', color: 'bg-red-100 text-red-800 border-red-200' },
                }
                const info = assistenciaInfo[tipoLimpo] || {
                  label: tipoLimpo,
                  icon: '🛠️',
                  color: 'bg-gray-100 text-gray-800 border-gray-200',
                }

                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${info.color} border shadow-sm`}
                  >
                    <div className='flex items-center gap-2'>
                      <span className='text-lg'>{info.icon}</span>
                      <span className='font-medium text-sm'>{info.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Timeline de progresso */}
      <div className='border border-gray-200 rounded-lg bg-white p-3 md:p-6'>
        <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
          <TrendingUp className='w-4 h-4 md:w-5 md:h-5 text-gray-600' />
          <div>
            <h3 className='text-base md:text-lg font-semibold text-gray-900'>Progresso</h3>
            <p className='text-xs md:text-sm text-gray-600 hidden md:block'>Acompanhe o andamento do processo</p>
          </div>
        </div>

        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4'>
          <div
            className={`p-2 md:p-4 border rounded-lg transition-colors ${
              ['pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status)
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className='text-center'>
              <FileCheck
                className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  ['pendente', 'em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status)
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`}
              />
              <div className='text-xs font-medium text-gray-600 mb-1'>Criado</div>
              <div className='text-xs md:text-sm font-semibold'>Concluído</div>
            </div>
          </div>

          <div
            className={`p-2 md:p-4 border rounded-lg transition-colors ${
              ['em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status)
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className='text-center'>
              <Eye
                className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  ['em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status)
                    ? 'text-blue-600'
                    : 'text-gray-400'
                }`}
              />
              <div className='text-xs font-medium text-gray-600 mb-1'>Análise</div>
              <div className='text-xs md:text-sm font-semibold'>
                {['em_analise', 'aprovado', 'rejeitado', 'concluido'].includes(sinistro.status)
                  ? 'Concluído'
                  : 'Pendente'}
              </div>
            </div>
          </div>

          <div
            className={`p-2 md:p-4 border rounded-lg transition-colors ${
              ['aprovado', 'concluido'].includes(sinistro.status)
                ? 'border-green-200 bg-green-50'
                : sinistro.status === 'rejeitado'
                ? 'border-red-200 bg-red-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className='text-center'>
              {sinistro.status === 'rejeitado' ? (
                <XCircle className='w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-red-600' />
              ) : (
                <CheckCircle
                  className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                    ['aprovado', 'concluido'].includes(sinistro.status) ? 'text-green-600' : 'text-gray-400'
                  }`}
                />
              )}
              <div className='text-xs font-medium text-gray-600 mb-1'>Decisão</div>
              <div className='text-xs md:text-sm font-semibold'>
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

          <div
            className={`p-2 md:p-4 border rounded-lg transition-colors ${
              sinistro.status === 'concluido' ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className='text-center'>
              <CheckCircle
                className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 ${
                  sinistro.status === 'concluido' ? 'text-green-600' : 'text-gray-400'
                }`}
              />
              <div className='text-xs font-medium text-gray-600 mb-1'>Final</div>
              <div className='text-xs md:text-sm font-semibold'>
                {sinistro.status === 'concluido' ? 'Concluído' : 'Pendente'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção Gestão */}
      <div className='space-y-3 md:space-y-6'>
        {/* Gestão de Status */}
        <div className='border border-gray-200 rounded-lg bg-white p-3 md:p-6'>
          <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
            <div className='w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
              <Settings className='w-4 h-4 md:w-5 md:h-5 text-gray-600' />
            </div>
            <div>
              <h3 className='text-base md:text-lg font-semibold text-gray-900'>Gestão de Status</h3>
              <p className='text-xs md:text-sm text-gray-600 hidden md:block'>Controle o andamento do sinistro</p>
            </div>
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <div className='space-y-2'>
              <Label
                htmlFor='status-select'
                className='text-sm font-medium text-gray-700'
              >
                Alterar Status do Sinistro
              </Label>
              <select
                id='status-select'
                value={sinistro.status}
                onChange={(e) => {
                  if (onAtualizarStatus) {
                    onAtualizarStatus(sinistro.id, e.target.value)
                  }
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
              >
                <option value='pendente'>Pendente</option>
                <option value='em_analise'>Em Análise</option>
                <option value='aprovado'>Aprovado</option>
                <option value='rejeitado'>Rejeitado</option>
                <option value='concluido'>Concluído</option>
              </select>
            </div>

            <div className='space-y-2'>
              <Label className='text-sm font-medium text-gray-700'>Status Atual</Label>
              <div className='flex items-center'>
                <Badge
                  variant={
                    sinistro.status === 'pendente'
                      ? 'secondary'
                      : sinistro.status === 'em_analise'
                      ? 'outline'
                      : sinistro.status === 'aprovado'
                      ? 'default'
                      : sinistro.status === 'rejeitado'
                      ? 'destructive'
                      : 'secondary'
                  }
                  className='px-3 py-1'
                >
                  {sinistro.status === 'pendente' && <Clock4 className='w-3 h-3 mr-1' />}
                  {sinistro.status === 'em_analise' && <Eye className='w-3 h-3 mr-1' />}
                  {sinistro.status === 'aprovado' && <CheckCircle className='w-3 h-3 mr-1' />}
                  {sinistro.status === 'rejeitado' && <XCircle className='w-3 h-3 mr-1' />}
                  {sinistro.status === 'concluido' && <CheckCircle className='w-3 h-3 mr-1' />}
                  {sinistro.status === 'pendente'
                    ? 'Pendente'
                    : sinistro.status === 'em_analise'
                    ? 'Em Análise'
                    : sinistro.status === 'aprovado'
                    ? 'Aprovado'
                    : sinistro.status === 'rejeitado'
                    ? 'Rejeitado'
                    : 'Concluído'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Andamento do Processo - Para sinistros em análise, aprovados e rejeitados */}
        {['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status) && (
          <Card className='border border-gray-200'>
            <CardHeader className='pb-3'>
              <CardTitle className='text-lg flex items-center gap-2'>
                <Activity className='w-5 h-5 text-gray-600' />
                Andamento do Processo
              </CardTitle>
              <p className='text-sm text-gray-600'>Acompanhe cada etapa do processo do sinistro</p>
            </CardHeader>
            <CardContent>
              {loadingAndamento ? (
                <div className='flex items-center justify-center p-8'>
                  <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
                  <span className='ml-2 text-sm text-gray-600'>Carregando andamento...</span>
                </div>
              ) : (
                <div className='space-y-3'>
                  {/* Mostrar apenas passos personalizados */}
                  {andamento
                    .filter((item) => item.personalizado)
                    .map((item, index) => (
                      <Card
                        key={item.id}
                        className='border border-gray-200'
                      >
                        <CardContent className='p-4'>
                          {/* Header do Passo - Mobile First */}
                          <div className='space-y-3'>
                            <div className='flex items-start justify-between gap-2'>
                              <div className='flex items-center gap-2 flex-1 min-w-0'>
                                <div
                                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                    item.status === 'concluido'
                                      ? 'bg-green-500'
                                      : item.status === 'em_andamento'
                                      ? 'bg-blue-500'
                                      : 'bg-gray-300'
                                  }`}
                                />
                                <h4 className='font-medium text-sm lg:text-base truncate'>{item.nome}</h4>
                                <Badge
                                  variant='outline'
                                  className='text-xs bg-gray-50 border-gray-200 text-gray-700'
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
                              <Badge
                                variant={
                                  item.status === 'concluido'
                                    ? 'default'
                                    : item.status === 'em_andamento'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                className='text-xs w-fit'
                              >
                                {item.status === 'concluido' ? (
                                  <CheckCircle className='w-3 h-3 mr-1' />
                                ) : item.status === 'em_andamento' ? (
                                  <PlayCircle className='w-3 h-3 mr-1' />
                                ) : (
                                  <Clock4 className='w-3 h-3 mr-1' />
                                )}
                                {item.status === 'concluido'
                                  ? 'Concluído'
                                  : item.status === 'em_andamento'
                                  ? 'Em Andamento'
                                  : 'Pendente'}
                              </Badge>
                              <select
                                value={item.status}
                                onChange={(e) => {
                                  if (onAtualizarAndamento) {
                                    onAtualizarAndamento(item.id.toString(), e.target.value)
                                  }
                                }}
                                className='px-2 py-1 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 lg:ml-auto'
                              >
                                <option value='pendente'>Pendente</option>
                                <option value='em_andamento'>Em Andamento</option>
                                <option value='concluido'>Concluído</option>
                              </select>
                            </div>
                          </div>

                          {/* Descrição */}
                          <p className='text-sm text-gray-600 mt-3 mb-2'>{item.descricao}</p>

                          {/* Observações */}
                          {item.observacoes && (
                            <div className='text-sm text-blue-600 bg-blue-50 p-2 rounded mt-2'>
                              <strong>Observações:</strong> {item.observacoes}
                            </div>
                          )}

                          {/* Timestamps */}
                          {(item.data_inicio || item.data_conclusao) && (
                            <div className='flex flex-col lg:flex-row lg:justify-between gap-1 text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100'>
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
                  <Card className='border-dashed border-2 border-gray-300'>
                    <CardContent className='p-4'>
                      {!showNovoPassoForm ? (
                        <Button
                          onClick={() => onToggleNovoPassoForm?.(true)}
                          variant='outline'
                          className='w-full border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                        >
                          <Plus className='w-4 h-4 mr-2' />
                          Adicionar Passo Personalizado
                        </Button>
                      ) : (
                        <div className='space-y-4'>
                          <div className='flex items-center gap-2 mb-4'>
                            <Settings className='w-5 h-5 text-gray-600' />
                            <h4 className='font-medium text-lg'>Novo Passo Personalizado</h4>
                          </div>
                          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                            <div className='space-y-2'>
                              <Label
                                htmlFor='novo-passo-nome'
                                className='text-sm font-medium text-gray-600'
                              >
                                Nome do Passo *
                              </Label>
                              <Input
                                id='novo-passo-nome'
                                value={novoPassoData.nome}
                                onChange={(e) => onNovoPassoChange?.({ ...novoPassoData, nome: e.target.value })}
                                placeholder='Ex: Vistoria Adicional'
                                className='focus:ring-2 focus:ring-blue-500'
                              />
                            </div>
                            <div className='space-y-2'>
                              <Label
                                htmlFor='novo-passo-descricao'
                                className='text-sm font-medium text-gray-600'
                              >
                                Descrição *
                              </Label>
                              <Input
                                id='novo-passo-descricao'
                                value={novoPassoData.descricao}
                                onChange={(e) => onNovoPassoChange?.({ ...novoPassoData, descricao: e.target.value })}
                                placeholder='Ex: Vistoria adicional solicitada pelo cliente'
                                className='focus:ring-2 focus:ring-blue-500'
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
        )}

        {/* Informação para outros status */}
        {!['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status) && (
          <Card>
            <CardContent className='p-6 text-center'>
              <div className='text-gray-500'>
                <p className='font-medium'>Andamento do Processo</p>
                <p className='text-sm mt-2'>
                  O acompanhamento detalhado dos passos estará disponível quando o sinistro estiver em análise, aprovado
                  ou rejeitado.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Seção Condutores */}
      <div className='space-y-3 md:space-y-6'>
        <div className='border border-gray-200 rounded-lg bg-white p-3 md:p-6'>
          <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
            <div className='w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
              <User className='w-4 h-4 md:w-5 md:h-5 text-gray-600' />
            </div>
            <div>
              <h3 className='text-base md:text-lg font-semibold text-gray-900'>Condutores</h3>
              <p className='text-xs md:text-sm text-gray-600 hidden md:block'>Informações dos condutores envolvidos</p>
            </div>
          </div>
          {dadosCnh.length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <User className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-500'>Nenhum dado de CNH encontrado</p>
              </CardContent>
            </Card>
          ) : (
            dadosCnh.map((cnh, index) => (
              <Card
                key={index}
                className={
                  cnh.tipo_titular === 'proprio' ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-orange-500'
                }
              >
                <CardHeader className='pb-2 lg:pb-3'>
                  <CardTitle className='text-base lg:text-lg flex items-center gap-2'>
                    {cnh.tipo_titular === 'proprio' ? (
                      <User className='w-5 h-5 text-blue-600' />
                    ) : (
                      <Users className='w-5 h-5 text-orange-600' />
                    )}
                    {cnh.tipo_titular === 'proprio' ? 'Condutor Principal' : 'Condutor Terceiro'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mobile: Layout compacto */}
                  <div className='lg:hidden space-y-3'>
                    <div className='bg-gray-50 rounded-lg p-3'>
                      <div className='text-xs text-gray-600 mb-1'>Nome Completo</div>
                      <div className='font-medium text-sm'>{cnh.nome}</div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>CPF</div>
                        <div className='font-mono text-sm'>{cnh.cpf}</div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>RG</div>
                        <div className='text-sm'>{cnh.rg || 'Não informado'}</div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>Nascimento</div>
                        <div className='text-sm'>
                          {cnh.data_nascimento ? formatarDataSemHora(cnh.data_nascimento) : 'Não informado'}
                        </div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>Categoria</div>
                        <div className='text-sm'>
                          {cnh.categoria ? (
                            <Badge
                              variant='outline'
                              className='bg-blue-50 border-blue-200 text-blue-800 text-xs'
                            >
                              {cnh.categoria}
                            </Badge>
                          ) : (
                            'Não informado'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='bg-gray-50 rounded-lg p-3'>
                      <div className='text-xs text-gray-600 mb-1'>Número de Registro</div>
                      <div className='font-mono text-sm'>{cnh.numero_registro || 'Não informado'}</div>
                    </div>
                  </div>

                  {/* Desktop: Layout original */}
                  <div className='hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Nome Completo</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border font-medium'>{cnh.nome}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>CPF</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border font-mono'>{cnh.cpf}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>RG</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border'>{cnh.rg || 'Não informado'}</p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Data de Nascimento</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border'>
                        {cnh.data_nascimento ? formatarDataSemHora(cnh.data_nascimento) : 'Não informado'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Categoria</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border'>
                        {cnh.categoria ? (
                          <Badge
                            variant='outline'
                            className='bg-blue-50 border-blue-200 text-blue-800'
                          >
                            {cnh.categoria}
                          </Badge>
                        ) : (
                          'Não informado'
                        )}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Número de Registro</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border font-mono'>
                        {cnh.numero_registro || 'Não informado'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Seção Veículos */}
      <div className='space-y-3 md:space-y-6'>
        <div className='border border-gray-200 rounded-lg bg-white p-3 md:p-6'>
          <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
            <div className='w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
              <Car className='w-4 h-4 md:w-5 md:h-5 text-gray-600' />
            </div>
            <div>
              <h3 className='text-base md:text-lg font-semibold text-gray-900'>Veículos</h3>
              <p className='text-xs md:text-sm text-gray-600 hidden md:block'>Informações dos veículos envolvidos</p>
            </div>
          </div>
          {dadosCrlv.length === 0 ? (
            <Card>
              <CardContent className='p-8 text-center'>
                <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                  <Car className='w-8 h-8 text-gray-400' />
                </div>
                <p className='text-gray-500'>Nenhum dado de veículo encontrado</p>
              </CardContent>
            </Card>
          ) : (
            dadosCrlv.map((crlv, index) => (
              <Card
                key={index}
                className={
                  crlv.tipo_veiculo === 'proprio' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-purple-500'
                }
              >
                <CardHeader className='pb-2 lg:pb-3'>
                  <CardTitle className='text-base lg:text-lg flex items-center gap-2'>
                    <Car
                      className={`w-5 h-5 ${crlv.tipo_veiculo === 'proprio' ? 'text-green-600' : 'text-purple-600'}`}
                    />
                    {crlv.tipo_veiculo === 'proprio' ? 'Veículo Principal' : 'Veículo Terceiro'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Mobile: Layout compacto */}
                  <div className='lg:hidden space-y-3'>
                    <div className='bg-green-50 rounded-lg p-3 border border-green-200'>
                      <div className='text-xs text-green-700 mb-1 text-center font-medium'>Placa do Veículo</div>
                      <div className='font-mono text-lg font-bold text-center text-green-800 bg-white py-2 rounded border'>
                        {crlv.placa}
                      </div>
                    </div>
                    <div className='bg-gray-50 rounded-lg p-3'>
                      <div className='text-xs text-gray-600 mb-1'>Marca/Modelo</div>
                      <div className='font-medium text-sm'>
                        {crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>Ano Fabr.</div>
                        <div className='text-sm font-medium'>{crlv.ano_fabricacao || 'Não informado'}</div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>Ano Modelo</div>
                        <div className='text-sm font-medium'>{crlv.ano_modelo || 'Não informado'}</div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>Cor</div>
                        <div className='text-sm'>
                          {crlv.cor ? (
                            <Badge
                              variant='outline'
                              className='bg-gray-100 border-gray-300 text-xs'
                            >
                              {crlv.cor}
                            </Badge>
                          ) : (
                            'Não informado'
                          )}
                        </div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>Combustível</div>
                        <div className='text-sm'>
                          {crlv.combustivel ? (
                            <Badge
                              variant='outline'
                              className='bg-green-50 border-green-200 text-green-800 text-xs'
                            >
                              {crlv.combustivel}
                            </Badge>
                          ) : (
                            'Não informado'
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>RENAVAM</div>
                        <div className='font-mono text-sm'>{crlv.renavam || 'Não informado'}</div>
                      </div>
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>Chassi</div>
                        <div className='font-mono text-xs break-all'>{crlv.chassi || 'Não informado'}</div>
                      </div>
                    </div>
                    {crlv.proprietario && (
                      <div className='bg-gray-50 rounded-lg p-3'>
                        <div className='text-xs text-gray-600 mb-1'>Proprietário</div>
                        <div className='font-medium text-sm'>{crlv.proprietario}</div>
                      </div>
                    )}
                  </div>

                  {/* Desktop: Layout original */}
                  <div className='hidden lg:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Placa</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border font-mono text-lg font-bold text-center'>
                        {crlv.placa}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>RENAVAM</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border font-mono'>
                        {crlv.renavam || 'Não informado'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Chassi</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border font-mono text-xs'>
                        {crlv.chassi || 'Não informado'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Marca/Modelo</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border font-medium'>
                        {crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Ano Fabricação</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border text-center font-medium'>
                        {crlv.ano_fabricacao || 'Não informado'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Ano Modelo</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border text-center font-medium'>
                        {crlv.ano_modelo || 'Não informado'}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Cor</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border'>
                        {crlv.cor ? (
                          <Badge
                            variant='outline'
                            className='bg-gray-100 border-gray-300'
                          >
                            {crlv.cor}
                          </Badge>
                        ) : (
                          'Não informado'
                        )}
                      </p>
                    </div>
                    <div className='space-y-2'>
                      <Label className='text-sm font-medium text-gray-600'>Combustível</Label>
                      <p className='text-sm bg-gray-50 p-2 rounded border'>
                        {crlv.combustivel ? (
                          <Badge
                            variant='outline'
                            className='bg-green-50 border-green-200 text-green-800'
                          >
                            {crlv.combustivel}
                          </Badge>
                        ) : (
                          'Não informado'
                        )}
                      </p>
                    </div>
                    {crlv.proprietario && (
                      <div className='space-y-2 lg:col-span-2'>
                        <Label className='text-sm font-medium text-gray-600'>Proprietário</Label>
                        <p className='text-sm bg-gray-50 p-2 rounded border font-medium'>{crlv.proprietario}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Seção Arquivos */}
      <div
        id='arquivos-section'
        className='space-y-3 md:space-y-6'
      >
        <div className='border border-gray-200 rounded-lg bg-white p-3 md:p-6'>
          <div className='flex items-center gap-2 md:gap-3 mb-3 md:mb-6'>
            <div className='w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
              <FolderOpen className='w-4 h-4 md:w-5 md:h-5 text-gray-600' />
            </div>
            <div>
              <h3 className='text-base md:text-lg font-semibold text-gray-900'>Arquivos</h3>
              <p className='text-xs md:text-sm text-gray-600 hidden md:block'>Documentos e fotos anexados</p>
            </div>
          </div>

          {/* Layout unificado moderno */}
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4'>
            {arquivos.map((arquivo, index) => (
              <div
                key={index}
                className='group relative overflow-hidden rounded-lg md:rounded-2xl bg-white border border-gray-200/50 hover:border-indigo-300/50 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10'
              >
                {/* Preview da imagem ou ícone */}
                <div className='relative h-32 md:h-48 bg-gradient-to-br from-gray-50 to-gray-100'>
                  {arquivo.url_arquivo &&
                  (arquivo.tipo_mime?.startsWith('image/') || arquivo.tipo_arquivo === 'foto_veiculo') ? (
                    <img
                      src={arquivo.url_arquivo}
                      alt={arquivo.nome_original}
                      className='w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform duration-300'
                      onClick={() => window.open(arquivo.url_arquivo, '_blank')}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        target.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : (
                    <div className='w-full h-48 flex items-center justify-center'>
                      <div className='text-center'>
                        <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3'>
                          {arquivo.tipo_arquivo === 'foto_veiculo' ? (
                            <Camera className='w-8 h-8 text-gray-500' />
                          ) : (
                            <FileText className='w-8 h-8 text-gray-500' />
                          )}
                        </div>
                        <p className='text-sm text-gray-600 font-medium'>
                          {arquivo.tipo_arquivo === 'cnh_proprio'
                            ? 'CNH Principal'
                            : arquivo.tipo_arquivo === 'cnh_terceiro'
                            ? 'CNH Terceiro'
                            : arquivo.tipo_arquivo === 'crlv_proprio'
                            ? 'CRLV Principal'
                            : arquivo.tipo_arquivo === 'crlv_terceiro'
                            ? 'CRLV Terceiro'
                            : arquivo.tipo_arquivo === 'boletim_ocorrencia'
                            ? 'Boletim de Ocorrência'
                            : 'Documento'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Overlay com badge do tipo */}
                  <div className='absolute top-3 left-3'>
                    <Badge
                      variant='secondary'
                      className='text-xs font-medium shadow-sm'
                    >
                      {arquivo.tipo_arquivo === 'cnh_proprio'
                        ? 'CNH'
                        : arquivo.tipo_arquivo === 'cnh_terceiro'
                        ? 'CNH 3º'
                        : arquivo.tipo_arquivo === 'crlv_proprio'
                        ? 'CRLV'
                        : arquivo.tipo_arquivo === 'crlv_terceiro'
                        ? 'CRLV 3º'
                        : arquivo.tipo_arquivo === 'boletim_ocorrencia'
                        ? 'B.O.'
                        : 'Foto'}
                    </Badge>
                  </div>

                  {/* Botão de ação */}
                  {arquivo.url_arquivo && (
                    <div className='absolute top-3 right-3'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => window.open(arquivo.url_arquivo, '_blank')}
                        className='h-8 w-8 p-0 bg-white/90 border-gray-200 hover:bg-white hover:scale-105 transition-all duration-200 shadow-sm'
                        title='Abrir arquivo'
                      >
                        <Download className='w-3 h-3' />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Informações do arquivo */}
                <div className='p-2 md:p-4'>
                  <h4
                    className='font-semibold text-sm md:text-base text-gray-800 mb-1 truncate'
                    title={arquivo.nome_original}
                  >
                    {arquivo.nome_original}
                  </h4>
                  {arquivo.titulo_foto && (
                    <p className='text-xs md:text-sm text-indigo-600 mb-1 md:mb-2 truncate'>{arquivo.titulo_foto}</p>
                  )}
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-medium text-gray-500 bg-gray-100 px-1 md:px-2 py-1 rounded-full'>
                      {(arquivo.tamanho_arquivo / 1024).toFixed(1)}KB
                    </span>
                    {arquivo.tipo_mime && (
                      <span className='text-xs font-medium text-gray-500 uppercase bg-gray-100 px-1 md:px-2 py-1 rounded-full'>
                        {arquivo.tipo_mime.split('/')[1]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mensagem quando não há arquivos */}
          {arquivos.length === 0 && (
            <div className='text-center py-12'>
              <div className='w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-6'>
                <FolderOpen className='w-12 h-12 text-gray-400' />
              </div>
              <h3 className='text-lg font-semibold text-gray-700 mb-2'>Nenhum arquivo encontrado</h3>
              <p className='text-gray-500'>Este sinistro ainda não possui arquivos anexados.</p>
            </div>
          )}
        </div>
      </div>

      {/* Seção Histórico */}
      <div className='space-y-3 md:space-y-6'>
        <Collapsible
          open={historicoAberto}
          onOpenChange={setHistoricoAberto}
        >
          <div className='border border-gray-200 rounded-lg bg-white p-3 md:p-6'>
            <CollapsibleTrigger asChild>
              <div className='flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-1 md:-m-2 p-1 md:p-2 rounded-lg transition-colors'>
                <div className='flex items-center gap-2 md:gap-3'>
                  <div className='w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center'>
                    <Activity className='w-4 h-4 md:w-5 md:h-5 text-gray-600' />
                  </div>
                  <div>
                    <h3 className='text-base md:text-lg font-semibold text-gray-900'>Histórico</h3>
                    <p className='text-xs md:text-sm text-gray-600 hidden md:inline'>
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
                    <X className='w-4 h-4 text-gray-400' />
                  ) : (
                    <Plus className='w-4 h-4 text-gray-400' />
                  )}
                </div>
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent className='mt-4 md:mt-6'>
              {logs.length === 0 ? (
                <Card>
                  <CardContent className='p-8 text-center'>
                    <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4'>
                      <Activity className='w-8 h-8 text-gray-400' />
                    </div>
                    <p className='text-gray-500'>Nenhum histórico encontrado</p>
                  </CardContent>
                </Card>
              ) : (
                <div className='space-y-3'>
                  {/* Mobile: Layout compacto */}
                  <div className='lg:hidden space-y-2'>
                    {logs.map((log, index) => (
                      <Card
                        key={index}
                        className='border-l-4 border-l-indigo-200'
                      >
                        <CardContent className='p-3'>
                          <div className='flex items-start gap-3'>
                            <div className='flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center'>
                              <FileText className='w-4 h-4 text-gray-600' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-center justify-between mb-1'>
                                <h4 className='font-medium text-sm truncate'>{log.acao}</h4>
                                <span className='text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded flex-shrink-0'>
                                  {formatarData(log.created_at).split(' ')[0]}
                                </span>
                              </div>
                              <p className='text-xs text-gray-600 mb-2 line-clamp-2'>{log.descricao}</p>
                              <div className='flex items-center justify-between'>
                                <span className='text-xs text-gray-500'>
                                  {formatarData(log.created_at).split(' ')[1]}
                                </span>
                                {log.usuario_nome && (
                                  <span className='text-xs text-blue-600 font-medium flex items-center gap-1'>
                                    <User className='w-3 h-3' />
                                    {log.usuario_nome}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop: Layout original */}
                  <div className='hidden lg:block space-y-3'>
                    {logs.map((log, index) => (
                      <Card
                        key={index}
                        className='border-l-4 border-l-indigo-200'
                      >
                        <CardContent className='p-4'>
                          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-3'>
                            <div className='flex items-center gap-2'>
                              <FileText className='w-5 h-5 text-gray-600' />
                              <span className='font-medium text-base'>{log.acao}</span>
                            </div>
                            <div className='flex flex-col lg:items-end gap-1'>
                              <span className='text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded'>
                                {formatarData(log.created_at)}
                              </span>
                              {log.usuario_nome && (
                                <span className='text-xs text-blue-600 font-medium flex items-center gap-1'>
                                  <User className='w-3 h-3' />
                                  {log.usuario_nome}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className='text-sm text-gray-600 bg-gray-50 p-2 rounded border'>{log.descricao}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </div>
  )
}


export { DetalhesSinistro }
