/**
 * Utilitários para padronização de nomes de arquivos baseados no tipo de foto
 */

// Mapeamento de títulos das fotos para nomes de arquivos descritivos
const mapeamentoFotos: { [key: string]: string } = {
  // Fotos do próprio veículo
  'Traseira e Placa do Seu Veículo': 'traseira_placa',
  'Frente do Seu Veículo': 'frente_veiculo',
  'Lateral Direita do Seu Veículo': 'lateral_direita',
  'Lateral Esquerda do Seu Veículo': 'lateral_esquerda',
  'Número do Chassi do Seu Veículo': 'chassi_veiculo',
  
  // Fotos de outros veículos
  'Traseira e Placa do Outro Veículo': 'outro_traseira_placa',
  'Frente do Outro Veículo': 'outro_frente',
  'Lateral Direita do Outro Veículo': 'outro_lateral_direita',
  'Lateral Esquerda do Outro Veículo': 'outro_lateral_esquerda',
  'Danos Específicos do Outro Veículo': 'outro_danos',
  
  // Foto geral
  'Visão Geral do Local': 'local_geral',
  
  // Pequenos reparos
  'Foto do Reparo a Ser Feito': 'reparo_dano',
  'Foto do Número do Chassi': 'chassi_reparo',
}

/**
 * Gera nome de arquivo padronizado baseado no tipo de foto
 */
export function gerarNomeArquivoPorTipo(
  tipoArquivo: string,
  titulo: string | undefined,
  timestamp: number,
  extension: string
): string {
  // Para CNH e CRLV, manter padrão atual
  if (tipoArquivo === 'cnh' || tipoArquivo === 'crlv') {
    return `${tipoArquivo}_${timestamp}.${extension}`
  }
  
  // Para fotos de veículo, usar mapeamento
  if (tipoArquivo === 'foto_veiculo' && titulo) {
    const nomeDescritivo = mapeamentoFotos[titulo]
    if (nomeDescritivo) {
      return `${nomeDescritivo}_${timestamp}.${extension}`
    }
  }
  
  // Para boletim de ocorrência e outros tipos
  if (tipoArquivo === 'boletim_ocorrencia') {
    return `boletim_${timestamp}.${extension}`
  }
  
  // Fallback para tipos não mapeados
  return `${tipoArquivo}_${timestamp}.${extension}`
}

/**
 * Obtém nome descritivo baseado no título da foto
 */
export function obterNomeDescritivoFoto(titulo: string): string {
  return mapeamentoFotos[titulo] || 'foto_generica'
}

/**
 * Lista todos os tipos de foto mapeados
 */
export function obterTiposFotoMapeados(): string[] {
  return Object.keys(mapeamentoFotos)
}

// Mapeamento inverso para converter nomes de arquivos em títulos amigáveis
const mapeamentoNomesParaTitulos: { [key: string]: string } = {
  // Fotos do próprio veículo
  'traseira_placa': 'Traseira e Placa do Veículo',
  'frente_veiculo': 'Frente do Veículo',
  'lateral_direita': 'Lateral Direita do Veículo',
  'lateral_esquerda': 'Lateral Esquerda do Veículo',
  'chassi_veiculo': 'Número do Chassi',
  
  // Fotos de outros veículos
  'outro_traseira_placa': 'Traseira e Placa do Outro Veículo',
  'outro_frente': 'Frente do Outro Veículo',
  'outro_lateral_direita': 'Lateral Direita do Outro Veículo',
  'outro_lateral_esquerda': 'Lateral Esquerda do Outro Veículo',
  'outro_danos': 'Danos do Outro Veículo',
  
  // Foto geral
  'local_geral': 'Visão Geral do Local',
  
  // Pequenos reparos
  'reparo_dano': 'Foto do Reparo',
  'chassi_reparo': 'Número do Chassi',
  
  // Documentos
  'cnh': 'CNH - Carteira Nacional de Habilitação',
  'crlv': 'CRLV - Documento do Veículo',
  'boletim': 'Boletim de Ocorrência',
  
  // Genéricos
  'documento_adicional': 'Documento Adicional',
}

/**
 * Converte nome de arquivo para título amigável para exibição
 * Exemplo: "traseira_placa_1693247483647.jpg" -> "Traseira e Placa do Veículo"
 */
export function converterNomeArquivoParaTitulo(nomeArquivo: string): string {
  // Remover caminho se existir (ex: "123456/traseira_placa_1693247483647.jpg")
  const nomeBase = nomeArquivo.split('/').pop() || nomeArquivo
  
  // Remover extensão (ex: "traseira_placa_1693247483647.jpg" -> "traseira_placa_1693247483647")
  const semExtensao = nomeBase.split('.')[0]
  
  // Remover timestamp (última parte numérica)
  const partes = semExtensao.split('_')
  
  // Se a última parte é numérica (timestamp), remove
  if (partes.length > 1 && /^\d+$/.test(partes[partes.length - 1])) {
    partes.pop()
  }
  
  // Reconstrói o identificador
  const identificador = partes.join('_')
  
  // Busca título amigável
  const tituloAmigavel = mapeamentoNomesParaTitulos[identificador]
  
  if (tituloAmigavel) {
    return tituloAmigavel
  }
  
  // Fallback: converte underscores em espaços e capitaliza
  return identificador
    .split('_')
    .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(' ')
}