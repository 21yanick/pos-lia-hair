"use client"

import { useState } from "react"
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
import { FileText, AlertTriangle, Clock, Calendar, Search } from "lucide-react"

export default function SupplierInvoicesPage() {
  // State for the add invoice dialog
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [invoiceData, setInvoiceData] = useState({
    supplier: "",
    invoiceNumber: "",
    date: "",
    dueDate: "",
    amount: "",
    description: "",
    status: "open",
  })

  // State for invoices
  const [invoices, setInvoices] = useState<
    {
      id: string
      supplier: string
      invoiceNumber: string
      date: string
      dueDate: string
      amount: number
      description: string
      status: "open" | "paid" | "overdue"
    }[]
  >([
    {
      id: "1",
      supplier: "Handtuch GmbH",
      invoiceNumber: "RE-2023-001",
      date: "10.03.2023",
      dueDate: "10.04.2023",
      amount: 450.0,
      description: "Handtücher und Frotteetücher",
      status: "open",
    },
    {
      id: "2",
      supplier: "Haarprodukte AG",
      invoiceNumber: "INV-4532",
      date: "05.03.2023",
      dueDate: "04.04.2023",
      amount: 850.0,
      description: "Shampoo, Conditioner und Styling-Produkte",
      status: "open",
    },
    {
      id: "3",
      supplier: "Bürobedarf Express",
      invoiceNumber: "B-2023-078",
      date: "01.02.2023",
      dueDate: "03.03.2023",
      amount: 120.0,
      description: "Büromaterial und Druckerpatronen",
      status: "overdue",
    },
  ])

  // Search state
  const [searchQuery, setSearchQuery] = useState("")

  // Calculate summary
  const summary = {
    open: invoices.filter((inv) => inv.status === "open").reduce((sum, inv) => sum + inv.amount, 0),
    overdue: invoices.filter((inv) => inv.status === "overdue").reduce((sum, inv) => sum + inv.amount, 0),
    dueNext7Days: invoices
      .filter((inv) => {
        if (inv.status !== "open") return false
        const dueDate = new Date(inv.dueDate.split(".").reverse().join("-"))
        const today = new Date()
        const in7Days = new Date()
        in7Days.setDate(today.getDate() + 7)
        return dueDate > today && dueDate <= in7Days
      })
      .reduce((sum, inv) => sum + inv.amount, 0),
  }

  const handleAddInvoice = () => {
    // Validate form
    if (
      !invoiceData.supplier ||
      !invoiceData.invoiceNumber ||
      !invoiceData.date ||
      !invoiceData.dueDate ||
      !invoiceData.amount
    )
      return

    // Create new invoice
    const newInvoice = {
      id: Date.now().toString(),
      supplier: invoiceData.supplier,
      invoiceNumber: invoiceData.invoiceNumber,
      date: invoiceData.date,
      dueDate: invoiceData.dueDate,
      amount: Number.parseFloat(invoiceData.amount),
      description: invoiceData.description,
      status: invoiceData.status as "open" | "paid" | "overdue",
    }

    // Add to invoices
    setInvoices([newInvoice, ...invoices])

    // Reset form and close dialog
    setInvoiceData({
      supplier: "",
      invoiceNumber: "",
      date: "",
      dueDate: "",
      amount: "",
      description: "",
      status: "open",
    })
    setIsInvoiceDialogOpen(false)
  }

  // Filter invoices based on search query
  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lieferantenrechnungen</h1>
        <Button onClick={() => setIsInvoiceDialogOpen(true)}>+ Lieferantenrechnung</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Offene Rechnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileText className="mr-2 text-blue-500" />
              <span className="text-2xl font-bold">CHF {summary.open.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Fällige Rechnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <AlertTriangle className="mr-2 text-red-500" />
              <span className="text-2xl font-bold">CHF {summary.overdue.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In 7 Tagen fällig</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="mr-2 text-orange-500" />
              <span className="text-2xl font-bold">CHF {summary.dueNext7Days.toFixed(2)}</span>
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
      </div>

      <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
        {filteredInvoices.length > 0 ? (
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.supplier}</TableCell>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.date}</TableCell>
                  <TableCell>{invoice.dueDate}</TableCell>
                  <TableCell className="max-w-xs truncate">{invoice.description}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        invoice.status === "paid" ? "outline" : invoice.status === "overdue" ? "destructive" : "default"
                      }
                    >
                      {invoice.status === "open" && "Offen"}
                      {invoice.status === "paid" && "Bezahlt"}
                      {invoice.status === "overdue" && "Überfällig"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">CHF {invoice.amount.toFixed(2)}</TableCell>
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

      {/* Add Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lieferantenrechnung hinzufügen</DialogTitle>
            <DialogDescription>Fügen Sie eine neue Lieferantenrechnung hinzu.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Lieferant</Label>
              <Input
                id="supplier"
                placeholder="Name des Lieferanten"
                value={invoiceData.supplier}
                onChange={(e) => setInvoiceData({ ...invoiceData, supplier: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoice-number">Rechnungsnummer</Label>
              <Input
                id="invoice-number"
                placeholder="z.B. RE-2023-001"
                value={invoiceData.invoiceNumber}
                onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
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
                    value={invoiceData.date}
                    onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
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
                    value={invoiceData.dueDate}
                    onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
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
                value={invoiceData.description}
                onChange={(e) => setInvoiceData({ ...invoiceData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={invoiceData.status}
                onValueChange={(value) => setInvoiceData({ ...invoiceData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Offen</SelectItem>
                  <SelectItem value="paid">Bezahlt</SelectItem>
                  <SelectItem value="overdue">Überfällig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button
              onClick={handleAddInvoice}
              disabled={
                !invoiceData.supplier ||
                !invoiceData.invoiceNumber ||
                !invoiceData.date ||
                !invoiceData.dueDate ||
                !invoiceData.amount
              }
            >
              Hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

