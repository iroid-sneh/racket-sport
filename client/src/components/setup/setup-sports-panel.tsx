import { useState } from "react"
import { cn, generateId } from "@/lib/utils"
import {
  Plus, Trash2, ChevronDown, Clock,
  LayoutGrid, GripVertical, Pencil, Check, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Location, Sport } from "@/pages/SetupPage"
import type { BookingType, PricingCondition } from "@/lib/setup-types"
import { newPricingCondition, DAYS_SHORT } from "@/lib/setup-types"

import type { Court } from "@/components/setup/setup-courts-panel"

interface Props {
  location: Location
  activeSportId: string
  onUpdateSport: (sport: Sport) => void
  courts: Court[]
}

// ---- Types ----

function newBookingType(): BookingType {
  return {
    id: generateId(),
    duration: "60",
    minCapacity: "1",
    maxCapacity: "4",
    perCourtPricing: false,
    pricePerCourt: "",
    courtPrices: {},
    pricingConditions: [],
    expanded: true,
  }
}

// ---- Sub-components ----

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-3.5 border-b border-border last:border-0">
      <div className="min-w-0 shrink-0 w-48">
        <Label className="text-xs font-semibold text-foreground">{label}</Label>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function Toggle2({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-border"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  )
}

function PriceInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-32">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.00"
        className="h-8 pl-6 text-xs w-full"
      />
    </div>
  )
}

// ---- Pricing condition card ----

