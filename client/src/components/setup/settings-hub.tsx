import { cn } from "@/lib/utils"
import {
  MapPin,
  LayoutGrid,
  BookOpen,
  Users,
  CreditCard,
  ChevronRight,
  Layers,
} from "lucide-react"

interface HubCard {
  id: string
  icon: React.ElementType
  title: string
  description: string
  badge?: string
  onClick: () => void
}

function SettingsCard({ card }: { card: HubCard }) {
  return (
    <button
      onClick={card.onClick}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-foreground/20 hover:shadow-sm cursor-pointer"
    >
      {/* Icon */}
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground shrink-0">
        <card.icon className="h-4 w-4" />
      </div>

      {/* Text */}
      <div className="flex flex-col gap-0.5 flex-1 pr-5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{card.title}</span>
          {card.badge && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {card.badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
      </div>

      {/* Arrow */}
      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
    </button>
  )
}

interface Props {
  onNavigate: (view: "locations" | "courts" | "services" | "booking-rules" | "staff" | "memberships") => void
  isSuperAdmin?: boolean
}

export function SettingsHub({ onNavigate, isSuperAdmin = false }: Props) {
  const allCards: HubCard[] = [
    {
      id: "locations",
      icon: MapPin,
      title: "Locations",
      description:
        "Add your club's locations and available sports",
      onClick: () => onNavigate("locations"),
    },
    {
      id: "courts",
      icon: LayoutGrid,
      title: "Courts",
      description:
        "Add and manage courts for each location and sport.",
      onClick: () => onNavigate("courts"),
    },
    {
      id: "services",
      icon: Layers,
      title: "Services",
      description:
        "Configure booking durations and activities",
      onClick: () => onNavigate("services"),
    },
    {
      id: "booking-rules",
      icon: BookOpen,
      title: "Booking Settings",
      description:
        "Configure booking rules and cancellation policies",
      onClick: () => onNavigate("booking-rules"),
    },
    {
      id: "staff",
      icon: Users,
      title: "Staff",
      description:
        "Add and manage your club's staff",
      onClick: () => onNavigate("staff"),
    },
    {
      id: "memberships",
      icon: CreditCard,
      title: "Memberships",
      description:
        "Create memberships with discounts, booking perks, and pricing.",
      onClick: () => onNavigate("memberships"),
    },
  ]

  // Managers cannot manage locations — that is super admin / club owner only
  const cards = isSuperAdmin
    ? allCards
    : allCards.filter((c) => c.id !== "locations")

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      {/* Card grid */}
      <div className="px-8 pt-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
          {cards.map((card) => (
            <SettingsCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </div>
  )
}
