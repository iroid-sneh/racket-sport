import { useState, useMemo } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { CustomersHeader } from "@/components/admin/customers-header"
import { CustomersFilters, type CustomersFiltersState } from "@/components/admin/customers-filters"
import { CustomersTable } from "@/components/admin/customers-table"
import { CustomerDetailPanel } from "@/components/admin/customer-detail-panel"
import { AddCustomerModal } from "@/components/admin/add-customer-modal"
import { SAMPLE_CUSTOMERS } from "@/lib/customers-data"
import type { Customer } from "@/lib/customers-data"

const DEFAULT_FILTERS: CustomersFiltersState = {
  search: "",
  membershipTier: "all",
  membershipStatus: "all",
  sport: "all",
  level: "all",
}

export default function CustomersPage() {
  const [filters, setFilters] = useState<CustomersFiltersState>(DEFAULT_FILTERS)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [addModalOpen, setAddModalOpen] = useState(false)

  // ─── Filtered customers ─────────────────────────────────────────────────────

  const filteredCustomers = useMemo(() => {
    return SAMPLE_CUSTOMERS.filter((customer) => {
      // Search: match name, email, or phone
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase()
        const matchesName = customer.name.toLowerCase().includes(q)
        const matchesEmail = customer.email.toLowerCase().includes(q)
        const matchesPhone = customer.phone.toLowerCase().includes(q)
        if (!matchesName && !matchesEmail && !matchesPhone) return false
      }

      // Membership tier
      if (filters.membershipTier !== "all" && customer.membership.tier !== filters.membershipTier) {
        return false
      }

      // Membership status
      if (filters.membershipStatus !== "all" && customer.membership.status !== filters.membershipStatus) {
        return false
      }

      // Sport
      if (filters.sport !== "all") {
        const hasSport = customer.sports.some((sp) => sp.sport === filters.sport)
        if (!hasSport) return false
      }

      // Level
      if (filters.level !== "all") {
        const hasLevel = customer.sports.some((sp) => sp.level === filters.level)
        if (!hasLevel) return false
      }

      return true
    })
  }, [filters])

  // ─── Active filter count ────────────────────────────────────────────────────

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.search.trim()) count++
    if (filters.membershipTier !== "all") count++
    if (filters.membershipStatus !== "all") count++
    if (filters.sport !== "all") count++
    if (filters.level !== "all") count++
    return count
  }, [filters])

  // ─── Stats ──────────────────────────────────────────────────────────────────

  const activeMembers = useMemo(
    () =>
      filteredCustomers.filter(
        (c) => c.membership.tier !== "none" && c.membership.status === "active"
      ).length,
    [filteredCustomers]
  )

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <CustomersHeader
          totalCount={filteredCustomers.length}
          activeMembers={activeMembers}
          onAddCustomer={() => setAddModalOpen(true)}
        />

        <CustomersFilters
          filters={filters}
          onChange={setFilters}
          activeCount={activeFilterCount}
          onClearAll={() => setFilters(DEFAULT_FILTERS)}
        />

        <CustomersTable
          customers={filteredCustomers}
          onCustomerClick={(customer) => setSelectedCustomer(customer)}
        />
      </main>

      {/* Detail panel (slide-out drawer) */}
      <CustomerDetailPanel
        customer={selectedCustomer}
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* Add customer modal */}
      <AddCustomerModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  )
}
