import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select"
import { Upload } from "lucide-react"
import { formatFileSize } from "@/app/(auth)/documents/utils/documentHelpers"

interface DocumentsUploadProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (
    file: File, 
    type: "receipt" | "daily_report" | "monthly_report" | "expense_receipt", 
    referenceId: string, 
    customName?: string
  ) => Promise<{ success: boolean; error?: string }>
}

export function DocumentsUpload({ isOpen, onOpenChange, onUpload }: DocumentsUploadProps) {
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState<"receipt" | "daily_report" | "monthly_report" | "expense_receipt">("expense_receipt")
  const [referenceId, setReferenceId] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])

      // Wenn kein Name gesetzt ist, Dateinamen verwenden
      if (!documentName) {
        setDocumentName(e.target.files[0].name.split(".")[0])
      }
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !documentName || !documentType || !referenceId) {
      return
    }

    setIsUploading(true)
    
    try {
      const result = await onUpload(
        selectedFile,
        documentType,
        referenceId,
        documentName
      )

      if (result.success) {
        // Formular zurücksetzen und Dialog schließen
        resetForm()
        onOpenChange(false)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setDocumentName("")
    setDocumentType("expense_receipt")
    setReferenceId("")
    setSelectedFile(null)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm()
    }
    onOpenChange(open)
  }

  const isFormValid = selectedFile && documentName && documentType && referenceId

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dokument hochladen</DialogTitle>
          <DialogDescription>Laden Sie ein neues Dokument hoch und fügen Sie Metadaten hinzu.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="document-name">Dokumentname</Label>
            <Input
              id="document-name"
              placeholder="Name des Dokuments"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-type">Dokumenttyp</Label>
            <Select value={documentType} onValueChange={(value: any) => setDocumentType(value)}>
              <SelectTrigger id="document-type">
                <SelectValue placeholder="Typ auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receipt">Quittung</SelectItem>
                <SelectItem value="daily_report">Tagesabschluss</SelectItem>
                <SelectItem value="monthly_report">Monatsabschluss</SelectItem>
                <SelectItem value="expense_receipt">Ausgabenbeleg</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference-id">Referenz-ID</Label>
            <Input
              id="reference-id"
              placeholder="ID des zugehörigen Eintrags"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Die ID des Eintrags, zu dem dieses Dokument gehört (z.B. Transaktions-ID für Quittungen).
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-file">Datei</Label>
            <div className="flex items-center gap-2">
              <Input 
                id="document-file" 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange} 
                className="flex-1" 
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Ausgewählte Datei: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!isFormValid || isUploading}
          >
            {isUploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Wird hochgeladen...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Hochladen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}