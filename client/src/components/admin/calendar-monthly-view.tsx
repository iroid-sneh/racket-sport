import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Court } from "./calendar-grid"

interface CalendarMonthlyViewProps {
  courts: Court[]
  currentDate: Date
  viewMode: "courts" | "coaches"
  selectedSport: string
}

interface Coach {
  id: string
  name: string
  sport: string
}

const COACHES: Coach[] = [
  { id: "coach-1", name: "Alex Rivera", sport: "pickleball" },
  { id: "coach-2", name: "Jordan Kim", sport: "padel" },
  { id: "coach-3", name: "Sam Patel", sport: "pickleball" },
  { id: "coach-4", name: "Taylor Wong", sport: "padel" },
]

const SPORT_GROUPS = [
  { id: "pickleball", label: "Pickleball" },
  { id: "padel", label: "Padel" },
  { id: "other", label: "Other" },
]

// Deterministic pseudo-random occupancy per resource + day + month
function getOccupancy(id: string, day: number, month: number): number {
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const raw = (hash * 13 + day * 7 + month * 31) % 97
  return raw / 100
}

// Hours booked derived from occupancy (assuming 12 bookable hours/day per resource)
function getHoursBooked(occ: number): number {
  return Math.round(occ * 12 * 10) / 10
}

function getOccupancyClass(occ: number): string {
  if (occ <= 0.01) return "bg-secondary"
  if (occ <= 0.25) return "bg-primary/15"
  if (occ <= 0.50) return "bg-primary/35"
  if (occ <= 0.75) return "bg-primary/60"
  return "bg-primary/85"
}

function getDayMeta(year: number, month: number, day: number, today: Date) {
  const date = new Date(year, month, day)
  const isToday = date.toDateString() === today.toDateString()
  const dow = date.getDay()
  const isWeekend = dow === 0 || dow === 6
  const abbr = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][dow]
  return { date, isToday, isWeekend, abbr }
}

// Popover shown on hover for a single cell
function CellPopover({
  label,
  occ,
  hoursBooked,
  openDown,
}: {
  label: string
  occ: number
  hoursBooked: number
  openDown: boolean
}) {
  const pct = Math.round(occ * 100)
  return (
    <div className={cn(
      "absolute z-50 left-1/2 -translate-x-1/2 w-44 rounded-lg border border-border bg-card shadow-lg p-3 pointer-events-none",
      openDown ? "top-full mt-2" : "bottom-full mb-2"
    )}>
      <div className="text-[11px] font-semibold text-foreground truncate mb-2">{label}</div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Occupancy</span>
          <span className="text-[10px] font-semibold text-foreground">{pct}%</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-1.5">
          <div
            className="bg-primary rounded-full h-1.5 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">Hours booked</span>
          <span className="text-[10px] font-semibold text-foreground">{hoursBooked}h</span>
        </div>
        {pct === 0 && (
          <div className="text-[10px] text-muted-foreground italic mt-0.5">No bookings</div>
        )}
      </div>
      {/* Arrow */}
      {openDown ? (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-border" />
      ) : (
        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-border" />
      )}
    </div>
  )
}

