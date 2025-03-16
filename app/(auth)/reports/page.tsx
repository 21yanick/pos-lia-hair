import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, BookOpen, BarChart4 } from "lucide-react"
import Link from "next/link"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Abschlüsse</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tagesabschlüsse</CardTitle>
            <CardDescription>Tägliche Umsätze und Kassenabschlüsse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/reports/daily">Tagesabschlüsse anzeigen</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kassenbuch</CardTitle>
            <CardDescription>Ein- und Ausgänge der Kasse</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/reports/cash-register">Kassenbuch anzeigen</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monatsabschlüsse</CardTitle>
            <CardDescription>Monatliche Umsatzübersichten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
                <BarChart4 className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <Button asChild className="w-full">
              <Link href="/reports/monthly">Monatsabschlüsse anzeigen</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

