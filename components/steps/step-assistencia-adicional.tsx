"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Plus, 
  Check, 
  X,
  Headphones,
  AlertCircle,
  Info,
  Car,
  Hotel,
  Wrench,
  Zap,
  Fuel
} from "lucide-react"
import { useForm } from "@/context/form-context"
import type { TipoAssistencia } from "@/types"

const assistenciasDisponiveis = [
  { 
    value: 'guincho' as TipoAssistencia, 
    label: 'Guincho', 
    description: 'Reboque do veículo',
    icon: Car 
  },
  { 
    value: 'hotel' as TipoAssistencia, 
    label: 'Hotel', 
    description: 'Hospedagem de emergência',
    icon: Hotel 
  },
  { 
    value: 'taxi' as TipoAssistencia, 
    label: 'Táxi', 
    description: 'Transporte alternativo',
    icon: Car 
  },
  { 
    value: 'pane_seca' as TipoAssistencia, 
    label: 'Pane Seca', 
    description: 'Falta de combustível',
    icon: Fuel 
  },
  { 
    value: 'pane_mecanica' as TipoAssistencia, 
    label: 'Pane Mecânica', 
    description: 'Problemas no motor',
    icon: Wrench 
  },
  { 
    value: 'pane_eletrica' as TipoAssistencia, 
    label: 'Pane Elétrica', 
    description: 'Problemas elétricos',
    icon: Zap 
  },
  { 
    value: 'trocar_pneu' as TipoAssistencia, 
    label: 'Trocar Pneu', 
    description: 'Pneu furado ou danificado',
    icon: Wrench 
  }
]

export function StepAssistenciaAdicional() {
  const { 
    assistenciaAdicional, 
    setAssistenciaAdicional,
    assistenciasAdicionais,
    setAssistenciasAdicionais,
    nextStep,
    canProceed 
  } = useForm()

  const [showSelection, setShowSelection] = useState(false)

  const handleInitialChoice = (choice: boolean) => {
    setAssistenciaAdicional(choice)
    if (choice) {
      setShowSelection(true)
    } else {
      // Auto-avançar se não quiser assistência adicional
      setTimeout(() => {
        nextStep()
      }, 500)
    }
  }

  const handleAssistenciaToggle = (assistencia: TipoAssistencia) => {
    setAssistenciasAdicionais(prev => {
      if (prev.includes(assistencia)) {
        return prev.filter(item => item !== assistencia)
      } else {
        return [...prev, assistencia]
      }
    })
  }

  const handleConfirmar = () => {
    setTimeout(() => {
      nextStep()
    }, 300)
  }

  // Se ainda não escolheu ou escolheu "não", mostrar opções iniciais
  if (!showSelection) {
    return (
      <div className="space-y-6">
        {/* Informação principal */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Headphones className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Assistência Adicional
          </h2>
          <p className="text-gray-600 max-w-md mx-auto">
            Você gostaria de solicitar alguma assistência adicional dentro do mesmo chamado?
          </p>
        </div>

        {/* Opções de escolha */}
        <div className="grid gap-4">
          {/* Sim - Quero assistência adicional */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 hover:border-green-300 hover:shadow-md ${
              assistenciaAdicional === true 
                ? 'border-green-500 bg-green-50 shadow-md' 
                : 'border-gray-200 hover:border-green-300'
            }`}
            onClick={() => handleInitialChoice(true)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    assistenciaAdicional === true 
                      ? 'bg-green-500 text-white' 
                      : 'bg-green-100 text-green-600'
                  }`}>
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Sim, quero assistência adicional
                    </h3>
                    <p className="text-sm text-gray-600">
                      Adicionar mais serviços no mesmo chamado
                    </p>
                  </div>
                </div>
                {assistenciaAdicional === true && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Não - Finalizar chamado */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 hover:border-blue-300 hover:shadow-md ${
              assistenciaAdicional === false 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => handleInitialChoice(false)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    assistenciaAdicional === false 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      Não, finalizar chamado
                    </h3>
                    <p className="text-sm text-gray-600">
                      Concluir apenas com os serviços já solicitados
                    </p>
                  </div>
                </div>
                {assistenciaAdicional === false && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informação adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-blue-800 font-medium mb-1">
                Importante:
              </p>
              <p className="text-blue-700">
                Se você escolher adicionar assistência adicional, poderá selecionar múltiplos tipos de serviço. 
                Todos os serviços serão agrupados no mesmo chamado para sua conveniência.
              </p>
            </div>
          </div>
        </div>

        {/* Indicador de progresso */}
        {assistenciaAdicional !== null && !showSelection && (
          <div className="text-center">
            <Badge variant="secondary" className="animate-pulse">
              Processando escolha...
            </Badge>
          </div>
        )}
      </div>
    )
  }

  // Se escolheu "sim", mostrar seleção de assistências
  return (
    <div className="space-y-6">
      {/* Informação principal */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <Plus className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Selecione as Assistências Adicionais
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Escolha quais serviços adicionais você precisa. Você pode selecionar múltiplas opções.
        </p>
      </div>

      {/* Lista de assistências disponíveis */}
      <div className="grid gap-3">
        {assistenciasDisponiveis.map((assistencia) => {
          const isSelected = assistenciasAdicionais.includes(assistencia.value)
          const IconComponent = assistencia.icon
          
          return (
            <Card 
              key={assistencia.value}
              className={`cursor-pointer transition-all duration-200 border-2 hover:shadow-md ${
                isSelected 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-green-300'
              }`}
              onClick={() => handleAssistenciaToggle(assistencia.value)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleAssistenciaToggle(assistencia.value)}
                    className="pointer-events-none"
                  />
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSelected 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {assistencia.label}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {assistencia.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Resumo das seleções */}
      {assistenciasAdicionais.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-green-800 font-medium mb-1">
                Assistências selecionadas ({assistenciasAdicionais.length}):
              </p>
              <div className="flex flex-wrap gap-2">
                {assistenciasAdicionais.map((tipo) => {
                  const assistencia = assistenciasDisponiveis.find(a => a.value === tipo)
                  return (
                    <Badge key={tipo} variant="secondary" className="bg-green-100 text-green-800">
                      {assistencia?.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => {
            setShowSelection(false)
            setAssistenciaAdicional(null)
            setAssistenciasAdicionais([])
          }}
          className="flex-1"
        >
          Voltar
        </Button>
        <Button 
          onClick={handleConfirmar}
          disabled={assistenciasAdicionais.length === 0}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Confirmar ({assistenciasAdicionais.length})
        </Button>
      </div>
    </div>
  )
} 