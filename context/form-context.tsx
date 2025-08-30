"use client"

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react"
import type { CNHData, CRLVData, DocumentosData, TipoSinistro, DadosFurtoSemDocumentos, TipoAtendimento, TipoAssistencia } from "@/types"
import { fotoVeiculoSteps } from "@/constants/steps" // Assuming fotoVeiculoSteps is declared in a constants file
import { validarCPF, validarPlaca } from "@/lib/validations"
import { convertPdfToImage, isPdfFile, preprocessImageForOCR, convertPdfToImageForCNH, convertPdfToImageForCRLV, preprocessImageForCNHOCR } from "@/lib/pdf-utils"

// Definindo a estrutura do nosso contexto
interface FormContextType {
  // State
  currentStep: number
  currentFotoStep: number
  isDocumentingThirdParty: boolean
  tipoAtendimento: TipoAtendimento
  tipoSinistro: TipoSinistro
  tipoAssistencia: TipoAssistencia
  documentosFurtados: boolean | null
  documentos: DocumentosData
  documentosTerceiros: DocumentosData
  cnhData: CNHData
  crlvData: CRLVData
  cnhDataTerceiros: CNHData
  crlvDataTerceiros: CRLVData
  dadosFurtoSemDocumentos: DadosFurtoSemDocumentos
  isProcessingOCR: boolean
  ocrError: string | null
  fotoStepFiles: { [key: number]: File[] }
  outrosVeiculos: boolean | null
  assistenciaAdicional: boolean | null
  assistenciasAdicionais: TipoAssistencia[]
  hasProcessedCNH: boolean
  hasProcessedCRLV: boolean
  hasProcessedCNHTerceiros: boolean
  hasProcessedCRLVTerceiros: boolean

  // Setters
  setCurrentStep: Dispatch<SetStateAction<number>>
  setCurrentFotoStep: Dispatch<SetStateAction<number>>
  setIsDocumentingThirdParty: Dispatch<SetStateAction<boolean>>
  setTipoAtendimento: Dispatch<SetStateAction<TipoAtendimento>>
  setTipoSinistro: Dispatch<SetStateAction<TipoSinistro>>
  setTipoAssistencia: Dispatch<SetStateAction<TipoAssistencia>>
  setDocumentosFurtados: Dispatch<SetStateAction<boolean | null>>
  setDocumentos: Dispatch<SetStateAction<DocumentosData>>
  setDocumentosTerceiros: Dispatch<SetStateAction<DocumentosData>>
  setCnhData: Dispatch<SetStateAction<CNHData>>
  setCrlvData: Dispatch<SetStateAction<CRLVData>>
  setCnhDataTerceiros: Dispatch<SetStateAction<CNHData>>
  setCrlvDataTerceiros: Dispatch<SetStateAction<CRLVData>>
  setDadosFurtoSemDocumentos: Dispatch<SetStateAction<DadosFurtoSemDocumentos>>
  setOcrError: Dispatch<SetStateAction<string | null>>
  setFotoStepFiles: Dispatch<SetStateAction<{ [key: number]: File[] }>>
  setOutrosVeiculos: Dispatch<SetStateAction<boolean | null>>
  setAssistenciaAdicional: Dispatch<SetStateAction<boolean | null>>
  setAssistenciasAdicionais: Dispatch<SetStateAction<TipoAssistencia[]>>

  // Funções de Lógica
  nextStep: () => void
  handleFileUpload: (field: keyof DocumentosData, fileList: FileList | null) => Promise<void>
  handleFotoStepUpload: (stepId: number, fileList: FileList | null) => void
  removeFile: (field: keyof DocumentosData, index: number) => void
  removeFotoStepFile: (stepId: number, index: number) => void
  canProceed: () => boolean
}

const FormContext = createContext<FormContextType | undefined>(undefined)

interface FormProviderProps {
  children: ReactNode
  initialData?: {
    tipoAtendimento?: string
    tipoSinistro?: string
    tipoAssistencia?: string
    nomeCompleto?: string
    cpf?: string
    placa?: string
    marca?: string
    modelo?: string
    sinistroId?: string
    currentStep?: number
  }
}

