import { useState } from "react"
import { cn, generateId } from "@/lib/utils"
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  GripVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Location } from "@/pages/SetupPage"

// ---- Types ----

interface TimeRange {
  id: string
  from: string
  to: string
}

interface PricingCondition {
  id: string
  name: string
  price: string
  timeRanges: TimeRange[]
  appliesTo: "days" | "dateRange"
  days: string[]
  dateFrom: string
  dateTo: string
}

interface CourtPrice {
  courtName: string
  price: string
}

interface Duration {
  id: string
  minutes: string
  /** When false, a single basePrice applies to all courts. When true, each court has its own price. */
  pricePerCourt: boolean
  basePrice: string
  courtPrices: CourtPrice[]
  conditions: PricingCondition[]
  expanded: boolean
}

interface Activity {
  id: string
  name: string
  duration: string
  capacityMin: string
  capacityMax: string
  pricePerPlayer: string
  levelRestriction: boolean
  levelRange: [number, number]
  expanded: boolean
}

// ---- Helpers ----

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const LEVEL_LABELS = ["Beginner", "Improver", "Intermediate", "Advanced", "Expert"]
const DURATION_OPTIONS = ["30", "45", "60", "90", "120"]

function newDuration(): Duration {
  return {
    id: generateId(),
    minutes: "60",
    pricePerCourt: false,
    basePrice: "0.00",
    courtPrices: [
      { courtName: "Court 1", price: "0.00" },
      { courtName: "Court 2", price: "0.00" },
    ],
    conditions: [],
    expanded: true,
  }
}

function newTimeRange(): TimeRange {
  return { id: generateId(), from: "08:00", to: "22:00" }
}

function newCondition(): PricingCondition {
  return {
    id: generateId(),
    name: "",
    price: "0.00",
    timeRanges: [newTimeRange()],
    appliesTo: "days",
    days: [],
    dateFrom: "",
    dateTo: "",
  }
}

function newActivity(): Activity {
  return {
    id: generateId(),
    name: "New Activity",
    duration: "60",
    capacityMin: "4",
    capacityMax: "8",
    pricePerPlayer: "0.00",
    levelRestriction: false,
    levelRange: [1, 3],
    expanded: true,
  }
}

// ---- Sub-components ----

function DayToggle({
  day,
  selected,
  onClick,
}: {
  day: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-7 w-10 rounded-md border text-[10px] font-medium transition-colors",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted"
      )}
    >
      {day}
    </button>
  )
}

