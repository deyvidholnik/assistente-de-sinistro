"use client"

import { Card, CardContent } from "@/components/ui/card"
import { 
  CheckCircle,
  Clock4,
  Clock,
  Eye,
  XCircle,
  BarChart3,
  FileText
} from "lucide-react"

interface Sinistro {
  status: string
}

interface GerenteEstatisticasProps {
  sinistros: Sinistro[]
}

export function GerenteEstatisticas({ sinistros }: GerenteEstatisticasProps) {
  const stats = {
    total: sinistros.length,
    pendentes: sinistros.filter((s) => s.status === 'pendente').length,
    emAnalise: sinistros.filter((s) => s.status === 'em_analise').length,
    aprovados: sinistros.filter((s) => s.status === 'aprovado').length,
    rejeitados: sinistros.filter((s) => s.status === 'rejeitado').length,
    concluidos: sinistros.filter((s) => s.status === 'concluido').length,
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
      <Card className="hover:shadow-lg transition-all border-l-4 border-l-gray-400 hover:border-l-gray-600">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-purple-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Concluídos
              </p>
              <p className="text-xl sm:text-2xl font-bold text-purple-600">{stats.concluidos}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all border-l-4 border-l-amber-400 hover:border-l-amber-600">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-700 flex items-center gap-1">
                <Clock4 className="w-3 h-3" />
                Pendentes
              </p>
              <p className="text-xl sm:text-2xl font-bold text-amber-600">{stats.pendentes}</p>
            </div>
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all border-l-4 border-l-blue-400 hover:border-l-blue-600">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-700 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Em Análise
              </p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.emAnalise}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all border-l-4 border-l-green-400 hover:border-l-green-600">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-green-700 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Aprovados
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.aprovados}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all border-l-4 border-l-red-400 hover:border-l-red-600">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-red-700 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Rejeitados
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejeitados}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all border-l-4 border-l-gray-400 hover:border-l-gray-600">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Total
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}