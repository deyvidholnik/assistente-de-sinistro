"use client"

import { Button } from "@/components/ui/button"
import { Users, Car, CheckCircle2, XCircle } from "lucide-react"
import { useForm } from "@/context/form-context"

export function StepTerceiros() {
  const { outrosVeiculos, setOutrosVeiculos } = useForm()

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header com design melhorado */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2 leading-tight">
          Outros Veículos Envolvidos
        </h2>
        <p className="text-base sm:text-lg text-gray-600 px-4 leading-relaxed">
          Houve outros veículos envolvidos na colisão?
        </p>
      </div>

      {/* Card com pergunta destacada */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 sm:p-8 border border-purple-200 mx-2 sm:mx-0 shadow-sm">
        <div className="text-center mb-6">
          <Car className="w-12 h-12 sm:w-16 sm:h-16 text-purple-600 mx-auto mb-4" />
        
          <p className="text-sm sm:text-base text-purple-700 leading-relaxed">
            Esta informação é importante para determinar os próximos passos
          </p>
        </div>

        {/* Botões de seleção redesenhados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Botão NÃO */}
          <Button
            variant="outline"
            onClick={() => setOutrosVeiculos(false)}
            className={`h-20 sm:h-24 flex flex-col items-center justify-center space-y-2 sm:space-y-3 text-center border-2 transition-all duration-200 ${
              outrosVeiculos === false
                ? "bg-green-500 hover:bg-green-600 text-white border-green-500 shadow-lg transform scale-105"
                : "border-gray-300 hover:border-green-400 hover:bg-green-50 bg-white"
            }`}
          >
            <CheckCircle2
              className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ${
                outrosVeiculos === false ? "text-white" : "text-green-500"
              }`}
            />
            <div>
              <div
                className={`font-bold text-base sm:text-lg ${
                  outrosVeiculos === false ? "text-white" : "text-green-600"
                }`}
              >
                NÃO
              </div>
              <div
                className={`text-xs sm:text-sm leading-tight ${
                  outrosVeiculos === false ? "text-green-100" : "text-gray-600"
                }`}
              >
                Apenas meu veículo foi danificado
              </div>
            </div>
          </Button>

          {/* Botão SIM */}
          <Button
            variant="outline"
            onClick={() => setOutrosVeiculos(true)}
            className={`h-20 sm:h-24 flex flex-col items-center justify-center space-y-2 sm:space-y-3 text-center border-2 transition-all duration-200 ${
              outrosVeiculos === true
                ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500 shadow-lg transform scale-105"
                : "border-gray-300 hover:border-orange-400 hover:bg-orange-50 bg-white"
            }`}
          >
            <XCircle
              className={`w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 ${
                outrosVeiculos === true ? "text-white" : "text-orange-500"
              }`}
            />
            <div>
              <div
                className={`font-bold text-base sm:text-lg ${
                  outrosVeiculos === true ? "text-white" : "text-orange-600"
                }`}
              >
                SIM
              </div>
              <div
                className={`text-xs sm:text-sm leading-tight ${
                  outrosVeiculos === true ? "text-orange-100" : "text-gray-600"
                }`}
              >
                Outros veículos também foram danificados
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Informação adicional baseada na seleção */}
      {outrosVeiculos !== null && (
        <div
          className={`rounded-lg p-4 sm:p-6 mx-2 sm:mx-0 border-l-4 ${
            outrosVeiculos ? "bg-orange-50 border-orange-400" : "bg-green-50 border-green-400"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                outrosVeiculos ? "bg-orange-100" : "bg-green-100"
              }`}
            >
              {outrosVeiculos ? (
                <XCircle className="w-4 h-4 text-orange-600" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold text-sm sm:text-base mb-1 ${
                  outrosVeiculos ? "text-orange-800" : "text-green-800"
                }`}
              >
                {outrosVeiculos ? "Terceiros Envolvidos" : "Sem Terceiros"}
              </h4>
              <p
                className={`text-xs sm:text-sm leading-relaxed ${
                  outrosVeiculos ? "text-orange-700" : "text-green-700"
                }`}
              >
                {outrosVeiculos
                  ? "Você será direcionado para documentar os veículos de terceiros envolvidos no acidente."
                  : "Você será direcionado para a finalização do processo de documentação."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dica adicional */}
      <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200 mx-2 sm:mx-0">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-800 text-sm sm:text-base mb-1">Dica Importante</h4>
            <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
              Considere como "terceiros" qualquer outro veículo que tenha sofrido danos no acidente, mesmo que seja de
              propriedade de conhecidos ou familiares.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
