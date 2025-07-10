"use client"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"
import { FormProvider } from "@/context/form-context"
import DocumentosForm from "@/components/documentos-form"

// Componente de Loading para os steps dinâmicos
const StepLoading = () => (
  <div className="flex justify-center items-center h-48">
    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    <p className="ml-4 text-gray-600">Carregando etapa...</p>
  </div>
)

// Otimização: Carregar as etapas subsequentes dinamicamente para não sobrecarregar o carregamento inicial.
const StepTipoSinistro = dynamic(
  () => import("@/components/steps/step-tipo-sinistro").then((mod) => mod.StepTipoSinistro),
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
const StepFinalizacao = dynamic(
  () => import("@/components/steps/step-finalizacao").then((mod) => mod.StepFinalizacao),
  { loading: () => <StepLoading /> },
)

export default function Page() {
  return (
    <FormProvider>
      <DocumentosForm />
    </FormProvider>
  )
}
