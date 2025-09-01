'use client'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FileText, Camera, Upload, CheckCircle, Eye, Loader2, AlertTriangle } from 'lucide-react'
import { useForm } from '@/context/form-context'
import { FilePreview } from '@/components/file-preview'

export function StepCRLV() {
  const {
    isDocumentingThirdParty,
    crlvData,
    setCrlvData,
    crlvDataTerceiros,
    setCrlvDataTerceiros,
    documentos,
    documentosTerceiros,
    handleFileUpload,
    removeFile,
    isProcessingOCR,
    ocrError,
    hasProcessedCRLV,
    hasProcessedCRLVTerceiros,
  } = useForm()

  const currentCrlvData = isDocumentingThirdParty ? crlvDataTerceiros : crlvData
  const setCurrentCrlvData = isDocumentingThirdParty ? setCrlvDataTerceiros : setCrlvData
  const currentDocumentos = isDocumentingThirdParty ? documentosTerceiros : documentos
  const hasProcessedOCR = isDocumentingThirdParty ? hasProcessedCRLVTerceiros : hasProcessedCRLV

  const hasFile = currentDocumentos.crlv.length > 0
  const isUploadDisabled = (hasFile && !ocrError) || isProcessingOCR

  return (
    <div className='space-y-4 sm:space-y-6'>
      {/* Header compacto */}
      <div className='text-center mb-6 sm:mb-8'>
        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
          <FileText className='w-8 h-8 sm:w-10 sm:h-10 text-green-600' />
        </div>
        <h2 className='text-lg sm:text-2xl font-semibold text-gray-900 mb-2 px-2 leading-tight'>
          Documento do Veículo (CRLV)
        </h2>
        <p className='text-sm sm:text-base text-gray-600 px-4'>
          Fotografe ou envie PDF do CRLV - os dados serão extraídos automaticamente
        </p>
      </div>

      {/* Exemplo compacto para mobile */}
      <div className='bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200 mx-2 sm:mx-0'>
        <h3 className='font-semibold text-green-800 mb-3 sm:mb-4 flex items-center text-sm sm:text-base'>
          <Camera className='w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0' />
          Como Fotografar o CRLV
        </h3>

        {/* Layout responsivo para exemplo */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-center'>
          <div className='order-2 lg:order-1'>
            <img
              src='https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Captura%20de%20tela%202025-07-04%20163219-nd5SC2OCMeBq2fEHwziAIBoHhhGeD5.png'
              alt='Exemplo de CRLV bem fotografado'
              className='w-full rounded-lg border shadow-sm max-h-48 sm:max-h-none object-cover'
            />
          </div>
          <div className='space-y-2 sm:space-y-3 order-1 lg:order-2'>
            <h4 className='font-medium text-green-800 text-sm'>Dicas para uma boa foto:</h4>
            <ul className='space-y-1 sm:space-y-2 text-xs sm:text-sm text-green-700'>
              <li className='flex items-start'>
                <span className='text-green-600 mr-2 flex-shrink-0 mt-0.5'>✓</span>
                <span>Documento completamente visível e plano</span>
              </li>
              <li className='flex items-start'>
                <span className='text-green-600 mr-2 flex-shrink-0 mt-0.5'>✓</span>
                <span>Boa iluminação sem reflexos ou sombras</span>
              </li>
              <li className='flex items-start'>
                <span className='text-green-600 mr-2 flex-shrink-0 mt-0.5'>✓</span>
                <span>Todos os campos e textos legíveis</span>
              </li>
              <li className='flex items-start'>
                <span className='text-green-600 mr-2 flex-shrink-0 mt-0.5'>✓</span>
                <span>Câmera paralela ao documento</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className='space-y-4 px-2 sm:px-0'>
        {/* Opções de upload */}
        <div className='space-y-2 sm:space-y-3'>
          <div className='flex flex-col sm:flex-row gap-2 sm:gap-3'>
            <Button
              type='button'
              onClick={() => !isUploadDisabled && document.getElementById('crlv-file')?.click()}
              className={`flex-1 h-12 sm:h-14 ${
                isUploadDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
              disabled={isUploadDisabled}
            >
              <Upload className='w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0' />
              <div className='text-center'>
                <div className='font-medium text-xs sm:text-sm'>
                  {hasFile && !ocrError ? 'Arquivo Enviado' : hasFile && ocrError ? 'Novo Arquivo' : 'Enviar Arquivo'}
                </div>
                <div className='text-xs opacity-90'>Câmera PDF galeria</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Input para câmera */}
        <input
          id='crlv-camera'
          type='file'
          accept='image/*'
          capture='environment'
          className='hidden'
          onChange={(e) => handleFileUpload('crlv', e.target.files)}
          disabled={isUploadDisabled}
        />

        {/* Input para arquivo/galeria */}
        <input
          id='crlv-file'
          type='file'
          accept='image/*,application/pdf,.pdf'
          className='hidden'
          onChange={(e) => handleFileUpload('crlv', e.target.files)}
          disabled={isUploadDisabled}
        />

        {/* Estados de processamento */}
        {isProcessingOCR && (
          <Alert className='border-yellow-200 bg-yellow-50'>
            <Loader2 className='h-4 w-4 text-yellow-600 animate-spin flex-shrink-0' />
            <AlertDescription className='text-yellow-700 text-sm'>
              <strong>Processando arquivos...</strong>
              <br className='hidden sm:block' />
              <span className='text-xs sm:text-sm'>Aguarde enquanto extraímos os dados.</span>
            </AlertDescription>
          </Alert>
        )}

        {ocrError && (
          <Alert
            variant='destructive'
            className='bg-red-50 border-red-200 text-red-800'
          >
            <AlertTriangle className='h-4 w-4 text-red-800' />
            <AlertDescription className='text-xs sm:text-sm'>
              <strong className='block font-semibold'>Falha na Leitura</strong>
              <span>{ocrError}</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Preview de arquivos - apenas quando não há erro */}
        {currentDocumentos.crlv.length > 0 && !ocrError && (
          <div>
            <h3 className='font-medium text-gray-900 mb-3 flex items-center text-sm sm:text-base'>
              <CheckCircle className='w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 flex-shrink-0' />
              Foto do CRLV Enviada
            </h3>
            <FilePreview
              files={currentDocumentos.crlv}
              onRemove={(index) => removeFile('crlv', index)}
              documentType='crlv'
            />
          </div>
        )}

        {/* Dados extraídos do CRLV via OCR - SÓ APARECE COM SUCESSO */}
        {hasProcessedOCR && (
          <div className='p-4 sm:p-6 bg-green-50 rounded-lg border border-green-200'>
            <h3 className='font-semibold text-green-800 mb-4 flex items-center text-sm sm:text-base'>
              <Eye className='w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0' />
              Dados Extraídos - Confirme ou Edite
            </h3>

            {/* Grid responsivo para formulário */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4'>
              <div>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Placa</Label>
                <Input
                  value={currentCrlvData.placa}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, placa: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>RENAVAM</Label>
                <Input
                  value={currentCrlvData.renavam}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, renavam: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Marca</Label>
                <Input
                  value={currentCrlvData.marca}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, marca: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Modelo</Label>
                <Input
                  value={currentCrlvData.modelo}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, modelo: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Ano Fabricação</Label>
                <Input
                  value={currentCrlvData.anoFabricacao}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, anoFabricacao: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Ano Modelo</Label>
                <Input
                  value={currentCrlvData.anoModelo}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, anoModelo: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Cor</Label>
                <Input
                  value={currentCrlvData.cor}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, cor: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Combustível</Label>
                <Input
                  value={currentCrlvData.combustivel}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, combustivel: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div className='sm:col-span-2'>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Proprietário</Label>
                <Input
                  value={currentCrlvData.proprietario}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, proprietario: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
              <div className='sm:col-span-2'>
                <Label className='text-xs sm:text-sm font-medium text-gray-700 block mb-1'>Chassi</Label>
                <Input
                  value={currentCrlvData.chassi}
                  onChange={(e) => setCurrentCrlvData({ ...currentCrlvData, chassi: e.target.value })}
                  className='bg-white text-gray-800 text-sm h-10 sm:h-11'
                />
              </div>
            </div>
            <p className='text-xs sm:text-sm text-green-700 mt-3 leading-relaxed'>
              ✓ Dados extraídos automaticamente. Você pode editá-los se necessário.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
