import { Badge } from '@/components/ui/badge'
import { 
  Clock4, 
  Eye, 
  CheckCircle, 
  XCircle,
  PlayCircle
} from 'lucide-react'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
}

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pendente':
        return {
          icon: <Clock4 className='w-3 h-3 mr-1' />,
          label: 'Pendente',
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground border-border'
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
          icon: <CheckCircle className='w-3 h-3 mr-1' />,
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
          icon: <Clock4 className='w-3 h-3 mr-1' />,
          label: status,
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground border-border'
        }
    }
  }

  const config = getStatusConfig(status)
  
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