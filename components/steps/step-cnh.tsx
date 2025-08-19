"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Upload, AlertCircle, CheckCircle, Eye, Loader2, AlertTriangle, Camera } from "lucide-react"
import { useForm } from "@/context/form-context"
import { FilePreview } from "@/components/file-preview"

export function StepCNH() {
  const {
    isDocumentingThirdParty,
    cnhData,
    setCnhData,
    cnhDataTerceiros,
    setCnhDataTerceiros,
    documentos,
    documentosTerceiros,
    handleFileUpload,
    removeFile,
    isProcessingOCR,
    ocrError,
    hasProcessedCNH,
    hasProcessedCNHTerceiros,
  } = useForm()

  const currentCnhData = isDocumentingThirdParty ? cnhDataTerceiros : cnhData
  const setCurrentCnhData = isDocumentingThirdParty ? setCnhDataTerceiros : setCnhData
  const currentDocumentos = isDocumentingThirdParty ? documentosTerceiros : documentos
  const hasProcessedOCR = isDocumentingThirdParty ? hasProcessedCNHTerceiros : hasProcessedCNH

  const hasFile = currentDocumentos.cnh.length > 0
  const isUploadDisabled = hasFile || isProcessingOCR

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header compacto */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
          <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
        </div>
        <h2 className="text-base sm:text-xl font-semibold text-gray-900 mb-1 px-2 leading-tight">
          Carteira Nacional de Habilitação
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 px-4">
          Fotografe ou envie PDF da sua CNH - os dados serão extraídos automaticamente
        </p>
      </div>

      {/* Alert compacto */}
      <Alert className="border-blue-200 bg-blue-50 mx-1 sm:mx-0">
        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <AlertDescription className="text-blue-700 text-xs sm:text-sm">
          <strong className="block mb-1">Dicas para melhor extração:</strong>
          <ul className="text-xs space-y-0.5 list-disc list-inside">
            <li>Local bem iluminado</li>
            <li>CNH plana e sem dobras</li>
            <li>Texto legível e sem reflexos</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Exemplo de foto */}
      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200 mx-1 sm:mx-0">
        <h3 className="font-semibold text-blue-800 mb-2 sm:mb-3 flex items-center text-xs sm:text-sm">
          <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
          Exemplo de Foto
        </h3>
        <div className="flex justify-center">
          <img
            src="/images/cnh-exemplo.png"
            alt="Exemplo de CNH bem fotografada"
            className="w-full max-w-md rounded-lg border shadow-sm object-contain"
          />
        </div>
      </div>

      <div className="space-y-3 px-1 sm:px-0">
        {/* Botão de upload único */}
        <div className="flex justify-center">
          <Button
            type="button"
            onClick={() => !isUploadDisabled && document.getElementById("cnh-upload")?.click()}
            className={`w-full max-w-sm h-12 sm:h-14 ${
              isUploadDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
            disabled={isUploadDisabled}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
            <div className="text-center">
              <div className="font-medium text-xs sm:text-sm">{hasFile ? "Arquivo Enviado" : "Enviar CNH"}</div>
              <div className="text-xs opacity-90">{hasFile ? "Delete para trocar" : "Câmera ou PDF"}</div>
            </div>
          </Button>
        </div>

        <input
          id="cnh-upload"
          type="file"
          accept="image/*,application/pdf,.pdf"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileUpload("cnh", e.target.files)}
          disabled={isUploadDisabled}
        />

        {/* Estados de processamento */}
        {isProcessingOCR && (
          <Alert className="border-yellow-200 bg-yellow-50">
            <Loader2 className="h-3 w-3 sm:h-4 sm:h-4 text-yellow-600 animate-spin flex-shrink-0" />
            <AlertDescription className="text-yellow-700 text-xs sm:text-sm">
              <strong>Processando documento...</strong>
              <span className="block text-xs">Aguarde enquanto processamos os dados da sua CNH.</span>
            </AlertDescription>
          </Alert>
        )}

        {ocrError && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
            <AlertTriangle className="h-4 w-4 text-red-800" />
            <AlertDescription className="text-xs sm:text-sm">
              <strong className="block font-semibold">Falha na Leitura</strong>
              <span>{ocrError}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview de arquivos */}
        {currentDocumentos.cnh.length > 0 && !ocrError && (
          <div>
            <h3 className="font-medium text-gray-900 mb-2 flex items-center text-xs sm:text-sm">
              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-1 sm:mr-2 flex-shrink-0" />
              Foto da CNH Enviada
            </h3>
            <FilePreview files={currentDocumentos.cnh} onRemove={(index) => removeFile("cnh", index)} />
          </div>
        )}

        {/* Formulário compacto - SÓ APARECE COM SUCESSO NO OCR */}
        {hasProcessedOCR && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-3 flex items-center text-xs sm:text-sm">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              Dados Processados - Confira os dados antes de prosseguir
            </h3>

            {/* Grid responsivo compacto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              <div className="sm:col-span-2">
                <Label className="text-xs font-medium text-gray-700 block mb-1">Nome Completo *</Label>
                <Input
                  value={currentCnhData.nome}
                  onChange={(e) => setCurrentCnhData({ ...currentCnhData, nome: e.target.value })}
                  className="bg-white text-xs sm:text-sm h-8 sm:h-9"
                  placeholder="Digite o nome completo"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 block mb-1">CPF *</Label>
                <Input
                  value={currentCnhData.cpf}
                  onChange={(e) => setCurrentCnhData({ ...currentCnhData, cpf: e.target.value })}
                  className="bg-white text-xs sm:text-sm h-8 sm:h-9"
                  placeholder="000.000.000-00"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 block mb-1">RG</Label>
                <Input
                  value={currentCnhData.rg}
                  onChange={(e) => setCurrentCnhData({ ...currentCnhData, rg: e.target.value })}
                  className="bg-white text-xs sm:text-sm h-8 sm:h-9"
                  placeholder="Digite o RG"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 block mb-1">Data de Nascimento *</Label>
                <Input
                  type="date"
                  value={currentCnhData.dataNascimento}
                  onChange={(e) => setCurrentCnhData({ ...currentCnhData, dataNascimento: e.target.value })}
                  className="bg-white text-xs sm:text-sm h-8 sm:h-9"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 block mb-1">Categoria</Label>
                <Input
                  value={currentCnhData.categoria}
                  onChange={(e) => setCurrentCnhData({ ...currentCnhData, categoria: e.target.value })}
                  className="bg-white text-xs sm:text-sm h-8 sm:h-9"
                  placeholder="A, B, C, D, E"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-700 block mb-1">Número de Registro *</Label>
                <Input
                  value={currentCnhData.numeroRegistro}
                  onChange={(e) => setCurrentCnhData({ ...currentCnhData, numeroRegistro: e.target.value })}
                  className="bg-white text-xs sm:text-sm h-8 sm:h-9"
                  placeholder="Digite o número"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <Label className="text-xs font-medium text-gray-700 block mb-1">Data de Vencimento</Label>
                <Input
                  type="date"
                  value={currentCnhData.dataVencimento}
                  onChange={(e) => setCurrentCnhData({ ...currentCnhData, dataVencimento: e.target.value })}
                  className="bg-white text-xs sm:text-sm h-8 sm:h-9"
                />
              </div>
            </div>

            <p className="text-xs text-green-700 mt-2 leading-relaxed">
              ✓ Dados extraídos automaticamente. Você pode editá-los se necessário.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
