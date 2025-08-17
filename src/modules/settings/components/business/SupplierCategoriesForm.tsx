'use client'

import { Building, Edit2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/shared/components/ui/badge'
import { Button } from '@/shared/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useSupplierCategories } from '@/shared/hooks/business/useSupplierCategories'
import { useToast } from '@/shared/hooks/core/useToast'

export function SupplierCategoriesForm() {
  const {
    categoriesArray,
    loading,
    addCategory,
    updateCategory,
    removeCategory,
    validateCategoryKey,
    isDefaultCategory,
  } = useSupplierCategories()

  const { toast } = useToast()

  // Add Category State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategoryKey, setNewCategoryKey] = useState('')
  const [newCategoryLabel, setNewCategoryLabel] = useState('')

  // Edit Category State
  const [editingCategory, setEditingCategory] = useState<{ key: string; label: string } | null>(
    null
  )
  const [editLabel, setEditLabel] = useState('')

  const handleAddCategory = async () => {
    if (!newCategoryKey.trim() || !newCategoryLabel.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte Key und Label ausfüllen',
        variant: 'destructive',
      })
      return
    }

    const validation = validateCategoryKey(newCategoryKey.trim())
    if (!validation.isValid) {
      toast({
        title: 'Ungültiger Key',
        description: validation.error,
        variant: 'destructive',
      })
      return
    }

    try {
      const result = await addCategory(newCategoryKey.trim(), newCategoryLabel.trim())

      if (result.success) {
        toast({
          title: 'Erfolg',
          description: 'Lieferanten-Kategorie wurde hinzugefügt',
        })
        setIsAddDialogOpen(false)
        setNewCategoryKey('')
        setNewCategoryLabel('')
      } else {
        toast({
          title: 'Fehler',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Error in handleAddCategory:', error)
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive',
      })
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !editLabel.trim()) return

    const result = await updateCategory(editingCategory.key, editLabel.trim())

    if (result.success) {
      toast({
        title: 'Erfolg',
        description: 'Lieferanten-Kategorie wurde aktualisiert',
      })
      setEditingCategory(null)
      setEditLabel('')
    } else {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  const handleRemoveCategory = async (key: string) => {
    const result = await removeCategory(key)

    if (result.success) {
      toast({
        title: 'Erfolg',
        description: 'Lieferanten-Kategorie wurde entfernt',
      })
    } else {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  const startEdit = (key: string, label: string) => {
    setEditingCategory({ key, label })
    setEditLabel(label)
  }

  if (loading) {
    return <div className="p-4">Lade Kategorien...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Lieferanten-Kategorien
        </CardTitle>
        <CardDescription>
          Verwalten Sie Ihre eigenen Kategorien für Lieferanten. Standard-Kategorien können nicht
          geändert werden.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 p-2 sm:p-6">
        {/* Category List */}
        <div className="space-y-2">
          {categoriesArray.map(({ key, label, isDefault }) => (
            <div key={key} className="border rounded-lg p-2 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Badge
                  variant={isDefault ? 'secondary' : 'outline'}
                  className="hidden sm:inline-flex text-xs px-2 py-1"
                >
                  {isDefault ? 'Standard' : 'Eigene'}
                </Badge>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm sm:text-base">{label}</div>
                  <div className="text-xs text-muted-foreground truncate">{key}</div>
                </div>

                {/* Desktop: Side buttons */}
                {!isDefault && (
                  <div className="hidden sm:flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(key, label)}
                      className="h-8 w-8 sm:h-9 sm:w-9"
                      title="Bearbeiten"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveCategory(key)}
                      className="h-9 w-9 text-destructive hover:text-destructive"
                      title="Löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Mobile: Bottom buttons */}
              {!isDefault && (
                <div className="sm:hidden flex justify-end gap-1 mt-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(key, label)}
                    className="h-9 w-9"
                    title="Bearbeiten"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCategory(key)}
                    className="h-9 w-9 text-destructive hover:text-destructive"
                    title="Löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Category Button */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Lieferanten-Kategorie hinzufügen</span>
              <span className="sm:hidden">Hinzufügen</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="truncate">Neue Lieferanten-Kategorie hinzufügen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue benutzerdefinierte Lieferanten-Kategorie.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplier-category-key">Key (z.B. local_vendors)</Label>
                <Input
                  id="supplier-category-key"
                  value={newCategoryKey}
                  onChange={(e) =>
                    setNewCategoryKey(e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))
                  }
                  placeholder="kategorie_key"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier-category-label">Anzeigename</Label>
                <Input
                  id="supplier-category-label"
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  placeholder="z.B. Lokale Anbieter"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Abbrechen
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault()
                  handleAddCategory()
                }}
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="truncate">Lieferanten-Kategorie bearbeiten</DialogTitle>
              <DialogDescription>
                Ändern Sie den Anzeigenamen der Kategorie "{editingCategory?.key}".
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="edit-supplier-label">Anzeigename</Label>
              <Input
                id="edit-supplier-label"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="z.B. Lokale Anbieter"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setEditingCategory(null)}
                className="w-full sm:w-auto"
              >
                Abbrechen
              </Button>
              <Button onClick={handleEditCategory} className="w-full sm:w-auto">
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
