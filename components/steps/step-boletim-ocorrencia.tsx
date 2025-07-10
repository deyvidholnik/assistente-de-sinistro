"use client"

import { Button } from "@/components/ui/button"
import { FileText, Upload, CheckCircle, AlertTriangle, Clock } from "lucide-react"
import { useForm } from "@/context/form-context"
import { FilePreview } from "@/components/file-preview"

export function StepBoletimOcorrencia() {
  const {
    isDocumentingThirdParty,
    documentos,
    documentosTerceiros,
    handleFileUpload,
    removeFile,
    nextStep,
    isProcessingOCR,
  } = useForm()

  const currentDocumentos = isDocumentingThirdParty ? documentosTerceiros : documentos
  const hasFile = currentDocumentos.boletimOcorrencia?.length > 0
  const isUploadDisabled = hasFile || isProcessingOCR

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header compacto */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
        </div>
        <h2 className="text-base sm:text-xl font-bold text-gray-900 mb-1 px-2 leading-tight">Boletim de Ocorrência</h2>
        <p className="text-xs sm:text-sm text-gray-600 px-4 leading-relaxed">
          Envie uma foto do Boletim de Ocorrência registrado na delegacia
        </p>
      </div>

      {/* Informações importantes compactas */}
      <div className="bg-amber-50 rounded-lg p-3 sm:p-4 border border-amber-200 mx-1 sm:mx-0">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800 text-xs sm:text-sm mb-1">Documento Obrigatório</h4>
            <p className="text-amber-700 text-xs leading-relaxed mb-2">
              O Boletim de Ocorrência é essencial. Caso ainda não tenha registrado, procure a delegacia mais próxima.
            </p>
            <ul className="text-amber-700 text-xs space-y-0.5">
              <li>• Pode ser registrado online em alguns estados</li>
              <li>• Leve documento de identidade e dados do veículo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Botões de upload compactos */}
      <div className="space-y-3 px-1 sm:px-0">
        {/* Botão de upload único */}
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={() => !isUploadDisabled && document.getElementById("bo-upload")?.click()}
            className={`w-full max-w-sm h-12 sm:h-14 ${
              isUploadDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isUploadDisabled}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            <div className="text-center">
              <div className="font-medium text-xs sm:text-sm">
                {hasFile ? "Arquivo Enviado" : "Enviar Foto do B.O."}
              </div>
              <div className="text-xs opacity-90">{hasFile ? "Delete para trocar" : "Câmera ou galeria"}</div>
            </div>
          </Button>
        </div>

        <input
          id="bo-upload"
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileUpload("boletimOcorrencia", e.target.files)}
          disabled={isUploadDisabled}
        />

        {/* Preview de arquivos */}
        {currentDocumentos.boletimOcorrencia && currentDocumentos.boletimOcorrencia.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2 flex items-center text-xs sm:text-sm">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1 sm:mr-2 flex-shrink-0" />
              Boletim de Ocorrência Enviado
            </h3>
            <FilePreview
              files={currentDocumentos.boletimOcorrencia}
              onRemove={(index) => removeFile("boletimOcorrencia", index)}
            />
          </div>
        )}

        {/* Opção para enviar depois - mais compacta */}
        {!hasFile && (
          <div className="border-t border-gray-200 pt-3">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-xs sm:text-sm mb-1">Ainda não tem o B.O.?</h4>
                  <p className="text-gray-600 text-xs leading-relaxed mb-2">
                    Você pode prosseguir e enviar o Boletim posteriormente.
                  </p>
                  <Button
                    onClick={nextStep}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto bg-white border-gray-300 hover:bg-gray-50 h-8 text-xs"
                  >
                    <Clock className="w-3 h-3 mr-1" />
                    Enviar B.O. Depois
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
