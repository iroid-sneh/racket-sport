import { useState } from "react"
import { cn } from "@/lib/utils"
import { MapPin, Plus, Check, X } from "lucide-react"
import type { Location } from "@/pages/SetupPage"

interface Props {
  locations: Location[]
  activeLocationId: string
  onSelect: (id: string) => void
  onAdd: (name: string) => void
}

export function SetupLocationRail({ locations, activeLocationId, onSelect, onAdd }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState("")

  function submit() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setDraft("")
    setAdding(false)
  }

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-card overflow-y-auto shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Locations
        </span>
        <button
          onClick={() => setAdding(true)}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Add location"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Location list */}
      <div className="flex flex-col gap-0.5 p-2 flex-1">
        {locations.map((loc) => {
          const isActive = loc.id === activeLocationId
          return (
            <button
              key={loc.id}
              onClick={() => onSelect(loc.id)}
              className={cn(
                "flex items-center gap-2.5 w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              )}
            >
              <MapPin className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-primary-foreground/70" : "text-muted-foreground")} />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold truncate">{loc.name}</span>
                <span className={cn("text-[10px] mt-0.5", isActive ? "text-primary-foreground/60" : "text-muted-foreground")}>
                  {loc.sports.length} sport{loc.sports.length !== 1 ? "s" : ""}
                </span>
              </div>
            </button>
          )
        })}

        {/* Add location inline input */}
        {adding && (
          <div className="mt-1 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit()
                if (e.key === "Escape") { setAdding(false); setDraft("") }
              }}
              placeholder="Location name..."
              className="w-full bg-transparent text-xs font-medium text-foreground placeholder:text-muted-foreground outline-none"
            />
            <div className="flex items-center gap-1.5 mt-2">
              <button
                onClick={submit}
                className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Check className="h-3 w-3" /> Add
              </button>
              <button
                onClick={() => { setAdding(false); setDraft("") }}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
