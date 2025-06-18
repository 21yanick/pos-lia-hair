"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/shared/components/ui/button"
import { Badge } from "@/shared/components/ui/badge"
import { useOrganization } from "@/shared/contexts/OrganizationContext"

interface SettingsHeaderProps {
  title: string
  description: string
  backLink?: string
  backText?: string
  badge?: {
    text: string
    variant?: "default" | "secondary" | "destructive" | "outline"
  }
  actions?: React.ReactNode
}

export function SettingsHeader({
  title,
  description,
  backLink = "/settings",
  backText = "Zurück zu Einstellungen",
  badge,
  actions
}: SettingsHeaderProps) {
  const { currentOrganization } = useOrganization()
  
  // 🔗 Helper: Organization-aware URL builder
  const getOrgUrl = (path: string) => currentOrganization ? `/org/${currentOrganization.slug}${path}` : path

  return (
    <div className="space-y-4">
      {/* Back Navigation */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href={getOrgUrl(backLink)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {backText}
          </Link>
        </Button>
      </div>

      {/* Header Content */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">{title}</h1>
            {badge && (
              <Badge variant={badge.variant || "default"} className="px-3 py-1">
                {badge.text}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl">
            {description}
          </p>
        </div>
        
        {/* Action Buttons */}
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}