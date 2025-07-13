"use client"

import { Button } from "@/components/ui/button"
import { Camera, CheckCircle, Smartphone, Target, Wrench } from "lucide-react"
import { useForm } from "@/context/form-context"
import { fotoVeiculoSteps } from "@/constants/steps"
import { FilePreview } from "@/components/file-preview"

export function StepFotos() {
  const { currentFotoStep, fotoStepFiles, handleFotoStepUpload, removeFotoStepFile, isProcessingOCR, tipoSinistro } = useForm()

  // Configuração especial para pequenos reparos
  const pequenosReparosSteps = [
    {
      id: 0,
      titulo: "Foto do Reparo a Ser Feito",
      descricao: "Foto clara do dano a ser reparado",
      instrucoes: [
        "Aproxime-se do dano para mostrar os detalhes",
        "Use boa iluminação natural se possível",
        "Evite reflexos e sombras sobre o dano",
      ],
      posicionamento: [
        "Posicione o celular paralelo à superfície danificada",
        "Mantenha distância de 30-50cm do dano",
        "Centralize o dano na foto",
      ],
      exemplo: "Foto clara mostrando risco, amassado ou dano específico",
      obrigatoria: true,
    },
    {
      id: 1,
      titulo: "Foto do Número do Chassi",
      descricao: "Foto do número do chassi do veículo",
      instrucoes: [
        "Use boa iluminação para garantir legibilidade",
        "Limpe a área se houver sujeira",
        "Todos os caracteres devem estar visíveis",
      ],
      posicionamento: [
        "Aproxime-se a 20-30cm do chassi",
        "Use flash se necessário",
        "Mantenha o celular estável",
      ],
      exemplo: "Foto clara mostrando todos os caracteres do chassi",
      obrigatoria: true,
    },
  ]

  const currentStepData = tipoSinistro === "pequenos_reparos" 
    ? pequenosReparosSteps[currentFotoStep]
    : fotoVeiculoSteps[currentFotoStep]
    
  const hasFile = (fotoStepFiles[currentStepData.id] || []).length > 0
  const isUploadDisabled = hasFile || isProcessingOCR

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header especial para pequenos reparos */}
      {tipoSinistro === "pequenos_reparos" && (
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Wrench className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{currentStepData.titulo}</h2>
          <p className="text-sm sm:text-base text-gray-600">{currentStepData.descricao}</p>
        </div>
      )}

      {/* Instruções em accordion mobile-friendly */}
      <div className={`${tipoSinistro === "pequenos_reparos" ? "bg-blue-50 border-blue-200" : "bg-orange-50 border-orange-200"} rounded-lg p-4 sm:p-6 border mx-2 sm:mx-0`}>
        <h3 className={`font-semibold ${tipoSinistro === "pequenos_reparos" ? "text-blue-800" : "text-orange-800"} mb-2 sm:mb-3 flex items-center text-sm sm:text-base`}>
          <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          Como Tirar a Foto Perfeita
        </h3>

        {/* Instruções em grid responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h4 className={`font-medium ${tipoSinistro === "pequenos_reparos" ? "text-blue-800" : "text-orange-800"} text-sm`}>Instruções:</h4>
            <ul className={`space-y-1 text-xs sm:text-sm ${tipoSinistro === "pequenos_reparos" ? "text-blue-700" : "text-orange-700"}`}>
              {currentStepData.instrucoes.map((instrucao, index) => (
                <li key={index} className="flex items-start leading-relaxed">
                  <span className={`${tipoSinistro === "pequenos_reparos" ? "text-blue-600" : "text-orange-600"} mr-2 flex-shrink-0 mt-0.5`}>✓</span>
                  <span>{instrucao}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h4 className={`font-medium ${tipoSinistro === "pequenos_reparos" ? "text-blue-800" : "text-orange-800"} text-sm`}>Posicionamento:</h4>
            <ul className={`space-y-1 text-xs sm:text-sm ${tipoSinistro === "pequenos_reparos" ? "text-blue-700" : "text-orange-700"}`}>
              {currentStepData.posicionamento.map((posicionamento, index) => (
                <li key={index} className="flex items-start leading-relaxed">
                  <Target className={`w-4 h-4 ${tipoSinistro === "pequenos_reparos" ? "text-blue-600" : "text-orange-600"} mr-2 flex-shrink-0 mt-0.5`} />
                  <span>{posicionamento}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`mt-3 sm:mt-4 p-2 sm:p-3 bg-white rounded border ${tipoSinistro === "pequenos_reparos" ? "border-blue-200" : "border-orange-200"}`}>
          <p className={`text-xs sm:text-sm ${tipoSinistro === "pequenos_reparos" ? "text-blue-700" : "text-orange-700"} leading-relaxed`}>
            <strong>Exemplo:</strong> {currentStepData.exemplo}
          </p>
        </div>
      </div>

      {/* Botão de upload único */}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={() =>
            !isUploadDisabled && document.getElementById(`foto-step-${currentStepData.id}-upload`)?.click()
          }
          className={`w-full max-w-sm h-12 sm:h-14 ${
            isUploadDisabled 
              ? "bg-gray-400 cursor-not-allowed" 
              : tipoSinistro === "pequenos_reparos"
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-orange-600 hover:bg-orange-700"
          }`}
          disabled={isUploadDisabled}
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          <div className="text-center">
            <div className="font-medium text-xs sm:text-sm">{hasFile ? "Foto Enviada" : "Tirar/Enviar Foto"}</div>
            <div className="text-xs opacity-90">{hasFile ? "Delete para trocar" : "Câmera ou galeria"}</div>
          </div>
        </Button>
      </div>

      <input
        id={`foto-step-${currentStepData.id}-upload`}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFotoStepUpload(currentStepData.id, e.target.files)}
        disabled={isUploadDisabled}
      />

      {/* Preview das fotos */}
      {fotoStepFiles[currentStepData.id] && fotoStepFiles[currentStepData.id].length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-3 flex items-center text-sm sm:text-base">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0" />
            Foto Enviada
          </h3>
          <FilePreview
            files={fotoStepFiles[currentStepData.id]}
            onRemove={(index) => removeFotoStepFile(currentStepData.id, index)}
          />
        </div>
      )}
    </div>
  )
}
