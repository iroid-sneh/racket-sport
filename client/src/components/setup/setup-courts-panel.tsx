import { useState } from "react"
import { cn, generateId } from "@/lib/utils"
import { Plus, Trash2, Pencil, LayoutGrid, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Location } from "@/pages/SetupPage"

// ---- Types ----

export interface Court {
  id: string
  name: string
  description: string
  imageUrl?: string
}

// Keyed by `${locationId}__${sportId}` → Court[]
export type CourtsMap = Record<string, Court[]>

function courtKey(locationId: string, sportId: string) {
  return `${locationId}__${sportId}`
}

export function newCourt(): Court {
  return { id: generateId(), name: "", description: "" }
}

// ---- Court row (collapsed display) ----

function CourtRow({
  court,
  onEdit,
  onDelete,
}: {
  court: Court
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      {/* Image thumbnail */}
      <div className="h-11 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {court.imageUrl ? (
          <img src={court.imageUrl} alt={court.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground truncate">{court.name || "Untitled court"}</p>
        <p className="text-[11px] text-muted-foreground truncate">
          {court.description || "No description"}
        </p>
      </div>

      <button
        onClick={onEdit}
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Edit court"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="text-rose-500 hover:text-rose-600 transition-colors"
        aria-label="Delete court"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

// ---- Court edit form (inline expanded) ----

function CourtEditForm({
  court,
  onSave,
  onDelete,
}: {
  court: Court
  onSave: (c: Court) => void
  onDelete: () => void
}) {
  const [draft, setDraft] = useState<Court>(court)

  return (
    <div className="border-b border-border last:border-0">
      {/* Top row: name input + delete */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <Input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Court Name"
          className="h-7 flex-1 text-xs font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <button
          onClick={onDelete}
          className="text-rose-500 hover:text-rose-600 transition-colors"
          aria-label="Delete court"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Image */}
      <div className="flex items-center justify-between gap-6 px-4 py-3.5 border-b border-border">
        <Label className="text-xs font-semibold text-foreground w-24 shrink-0">Image</Label>
        <button className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
          <Plus className="h-3 w-3" />
          Add Photo
        </button>
        <div className="flex-1" />
      </div>

      {/* Description */}
      <div className="flex items-start justify-between gap-6 px-4 py-3.5 border-b border-border">
        <Label className="text-xs font-semibold text-foreground w-24 shrink-0 pt-2">Description</Label>
        <textarea
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          placeholder="Padel, Double, Artificial Grass, Indoor"
          rows={2}
          className="flex-1 rounded-md border border-input bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      {/* Save button */}
      <div className="flex items-center justify-end px-4 py-3">
        <Button size="sm" className="h-7 text-xs px-4" onClick={() => onSave(draft)}>
          Save
        </Button>
      </div>
    </div>
  )
}

// ---- Sport section ----

function SportSection({
  locationId,
  sport,
  courtsMap,
  onChange,
}: {
  locationId: string
  sport: { id: string; name: string }
  courtsMap: CourtsMap
  onChange: (map: CourtsMap) => void
}) {
  const key = courtKey(locationId, sport.id)
  const courts = courtsMap[key] ?? []
  const [editingId, setEditingId] = useState<string | null>(null)

  function setCourts(updater: Court[] | ((prev: Court[]) => Court[])) {
    const next = typeof updater === "function" ? updater(courts) : updater
    onChange({ ...courtsMap, [key]: next })
  }

  function addCourt() {
    const c = newCourt()
    setCourts((prev) => [...prev, c])
    setEditingId(c.id)
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Sport header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">{sport.name}</span>
        <span className="text-xs text-muted-foreground">
          {courts.length} Court{courts.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Court rows */}
      {courts.length === 0 ? (
        <p className="px-4 py-3 text-xs text-muted-foreground italic">No courts added yet.</p>
      ) : (
        courts.map((court) =>
          editingId === court.id ? (
            <CourtEditForm
              key={court.id}
              court={court}
              onSave={(updated) => {
                setCourts((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                setEditingId(null)
              }}
              onDelete={() => {
                setCourts((prev) => prev.filter((x) => x.id !== court.id))
                setEditingId(null)
              }}
            />
          ) : (
            <CourtRow
              key={court.id}
              court={court}
              onEdit={() => setEditingId(court.id)}
              onDelete={() => setCourts((prev) => prev.filter((x) => x.id !== court.id))}
            />
          )
        )
      )}

      {/* Add court button */}
      <button
        onClick={addCourt}
        className="flex w-full items-center justify-center gap-2 border-t border-border px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/30 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add Court
      </button>
    </div>
  )
}

// ---- Main panel ----

interface Props {
  location: Location
  courtsMap: CourtsMap
  onCourtsMapChange: (map: CourtsMap) => void
}

export function SetupCourtsPanel({ location, courtsMap, onCourtsMapChange }: Props) {
  if (!location) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center text-center px-8">
          <LayoutGrid className="h-8 w-8 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">No location set up yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your location first, then come back to configure courts.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Page header */}
      <div className="flex items-start justify-between px-8 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courts</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage the courts available at this location.</p>
        </div>
      </div>

      {/* Sport sections */}
      <div className="flex-1 overflow-y-auto px-8 pb-10">
        {location.sports.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center max-w-2xl">
            <LayoutGrid className="h-7 w-7 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-semibold text-foreground">No sports added yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add sports to this location first, then configure courts here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-2xl">
            {location.sports.map((sport) => (
              <SportSection
                key={sport.id}
                locationId={location.id}
                sport={sport}
                courtsMap={courtsMap}
                onChange={onCourtsMapChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
