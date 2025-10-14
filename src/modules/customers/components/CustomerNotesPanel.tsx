'use client'

import { FileText, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { useCurrentOrganization } from '@/shared/hooks/auth/useCurrentOrganization'
import type { CustomerNote, CustomerWithNotes } from '@/shared/services/customerService'
import { useCustomerActions } from '../hooks/useCustomerActions'
import { formatRelativeDate } from '../utils/customerUtils'

interface CustomerNotesPanelProps {
  customer: CustomerWithNotes
}

interface EditingNote {
  id: string
  block_name: string
  content: string
}

export function CustomerNotesPanel({ customer }: CustomerNotesPanelProps) {
  const { currentOrganization } = useCurrentOrganization()
  const { createNote, updateNote, deleteNote } = useCustomerActions(currentOrganization?.id || '')

  const [editingNote, setEditingNote] = useState<EditingNote | null>(null)
  const [deleteNoteId, setDeleteNoteId] = useState<string | null>(null)
  const [newNote, setNewNote] = useState({ block_name: '', content: '' })
  const [isAddingNote, setIsAddingNote] = useState(false)

  const handleAddNote = () => {
    setIsAddingNote(true)
    setNewNote({ block_name: '', content: '' })
  }

  const handleSaveNewNote = async () => {
    if (!newNote.block_name.trim() || !newNote.content.trim()) {
      toast.error('Fehler', {
        description: 'Titel und Inhalt sind erforderlich.',
      })
      return
    }

    try {
      await createNote.mutateAsync({
        customerId: customer.id,
        blockName: newNote.block_name.trim(),
        content: newNote.content.trim(),
      })

      setIsAddingNote(false)
      setNewNote({ block_name: '', content: '' })

      toast.success('Notiz erstellt', {
        description: 'Die Notiz wurde erfolgreich hinzugefügt.',
      })
    } catch (_error) {
      toast.error('Fehler', {
        description: 'Notiz konnte nicht erstellt werden.',
      })
    }
  }

  const handleCancelNewNote = () => {
    setIsAddingNote(false)
    setNewNote({ block_name: '', content: '' })
  }

  const handleEditNote = (note: CustomerNote) => {
    setEditingNote({
      id: note.id,
      block_name: note.block_name,
      content: note.content,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingNote) return

    if (!editingNote.block_name.trim() || !editingNote.content.trim()) {
      toast.error('Fehler', {
        description: 'Titel und Inhalt sind erforderlich.',
      })
      return
    }

    try {
      await updateNote.mutateAsync({
        noteId: editingNote.id,
        data: {
          block_name: editingNote.block_name.trim(),
          content: editingNote.content.trim(),
        },
        customerId: customer.id,
      })

      setEditingNote(null)

      toast.success('Notiz aktualisiert', {
        description: 'Die Änderungen wurden gespeichert.',
      })
    } catch (_error) {
      toast.error('Fehler', {
        description: 'Notiz konnte nicht aktualisiert werden.',
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingNote(null)
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote.mutateAsync({
        noteId,
        customerId: customer.id,
      })

      setDeleteNoteId(null)

      toast.success('Notiz gelöscht', {
        description: 'Die Notiz wurde entfernt.',
      })
    } catch (_error) {
      toast.error('Fehler', {
        description: 'Notiz konnte nicht gelöscht werden.',
      })
    }
  }

  const renderNoteCard = (note: CustomerNote) => {
    const isEditing = editingNote?.id === note.id

    if (isEditing) {
      return (
        <Card key={note.id} className="relative">
          <CardContent className="p-4">
            <div className="space-y-3">
              <Input
                value={editingNote.block_name}
                onChange={(e) => setEditingNote({ ...editingNote, block_name: e.target.value })}
                placeholder="z.B. Haarfarbe, Allergien, Präferenzen"
                className="font-semibold"
              />

              <Textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                placeholder="Notizen eingeben..."
                className="min-h-[80px] resize-none"
              />

              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={updateNote.isPending}>
                  {updateNote.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  Speichern
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={updateNote.isPending}
                >
                  Abbrechen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card key={note.id} className="relative group hover:shadow-sm transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-sm">{note.block_name}</h4>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEditNote(note)}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setDeleteNoteId(note.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>

          <div className="text-xs text-muted-foreground mt-3">
            {note.updated_at ? formatRelativeDate(note.updated_at) : 'Datum nicht verfügbar'}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Kundennotizen
        </CardTitle>
        {!isAddingNote && (
          <div className="mt-3">
            <Button size="sm" onClick={handleAddNote} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Notiz hinzufügen</span>
              <span className="xs:hidden">Hinzufügen</span>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Note Form */}
        {isAddingNote && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="space-y-3">
                <Input
                  value={newNote.block_name}
                  onChange={(e) => setNewNote({ ...newNote, block_name: e.target.value })}
                  placeholder="z.B. Haarfarbe, Allergien, Präferenzen"
                  className="font-semibold"
                />

                <Textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Notizen eingeben..."
                  className="min-h-[80px] resize-none"
                />

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveNewNote}
                    disabled={
                      createNote.isPending || !newNote.block_name.trim() || !newNote.content.trim()
                    }
                  >
                    {createNote.isPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Notiz erstellen
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelNewNote}
                    disabled={createNote.isPending}
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Notes */}
        {customer.notes.length > 0 ? (
          customer.notes.map(renderNoteCard)
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Noch keine Notizen vorhanden</p>
            {!isAddingNote && (
              <Button variant="ghost" size="sm" onClick={handleAddNote} className="mt-2">
                Erste Notiz hinzufügen
              </Button>
            )}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteNoteId} onOpenChange={() => setDeleteNoteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Notiz löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Sind Sie sicher, dass Sie diese Notiz löschen möchten? Diese Aktion kann nicht
                rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteNoteId && handleDeleteNote(deleteNoteId)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  )
}
