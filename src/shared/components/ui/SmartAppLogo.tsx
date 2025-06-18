'use client'

import { useTheme } from 'next-themes'
import { useBusinessSettings } from '@/shared/hooks/business/useBusinessSettings'
import { cn } from '@/shared/utils'
import { ImageIcon } from 'lucide-react'

interface SmartAppLogoProps {
  /** Custom CSS classes */
  className?: string
  /** Alt text for the logo */
  alt?: string
  /** Size preset */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Force a specific theme (overrides auto-detection) */
  forceTheme?: 'light' | 'dark'
  /** Fallback content when no logo is available */
  fallback?: React.ReactNode
  /** Click handler */
  onClick?: () => void
}

const sizeClasses = {
  sm: 'h-6 w-auto max-w-24',
  md: 'h-8 w-auto max-w-32',
  lg: 'h-10 w-auto max-w-40',
  xl: 'h-12 w-auto max-w-48'
}

export function SmartAppLogo({
  className,
  alt = 'App Logo',
  size = 'md',
  forceTheme,
  fallback,
  onClick
}: SmartAppLogoProps) {
  const { theme, resolvedTheme } = useTheme()
  const { settings } = useBusinessSettings()

  // Determine which theme logo to show
  const currentTheme = forceTheme || resolvedTheme || theme || 'light'
  const isDark = currentTheme === 'dark'

  // Get theme-specific logos
  const lightLogo = settings?.app_logo_light_url
  const darkLogo = settings?.app_logo_dark_url

  // Smart logo selection with fallback logic
  const getLogoUrl = (): string | null => {
    if (isDark) {
      // Dark theme: prefer dark logo, fallback to light logo
      return darkLogo || lightLogo || null
    } else {
      // Light theme: prefer light logo, fallback to dark logo
      return lightLogo || darkLogo || null
    }
  }

  const logoUrl = getLogoUrl()

  // Default fallback component
  const defaultFallback = (
    <div className={cn(
      'flex items-center justify-center bg-muted rounded border border-border',
      sizeClasses[size],
      className
    )}>
      <ImageIcon className="h-4 w-4 text-muted-foreground" />
    </div>
  )

  // No logo available
  if (!logoUrl) {
    return fallback || defaultFallback
  }

  // Render logo
  return (
    <img
      src={logoUrl}
      alt={alt}
      className={cn(
        'object-contain transition-opacity duration-200',
        sizeClasses[size],
        onClick && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={onClick}
      onError={(e) => {
        console.warn('App logo failed to load:', logoUrl)
        // Hide broken image
        e.currentTarget.style.display = 'none'
      }}
    />
  )
}

// Utility hook to check logo availability
export function useAppLogoStatus() {
  const { settings } = useBusinessSettings()
  
  return {
    hasLightLogo: Boolean(settings?.app_logo_light_url),
    hasDarkLogo: Boolean(settings?.app_logo_dark_url),
    hasAnyLogo: Boolean(settings?.app_logo_light_url || settings?.app_logo_dark_url),
    lightLogoUrl: settings?.app_logo_light_url,
    darkLogoUrl: settings?.app_logo_dark_url
  }
}