function MiniCalendarRange({
  dateFrom,
  dateTo,
  onFromChange,
  onToChange,
}: {
  dateFrom: string
  dateTo: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
}) {
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })

  const { year, month } = calendarMonth
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = new Date(year, month, 1).toLocaleString("default", { month: "long" })

  const calendarCells: Array<{ iso: string; day: number } | null> = []
  for (let i = 0; i < firstDay; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    calendarCells.push({ iso, day: d })
  }

  function handleCellClick(iso: string) {
    if (!dateFrom || (dateFrom && dateTo)) {
      // Start a new range
      onFromChange(iso)
      onToChange("")
    } else {
      // Set end — ensure from <= to
      if (iso < dateFrom) {
        onToChange(dateFrom)
        onFromChange(iso)
      } else {
        onToChange(iso)
      }
    }
  }

  function inRange(iso: string) {
    if (!dateFrom || !dateTo) return false
    return iso > dateFrom && iso < dateTo
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 select-none w-full">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCalendarMonth(({ year, month }) =>
            month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 }
          )}
          className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5 rotate-90" />
        </button>
        <span className="text-xs font-semibold text-foreground">{monthName} {year}</span>
        <button
          onClick={() => setCalendarMonth(({ year, month }) =>
            month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 }
          )}
          className="text-muted-foreground hover:text-foreground p-0.5 transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAYS_SHORT.map((d) => (
          <span key={d} className="text-[9px] font-semibold text-muted-foreground text-center py-0.5">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {calendarCells.map((cell, i) =>
          cell === null ? (
            <div key={`empty-${i}`} />
          ) : (
            <button
              key={cell.iso}
              onClick={() => handleCellClick(cell.iso)}
              className={cn(
                "h-6 w-full text-[10px] font-medium transition-all",
                cell.iso === dateFrom || cell.iso === dateTo
                  ? "bg-primary text-primary-foreground rounded-md"
                  : inRange(cell.iso)
                    ? "bg-primary/15 text-foreground"
                    : "text-foreground hover:bg-muted rounded-md"
              )}
            >
              {cell.day}
            </button>
          )
        )}
      </div>
    </div>
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
  const mode = condition.conditionMode ?? "days"

  function toggleDay(day: string) {
    const next = condition.days.includes(day)
      ? condition.days.filter((d) => d !== day)
      : [...condition.days, day]
    onChange({ ...condition, days: next })
  }

  return (
    <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <Input
          value={condition.name}
          onChange={(e) => onChange({ ...condition, name: e.target.value })}
          placeholder="Condition name (e.g. Peak, Off-peak)"
          className="h-7 flex-1 text-xs border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-medium"
        />
        <button
          onClick={() => onChange({ ...condition, expanded: !condition.expanded })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", condition.expanded && "rotate-180")} />
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {condition.expanded && (
        <div className="px-3 py-3 flex flex-col gap-4">
          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-foreground w-24 shrink-0">Price</span>
            <PriceInput value={condition.price} onChange={(v) => onChange({ ...condition, price: v })} />
          </div>

          {/* Time range */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-foreground w-24 shrink-0">Time</span>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={condition.fromTime}
                onChange={(e) => onChange({ ...condition, fromTime: e.target.value })}
                className="h-7 w-24 text-xs px-2"
              />
              <span className="text-[11px] text-muted-foreground">to</span>
              <Input
                type="time"
                value={condition.toTime}
                onChange={(e) => onChange({ ...condition, toTime: e.target.value })}
                className="h-7 w-24 text-xs px-2"
              />
            </div>
          </div>

          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-foreground w-24 shrink-0">Applies to</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {(["days", "dates"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onChange({ ...condition, conditionMode: m })}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium transition-colors",
                    mode === m
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground bg-transparent"
                  )}
                >
                  {m === "days" ? "Days of week" : "Date range"}
                </button>
              ))}
            </div>
          </div>

          {/* Days of week */}
          {mode === "days" && (
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-foreground w-24 shrink-0 pt-0.5">Days</span>
              <div className="flex gap-1.5 flex-wrap">
                {DAYS_SHORT.map((d) => {
                  const active = (condition.days ?? []).includes(d)
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={cn(
                        "h-7 w-9 rounded-md text-[10px] font-semibold border transition-all",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                      )}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Date range */}
          {mode === "dates" && (
            <div className="flex items-start gap-3">
              <span className="text-xs font-medium text-foreground w-24 shrink-0 pt-1">Date range</span>
              <div className="flex-1">
                <MiniCalendarRange
                  dateFrom={condition.dateFrom ?? ""}
                  dateTo={condition.dateTo ?? ""}
                  onFromChange={(v) => onChange({ ...condition, dateFrom: v })}
                  onToChange={(v) => onChange({ ...condition, dateTo: v })}
                />
                {condition.dateFrom && (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    {condition.dateFrom}
                    {condition.dateTo ? ` → ${condition.dateTo}` : " — click a second date to set end"}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function BookingTypeCard({
  booking,
  courts,
  onChange,
  onDelete,
}: {
  booking: BookingType
  courts: Court[]
  onChange: (b: BookingType) => void
  onDelete: () => void
}) {
  const headerLabel = booking.duration ? `${booking.duration} min` : "New booking type"

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="flex-1 text-xs font-semibold text-foreground">{headerLabel}</span>
        <button
          onClick={() => onChange({ ...booking, expanded: !booking.expanded })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", booking.expanded && "rotate-180")} />
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {booking.expanded && (
        <div className="px-4">
          {/* Duration */}
          <FieldRow label="Duration" hint="Fixed length players book for">
            <div className="flex items-center gap-2">
              <Input
                value={booking.duration}
                onChange={(e) => onChange({ ...booking, duration: e.target.value })}
                placeholder="60"
                className="h-8 w-20 text-xs"
              />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </FieldRow>

          {/* Price — toggle between all-courts and per-court */}
          <FieldRow
            label="Price per court"
            hint={booking.perCourtPricing ? "Set individually per court" : "One price applied to all courts"}
          >
            <div className="flex flex-col gap-3">
              {/* Toggle row */}
              <div className="flex items-center gap-2">
                <Toggle2
                  checked={booking.perCourtPricing}
                  onChange={(v) => onChange({ ...booking, perCourtPricing: v })}
                />
                <span className="text-xs text-muted-foreground">
                  {booking.perCourtPricing ? "Per court" : "All courts"}
                </span>
              </div>

              {!booking.perCourtPricing ? (
                /* Single price */
                <PriceInput
                  value={booking.pricePerCourt}
                  onChange={(v) => onChange({ ...booking, pricePerCourt: v })}
                />
              ) : courts.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic">
                  Add courts in the Courts tab first.
                </p>
              ) : (
                /* Per-court prices */
                <div className="flex flex-col gap-2">
                  {courts.map((court) => (
                    <div key={court.id} className="flex items-center gap-3">
                      <span className="text-xs text-foreground w-28 shrink-0 truncate">{court.name}</span>
                      <PriceInput
                        value={booking.courtPrices[court.id] ?? ""}
                        onChange={(v) =>
                          onChange({
                            ...booking,
                            courtPrices: { ...booking.courtPrices, [court.id]: v },
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </FieldRow>

          {/* Pricing conditions */}
          <div className="py-4 border-t border-border mt-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Pricing conditions</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Override the base price for specific times, days, or dates.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {(booking.pricingConditions ?? []).map((cond) => (
                <PricingConditionCard
                  key={cond.id}
                  condition={cond}
                  onChange={(updated) =>
                    onChange({
                      ...booking,
                      pricingConditions: booking.pricingConditions.map((c) =>
                        c.id === updated.id ? updated : c
                      ),
                    })
                  }
                  onDelete={() =>
                    onChange({
                      ...booking,
                      pricingConditions: booking.pricingConditions.filter((c) => c.id !== cond.id),
                    })
                  }
                />
              ))}
              <button
                onClick={() =>
                  onChange({
                    ...booking,
                    pricingConditions: [...(booking.pricingConditions ?? []), newPricingCondition()],
                  })
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
              >
                <Plus className="h-3 w-3" />
                Add pricing condition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Main panel ----

export function SetupSportsPanel({ location, activeSportId, onUpdateSport, courts }: Props) {
  const sport = location.sports.find((s) => s.id === activeSportId)

  const bookingTypes = sport?.bookingTypes ?? []
  function setBookingTypes(updater: BookingType[] | ((prev: BookingType[]) => BookingType[])) {
    if (!sport) return
    const next = typeof updater === "function" ? updater(sport.bookingTypes) : updater
    onUpdateSport({ ...sport, bookingTypes: next })
  }
  const [editingSportName, setEditingSportName] = useState(false)
  const [sportNameDraft, setSportNameDraft] = useState("")

  if (!sport) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8">
        <LayoutGrid className="h-8 w-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-semibold text-foreground">No sport selected</p>
        <p className="text-xs text-muted-foreground mt-1">Add a sport from the left panel to configure courts and services.</p>
      </div>
    )
  }

  function commitSportName() {
    // In a real app this would call a prop callback to update the sport name
    setEditingSportName(false)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card shrink-0">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{location.name}</p>
          {editingSportName ? (
            <div className="flex items-center gap-2 mt-0.5">
              <input
                autoFocus
                value={sportNameDraft}
                onChange={(e) => setSportNameDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitSportName(); if (e.key === "Escape") setEditingSportName(false) }}
                className="text-base font-bold text-foreground bg-transparent border-b border-primary outline-none"
              />
              <button onClick={commitSportName} className="text-primary hover:opacity-80">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setEditingSportName(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-0.5 group">
              <h2 className="text-base font-bold text-foreground">{sport.name}</h2>
              <button
                onClick={() => { setSportNameDraft(sport.name); setEditingSportName(true) }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all"
                aria-label="Rename sport"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => {}}>
          Save changes
        </Button>
      </div>

      {/* Scrollable content — Pricing */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="flex flex-col gap-3 max-w-2xl">
          {bookingTypes.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No booking types added yet. Add one below.</p>
          )}
          {bookingTypes.map((bt) => (
            <BookingTypeCard
              key={bt.id}
              booking={bt}
              courts={courts}
              onChange={(updated) => setBookingTypes((prev) => prev.map((b) => b.id === updated.id ? updated : b))}
              onDelete={() => setBookingTypes((prev) => prev.filter((b) => b.id !== bt.id))}
            />
          ))}
          <button
            onClick={() => setBookingTypes((prev) => [...prev, newBookingType()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add duration
          </button>
        </div>
      </div>
    </div>
  )
}
