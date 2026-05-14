import { ChevronDown, Check, MapPin, Download, Plus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useLocation } from "@/contexts/location-context"

interface CustomersHeaderProps {
  totalCount: number
  activeMembers: number
  onExport?: () => void
  onAddCustomer?: () => void
}

export function CustomersHeader({
  totalCount,
  activeMembers,
  onExport,
  onAddCustomer,
}: CustomersHeaderProps) {
  const { selectedLocation, setSelectedLocation, locations } = useLocation()

  return (
    <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3">
      {/* Title + summary */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
          <Users className="h-4.5 w-4.5 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Customers</h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{totalCount} total</span>
            <span className="text-border">·</span>
            <span className="text-emerald-600 font-medium">{activeMembers} active members</span>
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Add customer */}
      <Button
        size="sm"
        className="h-8 gap-1.5 text-xs font-medium shrink-0"
        onClick={onAddCustomer}
      >
        <Plus className="h-3.5 w-3.5" />
        Add Customer
      </Button>

      {/* Export */}
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-2 text-xs font-medium border-border shrink-0"
        onClick={onExport}
      >
        <Download className="h-3.5 w-3.5 text-muted-foreground" />
        Export CSV
      </Button>

      {/* Divider */}
      <div className="h-5 w-px bg-border shrink-0" />

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
    </header>
  )
}
