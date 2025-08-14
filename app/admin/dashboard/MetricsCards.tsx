"use client"

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { 
  FileText, 
  PhoneCall, 
  Clock, 
  Users, 
  Activity, 
  BarChart3 
} from 'lucide-react'

interface DashboardMetrics {
  periodo: {
    de: string
    ate: string
  }
  sinistros: {
    total: number
    porStatus: Record<string, number>
    porTipo: Record<string, number>
    porDia: Array<{ date: string; count: number }>
  }
  chamadas: {
    total: number
    totalMinutos: number
    minutosMedia: number
    porAgente: Record<string, number>
    porDia: Array<{ date: string; count: number }>
  }
  usuarios: {
    total: number
    ativos: number
    porNivel: Record<string, number>
  }
  logs: Array<any>
}

interface MetricsCardsProps {
  metrics: DashboardMetrics
  isDark: boolean
}

export function MetricsCards({ metrics, isDark }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 mb-8">
      {/* Ocorrências */}
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold mb-1 text-blue-600">{metrics.sinistros.total}</div>
          <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ocorrências</div>
        </CardContent>
      </Card>

      {/* Chamadas IA */}
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-purple-50 to-pink-50'}`}>
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <PhoneCall className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold mb-1 text-purple-600">{metrics.chamadas.total}</div>
          <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Chamadas IA</div>
        </CardContent>
      </Card>

      {/* Minutos de Chamadas */}
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-green-50 to-emerald-50'}`}>
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold mb-1 text-green-600">{metrics.chamadas.totalMinutos}</div>
          <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Min. Totais</div>
        </CardContent>
      </Card>

      {/* Usuários */}
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-indigo-50 to-blue-50'}`}>
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold mb-1 text-indigo-600">{metrics.usuarios.total}</div>
          <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Usuários</div>
        </CardContent>
      </Card>

      {/* Usuários Ativos */}
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-orange-50 to-red-50'}`}>
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold mb-1 text-orange-600">{metrics.usuarios.ativos}</div>
          <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Ativos</div>
        </CardContent>
      </Card>

      {/* Média de Minutos */}
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${isDark ? 'bg-gray-700/50 backdrop-blur-sm' : 'bg-gradient-to-br from-teal-50 to-cyan-50'}`}>
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div className="text-2xl font-bold mb-1 text-teal-600">{metrics.chamadas.minutosMedia}</div>
          <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Min. Média</div>
        </CardContent>
      </Card>
    </div>
  )
}