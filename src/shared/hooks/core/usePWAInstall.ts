'use client'

import { useCallback, useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

interface PWAInstallState {
  isInstallable: boolean
  isInstalled: boolean
  isPlatformSupported: boolean
  platform: 'android' | 'ios' | 'desktop' | 'unknown'
  installPrompt: BeforeInstallPromptEvent | null
}

interface PWAInstallActions {
  install: () => Promise<boolean>
  canInstall: boolean
  hasAlternativeInstall: boolean
  getInstallInstructions: () => string
}

export function usePWAInstall(): PWAInstallState & PWAInstallActions {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop' | 'unknown'>('unknown')

  // Platform Detection
  useEffect(() => {
    const detectPlatform = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS =
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true
      const isInWebAppChrome = window.matchMedia('(display-mode: standalone)').matches

      setIsInstalled(isStandalone || isInWebAppiOS || isInWebAppChrome)

      if (/android/.test(userAgent)) {
        setPlatform('android')
      } else if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('ios')
      } else if (/windows|macintosh|linux/.test(userAgent)) {
        setPlatform('desktop')
      } else {
        setPlatform('unknown')
      }
    }

    detectPlatform()
  }, [])

  // BeforeInstallPrompt Event Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  // Install Function
  const install = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      return false
    }

    try {
      await installPrompt.prompt()
      const { outcome } = await installPrompt.userChoice

      if (outcome === 'accepted') {
        setIsInstalled(true)
        setInstallPrompt(null)
        return true
      }

      return false
    } catch (error) {
      console.error('PWA installation failed:', error)
      return false
    }
  }, [installPrompt])

  // Platform Support Check
  const isPlatformSupported = platform !== 'unknown'

  // Enhanced Install Instructions with better fallbacks
  const getInstallInstructions = useCallback((): string => {
    switch (platform) {
      case 'ios':
        return 'Tippen Sie auf das Teilen-Symbol (⎙) unten und wählen Sie "Zum Home-Bildschirm hinzufügen"'
      case 'android':
        if (installPrompt) {
          return 'Tippen Sie auf "Als App installieren" um LIA HAIR zu installieren'
        }
        // Enhanced Android instructions
        return 'Chrome: Tippen Sie auf ⋮ (Menü) → "App installieren" oder "Zum Startbildschirm hinzufügen"'
      case 'desktop':
        if (installPrompt) {
          return 'Klicken Sie auf "Als App installieren" um LIA HAIR zu installieren'
        }
        // Enhanced desktop instructions
        return 'Chrome: Klicken Sie auf das ⊞ Symbol in der Adressleiste oder ⋮ Menü → "LIA HAIR installieren"'
      default:
        return 'Installation auf diesem Gerät nicht unterstützt'
    }
  }, [platform, installPrompt])

  // Check if we can show alternative install method
  const hasAlternativeInstall = useCallback((): boolean => {
    // For Android/Desktop Chrome when no prompt is available
    if ((platform === 'android' || platform === 'desktop') && !installPrompt) {
      const isChrome = /chrome|chromium|crios/i.test(navigator.userAgent)
      return isChrome
    }
    return false
  }, [platform, installPrompt])

  return {
    // State
    isInstallable: !!installPrompt || platform === 'ios' || hasAlternativeInstall(),
    isInstalled,
    isPlatformSupported,
    platform,
    installPrompt,

    // Actions
    install,
    canInstall: !!installPrompt && !isInstalled,
    hasAlternativeInstall: hasAlternativeInstall(),
    getInstallInstructions,
  }
}
