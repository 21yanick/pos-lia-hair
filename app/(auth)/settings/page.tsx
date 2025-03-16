"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

export default function SettingsPage() {
  // State for the logo upload dialog
  const [isLogoDialogOpen, setIsLogoDialogOpen] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Business data state
  const [businessData, setBusinessData] = useState({
    name: "Coiffeursalon Beispiel",
    street: "Musterstraße 123",
    zip: "8000",
    city: "Zürich",
    phone: "+41 44 123 45 67",
    email: "info@coiffeur-beispiel.ch",
    showLogo: true,
    logo: null as string | null,
  })

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedLogo(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setLogoPreview(e.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUploadLogo = () => {
    if (logoPreview) {
      setBusinessData({
        ...businessData,
        logo: logoPreview,
      })
      setIsLogoDialogOpen(false)
    }
  }

  const handleRemoveLogo = () => {
    setBusinessData({
      ...businessData,
      logo: null,
    })
  }

  const handleSaveBusinessData = () => {
    // Here would be the API call to save business data
    console.log("Saving business data:", businessData)
    alert("Geschäftsdaten wurden gespeichert.")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Einstellungen</h1>

      <Tabs defaultValue="business" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business">Geschäftsdaten</TabsTrigger>
          <TabsTrigger value="documents">Rechnungen & Dokumente</TabsTrigger>
          <TabsTrigger value="email">E-Mail & Benachrichtigungen</TabsTrigger>
          <TabsTrigger value="backup">Backup & Export</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Geschäftsdaten</CardTitle>
              <CardDescription>
                Verwalten Sie Ihre Geschäftsinformationen, die auf Rechnungen und anderen Dokumenten angezeigt werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Geschäftsname</Label>
                <Input
                  id="business-name"
                  value={businessData.name}
                  onChange={(e) => setBusinessData({ ...businessData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address-street">Straße</Label>
                <Input
                  id="address-street"
                  value={businessData.street}
                  onChange={(e) => setBusinessData({ ...businessData, street: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address-zip">PLZ</Label>
                  <Input
                    id="address-zip"
                    value={businessData.zip}
                    onChange={(e) => setBusinessData({ ...businessData, zip: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address-city">Ort</Label>
                  <Input
                    id="address-city"
                    value={businessData.city}
                    onChange={(e) => setBusinessData({ ...businessData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-phone">Telefon</Label>
                <Input
                  id="contact-phone"
                  value={businessData.phone}
                  onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email">E-Mail</Label>
                <Input
                  id="contact-email"
                  type="email"
                  value={businessData.email}
                  onChange={(e) => setBusinessData({ ...businessData, email: e.target.value })}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBusinessData}>Speichern</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Rechnungen & Dokumente</CardTitle>
              <CardDescription>Passen Sie das Erscheinungsbild Ihrer Rechnungen und Dokumente an.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 border border-dashed border-gray-300 rounded-md flex items-center justify-center relative">
                    {businessData.logo ? (
                      <div className="relative w-full h-full">
                        <img
                          src={businessData.logo || "/placeholder.svg"}
                          alt="Firmenlogo"
                          className="w-full h-full object-contain p-1"
                        />
                        <button
                          className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                          onClick={handleRemoveLogo}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500">Kein Logo</span>
                    )}
                  </div>
                  <Button variant="outline" onClick={() => setIsLogoDialogOpen(true)}>
                    Logo hochladen
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-logo">Logo auf Dokumenten anzeigen</Label>
                <Switch
                  id="show-logo"
                  checked={businessData.showLogo}
                  onCheckedChange={(checked) => setBusinessData({ ...businessData, showLogo: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer-text">Fußzeilentext für Rechnungen</Label>
                <Textarea
                  id="footer-text"
                  defaultValue="Vielen Dank für Ihren Besuch! Wir freuen uns, Sie bald wieder bei uns begrüßen zu dürfen."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-info">Zusätzliche Informationen</Label>
                <Textarea id="additional-info" defaultValue="Bankverbindung: CH12 3456 7890 1234 5678 9" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Speichern</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail & Benachrichtigungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie E-Mail-Einstellungen für den Versand von Quittungen und Benachrichtigungen.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sender-email">Absender-E-Mail</Label>
                <Input id="sender-email" type="email" defaultValue="info@coiffeur-beispiel.ch" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject-line">Standard-Betreffzeile</Label>
                <Input id="subject-line" defaultValue="Ihre Quittung vom {date}" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message-text">Standard-Nachrichtentext</Label>
                <Textarea
                  id="message-text"
                  defaultValue="Sehr geehrte(r) Kunde/Kundin,

vielen Dank für Ihren Besuch. Anbei finden Sie Ihre Quittung.

Mit freundlichen Grüßen,
Ihr Coiffeursalon-Team"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Speichern</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Export</CardTitle>
              <CardDescription>
                Erstellen Sie Backups Ihrer Daten oder exportieren Sie Daten für die Buchhaltung.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Manuelles Backup</Label>
                <div className="flex gap-4">
                  <Button variant="outline">Backup erstellen</Button>
                  <Button variant="outline">Backup wiederherstellen</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Datenexport</Label>
                <div className="flex gap-4">
                  <Button variant="outline">Transaktionen exportieren</Button>
                  <Button variant="outline">Lieferantenrechnungen exportieren</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Logo Upload Dialog */}
      <Dialog open={isLogoDialogOpen} onOpenChange={setIsLogoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Logo hochladen</DialogTitle>
            <DialogDescription>
              Laden Sie ein Logo für Ihr Unternehmen hoch. Das Logo wird auf Rechnungen und anderen Dokumenten
              angezeigt.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="logo-file">Datei auswählen</Label>
              <Input id="logo-file" type="file" accept="image/*" onChange={handleLogoChange} />
            </div>

            {logoPreview && (
              <div className="space-y-2">
                <Label>Vorschau</Label>
                <div className="border rounded-md p-4 flex items-center justify-center bg-gray-50">
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo Vorschau"
                    className="max-h-40 max-w-full object-contain"
                  />
                </div>
              </div>
            )}

            <div className="text-sm text-gray-500">
              <p>Empfohlene Größe: 200 x 200 Pixel</p>
              <p>Unterstützte Formate: JPG, PNG, GIF</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUploadLogo} disabled={!logoPreview}>
              Logo hochladen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

