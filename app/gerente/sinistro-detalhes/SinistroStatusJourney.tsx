'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Route, Plus, X, Clock, CheckCircle, AlertCircle, Eye, FileCheck, User } from 'lucide-react'
import { formatarData } from '../gerente-formatters'

// Interfaces para tipagem do status journey
interface StatusChange {
  id: string
  status_anterior: string | null
  status_atual: string
  created_at: string
  usuario_nome?: string
  observacoes?: string
  tempo_no_status?: number // em minutos
}

interface StatusStep {
  nome: string
  descricao: string
  status: 'concluido' | 'em_andamento' | 'pendente'
  tempo_estimado?: string
}

interface StatusJourneyData {
  mudancas: StatusChange[]
  passos_personalizados: { [status: string]: StatusStep[] }
  proximo_passo?: string
}

interface SinistroStatusJourneyProps {
  sinistro: any
  statusJourney: StatusJourneyData
}

// Configuração de cores e ícones para cada status
const statusConfig = {
  pendente: {
    color: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    icon: Clock,
    emoji: '🟡',
    label: 'Pendente'
  },
  em_analise: {
    color: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: Eye,
    emoji: '🔵',
    label: 'Em Análise'
  },
  aprovado: {
    color: 'bg-green-50 border-green-200 text-green-700',
    icon: CheckCircle,
    emoji: '🟢',
    label: 'Aprovado'
  },
  rejeitado: {
    color: 'bg-red-50 border-red-200 text-red-700',
    icon: AlertCircle,
    emoji: '🔴',
    label: 'Rejeitado'
  },
  concluido: {
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    icon: CheckCircle,
    emoji: '✅',
    label: 'Concluído'
  }
}

