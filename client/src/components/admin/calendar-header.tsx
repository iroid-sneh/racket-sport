import { ChevronLeft, ChevronRight, ChevronDown, Check, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useLocation } from "@/contexts/location-context"

interface CalendarHeaderProps {
  activeDate: Date
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
  onSelectDate: (date: Date) => void
}

function buildWindow(centreDate: Date) {
  const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  return [-2, -1, 0, 1, 2].map((offset) => {
    const d = new Date(centreDate)
    d.setDate(centreDate.getDate() + offset)
    return { offset, day: DAY_NAMES[d.getDay()], date: d.getDate(), fullDate: d }
  })
}

export function CalendarHeader({
  activeDate,
  onPrevDay,
  onNextDay,
  onToday,
  onSelectDate,
}: CalendarHeaderProps) {
  const today = new Date()
  const month = activeDate.toLocaleDateString("en-US", { month: "long" })
  const year = activeDate.getFullYear()
  const window = buildWindow(activeDate)
  const { selectedLocation, setSelectedLocation, locations, showLocationSelector } = useLocation()

  return (
    <header className="flex items-center gap-4 border-b border-border bg-card px-6 py-3">

      {/* Month / Year */}
      <div className="flex items-baseline gap-2 shrink-0">
        <span className="text-2xl font-bold tracking-tight text-foreground">{month}</span>
        <span className="text-xl font-medium text-muted-foreground">{year}</span>
      </div>

      {/* Today */}
      <Button
        variant="outline"
        size="sm"
        onClick={onToday}
        className="h-8 px-4 text-xs font-medium border-border shrink-0"
      >
        Today
      </Button>

      {/* Divider */}
      <div className="h-6 w-px bg-border shrink-0" />

      {/* Centred date wheel */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevDay}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center">
          {window.map(({ offset, day, date, fullDate }) => {
            const isActive = offset === 0
            const isToday = fullDate.toDateString() === today.toDateString()
            return (
              <button
                key={offset}
                onClick={() => onSelectDate(fullDate)}
                className={cn(
                  "flex flex-col items-center px-3 py-1.5 transition-all min-w-[46px] rounded-lg",
                  isActive
                    ? "bg-secondary border border-foreground/20 text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                <span className="text-[10px] font-semibold uppercase tracking-widest">
                  {day}
                </span>
                <span className="text-sm font-bold leading-snug">
                  {date}
                </span>
                {isToday && (
                  <div className={cn(
                    "w-1 h-1 rounded-full mt-0.5",
                    isActive ? "bg-primary" : "bg-primary/40"
                  )} />
                )}
              </button>
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onNextDay}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Push location + user to the right */}
      <div className="flex-1" />

      {/* Location picker — super admin / multi-location only */}
      {showLocationSelector && (
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
      )}

    </header>
  )
}
