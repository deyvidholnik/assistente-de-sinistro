'use client'

// Alteração manual 16/08/2025: Padronização de aspas e adição de classes text-foreground para dark mode
// Alteração 12/09/2025: Adição de filtro por período similar ao admin dashboard
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Search, Car, Calendar, RefreshCw } from 'lucide-react'

interface GerenteFiltrosProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
  tipoFilter: string
  setTipoFilter: (value: string) => void
  dateFrom: string
  setDateFrom: (value: string) => void
  dateTo: string
  setDateTo: (value: string) => void
  onRefresh: () => void
  isLoading?: boolean
}

export function GerenteFiltros({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  tipoFilter,
  setTipoFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onRefresh,
  isLoading = false,
}: GerenteFiltrosProps) {
  const handleQuickRange = (days: number) => {
    const hoje = new Date()
    const inicio = new Date()
    inicio.setDate(hoje.getDate() - days)
    
    setDateFrom(inicio.toISOString().split('T')[0])
    setDateTo(hoje.toISOString().split('T')[0])
  }

  const getQuickRangeBadges = () => [
    { label: '7 dias', days: 7 },
    { label: '15 dias', days: 15 },
    { label: '30 dias', days: 30 },
    { label: '90 dias', days: 90 },
  ]
  
  return (
    <div className='space-y-4'>
      {/* Filtro de Período */}
      <Card className='border-0 shadow-lg bg-card/50 backdrop-blur-sm transition-all duration-300'>
        <CardContent className='p-3 md:p-4'>
          <div className='flex flex-col xl:flex-row gap-3 md:gap-4 items-start xl:items-center'>
            {/* Título */}
            <div className='flex items-center gap-2 min-w-fit'>
              <Calendar className='w-4 md:w-5 h-4 md:h-5 text-indigo-400' />
              <h3 className='text-sm md:text-base font-semibold text-foreground'>
                Período de Análise
              </h3>
            </div>

            {/* Filtros de Data */}
            <div className='flex flex-col sm:flex-row gap-2 md:gap-3 flex-1'>
              <div className='flex flex-col gap-1'>
                <label className='text-xs font-medium text-muted-foreground'>
                  Data Inicial
                </label>
                <input
                  type='date'
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className='px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-colors'
                />
              </div>
              
              <div className='flex flex-col gap-1'>
                <label className='text-xs font-medium text-muted-foreground'>
                  Data Final
                </label>
                <input
                  type='date'
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className='px-2 md:px-3 py-1.5 md:py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 transition-colors'
                />
              </div>
            </div>

            {/* Períodos Rápidos */}
            <div className='flex flex-wrap gap-2'>
              {getQuickRangeBadges().map((range) => (
                <Badge
                  key={range.days}
                  variant='outline'
                  className='cursor-pointer hover:bg-muted hover:border-indigo-300 transition-colors text-xs'
                  onClick={() => handleQuickRange(range.days)}
                >
                  {range.label}
                </Badge>
              ))}
            </div>

            {/* Botão Atualizar */}
            <Button
              onClick={onRefresh}
              disabled={isLoading}
              size='sm'
              className='flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white min-w-fit'
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros de Busca */}
      <Card className='border-l-4 border-l-indigo-400'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg flex items-center gap-2 text-foreground'>
            <Search className='w-4 h-4 text-foreground' />
            Filtros de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-0'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-1'>
            <Label
              htmlFor='search'
              className='text-sm font-medium text-foreground flex items-center gap-1'
            >
              <Search className='w-3 h-3' />
              Buscar Ocorrência
            </Label>
            <div className='relative mt-2'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='search'
                placeholder='Número, nome, placa ou CPF...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-10 h-10 focus:ring-2 text-foreground focus:ring-blue-500'
              />
            </div>
          </div>
          <div>
            <Label
              htmlFor='status'
              className='text-sm font-medium text-foreground flex items-center gap-1'
            >
              <Badge className='w-3 h-3 rounded-full p-0' />
              Status da Ocorrência
            </Label>
            <select
              id='status'
              className={`w-full px-3 py-3 mt-2 rounded-md text-sm dark:bg-input dark:text-gray-400 dark:border-gray-600 bg-input border-gray-300 text-gray-500`}
              value={statusFilter}
              onChange={(e) => {
                console.log('Mudando status filter de', statusFilter, 'para', e.target.value)
                setStatusFilter(e.target.value)
              }}
            >
              <option value='todos'>Todos os status</option>
              <option value='pendente'>Pendente</option>
              <option value='em_analise'>Em Análise</option>
              <option value='aprovado'>Aprovado</option>
              <option value='rejeitado'>Rejeitado</option>
              <option value='concluido'>Concluído</option>
            </select>
          </div>
          <div>
            <Label
              htmlFor='tipo'
              className='text-sm font-medium text-foreground flex items-center gap-1'
            >
              <Car className='w-3 h-3' />
              Tipo de Atendimento
            </Label>
            <select
              id='tipo'
              value={tipoFilter}
              onChange={(e) => {
                console.log('Mudando tipo filter de', tipoFilter, 'para', e.target.value)
                setTipoFilter(e.target.value)
              }}
              className={`w-full px-3 py-3 mt-2 rounded-md text-sm dark:bg-input dark:text-gray-400 dark:border-gray-600 bg-input border-gray-300 text-gray-500`}
            >
              <option value='todos'>Todos os tipos</option>
              <option value='assistencia'>Assistência</option>
              <option value='colisao'>Colisão</option>
              <option value='furto'>Furto</option>
              <option value='roubo'>Roubo</option>
              <option value='pequenos_reparos'>Pequenos Reparos</option>
            </select>
          </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
