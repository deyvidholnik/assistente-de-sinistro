"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Clock4,
  Car,
  User,
  Calendar,
  FileText,
  Users,
  AlertTriangle,
  PlayCircle,
  Shield,
  Headphones,
  Wrench,
  Loader2
} from "lucide-react"

interface Sinistro {
  id: string
  numero_sinistro: string
  status: string
  tipo_atendimento?: string
  tipo_sinistro?: string
  tipo_assistencia?: string
  assistencias_tipos?: string[]
  cnh_proprio_nome?: string
  nome_completo_furto?: string
  crlv_proprio_placa?: string
  placa_veiculo_furto?: string
  crlv_proprio_marca?: string
  crlv_proprio_modelo?: string
  data_criacao: string
  total_arquivos: number
  outros_veiculos_envolvidos?: boolean
  documentos_furtados?: boolean
}

interface SinistroDetalhado {
  sinistro: Sinistro
}

interface GerenteListaSinistrosProps {
  sinistrosFiltrados: Sinistro[]
  passosPersonalizados: Record<string, any[]>
  formatarData: (data: string) => string
  formatarTodasAssistencias: (sinistro: Sinistro) => string
  carregarDetalhes: (id: string) => Promise<void>
  carregarAndamento: (id: string) => Promise<void>
  loadingDetalhes: boolean
  selectedSinistro: SinistroDetalhado | null
  andamentoSinistro: any[]
  loadingAndamento: boolean
  atualizarStatusSinistro: (sinistroId: string, novoStatus: string, observacoes?: string) => Promise<void>
  atualizarAndamentoPasso: (passoId: string, status: string, observacoes?: string) => Promise<void>
  adicionarNovoPasso: () => Promise<void>
  removerPassoPersonalizado: (passoId: string) => Promise<void>
  showNovoPassoForm: boolean
  novoPassoData: { nome: string; descricao: string }
  setNovoPassoData: (data: { nome: string; descricao: string }) => void
  setShowNovoPassoForm: (value: boolean) => void
  DetalhesSinistro: any
}

