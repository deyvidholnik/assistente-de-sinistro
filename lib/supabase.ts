import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = 'https://nxzzzkzuupgkqmscvscn.supabase.co'
const supabaseAnonKey ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54enp6a3p1dXBna3Ftc2N2c2NuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNjEwODIsImV4cCI6MjA2NzYzNzA4Mn0.IBP0l4REyVvYrBbM6NMpMHX6e1E4xpeZEhx1yIE2bkI' // Service Role Key - VOCÊ PRECISA ATUALIZAR ESTA CHAVE COPIANDO DO SEU DASHBOARD SUPABASE
// Vá em: Settings → API → service_role (secret)
// SUBSTITUA A CHAVE ABAIXO PELA CHAVE CORRETA DO SEU DASHBOARD:
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54enp6a3p1dXBna3Ftc2N2c2NuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjA2MTA4MiwiZXhwIjoyMDY3NjM3MDgyfQ.vh6H8JDKQW3a5Y7z_EXUqrbpANdF8F_boGm7EDfMAgc'
// Cliente principal do Supabase para uso geral
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para criar cliente admin sob demanda (evita múltiplas instâncias)
export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Tipos para o banco de dados
export interface SinistroData {
  id?: string
  numero_sinistro?: string
  tipo_atendimento?: 'sinistro' | 'assistencia'
  tipo_sinistro?: 'colisao' | 'furto' | 'roubo' | 'pequenos_reparos'
  tipo_assistencia?: 'hotel' | 'guincho' | 'taxi' | 'pane_seca' | 'pane_mecanica' | 'pane_eletrica' | 'trocar_pneu'
  documentos_furtados?: boolean
  outros_veiculos_envolvidos?: boolean
  nome_completo_furto?: string
  cpf_furto?: string
  placa_veiculo_furto?: string
  status?: string // Status dinâmico - validado via banco de dados
  data_criacao?: string
  data_atualizacao?: string
}

export interface StatusPersonalizado {
  id: string
  nome: string
  cor: string
  icone: string
  ordem: number
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface DadosCNHDB {
  id?: string
  sinistro_id: string
  tipo_titular: 'proprio' | 'terceiro'
  nome: string
  cpf: string
  rg?: string
  data_nascimento?: string
  categoria?: string
  numero_registro?: string
  data_vencimento?: string
}

export interface DadosCRLVDB {
  id?: string
  sinistro_id: string
  tipo_veiculo: 'proprio' | 'terceiro'
  placa: string
  renavam?: string
  chassi?: string
  marca?: string
  modelo?: string
  ano_fabricacao?: number
  ano_modelo?: number
  cor?: string
  combustivel?: string
  proprietario?: string
}

export interface ArquivoSinistro {
  id?: string
  sinistro_id: string
  tipo_arquivo: 'cnh_proprio' | 'cnh_terceiro' | 'crlv_proprio' | 'crlv_terceiro' | 'boletim_ocorrencia' | 'foto_veiculo'
  categoria_foto?: 'proprio' | 'terceiro' | 'geral'
  nome_original: string
  nome_arquivo: string
  url_arquivo?: string
  tamanho_arquivo?: number
  tipo_mime?: string
  foto_step_id?: number
  titulo_foto?: string
  descricao_foto?: string
  obrigatoria?: boolean
}

export interface LogAtividade {
  id?: string
  sinistro_id: string
  acao: string
  descricao?: string
  status_anterior?: string
  status_novo?: string
  usuario_id?: string
  usuario_nome?: string
  usuario_email?: string
} 