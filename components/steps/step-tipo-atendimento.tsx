"use client"

import { Button } from "@/components/ui/button"
import { FileText, Headphones, AlertTriangle } from "lucide-react"
import { useForm } from "@/context/form-context"

export function StepTipoAtendimento() {
  const { tipoAtendimento, setTipoAtendimento } = useForm()

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2 leading-tight">
          Como podemos ajudar?
        </h2>
        <p className="text-base sm:text-lg text-gray-600 px-4 leading-relaxed">
          Selecione o tipo de atendimento que você precisa
        </p>
      </div>

      {/* Botões de seleção */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 px-2 sm:px-0">
        {/* Botão Sinistro */}
        <Button
          variant="outline"
          onClick={() => setTipoAtendimento("sinistro")}
          className={`h-40 sm:h-48 flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center border-2 transition-all duration-200 ${
            tipoAtendimento === "sinistro"
              ? "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-lg transform scale-105"
              : "border-gray-300 hover:border-red-400 hover:bg-red-50 bg-white"
          }`}
        >
          <FileText
            className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 ${
              tipoAtendimento === "sinistro" ? "text-white" : "text-red-600"
            }`}
          />
          <div>
            <div
              className={`font-bold text-lg sm:text-xl mb-2 ${
                tipoAtendimento === "sinistro" ? "text-white" : "text-red-600"
              }`}
            >
              SINISTRO
            </div>
            <div
              className={`text-sm leading-relaxed px-2 ${
                tipoAtendimento === "sinistro" ? "text-red-100" : "text-gray-600"
              }`}
            >
              Reportar acidente, furto, roubo ou pequenos reparos
            </div>
          </div>
        </Button>

        {/* Botão Assistência */}
        <Button
          variant="outline"
          onClick={() => setTipoAtendimento("assistencia")}
          className={`h-40 sm:h-48 flex flex-col items-center justify-center space-y-3 sm:space-y-4 text-center border-2 transition-all duration-200 ${
            tipoAtendimento === "assistencia"
              ? "bg-green-600 hover:bg-green-700 text-white border-green-600 shadow-lg transform scale-105"
              : "border-gray-300 hover:border-green-400 hover:bg-green-50 bg-white"
          }`}
        >
          <Headphones
            className={`w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 ${
              tipoAtendimento === "assistencia" ? "text-white" : "text-green-600"
            }`}
          />
          <div>
            <div
              className={`font-bold text-lg sm:text-xl mb-2 ${
                tipoAtendimento === "assistencia" ? "text-white" : "text-green-600"
              }`}
            >
              ASSISTÊNCIA
            </div>
            <div
              className={`text-sm leading-relaxed px-2 ${
                tipoAtendimento === "assistencia" ? "text-green-100" : "text-gray-600"
              }`}
            >
              Solicitar guincho, pane, hotel, táxi ou troca de pneu
            </div>
          </div>
        </Button>
      </div>

      {/* Informação adicional baseada na seleção */}
      {tipoAtendimento && (
        <div
          className={`rounded-lg p-4 sm:p-6 mx-2 sm:mx-0 border-l-4 ${
            tipoAtendimento === "sinistro" 
              ? "bg-red-50 border-red-400" 
              : "bg-green-50 border-green-400"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                tipoAtendimento === "sinistro" 
                  ? "bg-red-100" 
                  : "bg-green-100"
              }`}
            >
              {tipoAtendimento === "sinistro" ? (
                <FileText className="w-4 h-4 text-red-600" />
              ) : (
                <Headphones className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold text-sm sm:text-base mb-2 ${
                  tipoAtendimento === "sinistro" 
                    ? "text-red-800" 
                    : "text-green-800"
                }`}
              >
                {tipoAtendimento === "sinistro" 
                  ? "Reportar Sinistro" 
                  : "Solicitar Assistência"}
              </h4>

              {tipoAtendimento === "sinistro" ? (
                <div className="space-y-2">
                  <p className="text-red-700 text-xs sm:text-sm leading-relaxed">
                    Você será direcionado para reportar:
                  </p>
                  <ul className="text-red-700 text-xs sm:text-sm space-y-1 ml-4">
                    <li>• Colisão (acidente entre veículos)</li>
                    <li>• Furto (veículo levado sem confronto)</li>
                    <li>• Roubo (veículo levado mediante ameaça)</li>
                    <li>• Pequenos reparos (danos menores)</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-green-700 text-xs sm:text-sm leading-relaxed">
                    Serviços de assistência disponíveis:
                  </p>
                  <ul className="text-green-700 text-xs sm:text-sm space-y-1 ml-4">
                    <li>• Guincho (reboque do veículo)</li>
                    <li>• Pane seca, mecânica ou elétrica</li>
                    <li>• Troca de pneu</li>
                    <li>• Hospedagem de emergência</li>
                    <li>• Transporte alternativo (táxi)</li>
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
              Escolha "Sinistro" para reportar danos ou perda do veículo. 
              Escolha "Assistência" se você precisa de ajuda imediata na estrada.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 