export function GerenteListaSinistros({
  sinistrosFiltrados,
  passosPersonalizados,
  formatarData,
  formatarTodasAssistencias,
  carregarDetalhes,
  carregarAndamento,
  loadingDetalhes,
  selectedSinistro,
  andamentoSinistro,
  loadingAndamento,
  atualizarStatusSinistro,
  atualizarAndamentoPasso,
  adicionarNovoPasso,
  removerPassoPersonalizado,
  showNovoPassoForm,
  novoPassoData,
  setNovoPassoData,
  setShowNovoPassoForm,
  DetalhesSinistro
}: GerenteListaSinistrosProps) {
  return (
    <div className="grid gap-4">
      {sinistrosFiltrados.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum sinistro encontrado</h3>
            <p className="text-sm text-gray-500">Tente ajustar os filtros de busca para encontrar sinistros</p>
          </CardContent>
        </Card>
      ) : (
        sinistrosFiltrados.map((sinistro) => (
          <Card
            key={sinistro.id}
            className="hover:shadow-lg transition-all border-l-4 border-l-blue-200 hover:border-l-blue-400"
          >
            <CardContent className="p-4 sm:p-5">
              {/* Mobile Layout */}
              <div className="lg:hidden space-y-4">
                {/* Linha 1: Número do sinistro + Status */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="font-mono text-sm font-bold bg-blue-50 border-blue-200 text-blue-800 px-3 py-1"
                  >
                    #{sinistro.numero_sinistro}
                  </Badge>
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
                    className={`text-xs px-2 py-1 ${{
                      concluido: 'bg-green-100 text-green-800 border-green-200',
                      aprovado: 'bg-blue-100 text-blue-800 border-blue-200',
                      em_analise: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                      rejeitado: 'bg-red-100 text-red-800 border-red-200'
                    }[sinistro.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                  >
                    <div className="flex items-center gap-1">
                      {sinistro.status === 'concluido' ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Concluído
                        </>
                      ) : sinistro.status === 'aprovado' ? (
                        <>
                          <CheckCircle className="w-3 h-3" /> Aprovado
                        </>
                      ) : sinistro.status === 'em_analise' ? (
                        <>
                          <Eye className="w-3 h-3" /> Em Análise
                        </>
                      ) : sinistro.status === 'rejeitado' ? (
                        <>
                          <XCircle className="w-3 h-3" /> Rejeitado
                        </>
                      ) : (
                        <>
                          <Clock4 className="w-3 h-3" /> Pendente
                        </>
                      )}
                    </div>
                  </Badge>
                </div>

                {/* Linha 2: Tipo de atendimento */}
                <div className="flex justify-center">
                  <Badge
                    variant={
                      sinistro.tipo_atendimento === 'assistencia'
                        ? 'default'
                        : sinistro.tipo_sinistro === 'colisao'
                        ? 'destructive'
                        : sinistro.tipo_sinistro === 'pequenos_reparos'
                        ? 'outline'
                        : 'secondary'
                    }
                    className={`text-xs px-3 py-1 ${{
                      assistencia: 'bg-purple-100 text-purple-800 border-purple-200',
                      colisao: 'bg-red-100 text-red-800 border-red-200',
                      furto: 'bg-orange-100 text-orange-800 border-orange-200',
                      roubo: 'bg-red-100 text-red-800 border-red-200',
                      pequenos_reparos: 'bg-green-100 text-green-800 border-green-200'
                    }[sinistro.tipo_atendimento === 'assistencia' ? 'assistencia' : sinistro.tipo_sinistro || ''] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
                  >
                    <div className="flex items-center gap-1">
                      {(() => {
                        if (sinistro.tipo_atendimento === 'assistencia') {
                          const todasAssistencias = formatarTodasAssistencias(sinistro)
                          return (
                            <>
                              <Headphones className="w-3 h-3" />
                              Assistência - {todasAssistencias}
                            </>
                          )
                        }

                        switch (sinistro.tipo_sinistro) {
                          case 'colisao':
                            return (
                              <>
                                <Car className="w-3 h-3" /> Colisão
                              </>
                            )
                          case 'furto':
                            return (
                              <>
                                <Shield className="w-3 h-3" /> Furto
                              </>
                            )
                          case 'roubo':
                            return (
                              <>
                                <AlertTriangle className="w-3 h-3" /> Roubo
                              </>
                            )
                          case 'pequenos_reparos':
                            return (
                              <>
                                <Wrench className="w-3 h-3" /> Pequenos Reparos
                              </>
                            )
                          default:
                            return <>Tipo não identificado</>
                        }
                      })()}
                    </div>
                  </Badge>
                </div>

                {/* Linha 3: Informações principais */}
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-500">Condutor</div>
                      <div className="text-sm font-medium truncate">
                        {sinistro.cnh_proprio_nome || sinistro.nome_completo_furto || 'Nome não informado'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs text-gray-500">Veículo</div>
                      <div className="text-sm font-medium font-mono">
                        {sinistro.crlv_proprio_placa || sinistro.placa_veiculo_furto || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {sinistro.crlv_proprio_marca && sinistro.crlv_proprio_modelo
                          ? `${sinistro.crlv_proprio_marca} ${sinistro.crlv_proprio_modelo}`
                          : 'Modelo não identificado'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <div className="text-xs text-gray-500">{formatarData(sinistro.data_criacao)}</div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <FileText className="w-3 h-3" />
                      <span>{sinistro.total_arquivos} arquivos</span>
                    </div>
                  </div>
                </div>

                {/* Linha 4: Tags especiais */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {sinistro.outros_veiculos_envolvidos && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-blue-50 border-blue-200 text-blue-700"
                    >
                      <Users className="w-3 h-3 mr-1" />
                      Terceiros
                    </Badge>
                  )}
                  {sinistro.documentos_furtados && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-red-50 border-red-200 text-red-700"
                    >
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Docs Furtados
                    </Badge>
                  )}

                  {/* Tags de passos personalizados */}
                  {passosPersonalizados[sinistro.id]?.slice(0, 2).map((passo, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className={`text-xs font-medium ${{
                        concluido: 'bg-green-50 border-green-200 text-green-700',
                        em_andamento: 'bg-blue-50 border-blue-200 text-blue-700'
                      }[passo.status] || 'bg-gray-50 border-gray-200 text-gray-700'}`}
                    >
                      {passo.status === 'concluido' ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : passo.status === 'em_andamento' ? (
                        <PlayCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock4 className="w-3 h-3 mr-1" />
                      )}
                      {passo.nome}
                    </Badge>
                  ))}

                  {/* Indicador de mais passos */}
                  {passosPersonalizados[sinistro.id] && passosPersonalizados[sinistro.id].length > 2 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-gray-50 border-gray-200 text-gray-700"
                    >
                      +{passosPersonalizados[sinistro.id].length - 2} mais
                    </Badge>
                  )}
                </div>

                {/* Linha 5: Botão de ação */}
                <div className="flex justify-center pt-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          await carregarDetalhes(sinistro.id)
                          if (['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status)) {
                            await carregarAndamento(sinistro.id)
                          }
                        }}
                        className="h-9 text-sm hover:bg-blue-50 hover:border-blue-300 w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </DialogTrigger>
                    <DialogContent
                      className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col"
                      aria-describedby="dialog-description"
                    >
                      <DialogHeader>
                        <DialogTitle>Detalhes do Sinistro {sinistro.numero_sinistro}</DialogTitle>
                        <div
                          id="dialog-description"
                          className="sr-only"
                        >
                          Visualização completa dos dados do sinistro incluindo documentos, fotos e histórico
                        </div>
                      </DialogHeader>
                      {loadingDetalhes ? (
                        <div className="flex items-center justify-center p-8">
                          <Loader2 className="w-8 h-8 animate-spin" />
                        </div>
                      ) : selectedSinistro ? (
                        <DetalhesSinistro
                          dados={selectedSinistro}
                          andamento={andamentoSinistro}
                          loadingAndamento={loadingAndamento}
                          onAtualizarStatus={atualizarStatusSinistro}
                          onAtualizarAndamento={atualizarAndamentoPasso}
                          onAdicionarNovoPasso={adicionarNovoPasso}
                          onRemoverPasso={removerPassoPersonalizado}
                          showNovoPassoForm={showNovoPassoForm}
                          novoPassoData={novoPassoData}
                          onNovoPassoChange={setNovoPassoData}
                          onToggleNovoPassoForm={setShowNovoPassoForm}
                        />
                      ) : null}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Desktop Layout - Versão simplificada para não ser muito extenso */}
              <div className="hidden lg:block">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className="font-mono text-sm font-bold bg-blue-50 border-blue-200 text-blue-800 px-3 py-1"
                      >
                        #{sinistro.numero_sinistro}
                      </Badge>
                      {/* Status e tipo badges similares ao mobile */}
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await carregarDetalhes(sinistro.id)
                            if (['em_analise', 'aprovado', 'rejeitado'].includes(sinistro.status)) {
                              await carregarAndamento(sinistro.id)
                            }
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent
                        className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col"
                        aria-describedby="dialog-description"
                      >
                        <DialogHeader>
                          <DialogTitle>Detalhes do Sinistro {sinistro.numero_sinistro}</DialogTitle>
                          <div
                            id="dialog-description"
                            className="sr-only"
                          >
                            Visualização completa dos dados do sinistro incluindo documentos, fotos e histórico
                          </div>
                        </DialogHeader>
                        {loadingDetalhes ? (
                          <div className="flex items-center justify-center p-8">
                            <Loader2 className="w-8 h-8 animate-spin" />
                          </div>
                        ) : selectedSinistro ? (
                          <DetalhesSinistro
                            dados={selectedSinistro}
                            andamento={andamentoSinistro}
                            loadingAndamento={loadingAndamento}
                            onAtualizarStatus={atualizarStatusSinistro}
                            onAtualizarAndamento={atualizarAndamentoPasso}
                            onAdicionarNovoPasso={adicionarNovoPasso}
                            onRemoverPasso={removerPassoPersonalizado}
                            showNovoPassoForm={showNovoPassoForm}
                            novoPassoData={novoPassoData}
                            onNovoPassoChange={setNovoPassoData}
                            onToggleNovoPassoForm={setShowNovoPassoForm}
                          />
                        ) : null}
                      </DialogContent>
                    </Dialog>
                  </div>
                  {/* Informações principais em layout desktop */}
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Condutor:</span>
                      <div className="font-medium">{sinistro.cnh_proprio_nome || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Veículo:</span>
                      <div className="font-mono">{sinistro.crlv_proprio_placa || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Data:</span>
                      <div>{formatarData(sinistro.data_criacao)}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Arquivos:</span>
                      <div>{sinistro.total_arquivos}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}