function PricingConditionCard({
  condition,
  onChange,
  onDelete,
}: {
  condition: PricingCondition
  onChange: (c: PricingCondition) => void
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(true)
  const displayName = condition.name.trim() || "Condition name (e.g. Peak, Off-peak)"

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <div className="rounded-lg border border-border bg-background">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <span className={cn("text-xs", condition.name.trim() ? "text-foreground" : "text-muted-foreground")}>
              {displayName}
            </span>
            <div className="flex items-center gap-2">
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-4 flex flex-col gap-4 border-t border-border pt-4">
            {/* Condition name */}
            <Input
              value={condition.name}
              onChange={(e) => onChange({ ...condition, name: e.target.value })}
              className="h-8 text-xs"
              placeholder="Condition name (e.g. Peak, Off-peak)"
            />

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16 shrink-0">Price</span>
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <span className="text-xs text-muted-foreground px-2.5 py-1.5 bg-muted border-r border-border">£</span>
                <Input
                  type="text"
                  value={condition.price}
                  onChange={(e) => onChange({ ...condition, price: e.target.value })}
                  className="h-8 w-24 text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            {/* Time ranges */}
            <div className="flex gap-3">
              <span className="text-xs text-muted-foreground w-16 shrink-0 pt-1.5">Time</span>
              <div className="flex flex-col gap-2 flex-1">
                {condition.timeRanges.map((range, idx) => (
                  <div key={range.id} className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={range.from}
                      onChange={(e) => {
                        const updated = condition.timeRanges.map((r) =>
                          r.id === range.id ? { ...r, from: e.target.value } : r
                        )
                        onChange({ ...condition, timeRanges: updated })
                      }}
                      className="h-8 w-28 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={range.to}
                      onChange={(e) => {
                        const updated = condition.timeRanges.map((r) =>
                          r.id === range.id ? { ...r, to: e.target.value } : r
                        )
                        onChange({ ...condition, timeRanges: updated })
                      }}
                      className="h-8 w-28 text-xs"
                    />
                    {condition.timeRanges.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          onChange({
                            ...condition,
                            timeRanges: condition.timeRanges.filter((r) => r.id !== range.id),
                          })
                        }
                        className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                        aria-label="Remove time range"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...condition,
                      timeRanges: [...condition.timeRanges, newTimeRange()],
                    })
                  }
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit mt-0.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add time range
                </button>
              </div>
            </div>

            {/* Applies to */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-16 shrink-0">Applies to</span>
              <div className="flex items-center gap-0.5 rounded-lg border border-border p-0.5 bg-muted/30">
                <button
                  type="button"
                  onClick={() => onChange({ ...condition, appliesTo: "days" })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    condition.appliesTo === "days"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Days of week
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ ...condition, appliesTo: "dateRange" })}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    condition.appliesTo === "dateRange"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Date range
                </button>
              </div>
            </div>

            {/* Days or Date Range */}
            {condition.appliesTo === "days" ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">Days</span>
                <div className="flex flex-wrap gap-1.5">
                  {DAYS_SHORT.map((day) => (
                    <DayToggle
                      key={day}
                      day={day}
                      selected={condition.days.includes(day)}
                      onClick={() => {
                        const newDays = condition.days.includes(day)
                          ? condition.days.filter((d) => d !== day)
                          : [...condition.days, day]
                        onChange({ ...condition, days: newDays })
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 shrink-0">Dates</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={condition.dateFrom}
                    onChange={(e) => onChange({ ...condition, dateFrom: e.target.value })}
                    className="h-8 w-36 text-xs"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={condition.dateTo}
                    onChange={(e) => onChange({ ...condition, dateTo: e.target.value })}
                    className="h-8 w-36 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function DurationCard({
  duration,
  onChange,
  onDelete,
}: {
  duration: Duration
  onChange: (d: Duration) => void
  onDelete: () => void
}) {
  return (
    <Collapsible
      open={duration.expanded}
      onOpenChange={(open) => onChange({ ...duration, expanded: open })}
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                {duration.minutes} minutes
              </span>
            </div>
            <div className="flex items-center gap-2">
              {duration.expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border px-4 py-4 flex flex-col gap-5">
            {/* Duration input */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Duration</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Fixed length players book for
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="15"
                  step="15"
                  value={duration.minutes}
                  onChange={(e) => onChange({ ...duration, minutes: e.target.value })}
                  className="h-8 w-20 text-xs"
                />
                <span className="text-xs text-muted-foreground">minutes</span>
              </div>
            </div>

            {/* Price row — default is a single base price */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Price</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Price per booking
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Only show single price input when not in per-court mode */}
                {!duration.pricePerCourt && (
                  <div className="flex items-center border border-border rounded-md overflow-hidden">
                    <span className="text-xs text-muted-foreground px-2.5 py-1.5 bg-muted border-r border-border">£</span>
                    <Input
                      type="text"
                      value={duration.basePrice}
                      onChange={(e) => onChange({ ...duration, basePrice: e.target.value })}
                      className="h-8 w-24 text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                )}
                {/* Per-court toggle */}
                <div className="flex items-center gap-2">
                  <Switch
                    checked={duration.pricePerCourt}
                    onCheckedChange={(checked) =>
                      onChange({ ...duration, pricePerCourt: checked })
                    }
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">Per court</span>
                </div>
              </div>
            </div>

            {/* Individual court prices — shown only when per-court is on */}
            {duration.pricePerCourt && (
              <div className="flex flex-col gap-3 rounded-lg bg-muted/30 border border-border p-3">
                <p className="text-[11px] text-muted-foreground">Set a price individually for each court</p>
                {duration.courtPrices.map((cp, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{cp.courtName}</span>
                    <div className="flex items-center border border-border rounded-md overflow-hidden">
                      <span className="text-xs text-muted-foreground px-2.5 py-1.5 bg-muted border-r border-border">£</span>
                      <Input
                        type="text"
                        value={cp.price}
                        onChange={(e) => {
                          const newPrices = [...duration.courtPrices]
                          newPrices[idx] = { ...cp, price: e.target.value }
                          onChange({ ...duration, courtPrices: newPrices })
                        }}
                        className="h-8 w-24 text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Separator */}
            <div className="border-t border-border" />

            {/* Pricing conditions */}
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-semibold text-foreground">Pricing conditions</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Override the base price for specific times, days, or dates.
                </p>
              </div>

              {duration.conditions.map((cond) => (
                <PricingConditionCard
                  key={cond.id}
                  condition={cond}
                  onChange={(updated) =>
                    onChange({
                      ...duration,
                      conditions: duration.conditions.map((c) =>
                        c.id === updated.id ? updated : c
                      ),
                    })
                  }
                  onDelete={() =>
                    onChange({
                      ...duration,
                      conditions: duration.conditions.filter((c) => c.id !== cond.id),
                    })
                  }
                />
              ))}

              <button
                onClick={() =>
                  onChange({
                    ...duration,
                    conditions: [...duration.conditions, newCondition()],
                  })
                }
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <Plus className="h-3.5 w-3.5" />
                Add pricing condition
              </button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

function ActivityCard({
  activity,
  onChange,
  onDelete,
}: {
  activity: Activity
  onChange: (a: Activity) => void
  onDelete: () => void
}) {
  return (
    <Collapsible
      open={activity.expanded}
      onOpenChange={(open) => onChange({ ...activity, expanded: open })}
    >
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3">
              <GripVertical className="h-4 w-4 text-muted-foreground/30 cursor-grab" />
              <span className="text-sm font-semibold text-foreground">{activity.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {activity.expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border px-4 py-4 flex flex-col gap-5">
            {/* Activity name */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Name</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Activity display name
                </p>
              </div>
              <Input
                value={activity.name}
                onChange={(e) => onChange({ ...activity, name: e.target.value })}
                className="h-8 w-48 text-xs"
              />
            </div>

            {/* Duration */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Duration</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Fixed length players book for
                </p>
              </div>
              <Select
                value={activity.duration}
                onValueChange={(v) => onChange({ ...activity, duration: v })}
              >
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Capacity */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Capacity</span>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Min / Max participants
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={activity.capacityMin}
                  onChange={(e) => onChange({ ...activity, capacityMin: e.target.value })}
                  className="h-8 w-16 text-xs"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="number"
                  min="1"
                  value={activity.capacityMax}
                  onChange={(e) => onChange({ ...activity, capacityMax: e.target.value })}
                  className="h-8 w-16 text-xs"
                />
                <span className="text-xs text-muted-foreground">players</span>
              </div>
            </div>

            {/* Price per player */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Price per player</span>
              </div>
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <span className="text-xs text-muted-foreground px-2.5 py-1.5 bg-muted border-r border-border">£</span>
                <Input
                  type="text"
                  value={activity.pricePerPlayer}
                  onChange={(e) => onChange({ ...activity, pricePerPlayer: e.target.value })}
                  className="h-8 w-24 text-xs border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>

            {/* Level restriction */}
            <div className="flex flex-col gap-3 pt-2 border-t border-border">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-foreground">
                    Level restriction
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Restrict to players of a certain level
                  </p>
                </div>
                <Switch
                  checked={activity.levelRestriction}
                  onCheckedChange={(checked) =>
                    onChange({ ...activity, levelRestriction: checked })
                  }
                />
              </div>

              {activity.levelRestriction && (
                <div className="pt-1 pb-1">
                  <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={activity.levelRange}
                    onValueChange={(value) =>
                      onChange({ ...activity, levelRange: value as [number, number] })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between mt-3">
                    {LEVEL_LABELS.map((label, idx) => (
                      <div key={label} className="flex flex-col items-center">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          {idx + 1}
                        </span>
                        <span className="text-[9px] text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

// ---- Sport state per sport ----

interface SportServicesState {
  durations: Duration[]
  activities: Activity[]
}

function defaultSportState(): SportServicesState {
  return {
    durations: [newDuration()],
    activities: [{ ...newActivity(), name: "Beginner Training" }],
  }
}

// ---- Main Panel ----

type Tab = "bookings" | "activities"

interface Props {
  location: Location
}

export function SetupServicesPanel({ location }: Props) {
  const sports = location.sports

  // Active sport defaults to first in the list
  const [activeSportId, setActiveSportId] = useState<string>(sports[0]?.id ?? "")
  const [activeTab, setActiveTab] = useState<Tab>("bookings")

  // Per-sport services state keyed by sportId
  const [sportStateMap, setSportStateMap] = useState<Record<string, SportServicesState>>(() => {
    const map: Record<string, SportServicesState> = {}
    sports.forEach((s) => {
      map[s.id] = defaultSportState()
    })
    return map
  })

  const activeSport = sports.find((s) => s.id === activeSportId)
  const activeSportState = activeSportId ? sportStateMap[activeSportId] ?? defaultSportState() : null

  function updateSportState(patch: Partial<SportServicesState>) {
    if (!activeSportId) return
    setSportStateMap((prev) => ({
      ...prev,
      [activeSportId]: { ...(prev[activeSportId] ?? defaultSportState()), ...patch },
    }))
  }

  // No sports configured
  if (sports.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-2 text-center px-8">
        <p className="text-sm font-semibold text-foreground">No sports configured</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          Add sports to this location first before configuring services.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex items-start justify-between px-8 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Services</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure booking durations and activities
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs">
          Save Changes
        </Button>
      </div>

      {/* Sport selector — card-style row */}
      <div className="px-8 pb-4">
        <div className="grid grid-cols-2 gap-3 max-w-md">
          {sports.map((sport) => (
            <button
              key={sport.id}
              type="button"
              onClick={() => setActiveSportId(sport.id)}
              className={cn(
                "rounded-lg border bg-card px-4 py-3 text-sm font-semibold transition-all",
                activeSportId === sport.id
                  ? "border-foreground text-foreground shadow-sm"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              )}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      {activeSport && (
        <div className="px-8 border-b border-border flex items-center gap-6">
          <button
            onClick={() => setActiveTab("bookings")}
            className={cn(
              "text-sm font-semibold pb-3 -mb-px border-b-2 transition-colors",
              activeTab === "bookings"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab("activities")}
            className={cn(
              "text-sm font-semibold pb-3 -mb-px border-b-2 transition-colors",
              activeTab === "activities"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            Activities
          </button>
        </div>
      )}

      {/* Content */}
      {activeSport && activeSportState && (
        <div className="px-8 py-5 pb-10">
          <div className="max-w-2xl">
            {activeTab === "bookings" && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground">
                  Configure booking durations and their pricing for{" "}
                  <span className="font-medium text-foreground">{activeSport.name}</span>. Set a single price or enable per-court pricing for venues with different court types.
                </p>

                {activeSportState.durations.map((dur) => (
                  <DurationCard
                    key={dur.id}
                    duration={dur}
                    onChange={(updated) =>
                      updateSportState({
                        durations: activeSportState.durations.map((d) =>
                          d.id === updated.id ? updated : d
                        ),
                      })
                    }
                    onDelete={() =>
                      updateSportState({
                        durations: activeSportState.durations.filter((d) => d.id !== dur.id),
                      })
                    }
                  />
                ))}

                {/* Add duration button */}
                <button
                  onClick={() =>
                    updateSportState({
                      durations: [...activeSportState.durations, newDuration()],
                    })
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add duration
                </button>
              </div>
            )}

            {activeTab === "activities" && (
              <div className="flex flex-col gap-4">
                <p className="text-xs text-muted-foreground">
                  Manage group activities for{" "}
                  <span className="font-medium text-foreground">{activeSport.name}</span> such as coaching sessions, clinics, and training programs.
                </p>

                {activeSportState.activities.map((act) => (
                  <ActivityCard
                    key={act.id}
                    activity={act}
                    onChange={(updated) =>
                      updateSportState({
                        activities: activeSportState.activities.map((a) =>
                          a.id === updated.id ? updated : a
                        ),
                      })
                    }
                    onDelete={() =>
                      updateSportState({
                        activities: activeSportState.activities.filter((a) => a.id !== act.id),
                      })
                    }
                  />
                ))}

                {/* Add activity button */}
                <button
                  onClick={() =>
                    updateSportState({
                      activities: [...activeSportState.activities, newActivity()],
                    })
                  }
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add activity
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
