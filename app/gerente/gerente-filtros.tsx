"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, Car } from "lucide-react"

interface GerenteFiltrosProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  tipoFilter: string
  setTipoFilter: (value: string) => void
}

export function GerenteFiltros({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  tipoFilter,
  setTipoFilter
}: GerenteFiltrosProps) {
  return (
    <Card className="border-l-4 border-l-indigo-400">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Search className="w-4 h-4" />
          Filtros de Busca
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <Label
              htmlFor="search"
              className="text-sm font-medium text-foreground flex items-center gap-1"
            >
              <Search className="w-3 h-3" />
              Buscar Ocorrência
            </Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Número, nome, placa ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor="status"
              className="text-sm font-medium text-foreground flex items-center gap-1"
            >
              <Badge className="w-3 h-3 rounded-full p-0" />
              Status da Ocorrência
            </Label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => {
                console.log('Mudando status filter de', statusFilter, 'para', e.target.value)
                setStatusFilter(e.target.value)
              }}
              className="mt-2 h-10 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
          <div>
            <Label
              htmlFor="tipo"
              className="text-sm font-medium text-foreground flex items-center gap-1"
            >
              <Car className="w-3 h-3" />
              Tipo de Atendimento
            </Label>
            <select
              id="tipo"
              value={tipoFilter}
              onChange={(e) => {
                console.log('Mudando tipo filter de', tipoFilter, 'para', e.target.value)
                setTipoFilter(e.target.value)
              }}
              className="mt-2 h-10 w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="todos">Todos os tipos</option>
              <option value="assistencia">Assistência</option>
              <option value="colisao">Colisão</option>
              <option value="furto">Furto</option>
              <option value="roubo">Roubo</option>
              <option value="pequenos_reparos">Pequenos Reparos</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}