import { useState } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminSettingsSidebar, type AdminSettingsView } from "@/components/setup/admin-settings-sidebar"
import { SetupLocationsPanel } from "@/components/setup/setup-locations-panel"
import { SetupCourtsPanel } from "@/components/setup/setup-courts-panel"
import { SetupStaffPanel } from "@/components/setup/setup-staff-panel"
import { SetupMembershipsPanel } from "@/components/setup/setup-memberships-panel"
import { SetupSettingsPanel } from "@/components/setup/setup-settings-panel"
import { SetupServicesPanel } from "@/components/setup/setup-services-panel"
import { ChevronLeft, MapPin, ChevronDown } from "lucide-react"
import type { BookingType, CoachRef } from "@/lib/setup-types"
import type { CourtsMap } from "@/components/setup/setup-courts-panel"
import { useLocation } from "@/contexts/location-context"

// ---- Types ----

export type Section = "sports" | "settings"

export interface Location {
  id: string
  name: string
  sports: Sport[]
}

export interface Sport {
  id: string
  name: string
  bookingTypes: BookingType[]
}

// ---- Seed data ----

const INITIAL_LOCATIONS: Location[] = [
  {
    id: "manchester",
    name: "Manchester",
    sports: [
      { id: "pickleball", name: "Pickleball", bookingTypes: [] },
      { id: "padel", name: "Padel", bookingTypes: [] },
    ],
  },
  {
    id: "leeds",
    name: "Leeds",
    sports: [
      { id: "pickleball", name: "Pickleball", bookingTypes: [] },
    ],
  },
  {
    id: "edinburgh",
    name: "Edinburgh",
    sports: [
      { id: "padel", name: "Padel", bookingTypes: [] },
      { id: "tennis", name: "Tennis", bookingTypes: [] },
    ],
  },
]

const SECTION_LABELS: Record<AdminSettingsView, string> = {
  locations:       "Locations",
  courts:          "Courts",
  services:        "Services",
  "booking-rules": "Booking Settings",
  staff:           "Staff",
  memberships:     "Membership",
}

// ---- Header bar (breadcrumb + location selector) ----

function SettingsTopBar({
  view,
  locationName,
  showLocation,
  showLocationSelector,
  onLocationSelector,
}: {
  view: AdminSettingsView
  locationName?: string
  showLocation?: boolean
  showLocationSelector?: boolean
  onLocationSelector?: () => void
}) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-card px-5 py-3 shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-3.5 w-3.5" />
          Settings
        </button>
        <span className="text-xs text-muted-foreground/40">/</span>
        <span className="text-xs font-semibold text-foreground">
          {SECTION_LABELS[view]}
        </span>
        {showLocation && locationName && (
          <>
            <span className="text-xs text-muted-foreground/40">/</span>
            <span className="text-xs text-muted-foreground">{locationName}</span>
          </>
        )}
      </div>

      {/* Location selector */}
      {showLocationSelector && (
        <button
          onClick={onLocationSelector}
          className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/50 transition-colors"
        >
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          {locationName ?? "All locations"}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}

// ---- Page ----

export default function SetupPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const { selectedLocation: contextLocation, isSuperAdmin } = useLocation()

  // Default to "courts" for managers (no locations access)
  const [activeView, setActiveView] = useState<AdminSettingsView>(
    isSuperAdmin ? "locations" : "courts"
  )

  // Locations state (managed locally within admin settings)
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS)
  const [, setCoaches] = useState<CoachRef[]>([])
  const [courtsMap, setCourtsMap] = useState<CourtsMap>({})

  // Derive the active location: super admins use the global context selection;
  // managers always operate on their own single location.
  const activeLocationId = isSuperAdmin
    ? contextLocation.id
    : INITIAL_LOCATIONS[0].id
  const activeLocation = locations.find((l) => l.id === activeLocationId) ?? locations[0]

  // ---- Location handlers ----

  function handleAddLocation(name: string) {
    const id = name.toLowerCase().replace(/\s+/g, "-")
    const newLoc: Location = { id, name, sports: [] }
    setLocations((prev) => [...prev, newLoc])
  }

  function handleRenameLocation(id: string, name: string) {
    setLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, name } : l))
    )
  }

  function handleDeleteLocation(id: string) {
    setLocations((prev) => prev.filter((l) => l.id !== id))
  }

  function handleAddSport(locationId: string, sportName: string) {
    const id = sportName.toLowerCase().replace(/\s+/g, "-")
    setLocations((prev) =>
      prev.map((l) =>
        l.id === locationId
          ? { ...l, sports: [...l.sports, { id, name: sportName, bookingTypes: [] }] }
          : l
      )
    )
  }

  function handleRenameSport(locationId: string, sportId: string, name: string) {
    setLocations((prev) =>
      prev.map((l) =>
        l.id === locationId
          ? { ...l, sports: l.sports.map((s) => (s.id === sportId ? { ...s, name } : s)) }
          : l
      )
    )
  }

  function handleDeleteSport(locationId: string, sportId: string) {
    setLocations((prev) =>
      prev.map((l) =>
        l.id === locationId
          ? { ...l, sports: l.sports.filter((s) => s.id !== sportId) }
          : l
      )
    )
  }

  // ---- Per-view config ----

  // Locations applies across all locations → no location chip / selector.
  // Memberships also applies across all locations.
  // Other views are scoped to a single location.
  const showLocationCrumb = activeView !== "locations" && activeView !== "memberships"
  const showLocationSelector = isSuperAdmin && activeView !== "locations"

  // ---- Render ----

  return (
    <div className="flex h-screen overflow-hidden bg-background font-sans">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((v) => !v)} />

      <AdminSettingsSidebar
        active={activeView}
        onChange={setActiveView}
        isSuperAdmin={isSuperAdmin}
      />

      <div className="flex flex-1 overflow-hidden flex-col">
        <SettingsTopBar
          view={activeView}
          locationName={activeLocation?.name}
          showLocation={showLocationCrumb}
          showLocationSelector={showLocationSelector}
        />

        {activeView === "locations" && (
          <main className="flex-1 overflow-y-auto bg-background">
            <SetupLocationsPanel
              locations={locations}
              onAdd={handleAddLocation}
              onRename={handleRenameLocation}
              onDelete={handleDeleteLocation}
              onAddSport={handleAddSport}
              onRenameSport={handleRenameSport}
              onDeleteSport={handleDeleteSport}
            />
          </main>
        )}

        {activeView === "courts" && (
          <div className="flex flex-1 overflow-hidden">
            <SetupCourtsPanel
              location={activeLocation}
              courtsMap={courtsMap}
              onCourtsMapChange={setCourtsMap}
            />
          </div>
        )}

        {activeView === "services" && (
          <main className="flex-1 overflow-y-auto bg-background">
            <SetupServicesPanel location={activeLocation} />
          </main>
        )}

        {activeView === "booking-rules" && (
          <main className="flex-1 overflow-y-auto bg-background">
            <SetupSettingsPanel location={activeLocation} />
          </main>
        )}

        {activeView === "staff" && (
          <main className="flex-1 overflow-y-auto bg-background">
            <SetupStaffPanel
              location={activeLocation}
              onCoachesChange={setCoaches}
            />
          </main>
        )}

        {activeView === "memberships" && (
          <main className="flex-1 overflow-y-auto bg-background">
            <SetupMembershipsPanel locations={locations} />
          </main>
        )}
      </div>
    </div>
  )
}
