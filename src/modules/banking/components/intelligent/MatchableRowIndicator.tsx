"use client"

import { Badge } from "@/shared/components/ui/badge"
import { 
  CheckCircle2, 
  Target, 
  AlertCircle, 
  Zap,
  Eye,
  Clock
} from "lucide-react"

export type MatchStatus = 'none' | 'high_confidence' | 'medium_confidence' | 'low_confidence' | 'matched' | 'processing'

interface MatchableRowIndicatorProps {
  status: MatchStatus
  confidence?: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function MatchableRowIndicator({ 
  status, 
  confidence, 
  className = "",
  size = 'sm'
}: MatchableRowIndicatorProps) {
  const getIndicatorConfig = () => {
    switch (status) {
      case 'high_confidence':
        return {
          icon: <Zap className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          text: confidence ? `${confidence}%` : 'Auto-Match',
          variant: 'default' as const,
          className: 'bg-green-100 text-green-800 border-green-200 animate-pulse'
        }
      
      case 'medium_confidence':
        return {
          icon: <Target className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          text: confidence ? `${confidence}%` : 'Gut',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      
      case 'low_confidence':
        return {
          icon: <Eye className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />,
          text: confidence ? `${confidence}%` : 'Review',
          variant: 'outline' as const,
          className: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        }
      
      case 'matched':
        return {
          icon: <CheckCircle2 className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} text-green-600`} />,
          text: 'Matched',
          variant: 'outline' as const,
          className: 'bg-green-50 text-green-700 border-green-300'
        }
      
      case 'processing':
        return {
          icon: <Clock className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} animate-spin`} />,
          text: 'Processing...',
          variant: 'outline' as const,
          className: 'bg-blue-50 text-blue-700 border-blue-200'
        }
      
      case 'none':
      default:
        return null
    }
  }

  const config = getIndicatorConfig()
  
  if (!config) return null

  return (
    <Badge 
      variant={config.variant}
      className={`${config.className} ${className} flex items-center gap-1 ${
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 
        size === 'md' ? 'text-sm px-2 py-1' : 
        'text-sm px-3 py-1.5'
      }`}
    >
      {config.icon}
      {config.text}
    </Badge>
  )
}

// Row wrapper component for table integration
interface MatchableTableRowProps {
  status: MatchStatus
  confidence?: number
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

export function MatchableTableRow({ 
  status, 
  confidence, 
  children, 
  onClick,
  className = ""
}: MatchableTableRowProps) {
  const getRowClassName = () => {
    switch (status) {
      case 'high_confidence':
        return 'bg-green-50 border-l-4 border-green-400 hover:bg-green-100'
      case 'medium_confidence':
        return 'bg-blue-50 border-l-4 border-blue-400 hover:bg-blue-100'
      case 'low_confidence':
        return 'bg-yellow-50 border-l-4 border-yellow-400 hover:bg-yellow-100'
      case 'matched':
        return 'bg-green-100 border-l-4 border-green-500 opacity-75'
      case 'processing':
        return 'bg-blue-100 border-l-4 border-blue-500 animate-pulse'
      default:
        return 'hover:bg-gray-50'
    }
  }

  return (
    <tr 
      className={`transition-all duration-200 ${getRowClassName()} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

// Quick confidence helper
export function getMatchStatus(confidence: number): MatchStatus {
  if (confidence >= 95) return 'high_confidence'
  if (confidence >= 80) return 'medium_confidence'
  if (confidence >= 50) return 'low_confidence'
  return 'none'
}