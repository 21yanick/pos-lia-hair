"use client"

import type React from "react"

import { useState } from "react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Upload, File, FileText, FileImage, FileArchive, Receipt, Calendar, BarChart } from "lucide-react"

export default function DocumentsPage() {
  // State for the upload document dialog
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [documentName, setDocumentName] = useState("")
  const [documentType, setDocumentType] = useState("invoice")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Filter state
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Mock documents data
  const [documents, setDocuments] = useState<
    {
      id: string
      name: string
      type: string
      date: string
      size: string
      icon: any
    }[]
  >([
    {
      id: "1",
      name: "Quittung-2023-03-15-001",
      type: "receipt",
      date: "15.03.2023",
      size: "45 KB",
      icon: Receipt,
    },
    {
      id: "2",
      name: "Tagesabschluss-2023-03-15",
      type: "daily-report",
      date: "15.03.2023",
      size: "120 KB",
      icon: Calendar,
    },
    {
      id: "3",
      name: "Monatsabschluss-Februar-2023",
      type: "monthly-report",
      date: "01.03.2023",
      size: "250 KB",
      icon: BarChart,
    },
    {
      id: "4",
      name: "Lieferantenrechnung-Handtücher",
      type: "supplier-invoice",
      date: "10.03.2023",
      size: "180 KB",
      icon: FileText,
    },
  ])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])

      // If no name is set, use the file name
      if (!documentName) {
        setDocumentName(e.target.files[0].name.split(".")[0])
      }
    }
  }

  const handleUpload = () => {
    if (!selectedFile || !documentName) return

    // Get file extension
    const fileExt = selectedFile.name.split(".").pop()?.toLowerCase() || ""

    // Determine icon based on file type
    let icon
    if (["jpg", "jpeg", "png", "gif"].includes(fileExt)) {
      icon = FileImage
    } else if (["pdf", "doc", "docx", "txt"].includes(fileExt)) {
      icon = FileText
    } else if (["zip", "rar", "7z"].includes(fileExt)) {
      icon = FileArchive
    } else {
      icon = File
    }

    // Create new document
    const newDocument = {
      id: Date.now().toString(),
      name: documentName,
      type: documentType,
      date: new Date().toLocaleDateString("de-CH"),
      size: (selectedFile.size / 1024).toFixed(0) + " KB",
      icon,
    }

    // Add to documents
    setDocuments([newDocument, ...documents])

    // Reset form and close dialog
    setDocumentName("")
    setDocumentType("invoice")
    setSelectedFile(null)
    setIsUploadDialogOpen(false)
  }

  // Filter documents based on active tab and search query
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "receipts" && doc.type === "receipt") ||
      (activeTab === "daily-reports" && doc.type === "daily-report") ||
      (activeTab === "monthly-reports" && doc.type === "monthly-report") ||
      (activeTab === "supplier-invoices" && doc.type === "supplier-invoice")

    return matchesSearch && matchesTab
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dokumente</h1>
        <Button className="flex items-center" onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2" size={16} />
          Dokument hochladen
        </Button>
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
          <TabsList className="grid grid-cols-5 w-full md:w-auto">
            <TabsTrigger value="all">Alle</TabsTrigger>
            <TabsTrigger value="receipts">Quittungen</TabsTrigger>
            <TabsTrigger value="daily-reports">Tagesabschlüsse</TabsTrigger>
            <TabsTrigger value="monthly-reports">Monatsabschlüsse</TabsTrigger>
            <TabsTrigger value="supplier-invoices">Lieferantenrechnungen</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="cursor-pointer hover:border-blue-300 transition-colors">
              <CardContent className="p-4 flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <doc.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{doc.name}</div>
                  <div className="text-sm text-gray-500 flex items-center justify-between">
                    <span>{doc.date}</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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

      {/* Upload Document Dialog */}
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
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="document-type">
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receipt">Quittung</SelectItem>
                  <SelectItem value="daily-report">Tagesabschluss</SelectItem>
                  <SelectItem value="monthly-report">Monatsabschluss</SelectItem>
                  <SelectItem value="supplier-invoice">Lieferantenrechnung</SelectItem>
                  <SelectItem value="other">Sonstiges</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="document-file">Datei</Label>
              <div className="flex items-center gap-2">
                <Input id="document-file" type="file" onChange={handleFileChange} className="flex-1" />
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-500">
                  Ausgewählte Datei: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpload} disabled={!selectedFile || !documentName}>
              Hochladen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

