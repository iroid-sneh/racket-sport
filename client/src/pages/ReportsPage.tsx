import { useState, useCallback } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { ReportsHeader } from "@/components/admin/reports-header"
import { ReportsFilters } from "@/components/admin/reports-filters"
import { ReportsDashboard } from "@/components/admin/reports-dashboard"
import { deriveTopServices, derivePaymentMethodSplit } from "@/lib/reports-data"
import type { ReportsFiltersState } from "@/lib/reports-data"
import { formatAmount } from "@/lib/payments-data"

const DEFAULT_FILTERS: ReportsFiltersState = {
  quickDate:  null,
  dateFrom:   undefined,
  dateTo:     undefined,
  sport:      "all",
  category:   "all",
}

export default function ReportsPage() {
  const [filters, setFilters] = useState<ReportsFiltersState>(DEFAULT_FILTERS)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Export a summary CSV: top services + payment method split
  const handleExport = useCallback(() => {
    const services = deriveTopServices(filters)
    const methods = derivePaymentMethodSplit(filters)

    const serviceLines = [
      "Top Services by Revenue",
      ["Service", "Category", "Bookings", "Revenue"].join(","),
      ...services.map((r) =>
        [
          `"${r.service.replace(/"/g, '""')}"`,
          r.categoryLabel,
          r.bookings,
          formatAmount(r.revenue),
        ].join(",")
      ),
    ]

    const methodLines = [
      "",
      "Payment Method Split",
      ["Method", "Revenue"].join(","),
      ...methods.map((r) => [r.method, formatAmount(r.revenue)].join(",")),
    ]

    const csv = [...serviceLines, ...methodLines].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `opencourt-report-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [filters])

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <ReportsHeader />

        <ReportsFilters
          filters={filters}
          onChange={setFilters}
          onExport={handleExport}
        />

        <div className="flex-1 overflow-y-auto">
          <ReportsDashboard filters={filters} />
        </div>
      </main>
    </div>
  )
}
