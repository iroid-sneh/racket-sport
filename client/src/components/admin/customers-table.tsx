import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount, formatDate } from "@/lib/customers-data"
import type { Customer, MembershipTier, MembershipStatus, SportLevel, AgeRange, Gender } from "@/lib/customers-data"

// ─── Badge styles ─────────────────────────────────────────────────────────────

const MEMBERSHIP_TIER_STYLES: Record<MembershipTier, { label: string; className: string }> = {
  vip: {
    label: "VIP",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
  premium: {
    label: "Premium",
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },
  basic: {
    label: "Basic",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  none: {
    label: "Non-member",
    className: "bg-muted text-muted-foreground border-border",
  },
}

const MEMBERSHIP_STATUS_STYLES: Record<MembershipStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "text-emerald-600",
  },
  expired: {
    label: "Expired",
    className: "text-amber-600",
  },
  cancelled: {
    label: "Cancelled",
    className: "text-muted-foreground",
  },
}

const LEVEL_COLORS: Record<SportLevel, string> = {
  beginner: "bg-emerald-100 text-emerald-700",
  improver: "bg-teal-100 text-teal-700",
  intermediate: "bg-blue-100 text-blue-700",
  advanced: "bg-violet-100 text-violet-700",
  expert: "bg-amber-100 text-amber-700",
}

const SPORT_COLORS: Record<string, string> = {
  Tennis: "bg-emerald-100 text-emerald-700",
  Padel: "bg-blue-100 text-blue-700",
  Pickleball: "bg-orange-100 text-orange-700",
}

const GENDER_LABELS: Record<Gender, string> = {
  male: "Male",
  female: "Female",
  "prefer-not-to-say": "Prefer not to say",
}

const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  "13-17": "13-17",
  "18-24": "18-24",
  "25-34": "25-34",
  "35-44": "35-44",
  "44-54": "44-54",
  "55-64": "55-64",
  "65-74": "65-74",
  "75+": "75+",
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

type SortKey = "name" | "email" | "membership" | "lastVisit" | "bookings" | "spent"
type SortDir = "asc" | "desc"

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
  return dir === "asc" ? (
    <ChevronUp className="h-3.5 w-3.5" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5" />
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface CustomerRowProps {
  customer: Customer
  onClick: () => void
}

function CustomerRow({ customer, onClick }: CustomerRowProps) {
  const tierCfg = MEMBERSHIP_TIER_STYLES[customer.membership.tier]
  const statusCfg = MEMBERSHIP_STATUS_STYLES[customer.membership.status]

  return (
    <tr
      className="group border-b border-border transition-colors hover:bg-muted/20 cursor-pointer"
      onClick={onClick}
    >
      {/* Customer */}
      <td className="py-3 pl-4 pr-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white",
              customer.avatarColor
            )}
          >
            {customer.initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-medium text-foreground truncate">
              {customer.name}
            </span>
            <span className="text-[11px] text-muted-foreground truncate">
              {customer.email}
            </span>
          </div>
        </div>
      </td>

      {/* Phone */}
      <td className="py-3 pr-6">
        <span className="text-xs text-muted-foreground">{customer.phone}</span>
      </td>

      {/* Membership */}
      <td className="py-3 pr-6">
        <div className="flex flex-col gap-1">
          <span
            className={cn(
              "inline-flex w-fit items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
              tierCfg.className
            )}
          >
            {tierCfg.label}
          </span>
          {customer.membership.tier !== "none" && (
            <span className={cn("text-[10px] font-medium", statusCfg.className)}>
              {statusCfg.label}
              {customer.membership.status === "active" && customer.membership.endDate && (
                <span className="text-muted-foreground font-normal">
                  {" "}· Expires {formatDate(customer.membership.endDate)}
                </span>
              )}
            </span>
          )}
        </div>
      </td>

      {/* Sports */}
      <td className="py-3 pr-6">
        <div className="flex flex-wrap gap-1">
          {customer.sports.slice(0, 2).map((sp) => (
            <span
              key={sp.sport}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                SPORT_COLORS[sp.sport] || "bg-muted text-muted-foreground"
              )}
            >
              {sp.sport}
            </span>
          ))}
          {customer.sports.length > 2 && (
            <span className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
              +{customer.sports.length - 2}
            </span>
          )}
        </div>
      </td>

      {/* Level */}
      <td className="py-3 pr-6">
        <div className="flex flex-wrap gap-1">
          {customer.sports.slice(0, 2).map((sp) => (
            <span
              key={`${sp.sport}-level`}
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium capitalize",
                LEVEL_COLORS[sp.level]
              )}
            >
              {sp.level}
            </span>
          ))}
        </div>
      </td>

      {/* Age Range */}
      <td className="py-3 pr-6">
        <span className="text-xs text-muted-foreground">
          {customer.ageRange ? AGE_RANGE_LABELS[customer.ageRange] : "-"}
        </span>
      </td>

      {/* Gender */}
      <td className="py-3 pr-6">
        <span className="text-xs text-muted-foreground">
          {customer.gender ? GENDER_LABELS[customer.gender] : "-"}
        </span>
      </td>

      {/* Last visit */}
      <td className="py-3 pr-6">
        <span className="text-xs text-muted-foreground">
          {formatDate(customer.lastVisit)}
        </span>
      </td>

      {/* Bookings */}
      <td className="py-3 pr-6 text-center">
        <span className="text-xs font-medium text-foreground tabular-nums">
          {customer.totalBookings}
        </span>
      </td>

      {/* Total spent */}
      <td className="py-3 pr-4 text-right">
        <span className="text-xs font-semibold text-foreground tabular-nums">
          {formatAmount(customer.totalSpent)}
        </span>
      </td>
    </tr>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface CustomersTableProps {
  customers: Customer[]
  onCustomerClick: (customer: Customer) => void
}

