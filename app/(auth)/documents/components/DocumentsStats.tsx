import { Card, CardContent } from "@/components/ui/card"
import { 
  FileText, 
  Receipt, 
  Calendar, 
  BarChart 
} from "lucide-react"
import type { DocumentSummary } from "@/lib/hooks/business/useDocuments"

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
              <p className="text-sm font-medium text-gray-500">Gesamt</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-full">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Quittungen</p>
              <p className="text-2xl font-bold">{summary.byType.receipt}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <Receipt className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tagesberichte</p>
              <p className="text-2xl font-bold">{summary.byType.daily_report}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Ausgabenbelege</p>
              <p className="text-2xl font-bold">{summary.byType.expense_receipt}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-full">
              <FileText className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}