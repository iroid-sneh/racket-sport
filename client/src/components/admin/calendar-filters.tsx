import { ChevronDown, Eye, EyeOff, Check, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"


interface CalendarFiltersProps {
  viewMode: "courts" | "coaches"
  onViewModeChange: (mode: "courts" | "coaches") => void
  showCancelled: boolean
  onShowCancelledChange: (show: boolean) => void
  selectedSport: string
  onSportChange: (sport: string) => void
  timeView: "daily" | "monthly"
  onTimeViewChange: (view: "daily" | "monthly") => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

const sports = ["All Sports", "Tennis", "Padel", "Pickleball"]
const timeViews = [
  { value: "daily", label: "Daily" },
  { value: "monthly", label: "Monthly" },
] as const

function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex rounded-lg border border-border p-0.5 bg-muted/30">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
            value === opt.value
              ? "bg-card text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function CalendarFilters({
  viewMode,
  onViewModeChange,
  showCancelled,
  onShowCancelledChange,
  selectedSport,
  onSportChange,
  timeView,
  onTimeViewChange,
  searchQuery,
  onSearchChange,
}: CalendarFiltersProps) {
  return (
    <div className="flex items-center gap-2.5 border-b border-border bg-card px-6 py-2.5">

      {/* Time View Toggle */}
      <SegmentedToggle
        options={timeViews as unknown as { value: string; label: string }[]}
        value={timeView}
        onChange={(v) => onTimeViewChange(v as "daily" | "monthly")}
      />

      <div className="h-5 w-px bg-border" />

      {/* Courts / Coaches Toggle — only show on non-monthly views */}
      {timeView !== "monthly" && (
        <SegmentedToggle
          options={[
            { value: "courts", label: "Courts" },
            { value: "coaches", label: "Coaches" },
          ]}
          value={viewMode}
          onChange={(v) => onViewModeChange(v as "courts" | "coaches")}
        />
      )}

      {/* Sport Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-2 text-xs font-medium border-border"
          >
            {selectedSport}
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-36">
          {sports.map((sport) => (
            <DropdownMenuItem
              key={sport}
              onClick={() => onSportChange(sport)}
              className="flex items-center justify-between text-xs"
            >
              {sport}
              {selectedSport === sport && <Check className="h-3.5 w-3.5" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search + Cancelled — daily view only */}
      {timeView !== "monthly" && (
        <>
          {/* Search Bar */}
          <div className="relative w-44">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name..."
              className="h-8 pl-8 pr-8 text-xs border-border"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Cancelled Toggle */}
          <button
            onClick={() => onShowCancelledChange(!showCancelled)}
            className={cn(
              "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all shrink-0",
              showCancelled
                ? "border-foreground/30 bg-secondary text-foreground"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
          >
            {showCancelled ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            Cancelled
          </button>
        </>
      )}
    </div>
  )
}
