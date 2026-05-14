import { useState } from "react"
import { cn } from "@/lib/utils"
import { Dumbbell, SlidersHorizontal, ChevronRight, Plus, Check, X, Pencil } from "lucide-react"
import type { Location, Section } from "@/pages/SetupPage"

interface Props {
  location: Location
  activeSection: Section
  activeSportId: string
  onSelectSection: (s: Section) => void
  onSelectSport: (id: string) => void
  onAddSport: (locationId: string, name: string) => void
}

const TOP_SECTIONS: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "sports",   label: "Sports",   icon: Dumbbell },
  { id: "settings", label: "Settings", icon: SlidersHorizontal },
]

function SportNavItem({
  sport,
  isActive,
  onSelect,
}: {
  sport: { id: string; name: string }
  isActive: boolean
  onSelect: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(sport.name)

  function commit() {
    // In a real app, propagate name change up
    setEditing(false)
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 w-full rounded-md px-2.5 py-1.5 group transition-colors",
        isActive ? "bg-muted" : "hover:bg-muted/60"
      )}
    >
      {editing ? (
        <>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setDraft(sport.name); setEditing(false) } }}
            className="flex-1 text-[10px] font-semibold bg-transparent outline-none border-b border-primary text-foreground min-w-0"
          />
          <button onClick={commit} className="text-primary shrink-0"><Check className="h-2.5 w-2.5" /></button>
          <button onClick={() => { setDraft(sport.name); setEditing(false) }} className="text-muted-foreground shrink-0"><X className="h-2.5 w-2.5" /></button>
        </>
      ) : (
        <>
          <button onClick={onSelect} className="flex-1 text-left">
            <span className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
              {sport.name}
            </span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setDraft(sport.name); setEditing(true) }}
            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all shrink-0"
            aria-label="Rename sport"
          >
            <Pencil className="h-2.5 w-2.5" />
          </button>
          {isActive && !editing && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
        </>
      )}
    </div>
  )
}

export function SetupSectionNav({
  location,
  activeSection,
  activeSportId,
  onSelectSection,
  onSelectSport,
  onAddSport,
}: Props) {
  const [addingSport, setAddingSport] = useState(false)
  const [draft, setDraft] = useState("")

  function submitSport() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAddSport(location.id, trimmed)
    setDraft("")
    setAddingSport(false)
  }

  return (
    <nav className="flex w-52 flex-col border-r border-border bg-card overflow-y-auto shrink-0">
      {/* Location label */}
      <div className="px-4 py-4 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
          Configure
        </p>
        <p className="text-sm font-bold text-foreground truncate">{location.name}</p>
      </div>

      <div className="flex flex-col gap-0.5 p-2">
        {TOP_SECTIONS.map((sec) => {
          const isActive = activeSection === sec.id
          return (
            <div key={sec.id}>
              <button
                onClick={() => onSelectSection(sec.id)}
                className={cn(
                  "flex items-center justify-between w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <sec.icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-foreground" : "text-muted-foreground")} />
                  <span className="text-xs font-medium">{sec.label}</span>
                </div>
                <ChevronRight className={cn(
                  "h-3 w-3 text-muted-foreground transition-transform",
                  isActive && "rotate-90"
                )} />
              </button>

              {/* Sports sub-list — expands when Sports section is active */}
              {sec.id === "sports" && isActive && (
                <div className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-border pl-3 pb-1">
                  {location.sports.map((sport) => {
                    const isSportActive = activeSportId === sport.id
                    return (
                      <SportNavItem
                        key={sport.id}
                        sport={sport}
                        isActive={isSportActive}
                        onSelect={() => onSelectSport(sport.id)}
                      />
                    )
                  })}

                  {/* Add sport */}
                  {addingSport ? (
                    <div className="rounded-md border border-border bg-muted/40 px-2.5 py-2 mt-0.5">
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") submitSport()
                          if (e.key === "Escape") { setAddingSport(false); setDraft("") }
                        }}
                        placeholder="Sport name..."
                        className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                      />
                      <div className="flex gap-1 mt-1.5">
                        <button onClick={submitSport} className="rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground hover:opacity-90">
                          <Check className="h-2.5 w-2.5" />
                        </button>
                        <button onClick={() => { setAddingSport(false); setDraft("") }} className="rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted">
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingSport(true)}
                      className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add sport
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
