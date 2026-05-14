import { useState, useMemo } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { PaymentsHeader } from "@/components/admin/payments-header"
import { PaymentsFilters, type PaymentsFiltersState } from "@/components/admin/payments-filters"
import { PaymentsTable } from "@/components/admin/payments-table"
import { ManualPaymentModal } from "@/components/admin/manual-payment-modal"
import { SAMPLE_PAYMENTS, getDateRange } from "@/lib/payments-data"

const DEFAULT_FILTERS: PaymentsFiltersState = {
  search: "",
  quickDate: null,
  dateFrom: undefined,
  dateTo: undefined,
  category: "all",
  paymentMethod: "all",
  status: "all",
}

export default function PaymentsPage() {
  const [filters, setFilters] = useState<PaymentsFiltersState>(DEFAULT_FILTERS)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false)

  // ─── Derived filter state ────────────────────────────────────────────────

  const filteredPayments = useMemo(() => {
    return SAMPLE_PAYMENTS.filter((payment) => {
      // Search: match booking ID, service name, or any player name/email
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase()
        const matchesBooking = payment.bookingId.toLowerCase().includes(q)
        const matchesService = payment.service.toLowerCase().includes(q)
        const matchesPlayer = payment.players.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q)
        )
        if (!matchesBooking && !matchesService && !matchesPlayer) return false
      }

      // Category
      if (filters.category !== "all" && payment.category !== filters.category) return false

      // Payment method
      if (filters.paymentMethod !== "all" && payment.paymentMethod !== filters.paymentMethod) return false

      // Status
      if (filters.status !== "all" && payment.status !== filters.status) return false

      // Date filter
      const paymentDate = new Date(payment.date)
      paymentDate.setHours(0, 0, 0, 0)

      if (filters.quickDate && filters.quickDate !== "custom") {
        const range = getDateRange(filters.quickDate)
        if (range) {
          if (paymentDate < range.from || paymentDate > range.to) return false
        }
      } else if (filters.quickDate === "custom") {
        if (filters.dateFrom) {
          const from = new Date(filters.dateFrom)
          from.setHours(0, 0, 0, 0)
          if (paymentDate < from) return false
        }
        if (filters.dateTo) {
          const to = new Date(filters.dateTo)
          to.setHours(0, 0, 0, 0)
          if (paymentDate > to) return false
        }
      }

      return true
    })
  }, [filters])

  // ─── Active filter count (for "clear all" badge) ─────────────────────────

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count++
    if (filters.quickDate) count++
    if (filters.category !== "all") count++
    if (filters.paymentMethod !== "all") count++
    if (filters.status !== "all") count++
    return count
  }, [filters])

  // ─── Header stats (non-refunded total) ──────────────────────────────────

  const totalAmount = useMemo(
    () =>
      filteredPayments
        .filter((p) => p.status !== "refunded")
        .reduce((sum, p) => sum + p.amount, 0),
    [filteredPayments]
  )

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <PaymentsHeader
          totalCount={filteredPayments.length}
          totalAmount={totalAmount}
          onAddPayment={() => setManualPaymentOpen(true)}
        />

        <PaymentsFilters
          filters={filters}
          onChange={setFilters}
          activeCount={activeFilterCount}
          onClearAll={() => setFilters(DEFAULT_FILTERS)}
        />

        <PaymentsTable payments={filteredPayments} />
      </main>

      <ManualPaymentModal
        open={manualPaymentOpen}
        onClose={() => setManualPaymentOpen(false)}
      />
    </div>
  )
}
