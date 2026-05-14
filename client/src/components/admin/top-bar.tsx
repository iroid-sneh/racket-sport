import { ChevronDown, Check, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocation } from "@/contexts/location-context"

export function TopBar() {
  const { selectedLocation, setSelectedLocation, locations, showLocationSelector } = useLocation()

  return (
    <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3">

      {/* Title */}
      <div className="flex items-baseline gap-3 shrink-0">
        <span className="text-2xl font-bold tracking-tight text-foreground">Admin Settings</span>
        <span className="text-sm text-muted-foreground">Manage your club&apos;s configuration</span>
      </div>

      <div className="flex-1" />

      {/* Location picker — super admin / multi-location only */}
      {showLocationSelector && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 text-xs font-medium border-border shrink-0"
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
      )}
    </header>
  )
}
