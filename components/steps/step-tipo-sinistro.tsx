"use client"

import { Button } from "@/components/ui/button"
import { Car, ShieldAlert, AlertTriangle, FileText } from "lucide-react"
import { useForm } from "@/context/form-context"

export function StepTipoSinistro() {
  const { tipoSinistro, setTipoSinistro } = useForm()

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2 leading-tight">Tipo de Sinistro</h2>
        <p className="text-base sm:text-lg text-gray-600 px-4 leading-relaxed">
          Selecione o tipo de ocorrência para personalizar o processo
        </p>
      </div>

      {/* Botões de seleção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-0">
        {/* Botão Colisão */}
        <Button
          variant="outline"
          onClick={() => setTipoSinistro("colisao")}
          className={`h-32 sm:h-36 flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center border-2 transition-all duration-200 ${
            tipoSinistro === "colisao"
              ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-lg transform scale-105"
              : "border-gray-300 hover:border-orange-400 hover:bg-orange-50 bg-white"
          }`}
        >
          <Car
            className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 ${
              tipoSinistro === "colisao" ? "text-white" : "text-orange-500"
            }`}
          />
          <div>
            <div
              className={`font-bold text-lg sm:text-xl mb-1 ${
                tipoSinistro === "colisao" ? "text-white" : "text-orange-600"
              }`}
            >
              COLISÃO
            </div>
            <div
              className={`text-sm sm:text-base leading-tight ${
                tipoSinistro === "colisao" ? "text-orange-100" : "text-gray-600"
              }`}
            >
              Acidente de trânsito com danos ao veículo
            </div>
          </div>
        </Button>

        {/* Botão Furto */}
        <Button
          variant="outline"
          onClick={() => setTipoSinistro("furto")}
          className={`h-32 sm:h-36 flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center border-2 transition-all duration-200 ${
            tipoSinistro === "furto"
              ? "bg-red-500 hover:bg-red-600 text-white border-red-500 shadow-lg transform scale-105"
              : "border-gray-300 hover:border-red-400 hover:bg-red-50 bg-white"
          }`}
        >
          <ShieldAlert
            className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 ${
              tipoSinistro === "furto" ? "text-white" : "text-red-500"
            }`}
          />
          <div>
            <div
              className={`font-bold text-lg sm:text-xl mb-1 ${
                tipoSinistro === "furto" ? "text-white" : "text-red-600"
              }`}
            >
              FURTO
            </div>
            <div
              className={`text-sm sm:text-base leading-tight ${
                tipoSinistro === "furto" ? "text-red-100" : "text-gray-600"
              }`}
            >
              Roubo ou furto do veículo
            </div>
          </div>
        </Button>
      </div>

      {/* Informação adicional baseada na seleção */}
      {tipoSinistro && (
        <div
          className={`rounded-lg p-4 sm:p-6 mx-2 sm:mx-0 border-l-4 ${
            tipoSinistro === "furto" ? "bg-red-50 border-red-400" : "bg-orange-50 border-orange-400"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                tipoSinistro === "furto" ? "bg-red-100" : "bg-orange-100"
              }`}
            >
              {tipoSinistro === "furto" ? (
                <ShieldAlert className="w-4 h-4 text-red-600" />
              ) : (
                <Car className="w-4 h-4 text-orange-600" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold text-sm sm:text-base mb-2 ${
                  tipoSinistro === "furto" ? "text-red-800" : "text-orange-800"
                }`}
              >
                {tipoSinistro === "furto" ? "Documentação para Furto" : "Documentação para Colisão"}
              </h4>

              {tipoSinistro === "furto" ? (
                <div className="space-y-2">
                  <p className="text-red-700 text-xs sm:text-sm leading-relaxed">
                    Para casos de furto, você precisará enviar:
                  </p>
                  <ul className="text-red-700 text-xs sm:text-sm space-y-1 ml-4">
                    <li>• Foto da CNH do condutor</li>
                    <li>• Foto do CRLV do veículo</li>
                  </ul>
                  <p className="text-red-700 text-xs sm:text-sm leading-relaxed font-medium">
                    ⚠️ Lembre-se de registrar o Boletim de Ocorrência na delegacia.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-orange-700 text-xs sm:text-sm leading-relaxed">
                    Para casos de colisão, você precisará enviar:
                  </p>
                  <ul className="text-orange-700 text-xs sm:text-sm space-y-1 ml-4">
                    <li>• Foto da CNH do condutor</li>
                    <li>• Foto do CRLV do veículo</li>
                    <li>• Fotos detalhadas dos danos</li>
                    <li>• Documentos de terceiros (se houver)</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dica adicional */}
      <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200 mx-2 sm:mx-0">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 text-sm sm:text-base mb-1">Importante</h4>
            <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
              Certifique-se de selecionar o tipo correto de sinistro. Isso determinará quais documentos serão
              solicitados no processo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
