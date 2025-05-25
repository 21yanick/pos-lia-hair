"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Search, 
  Upload, 
  AlertCircle 
} from "lucide-react"
import { useToast } from "@/lib/hooks/useToast"
import { useDocuments } from "@/lib/hooks/useDocuments"
import { DocumentsStats } from "./components/DocumentsStats"
import { DocumentsTable } from "./components/DocumentsTable"
import { DocumentsUpload } from "./components/DocumentsUpload"

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
  } = useDocuments()

  // State für Upload-Dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // State für Filter
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)

  // Dokumente beim ersten Render laden
  useEffect(() => {
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
      let type: "receipt" | "daily_report" | "monthly_report" | "expense_receipt" | undefined
      
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
          type = "expense_receipt"
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
      loadDocuments({ searchTerm: searchQuery })
    }, 300)

    setSearchTimeout(timeout)

    return () => {
      if (timeout) {
        clearTimeout(timeout)
      }
    }
  }, [searchQuery])

  const handleUpload = async (
    file: File,
    type: "receipt" | "daily_report" | "monthly_report" | "expense_receipt",
    referenceId: string,
    customName?: string
  ) => {
    try {
      const result = await uploadDocument(
        file,
        type,
        referenceId,
        customName
      )

      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Dokument wurde erfolgreich hochgeladen",
        })
        
        // Dokumente neu laden
        loadDocuments()
      } else {
        toast({
          title: "Fehler",
          description: result.error || "Dokument konnte nicht hochgeladen werden",
          variant: "destructive",
        })
      }

      return result
    } catch (err: any) {
      const errorMsg = err.message || "Ein unerwarteter Fehler ist aufgetreten"
      toast({
        title: "Fehler",
        description: errorMsg,
        variant: "destructive",
      })
      return { success: false, error: errorMsg }
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteDocument(id)

      if (result.success) {
        toast({
          title: "Erfolg",
          description: "Dokument wurde erfolgreich gelöscht",
        })
        
        // Dokumente neu laden
        loadDocuments()
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
      <DocumentsStats summary={summary} />

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
            <TabsTrigger value="supplier-invoices">Ausgabenbelege</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {error && !error.includes("bucket") && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md flex items-center gap-2">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {documents.length > 0 || loading ? (
        <DocumentsTable 
          documents={documents}
          loading={loading}
          onDelete={handleDelete}
        />
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
                            : "Ausgabenbelege"
                    } gefunden.`
                  : "Laden Sie Dokumente hoch oder erstellen Sie neue Dokumente."}
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>Dokument hochladen</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <DocumentsUpload
        isOpen={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleUpload}
      />
    </div>
  )
}