function HoverCell({
  occ,
  isWeekend,
  popoverLabel,
  rowIndex,
  padding = "p-1.5",
}: {
  occ: number
  isWeekend: boolean
  popoverLabel: string
  rowIndex: number
  padding?: string
}) {
  const [hovered, setHovered] = useState(false)
  const hoursBooked = getHoursBooked(occ)
  // Open downward for the first 2 rows so the popover clears the sticky header
  const openDown = rowIndex < 2

  return (
    <div
      className={cn(
        "relative flex-shrink-0 w-12 border-r border-border/40 last:border-r-0 cursor-pointer",
        padding,
        isWeekend && "bg-muted/10"
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={cn(
          "w-full h-full rounded-md transition-opacity",
          getOccupancyClass(occ),
          hovered && "opacity-80"
        )}
      />
      {hovered && (
        <CellPopover label={popoverLabel} occ={occ} hoursBooked={hoursBooked} openDown={openDown} />
      )}
    </div>
  )
}

export function CalendarMonthlyView({
  courts,
  currentDate,
  viewMode,
  selectedSport,
}: CalendarMonthlyViewProps) {
  const [monthOffset, setMonthOffset] = useState(0)
  const [groupBySport, setGroupBySport] = useState(false)

  const displayDate = useMemo(() => {
    const d = new Date(currentDate)
    d.setDate(1)
    d.setMonth(d.getMonth() + monthOffset)
    return d
  }, [currentDate, monthOffset])

  const year = displayDate.getFullYear()
  const month = displayDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const today = new Date()

  const monthLabel = displayDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const allRows = useMemo(() => {
    if (viewMode === "coaches") {
      const base = selectedSport === "All Sports"
        ? COACHES
        : COACHES.filter(c => c.sport === selectedSport.toLowerCase())
      return base.map(c => ({ ...c, subtitle: c.sport }))
    }
    const base = selectedSport === "All Sports"
      ? courts
      : courts.filter(c => c.subtitle.toLowerCase() === selectedSport.toLowerCase())
    return base.map(c => ({ ...c }))
  }, [viewMode, selectedSport, courts])

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Controls */}
      <div className="flex items-center gap-3 px-6 py-2.5 border-b border-border bg-card">
        {/* Month navigator */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-semibold w-40 text-center select-none">{monthLabel}</span>
          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="h-5 w-px bg-border" />

        {/* Group by Sport toggle */}
        <button
          onClick={() => setGroupBySport((g) => !g)}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
            groupBySport
              ? "bg-secondary border-foreground/20 text-foreground"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
          )}
        >
          Group by Sport
        </button>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-2.5">
          <span className="text-[10px] text-muted-foreground font-medium">Occupancy</span>
          <div className="flex items-center gap-1">
            {[0, 0.15, 0.38, 0.62, 0.88].map((level, i) => (
              <div key={i} className={cn("w-5 h-5 rounded border border-border/40", getOccupancyClass(level))} />
            ))}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span>None</span>
            <span className="mx-0.5">→</span>
            <span>Full</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-1 overflow-auto">
        {/* Sticky label column */}
        <div className="sticky left-0 z-20 flex-shrink-0 bg-card border-r border-border shadow-sm">
          <div className="h-12 border-b border-border" />

          {!groupBySport ? (
            allRows.map((row) => (
              <div key={row.id} className="flex h-12 items-center border-b border-border px-4 w-48">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium text-foreground truncate leading-tight">{row.name}</div>
                  {row.subtitle && (
                    <div className="text-[10px] text-muted-foreground capitalize">{row.subtitle}</div>
                  )}
                </div>
              </div>
            ))
          ) : (
            SPORT_GROUPS.map((sport) => {
              const sportRows = allRows.filter((r) => r.sport === sport.id)
              if (sportRows.length === 0) return null
              return (
                <div
                  key={sport.id}
                  className="flex h-12 items-center border-b border-border px-4 w-48"
                >
                  <span className="text-[11px] font-semibold text-foreground capitalize">
                    {sport.label}
                  </span>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    {sportRows.length} {viewMode === "coaches" ? "coaches" : "courts"}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* Scrollable day columns */}
        <div className="flex-1">
          {/* Day header */}
          <div className="sticky top-0 z-10 flex bg-card border-b border-border">
            {days.map((day) => {
              const { isToday, isWeekend, abbr } = getDayMeta(year, month, day, today)
              return (
                <div
                  key={day}
                  className={cn(
                    "flex-shrink-0 w-12 border-r border-border/50 last:border-r-0 h-12 flex flex-col items-center justify-center gap-0.5",
                    isWeekend && "bg-muted/30"
                  )}
                >
                  <span className={cn("text-[9px] font-medium uppercase tracking-wide", isToday ? "text-primary" : "text-muted-foreground")}>
                    {abbr}
                  </span>
                  <span className={cn(
                    "text-[12px] font-bold",
                    isToday
                      ? "text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center"
                      : "text-foreground"
                  )}>
                    {day}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Data rows */}
          {!groupBySport ? (
            allRows.map((row, rowIndex) => (
              <div key={row.id} className="flex border-b border-border h-12">
                {days.map((day) => {
                  const { isWeekend } = getDayMeta(year, month, day, today)
                  const occ = getOccupancy(row.id, day, month)
                  const dateStr = new Date(year, month, day).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                  return (
                    <HoverCell
                      key={day}
                      occ={occ}
                      isWeekend={isWeekend}
                      popoverLabel={`${row.name} — ${dateStr}`}
                      rowIndex={rowIndex}
                    />
                  )
                })}
              </div>
            ))
          ) : (
            SPORT_GROUPS.map((sport, rowIndex) => {
              const sportRows = allRows.filter((r) => r.sport === sport.id)
              if (sportRows.length === 0) return null
              return (
                <div key={sport.id} className="flex border-b border-border h-12">
                  {days.map((day) => {
                    const { isWeekend } = getDayMeta(year, month, day, today)
                    const avg = sportRows.reduce((sum, row) => sum + getOccupancy(row.id, day, month), 0) / sportRows.length
                    const dateStr = new Date(year, month, day).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
                    return (
                      <HoverCell
                        key={day}
                        occ={avg}
                        isWeekend={isWeekend}
                        popoverLabel={`${sport.label} — ${dateStr}`}
                        rowIndex={rowIndex}
                      />
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
