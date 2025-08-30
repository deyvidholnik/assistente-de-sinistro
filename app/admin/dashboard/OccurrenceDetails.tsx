"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  CheckCircle,
  XCircle,
  Eye,
  Clock4,
  Info,
  Calendar,
  User,
  Car,
  Headphones,
  FolderOpen,
  Clock,
  Activity,
  Plus,
  X,
  FileText,
  Camera,
  AlertTriangle,
  Wrench,
  Shield
} from 'lucide-react'
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface SinistroDetalhado {
  sinistro: any
  dadosCnh: any[]
  dadosCrlv: any[]
  arquivos: any[]
  logs: any[]
}

interface OccurrenceDetailsProps {
  dados: SinistroDetalhado
}

export function OccurrenceDetails({ dados }: OccurrenceDetailsProps) {
  const { sinistro, dadosCnh, dadosCrlv, arquivos, logs } = dados
  const [historicoAberto, setHistoricoAberto] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-3 md:space-y-3">
      {/* Header Principal */}
      <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 md:gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Info className="w-4 h-4" />
              <span>Ocorrência</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">#{sinistro.numero_sinistro}</h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(sinistro.data_criacao), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
            </div>
          </div>
          
          <div className="flex flex-col lg:items-end gap-3">
            <Badge 
              variant={
                sinistro.status === 'concluido' ? 'default' :
                sinistro.status === 'aprovado' ? 'secondary' :
                sinistro.status === 'em_analise' ? 'outline' :
                sinistro.status === 'rejeitado' ? 'destructive' :
                'secondary'
              }
              className={`w-fit ${
                sinistro.status === 'concluido' ? 'bg-green-100 text-green-800 border-green-200' :
                sinistro.status === 'aprovado' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                sinistro.status === 'em_analise' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                sinistro.status === 'rejeitado' ? 'bg-red-100 text-red-800 border-red-200' :
                'bg-gray-100 text-gray-800 border-gray-200'
              }`}
            >
              {sinistro.status === 'pendente' && <Clock4 className="w-3 h-3 mr-1" />}
              {sinistro.status === 'em_analise' && <Eye className="w-3 h-3 mr-1" />}
              {sinistro.status === 'aprovado' && <CheckCircle className="w-3 h-3 mr-1" />}
              {sinistro.status === 'rejeitado' && <XCircle className="w-3 h-3 mr-1" />}
              {sinistro.status === 'concluido' && <CheckCircle className="w-3 h-3 mr-1" />}
              {sinistro.status === 'pendente' ? 'Pendente' :
               sinistro.status === 'em_analise' ? 'Em Análise' :
               sinistro.status === 'aprovado' ? 'Aprovado' :
               sinistro.status === 'rejeitado' ? 'Rejeitado' :
               'Concluído'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tipo de Ocorrência */}
      <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Info className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Tipo de Ocorrência</h3>
            <p className="text-xs md:text-sm text-gray-600 hidden md:block">Categoria do sinistro reportado</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={`text-sm px-3 py-2 ${
              sinistro.tipo_atendimento === 'assistencia' ? 'bg-purple-100 text-purple-800 border-purple-200' :
              sinistro.tipo_sinistro === 'colisao' ? 'bg-orange-100 text-orange-800 border-orange-200' :
              sinistro.tipo_sinistro === 'furto' ? 'bg-blue-100 text-blue-800 border-blue-200' :
              sinistro.tipo_sinistro === 'roubo' ? 'bg-red-100 text-red-800 border-red-200' :
              sinistro.tipo_sinistro === 'pequenos_reparos' ? 'bg-green-100 text-green-800 border-green-200' :
              'bg-gray-100 text-gray-800 border-gray-200'
            }`}
          >
            {sinistro.tipo_atendimento === 'assistencia' ? (
              <>
                <Headphones className="w-4 h-4 mr-2" />
                Assistência{sinistro.tipo_assistencia ? ` - ${sinistro.tipo_assistencia.charAt(0).toUpperCase() + sinistro.tipo_assistencia.slice(1)}` : ''}
              </>
            ) : sinistro.tipo_sinistro === 'colisao' ? (
             <>
               <Car className="w-4 h-4 mr-2" />
               Colisão
             </>
           ) : sinistro.tipo_sinistro === 'furto' ? (
             <>
               <Shield className="w-4 h-4 mr-2" />
               Furto
             </>
           ) : sinistro.tipo_sinistro === 'roubo' ? (
             <>
               <AlertTriangle className="w-4 h-4 mr-2" />
               Roubo
             </>
           ) : sinistro.tipo_sinistro === 'pequenos_reparos' ? (
             <>
               <Wrench className="w-4 h-4 mr-2" />
               Pequenos Reparos
             </>
           ) : (
             'Tipo não identificado'
           )}
          </Badge>
          
          {sinistro.tipo_atendimento !== 'assistencia' && sinistro.assistencias_tipos && sinistro.assistencias_tipos.length > 0 && (
            <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              + {Array.isArray(sinistro.assistencias_tipos) 
                  ? sinistro.assistencias_tipos.join(', ') 
                  : sinistro.assistencias_tipos}
            </Badge>
          )}
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <div className="border border-gray-200 rounded-lg bg-white p-2 md:p-4 text-center">
          <FolderOpen className="w-4 h-4 md:w-6 md:h-6 text-blue-500 mx-auto mb-1 md:mb-2" />
          <div className="text-lg md:text-2xl font-bold text-gray-900">{sinistro.total_arquivos || 0}</div>
          <div className="text-xs md:text-sm text-gray-500">Arquivos</div>
        </div>
        <div className="border border-gray-200 rounded-lg bg-white p-2 md:p-4 text-center">
          <Clock className="w-4 h-4 md:w-6 md:h-6 text-gray-400 mx-auto mb-1 md:mb-2" />
          <div className="text-lg md:text-2xl font-bold text-gray-900">
            {Math.ceil((new Date().getTime() - new Date(sinistro.data_criacao).getTime()) / (1000 * 60 * 60 * 24))}
          </div>
          <div className="text-xs md:text-sm text-gray-500">Dias</div>
        </div>
      </div>

      {/* Seção Condutores - Versão Simplificada */}
      {dadosCnh.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Condutores</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Informações dos condutores envolvidos</p>
            </div>
          </div>
          {dadosCnh.map((cnh, index) => (
            <Card key={index} className={cnh.tipo_titular === 'proprio' ? 'border-l-4 border-l-blue-500 mb-4' : 'border-l-4 border-l-orange-500 mb-4'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <User className={`w-5 h-5 ${cnh.tipo_titular === 'proprio' ? 'text-blue-600' : 'text-orange-600'}`} />
                  <span className="font-semibold">{cnh.tipo_titular === 'proprio' ? 'Condutor Principal' : 'Condutor Terceiro'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Nome</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-medium">{cnh.nome}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">CPF</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono">{cnh.cpf}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Seção Veículos - Versão Simplificada */}
      {dadosCrlv.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Veículos</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Informações dos veículos envolvidos</p>
            </div>
          </div>
          {dadosCrlv.map((crlv, index) => (
            <Card key={index} className={crlv.tipo_veiculo === 'proprio' ? 'border-l-4 border-l-green-500 mb-4' : 'border-l-4 border-l-purple-500 mb-4'}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Car className={`w-5 h-5 ${crlv.tipo_veiculo === 'proprio' ? 'text-green-600' : 'text-purple-600'}`} />
                  <span className="font-semibold">{crlv.tipo_veiculo === 'proprio' ? 'Veículo Principal' : 'Veículo Terceiro'}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Placa</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border font-mono text-center font-bold">{crlv.placa}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Marca/Modelo</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border">
                      {crlv.marca && crlv.modelo ? `${crlv.marca} ${crlv.modelo}` : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Ano</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded border text-center">
                      {crlv.ano_fabricacao || 'Não informado'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Seção Assistências Adicionais */}
      {sinistro.assistencia_adicional && sinistro.assistencias_tipos && sinistro.assistencias_tipos.length > 0 && (
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Headphones className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900">Assistências Adicionais</h3>
              <p className="text-xs md:text-sm text-gray-600 hidden md:block">Serviços adicionais solicitados</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Array.isArray(sinistro.assistencias_tipos) ? sinistro.assistencias_tipos : 
              typeof sinistro.assistencias_tipos === 'string' ? sinistro.assistencias_tipos.split(',') : []
            ).map((tipo: string, index: number) => {
              const tipoLimpo = tipo.trim()
              const assistenciaInfo: { [key: string]: { label: string; icon: string; color: string } } = {
                'guincho': { label: 'Guincho', icon: '🚛', color: 'bg-blue-100 text-blue-800' },
                'taxi': { label: 'Táxi', icon: '🚕', color: 'bg-yellow-100 text-yellow-800' },
                'hotel': { label: 'Hotel', icon: '🏨', color: 'bg-purple-100 text-purple-800' },
                'mecanica': { label: 'Mecânica', icon: '🔧', color: 'bg-green-100 text-green-800' },
                'vidraceiro': { label: 'Vidraceiro', icon: '🪟', color: 'bg-indigo-100 text-indigo-800' },
                'borracheiro': { label: 'Borracheiro', icon: '🛞', color: 'bg-orange-100 text-orange-800' },
                'eletricista': { label: 'Eletricista', icon: '⚡', color: 'bg-red-100 text-red-800' }
              }
              const info = assistenciaInfo[tipoLimpo] || { label: tipoLimpo, icon: '🛠️', color: 'bg-gray-100 text-gray-800' }

              return (
                <div key={index} className={`p-3 rounded-lg ${info.color} border`}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <span className="font-medium text-sm">{info.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Seção Arquivos - Versão Simplificada */}
      <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
        <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <FolderOpen className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Arquivos ({arquivos.length})</h3>
            <p className="text-xs md:text-sm text-gray-600 hidden md:block">Documentos e fotos anexados</p>
          </div>
        </div>

        {arquivos.length === 0 ? (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum arquivo encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {arquivos.map((arquivo, index) => {
              const isImage = arquivo.tipo_arquivo === 'foto_veiculo' || 
                             arquivo.nome_original?.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)
              
              return (
                <div key={index} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="relative w-full h-32 bg-gray-50 flex items-center justify-center">
                    {isImage && arquivo.url_arquivo ? (
                      <div className="relative w-full h-full group">
                        <Image
                          src={arquivo.url_arquivo}
                          alt={arquivo.nome_original || 'Arquivo'}
                          fill
                          className="object-cover transition-transform"
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center">
                                  <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z"/>
                                  </svg>
                                </div>
                              `
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        {arquivo.tipo_arquivo === 'foto_veiculo' ? 
                          <Camera className="w-12 h-12 text-blue-500 mb-2" /> : 
                          <FileText className="w-12 h-12 text-gray-500 mb-2" />}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {arquivo.tipo_arquivo === 'cnh_proprio' ? 'CNH' :
                         arquivo.tipo_arquivo === 'cnh_terceiro' ? 'CNH 3º' :
                         arquivo.tipo_arquivo === 'crlv_proprio' ? 'CRLV' :
                         arquivo.tipo_arquivo === 'crlv_terceiro' ? 'CRLV 3º' :
                         arquivo.tipo_arquivo === 'boletim_ocorrencia' ? 'B.O.' :
                         arquivo.tipo_arquivo === 'foto_veiculo' ? 'Foto' :
                         'Arquivo'}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium truncate mb-2" title={arquivo.nome_original}>
                      {arquivo.nome_original}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {(arquivo.tamanho_arquivo / 1024).toFixed(1)}KB
                      </span>
                      {arquivo.url_arquivo && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(arquivo.url_arquivo, '_blank')}
                          className="h-6 px-2 text-xs"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Seção Histórico - Versão Simplificada */}
      <Collapsible open={historicoAberto} onOpenChange={setHistoricoAberto}>
        <div className="border border-gray-200 rounded-lg bg-white p-3 md:p-6">
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Histórico ({logs.length})</h3>
              </div>
              {historicoAberto ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum histórico encontrado</p>
            ) : (
              <div className="space-y-2">
                {logs.slice(0, 10).map((log, index) => (
                  <div key={index} className="border-l-4 border-l-blue-200 bg-blue-50 p-3 rounded">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="font-medium text-sm">{log.acao}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{log.descricao}</p>
                  </div>
                ))}
                {logs.length > 10 && (
                  <p className="text-xs text-gray-500 text-center pt-2">
                    Mostrando 10 de {logs.length} registros
                  </p>
                )}
              </div>
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}