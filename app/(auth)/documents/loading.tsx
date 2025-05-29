import { Skeleton } from "@/components/ui/skeleton"
import { Search, Upload } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dokumente</h1>
        <Skeleton className="h-10 w-40" />
      </div>

      {/* Statistikkarten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-12" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Skeleton className="h-10 w-full pl-10" />
        </div>

        <Skeleton className="h-10 w-full md:w-[500px]" />
      </div>

      {/* Tabelle mit Skeleton */}
      <div className="rounded-md border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="p-3"><Skeleton className="h-5 w-20" /></th>
              <th className="p-3"><Skeleton className="h-5 w-16" /></th>
              <th className="p-3"><Skeleton className="h-5 w-16" /></th>
              <th className="p-3"><Skeleton className="h-5 w-16" /></th>
              <th className="p-3"><Skeleton className="h-5 w-16" /></th>
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
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
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
    </div>
  )
}

