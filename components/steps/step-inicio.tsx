"use client"
import { Shield, CreditCard, FileText, Car } from "lucide-react"

export function StepInicio() {
  return (
    <div className="text-center space-y-6 px-2">
      {/* Hero Icon - Menor em mobile */}
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
        <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600" />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 leading-tight">Envio de Documentos</h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed px-4">
          Para processar seu sinistro, precisamos que você envie fotos dos seguintes documentos.
        </p>

        {/* Cards responsivos - Stack em mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 px-2">
          <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-100">
            <CreditCard className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">CNH</h3>
            <p className="text-xs sm:text-sm text-gray-600">Carteira de Habilitação</p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-green-50 rounded-lg border border-green-100">
            <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">CRLV</h3>
            <p className="text-xs sm:text-sm text-gray-600">Documento do Veículo</p>
          </div>
          <div className="text-center p-4 sm:p-6 bg-orange-50 rounded-lg border border-orange-100">
            <Car className="w-8 h-8 sm:w-12 sm:h-12 text-orange-600 mx-auto mb-2 sm:mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Fotos</h3>
            <p className="text-xs sm:text-sm text-gray-600">Imagens dos veículos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
