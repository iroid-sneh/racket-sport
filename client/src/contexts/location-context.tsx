import { createContext, useContext, useState } from "react"

export type UserRole = "Super Admin" | "Club Admin" | "Staff"

export interface Location {
  id: string
  name: string
}

export const LOCATIONS: Location[] = [
  { id: "manchester", name: "Manchester" },
  { id: "leeds", name: "Leeds" },
  { id: "edinburgh", name: "Edinburgh" },
]

// Mock current user — replace with real auth session in production
export const CURRENT_USER = {
  name: "Lewis Bowmaker",
  initials: "LB",
  role: "Super Admin" as UserRole,
  email: "lewis@opencourt.io",
}

interface LocationContextType {
  selectedLocation: Location
  setSelectedLocation: (loc: Location) => void
  locations: Location[]
  /** True only for Super Admin / Club Owner roles */
  isSuperAdmin: boolean
  /** True when the selector should be visible: super admin + multiple locations */
  showLocationSelector: boolean
  currentUser: typeof CURRENT_USER
}

const LocationContext = createContext<LocationContextType | null>(null)

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedLocation, setSelectedLocation] = useState<Location>(LOCATIONS[0])

  const isSuperAdmin = CURRENT_USER.role === "Super Admin" || CURRENT_USER.role === "Club Admin"
  const showLocationSelector = isSuperAdmin && LOCATIONS.length > 1

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation,
        locations: LOCATIONS,
        isSuperAdmin,
        showLocationSelector,
        currentUser: CURRENT_USER,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error("useLocation must be used within a LocationProvider")
  return ctx
}
