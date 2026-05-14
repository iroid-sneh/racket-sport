import { ChevronDown, Check, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useLocation } from "@/contexts/location-context"

const CURRENT_USER = {
  name: "Lewis Bowmaker",
  initials: "LB",
  role: "Super Admin",
  email: "lewis@opencourt.io",
}

const ROLE_COLOURS: Record<string, string> = {
  "Super Admin": "bg-violet-100 text-violet-700",
  "Manager":     "bg-sky-100 text-sky-700",
  "Staff":       "bg-emerald-100 text-emerald-700",
}

export function ReportsHeader() {
  const { selectedLocation, setSelectedLocation, locations } = useLocation()

  return (
    <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3">

      {/* Title */}
      <div className="flex items-baseline gap-3 shrink-0">
        <span className="text-2xl font-bold tracking-tight text-foreground">Reports</span>
        <span className="text-sm text-muted-foreground">View analytics and generate reports</span>
      </div>

      <div className="flex-1" />

      {/* Location picker */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium border-border shrink-0"
          >
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            {selectedLocation.name}
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {locations.map((loc) => (
            <DropdownMenuItem
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className="flex items-center justify-between text-xs"
            >
              {loc.name}
              {selectedLocation.id === loc.id && <Check className="h-3.5 w-3.5" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="h-5 w-px bg-border shrink-0" />

      {/* User profile pill */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2.5 py-1.5 hover:bg-muted/60 transition-colors shrink-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-[10px] font-bold select-none">
              {CURRENT_USER.initials}
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-xs font-semibold text-foreground">{CURRENT_USER.name}</span>
              <span
                className={cn(
                  "mt-0.5 rounded-full px-1.5 py-px text-[9px] font-semibold",
                  ROLE_COLOURS[CURRENT_USER.role] ?? "bg-muted text-muted-foreground"
                )}
              >
                {CURRENT_USER.role}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <div className="px-2 py-1.5">
            <p className="text-xs font-medium text-foreground">{CURRENT_USER.name}</p>
            <p className="text-[11px] text-muted-foreground">{CURRENT_USER.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-destructive focus:text-destructive">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
