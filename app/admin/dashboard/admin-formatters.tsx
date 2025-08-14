import React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  Clock, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Headphones, 
  Car, 
  Shield, 
  Wrench, 
  FileText,
  AlertTriangle,
  Clock4
} from 'lucide-react'

export const formatarData = (data: string) => {
  try {
    return format(new Date(data), 'dd/MM/yyyy HH:mm', { locale: ptBR })
  } catch (error) {
    return 'Data inválida'
  }
}

export const formatarDataSemHora = (data: string) => {
  try {
    return format(new Date(data), 'dd/MM/yyyy', { locale: ptBR })
  } catch (error) {
    return 'Data inválida'
  }
}

export const formatarTipoAssistencia = (tipo: string | undefined) => {
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

export const formatarTodasAssistencias = (log: any) => {
  const assistencias: string[] = []
  
  if (log.tipo_assistencia) {
    assistencias.push(formatarTipoAssistencia(log.tipo_assistencia))
  }
  
  if (log.assistencias_tipos) {
    const tiposAdicionais = Array.isArray(log.assistencias_tipos) 
      ? log.assistencias_tipos 
      : log.assistencias_tipos.split(', ')
    
    const assistenciasAdicionais = tiposAdicionais
      .filter((tipo: string) => tipo)
      .map((tipo: string) => formatarTipoAssistencia(tipo))
    assistencias.push(...assistenciasAdicionais)
  }
  
  return assistencias.length > 0 ? assistencias.join(', ') : ''
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const getStatusIcon = (status: string) => {
  switch (status) {
    case 'concluido': return <CheckCircle className="w-3 h-3 text-green-500" />
    case 'aprovado': return <CheckCircle className="w-3 h-3 text-blue-500" />
    case 'em_analise': return <Eye className="w-3 h-3 text-yellow-500" />
    case 'rejeitado': return <XCircle className="w-3 h-3 text-red-500" />
    default: return <Clock className="w-3 h-3 text-gray-500" />
  }
}

export const getTipoIcon = (log: any) => {
  if (log.tipo_atendimento === 'assistencia') {
    return <Headphones className="w-3 h-3 text-purple-500" />
  }
  switch (log.tipo_sinistro) {
    case 'colisao': return <Car className="w-3 h-3 text-red-500" />
    case 'furto': case 'roubo': return <Shield className="w-3 h-3 text-orange-500" />
    case 'pequenos_reparos': return <Wrench className="w-3 h-3 text-green-500" />
    default: return <FileText className="w-3 h-3 text-gray-500" />
  }
}