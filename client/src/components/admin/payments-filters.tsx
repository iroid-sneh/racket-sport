import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check, Search, X, CalendarDays, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { ServiceCategory, PaymentMethod, PaymentStatus } from "@/lib/payments-data"

// ─── Types ───────────────────────────────────────────────────────────────────

export type QuickDatePreset = "today" | "yesterday" | "this_week" | "month_to_date" | "this_month" | "custom" | null

export interface PaymentsFiltersState {
  search: string
  quickDate: QuickDatePreset
  dateFrom: Date | undefined
  dateTo: Date | undefined
  category: ServiceCategory | "all"
  paymentMethod: PaymentMethod | "all"
  status: PaymentStatus | "all"
}

interface PaymentsFiltersProps {
  filters: PaymentsFiltersState
  onChange: (filters: PaymentsFiltersState) => void
  activeCount: number
  onClearAll: () => void
}

// ─── Static options ───────────────────────────────────────────────────────────

const QUICK_DATE_OPTIONS: { value: QuickDatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "this_week", label: "This Week" },
  { value: "month_to_date", label: "Month to Date" },
  { value: "this_month", label: "This Month" },
]

const CATEGORY_OPTIONS: { value: ServiceCategory | "all"; label: string }[] = [
  { value: "all", label: "Category" },
  { value: "booking", label: "Booking" },
  { value: "lesson", label: "Lesson" },
  { value: "activity", label: "Activity" },
  { value: "manual", label: "Manual" },
]

const METHOD_OPTIONS: { value: PaymentMethod | "all"; label: string }[] = [
  { value: "all", label: "Method" },
  { value: "card", label: "Card" },
  { value: "club_credit", label: "Club Credit" },
  { value: "cash", label: "Cash" },
]

const STATUS_OPTIONS: { value: PaymentStatus | "all"; label: string }[] = [
  { value: "all", label: "Status" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
]

// ─── Small helpers ────────────────────────────────────────────────────────────

function FilterDropdown<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}) {
  const selected = options.find((o) => o.value === value)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-8 gap-1.5 text-xs font-medium border-border",
            value !== "all" && "border-foreground/30 bg-secondary text-foreground"
          )}
        >
          {selected?.label ?? "—"}
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

function formatDateShort(d: Date) {
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PaymentsFilters({ filters, onChange, activeCount, onClearAll }: PaymentsFiltersProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [rangeStep, setRangeStep] = useState<"from" | "to">("from")

  function set<K extends keyof PaymentsFiltersState>(key: K, value: PaymentsFiltersState[K]) {
    onChange({ ...filters, [key]: value })
  }

  function handleQuickDate(preset: QuickDatePreset) {
    onChange({
      ...filters,
      quickDate: preset,
      dateFrom: undefined,
      dateTo: undefined,
    })
    if (preset !== "custom") setDatePopoverOpen(false)
  }

  function handleRangeSelect(day: Date | undefined) {
    if (!day) return
    if (rangeStep === "from") {
      onChange({ ...filters, quickDate: "custom", dateFrom: day, dateTo: undefined })
      setRangeStep("to")
    } else {
      const from = filters.dateFrom!
      if (day < from) {
        onChange({ ...filters, quickDate: "custom", dateFrom: day, dateTo: from })
      } else {
        onChange({ ...filters, quickDate: "custom", dateFrom: from, dateTo: day })
      }
      setRangeStep("from")
      setDatePopoverOpen(false)
    }
  }

  // Date button label
  let dateBtnLabel = "Date"
  if (filters.quickDate && filters.quickDate !== "custom") {
    dateBtnLabel = QUICK_DATE_OPTIONS.find((o) => o.value === filters.quickDate)?.label ?? "Date"
  } else if (filters.quickDate === "custom") {
    if (filters.dateFrom && filters.dateTo) {
      dateBtnLabel = `${formatDateShort(filters.dateFrom)} – ${formatDateShort(filters.dateTo)}`
    } else if (filters.dateFrom) {
      dateBtnLabel = `From ${formatDateShort(filters.dateFrom)}`
    } else {
      dateBtnLabel = "Custom Range"
    }
  }

  const dateActive = filters.quickDate !== null

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-6 py-2.5">

      {/* Search */}
      <div className="relative w-48">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={filters.search}
          onChange={(e) => set("search", e.target.value)}
          placeholder="Search customer, booking..."
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

      {/* Date filter — quick presets + custom range */}
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs font-medium border-border",
              dateActive && "border-foreground/30 bg-secondary text-foreground"
            )}
          >
            <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
            {dateBtnLabel}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0" sideOffset={6}>
          <div className="flex">
            {/* Quick presets */}
            <div className="flex flex-col border-r border-border p-1.5 gap-0.5 w-36">
              {QUICK_DATE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleQuickDate(opt.value)}
                  className={cn(
                    "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left",
                    filters.quickDate === opt.value
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  {opt.label}
                  {filters.quickDate === opt.value && <Check className="h-3 w-3" />}
                </button>
              ))}
              <div className="my-1 h-px bg-border" />
              <button
                onClick={() => {
                  onChange({ ...filters, quickDate: "custom", dateFrom: undefined, dateTo: undefined })
                  setRangeStep("from")
                }}
                className={cn(
                  "flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors text-left",
                  filters.quickDate === "custom"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                )}
              >
                Custom Range
                {filters.quickDate === "custom" && <Check className="h-3 w-3" />}
              </button>
              {dateActive && (
                <>
                  <div className="my-1 h-px bg-border" />
                  <button
                    onClick={() => {
                      onChange({ ...filters, quickDate: null, dateFrom: undefined, dateTo: undefined })
                      setDatePopoverOpen(false)
                    }}
                    className="rounded-md px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                  >
                    Clear date
                  </button>
                </>
              )}
            </div>

            {/* Calendar — only when custom is selected */}
            {filters.quickDate === "custom" && (
              <div className="p-2">
                <p className="px-2 pb-1.5 text-[11px] text-muted-foreground">
                  {rangeStep === "from" ? "Select start date" : "Select end date"}
                </p>
                <Calendar
                  mode="single"
                  selected={rangeStep === "from" ? filters.dateFrom : filters.dateTo}
                  onSelect={handleRangeSelect}
                  initialFocus
                  modifiers={{
                    range_start: filters.dateFrom ? [filters.dateFrom] : [],
                    range_end: filters.dateTo ? [filters.dateTo] : [],
                    range_middle:
                      filters.dateFrom && filters.dateTo
                        ? [{ from: filters.dateFrom, to: filters.dateTo }]
                        : [],
                  }}
                  modifiersClassNames={{
                    range_start: "bg-foreground text-background rounded-md",
                    range_end: "bg-foreground text-background rounded-md",
                    range_middle: "bg-secondary rounded-none",
                  }}
                />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Category */}
      <FilterDropdown
        options={CATEGORY_OPTIONS}
        value={filters.category}
        onChange={(v) => set("category", v)}
      />

      {/* Payment method */}
      <FilterDropdown
        options={METHOD_OPTIONS}
        value={filters.paymentMethod}
        onChange={(v) => set("paymentMethod", v)}
      />

      {/* Status */}
      <FilterDropdown
        options={STATUS_OPTIONS}
        value={filters.status}
        onChange={(v) => set("status", v)}
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
