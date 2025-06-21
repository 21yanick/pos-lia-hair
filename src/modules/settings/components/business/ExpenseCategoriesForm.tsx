'use client'

import { useState } from 'react'
import { useExpenseCategories } from '@/shared/hooks/business/useExpenseCategories'
import { useToast } from '@/shared/hooks/core/useToast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Badge } from '@/shared/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'

export function ExpenseCategoriesForm() {
  const { 
    categoriesArray, 
    loading, 
    addCategory, 
    updateCategory, 
    removeCategory, 
    validateCategoryKey,
    isDefaultCategory 
  } = useExpenseCategories()
  
  const { toast } = useToast()
  
  // Add Category State
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategoryKey, setNewCategoryKey] = useState('')
  const [newCategoryLabel, setNewCategoryLabel] = useState('')
  
  // Edit Category State  
  const [editingCategory, setEditingCategory] = useState<{ key: string; label: string } | null>(null)
  const [editLabel, setEditLabel] = useState('')

  const handleAddCategory = async () => {
    if (!newCategoryKey.trim() || !newCategoryLabel.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte Key und Label ausfüllen',
        variant: 'destructive'
      })
      return
    }

    const validation = validateCategoryKey(newCategoryKey.trim())
    if (!validation.isValid) {
      toast({
        title: 'Ungültiger Key',
        description: validation.error,
        variant: 'destructive'
      })
      return
    }

    try {
      const result = await addCategory(newCategoryKey.trim(), newCategoryLabel.trim())
      
      if (result.success) {
        toast({
          title: 'Erfolg',
          description: 'Kategorie wurde hinzugefügt'
        })
        setIsAddDialogOpen(false)
        setNewCategoryKey('')
        setNewCategoryLabel('')
      } else {
        toast({
          title: 'Fehler',
          description: result.error,
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error in handleAddCategory:', error)
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive'
      })
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !editLabel.trim()) return

    const result = await updateCategory(editingCategory.key, editLabel.trim())
    
    if (result.success) {
      toast({
        title: 'Erfolg',
        description: 'Kategorie wurde aktualisiert'
      })
      setEditingCategory(null)
      setEditLabel('')
    } else {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive'
      })
    }
  }

  const handleRemoveCategory = async (key: string) => {
    const result = await removeCategory(key)
    
    if (result.success) {
      toast({
        title: 'Erfolg',
        description: 'Kategorie wurde entfernt'
      })
    } else {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive'
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
          <Tag className="h-5 w-5" />
          Ausgaben-Kategorien
        </CardTitle>
        <CardDescription>
          Verwalten Sie Ihre eigenen Kategorien für Ausgaben. Standard-Kategorien können nicht geändert werden.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Category List */}
        <div className="space-y-2">
          {categoriesArray.map(({ key, label, isDefault }) => (
            <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={isDefault ? "secondary" : "outline"}>
                  {isDefault ? "Standard" : "Eigene"}
                </Badge>
                <div>
                  <div className="font-medium">{label}</div>
                  <div className="text-sm text-muted-foreground">{key}</div>
                </div>
              </div>
              
              {!isDefault && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEdit(key, label)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCategory(key)}
                    className="text-destructive hover:text-destructive"
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
              Kategorie hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Kategorie hinzufügen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue benutzerdefinierte Ausgaben-Kategorie.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category-key">Key (z.B. marketing)</Label>
                <Input
                  id="category-key"
                  value={newCategoryKey}
                  onChange={(e) => setNewCategoryKey(e.target.value.toLowerCase().replace(/[^a-z_]/g, ''))}
                  placeholder="nur_kleine_buchstaben_und_unterstriche"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category-label">Anzeigename</Label>
                <Input
                  id="category-label"
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  placeholder="z.B. Marketing & Werbung"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button 
                onClick={(e) => {
                  e.preventDefault()
                  // console.log('Button clicked!')
                  handleAddCategory()
                }}
                disabled={loading}
              >
                {loading ? 'Wird hinzugefügt...' : 'Hinzufügen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Dialog */}
        <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Kategorie bearbeiten</DialogTitle>
              <DialogDescription>
                Ändern Sie den Anzeigenamen der Kategorie "{editingCategory?.key}".
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-2">
              <Label htmlFor="edit-label">Anzeigename</Label>
              <Input
                id="edit-label"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="z.B. Marketing & Werbung"
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditCategory}>
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}