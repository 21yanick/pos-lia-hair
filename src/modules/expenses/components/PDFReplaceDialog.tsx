'use client'

import { Upload, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Label } from '@/shared/components/ui/label'
import { useToast } from '@/shared/hooks/core/useToast'

interface PDFReplaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseId: string
  expenseDescription: string
  onReplaceSuccess: () => void
  onReplace: (expenseId: string, file: File) => Promise<{ success: boolean; error?: string }>
}

export function PDFReplaceDialog({
  open,
  onOpenChange,
  expenseId,
  expenseDescription,
  onReplaceSuccess,
  onReplace,
}: PDFReplaceDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        // 10MB Limit
        toast({
          title: 'Datei zu groß',
          description: 'Die Datei darf maximal 10MB groß sein.',
          variant: 'destructive',
        })
        return
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
      if (!validTypes.includes(file.type)) {
        toast({
          title: 'Ungültiger Dateityp',
          description: 'Nur PDF, JPG und PNG Dateien sind erlaubt.',
          variant: 'destructive',
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const handleReplace = async () => {
    if (!selectedFile) {
      toast({
        title: 'Keine Datei ausgewählt',
        description: 'Bitte wählen Sie eine Datei aus.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsUploading(true)

      const result = await onReplace(expenseId, selectedFile)

      if (result.success) {
        toast({
          title: 'Beleg erfolgreich ersetzt',
          description: 'Der neue Beleg wurde hochgeladen und der alte ersetzt.',
        })
        onReplaceSuccess()
        handleClose()
      } else {
        toast({
          title: 'Fehler beim Ersetzen',
          description: result.error || 'Ein unbekannter Fehler ist aufgetreten.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    onOpenChange(false)
  }

  const removeFile = () => {
    setSelectedFile(null)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Beleg ersetzen</DialogTitle>
          <DialogDescription>
            Ersetzen Sie den Beleg für die Ausgabe: <strong>{expenseDescription}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Neue Beleg-Datei</Label>

            {!selectedFile ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">Neuen Beleg hochladen</p>
                    <p>PDF, JPG, PNG (max. 10MB)</p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Upload className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={removeFile} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Hinweis:</strong> Der alte Beleg wird dauerhaft gelöscht und durch die neue
              Datei ersetzt.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Abbrechen
          </Button>
          <Button onClick={handleReplace} disabled={!selectedFile || isUploading}>
            {isUploading ? 'Wird ersetzt...' : 'Beleg ersetzen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
