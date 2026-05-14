import { useState } from "react"
import { cn } from "@/lib/utils"
import { MapPin, Plus, Trash2, Check, X, ChevronDown, Dumbbell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Location } from "@/pages/SetupPage"

interface Props {
  locations: Location[]
  onAdd: (name: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onAddSport: (locationId: string, sportName: string) => void
  onRenameSport: (locationId: string, sportId: string, name: string) => void
  onDeleteSport: (locationId: string, sportId: string) => void
}

// Available sports across the club
const AVAILABLE_SPORTS = [
  { id: "tennis",     name: "Tennis" },
  { id: "padel",      name: "Padel" },
  { id: "pickleball", name: "Pickleball" },
]

// ---- Sport toggle row ----

function SportToggleRow({
  sportId,
  sportName,
  enabled,
  onToggle,
}: {
  sportId: string
  sportName: string
  enabled: boolean
  onToggle: (next: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
      <Dumbbell className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="flex-1 text-xs font-medium text-foreground">{sportName}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={`Toggle ${sportName}`}
        onClick={() => onToggle(!enabled)}
        className={cn(
          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
          enabled ? "bg-foreground" : "bg-border"
        )}
      >
        <span className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          enabled ? "translate-x-4" : "translate-x-0"
        )} />
      </button>
      <span className="sr-only">{sportId}</span>
    </div>
  )
}

// ---- Location row ----

function LocationRow({
  loc,
  onDelete,
  onAddSport,
  onDeleteSport,
}: {
  loc: Location
  onDelete: (id: string) => void
  onAddSport: (locationId: string, sportName: string) => void
  onDeleteSport: (locationId: string, sportId: string) => void
}) {
  const [expanded, setExpanded] = useState(false)

  const sportCount = loc.sports.length

  function toggleSport(sportId: string, sportName: string, next: boolean) {
    if (next) {
      onAddSport(loc.id, sportName)
    } else {
      onDeleteSport(loc.id, sportId)
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Location header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="group flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <ChevronDown className={cn(
          "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform",
          expanded && "rotate-180"
        )} />

        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />

        <span className="flex-1 text-sm font-semibold text-foreground">{loc.name}</span>

        <span className="text-xs text-muted-foreground mr-1">
          {sportCount} sport{sportCount !== 1 ? "s" : ""}
        </span>

        <button
          onClick={(e) => { e.stopPropagation(); onDelete(loc.id) }}
          className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
          aria-label="Delete location"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </button>

      {/* Sports toggle list */}
      {expanded && (
        <div className="border-t border-border px-4 py-4 flex flex-col gap-2">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Sports
          </span>
          {AVAILABLE_SPORTS.map((sport) => {
            const enabled = loc.sports.some((s) => s.id === sport.id)
            return (
              <SportToggleRow
                key={sport.id}
                sportId={sport.id}
                sportName={sport.name}
                enabled={enabled}
                onToggle={(next) => toggleSport(sport.id, sport.name, next)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- Panel ----

export function SetupLocationsPanel({
  locations,
  onAdd,
  onDelete,
  onAddSport,
  onDeleteSport,
}: Props) {
  const [draft, setDraft] = useState("")

  function submitAdd() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setDraft("")
  }

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex items-start justify-between px-8 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Locations</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your club&apos;s locations and the sports available at each one.
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={submitAdd}>
          <Plus className="h-3.5 w-3.5" />
          Add location
        </Button>
      </div>

      <div className="px-8 pb-10 max-w-2xl">
        {/* Inline name input (Figma-style permanent input) */}
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitAdd()
              if (e.key === "Escape") setDraft("")
            }}
            placeholder="Location name..."
            className="h-7 flex-1 border-0 bg-transparent px-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <button
            onClick={submitAdd}
            disabled={!draft.trim()}
            className="flex items-center justify-center h-6 w-6 rounded-md bg-foreground text-background hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Add location"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDraft("")}
            className="flex items-center justify-center h-6 w-6 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {locations.map((loc) => (
            <LocationRow
              key={loc.id}
              loc={loc}
              onDelete={onDelete}
              onAddSport={onAddSport}
              onDeleteSport={onDeleteSport}
            />
          ))}

          {/* Empty state */}
          {locations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-semibold text-foreground">No locations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add your first location to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
