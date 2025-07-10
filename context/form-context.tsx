"use client"

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from "react"
import type { CNHData, CRLVData, DocumentosData, TipoSinistro, DadosFurtoSemDocumentos } from "@/types"
import { fotoVeiculoSteps } from "@/constants/steps" // Assuming fotoVeiculoSteps is declared in a constants file
import { validarCPF, validarPlaca } from "@/lib/validations"

// Definindo a estrutura do nosso contexto
interface FormContextType {
  // State
  currentStep: number
  currentFotoStep: number
  isDocumentingThirdParty: boolean
  tipoSinistro: TipoSinistro
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
  hasProcessedCNH: boolean
  hasProcessedCRLV: boolean
  hasProcessedCNHTerceiros: boolean
  hasProcessedCRLVTerceiros: boolean

  // Setters
  setCurrentStep: Dispatch<SetStateAction<number>>
  setCurrentFotoStep: Dispatch<SetStateAction<number>>
  setIsDocumentingThirdParty: Dispatch<SetStateAction<boolean>>
  setTipoSinistro: Dispatch<SetStateAction<TipoSinistro>>
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

  // Funções de Lógica
  nextStep: () => void
  handleFileUpload: (field: keyof DocumentosData, fileList: FileList | null) => Promise<void>
  handleFotoStepUpload: (stepId: number, fileList: FileList | null) => void
  removeFile: (field: keyof DocumentosData, index: number) => void
  removeFotoStepFile: (stepId: number, index: number) => void
  canProceed: () => boolean
}

const FormContext = createContext<FormContextType | undefined>(undefined)

export function FormProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [currentFotoStep, setCurrentFotoStep] = useState(0)
  const [isDocumentingThirdParty, setIsDocumentingThirdParty] = useState(false)
  const [tipoSinistro, setTipoSinistro] = useState<TipoSinistro>(null)
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
    nome: "",
    cpf: "",
    rg: "",
    dataNascimento: "",
    categoria: "",
    numeroRegistro: "",
    dataVencimento: "",
  })
  const [crlvData, setCrlvData] = useState<CRLVData>({
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
  const [hasProcessedCNH, setHasProcessedCNH] = useState(false)
  const [hasProcessedCRLV, setHasProcessedCRLV] = useState(false)
  const [hasProcessedCNHTerceiros, setHasProcessedCNHTerceiros] = useState(false)
  const [hasProcessedCRLVTerceiros, setHasProcessedCRLVTerceiros] = useState(false)

  const updateDocumentos = (field: keyof DocumentosData, files: File[]) => {
    const setter = isDocumentingThirdParty ? setDocumentosTerceiros : setDocumentos
    setter((prev) => ({ ...prev, [field]: files }))
  }

  const processarOCR = async (file: File, documentType: "cnh" | "crlv") => {
    const fileId = `${file.name}-${file.size}-${file.lastModified}`
    if (processingFiles.has(fileId)) return

    setProcessingFiles((prev) => new Set(prev).add(fileId))
    setIsProcessingOCR(true)
    setOcrError(null)

    try {
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(",")[1])
        reader.onerror = (error) => reject(error)
        reader.readAsDataURL(file)
      })

      const resp = await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image, type: documentType }),
      })
      const result = await resp.json()

      if (!result.success) {
        removeFile(documentType, 0) // Remove o arquivo se a API falhar
        throw new Error(result.message || "A API retornou uma falha. Tente novamente.")
      }

      const { extractedData } = result

      // Validação de campos essenciais
      if (documentType === "cnh" && (!extractedData || !extractedData.cpf)) {
        removeFile("cnh", 0) // Remove arquivo inválido
        throw new Error("Por favor, envie uma foto mais nítida e sem reflexos.")
      }

      if (documentType === "crlv" && (!extractedData || !extractedData.placa)) {
        removeFile("crlv", 0) // Remove arquivo inválido
        throw new Error("Por favor, envie uma foto mais nítida e sem reflexos.")
      }

      // Se a validação passar, define os dados
      if (documentType === "cnh") {
        if (isDocumentingThirdParty) {
          setCnhDataTerceiros(extractedData)
          setHasProcessedCNHTerceiros(true)
        } else {
          setCnhData(extractedData)
          setHasProcessedCNH(true)
        }
      } else {
        // crlv
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
    if (currentStep === 1) setCurrentStep(2)
    else if (currentStep === 2) setCurrentStep(tipoSinistro === "furto" || tipoSinistro === "roubo" ? 3 : 4)
    else if (currentStep === 3) setCurrentStep(documentosFurtados ? 9 : 4)
    else if (currentStep === 4) setCurrentStep(5)
    else if (currentStep === 5) setCurrentStep(6)
    else if (currentStep === 6) {
      if (tipoSinistro === "furto" || tipoSinistro === "roubo") {
        setCurrentStep(9)
      } else {
        setCurrentStep(7)
        setCurrentFotoStep(0)
      }
    } else if (currentStep === 7) {
      const limit = isDocumentingThirdParty ? 9 : 4
      if (currentFotoStep < limit) {
        setCurrentFotoStep(currentFotoStep + 1)
      } else {
        setCurrentStep(isDocumentingThirdParty ? 9 : 8)
      }
    } else if (currentStep === 8) {
      if (outrosVeiculos) {
        setIsDocumentingThirdParty(true)
        setCurrentStep(4)
        setCurrentFotoStep(0)
      } else {
        setCurrentStep(9)
      }
    } else if (currentStep === 9) {
      if ((tipoSinistro === "furto" || tipoSinistro === "roubo") && documentosFurtados) {
        setCurrentStep(10)
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
        return tipoSinistro !== null
      case 3:
        return documentosFurtados !== null
      case 4:
        return currentDocs.cnh.length > 0 && (currentHasProcessedCNH || !!ocrError) && currentCNH.nome !== ""
      case 5:
        return currentDocs.crlv.length > 0 || Object.values(currentCRLV).some((v) => v !== "")
      case 6:
        return currentDocs.boletimOcorrencia.length > 0
      case 7:
        const fotoStep = fotoVeiculoSteps[currentFotoStep]
        return !fotoStep?.obrigatoria || (fotoStepFiles[fotoStep.id] || []).length > 0
      case 8:
        return outrosVeiculos !== null
      case 9:
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
    tipoSinistro,
    setTipoSinistro,
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
