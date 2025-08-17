// Função centralizada para gerar números de sinistro padronizados
import { supabase } from '@/lib/supabase'

/**
 * Gera um número de sinistro no formato padrão SIN-YYYY-NNNNNN
 * Busca o próximo número sequencial do banco de dados
 */
export async function gerarNumeroSinistroPadrao(): Promise<string> {
  
  try {
    // Busca o último número de sinistro do ano atual
    const anoAtual = new Date().getFullYear()
    const prefixo = `SIN-${anoAtual}-`
    
    const { data: ultimoSinistro, error } = await supabase
      .from('sinistros')
      .select('numero_sinistro')
      .like('numero_sinistro', `${prefixo}%`)
      .order('numero_sinistro', { ascending: false })
      .limit(1)
    
    if (error) {
      console.error('Erro ao buscar último sinistro:', error)
      // Fallback: usar timestamp se falhar
      return gerarNumeroFallback()
    }
    
    let proximoNumero = 1
    
    if (ultimoSinistro && ultimoSinistro.length > 0) {
      const ultimoNumeroStr = ultimoSinistro[0].numero_sinistro
      const numeroAtual = parseInt(ultimoNumeroStr.split('-')[2])
      proximoNumero = numeroAtual + 1
    }
    
    // Formatar com 6 dígitos (padding com zeros)
    const numeroFormatado = proximoNumero.toString().padStart(6, '0')
    
    return `${prefixo}${numeroFormatado}`
    
  } catch (error) {
    console.error('Erro na geração do número de sinistro:', error)
    return gerarNumeroFallback()
  }
}

/**
 * Função de fallback que gera número usando timestamp
 * Usado quando há falha na consulta ao banco
 */
function gerarNumeroFallback(): string {
  const now = new Date()
  const year = now.getFullYear()
  const timestamp = now.getTime().toString().slice(-6)
  
  return `SIN-${year}-${timestamp}`
}

/**
 * Função legacy - manter por compatibilidade
 * @deprecated Use gerarNumeroSinistroPadrao() instead
 */
export function gerarNumeroSinistroLegacy(): string {
  const now = new Date()
  const year = now.getFullYear().toString().slice(-2)
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const time = now.getTime().toString().slice(-6)
  
  return `${year}${month}${day}${time}`
}