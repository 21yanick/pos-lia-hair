"use client"

import { useState, useEffect } from "react"
import { useSupplierInvoices } from "@/lib/hooks/useSupplierInvoices"
import { toast } from "@/lib/hooks/useToast"
import { format, parseISO, isAfter, isBefore, addDays } from "date-fns"
import { de } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileText, Check, Clock, Calendar, Search, RefreshCw, Trash2, Edit } from "lucide-react"

export default function SupplierInvoicesPage() {
  // Hook für Lieferantenrechnungen
  const {
    loading,
    error,
    invoices,
    summary,
    loadInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    searchInvoices
  } = useSupplierInvoices()

  // State für den Dialog
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null)
  const [invoiceData, setInvoiceData] = useState({
    supplier_name: "",
    invoice_number: "",
    invoice_date: "",
    due_date: "",
    amount: "",
    notes: "",
    status: "pending",
    payment_date: ""
  })

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Lieferantenrechnungen laden
  useEffect(() => {
    loadInvoices()
  }, [])

  // Suchanfrage verarbeiten
  useEffect(() => {
    if (searchQuery.trim()) {
      const delaySearch = setTimeout(() => {
        searchInvoices(searchQuery)
      }, 300)
      return () => clearTimeout(delaySearch)
    } else {
      loadInvoices()
    }
  }, [searchQuery])

  // Handler für Aktualisierung der Rechnungen
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadInvoices()
    setIsRefreshing(false)
  }

  // Dialog für neue Rechnung öffnen
  const openAddDialog = () => {
    setIsEditMode(false)
    setCurrentInvoiceId(null)
    // Aktuelles Datum für Rechnungsdatum vorausfüllen
    const today = new Date().toISOString().split('T')[0]
    
    setInvoiceData({
      supplier_name: "",
      invoice_number: "",
      invoice_date: today,
      due_date: "",
      amount: "",
      notes: "",
      status: "pending",
      payment_date: ""
    })
    setIsInvoiceDialogOpen(true)
  }

  // Dialog für Bearbeitung öffnen
  const openEditDialog = (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (invoice) {
      setIsEditMode(true)
      setCurrentInvoiceId(id)
      setInvoiceData({
        supplier_name: invoice.supplier_name,
        invoice_number: invoice.invoice_number,
        invoice_date: invoice.invoice_date,
        due_date: invoice.due_date,
        amount: invoice.amount.toString(),
        notes: invoice.notes || "",
        status: invoice.status,
        payment_date: invoice.payment_date || ""
      })
      setIsInvoiceDialogOpen(true)
    }
  }

  // Lieferantenrechnung hinzufügen
  const handleAddInvoice = async () => {
    // Formularvalidierung
    if (
      !invoiceData.supplier_name ||
      !invoiceData.invoice_number ||
      !invoiceData.invoice_date ||
      !invoiceData.due_date ||
      !invoiceData.amount
    ) {
      toast({
        title: "Formular unvollständig",
        description: "Bitte füllen Sie alle erforderlichen Felder aus.",
        variant: "destructive"
      })
      return
    }

    try {
      // Bei bezahltem Status Zahlungsdatum prüfen
      if (invoiceData.status === "paid" && !invoiceData.payment_date) {
        setInvoiceData({ ...invoiceData, payment_date: new Date().toISOString().split('T')[0] })
      }

      const invoicePayload = {
        supplier_name: invoiceData.supplier_name,
        invoice_number: invoiceData.invoice_number,
        invoice_date: invoiceData.invoice_date,
        due_date: invoiceData.due_date,
        amount: parseFloat(invoiceData.amount),
        notes: invoiceData.notes || null,
        status: invoiceData.status as "pending" | "paid",
        payment_date: invoiceData.status === "paid" ? (invoiceData.payment_date || new Date().toISOString().split('T')[0]) : null
      }

      if (isEditMode && currentInvoiceId) {
        // Rechnung bearbeiten
        const { success, error } = await updateInvoice({ id: currentInvoiceId, ...invoicePayload })
        if (success) {
          toast({
            title: "Rechnung aktualisiert",
            description: "Die Lieferantenrechnung wurde erfolgreich aktualisiert."
          })
          setIsInvoiceDialogOpen(false)
        } else {
          toast({
            title: "Fehler",
            description: error || "Beim Aktualisieren der Rechnung ist ein Fehler aufgetreten.",
            variant: "destructive"
          })
        }
      } else {
        // Neue Rechnung erstellen
        const { success, error } = await createInvoice(invoicePayload)
        if (success) {
          toast({
            title: "Rechnung hinzugefügt",
            description: "Die Lieferantenrechnung wurde erfolgreich hinzugefügt."
          })
          setIsInvoiceDialogOpen(false)
        } else {
          toast({
            title: "Fehler",
            description: error || "Beim Erstellen der Rechnung ist ein Fehler aufgetreten.",
            variant: "destructive"
          })
        }
      }
    } catch (error: any) {
      toast({
        title: "Fehler",
        description: error.message || "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive"
      })
    }
  }

  // Lieferantenrechnung löschen
  const handleDeleteInvoice = async (id: string) => {
    if (confirm("Möchten Sie diese Rechnung wirklich löschen?")) {
      const { success, error } = await deleteInvoice(id)
      if (success) {
        toast({
          title: "Rechnung gelöscht",
          description: "Die Lieferantenrechnung wurde erfolgreich gelöscht."
        })
      } else {
        toast({
          title: "Fehler",
          description: error || "Beim Löschen der Rechnung ist ein Fehler aufgetreten.",
          variant: "destructive"
        })
      }
    }
  }

  // Als bezahlt markieren
  const handleMarkAsPaid = async (id: string) => {
    const invoice = invoices.find(inv => inv.id === id)
    if (invoice && invoice.status === "pending") {
      const { success, error } = await updateInvoice({
        id,
        status: "paid",
        payment_date: new Date().toISOString().split('T')[0]
      })

      if (success) {
        toast({
          title: "Als bezahlt markiert",
          description: "Die Rechnung wurde als bezahlt markiert."
        })
      } else {
        toast({
          title: "Fehler",
          description: error || "Beim Aktualisieren der Rechnung ist ein Fehler aufgetreten.",
          variant: "destructive"
        })
      }
    }
  }

  // Datum formatieren für die Anzeige
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy', { locale: de })
    } catch (error) {
      return dateString
    }
  }

  // Berechnen, ob eine Rechnung bald fällig ist (innerhalb der nächsten 7 Tage)
  const isPendingDueSoon = (invoice: any) => {
    if (invoice.status !== "pending") return false
    
    const dueDate = parseISO(invoice.due_date)
    const today = new Date()
    const in7Days = addDays(today, 7)
    
    return isAfter(dueDate, today) && isBefore(dueDate, in7Days)
  }

  // Berechnen, ob eine Rechnung überfällig ist
  const isOverdue = (invoice: any) => {
    if (invoice.status !== "pending") return false
    
    const dueDate = parseISO(invoice.due_date)
    const today = new Date()
    
    return isBefore(dueDate, today)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lieferantenrechnungen</h1>
        <Button onClick={openAddDialog}>+ Lieferantenrechnung</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Offene Rechnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 text-blue-500" />
              <span className="text-2xl font-bold">CHF {loading ? "..." : summary.pendingTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Bezahlte Rechnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Check className="mr-2 text-green-500" />
              <span className="text-2xl font-bold">CHF {loading ? "..." : summary.paidTotal.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Rechnungen gesamt</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 text-orange-500" />
              <span className="text-2xl font-bold">CHF {loading ? "..." : summary.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Suche nach Lieferant, Rechnungsnummer..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <p>Lade Lieferantenrechnungen...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Fehler beim Laden der Lieferantenrechnungen.</p>
            <p className="mt-2">Bitte versuchen Sie es später erneut.</p>
          </div>
        ) : invoices.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lieferant</TableHead>
                <TableHead>Rechnungsnr.</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Fällig am</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.supplier_name}</TableCell>
                  <TableCell>{invoice.invoice_number}</TableCell>
                  <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                  <TableCell>{formatDate(invoice.due_date)}</TableCell>
                  <TableCell className="max-w-xs truncate">{invoice.notes || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "paid" 
                          ? "outline" 
                          : isOverdue(invoice) 
                            ? "destructive" 
                            : isPendingDueSoon(invoice)
                              ? "default"
                              : "secondary"
                      }
                    >
                      {invoice.status === "pending" && isOverdue(invoice) && "Überfällig"}
                      {invoice.status === "pending" && !isOverdue(invoice) && "Offen"}
                      {invoice.status === "paid" && "Bezahlt"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">CHF {invoice.amount.toFixed(2)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    {invoice.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleMarkAsPaid(invoice.id)}
                        title="Als bezahlt markieren"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(invoice.id)}
                      title="Bearbeiten"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Keine Lieferantenrechnungen gefunden.</p>
            <p className="mt-2">Fügen Sie Ihre erste Rechnung hinzu.</p>
          </div>
        )}
      </div>

      {/* Dialog für das Hinzufügen/Bearbeiten von Rechnungen */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Lieferantenrechnung bearbeiten" : "Lieferantenrechnung hinzufügen"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Aktualisieren Sie die Informationen der Lieferantenrechnung." 
                : "Fügen Sie eine neue Lieferantenrechnung hinzu."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Lieferant</Label>
              <Input
                id="supplier"
                placeholder="Name des Lieferanten"
                value={invoiceData.supplier_name}
                onChange={(e) => setInvoiceData({ ...invoiceData, supplier_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-number">Rechnungsnummer</Label>
              <Input
                id="invoice-number"
                placeholder="z.B. RE-2023-001"
                value={invoiceData.invoice_number}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoice_number: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Rechnungsdatum</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 text-gray-400" size={16} />
                  <Input
                    id="invoice-date"
                    type="date"
                    value={invoiceData.invoice_date}
                    onChange={(e) => setInvoiceData({ ...invoiceData, invoice_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due-date">Fälligkeitsdatum</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 text-gray-400" size={16} />
                  <Input
                    id="due-date"
                    type="date"
                    value={invoiceData.due_date}
                    onChange={(e) => setInvoiceData({ ...invoiceData, due_date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Betrag (CHF)</Label>
              <Input
                id="amount"
                type="number"
                step="0.05"
                min="0"
                placeholder="0.00"
                value={invoiceData.amount}
                onChange={(e) => setInvoiceData({ ...invoiceData, amount: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Beschreibung</Label>
              <Textarea
                id="description"
                placeholder="Beschreibung der Rechnung..."
                value={invoiceData.notes}
                onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={invoiceData.status}
                onValueChange={(value) => {
                  // Wenn auf "bezahlt" gesetzt wird, Zahlungsdatum auf heute setzen
                  if (value === "paid" && !invoiceData.payment_date) {
                    setInvoiceData({ 
                      ...invoiceData, 
                      status: value,
                      payment_date: new Date().toISOString().split('T')[0]
                    })
                  } else {
                    setInvoiceData({ ...invoiceData, status: value })
                  }
                }}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Offen</SelectItem>
                  <SelectItem value="paid">Bezahlt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Zahlungsdatum anzeigen, wenn Status "bezahlt" ist */}
            {invoiceData.status === "paid" && (
              <div className="space-y-2">
                <Label htmlFor="payment-date">Zahlungsdatum</Label>
                <div className="flex items-center">
                  <Calendar className="mr-2 text-gray-400" size={16} />
                  <Input
                    id="payment-date"
                    type="date"
                    value={invoiceData.payment_date}
                    onChange={(e) => setInvoiceData({ ...invoiceData, payment_date: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleAddInvoice}
              disabled={
                loading ||
                !invoiceData.supplier_name ||
                !invoiceData.invoice_number ||
                !invoiceData.invoice_date ||
                !invoiceData.due_date ||
                !invoiceData.amount ||
                (invoiceData.status === "paid" && !invoiceData.payment_date)
              }
            >
              {isEditMode ? "Aktualisieren" : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

