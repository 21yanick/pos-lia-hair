import { Card, CardContent } from "@/shared/components/ui/card"
import { 
  FileText, 
  Receipt, 
  Calendar, 
  BarChart 
} from "lucide-react"
import type { DocumentSummary } from "@/shared/hooks/business/useDocuments"

interface DocumentsStatsProps {
  summary: DocumentSummary
}

export function DocumentsStats({ summary }: DocumentsStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
            <div className="p-2 bg-muted rounded-full">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Quittungen</p>
              <p className="text-2xl font-bold">{summary.byType.receipt}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-full">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tagesberichte</p>
              <p className="text-2xl font-bold">{summary.byType.daily_report}</p>
            </div>
            <div className="p-2 bg-success/10 rounded-full">
              <Calendar className="h-6 w-6 text-success" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ausgabenbelege</p>
              <p className="text-2xl font-bold">{summary.byType.expense_receipt}</p>
            </div>
            <div className="p-2 bg-warning/10 rounded-full">
              <FileText className="h-6 w-6 text-warning" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}