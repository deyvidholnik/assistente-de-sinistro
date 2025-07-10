/**
 * Valida se um CPF é válido
 * @param cpf - CPF a ser validado (com ou sem formatação)
 * @returns true se o CPF é válido, false caso contrário
 */
export function validarCPF(cpf: string): boolean {
  // Remove pontos e traços
  const cleanCPF = cpf.replace(/[^\d]/g, '')
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false
  
  // Algoritmo de validação do CPF
  let soma = 0
  let resto
  
  // Valida primeiro dígito
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cleanCPF.substring(9, 10))) return false
  
  // Valida segundo dígito
  soma = 0
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
  }
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cleanCPF.substring(10, 11))) return false
  
  return true
}

/**
 * Aplica máscara de CPF
 * @param value - Valor a ser formatado
 * @returns CPF formatado (xxx.xxx.xxx-xx)
 */
export function formatarCPF(value: string): string {
  // Remove tudo que não é dígito
  const cleanValue = value.replace(/\D/g, '')
  
  // Aplica a máscara
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .slice(0, 14) // Limita a 14 caracteres
}

/**
 * Valida se uma placa é válida (formato antigo ou Mercosul)
 * @param placa - Placa a ser validada
 * @returns true se a placa é válida, false caso contrário
 */
export function validarPlaca(placa: string): boolean {
  const cleanPlaca = placa.replace(/[^\w]/g, '').toUpperCase()
  
  // Formato antigo: AAA-0000
  const formatoAntigo = /^[A-Z]{3}\d{4}$/
  
  // Formato Mercosul: AAA0A00
  const formatoMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/
  
  return formatoAntigo.test(cleanPlaca) || formatoMercosul.test(cleanPlaca)
}

/**
 * Formata placa (adiciona hífen se necessário)
 * @param value - Valor a ser formatado
 * @returns Placa formatada
 */
export function formatarPlaca(value: string): string {
  const cleanValue = value.replace(/[^\w]/g, '').toUpperCase()
  
  // Se tem 7 caracteres, adiciona hífen
  if (cleanValue.length === 7) {
    return cleanValue.replace(/^([A-Z]{3})(\d{4})$/, '$1-$2')
  }
  
  // Se tem 8 caracteres (Mercosul), adiciona hífen
  if (cleanValue.length === 8) {
    return cleanValue.replace(/^([A-Z]{3})(\d[A-Z]\d{2})$/, '$1-$2')
  }
  
  return cleanValue.slice(0, 8)
} 