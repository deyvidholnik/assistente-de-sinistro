"use client"

import { useState, useEffect, useRef } from "react"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { useForm } from "@/context/form-context"
import { fotoVeiculoSteps } from "@/constants/steps"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function StepFinalizacao() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [numeroSinistro, setNumeroSinistro] = useState<string>('')
  const hasExecutedRef = useRef(false)

  const {
    tipoSinistro,
    documentosFurtados,
    outrosVeiculos,
    cnhData,
    crlvData,
    cnhDataTerceiros,
    crlvDataTerceiros,
    dadosFurtoSemDocumentos,
    documentos,
    documentosTerceiros,
    fotoStepFiles
  } = useForm()

  const handleEnvioSinistro = async () => {
    setIsProcessing(true)
    setError(null)

    try {
      // Preparar dados para envio
      const dadosFormulario = {
        tipoSinistro,
        documentosFurtados,
        outrosVeiculos,
        cnhData,
        crlvData,
        cnhDataTerceiros,
        crlvDataTerceiros,
        dadosFurtoSemDocumentos,
        fotoSteps: fotoVeiculoSteps
      }

      // Criar FormData para envio
      const formData = new FormData()
      formData.append('dados', JSON.stringify(dadosFormulario))

      // Adicionar arquivos CNH próprio
      if (documentos.cnh.length > 0) {
        documentos.cnh.forEach((arquivo, index) => {
          formData.append(`arquivo_cnh_proprio_${index}`, arquivo)
        })
      }

      // Adicionar arquivos CRLV próprio
      if (documentos.crlv.length > 0) {
        documentos.crlv.forEach((arquivo, index) => {
          formData.append(`arquivo_crlv_proprio_${index}`, arquivo)
        })
      }

      // Adicionar arquivos boletim de ocorrência
      if (documentos.boletimOcorrencia.length > 0) {
        documentos.boletimOcorrencia.forEach((arquivo, index) => {
          formData.append(`arquivo_boletim_ocorrencia_${index}`, arquivo)
        })
      }

      // Adicionar arquivos CNH terceiro
      if (documentosTerceiros.cnh.length > 0) {
        documentosTerceiros.cnh.forEach((arquivo, index) => {
          formData.append(`arquivo_cnh_terceiro_${index}`, arquivo)
        })
      }

      // Adicionar arquivos CRLV terceiro
      if (documentosTerceiros.crlv.length > 0) {
        documentosTerceiros.crlv.forEach((arquivo, index) => {
          formData.append(`arquivo_crlv_terceiro_${index}`, arquivo)
        })
      }

      // Adicionar fotos dos steps
      console.log('🖼️ FotoStepFiles disponíveis:', fotoStepFiles)
      Object.keys(fotoStepFiles).forEach(stepId => {
        const files = fotoStepFiles[parseInt(stepId)]
        console.log(`📸 Step ${stepId}:`, files)
        if (files && files.length > 0) {
          files.forEach((arquivo, index) => {
            const chaveArquivo = `arquivo_foto_veiculo_${stepId}_${index}`
            console.log(`➕ Adicionando: ${chaveArquivo}`, arquivo)
            formData.append(chaveArquivo, arquivo)
          })
        }
      })

      // Debug: listar todas as chaves do FormData
      console.log('📋 Todas as chaves do FormData:')
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('arquivo_')) {
          console.log(`  - ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value)
        }
      }

      // Enviar para API
      const response = await fetch('/api/sinistros', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setNumeroSinistro(result.numero_sinistro)
        setIsCompleted(true)
      } else {
        setError(result.error || 'Erro ao enviar sinistro')
      }

    } catch (err) {
      console.error('Erro ao enviar sinistro:', err)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  // Auto-executar envio quando componente carrega (uma única vez)
  useEffect(() => {
    if (!hasExecutedRef.current && !isCompleted && !isProcessing && !error) {
      hasExecutedRef.current = true
      handleEnvioSinistro()
    }
  }, [])

  if (isProcessing) {
    return (
      <div className="text-center space-y-6 sm:space-y-8 px-2">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 animate-spin" />
        </div>
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
            Processando Sinistro...
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Estamos salvando todas as informações e documentos enviados. Isso pode levar alguns segundos.
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center space-y-6 sm:space-y-8 px-2">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
        </div>
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">
            Erro no Envio
          </h2>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
            Ocorreu um erro ao enviar o sinistro. Tente novamente.
          </p>
        </div>
        <Alert className="border-red-200 bg-red-50 mx-2 sm:mx-0">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
        <Button onClick={handleEnvioSinistro} disabled={isProcessing} className="mx-auto">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Tentando novamente...
            </>
          ) : (
            'Tentar Novamente'
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="text-center space-y-6 sm:space-y-8 px-2">
      {/* Ícone de sucesso */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
      </div>

      {/* Título e descrição */}
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">Envio Concluído</h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
          Obrigado por enviar os documentos necessários. Nossa equipe irá analisar as informações e entrar em contato em
          breve.
        </p>
        {numeroSinistro && (
          <div className="bg-blue-50 rounded-lg p-4 mx-2 sm:mx-0">
            <p className="text-sm font-semibold text-blue-800">
              Número do Sinistro: <span className="font-mono text-lg">{numeroSinistro}</span>
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Guarde este número para acompanhar seu processo
            </p>
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      <div className="bg-green-50 rounded-lg p-4 sm:p-6 border border-green-200 mx-2 sm:mx-0">
        <h3 className="font-semibold text-green-800 mb-3 text-sm sm:text-base">Próximos Passos:</h3>
        <ul className="text-xs sm:text-sm text-green-700 space-y-2 text-left">
          <li className="flex items-start">
            <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
            <span>Análise dos documentos enviados</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
            <span>Contato da nossa equipe em até 24 horas</span>
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-2 flex-shrink-0 mt-0.5">✓</span>
            <span>Acompanhamento do processo via WhatsApp</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
