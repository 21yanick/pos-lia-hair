import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Skeleton } from "@/shared/components/ui/skeleton"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog"
import { 
  Eye, 
  Download, 
  Trash2 
} from "lucide-react"
import { useState } from "react"
import { formatDisplayDate, getDocumentTypeName, getBadgeVariant, formatFileSize } from "@/app/(auth)/documents/utils/documentHelpers"
import type { DocumentWithDetails } from "@/lib/hooks/business/useDocuments"

interface DocumentsTableProps {
  documents: DocumentWithDetails[]
  loading: boolean
  onDelete: (id: string) => Promise<void>
}

export function DocumentsTable({ documents, loading, onDelete }: DocumentsTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setDocumentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return
    
    await onDelete(documentToDelete)
    setDeleteDialogOpen(false)
    setDocumentToDelete(null)
  }

  const handleView = (url?: string) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleDownload = (url?: string, filename?: string) => {
    if (url) {
      const a = document.createElement('a')
      a.href = url
      a.download = filename || 'download'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  if (loading) {
    return (
      <div className="rounded-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-3"><Skeleton className="h-5 w-20" /></th>
              <th className="p-3"><Skeleton className="h-5 w-16" /></th>
              <th className="p-3"><Skeleton className="h-5 w-16" /></th>
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
                  <Skeleton className="h-4 w-16" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-6 w-20" />
                </td>
                <td className="p-3 text-right">
                  <div className="flex gap-1 justify-end">
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
    )
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr className="text-left">
              <th className="p-3 font-medium text-sm">Dokument</th>
              <th className="p-3 font-medium text-sm">Typ</th>
              <th className="p-3 font-medium text-sm">Referenz</th>
              <th className="p-3 font-medium text-sm">Größe</th>
              <th className="p-3 font-medium text-sm">Erstellt</th>
              <th className="p-3 font-medium text-sm">Status</th>
              <th className="p-3 font-medium text-sm">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => {
              const IconComponent = doc.icon
              return (
                <tr key={doc.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                        {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
                      </div>
                      <div className="truncate font-medium max-w-xs">
                        {doc.displayName || doc.file_path?.split('/').pop()}
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={getBadgeVariant(doc.type)}>
                      {getDocumentTypeName(doc.type)}
                    </Badge>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    <div className="truncate max-w-xs">
                      {doc.reference_id ? (
                        <span className="font-mono text-xs">
                          {doc.reference_id.substring(0, 8)}...
                        </span>
                      ) : '-'}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {doc.fileSize ? formatFileSize(doc.fileSize) : '-'}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">
                    <div className="space-y-1">
                      <div>{doc.created_at ? formatDisplayDate(doc.created_at) : '-'}</div>
                      {doc.user_id && (
                        <div className="text-xs text-muted-foreground">
                          von {doc.user_id.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <Badge variant={doc.url ? "default" : "secondary"}>
                      {doc.url ? "Verfügbar" : "Verarbeitung"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleView(doc.url)}
                              disabled={!doc.url}
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
                              disabled={!doc.url}
                              onClick={() => handleDownload(doc.url, doc.displayName)}
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
                              className="hover:text-destructive"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Löschen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}