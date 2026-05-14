import { ChevronDown, Check, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { MembershipTier, MembershipStatus, SportLevel } from "@/lib/customers-data"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CustomersFiltersState {
  search: string
  membershipTier: MembershipTier | "all"
  membershipStatus: MembershipStatus | "all"
  sport: string | "all"
  level: SportLevel | "all"
}

interface CustomersFiltersProps {
  filters: CustomersFiltersState
  onChange: (filters: CustomersFiltersState) => void
  activeCount: number
  onClearAll: () => void
}

// ─── Static options ───────────────────────────────────────────────────────────

const MEMBERSHIP_TIER_OPTIONS: { value: MembershipTier | "all"; label: string }[] = [
  { value: "all", label: "All Tiers" },
  { value: "vip", label: "VIP" },
  { value: "premium", label: "Premium" },
  { value: "basic", label: "Basic" },
  { value: "none", label: "Non-member" },
]

const MEMBERSHIP_STATUS_OPTIONS: { value: MembershipStatus | "all"; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "cancelled", label: "Cancelled" },
]

const SPORT_OPTIONS: { value: string | "all"; label: string }[] = [
  { value: "all", label: "All Sports" },
  { value: "Tennis", label: "Tennis" },
  { value: "Padel", label: "Padel" },
  { value: "Pickleball", label: "Pickleball" },
]

const LEVEL_OPTIONS: { value: SportLevel | "all"; label: string }[] = [
  { value: "all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "improver", label: "Improver" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
]

// ─── Dropdown helper ──────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  placeholder?: string
}) {
  const selected = options.find((o) => o.value === value)
  const isFiltered = value !== "all"
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs font-medium border-border",
            isFiltered && "border-foreground/30 bg-secondary text-foreground"
          )}
        >
          {selected?.label ?? placeholder ?? "—"}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-40">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center justify-between text-xs"
          >
            {opt.label}
            {value === opt.value && <Check className="h-3.5 w-3.5" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CustomersFilters({
  filters,
  onChange,
  activeCount,
  onClearAll,
}: CustomersFiltersProps) {
  function set<K extends keyof CustomersFiltersState>(
    key: K,
    value: CustomersFiltersState[K]
  ) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-6 py-2.5">
      {/* Search */}
      <div className="relative w-56">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search name, email, phone..."
          className="h-8 pl-8 pr-8 text-xs border-border"
        />
        {filters.search && (
          <button
            onClick={() => set("search", "")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="h-5 w-px bg-border" />

      {/* Membership tier */}
      <FilterDropdown
        options={MEMBERSHIP_TIER_OPTIONS}
        value={filters.membershipTier}
        onChange={(v) => set("membershipTier", v)}
        placeholder="Membership"
      />

      {/* Membership status */}
      <FilterDropdown
        options={MEMBERSHIP_STATUS_OPTIONS}
        value={filters.membershipStatus}
        onChange={(v) => set("membershipStatus", v)}
        placeholder="Status"
      />

      {/* Sport */}
      <FilterDropdown
        options={SPORT_OPTIONS}
        value={filters.sport}
        onChange={(v) => set("sport", v)}
        placeholder="Sport"
      />

      {/* Level */}
      <FilterDropdown
        options={LEVEL_OPTIONS}
        value={filters.level}
        onChange={(v) => set("level", v)}
        placeholder="Level"
      />

      <div className="flex-1" />

      {/* Active filter count + clear */}
      {activeCount > 0 && (
        <button
          onClick={onClearAll}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear all
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[9px] font-bold">
            {activeCount}
          </span>
        </button>
      )}
    </div>
  )
}
