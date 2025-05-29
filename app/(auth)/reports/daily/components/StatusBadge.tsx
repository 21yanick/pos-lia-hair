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
          className: "bg-status-draft/10 text-status-draft-foreground border-status-draft/20"
        }
      case "closed":
        return {
          label: "Abgeschlossen",
          variant: "default" as const,
          icon: <CheckCircle size={14} className="mr-1" />,
          className: "bg-success/10 text-success border-success/20"
        }
      case "corrected":
        return {
          label: "Korrigiert",
          variant: "outline" as const,
          icon: <AlertCircle size={14} className="mr-1" />,
          className: "bg-status-corrected/10 text-status-corrected-foreground border-status-corrected/20"
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