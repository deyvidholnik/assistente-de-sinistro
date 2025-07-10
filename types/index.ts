export interface CNHData {
  nome: string
  cpf: string
  rg: string
  dataNascimento: string
  categoria: string
  numeroRegistro: string
  dataVencimento: string
}

export interface CRLVData {
  placa: string
  renavam: string
  chassi: string
  marca: string
  modelo: string
  anoFabricacao: string
  anoModelo: string
  cor: string
  combustivel: string
  proprietario: string
}

export interface DocumentosData {
  cnh: File[]
  crlv: File[]
  fotosCarro: File[]
  boletimOcorrencia: File[]
}

export interface FotoVeiculoStep {
  id: number
  titulo: string
  descricao: string
  instrucoes: string[]
  posicionamento: string[]
  exemplo: string
  obrigatoria: boolean
  imagemExemplo: string
  categoria: "proprio" | "outros" | "geral"
}

export interface StepProps {
  onNext: () => void
  onPrev: () => void
  canProceed: boolean
  isProcessing?: boolean
}

export type TipoSinistro = "colisao" | "furto" | "roubo" | null

export interface DadosFurtoSemDocumentos {
  nomeCompleto: string
  cpf: string
  placaVeiculo: string
}
