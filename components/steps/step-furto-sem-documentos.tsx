"use client"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { useForm } from "@/context/form-context"
import { validarCPF, formatarCPF, validarPlaca, formatarPlaca } from "@/lib/validations"

export function StepFurtoSemDocumentos() {
  const { dadosFurtoSemDocumentos, setDadosFurtoSemDocumentos, nextStep, canProceed } = useForm()
  const [erros, setErros] = useState<{ [key: string]: string }>({})
  const [isProcessing, setIsProcessing] = useState(false)

  const handleNomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setDadosFurtoSemDocumentos({ ...dadosFurtoSemDocumentos, nomeCompleto: value })
    
    // Validação simples para nome
    if (value.trim().length < 2) {
      setErros(prev => ({ ...prev, nome: "Nome deve ter pelo menos 2 caracteres" }))
    } else {
      setErros(prev => ({ ...prev, nome: "" }))
    }
  }

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const formattedValue = formatarCPF(value)
    setDadosFurtoSemDocumentos({ ...dadosFurtoSemDocumentos, cpf: formattedValue })
    
    // Validação de CPF
    if (formattedValue.length === 14) {
      if (validarCPF(formattedValue)) {
        setErros(prev => ({ ...prev, cpf: "" }))
      } else {
        setErros(prev => ({ ...prev, cpf: "CPF inválido" }))
      }
    } else if (formattedValue.length > 0) {
      setErros(prev => ({ ...prev, cpf: "CPF incompleto" }))
    } else {
      setErros(prev => ({ ...prev, cpf: "" }))
    }
  }

  const handlePlacaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase()
    const formattedValue = formatarPlaca(value)
    setDadosFurtoSemDocumentos({ ...dadosFurtoSemDocumentos, placaVeiculo: formattedValue })
    
    // Validação de placa
    if (formattedValue.length >= 7) {
      if (validarPlaca(formattedValue)) {
        setErros(prev => ({ ...prev, placa: "" }))
      } else {
        setErros(prev => ({ ...prev, placa: "Placa inválida" }))
      }
    } else if (formattedValue.length > 0) {
      setErros(prev => ({ ...prev, placa: "Placa incompleta" }))
    } else {
      setErros(prev => ({ ...prev, placa: "" }))
    }
  }

  const handleSubmit = async () => {
    setIsProcessing(true)
    
    // Simula um pequeno delay para feedback visual
    await new Promise(resolve => setTimeout(resolve, 500))
    
    nextStep()
    setIsProcessing(false)
  }

  const isFormValid = canProceed()
  const hasValidCPF = dadosFurtoSemDocumentos.cpf.length === 14 && validarCPF(dadosFurtoSemDocumentos.cpf)
  const hasValidPlaca = dadosFurtoSemDocumentos.placaVeiculo.length >= 7 && validarPlaca(dadosFurtoSemDocumentos.placaVeiculo)
  const hasValidNome = dadosFurtoSemDocumentos.nomeCompleto.trim().length >= 2

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2 leading-tight">
          Documentos Também Furtados
        </h2>
        <p className="text-base sm:text-lg text-gray-600 px-4 leading-relaxed">
          Preencha as informações básicas para prosseguir com o processo
        </p>
      </div>

      {/* Alert informativo */}
      <Alert className="border-red-200 bg-red-50 mx-2 sm:mx-0">
        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
        <AlertDescription className="text-red-700 text-sm">
          <strong className="block mb-1">Situação Especial</strong>
          Entendemos que em casos de furto, os documentos também podem ter sido levados. Por isso, solicitamos
          apenas as informações básicas que você consegue fornecer.
        </AlertDescription>
      </Alert>

      {/* Formulário */}
      <div className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 mx-2 sm:mx-0 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Informações Básicas</h3>

        <div className="space-y-4 sm:space-y-5">
          {/* Nome Completo */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2 flex items-center">
              Nome Completo *
              {hasValidNome && (
                <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
              )}
            </Label>
            <Input
              value={dadosFurtoSemDocumentos.nomeCompleto}
              onChange={handleNomeChange}
              className={`bg-white text-sm h-11 sm:h-12 ${
                erros.nome ? 'border-red-300 focus:border-red-500' : 
                hasValidNome ? 'border-green-300 focus:border-green-500' : ''
              }`}
              placeholder="Digite seu nome completo"
              required
            />
            {erros.nome && (
              <div className="flex items-center mt-1 text-red-600 text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                {erros.nome}
              </div>
            )}
          </div>

          {/* CPF */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2 flex items-center">
              CPF *
              {hasValidCPF && (
                <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
              )}
            </Label>
            <Input
              value={dadosFurtoSemDocumentos.cpf}
              onChange={handleCpfChange}
              className={`bg-white text-sm h-11 sm:h-12 ${
                erros.cpf ? 'border-red-300 focus:border-red-500' : 
                hasValidCPF ? 'border-green-300 focus:border-green-500' : ''
              }`}
              placeholder="000.000.000-00"
              maxLength={14}
              required
            />
            {erros.cpf && (
              <div className="flex items-center mt-1 text-red-600 text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                {erros.cpf}
              </div>
            )}
          </div>

          {/* Placa do Veículo */}
          <div>
            <Label className="text-sm font-medium text-gray-700 block mb-2 flex items-center">
              Placa do Veículo *
              {hasValidPlaca && (
                <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
              )}
            </Label>
            <Input
              value={dadosFurtoSemDocumentos.placaVeiculo}
              onChange={handlePlacaChange}
              className={`bg-white text-sm h-11 sm:h-12 ${
                erros.placa ? 'border-red-300 focus:border-red-500' : 
                hasValidPlaca ? 'border-green-300 focus:border-green-500' : ''
              }`}
              placeholder="ABC-1234 ou ABC1D23"
              maxLength={8}
              required
            />
            {erros.placa && (
              <div className="flex items-center mt-1 text-red-600 text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                {erros.placa}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Aceita formato antigo (ABC-1234) ou Mercosul (ABC1D23)
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mt-4 leading-relaxed">
          * Campos obrigatórios. Essas informações são suficientes para iniciar o processo de análise do seu sinistro.
        </p>
      </div>

      {/* Botão Prosseguir */}
      {isFormValid && (
        <div className="flex justify-center px-2 sm:px-0">
          <Button
            onClick={handleSubmit}
            disabled={isProcessing}
            className="w-full max-w-md bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 text-sm sm:text-base"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processando...
              </>
            ) : (
              "Prosseguir"
            )}
          </Button>
        </div>
      )}

      {/* Informação adicional */}
      <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200 mx-2 sm:mx-0">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 text-sm sm:text-base mb-1">Próximos Passos</h4>
            <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
              Após o envio, nossa equipe entrará em contato para auxiliar na obtenção dos documentos necessários e dar
              continuidade ao processo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
