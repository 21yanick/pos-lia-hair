"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { de } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { 
  Search, 
  Upload, 
  FileText, 
  Calendar, 
  BarChart, 
  Receipt, 
  Trash2, 
  Download, 
  FileUp, 
  AlertCircle,
  Eye,
  Send 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/lib/hooks/useToast"
import { useDocuments } from "@/lib/hooks/useDocuments"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DocumentsPage() {
  const { toast } = useToast()
  const {
    documents,
    summary,
    loading,
    error,
    loadDocuments,
    uploadDocument,
    deleteDocument,
    searchDocuments,
    generatePDF,
  } = useDocuments()

  // State für Upload-Dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState<"receipt" | "daily_report" | "monthly_report" | "supplier_invoice">("supplier_invoice")
  const [referenceId, setReferenceId] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  // State für Löschen-Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)

  // State für Filter
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Dokumente beim ersten Render laden
  useEffect(() => {
    // Verzögerte Ausführung um sicherzustellen, dass die Komponente vollständig montiert ist
    const timer = setTimeout(() => {
      loadDocuments()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  // Dokumente filtern bei Tab-Wechsel
  useEffect(() => {
    if (activeTab === "all") {
      loadDocuments()
    } else {
      let type: "receipt" | "daily_report" | "monthly_report" | "supplier_invoice" | undefined
      
      switch (activeTab) {
        case "receipts":
          type = "receipt"
          break
        case "daily-reports":
          type = "daily_report"
          break
        case "monthly-reports":
          type = "monthly_report"
          break
        case "supplier-invoices":
          type = "supplier_invoice"
          break
      }
      
      if (type) {
        loadDocuments({ type })
      }
    }
  }, [activeTab])

  // Suchlogik mit Debounce
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    if (!searchQuery.trim()) {
      loadDocuments()
      return
    }

    const timeout = setTimeout(() => {
      searchDocuments(searchQuery)
    }, 300)

    setSearchTimeout(timeout)

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [searchQuery])

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
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus",
        variant: "destructive",
      })
      return
    }

    try {
      const result = await uploadDocument(
        selectedFile,
        documentType,
        referenceId,
        documentName
      )

      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Dokument wurde erfolgreich hochgeladen",
        })
        
        // Formular zurücksetzen und Dialog schließen
        setDocumentName("")
        setDocumentType("supplier_invoice")
        setReferenceId("")
        setSelectedFile(null)
        setIsUploadDialogOpen(false)
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Dokument konnte nicht hochgeladen werden",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    setDocumentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return

    try {
      const result = await deleteDocument(documentToDelete)

      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Dokument wurde erfolgreich gelöscht",
        })
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Dokument konnte nicht gelöscht werden",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setDocumentToDelete(null)
    }
  }

  const handleGeneratePDF = async (type: "receipt" | "daily_report" | "monthly_report" | "supplier_invoice", id: string, name?: string) => {
    try {
      const result = await generatePDF(type, id, name)

      if (result.success) {
        toast({
          title: "Erfolg",
          description: "PDF wurde erfolgreich erstellt",
        })
      } else {
        toast({
          title: "Fehler",
          description: result.error || "PDF konnte nicht erstellt werden",
          variant: "destructive",
        })
      }
    } catch (err: any) {
      toast({
        title: "Fehler",
        description: err.message || "Ein unerwarteter Fehler ist aufgetreten",
        variant: "destructive",
      })
    }
  }

  // Icon für Dokumenttyp
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "receipt":
        return <Receipt className="h-5 w-5 text-blue-600" />
      case "daily_report":
        return <Calendar className="h-5 w-5 text-green-600" />
      case "monthly_report":
        return <BarChart className="h-5 w-5 text-purple-600" />
      case "supplier_invoice":
        return <FileText className="h-5 w-5 text-orange-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  // Formatierter Dokumenttyp
  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "receipt":
        return "Quittung"
      case "daily_report":
        return "Tagesabschluss"
      case "monthly_report":
        return "Monatsabschluss"
      case "supplier_invoice":
        return "Lieferantenrechnung"
      default:
        return "Sonstiges"
    }
  }

  // Formatiertes Datum
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd.MM.yyyy', { locale: de })
    } catch (e) {
      return dateString
    }
  }

  // Formatierte Dateigröße
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unbekannt"
    
    if (bytes < 1024) {
      return `${bytes} B`
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dokumente</h1>
        <Button className="flex items-center" onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2" size={16} />
          Dokument hochladen
        </Button>
      </div>

      {/* Info Box für Supabase Storage Bucket */}
      {error && error.includes("bucket") && (
        <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800">Supabase Storage Bucket fehlt</h3>
              <p className="text-amber-700 text-sm mt-1">
                Der Dokumenten-Storage Bucket wurde noch nicht erstellt. Bitte führen Sie die Migration
                "02_storage_buckets.sql" aus oder erstellen Sie den Bucket manuell in der Supabase Console.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Übersichtskarten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Gesamt</p>
                <p className="text-2xl font-bold">{summary.total}</p>
              </div>
              <div className="p-2 bg-gray-100 rounded-full">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Quittungen</p>
                <p className="text-2xl font-bold">{summary.byType.receipt}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tagesberichte</p>
                <p className="text-2xl font-bold">{summary.byType.daily_report}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Lieferantenrechnungen</p>
                <p className="text-2xl font-bold">{summary.byType.supplier_invoice}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Suche nach Dokumenten..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full md:w-auto"
        >
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="receipts">Quittungen</TabsTrigger>
            <TabsTrigger value="daily-reports">Tagesabschlüsse</TabsTrigger>
            <TabsTrigger value="monthly-reports">Monatsabschlüsse</TabsTrigger>
            <TabsTrigger value="supplier-invoices">Lieferantenrechnungen</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error && !error.includes("bucket") && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="p-3"><Skeleton className="h-5 w-20" /></th>
                <th className="p-3"><Skeleton className="h-5 w-16" /></th>
                <th className="p-3"><Skeleton className="h-5 w-16" /></th>
                <th className="p-3"><Skeleton className="h-5 w-16" /></th>
                <th className="p-3 text-right"><Skeleton className="h-5 w-16 ml-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {Array(6).fill(0).map((_, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-3" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-6 w-20" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-3">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : documents.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr className="text-left">
                <th className="p-3 font-medium text-sm w-2/5">Dokument</th>
                <th className="p-3 font-medium text-sm w-1/6">Typ</th>
                <th className="p-3 font-medium text-sm w-1/6">Betrag</th>
                <th className="p-3 font-medium text-sm w-1/6">Datum</th>
                <th className="p-3 font-medium text-sm w-1/6">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="truncate font-medium max-w-xs">
                        {doc.displayName || doc.file_path.split('/').pop()}
                        {doc.isVirtual && <span className="ml-2 text-xs text-amber-600">(automatisch)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{getDocumentTypeName(doc.type)}</Badge>
                  </td>
                  <td className="p-3 text-sm font-medium">
                    {doc.amount ? (
                      <span className={doc.type === 'supplier_invoice' ? 'text-red-600' : 'text-green-600'}>
                        {doc.amount.toFixed(2)} CHF
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {doc.referenceDetails?.date ? formatDate(doc.referenceDetails.date) : formatDate(doc.created_at)}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => window.open(doc.url, '_blank')}
                              disabled={!doc.url || doc.isVirtual}
                            >
                              <Eye size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Anzeigen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              disabled={!doc.url || doc.isVirtual}
                              onClick={() => {
                                if (doc.url) {
                                  const a = document.createElement('a')
                                  a.href = doc.url
                                  a.download = doc.displayName || doc.file_path.split('/').pop() || 'download'
                                  document.body.appendChild(a)
                                  a.click()
                                  document.body.removeChild(a)
                                }
                              }}
                            >
                              <Download size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Herunterladen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDelete(doc.id)}
                              className="hover:text-red-600"
                              disabled={doc.isVirtual} // Virtuelle Dokumente können nicht gelöscht werden
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Löschen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      {/* PDF-Generieren Button für virtuelle Dokumente */}
                      {doc.isVirtual && doc.type === 'receipt' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleGeneratePDF('receipt', doc.reference_id, doc.displayName)}
                              >
                                <FileText size={16} className="text-green-600" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>PDF erstellen</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Keine Dokumente gefunden</h3>
              <p className="text-gray-500 mb-4">
                {activeTab !== "all"
                  ? `Es wurden keine ${
                      activeTab === "receipts"
                        ? "Quittungen"
                        : activeTab === "daily-reports"
                          ? "Tagesabschlüsse"
                          : activeTab === "monthly-reports"
                            ? "Monatsabschlüsse"
                            : "Lieferantenrechnungen"
                    } gefunden.`
                  : "Laden Sie Dokumente hoch oder erstellen Sie neue Dokumente."}
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>Dokument hochladen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
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
                  <SelectItem value="supplier_invoice">Lieferantenrechnung</SelectItem>
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
              <p className="text-xs text-gray-500">
                Die ID des Eintrags, zu dem dieses Dokument gehört (z.B. Transaktions-ID für Quittungen).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-file">Datei</Label>
              <div className="flex items-center gap-2">
                <Input id="document-file" type="file" onChange={handleFileChange} className="flex-1" />
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  Ausgewählte Datei: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={!selectedFile || !documentName || !documentType || !referenceId}
            >
              Hochladen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Löschen Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dokument löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie dieses Dokument löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}