"use client"

import React, { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import dynamic from "next/dynamic"
import { Loader2, CheckCircle } from "lucide-react"

// Importar o hook do contexto
import { useForm } from "@/context/form-context"

// Importar tipos e constantes
import { steps, fotoVeiculoSteps } from "@/constants/steps"

// Otimização: Carregar a primeira etapa estaticamente para um início instantâneo.
import { StepInicio } from "@/components/steps/step-inicio"

// Componente de Loading para os steps dinâmicos
const StepLoading = () => (
  <div className="flex justify-center items-center h-48">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    <p className="ml-4 text-gray-600">Carregando etapa...</p>
  </div>
)

// Otimização: Carregar as etapas subsequentes dinamicamente para não sobrecarregar o carregamento inicial.
const StepTipoAtendimento = dynamic(
  () => import("@/components/steps/step-tipo-atendimento").then((mod) => mod.StepTipoAtendimento),
  { loading: () => <StepLoading /> },
)
const StepTipoSinistro = dynamic(
  () => import("@/components/steps/step-tipo-sinistro").then((mod) => mod.StepTipoSinistro),
  { loading: () => <StepLoading /> },
)
const StepAssistencia = dynamic(
  () => import("@/components/steps/step-assistencia").then((mod) => mod.StepAssistencia),
  { loading: () => <StepLoading /> },
)
const StepDocumentosFurtados = dynamic(
  () => import("@/components/steps/step-documentos-furtados").then((mod) => mod.StepDocumentosFurtados),
  { loading: () => <StepLoading /> },
)
const StepFurtoSemDocumentos = dynamic(
  () => import("@/components/steps/step-furto-sem-documentos").then((mod) => mod.StepFurtoSemDocumentos),
  { loading: () => <StepLoading /> },
)
const StepCNH = dynamic(() => import("@/components/steps/step-cnh").then((mod) => mod.StepCNH), {
  loading: () => <StepLoading />,
})
const StepCRLV = dynamic(() => import("@/components/steps/step-crlv").then((mod) => mod.StepCRLV), {
  loading: () => <StepLoading />,
})
const StepBoletimOcorrencia = dynamic(
  () => import("@/components/steps/step-boletim-ocorrencia").then((mod) => mod.StepBoletimOcorrencia),
  { loading: () => <StepLoading /> },
)
const StepTerceiros = dynamic(() => import("@/components/steps/step-terceiros").then((mod) => mod.StepTerceiros), {
  loading: () => <StepLoading />,
})
const StepFotos = dynamic(() => import("@/components/steps/step-fotos").then((mod) => mod.StepFotos), {
  loading: () => <StepLoading />,
})
const StepAssistenciaAdicional = dynamic(
  () => import("@/components/steps/step-assistencia-adicional").then((mod) => mod.StepAssistenciaAdicional),
  { loading: () => <StepLoading /> },
)
const StepFinalizacao = dynamic(
  () => import("@/components/steps/step-finalizacao").then((mod) => mod.StepFinalizacao),
  { loading: () => <StepLoading /> },
)

export default function DocumentosForm() {
  // Extrair tudo do hook do contexto
  const {
    currentStep,
    currentFotoStep,
    isDocumentingThirdParty,
    tipoAtendimento,
    tipoSinistro,
    documentosFurtados,
    isProcessingOCR,
    ocrError,
    nextStep,
    canProceed,
  } = useForm()

  const isReadyToProceed = canProceed()

  // Refs para scroll automático
  const cardRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const navigationRef = useRef<HTMLDivElement>(null)

  // Master Scroll Effect - Gerenciador de rolagem da página
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isReadyToProceed && !isProcessingOCR && navigationRef.current) {
        navigationRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
      } else if ((isProcessingOCR || ocrError) && contentRef.current) {
        contentRef.current.scrollIntoView({ behavior: "smooth", block: "end" })
      } else if (cardRef.current) {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [currentStep, currentFotoStep, isProcessingOCR, ocrError, isReadyToProceed])

  /* ---------- cálculo de progresso ---------- */
  function getProgress() {
    // Agora temos 12 steps no total
    const totalSteps = 12
    const normalizedStep = currentStep === 13 ? 12 : currentStep
    const completedSteps = normalizedStep - 1
    
    if (tipoAtendimento === "assistencia") {
      // Para assistência, o fluxo é: steps 1, 2, 4, 6, 11, 12
      if (currentStep === 1) return 0
      if (currentStep === 2) return 16.7
      if (currentStep === 4) return 33.3
      if (currentStep === 6) return 50
      if (currentStep === 11) return 83.3
      if (currentStep === 12) return 100
    }
    
    if (tipoSinistro === "pequenos_reparos") {
      // Para pequenos reparos: steps 1, 2, 3, 6, 7, 9 (fotos simplificadas), 11
      if (currentStep === 1) return 0
      if (currentStep === 2) return 14
      if (currentStep === 3) return 28
      if (currentStep === 6) return 42
      if (currentStep === 7) return 56
      if (currentStep === 9) {
        // Pequenos reparos tem apenas 2 fotos
        const fotoProgress = (currentFotoStep / 1) * 14
        return 70 + fotoProgress
      }
      if (currentStep === 11) return 100
    }
    
    if (tipoSinistro === "furto" || tipoSinistro === "roubo") {
      return (completedSteps / totalSteps) * 100
    }
    
    if (isDocumentingThirdParty) {
      if (normalizedStep === 9) {
        const terceirosFotoProgress = ((currentFotoStep - 5) / 7) * 0.5
        return 50 + terceirosFotoProgress * 100
      }
      return (completedSteps / totalSteps) * 50 + 50
    }
    
    if (normalizedStep === 9) {
      const baseProgress = (8 / totalSteps) * 100
      const fotoProgress = ((currentFotoStep + 1) / 5) * (1 / totalSteps) * 100
      return baseProgress + fotoProgress
    }
    
    return (completedSteps / totalSteps) * 100
  }

  const progress = getProgress()

  /* ---------- render do conteúdo da etapa atual ---------- */
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepInicio />
      case 2:
        return <StepTipoAtendimento />
      case 3:
        return <StepTipoSinistro />
      case 4:
        return <StepAssistencia />
      case 5:
        return <StepDocumentosFurtados />
      case 6:
        return <StepCNH />
      case 7:
        return <StepCRLV />
      case 8:
        return <StepBoletimOcorrencia />
      case 9:
        return <StepFotos />
      case 10:
        return <StepTerceiros />
      case 11:
        return <StepAssistenciaAdicional />
      case 12:
        if ((tipoSinistro === "furto" || tipoSinistro === "roubo") && documentosFurtados) {
          return <StepFurtoSemDocumentos />
        }
        return <StepFinalizacao />
      case 13:
        return <StepFinalizacao />
      default:
        return null
    }
  }

  const getStepTitle = () => {
    if (currentStep === 9 && tipoSinistro === "pequenos_reparos") {
      const titles = ["Foto do Reparo", "Foto do Chassi"]
      return titles[currentFotoStep] || "Fotos do Veículo"
    }
    if (currentStep === 9) return fotoVeiculoSteps[currentFotoStep]?.titulo || "Fotos do Veículo"
    if (isDocumentingThirdParty && currentStep <= 9) {
      const titles: { [key: number]: string } = { 6: "CNH do Terceiro", 7: "CRLV do Terceiro" }
      return titles[currentStep] || steps[currentStep - 1].title
    }
    const stepIndex = currentStep === 13 ? 11 : currentStep - 1
    return steps[stepIndex]?.title || "Finalização"
  }

  const getStepDescription = () => {
    if (currentStep === 9 && tipoSinistro === "pequenos_reparos") {
      const descriptions = [
        "Foto clara do dano a ser reparado",
        "Foto do número do chassi do veículo"
      ]
      return descriptions[currentFotoStep] || "Siga as instruções."
    }
    if (currentStep === 9) return fotoVeiculoSteps[currentFotoStep]?.descricao || "Siga as instruções."
    if (isDocumentingThirdParty && currentStep <= 9) {
      const descriptions: { [key: number]: string } = {
        6: "Documentos do condutor terceiro",
        7: "Documento do veículo terceiro",
      }
      return descriptions[currentStep] || steps[currentStep - 1].description
    }
    const stepIndex = currentStep === 13 ? 11 : currentStep - 1
    return steps[stepIndex]?.description || "Envio concluído"
  }

  /**
   * =====================================================================
   *  RENDER
   * =====================================================================
   */
  return (
    <div className="min-h-screen bg-gray-50 py-2 sm:py-4 px-2 sm:px-4">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-2 sm:mb-3">
            <img
              src="/images/logo.png"
              alt="PV Auto Proteção Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 mr-3 rounded-full object-cover"
            />
            <h1 className="text-lg sm:text-2xl font-bold text-blue-900 leading-tight">Auto Proteção</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 px-2">
            {isDocumentingThirdParty ? "Documentos do Terceiro Envolvido" : "Envio de Documentos para Sinistro"}
          </p>
          <Progress value={progress} className="w-full h-1.5 sm:h-2 mb-2 sm:mb-3" />
          <div className="flex justify-between text-xs text-gray-500 px-1">
            {/* Versão desktop - mostra todos os steps */}
            <div className="hidden sm:flex sm:justify-between sm:w-full">
              {steps.map((step) => {
                const normalizedStep = currentStep === 12 ? 11 : currentStep
                return (
                  <div key={step.id} className="flex flex-col items-center min-w-0">
                    <span
                      className={`${normalizedStep >= step.id ? "text-blue-600 font-medium" : ""} truncate text-center leading-tight text-xs`}
                    >
                      {step.title}
                      {normalizedStep === 9 && step.id === 9 && (
                        <span className="block text-xs">
                          ({currentFotoStep + 1}/{isDocumentingThirdParty ? "9" : tipoSinistro === "pequenos_reparos" ? "2" : "5"})
                        </span>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Versão mobile - mostra apenas step atual e total */}
            <div className="flex sm:hidden justify-between w-full">
              <span className="text-xs text-gray-600">
                Passo {currentStep === 13 ? 12 : currentStep} de {tipoAtendimento === "assistencia" ? "6" : "12"}
              </span>
              <span className="text-xs text-blue-600 font-medium">
                {getStepTitle()}
              </span>
            </div>
          </div>
        </div>

        {/* CARD PRINCIPAL */}
        <Card ref={cardRef} className="shadow-lg border-gray-200 mx-1 sm:mx-0">
          <CardHeader className="bg-white border-b border-gray-100 p-3 sm:p-4">
            <CardTitle className="flex items-center text-base sm:text-lg text-gray-800">
              {React.createElement(steps[currentStep === 12 ? 10 : currentStep - 1]?.icon || CheckCircle, {
                className: "w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600 flex-shrink-0",
              })}
              <span className="truncate">{getStepTitle()}</span>
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">{getStepDescription()}</p>
          </CardHeader>
          <CardContent ref={contentRef} className="p-3 sm:p-6 bg-white">
            {renderCurrentStep()}
            {currentStep === 1 && (
              <div className="flex justify-center mt-4 sm:mt-6">
                <Button
                  onClick={nextStep}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-sm sm:text-base font-medium"
                >
                  Começar Envio
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* BOTÕES NAVEGAÇÃO */}
        {currentStep !== 1 && currentStep !== 11 && currentStep !== 12 && currentStep !== 13 && isReadyToProceed && !isProcessingOCR && (
          <div
            ref={navigationRef}
            className="bg-white border-t border-gray-200 p-3 mt-4 sm:bg-transparent sm:border-t-0 sm:p-0"
          >
            <div className="flex justify-center max-w-4xl mx-auto">
              <Button
                onClick={nextStep}
                className="w-full max-w-xs h-10 sm:h-auto bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
              >
                Continuar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