export function CustomersTable({ customers, onCustomerClick }: CustomersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sorted = [...customers].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case "name":
        cmp = a.name.localeCompare(b.name)
        break
      case "email":
        cmp = a.email.localeCompare(b.email)
        break
      case "membership":
        const tierOrder = { vip: 0, premium: 1, basic: 2, none: 3 }
        cmp = tierOrder[a.membership.tier] - tierOrder[b.membership.tier]
        break
      case "lastVisit":
        cmp = a.lastVisit.localeCompare(b.lastVisit)
        break
      case "bookings":
        cmp = a.totalBookings - b.totalBookings
        break
      case "spent":
        cmp = a.totalSpent - b.totalSpent
        break
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  function Th({
    children,
    sortable,
    align = "left",
    className,
  }: {
    children: React.ReactNode
    sortable?: SortKey
    align?: "left" | "right" | "center"
    className?: string
  }) {
    const isActive = sortable === sortKey
    return (
      <th
        className={cn(
          "border-b border-border bg-muted/30 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground select-none",
          align === "right" && "text-right pr-4",
          align === "center" && "text-center",
          align === "left" && "text-left",
          sortable && "cursor-pointer hover:text-foreground transition-colors",
          className
        )}
        onClick={sortable ? () => handleSort(sortable) : undefined}
      >
        <div
          className={cn(
            "flex items-center gap-1",
            align === "right" && "justify-end",
            align === "center" && "justify-center"
          )}
        >
          {children}
          {sortable && <SortIcon active={isActive} dir={sortDir} />}
        </div>
      </th>
    )
  }

  if (customers.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No customers found</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full min-w-[1200px] border-collapse">
        <thead className="sticky top-0 z-10">
          <tr>
            <Th sortable="name" className="pl-4 pr-4 w-48">
              Customer
            </Th>
            <Th className="pr-6 w-32">Phone</Th>
            <Th sortable="membership" className="pr-6 w-32">
              Membership
            </Th>
            <Th className="pr-6 w-28">Sports</Th>
            <Th className="pr-6 w-28">Level</Th>
            <Th className="pr-6 w-20">Age</Th>
            <Th className="pr-6 w-28">Gender</Th>
            <Th sortable="lastVisit" className="pr-6 w-28">
              Last Visit
            </Th>
            <Th sortable="bookings" align="center" className="pr-6 w-20">
              Bookings
            </Th>
            <Th sortable="spent" align="right" className="w-24">
              Total Spent
            </Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((customer) => (
            <CustomerRow
              key={customer.id}
              customer={customer}
              onClick={() => onCustomerClick(customer)}
            />
          ))}
        </tbody>
        {/* Footer totals */}
        <tfoot>
          <tr className="border-t-2 border-border bg-muted/20">
            <td colSpan={8} className="py-3 pl-4 text-xs font-medium text-muted-foreground">
              {customers.length} customer{customers.length !== 1 ? "s" : ""}
            </td>
            <td className="py-3 pr-6 text-center text-xs font-medium text-muted-foreground tabular-nums">
              {customers.reduce((sum, c) => sum + c.totalBookings, 0)}
            </td>
            <td className="py-3 pr-4 text-right text-sm font-bold text-foreground tabular-nums">
              {formatAmount(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
