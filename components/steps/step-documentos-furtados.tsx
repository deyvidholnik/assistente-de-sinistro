"use client"

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldAlert, FileText, AlertTriangle } from "lucide-react"
import { useForm } from "@/context/form-context"

export function StepDocumentosFurtados() {
  const { setDocumentosFurtados } = useForm()

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-red-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2 leading-tight">Situação dos Documentos</h2>
        <p className="text-base sm:text-lg text-gray-600 px-4 leading-relaxed">
          Os documentos (CNH e CRLV) também foram furtados junto com o veículo?
        </p>
      </div>

      {/* Alert informativo */}
      <Alert className="border-amber-200 bg-amber-50 mx-2 sm:mx-0">
        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <AlertDescription className="text-amber-700 text-sm">
          <strong className="block mb-1">Situação Comum em Furtos e Roubos</strong>É comum que em casos de furto e roubo, os documentos
          do veículo e do condutor também sejam levados. Selecione sua situação abaixo.
        </AlertDescription>
      </Alert>

      {/* Botões de seleção */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 px-2 sm:px-0">
        {/* Botão - Tenho os documentos */}
        <Button
          variant="outline"
          onClick={() => setDocumentosFurtados(false)}
          className="h-24 sm:h-28 flex flex-col items-center justify-center space-y-3 text-center border-2 border-green-300 hover:border-green-400 hover:bg-green-50 bg-white transition-all duration-200"
        >
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-base sm:text-lg text-green-600 mb-1">TENHO OS DOCUMENTOS</div>
            <div className="text-xs sm:text-sm text-gray-600 leading-tight">
              Possuo CNH e CRLV para fotografar e enviar
            </div>
          </div>
        </Button>

        {/* Botão - Documentos também foram furtados */}
        <Button
          variant="outline"
          onClick={() => setDocumentosFurtados(true)}
          className="h-24 sm:h-28 flex flex-col items-center justify-center space-y-3 text-center border-2 border-red-300 hover:border-red-400 hover:bg-red-50 bg-white transition-all duration-200"
        >
          <ShieldAlert className="w-10 h-10 sm:w-12 sm:h-12 text-red-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-base sm:text-lg text-red-600 mb-1">NÃO TENHO OS DOCUMENTOS</div>
            <div className="text-xs sm:text-sm text-gray-600 leading-tight">
              CNH e/ou CRLV também foram levados
            </div>
          </div>
        </Button>
      </div>

      {/* Informação adicional */}
      <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200 mx-2 sm:mx-0">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 text-sm sm:text-base mb-1">Não se preocupe</h4>
            <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
              Independente da sua situação, nossa equipe está preparada para auxiliá-lo no processo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
