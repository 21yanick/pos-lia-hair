'use client'

import { Badge } from '@/shared/components/ui/badge'

interface TransactionTypeBadgeProps {
  typeCode: string
}

/**
 * Transaction Type Badge Component
 * Displays transaction type codes with appropriate styling
 */
export function TransactionTypeBadge({ typeCode }: TransactionTypeBadgeProps) {
  const getBadgeVariant = (code: string) => {
    switch (code) {
      case 'VK':
        return 'default' // Verkauf
      case 'AG':
        return 'destructive' // Ausgabe
      case 'CM':
        return 'secondary' // Cash Movement
      case 'BT':
        return 'outline' // Bank Transaction
      default:
        return 'outline'
    }
  }

  return (
    <Badge variant={getBadgeVariant(typeCode)} className="font-mono text-xs">
      {typeCode}
    </Badge>
  )
}
