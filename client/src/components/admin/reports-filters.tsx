import { useState } from "react"
import { ChevronDown, Check, CalendarDays, Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { ReportsFiltersState, SportFilter, ReportsQuickDate } from "@/lib/reports-data"
import type { ServiceCategory } from "@/lib/payments-data"

// ─── Static options ───────────────────────────────────────────────────────────

const QUICK_DATE_OPTIONS: { value: ReportsQuickDate; label: string }[] = [
  { value: "today",          label: "Today" },
  { value: "yesterday",      label: "Yesterday" },
  { value: "this_week",      label: "This Week" },
  { value: "month_to_date",  label: "Month to Date" },
  { value: "this_month",     label: "This Month" },
]

const SPORT_OPTIONS: { value: SportFilter; label: string }[] = [
  { value: "all",        label: "All Sports" },
  { value: "padel",      label: "Padel" },
  { value: "pickleball", label: "Pickleball" },
  { value: "tennis",     label: "Tennis" },
]

const CATEGORY_OPTIONS: { value: ServiceCategory | "all"; label: string }[] = [
  { value: "all",      label: "All Categories" },
  { value: "booking",  label: "Court Booking" },
  { value: "lesson",   label: "Lesson" },
  { value: "activity", label: "Activity" },
  { value: "manual",   label: "Manual" },
]

// ─── Generic filter dropdown ──────────────────────────────────────────────────

function FilterDropdown<T extends string>({
  options,
  value,
  onChange,
  allValue,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  allValue: T
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
            value !== allValue && "border-foreground/30 bg-secondary text-foreground"
          )}
        >
          {selected?.label ?? "—"}
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReportsFiltersProps {
  filters: ReportsFiltersState
  onChange: (f: ReportsFiltersState) => void
  onExport: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ReportsFilters({ filters, onChange, onExport }: ReportsFiltersProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const [rangeStep, setRangeStep] = useState<"from" | "to">("from")

  function set<K extends keyof ReportsFiltersState>(key: K, value: ReportsFiltersState[K]) {
    onChange({ ...filters, [key]: value })
  }

  function handleQuickDate(preset: ReportsQuickDate) {
    onChange({ ...filters, quickDate: preset, dateFrom: undefined, dateTo: undefined })
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
  let dateBtnLabel = "Date Range"
  if (filters.quickDate && filters.quickDate !== "custom") {
    dateBtnLabel = QUICK_DATE_OPTIONS.find((o) => o.value === filters.quickDate)?.label ?? "Date Range"
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
  const activeCount =
    (dateActive ? 1 : 0) +
    (filters.sport !== "all" ? 1 : 0) +
    (filters.category !== "all" ? 1 : 0)

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-6 py-2.5">

      {/* Date range with quick presets */}
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
            {/* Quick presets sidebar */}
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

            {/* Calendar — only for custom range */}
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

      <div className="h-5 w-px bg-border" />

      {/* Sport filter */}
      <FilterDropdown
        options={SPORT_OPTIONS}
        value={filters.sport}
        onChange={(v) => set("sport", v)}
        allValue="all"
      />

      {/* Category filter */}
      <FilterDropdown
        options={CATEGORY_OPTIONS}
        value={filters.category}
        onChange={(v) => set("category", v)}
        allValue="all"
      />

      <div className="flex-1" />

      {/* Clear all */}
      {activeCount > 0 && (
        <button
          onClick={() =>
            onChange({
              quickDate: null,
              dateFrom: undefined,
              dateTo: undefined,
              sport: "all",
              category: "all",
            })
          }
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear filters
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-[9px] font-bold">
            {activeCount}
          </span>
        </button>
      )}

      {/* Export CSV */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 text-xs font-medium border-border"
        onClick={onExport}
      >
        <Download className="h-3.5 w-3.5 text-muted-foreground" />
        Export CSV
      </Button>
    </div>
  )
}