export function FormProvider({ children, initialData }: FormProviderProps) {
  // Determinar step inicial baseado nos dados pré-preenchidos
  const getInitialStep = () => {
    if (initialData?.currentStep) return initialData.currentStep
    if (initialData?.tipoAtendimento && initialData?.tipoSinistro) {
      // Se já tem dados básicos, começar na CNH (step 6)
      return 6
    }
    return 1
  }

  const [currentStep, setCurrentStep] = useState(getInitialStep())
  const [currentFotoStep, setCurrentFotoStep] = useState(0)
  const [isDocumentingThirdParty, setIsDocumentingThirdParty] = useState(false)
  const [tipoAtendimento, setTipoAtendimento] = useState<TipoAtendimento>(
    initialData?.tipoAtendimento as TipoAtendimento || null
  )
  const [tipoSinistro, setTipoSinistro] = useState<TipoSinistro>(
    initialData?.tipoSinistro as TipoSinistro || null
  )
  const [tipoAssistencia, setTipoAssistencia] = useState<TipoAssistencia>(
    initialData?.tipoAssistencia as TipoAssistencia || null
  )
  const [documentosFurtados, setDocumentosFurtados] = useState<boolean | null>(null)
  const [documentos, setDocumentos] = useState<DocumentosData>({
    cnh: [],
    crlv: [],
    fotosCarro: [],
    boletimOcorrencia: [],
  })
  const [documentosTerceiros, setDocumentosTerceiros] = useState<DocumentosData>({
    cnh: [],
    crlv: [],
    fotosCarro: [],
    boletimOcorrencia: [],
  })
  const [cnhData, setCnhData] = useState<CNHData>({
    nome: initialData?.nomeCompleto || "",
    cpf: initialData?.cpf || "",
    rg: "",
    dataNascimento: "",
    categoria: "",
    numeroRegistro: "",
    dataVencimento: "",
  })
  const [crlvData, setCrlvData] = useState<CRLVData>({
    placa: initialData?.placa || "",
    renavam: "",
    chassi: "",
    marca: initialData?.marca || "",
    modelo: initialData?.modelo || "",
    anoFabricacao: "",
    anoModelo: "",
    cor: "",
    combustivel: "",
    proprietario: initialData?.nomeCompleto || "",
  })
  const [cnhDataTerceiros, setCnhDataTerceiros] = useState<CNHData>({
    nome: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    categoria: "",
    numeroRegistro: "",
    dataVencimento: "",
  })
  const [crlvDataTerceiros, setCrlvDataTerceiros] = useState<CRLVData>({
    placa: "",
    renavam: "",
    chassi: "",
    marca: "",
    modelo: "",
    anoFabricacao: "",
    anoModelo: "",
    cor: "",
    combustivel: "",
    proprietario: "",
  })
  const [dadosFurtoSemDocumentos, setDadosFurtoSemDocumentos] = useState<DadosFurtoSemDocumentos>({
    nomeCompleto: "",
    cpf: "",
    placaVeiculo: "",
  })
  const [isProcessingOCR, setIsProcessingOCR] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)
  const [fotoStepFiles, setFotoStepFiles] = useState<{ [key: number]: File[] }>({})
  const [processingFiles, setProcessingFiles] = useState<Set<string>>(new Set())
  const [outrosVeiculos, setOutrosVeiculos] = useState<boolean | null>(null)
  const [assistenciaAdicional, setAssistenciaAdicional] = useState<boolean | null>(null)
  const [assistenciasAdicionais, setAssistenciasAdicionais] = useState<TipoAssistencia[]>([])
  const [hasProcessedCNH, setHasProcessedCNH] = useState(false)
  const [hasProcessedCRLV, setHasProcessedCRLV] = useState(false)
  const [hasProcessedCNHTerceiros, setHasProcessedCNHTerceiros] = useState(false)
  const [hasProcessedCRLVTerceiros, setHasProcessedCRLVTerceiros] = useState(false)

  const updateDocumentos = (field: keyof DocumentosData, files: File[]) => {
    const setter = isDocumentingThirdParty ? setDocumentosTerceiros : setDocumentos
    setter((prev) => ({ ...prev, [field]: files }))
  }

  // Função auxiliar para validar campos obrigatórios
  const validarCamposObrigatorios = (data: any, documentType: "cnh" | "crlv"): boolean => {
    if (documentType === "cnh") {
      return !!(data.nome && data.nome.trim() && data.cpf && data.cpf.trim())
    } else if (documentType === "crlv") {
      return !!(data.placa && data.placa.trim() && data.renavam && data.renavam.trim())
    }
    return false
  }

  // Função auxiliar para tentar OCR com uma tentativa específica
  const tentarOCR = async (base64Image: string, documentType: "cnh" | "crlv") => {
    const resp = await fetch("/api/ocr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ base64Image, type: documentType }),
    })
    const result = await resp.json()
    
    if (!result.success) {
      throw new Error(result.message || "Falha no OCR")
    }
    
    return result.extractedData
  }

  const processarOCR = async (file: File, documentType: "cnh" | "crlv") => {
    const fileId = `${file.name}-${file.size}-${file.lastModified}`
    if (processingFiles.has(fileId)) return

    setProcessingFiles((prev) => new Set(prev).add(fileId))
    setIsProcessingOCR(true)
    setOcrError(null)

    try {
      let extractedData: any = null
      const isPdf = isPdfFile(file)

      if (isPdf && (documentType === "cnh" || documentType === "crlv")) {
        // Para PDFs de CNH/CRLV: tenta 3 vezes com crop inteligente
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            let base64Image: string

            if (attempt <= 2) {
              // Tentativas 1 e 2: usar crop específico
              if (documentType === "cnh") {
                base64Image = await convertPdfToImageForCNH(file, attempt)
              } else {
                base64Image = await convertPdfToImageForCRLV(file, attempt)
              }
            } else {
              // Tentativa 3: imagem completa
              base64Image = await convertPdfToImage(file)
            }

            // Sem pré-processamento - apenas crop

            // Tenta OCR
            extractedData = await tentarOCR(base64Image, documentType)

            // Valida campos obrigatórios
            if (validarCamposObrigatorios(extractedData, documentType)) {
              break // Sucesso! Sai do loop
            } else if (attempt === 3) {
              throw new Error("Não foi possível extrair os dados obrigatórios. Envie um documento válido.")
            }
            // Se chegou aqui, campos inválidos mas ainda há tentativas
          } catch (error) {
            if (attempt === 3) {
              throw error // Re-throw na última tentativa
            }
            // Continue para próxima tentativa
          }
        }
      } else {
        // Para imagens ou PDFs não-CNH: processo normal
        let base64Image: string

        if (isPdf) {
          base64Image = await convertPdfToImage(file)
        } else {
          base64Image = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve((reader.result as string).split(",")[1])
            reader.onerror = (error) => reject(error)
            reader.readAsDataURL(file)
          })
        }

        // Sem pré-processamento - apenas imagem original

        // Tenta OCR
        extractedData = await tentarOCR(base64Image, documentType)

        // Valida campos obrigatórios
        if (!validarCamposObrigatorios(extractedData, documentType)) {
          throw new Error("Não foi possível extrair os dados obrigatórios. Envie um documento válido.")
        }
      }

      // Se chegou até aqui, OCR foi bem-sucedido com campos válidos
      // Define os dados extraídos
      if (documentType === "cnh") {
        if (isDocumentingThirdParty) {
          setCnhDataTerceiros(extractedData)
          setHasProcessedCNHTerceiros(true)
        } else {
          setCnhData(extractedData)
          setHasProcessedCNH(true)
        }
      } else if (documentType === "crlv") {
        if (isDocumentingThirdParty) {
          setCrlvDataTerceiros(extractedData)
          setHasProcessedCRLVTerceiros(true)
        } else {
          setCrlvData(extractedData)
          setHasProcessedCRLV(true)
        }
      }
    } catch (e: any) {
      // O erro customizado da validação será capturado aqui
      setOcrError(e.message || "Ocorreu um erro inesperado. Tente novamente.")
    } finally {
      setProcessingFiles((prev) => {
        const n = new Set(prev)
        n.delete(fileId)
        return n
      })
      setIsProcessingOCR(false)
    }
  }

  const handleFileUpload = async (field: keyof DocumentosData, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const newFiles = Array.from(fileList)
    updateDocumentos(field, newFiles.slice(0, 1))
    if (field === "cnh" || field === "crlv") {
      await processarOCR(newFiles[0], field)
    }
  }

  const handleFotoStepUpload = (stepId: number, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    const newFiles = Array.from(fileList).slice(0, 1)
    setFotoStepFiles((prev) => ({ ...prev, [stepId]: newFiles }))
    const allCarFiles = [...(isDocumentingThirdParty ? documentosTerceiros : documentos).fotosCarro, ...newFiles]
    updateDocumentos("fotosCarro", allCarFiles)
  }

  const removeFile = (field: keyof DocumentosData, index: number) => {
    const currentDocs = isDocumentingThirdParty ? documentosTerceiros : documentos
    const newFiles = currentDocs[field].filter((_, i) => i !== index)
    updateDocumentos(field, newFiles)

    if (newFiles.length === 0) {
      setOcrError(null)
      if (field === "cnh") {
        const setter = isDocumentingThirdParty ? setCnhDataTerceiros : setCnhData
        const processedSetter = isDocumentingThirdParty ? setHasProcessedCNHTerceiros : setHasProcessedCNH
        setter({ nome: "", cpf: "", rg: "", dataNascimento: "", categoria: "", numeroRegistro: "", dataVencimento: "" })
        processedSetter(false)
      } else if (field === "crlv") {
        const setter = isDocumentingThirdParty ? setCrlvDataTerceiros : setCrlvData
        const processedSetter = isDocumentingThirdParty ? setHasProcessedCRLVTerceiros : setHasProcessedCRLV
        setter({
          placa: "",
          renavam: "",
          chassi: "",
          marca: "",
          modelo: "",
          anoFabricacao: "",
          anoModelo: "",
          cor: "",
          combustivel: "",
          proprietario: "",
        })
        processedSetter(false)
      }
    }
  }

  const removeFotoStepFile = (stepId: number, index: number) => {
    const files = fotoStepFiles[stepId] || []
    const fileToRemove = files[index]
    const newStepFiles = files.filter((_, i) => i !== index)
    setFotoStepFiles((prev) => ({ ...prev, [stepId]: newStepFiles }))

    const currentFotos = (isDocumentingThirdParty ? documentosTerceiros : documentos).fotosCarro
    const newAllCarFiles = currentFotos.filter((f) => f !== fileToRemove)
    updateDocumentos("fotosCarro", newAllCarFiles)
  }

  const nextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2) // Vai para tipo de atendimento
    } else if (currentStep === 2) {
      // Step 2 - Tipo de Atendimento
      if (tipoAtendimento === "sinistro") {
        setCurrentStep(3) // Vai para tipo de sinistro
      } else if (tipoAtendimento === "assistencia") {
        setCurrentStep(4) // Vai para tipo de assistência
      }
    } else if (currentStep === 3) {
      // Step 3 - Tipo de Sinistro
      if (tipoSinistro === "furto" || tipoSinistro === "roubo") {
        setCurrentStep(5) // Vai para situação dos documentos
      } else if (tipoSinistro === "pequenos_reparos") {
        setCurrentStep(6) // Vai direto para CNH
      } else {
        setCurrentStep(6) // Colisão vai para CNH
      }
    } else if (currentStep === 4) {
      // Step 4 - Tipo de Assistência
      setCurrentStep(6) // Vai para CNH
    } else if (currentStep === 5) {
      // Step 5 - Situação dos documentos (furto/roubo)
      setCurrentStep(documentosFurtados ? 12 : 6)
    } else if (currentStep === 6) {
      // Step 6 - CNH
      if (tipoAtendimento === "assistencia") {
        setCurrentStep(11) // Assistência vai para assistência adicional após CNH
      } else {
        setCurrentStep(7)
      }
    } else if (currentStep === 7) {
      // Step 7 - CRLV
      if (tipoSinistro === "pequenos_reparos") {
        setCurrentStep(9) // Pequenos reparos vai direto para fotos
        setCurrentFotoStep(0)
      } else {
        setCurrentStep(8) // Outros vão para B.O.
      }
    } else if (currentStep === 8) {
      // Step 8 - B.O.
      if (tipoSinistro === "furto" || tipoSinistro === "roubo") {
        setCurrentStep(11) // Furto/roubo AGORA vai para assistência adicional antes da finalização
      } else {
        setCurrentStep(9) // Colisão vai para fotos
        setCurrentFotoStep(0)
      }
    } else if (currentStep === 9) {
      // Step 9 - Fotos
      if (tipoSinistro === "pequenos_reparos") {
        // Para pequenos reparos, só precisa da foto do reparo e do chassi
        if (currentFotoStep < 1) {
          setCurrentFotoStep(currentFotoStep + 1)
        } else {
          setCurrentStep(11) // Vai para assistência adicional
        }
      } else {
        // Fluxo normal de fotos para colisão
        const limit = isDocumentingThirdParty ? 9 : 4
        if (currentFotoStep < limit) {
          setCurrentFotoStep(currentFotoStep + 1)
        } else {
          // AGORA todos os fluxos passam pela assistência adicional antes da finalização
          setCurrentStep(isDocumentingThirdParty ? 11 : 10) // Se já documentou terceiros, vai para assistência, senão vai para terceiros
        }
      }
    } else if (currentStep === 10) {
      // Step 10 - Terceiros
      if (outrosVeiculos) {
        setIsDocumentingThirdParty(true)
        setCurrentStep(6)
        setCurrentFotoStep(0)
      } else {
        setCurrentStep(11) // Vai para assistência adicional
      }
    } else if (currentStep === 11) {
      // Step 11 - Assistência Adicional
      // Sempre vai para finalização (a seleção das assistências é feita na mesma tela)
      setCurrentStep(12)
    } else if (currentStep === 12) {
      // Step 12 - Finalização
      if ((tipoSinistro === "furto" || tipoSinistro === "roubo") && documentosFurtados) {
        setCurrentStep(13) // Vai para furto sem documentos
      }
    }
  }

  const canProceed = () => {
    const currentDocs = isDocumentingThirdParty ? documentosTerceiros : documentos
    const currentCNH = isDocumentingThirdParty ? cnhDataTerceiros : cnhData
    const currentCRLV = isDocumentingThirdParty ? crlvDataTerceiros : crlvData
    const currentHasProcessedCNH = isDocumentingThirdParty ? hasProcessedCNHTerceiros : hasProcessedCNH

    switch (currentStep) {
      case 2:
        return tipoAtendimento !== null
      case 3:
        return tipoSinistro !== null
      case 4:
        return tipoAssistencia !== null
      case 5:
        return documentosFurtados !== null
      case 6:
        return currentDocs.cnh.length > 0 && (currentHasProcessedCNH || !!ocrError) && currentCNH.nome !== ""
      case 7:
        return currentDocs.crlv.length > 0 || Object.values(currentCRLV).some((v) => v !== "")
      case 8:
        return currentDocs.boletimOcorrencia.length > 0
      case 9:
        if (tipoSinistro === "pequenos_reparos") {
          // Para pequenos reparos, verificar se tem as fotos necessárias
          return currentFotoStep === 0 ? (fotoStepFiles[0] || []).length > 0 : (fotoStepFiles[1] || []).length > 0
        } else {
          const fotoStep = fotoVeiculoSteps[currentFotoStep]
          return !fotoStep?.obrigatoria || (fotoStepFiles[fotoStep.id] || []).length > 0
        }
      case 10:
        return outrosVeiculos !== null
      case 11:
        // Se não quer assistência adicional OU se quer e já selecionou pelo menos uma
        return assistenciaAdicional === false || (assistenciaAdicional === true && assistenciasAdicionais.length > 0)
      case 12:
        if ((tipoSinistro === "furto" || tipoSinistro === "roubo") && documentosFurtados) {
          return (
            dadosFurtoSemDocumentos.nomeCompleto.trim() !== "" &&
            dadosFurtoSemDocumentos.cpf.trim() !== "" &&
            validarCPF(dadosFurtoSemDocumentos.cpf) &&
            dadosFurtoSemDocumentos.placaVeiculo.trim() !== "" &&
            validarPlaca(dadosFurtoSemDocumentos.placaVeiculo)
          )
        }
        return true
      default:
        return true
    }
  }

  const value = {
    currentStep,
    setCurrentStep,
    currentFotoStep,
    setCurrentFotoStep,
    isDocumentingThirdParty,
    setIsDocumentingThirdParty,
    tipoAtendimento,
    setTipoAtendimento,
    tipoSinistro,
    setTipoSinistro,
    tipoAssistencia,
    setTipoAssistencia,
    documentosFurtados,
    setDocumentosFurtados,
    documentos,
    setDocumentos,
    documentosTerceiros,
    setDocumentosTerceiros,
    cnhData,
    setCnhData,
    crlvData,
    setCrlvData,
    cnhDataTerceiros,
    setCnhDataTerceiros,
    crlvDataTerceiros,
    setCrlvDataTerceiros,
    dadosFurtoSemDocumentos,
    setDadosFurtoSemDocumentos,
    isProcessingOCR,
    ocrError,
    setOcrError,
    fotoStepFiles,
    setFotoStepFiles,
    outrosVeiculos,
    setOutrosVeiculos,
    assistenciaAdicional,
    setAssistenciaAdicional,
    assistenciasAdicionais,
    setAssistenciasAdicionais,
    hasProcessedCNH,
    hasProcessedCRLV,
    hasProcessedCNHTerceiros,
    hasProcessedCRLVTerceiros,
    nextStep,
    handleFileUpload,
    handleFotoStepUpload,
    removeFile,
    removeFotoStepFile,
    canProceed,
  }

  return <FormContext.Provider value={value}>{children}</FormContext.Provider>
}

export function useForm() {
  const context = useContext(FormContext)
  if (context === undefined) {
    throw new Error("useForm must be used within a FormProvider")
  }
  return context
}
