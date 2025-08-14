"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  FileText, 
  AlertCircle,
  Clock4,
  Eye,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Headphones,
  Car,
  AlertTriangle,
  Wrench,
  Shield,
  Loader2
} from 'lucide-react'
import { formatDate, formatarTodasAssistencias } from './admin-formatters'
import { OccurrenceDetails } from './OccurrenceDetails'

interface DashboardMetrics {
  logs: Array<{
    id: string
    numero_sinistro: string
    tipo_atendimento: string
    tipo_sinistro?: string
    tipo_assistencia?: string
    assistencia_adicional?: boolean
    status: string
    data_criacao: string
    cnh_proprio_nome: string
    total_assistencias?: number
    assistencias_tipos?: string
  }>
}

interface SinistroDetalhado {
  sinistro: any
  dadosCnh: any[]
  dadosCrlv: any[]
  arquivos: any[]
  logs: any[]
}

interface OccurrencesListProps {
  metrics: DashboardMetrics
  isDark: boolean
  carregarDetalhes: (sinistroId: string) => Promise<void>
  selectedSinistro: SinistroDetalhado | null
  loadingDetalhes: boolean
}

export function OccurrencesList({ 
  metrics, 
  isDark, 
  carregarDetalhes, 
  selectedSinistro, 
  loadingDetalhes 
}: OccurrencesListProps) {
  return (
    <Card className={`border-0 shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm'}`}>
      <CardHeader>
        <CardTitle className={`text-xl flex items-center gap-3 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          <FileText className="w-6 h-6 text-blue-600" />
          Ocorrências Recentes
          <Badge variant="secondary" className="ml-auto">
            {metrics.logs.length} registros
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid gap-4">
          {metrics.logs.length === 0 ? (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhuma ocorrência encontrada</h3>
                <p className="text-sm text-gray-500">
                  Nenhuma ocorrência encontrada no período selecionado
                </p>
              </CardContent>
            </Card>
          ) : (
            metrics.logs.map((log) => (
              <Card key={log.id} className="hover:shadow-lg transition-all border-l-4 border-l-blue-200 hover:border-l-blue-400">
                <CardContent className="p-4 sm:p-5">
                  {/* Mobile Layout */}
                  <div className="lg:hidden space-y-4">
                    {/* Linha 1: Número do sinistro + Status */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-sm font-bold bg-blue-50 border-blue-200 text-blue-800 px-3 py-1">
                        #{log.numero_sinistro}
                      </Badge>
                      <Badge 
                        variant={
                          log.status === 'concluido' ? 'default' :
                          log.status === 'aprovado' ? 'secondary' :
                          log.status === 'em_analise' ? 'outline' :
                          log.status === 'rejeitado' ? 'destructive' :
                          'secondary'
                        }
                        className={`text-xs px-2 py-1 ${
                          log.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                          log.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          log.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          log.status === 'rejeitado' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {log.status === 'pendente' && <Clock4 className="w-3 h-3 mr-1" />}
                        {log.status === 'em_analise' && <Eye className="w-3 h-3 mr-1" />}
                        {log.status === 'aprovado' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {log.status === 'rejeitado' && <XCircle className="w-3 h-3 mr-1" />}
                        {log.status === 'concluido' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {log.status === 'pendente' ? 'Pendente' :
                         log.status === 'em_analise' ? 'Em Análise' :
                         log.status === 'aprovado' ? 'Aprovado' :
                         log.status === 'rejeitado' ? 'Rejeitado' :
                         'Concluído'}
                      </Badge>
                    </div>

                    {/* Linha 2: Tipo de ocorrência */}
                    <div className="flex justify-center">
                      <Badge 
                        variant={
                          log.tipo_atendimento === 'assistencia' ? 'default' :
                          log.tipo_sinistro === 'colisao' ? 'destructive' : 
                          log.tipo_sinistro === 'pequenos_reparos' ? 'outline' :
                          'secondary'
                        }
                        className={`text-xs px-3 py-1 ${
                          log.tipo_atendimento === 'assistencia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          log.tipo_sinistro === 'colisao' ? 'bg-red-100 text-red-800 border-red-200' :
                          log.tipo_sinistro === 'furto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          log.tipo_sinistro === 'roubo' ? 'bg-red-100 text-red-800 border-red-200' :
                          log.tipo_sinistro === 'pequenos_reparos' ? 'bg-green-100 text-green-800 border-green-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {(() => {
                            if (log.tipo_atendimento === 'assistencia') {
                              const todasAssistencias = formatarTodasAssistencias(log)
                              return (
                                <>
                                  <Headphones className="w-3 h-3" /> 
                                  Assistência - {todasAssistencias}
                                </>
                              )
                            }
                            
                            const baseElement = (() => {
                              switch (log.tipo_sinistro) {
                                case 'colisao':
                                  return <><Car className="w-3 h-3" /> Colisão</>
                                case 'furto':
                                  return <><Shield className="w-3 h-3" /> Furto</>
                                case 'roubo':
                                  return <><AlertTriangle className="w-3 h-3" /> Roubo</>
                                case 'pequenos_reparos':
                                  return <><Wrench className="w-3 h-3" /> Pequenos Reparos</>
                                default:
                                  return <>Tipo não identificado</>
                              }
                            })()
                            
                            return (
                              <>
                                {baseElement}
                                {log.assistencias_tipos && log.assistencias_tipos.length > 0 && (
                                  <span className="ml-1 text-xs text-gray-600">
                                    - {formatarTodasAssistencias(log)}
                                  </span>
                                )}
                              </>
                            )
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
                            {log.cnh_proprio_nome || 'Nome não informado'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <div className="text-xs text-gray-500">
                            {formatDate(log.data_criacao)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Linha 4: Botão de ação */}
                    <div className="flex justify-center pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-xs"
                            onClick={async () => {
                              await carregarDetalhes(log.id)
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Ver Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col" aria-describedby="dialog-description">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Ocorrência {log.numero_sinistro}</DialogTitle>
                            <div id="dialog-description" className="sr-only">
                              Visualização completa dos dados da ocorrência incluindo documentos, fotos e histórico
                            </div>
                          </DialogHeader>
                          {loadingDetalhes ? (
                            <div className="flex items-center justify-center p-8">
                              <Loader2 className="w-8 h-8 animate-spin" />
                            </div>
                          ) : selectedSinistro ? (
                            <OccurrenceDetails 
                              dados={selectedSinistro} 
                            />
                          ) : null}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:block">
                    <div className="space-y-3">
                      {/* Linha 1: Número + Status + Tipo */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="font-mono text-sm font-bold bg-blue-50 border-blue-200 text-blue-800 px-3 py-1">
                            #{log.numero_sinistro}
                          </Badge>
                          <Badge 
                            variant={
                              log.tipo_atendimento === 'assistencia' ? 'default' :
                              log.tipo_sinistro === 'colisao' ? 'destructive' : 
                              log.tipo_sinistro === 'pequenos_reparos' ? 'outline' :
                              'secondary'
                            }
                            className={`text-sm px-3 py-1 ${
                              log.tipo_atendimento === 'assistencia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                              log.tipo_sinistro === 'colisao' ? 'bg-red-100 text-red-800 border-red-200' :
                              log.tipo_sinistro === 'furto' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                              log.tipo_sinistro === 'roubo' ? 'bg-red-100 text-red-800 border-red-200' :
                              log.tipo_sinistro === 'pequenos_reparos' ? 'bg-green-100 text-green-800 border-green-200' :
                              'bg-gray-100 text-gray-800 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              {(() => {
                                if (log.tipo_atendimento === 'assistencia') {
                                  const todasAssistencias = formatarTodasAssistencias(log)
                                  return (
                                    <>
                                      <Headphones className="w-3 h-3" /> 
                                      Assistência - {todasAssistencias}
                                    </>
                                  )
                                }
                                
                                const baseElement = (() => {
                                  switch (log.tipo_sinistro) {
                                    case 'colisao':
                                      return <><Car className="w-3 h-3" /> Colisão</>
                                    case 'furto':
                                      return <><Shield className="w-3 h-3" /> Furto</>
                                    case 'roubo':
                                      return <><AlertTriangle className="w-3 h-3" /> Roubo</>
                                    case 'pequenos_reparos':
                                      return <><Wrench className="w-3 h-3" /> Pequenos Reparos</>
                                    default:
                                      return <>Tipo não identificado</>
                                  }
                                })()
                                
                                return (
                                  <>
                                    {baseElement}
                                    {log.assistencias_tipos && log.assistencias_tipos.length > 0 && (
                                      <span className="ml-1 text-xs text-gray-600">
                                        - {formatarTodasAssistencias(log)}
                                      </span>
                                    )}
                                  </>
                                )
                              })()}
                            </div>
                          </Badge>
                        </div>
                        <Badge 
                          variant={
                            log.status === 'concluido' ? 'default' :
                            log.status === 'aprovado' ? 'secondary' :
                            log.status === 'em_analise' ? 'outline' :
                            log.status === 'rejeitado' ? 'destructive' :
                            'secondary'
                          }
                          className={`${
                            log.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                            log.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            log.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            log.status === 'rejeitado' ? 'bg-red-100 text-red-800 border-red-200' :
                            'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {log.status === 'pendente' && <Clock4 className="w-3 h-3 mr-1" />}
                          {log.status === 'em_analise' && <Eye className="w-3 h-3 mr-1" />}
                          {log.status === 'aprovado' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {log.status === 'rejeitado' && <XCircle className="w-3 h-3 mr-1" />}
                          {log.status === 'concluido' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {log.status === 'pendente' ? 'Pendente' :
                           log.status === 'em_analise' ? 'Em Análise' :
                           log.status === 'aprovado' ? 'Aprovado' :
                           log.status === 'rejeitado' ? 'Rejeitado' :
                           'Concluído'}
                        </Badge>
                      </div>

                      {/* Linha 2: Informações Principais */}
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs text-gray-500 block">Condutor</span>
                              <span className="text-sm font-medium truncate block">
                                {log.cnh_proprio_nome || 'Nome não informado'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200">
                          <Calendar className="w-4 h-4 text-purple-600 flex-shrink-0" />
                          <div>
                            <span className="text-xs text-gray-500">Criado em</span>
                            <span className="text-sm font-medium ml-2">{formatDate(log.data_criacao)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Linha 3: Botão de ação */}
                      <div className="flex justify-end">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={async () => {
                                await carregarDetalhes(log.id)
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              Ver Detalhes
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="w-[95vw] max-w-6xl h-[90vh] overflow-hidden flex flex-col" aria-describedby="dialog-description">
                            <DialogHeader>
                              <DialogTitle>Detalhes da Ocorrência {log.numero_sinistro}</DialogTitle>
                              <div id="dialog-description" className="sr-only">
                                Visualização completa dos dados da ocorrência incluindo documentos, fotos e histórico
                              </div>
                            </DialogHeader>
                            {loadingDetalhes ? (
                              <div className="flex items-center justify-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin" />
                              </div>
                            ) : selectedSinistro ? (
                              <OccurrenceDetails 
                                dados={selectedSinistro} 
                              />
                            ) : null}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}