'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Alert, AlertDescription } from '@/shared/components/ui/alert'
import { Separator } from '@/shared/components/ui/separator'
import { Loader2, Upload, Trash2, AlertCircle, ImageIcon, CheckCircle } from 'lucide-react'
import { useBusinessSettings } from '@/shared/hooks/business/useBusinessSettings'

export function LogoUploadSection() {
  const { settings, uploadCompanyLogo, deleteCompanyLogo, uploading } = useBusinessSettings()
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // File validation
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return 'Nur JPEG und PNG Dateien sind erlaubt'
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return 'Logo-Datei muss kleiner als 5MB sein'
    }
    
    return null
  }

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    setError(null)
    
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    try {
      await uploadCompanyLogo(file)
      setPreviewUrl(null) // Clear preview after successful upload
    } catch (error) {
      setError('Fehler beim Hochladen des Logos')
      setPreviewUrl(null)
    }
  }, [uploadCompanyLogo])

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [handleFileUpload])

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }, [handleFileUpload])

  // Handle delete logo
  const handleDeleteLogo = useCallback(async () => {
    setError(null)
    try {
      await deleteCompanyLogo()
    } catch (error) {
      setError('Fehler beim Löschen des Logos')
    }
  }, [deleteCompanyLogo])

  const hasLogo = Boolean(settings?.logo_url)

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Logo Display */}
      {hasLogo && (
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Aktuelles Logo</h3>
            <p className="text-sm text-muted-foreground">
              Ihr aktuell hochgeladenes Firmen-Logo
            </p>
          </div>
          
          <div className="flex items-center space-x-4 p-4 border border-input rounded-lg bg-background">
            <div className="w-16 h-16 flex items-center justify-center border border-input rounded-lg bg-muted overflow-hidden">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt="Firmen-Logo" 
                  className="w-full h-full object-contain"
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium">Logo hochgeladen</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Logo wird in PDFs und Belegen angezeigt
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDeleteLogo}
              disabled={uploading}
              className="text-destructive hover:text-destructive"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Löschen
            </Button>
          </div>
        </div>
      )}

      {hasLogo && <Separator />}

      {/* Upload Area */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">
            {hasLogo ? 'Logo ersetzen' : 'Logo hochladen'}
          </h3>
          <p className="text-sm text-muted-foreground">
            Laden Sie Ihr Firmen-Logo hoch (JPEG, PNG • max. 5MB)
          </p>
        </div>

        {/* Drag & Drop Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
            ${dragActive 
              ? 'border-primary bg-primary/10' 
              : 'border-input hover:border-primary/50'
            }
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {previewUrl ? (
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto border border-input rounded-lg bg-muted overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Logo Vorschau" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-muted-foreground">Vorschau</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-20 h-20 mx-auto flex items-center justify-center border border-input rounded-lg bg-muted">
                  {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {uploading 
                      ? 'Logo wird hochgeladen...' 
                      : 'Datei hierher ziehen oder auswählen'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPEG, PNG • Maximal 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <Input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInputChange}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        {/* Manual Upload Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            disabled={uploading}
            onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lädt hoch...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Datei auswählen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* File Requirements */}
      <div className="p-4 border border-input rounded-lg bg-muted/50">
        <h4 className="font-medium mb-2">Anforderungen:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Unterstützte Formate: JPEG, PNG</li>
          <li>• Maximale Dateigröße: 5MB</li>
          <li>• Empfohlene Auflösung: 200x200px oder höher</li>
          <li>• Quadratisches Format wird empfohlen</li>
        </ul>
      </div>
    </div>
  )
}