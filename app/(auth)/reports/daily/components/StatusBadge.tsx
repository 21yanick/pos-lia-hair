"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import type { DailySummaryStatus } from "../utils/dailyTypes"

export type { DailySummaryStatus }

interface StatusBadgeProps {
  status: DailySummaryStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (status: DailySummaryStatus) => {
    switch (status) {
      case "draft":
        return {
          label: "Entwurf",
          variant: "outline" as const,
          icon: <Clock size={14} className="mr-1" />,
          className: "bg-yellow-50 text-yellow-700 border-yellow-200"
        }
      case "closed":
        return {
          label: "Abgeschlossen",
          variant: "default" as const,
          icon: <CheckCircle size={14} className="mr-1" />,
          className: "bg-green-50 text-green-700 border-green-200"
        }
      case "corrected":
        return {
          label: "Korrigiert",
          variant: "outline" as const,
          icon: <AlertCircle size={14} className="mr-1" />,
          className: "bg-orange-50 text-orange-700 border-orange-200"
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge 
      variant={config.variant} 
      className={`${config.className} ${className || ""}`}
    >
      {config.icon}
      {config.label}
    </Badge>
  )
}