import { StatusPersonalizado } from '@/lib/supabase'

// Cache de status para evitar múltiplas chamadas à API
let statusCache: StatusPersonalizado[] | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Buscar status personalizados com cache
export async function getStatusPersonalizados(): Promise<StatusPersonalizado[]> {
  const now = Date.now()
  
  // Se o cache ainda é válido, retornar dados em cache
  if (statusCache && (now - cacheTimestamp) < CACHE_TTL) {
    return statusCache
  }

  try {
    const response = await fetch('/api/status-personalizados')
    if (response.ok) {
      const data = await response.json()
      statusCache = data.status || []
      cacheTimestamp = now
      return statusCache
    }
  } catch (error) {
    console.error('Erro ao buscar status personalizados:', error)
  }

  // Retornar status padrão em caso de erro
  return getStatusPadrao()
}

// Status padrão para fallback
export function getStatusPadrao(): StatusPersonalizado[] {
  return [
    {
      id: 'default-1',
      nome: 'pendente',
      cor: '#6B7280',
      icone: 'clock',
      ordem: 1,
      ativo: true
    },
    {
      id: 'default-2',
      nome: 'aguardando_documentos',
      cor: '#F59E0B',
      icone: 'file-text',
      ordem: 2,
      ativo: true
    },
    {
      id: 'default-3',
      nome: 'em_analise',
      cor: '#3B82F6',
      icone: 'eye',
      ordem: 3,
      ativo: true
    },
    {
      id: 'default-4',
      nome: 'aprovado',
      cor: '#10B981',
      icone: 'check-circle',
      ordem: 4,
      ativo: true
    },
    {
      id: 'default-5',
      nome: 'rejeitado',
      cor: '#EF4444',
      icone: 'x-circle',
      ordem: 5,
      ativo: true
    },
    {
      id: 'default-6',
      nome: 'concluido',
      cor: '#059669',
      icone: 'check-circle-2',
      ordem: 6,
      ativo: true
    }
  ]
}

// Buscar configuração de um status específico
export async function getStatusConfig(statusNome: string): Promise<StatusPersonalizado | null> {
  const statusList = await getStatusPersonalizados()
  return statusList.find(s => s.nome === statusNome) || null
}

// Validar se um status existe e está ativo
export async function isStatusValido(statusNome: string): Promise<boolean> {
  const statusList = await getStatusPersonalizados()
  return statusList.some(s => s.nome === statusNome && s.ativo)
}

// Limpar cache de status (útil após criar/editar/remover status)
export function clearStatusCache(): void {
  statusCache = null
  cacheTimestamp = 0
}

// Formatar nome de status para exibição
export function formatStatusLabel(statusNome: string): string {
  return statusNome
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Obter próxima ordem para novo status
export async function getProximaOrdem(): Promise<number> {
  const statusList = await getStatusPersonalizados()
  const maxOrdem = Math.max(...statusList.map(s => s.ordem), 0)
  return maxOrdem + 1
}

// Status que indicam sinistro finalizado
export const STATUS_FINALIZADOS = ['concluido', 'rejeitado', 'arquivado']

// Verificar se status indica processo finalizado
export function isStatusFinalizado(statusNome: string): boolean {
  return STATUS_FINALIZADOS.includes(statusNome.toLowerCase())
}

// Hook personalizado para React (opcional)
export function useStatusPersonalizados() {
  return {
    getStatus: getStatusPersonalizados,
    getConfig: getStatusConfig,
    isValido: isStatusValido,
    clearCache: clearStatusCache,
    formatLabel: formatStatusLabel,
    isFinalizado: isStatusFinalizado
  }
}