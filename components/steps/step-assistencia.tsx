"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Car, Hotel, Wrench, Fuel, Zap, CircleDot, CarFront } from "lucide-react"
import { useForm } from "@/context/form-context"

export function StepAssistencia() {
  const { tipoAssistencia, setTipoAssistencia } = useForm()

  const assistencias = [
    {
      id: "guincho",
      titulo: "GUINCHO",
      descricao: "Reboque do veículo",
      icon: Car,
      cor: "blue",
    },
    {
      id: "hotel",
      titulo: "HOTEL",
      descricao: "Hospedagem de emergência",
      icon: Hotel,
      cor: "purple",
    },
    {
      id: "taxi",
      titulo: "TÁXI",
      descricao: "Transporte alternativo",
      icon: CarFront,
      cor: "green",
    },
    {
      id: "pane_seca",
      titulo: "PANE SECA",
      descricao: "Falta de combustível",
      icon: Fuel,
      cor: "orange",
    },
    {
      id: "pane_mecanica",
      titulo: "PANE MECÂNICA",
      descricao: "Problemas no motor",
      icon: Wrench,
      cor: "red",
    },
    {
      id: "pane_eletrica",
      titulo: "PANE ELÉTRICA",
      descricao: "Problemas elétricos",
      icon: Zap,
      cor: "yellow",
    },
    {
      id: "trocar_pneu",
      titulo: "TROCAR PNEU",
      descricao: "Pneu furado ou danificado",
      icon: CircleDot,
      cor: "gray",
    },
  ]

  const getColorClasses = (cor: string, isSelected: boolean) => {
    const colorMap = {
      blue: {
        base: "text-blue-600",
        selected: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
        hover: "hover:border-blue-400 hover:bg-blue-50",
        info: {
          bg: "bg-blue-50 border-blue-400",
          icon: "bg-blue-100",
          iconColor: "text-blue-600",
          text: "text-blue-800",
          subtext: "text-blue-700",
        },
      },
      purple: {
        base: "text-purple-600",
        selected: "bg-purple-600 hover:bg-purple-700 text-white border-purple-600",
        hover: "hover:border-purple-400 hover:bg-purple-50",
        info: {
          bg: "bg-purple-50 border-purple-400",
          icon: "bg-purple-100",
          iconColor: "text-purple-600",
          text: "text-purple-800",
          subtext: "text-purple-700",
        },
      },
      green: {
        base: "text-green-600",
        selected: "bg-green-600 hover:bg-green-700 text-white border-green-600",
        hover: "hover:border-green-400 hover:bg-green-50",
        info: {
          bg: "bg-green-50 border-green-400",
          icon: "bg-green-100",
          iconColor: "text-green-600",
          text: "text-green-800",
          subtext: "text-green-700",
        },
      },
      orange: {
        base: "text-orange-600",
        selected: "bg-orange-600 hover:bg-orange-700 text-white border-orange-600",
        hover: "hover:border-orange-400 hover:bg-orange-50",
        info: {
          bg: "bg-orange-50 border-orange-400",
          icon: "bg-orange-100",
          iconColor: "text-orange-600",
          text: "text-orange-800",
          subtext: "text-orange-700",
        },
      },
      red: {
        base: "text-red-600",
        selected: "bg-red-600 hover:bg-red-700 text-white border-red-600",
        hover: "hover:border-red-400 hover:bg-red-50",
        info: {
          bg: "bg-red-50 border-red-400",
          icon: "bg-red-100",
          iconColor: "text-red-600",
          text: "text-red-800",
          subtext: "text-red-700",
        },
      },
      yellow: {
        base: "text-yellow-600",
        selected: "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600",
        hover: "hover:border-yellow-400 hover:bg-yellow-50",
        info: {
          bg: "bg-yellow-50 border-yellow-400",
          icon: "bg-yellow-100",
          iconColor: "text-yellow-600",
          text: "text-yellow-800",
          subtext: "text-yellow-700",
        },
      },
      gray: {
        base: "text-gray-600",
        selected: "bg-gray-600 hover:bg-gray-700 text-white border-gray-600",
        hover: "hover:border-gray-400 hover:bg-gray-50",
        info: {
          bg: "bg-gray-50 border-gray-400",
          icon: "bg-gray-100",
          iconColor: "text-gray-600",
          text: "text-gray-800",
          subtext: "text-gray-700",
        },
      },
    }

    return colorMap[cor as keyof typeof colorMap] || colorMap.blue
  }

  const getAssistenciaInfo = (tipo: string) => {
    const infoMap: { [key: string]: { titulo: string; itens: string[] } } = {
      guincho: {
        titulo: "Serviço de Guincho",
        itens: [
          "• Reboque até a oficina mais próxima",
          "• Raio de cobertura de 100km",
          "• Disponível 24 horas",
          "• Inclui assistência na remoção",
        ],
      },
      hotel: {
        titulo: "Hospedagem de Emergência",
        itens: [
          "• Diária em hotel conveniado",
          "• Para motorista e passageiros",
          "• Café da manhã incluído",
          "• Máximo de 3 diárias",
        ],
      },
      taxi: {
        titulo: "Transporte Alternativo",
        itens: [
          "• Táxi ou transporte por aplicativo",
          "• Valor limitado por evento",
          "• Para deslocamentos essenciais",
          "• Reembolso mediante comprovante",
        ],
      },
      pane_seca: {
        titulo: "Assistência Pane Seca",
        itens: [
          "• Fornecimento de combustível",
          "• Quantidade suficiente até o posto",
          "• Custo do combustível por sua conta",
          "• Atendimento em até 1 hora",
        ],
      },
      pane_mecanica: {
        titulo: "Assistência Mecânica",
        itens: [
          "• Reparo emergencial no local",
          "• Se não for possível, guincho incluso",
          "• Mão de obra gratuita",
          "• Peças por sua conta",
        ],
      },
      pane_eletrica: {
        titulo: "Assistência Elétrica",
        itens: [
          "• Carga de bateria",
          "• Reparo de fusíveis",
          "• Diagnóstico elétrico básico",
          "• Guincho se necessário",
        ],
      },
      trocar_pneu: {
        titulo: "Troca de Pneu",
        itens: [
          "• Troca por estepe",
          "• Ou reparo temporário",
          "• Mão de obra gratuita",
          "• Guincho se não houver estepe",
        ],
      },
    }

    return infoMap[tipo] || { titulo: "", itens: [] }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center mb-8 sm:mb-10">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <Wrench className="w-10 h-10 sm:w-12 sm:h-12 text-green-600" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 px-2 leading-tight">
          Tipo de Assistência
        </h2>
        <p className="text-base sm:text-lg text-gray-600 px-4 leading-relaxed">
          Selecione o serviço de assistência que você precisa
        </p>
      </div>

      {/* Grid de botões */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 px-2 sm:px-0">
        {assistencias.map((assistencia) => {
          const isSelected = tipoAssistencia === assistencia.id
          const colors = getColorClasses(assistencia.cor, isSelected)

          return (
            <Button
              key={assistencia.id}
              variant="outline"
              onClick={() => setTipoAssistencia(assistencia.id as any)}
              className={`h-28 sm:h-32 flex flex-col items-center justify-center space-y-2 text-center border-2 transition-all duration-200 ${
                isSelected
                  ? `${colors.selected} shadow-lg transform scale-105`
                  : `border-gray-300 ${colors.hover} bg-white`
              }`}
            >
              {React.createElement(assistencia.icon, {
                className: `w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 ${
                  isSelected ? "text-white" : colors.base
                }`,
              })}
              <div>
                <div
                  className={`font-bold text-sm sm:text-base mb-0.5 ${
                    isSelected ? "text-white" : colors.base
                  }`}
                >
                  {assistencia.titulo}
                </div>
                <div
                  className={`text-xs leading-tight px-1 ${
                    isSelected ? "text-white opacity-90" : "text-gray-600"
                  }`}
                >
                  {assistencia.descricao}
                </div>
              </div>
            </Button>
          )
        })}
      </div>

      {/* Informação detalhada */}
      {tipoAssistencia && (
        <div
          className={`rounded-lg p-4 sm:p-6 mx-2 sm:mx-0 border-l-4 ${
            getColorClasses(
              assistencias.find((a) => a.id === tipoAssistencia)?.cor || "blue",
              false
            ).info.bg
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                getColorClasses(
                  assistencias.find((a) => a.id === tipoAssistencia)?.cor || "blue",
                  false
                ).info.icon
              }`}
            >
              {React.createElement(
                assistencias.find((a) => a.id === tipoAssistencia)?.icon || Car,
                {
                  className: `w-4 h-4 ${
                    getColorClasses(
                      assistencias.find((a) => a.id === tipoAssistencia)?.cor || "blue",
                      false
                    ).info.iconColor
                  }`,
                }
              )}
            </div>
            <div className="flex-1">
              <h4
                className={`font-semibold text-sm sm:text-base mb-2 ${
                  getColorClasses(
                    assistencias.find((a) => a.id === tipoAssistencia)?.cor || "blue",
                    false
                  ).info.text
                }`}
              >
                {getAssistenciaInfo(tipoAssistencia).titulo}
              </h4>
              <ul
                className={`space-y-1 ${
                  getColorClasses(
                    assistencias.find((a) => a.id === tipoAssistencia)?.cor || "blue",
                    false
                  ).info.subtext
                } text-xs sm:text-sm`}
              >
                {getAssistenciaInfo(tipoAssistencia).itens.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 