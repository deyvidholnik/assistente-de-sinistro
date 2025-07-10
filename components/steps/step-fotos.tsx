"use client"

import { Button } from "@/components/ui/button"
import { Camera, CheckCircle, Smartphone } from "lucide-react"
import { useForm } from "@/context/form-context"
import { fotoVeiculoSteps } from "@/constants/steps"
import { FilePreview } from "@/components/file-preview"

export function StepFotos() {
  const { currentFotoStep, fotoStepFiles, handleFotoStepUpload, removeFotoStepFile, isProcessingOCR } = useForm()

  const currentStepData = fotoVeiculoSteps[currentFotoStep]
  const hasFile = (fotoStepFiles[currentStepData.id] || []).length > 0
  const isUploadDisabled = hasFile || isProcessingOCR

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Instruções em accordion mobile-friendly */}
      <div className="bg-orange-50 rounded-lg p-4 sm:p-6 border border-orange-200 mx-2 sm:mx-0">
        <h3 className="font-semibold text-orange-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
          <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
          Como Tirar a Foto Perfeita
        </h3>

        {/* Instruções em grid responsivo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1 sm:space-y-2">
            <h4 className="font-medium text-orange-800 text-sm">Instruções:</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-orange-700">
              {currentStepData.instrucoes.map((instrucao, index) => (
                <li key={index} className="flex items-start leading-relaxed">
                  <span className="text-orange-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
                  <span>{instrucao}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-1 sm:space-y-2">
            <h4 className="font-medium text-orange-800 text-sm">Posicionamento:</h4>
            <ul className="space-y-1 text-xs sm:text-sm text-orange-700">
              {currentStepData.posicionamento.map((posicionamento, index) => (
                <li key={index} className="flex items-start leading-relaxed">
                  <span className="text-orange-600 mr-2 flex-shrink-0 mt-0.5">🎯</span>
                  <span>{posicionamento}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white rounded border border-orange-200">
          <p className="text-xs sm:text-sm text-orange-700 leading-relaxed">
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
            isUploadDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-orange-600 hover:bg-orange-700"
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
