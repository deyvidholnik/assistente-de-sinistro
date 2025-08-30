import { Badge } from '@/components/ui/badge'
import { 
  Clock4, 
  Eye, 
  CheckCircle, 
  XCircle,
  PlayCircle,
  Circle,
  FileText,
  CheckCircle2
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  customColor?: string
  customIcon?: string
}

interface StatusPersonalizado {
  id: string
  nome: string
  cor: string
  icone: string
  ordem: number
  ativo: boolean
}

export default function StatusBadge({ status, size = 'md', showIcon = true, customColor, customIcon }: StatusBadgeProps) {
  const [statusPersonalizados, setStatusPersonalizados] = useState<StatusPersonalizado[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const buscarStatusPersonalizados = async () => {
      try {
        const response = await fetch('/api/status-personalizados')
        if (response.ok) {
          const data = await response.json()
          setStatusPersonalizados(data.status || [])
        }
      } catch (error) {
        console.error('Erro ao buscar status personalizados:', error)
      } finally {
        setLoading(false)
      }
    }

    buscarStatusPersonalizados()
  }, [])

  // Evitar renderização de status padrão quando o componente está carregando
  // mas já tem um status específico definido
  if (loading && status && status !== 'pendente') {
    // Durante o loading, mostrar o status recebido sem buscar nas configurações
    // Isso evita que status customizados voltem para "pendente" temporariamente
    const config = {
      icon: <Circle className='w-3 h-3 mr-1' />,
      label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
      variant: 'secondary' as const,
      className: 'bg-muted text-muted-foreground border-border'
    }

    const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 
                     size === 'lg' ? 'text-base px-4 py-2' : 
                     'text-sm px-3 py-1'

    return (
      <Badge
        variant={config.variant}
        className={`${config.className} ${sizeClass} w-fit`}
      >
        {showIcon && config.icon}
        {config.label}
      </Badge>
    )
  }

  const getIconComponent = (iconeName: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      'clock': <Clock4 className='w-3 h-3 mr-1' />,
      'eye': <Eye className='w-3 h-3 mr-1' />,
      'check-circle': <CheckCircle className='w-3 h-3 mr-1' />,
      'x-circle': <XCircle className='w-3 h-3 mr-1' />,
      'play-circle': <PlayCircle className='w-3 h-3 mr-1' />,
      'circle': <Circle className='w-3 h-3 mr-1' />,
      'file-text': <FileText className='w-3 h-3 mr-1' />,
      'check-circle-2': <CheckCircle2 className='w-3 h-3 mr-1' />
    }
    return iconMap[iconeName] || <Circle className='w-3 h-3 mr-1' />
  }
  const getStatusConfig = (status: string) => {
    // Se temos cor/ícone customizados via props, usar eles
    if (customColor || customIcon) {
      return {
        icon: customIcon ? getIconComponent(customIcon) : <Circle className='w-3 h-3 mr-1' />,
        label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
        variant: 'secondary' as const,
        className: customColor ? 
          `bg-[${customColor}]/10 text-[${customColor}] border-[${customColor}]/20` :
          'bg-muted text-muted-foreground border-border',
        customColor
      }
    }

    // Buscar nas configurações personalizadas
    const statusPersonalizado = statusPersonalizados.find(s => s.nome === status)
    
    // Debug removido - status funciona corretamente
    
    if (statusPersonalizado) {
      return {
        icon: getIconComponent(statusPersonalizado.icone),
        label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
        variant: 'secondary' as const,
        className: `bg-[${statusPersonalizado.cor}]/10 text-[${statusPersonalizado.cor}] border-[${statusPersonalizado.cor}]/20`,
        customColor: statusPersonalizado.cor
      }
    }

    // Fallback para status padrão (compatibilidade)
    switch (status) {
      case 'pendente':
        return {
          icon: <Clock4 className='w-3 h-3 mr-1' />,
          label: 'Pendente',
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground border-border'
        }
      case 'aguardando_documentos':
        return {
          icon: <FileText className='w-3 h-3 mr-1' />,
          label: 'Aguardando Documentos',
          variant: 'outline' as const,
          className: 'bg-status-warning/10 text-status-warning border-status-warning/20'
        }
      case 'em_analise':
        return {
          icon: <Eye className='w-3 h-3 mr-1' />,
          label: 'Em Análise',
          variant: 'outline' as const,
          className: 'bg-status-warning/10 text-status-warning border-status-warning/20'
        }
      case 'aprovado':
        return {
          icon: <CheckCircle className='w-3 h-3 mr-1' />,
          label: 'Aprovado',
          variant: 'secondary' as const,
          className: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
        }
      case 'rejeitado':
        return {
          icon: <XCircle className='w-3 h-3 mr-1' />,
          label: 'Rejeitado',
          variant: 'destructive' as const,
          className: 'bg-status-error/10 text-status-error border-status-error/20'
        }
      case 'concluido':
        return {
          icon: <CheckCircle2 className='w-3 h-3 mr-1' />,
          label: 'Concluído',
          variant: 'default' as const,
          className: 'bg-status-success/10 text-status-success border-status-success/20'
        }
      case 'em_andamento':
        return {
          icon: <PlayCircle className='w-3 h-3 mr-1' />,
          label: 'Em Andamento',
          variant: 'secondary' as const,
          className: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'
        }
      default:
        return {
          icon: <Circle className='w-3 h-3 mr-1' />,
          label: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground border-border'
        }
    }
  }

  const config = getStatusConfig(status)
  
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-1' : 
                   size === 'lg' ? 'text-base px-4 py-2' : 
                   'text-sm px-3 py-1'

  // Não mostrar skeleton - sempre mostrar o status mesmo durante o loading
  // O fallback default no switch abaixo é suficiente

  return (
    <Badge
      variant={config.variant}
      className={`${config.className} ${sizeClass} w-fit`}
      style={config.customColor ? {
        backgroundColor: `${config.customColor}15`,
        color: config.customColor,
        borderColor: `${config.customColor}40`
      } : undefined}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  )
}