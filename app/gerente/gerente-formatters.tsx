import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Função simples para formatar datas
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

// Função para formatar tipo de assistência
export const formatarTipoAssistencia = (tipo: string | undefined) => {
  if (!tipo) return ''

  const tipos: { [key: string]: string } = {
    hotel: 'Hotel',
    guincho: 'Guincho',
    taxi: 'Táxi',
    pane_seca: 'Pane Seca',
    pane_mecanica: 'Pane Mecânica',
    pane_eletrica: 'Pane Elétrica',
    trocar_pneu: 'Trocar Pneu',
  }

  return tipos[tipo] || tipo.replace(/_/g, ' ')
}

// Função para formatar todas as assistências (principal + adicionais)
export const formatarTodasAssistencias = (sinistro: any) => {
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