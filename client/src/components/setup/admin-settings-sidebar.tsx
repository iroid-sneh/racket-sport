import { cn } from "@/lib/utils"
import {
  MapPin,
  LayoutGrid,
  Layers,
  BookOpen,
  Users,
  CreditCard,
} from "lucide-react"

export type AdminSettingsView =
  | "locations"
  | "courts"
  | "services"
  | "booking-rules"
  | "staff"
  | "memberships"

interface NavItem {
  id: AdminSettingsView
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  { id: "locations",     label: "Location",        icon: MapPin },
  { id: "courts",        label: "Courts",          icon: LayoutGrid },
  { id: "services",      label: "Services",        icon: Layers },
  { id: "booking-rules", label: "Booking Setting", icon: BookOpen },
  { id: "staff",         label: "Staff",           icon: Users },
  { id: "memberships",   label: "Memberships",     icon: CreditCard },
]

interface Props {
  active: AdminSettingsView
  onChange: (view: AdminSettingsView) => void
  isSuperAdmin?: boolean
}

export function AdminSettingsSidebar({ active, onChange, isSuperAdmin = false }: Props) {
  // Managers cannot manage locations — super admin / club owner only
  const items = isSuperAdmin
    ? NAV_ITEMS
    : NAV_ITEMS.filter((i) => i.id !== "locations")

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex h-14 items-center px-5 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Admin Settings</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-3">
        {items.map((item) => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-xs font-medium transition-colors text-left",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