const StatusCard = ({ mudanca, passos, isLast, isFirst }: { 
  mudanca: StatusChange
  passos?: StatusStep[]
  isLast: boolean
  isFirst: boolean
}) => {
  const [expanded, setExpanded] = useState(false)
  const config = statusConfig[mudanca.status_atual as keyof typeof statusConfig]
  const Icon = config?.icon || FileCheck
  
  return (
    <div className="relative">
      {/* Linha conectora - Mobile */}
      {!isLast && (
        <div className="lg:hidden absolute left-4 top-16 w-0.5 h-6 bg-border"></div>
      )}
      
      {/* Linha conectora - Desktop */}
      {!isLast && (
        <div className="hidden lg:block absolute left-6 top-20 w-0.5 h-8 bg-border"></div>
      )}
      
      <Card className="border-l-4 border-l-primary/20 mb-4 lg:mb-6 status-card animate-slide-in-up">
        <CardContent className="p-3 lg:p-4">
          {/* Layout Mobile */}
          <div className="lg:hidden">
            <div className="flex items-start gap-3">
              {/* Ícone e indicador de status */}
              <div className="flex-shrink-0 relative">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg status-circle ${config?.color || 'bg-gray-50 border-gray-200'} ${mudanca.status_atual === 'em_analise' ? 'animate-pulse-status' : ''}`}>
                  {config?.emoji || '⚪'}
                </div>
                {/* Linha conectora do círculo */}
                {!isLast && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-4 bg-border"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                {/* Header do status */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-foreground mb-1">
                      {config?.label || mudanca.status_atual} - Andamento
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatarData(mudanca.created_at).split(' ')[0]}</span>
                      <span>{formatarData(mudanca.created_at).split(' ')[1]}</span>
                    </div>
                  </div>
                  
                  {/* Badge de tempo no status */}
                  {mudanca.tempo_no_status && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {mudanca.tempo_no_status > 1440 
                        ? `${Math.floor(mudanca.tempo_no_status / 1440)}d`
                        : mudanca.tempo_no_status > 60
                        ? `${Math.floor(mudanca.tempo_no_status / 60)}h`
                        : `${mudanca.tempo_no_status}m`
                      }
                    </Badge>
                  )}
                </div>
                
                {/* Usuário responsável */}
                {mudanca.usuario_nome && (
                  <div className="flex items-center gap-1 mb-2">
                    <User className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-primary font-medium">{mudanca.usuario_nome}</span>
                  </div>
                )}
                
                {/* Observações */}
                {mudanca.observacoes && (
                  <p className="text-xs text-muted-foreground mb-2 bg-muted p-2 rounded">
                    {mudanca.observacoes}
                  </p>
                )}
                
                {/* Passos personalizados - Mobile expansível */}
                {passos && passos.length > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="flex items-center gap-1 text-xs text-primary font-medium"
                    >
                      <span>Detalhes ({passos.length} passos)</span>
                      {expanded ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                    
                    {expanded && (
                      <div className="mt-2 space-y-1">
                        {passos.map((passo, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 text-xs p-2 rounded ${
                              passo.status === 'concluido' 
                                ? 'bg-green-50 text-green-700'
                                : passo.status === 'em_andamento'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-50 text-gray-700'
                            }`}
                          >
                            {passo.status === 'concluido' ? (
                              <CheckCircle className="w-3 h-3 flex-shrink-0" />
                            ) : passo.status === 'em_andamento' ? (
                              <Clock className="w-3 h-3 flex-shrink-0" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border flex-shrink-0"></div>
                            )}
                            <span className="font-medium">{passo.nome}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Layout Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-start gap-4">
              {/* Ícone de status maior para desktop */}
              <div className="flex-shrink-0 relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl status-circle ${config?.color || 'bg-gray-50 border-gray-200'} ${mudanca.status_atual === 'em_analise' ? 'animate-pulse-status' : ''}`}>
                  {config?.emoji || '⚪'}
                </div>
                {/* Linha conectora do círculo */}
                {!isLast && (
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-border"></div>
                )}
              </div>
              
              <div className="flex-1">
                {/* Header expandido para desktop */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {config?.label || mudanca.status_atual} - Andamento
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>{formatarData(mudanca.created_at)}</span>
                      {mudanca.usuario_nome && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span className="text-primary font-medium">{mudanca.usuario_nome}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {mudanca.tempo_no_status && (
                    <Badge variant="outline" className="text-sm">
                      {mudanca.tempo_no_status > 1440 
                        ? `${Math.floor(mudanca.tempo_no_status / 1440)} dias`
                        : mudanca.tempo_no_status > 60
                        ? `${Math.floor(mudanca.tempo_no_status / 60)} horas`
                        : `${mudanca.tempo_no_status} minutos`
                      }
                    </Badge>
                  )}
                </div>
                
                {/* Observações expandidas para desktop */}
                {mudanca.observacoes && (
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded border">
                      {mudanca.observacoes}
                    </p>
                  </div>
                )}
                
                {/* Passos personalizados sempre visíveis no desktop */}
                {passos && passos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Passos realizados:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {passos.map((passo, index) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 text-sm p-3 rounded border ${
                            passo.status === 'concluido' 
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : passo.status === 'em_andamento'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          {passo.status === 'concluido' ? (
                            <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          ) : passo.status === 'em_andamento' ? (
                            <Clock className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 flex-shrink-0"></div>
                          )}
                          <div>
                            <div className="font-medium">{passo.nome}</div>
                            {passo.descricao && (
                              <div className="text-xs opacity-80">{passo.descricao}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SinistroStatusJourney({ sinistro, statusJourney }: SinistroStatusJourneyProps) {
  const [journeyAberto, setJourneyAberto] = useState(false)
  
  return (
    <div className="space-y-3 md:space-y-6">
      <Collapsible
        open={journeyAberto}
        onOpenChange={setJourneyAberto}
      >
        <div className="rounded-lg bg-card/50 p-3 md:p-6 border border-border-light">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-muted -m-1 md:-m-2 p-1 md:p-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-lg flex items-center justify-center">
                  <Route className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-foreground">Jornada de Status</h3>
                  <p className="text-xs md:text-sm text-muted-foreground hidden md:inline">
                    {journeyAberto ? 'Visualizando histórico completo' : 'Clique para ver histórico completo'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-xs"
                >
                  {statusJourney.mudancas.length} etapas
                </Badge>
                {journeyAberto ? (
                  <X className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Plus className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4 md:mt-6">
            {statusJourney.mudancas.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Route className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Nenhuma mudança de status encontrada</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-0">
                {/* Próximo passo destacado - só mostra se definido */}
                {statusJourney.proximo_passo && statusJourney.proximo_passo.trim() && (
                  <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Plus className="w-3 h-3 text-primary-foreground" />
                      </div>
                      <span className="font-medium text-sm text-foreground">Próximo Passo</span>
                    </div>
                    <p className="text-sm text-muted-foreground ml-8">{statusJourney.proximo_passo}</p>
                  </div>
                )}
                
                {/* Timeline de mudanças */}
                <div className="relative">
                  {statusJourney.mudancas.map((mudanca, index) => (
                    <StatusCard
                      key={mudanca.id}
                      mudanca={mudanca}
                      passos={statusJourney.passos_personalizados[mudanca.status_atual]}
                      isLast={index === statusJourney.mudancas.length - 1}
                      isFirst={index === 0}
                    />
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}