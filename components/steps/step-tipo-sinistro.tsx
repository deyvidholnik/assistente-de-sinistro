"use client"

import { Button } from "@/components/ui/button"
import { Car, ShieldAlert, AlertTriangle, FileText, Sword, Wrench } from "lucide-react"
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
          className={`h-32 sm:h-36 flex flex-col items-center justify-center space-y-2 sm:space-y-3 text-center border-2 transition-all duration-200 ${
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
              className={`font-bold text-base sm:text-lg mb-1 ${
                tipoSinistro === "colisao" ? "text-white" : "text-orange-600"
              }`}
            >
              COLISÃO
            </div>
            <div
              className={`text-xs leading-tight px-1 ${
                tipoSinistro === "colisao" ? "text-orange-100" : "text-gray-600"
              }`}
            >
              Acidente entre veículos ou objetos
            </div>
          </div>
        </Button>

        {/* Botão Furto */}
        <Button
          variant="outline"
          onClick={() => setTipoSinistro("furto")}
          className={`h-32 sm:h-36 flex flex-col items-center justify-center space-y-2 sm:space-y-3 text-center border-2 transition-all duration-200 ${
            tipoSinistro === "furto"
              ? "bg-purple-500 hover:bg-purple-600 text-white border-purple-500 shadow-lg transform scale-105"
              : "border-gray-300 hover:border-purple-400 hover:bg-purple-50 bg-white"
          }`}
        >
          <ShieldAlert
            className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 ${
              tipoSinistro === "furto" ? "text-white" : "text-purple-500"
            }`}
          />
          <div>
            <div
              className={`font-bold text-base sm:text-lg mb-1 ${
                tipoSinistro === "furto" ? "text-white" : "text-purple-600"
              }`}
            >
              FURTO
            </div>
            <div
              className={`text-xs leading-tight px-1 ${
                tipoSinistro === "furto" ? "text-purple-100" : "text-gray-600"
              }`}
            >
              Veículo levado sem confronto direto
            </div>
          </div>
        </Button>

        {/* Botão Roubo */}
        <Button
          variant="outline"
          onClick={() => setTipoSinistro("roubo")}
          className={`h-32 sm:h-36 flex flex-col items-center justify-center space-y-2 sm:space-y-3 text-center border-2 transition-all duration-200 ${
            tipoSinistro === "roubo"
              ? "bg-red-600 hover:bg-red-700 text-white border-red-600 shadow-lg transform scale-105"
              : "border-gray-300 hover:border-red-400 hover:bg-red-50 bg-white"
          }`}
        >
          <Sword
            className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 ${
              tipoSinistro === "roubo" ? "text-white" : "text-red-600"
            }`}
          />
          <div>
            <div
              className={`font-bold text-base sm:text-lg mb-1 ${
                tipoSinistro === "roubo" ? "text-white" : "text-red-600"
              }`}
            >
              ROUBO
            </div>
            <div
              className={`text-xs leading-tight px-1 ${
                tipoSinistro === "roubo" ? "text-red-100" : "text-gray-600"
              }`}
            >
              Veículo levado mediante ameaça
            </div>
          </div>
        </Button>

        {/* Botão Pequenos Reparos */}
        <Button
          variant="outline"
          onClick={() => setTipoSinistro("pequenos_reparos")}
          className={`h-32 sm:h-36 flex flex-col items-center justify-center space-y-2 sm:space-y-3 text-center border-2 transition-all duration-200 ${
            tipoSinistro === "pequenos_reparos"
              ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600 shadow-lg transform scale-105"
              : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 bg-white"
          }`}
        >
          <Wrench
            className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 ${
              tipoSinistro === "pequenos_reparos" ? "text-white" : "text-blue-600"
            }`}
          />
          <div>
            <div
              className={`font-bold text-base sm:text-lg mb-1 ${
                tipoSinistro === "pequenos_reparos" ? "text-white" : "text-blue-600"
              }`}
            >
              PEQUENOS REPAROS
            </div>
            <div
              className={`text-xs leading-tight px-1 ${
                tipoSinistro === "pequenos_reparos" ? "text-blue-100" : "text-gray-600"
              }`}
            >
              Danos menores e riscos
            </div>
          </div>
        </Button>
      </div>

      {/* Informação adicional baseada na seleção */}
      {tipoSinistro && (
        <div
          className={`rounded-lg p-4 sm:p-6 mx-2 sm:mx-0 border-l-4 ${
            tipoSinistro === "furto" 
              ? "bg-purple-50 border-purple-400" 
              : tipoSinistro === "roubo"
              ? "bg-red-50 border-red-400"
              : tipoSinistro === "pequenos_reparos"
              ? "bg-blue-50 border-blue-400"
              : "bg-orange-50 border-orange-400"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                tipoSinistro === "furto" 
                  ? "bg-purple-100" 
                  : tipoSinistro === "roubo"
                  ? "bg-red-100"
                  : tipoSinistro === "pequenos_reparos"
                  ? "bg-blue-100"
                  : "bg-orange-100"
              }`}
            >
              {tipoSinistro === "furto" ? (
                <ShieldAlert className="w-4 h-4 text-purple-600" />
              ) : tipoSinistro === "roubo" ? (
                <Sword className="w-4 h-4 text-red-600" />
              ) : tipoSinistro === "pequenos_reparos" ? (
                <Wrench className="w-4 h-4 text-blue-600" />
              ) : (
                <Car className="w-4 h-4 text-orange-600" />
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold text-sm sm:text-base mb-2 ${
                  tipoSinistro === "furto" 
                    ? "text-purple-800" 
                    : tipoSinistro === "roubo"
                    ? "text-red-800"
                    : tipoSinistro === "pequenos_reparos"
                    ? "text-blue-800"
                    : "text-orange-800"
                }`}
              >
                {tipoSinistro === "furto" 
                  ? "Documentação para Furto" 
                  : tipoSinistro === "roubo"
                  ? "Documentação para Roubo"
                  : tipoSinistro === "pequenos_reparos"
                  ? "Documentação para Pequenos Reparos"
                  : "Documentação para Colisão"}
              </h4>

              {tipoSinistro === "furto" ? (
                <div className="space-y-2">
                  <div className="bg-purple-100 p-3 rounded-md mb-3">
                    <p className="text-purple-800 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      O que é FURTO?
                    </p>
                    <p className="text-purple-700 text-xs leading-relaxed">
                      Veículo levado sem confronto direto com o proprietário. 
                      Ex: veículo deixado destrancado, chaves esquecidas, arrombamento na ausência do dono.
                    </p>
                  </div>
                  <p className="text-purple-700 text-xs sm:text-sm leading-relaxed">
                    Para casos de furto, você precisará enviar:
                  </p>
                  <ul className="text-purple-700 text-xs sm:text-sm space-y-1 ml-4">
                    <li>• Foto da CNH do condutor</li>
                    <li>• Foto do CRLV do veículo</li>
                    <li>• Boletim de Ocorrência</li>
                  </ul>
                </div>
              ) : tipoSinistro === "roubo" ? (
                <div className="space-y-2">
                  <div className="bg-red-100 p-3 rounded-md mb-3">
                    <p className="text-red-800 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      O que é ROUBO?
                    </p>
                    <p className="text-red-700 text-xs leading-relaxed">
                      Veículo levado mediante intimidação ou ameaça ao proprietário.
                      Ex: abordagem com arma, sequestro relâmpago, coação direta.
                    </p>
                  </div>
                  <p className="text-red-700 text-xs sm:text-sm leading-relaxed">
                    Para casos de roubo, você precisará enviar:
                  </p>
                  <ul className="text-red-700 text-xs sm:text-sm space-y-1 ml-4">
                    <li>• Foto da CNH do condutor</li>
                    <li>• Foto do CRLV do veículo</li>
                    <li>• Boletim de Ocorrência</li>
                  </ul>
                  <p className="text-red-700 text-xs sm:text-sm leading-relaxed font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <strong>URGENTE:</strong> Registre o B.O. imediatamente na delegacia!
                  </p>
                </div>
              ) : tipoSinistro === "pequenos_reparos" ? (
                <div className="space-y-2">
                  <div className="bg-blue-100 p-3 rounded-md mb-3">
                    <p className="text-blue-800 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                      <Wrench className="w-3 h-3" />
                      O que são PEQUENOS REPAROS?
                    </p>
                    <p className="text-blue-700 text-xs leading-relaxed">
                      Danos menores que não comprometem o funcionamento do veículo.
                      Ex: riscos, amassados pequenos, quebra de retrovisores, farol trincado.
                    </p>
                  </div>
                  <p className="text-blue-700 text-xs sm:text-sm leading-relaxed">
                    Para pequenos reparos, você precisará enviar apenas:
                  </p>
                  <ul className="text-blue-700 text-xs sm:text-sm space-y-1 ml-4">
                    <li>• Foto da CNH do titular</li>
                    <li>• Foto do CRLV do veículo</li>
                    <li>• Foto do reparo a ser feito</li>
                    <li>• Foto do chassi do veículo</li>
                  </ul>
                  <p className="text-blue-700 text-xs sm:text-sm leading-relaxed font-medium mt-2 bg-blue-200 p-2 rounded">
                    💡 Processo simplificado sem necessidade de B.O.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-orange-100 p-3 rounded-md mb-3">
                    <p className="text-orange-800 text-xs sm:text-sm font-medium mb-1 flex items-center gap-1">
                      <Car className="w-3 h-3" />
                      O que é COLISÃO?
                    </p>
                    <p className="text-orange-700 text-xs leading-relaxed">
                      Acidente que causou danos ao seu veículo.
                      Ex: batidas, engavetamentos, colisões com postes ou muros.
                    </p>
                  </div>
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
