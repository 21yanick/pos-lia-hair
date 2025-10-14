'use client'

import { CheckCircle, Download, Info, Loader2, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { usePWAInstall } from '@/shared/hooks/core/usePWAInstall'

export function PWAInstallCard() {
  const [isInstalling, setIsInstalling] = useState(false)

  const {
    isInstalled,
    isPlatformSupported,
    platform,
    canInstall,
    hasAlternativeInstall,
    install,
    getInstallInstructions,
  } = usePWAInstall()

  const handleInstall = async () => {
    setIsInstalling(true)

    try {
      const success = await install()

      if (success) {
        toast.success('App erfolgreich installiert! 🎉', {
          description: 'LIA HAIR wurde zu Ihrem Startbildschirm hinzugefügt.',
        })
      } else {
        toast.error('Installation abgebrochen', {
          description: 'Die App-Installation wurde vom Benutzer abgebrochen.',
        })
      }
    } catch (_error) {
      toast.error('Installation fehlgeschlagen', {
        description:
          'Es gab einen Fehler bei der App-Installation. Versuchen Sie es später erneut.',
      })
    } finally {
      setIsInstalling(false)
    }
  }

  // Don't show card if not supported or already installed
  if (!isPlatformSupported) {
    return null
  }

  // Platform-specific styling
  const getPlatformColor = () => {
    switch (platform) {
      case 'android':
        return 'text-green-600'
      case 'ios':
        return 'text-blue-600'
      case 'desktop':
        return 'text-purple-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPlatformName = () => {
    switch (platform) {
      case 'android':
        return 'Android'
      case 'ios':
        return 'iOS'
      case 'desktop':
        return 'Desktop'
      default:
        return 'Unbekannt'
    }
  }

  const getFeatures = () => {
    if (isInstalled) {
      return [
        '✅ Schnellerer Zugriff',
        '✅ Offline-Funktionalität',
        '✅ Native App-Erfahrung',
        '✅ Push-Benachrichtigungen bereit',
      ]
    }

    return [
      '📱 Startbildschirm-Symbol',
      '⚡ Schnellerer Zugriff',
      '📶 Offline-Funktionalität',
      '🔔 Native App-Erfahrung',
    ]
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className={`h-5 w-5 ${getPlatformColor()}`} />
            <CardTitle className="flex items-center space-x-2">
              <span>App Installation</span>
              {isInstalled && <CheckCircle className="h-4 w-4 text-green-600" />}
            </CardTitle>
          </div>
          <Badge variant={isInstalled ? 'default' : 'secondary'}>{getPlatformName()}</Badge>
        </div>
        <CardDescription>
          {isInstalled
            ? 'LIA HAIR ist als App installiert'
            : 'Installieren Sie LIA HAIR als native App'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Features List */}
          <div className="space-y-2">
            {getFeatures().map((feature) => (
              <p
                key={`pwa-feature-${feature.slice(2, 12)}`}
                className="text-sm text-muted-foreground"
              >
                {feature}
              </p>
            ))}
          </div>

          {/* Action Section */}
          {isInstalled ? (
            <div className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                App bereits installiert
              </span>
            </div>
          ) : (
            <div className="space-y-3">
              {canInstall ? (
                // Direct install available
                <Button onClick={handleInstall} disabled={isInstalling} className="w-full">
                  {isInstalling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Installiere...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Als App installieren
                    </>
                  )}
                </Button>
              ) : hasAlternativeInstall ? (
                // Chrome without beforeinstallprompt - show enhanced guide
                <div className="space-y-3">
                  <div className="flex items-start space-x-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-700 dark:text-amber-300">
                      <p className="font-medium mb-2">Installation über Browser-Menü:</p>
                      <p className="mb-2">{getInstallInstructions()}</p>
                      <p className="text-xs opacity-80">
                        💡 Nach mehreren Besuchen wird oft ein direkter "Installieren"-Button
                        verfügbar
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast.info('Installationsschritte', {
                        description: getInstallInstructions(),
                        duration: 8000,
                      })
                    }}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Anleitung nochmal anzeigen
                  </Button>
                </div>
              ) : (
                // Standard manual installation
                <div className="space-y-2">
                  <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      <p className="font-medium mb-1">Manuelle Installation:</p>
                      <p>{getInstallInstructions()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
