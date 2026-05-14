import { useState, useRef } from "react"
import { cn, generateId } from "@/lib/utils"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useLocation } from "@/contexts/location-context"
import {
  Plus, Trash2, ChevronDown, Users, Image,
  GripVertical, Dumbbell,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Activity } from "@/lib/activity-types"
import { newActivity } from "@/lib/activity-types"
import type { CoachRef } from "@/lib/setup-types"

// ---- Sample sports per location (mirrors setup page seed) ----
const LOCATION_SPORTS: Record<string, { id: string; name: string }[]> = {
  manchester: [
    { id: "pickleball", name: "Pickleball" },
    { id: "padel", name: "Padel" },
  ],
  leeds: [
    { id: "pickleball", name: "Pickleball" },
  ],
  edinburgh: [
    { id: "padel", name: "Padel" },
    { id: "tennis", name: "Tennis" },
  ],
}

// ---- Shared sub-components ----

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

// ---- Level range slider ----

const LEVELS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Improver" },
  { value: 3, label: "Intermediate" },
  { value: 4, label: "Advanced" },
  { value: 5, label: "Expert" },
]

function LevelRangeSlider({ min, max, onChange }: {
  min: number; max: number
  onChange: (min: number, max: number) => void
}) {
  const [dragging, setDragging] = useState<"min" | "max" | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  function posFromValue(v: number) { return ((v - 1) / 4) * 100 }

  function valueFromPos(clientX: number): number {
    const rect = trackRef.current?.getBoundingClientRect()
    if (!rect) return 1
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(ratio * 4 + 1)
  }

  function handleTrackPointerDown(e: React.PointerEvent) {
    const v = valueFromPos(e.clientX)
    const handle = Math.abs(v - min) <= Math.abs(v - max) ? "min" : "max"
    setDragging(handle)
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    if (handle === "min") onChange(Math.min(v, max), max)
    else onChange(min, Math.max(v, min))
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        ref={trackRef}
        className="relative h-5 flex items-center cursor-pointer select-none"
        onPointerDown={handleTrackPointerDown}
        onPointerMove={(e) => {
          if (!dragging) return
          const v = valueFromPos(e.clientX)
          if (dragging === "min") onChange(Math.min(v, max), max)
          else onChange(min, Math.max(v, min))
        }}
        onPointerUp={() => setDragging(null)}
      >
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-border" />
        <div
          className="absolute h-1.5 rounded-full bg-primary"
          style={{ left: `${posFromValue(min)}%`, right: `${100 - posFromValue(max)}%` }}
        />
        {(["min", "max"] as const).map((handle) => {
          const val = handle === "min" ? min : max
          return (
            <div
              key={handle}
              className="absolute -translate-x-1/2 h-4 w-4 rounded-full bg-primary border-2 border-background shadow-md z-10"
              style={{ left: `${posFromValue(val)}%` }}
            >
              {dragging === handle && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold rounded px-1.5 py-0.5 whitespace-nowrap">
                  {val} — {LEVELS[val - 1]?.label}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="relative flex justify-between">
        {LEVELS.map((lvl) => (
          <div key={lvl.value} className="flex flex-col items-center gap-0.5">
            <span className={cn("text-[10px] font-semibold", lvl.value >= min && lvl.value <= max ? "text-primary" : "text-muted-foreground")}>{lvl.value}</span>
            <span className={cn("text-[9px]", lvl.value >= min && lvl.value <= max ? "text-primary" : "text-muted-foreground")}>{lvl.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---- Activity card ----

function ActivityCard({
  activity,
  coaches,
  onChange,
  onDelete,
}: {
  activity: Activity
  coaches: CoachRef[]
  onChange: (a: Activity) => void
  onDelete: () => void
}) {
  function toggleCoach(id: string) {
    const next = activity.coachIds.includes(id)
      ? activity.coachIds.filter((c) => c !== id)
      : [...activity.coachIds, id]
    onChange({ ...activity, coachIds: next, allCoaches: false })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab shrink-0" />
        <Input
          value={activity.title}
          onChange={(e) => onChange({ ...activity, title: e.target.value })}
          className="h-7 flex-1 text-xs font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Activity name..."
        />
        <button onClick={() => onChange({ ...activity, expanded: !activity.expanded })} className="text-muted-foreground hover:text-foreground transition-colors">
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", activity.expanded && "rotate-180")} />
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors ml-1">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {activity.expanded && (
        <div className="px-4">
          <FieldRow label="Duration" hint="Fixed session length (minutes)">
            <div className="flex items-center gap-2">
              <Input value={activity.duration} onChange={(e) => onChange({ ...activity, duration: e.target.value })} placeholder="60" className="h-8 w-20 text-xs" />
              <span className="text-xs text-muted-foreground">min</span>
            </div>
          </FieldRow>

          <FieldRow label="Capacity" hint="Min / max participants">
            <div className="flex items-center gap-2">
              <Input value={activity.minCapacity} onChange={(e) => onChange({ ...activity, minCapacity: e.target.value })} placeholder="2" className="h-8 w-20 text-xs" />
              <span className="text-xs text-muted-foreground">to</span>
              <Input value={activity.maxCapacity} onChange={(e) => onChange({ ...activity, maxCapacity: e.target.value })} placeholder="8" className="h-8 w-20 text-xs" />
              <span className="text-xs text-muted-foreground">players</span>
            </div>
          </FieldRow>

          <FieldRow label="Price per player">
            <div className="relative w-32">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
              <Input value={activity.pricePerPlayer} onChange={(e) => onChange({ ...activity, pricePerPlayer: e.target.value })} placeholder="0.00" className="h-8 pl-6 text-xs w-full" />
            </div>
          </FieldRow>

          <FieldRow label="Eligible coaches" hint="Who can lead this activity. The specific coach is chosen per session.">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => onChange({ ...activity, allCoaches: !activity.allCoaches, coachIds: [] })}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all w-fit",
                  activity.allCoaches
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                <Users className="h-3.5 w-3.5" />
                All coaches
              </button>
              {!activity.allCoaches && (
                coaches.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground italic">No coaches set up yet. Add coaches in Staff first.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {coaches.map((coach) => {
                      const selected = activity.coachIds.includes(coach.id)
                      return (
                        <button
                          key={coach.id}
                          onClick={() => toggleCoach(coach.id)}
                          className={cn(
                            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                            selected ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                          )}
                        >
                          {coach.name || "Unnamed coach"}
                        </button>
                      )
                    })}
                  </div>
                )
              )}
            </div>
          </FieldRow>

          <FieldRow label="Banner / poster">
            <button className="flex items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
              <Image className="h-3.5 w-3.5" />
              Upload image
            </button>
          </FieldRow>

          <div className="py-4 border-t border-border mt-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-foreground">Level range restriction</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Restrict to players within a skill level range.</p>
              </div>
              <Toggle2 checked={activity.levelRestriction} onChange={(v) => onChange({ ...activity, levelRestriction: v })} />
            </div>
            {activity.levelRestriction && (
              <div className="pt-2 px-1">
                <LevelRangeSlider
                  min={activity.levelMin}
                  max={activity.levelMax}
                  onChange={(min, max) => onChange({ ...activity, levelMin: min, levelMax: max })}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Sport section ----

function SportSection({
  sport,
  activities,
  coaches,
  onAdd,
  onChange,
  onDelete,
}: {
  sport: { id: string; name: string }
  activities: Activity[]
  coaches: CoachRef[]
  onAdd: () => void
  onChange: (a: Activity) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Sport header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary shrink-0">
          <Dumbbell className="h-3.5 w-3.5 text-foreground" />
        </div>
        <span className="flex-1 text-sm font-semibold text-foreground">{sport.name}</span>
        <span className="text-xs text-muted-foreground mr-2">{activities.length} {activities.length === 1 ? "activity" : "activities"}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border">
          <div className="flex flex-col gap-3 mt-4">
            {activities.length === 0 && (
              <p className="text-xs text-muted-foreground italic py-1">No activities yet for {sport.name}.</p>
            )}
            {activities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                coaches={coaches}
                onChange={onChange}
                onDelete={() => onDelete(act.id)}
              />
            ))}
            <button
              onClick={onAdd}
              className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add activity
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---- Page ----

// Activities keyed by `locationId__sportId`
type ActivitiesMap = Record<string, Activity[]>

export default function ActivitiesPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { selectedLocation } = useLocation()
  const [activitiesMap, setActivitiesMap] = useState<ActivitiesMap>({})
  // In a real app coaches would come from a shared context/API
  const coaches: CoachRef[] = []

  const sports = LOCATION_SPORTS[selectedLocation.id] ?? []

  function key(sportId: string) {
    return `${selectedLocation.id}__${sportId}`
  }

  function getActivities(sportId: string): Activity[] {
    return activitiesMap[key(sportId)] ?? []
  }

  function addActivity(sportId: string) {
    const k = key(sportId)
    setActivitiesMap((prev) => ({
      ...prev,
      [k]: [...(prev[k] ?? []), newActivity()],
    }))
  }

  function updateActivity(sportId: string, updated: Activity) {
    const k = key(sportId)
    setActivitiesMap((prev) => ({
      ...prev,
      [k]: (prev[k] ?? []).map((a) => (a.id === updated.id ? updated : a)),
    }))
  }

  function deleteActivity(sportId: string, id: string) {
    const k = key(sportId)
    setActivitiesMap((prev) => ({
      ...prev,
      [k]: (prev[k] ?? []).filter((a) => a.id !== id),
    }))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border bg-card shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-foreground">Activities</h1>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {selectedLocation.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define reusable activity templates for {selectedLocation.name}. These are used as the base when scheduling sessions on the calendar.
            </p>
          </div>
          <Button size="sm" className="h-8 text-xs">
            Save changes
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {sports.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Dumbbell className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-foreground">No sports configured</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add sports for {selectedLocation.name} in Admin Settings first.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-w-2xl">
              {sports.map((sport) => (
                <SportSection
                  key={sport.id}
                  sport={sport}
                  activities={getActivities(sport.id)}
                  coaches={coaches}
                  onAdd={() => addActivity(sport.id)}
                  onChange={(a) => updateActivity(sport.id, a)}
                  onDelete={(id) => deleteActivity(sport.id, id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
