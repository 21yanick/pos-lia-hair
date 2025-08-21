'use client'

import {
  AlertCircle,
  CheckCircle,
  ImageIcon,
  Loader2,
  Moon,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { useBusinessSettings } from '@/shared/hooks/business/useBusinessSettings'

type LogoTheme = 'light' | 'dark'

// Logo Upload Component extracted to avoid nested component definition
interface LogoUploadTabProps {
  theme: LogoTheme
  hasLogo: boolean
  logoUrl: string | null
  previewUrl: string | null
  isActive: boolean
  uploading: boolean
  onDeleteLogo: (theme: LogoTheme) => void
  onDrag: (e: React.DragEvent, theme: LogoTheme) => void
  onDrop: (e: React.DragEvent, theme: LogoTheme) => void
  onFileUpload: (file: File, theme: LogoTheme) => void
}

function LogoUploadTab({
  theme,
  hasLogo,
  logoUrl,
  previewUrl,
  isActive,
  uploading,
  onDeleteLogo,
  onDrag,
  onDrop,
  onFileUpload,
}: LogoUploadTabProps) {
  const Icon = theme === 'light' ? Sun : Moon

  return (
    <div className="space-y-4">
      {/* Current Logo Display */}
      {hasLogo && (
        <div className="flex items-center space-x-4 p-4 border border-input rounded-lg bg-background">
          <div
            className={`w-16 h-16 flex items-center justify-center border border-input rounded-lg overflow-hidden ${
              theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
            }`}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={`App-Logo ${theme}`}
                width={64}
                height={64}
                className="w-full h-full object-contain"
              />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium">
                {theme === 'light' ? 'Helles' : 'Dunkles'} Logo hochgeladen
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Wird in der App-Navigation angezeigt
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteLogo(theme)}
            disabled={uploading}
            className="text-destructive hover:text-destructive"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Upload Area */}
      <button
        type="button"
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer w-full
          ${
            isActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          }
        `}
        onDragEnter={(e) => onDrag(e, theme)}
        onDragLeave={(e) => onDrag(e, theme)}
        onDragOver={(e) => onDrag(e, theme)}
        onDrop={(e) => onDrop(e, theme)}
        onClick={() => document.getElementById(`file-input-${theme}`)?.click()}
      >
        <div className="space-y-4">
          {previewUrl ? (
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`w-24 h-24 flex items-center justify-center border border-input rounded-lg overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
                }`}
              >
                <Image
                  src={previewUrl}
                  alt="Logo Preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-sm text-muted-foreground">Vorschau - wird hochgeladen...</p>
            </div>
          ) : (
            <>
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted">
                {uploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                ) : (
                  <Icon className="h-6 w-6 text-muted-foreground" />
                )}
              </div>

              <div>
                <h3 className="font-medium">
                  {theme === 'light' ? 'Helles' : 'Dunkles'} App-Logo hochladen
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Optimiert für {theme === 'light' ? 'helle Hintergründe' : 'dunkle Hintergründe'}
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="outline" disabled={uploading}>
                  <Upload className="mr-2 h-4 w-4" />
                  Datei auswählen
                </Button>
                <span className="text-sm text-muted-foreground">oder per Drag & Drop</span>
              </div>

              <p className="text-xs text-muted-foreground">JPEG, PNG oder SVG • Max. 5MB</p>
            </>
          )}
        </div>

        <Input
          id={`file-input-${theme}`}
          type="file"
          accept="image/jpeg,image/png,image/svg+xml"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              onFileUpload(e.target.files[0], theme)
            }
          }}
          className="hidden"
          disabled={uploading}
        />
      </button>
    </div>
  )
}

export function AppLogoUploadSection() {
  const { settings, uploadAppLogo, deleteAppLogo, uploading } = useBusinessSettings()
  const [dragActive, setDragActive] = useState<LogoTheme | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [previewUrls, setPreviewUrls] = useState<Record<LogoTheme, string | null>>({
    light: null,
    dark: null,
  })

  // File validation
  const validateFile = useCallback((file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return 'Nur JPEG, PNG und SVG Dateien sind erlaubt'
    }

    if (file.size > 5 * 1024 * 1024) {
      return 'Logo-Datei muss kleiner als 5MB sein'
    }

    return null
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file: File, theme: LogoTheme) => {
      setError(null)

      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrls((prev) => ({
          ...prev,
          [theme]: e.target?.result as string,
        }))
      }
      reader.readAsDataURL(file)

      try {
        await uploadAppLogo(file, theme)
        setPreviewUrls((prev) => ({
          ...prev,
          [theme]: null,
        })) // Clear preview after successful upload
      } catch (_error) {
        setError(`Fehler beim Hochladen des ${theme} Logos`)
        setPreviewUrls((prev) => ({
          ...prev,
          [theme]: null,
        }))
      }
    },
    [uploadAppLogo, validateFile]
  )

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent, theme: LogoTheme) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(theme)
    } else if (e.type === 'dragleave') {
      setDragActive(null)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback(
    (e: React.DragEvent, theme: LogoTheme) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(null)

      if (e.dataTransfer.files?.[0]) {
        handleFileUpload(e.dataTransfer.files[0], theme)
      }
    },
    [handleFileUpload]
  )

  // Handle delete logo
  const handleDeleteLogo = useCallback(
    async (theme: LogoTheme) => {
      setError(null)
      try {
        await deleteAppLogo(theme)
      } catch (_error) {
        setError(`Fehler beim Löschen des ${theme} Logos`)
      }
    },
    [deleteAppLogo]
  )

  const hasLightLogo = Boolean(settings?.app_logo_light_url)
  const hasDarkLogo = Boolean(settings?.app_logo_dark_url)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          App-Logos
        </CardTitle>
        <CardDescription>
          Laden Sie Logos für helle und dunkle Themes hoch. Diese werden in der Navigation, beim
          Login und in der App angezeigt.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="light" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="light" className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Helles Theme
            </TabsTrigger>
            <TabsTrigger value="dark" className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dunkles Theme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="light" className="mt-6">
            <LogoUploadTab
              theme="light"
              hasLogo={hasLightLogo}
              logoUrl={settings?.app_logo_light_url || null}
              previewUrl={previewUrls.light}
              isActive={dragActive === 'light'}
              uploading={uploading}
              onDeleteLogo={handleDeleteLogo}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFileUpload={handleFileUpload}
            />
          </TabsContent>

          <TabsContent value="dark" className="mt-6">
            <LogoUploadTab
              theme="dark"
              hasLogo={hasDarkLogo}
              logoUrl={settings?.app_logo_dark_url || null}
              previewUrl={previewUrls.dark}
              isActive={dragActive === 'dark'}
              uploading={uploading}
              onDeleteLogo={handleDeleteLogo}
              onDrag={handleDrag}
              onDrop={handleDrop}
              onFileUpload={handleFileUpload}
            />
          </TabsContent>
        </Tabs>

        {(hasLightLogo || hasDarkLogo) && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Logo-Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span>Helles Theme:</span>
                {hasLightLogo ? (
                  <span className="text-green-600 font-medium">✓ Hochgeladen</span>
                ) : (
                  <span className="text-muted-foreground">Nicht hochgeladen</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>Dunkles Theme:</span>
                {hasDarkLogo ? (
                  <span className="text-green-600 font-medium">✓ Hochgeladen</span>
                ) : (
                  <span className="text-muted-foreground">Nicht hochgeladen</span>
                )}
              </div>
            </div>

            {hasLightLogo && !hasDarkLogo && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 Das helle Logo wird auch im dunklen Theme verwendet
              </p>
            )}
            {!hasLightLogo && hasDarkLogo && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 Das dunkle Logo wird auch im hellen Theme verwendet
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
