import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import type { Booking } from "./calendar-grid"

export interface Coach {
  id: string
  name: string
  initials: string
  colour: string        // tailwind bg colour for avatar
  availableFrom: string // "HH:00" e.g. "10:00"
  availableTo: string   // "HH:00" e.g. "20:00"
  sport: string
}

export interface CoachBooking extends Booking {
  coachId: string
  courtName: string
  title: string
}

interface CoachScheduleViewProps {
  coaches: Coach[]
  bookings: CoachBooking[]
  onBookingClick?: (booking: CoachBooking) => void
}

const timeSlots = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30",
]

const hourSlots = timeSlots.filter((t) => t.endsWith(":00"))

const SLOT_HEIGHT = 48 // px per hour

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function getCardPosition(startTime: string, endTime: string) {
  const gridStart = timeToMinutes("07:00")
  const start = timeToMinutes(startTime)
  const end = timeToMinutes(endTime)
  const top = ((start - gridStart) / 60) * SLOT_HEIGHT
  const height = ((end - start) / 60) * SLOT_HEIGHT
  if (height <= 0) return null
  return { top, height }
}

function getBookingStyle(type: Booking["type"]) {
  switch (type) {
    case "lesson":      return "bg-teal-200 text-teal-900"
    case "tournament":  return "bg-violet-200 text-violet-900"
    case "activity":    return "bg-amber-200 text-amber-900"
    case "maintenance": return "bg-slate-200 text-slate-600"
    case "open-match":  return "bg-sky-200 text-sky-900"
    default:            return "bg-indigo-200 text-indigo-900"
  }
}

export function CoachScheduleView({ coaches, bookings, onBookingClick }: CoachScheduleViewProps) {
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null)
  const [currentTimeStr, setCurrentTimeStr] = useState("")

  useEffect(() => {
    function update() {
      const now = new Date()
      const mins = now.getHours() * 60 + now.getMinutes()
      const gridStart = timeToMinutes("07:00")
      const gridEnd = timeToMinutes("20:30")
      if (mins >= gridStart && mins <= gridEnd) {
        setCurrentTimePosition(((mins - gridStart) / 60) * SLOT_HEIGHT)
      } else {
        setCurrentTimePosition(null)
      }
      setCurrentTimeStr(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))
    }
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [])

  const getCoachBookings = (coachId: string) =>
    bookings.filter((b) => b.coachId === coachId && b.status !== "cancelled")

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Time column */}
      <div className="sticky left-0 z-20 w-16 flex-shrink-0 border-r border-border bg-card">
        {/* Header spacer */}
        <div className="h-16 border-b border-border" />
        <div className="relative">
          {hourSlots.map((time) => (
            <div
              key={time}
              className="flex h-12 items-start justify-end border-b border-border/60 pr-2"
            >
              <span className="text-[10px] font-medium text-muted-foreground -translate-y-2">
                {time}
              </span>
            </div>
          ))}
          {/* Current time pill */}
          {currentTimePosition !== null && (
            <div
              className="absolute right-0 z-10 pointer-events-none"
              style={{ top: currentTimePosition - 10 }}
            >
              <div className="flex justify-end pr-1.5">
                <span className="bg-foreground text-background text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {currentTimeStr}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Coach columns */}
      <div className="flex flex-1 min-w-0">
        {coaches.map((coach) => {
          const coachBookings = getCoachBookings(coach.id)
          const unavailableEndMins = timeToMinutes(coach.availableFrom)
          const unavailableStartMins = timeToMinutes(coach.availableTo)
          const gridStartMins = timeToMinutes("07:00")
          const blockedTopHeight = ((unavailableEndMins - gridStartMins) / 60) * SLOT_HEIGHT
          const blockedBottomTop = ((unavailableStartMins - gridStartMins) / 60) * SLOT_HEIGHT
          const totalGridHeight = hourSlots.length * SLOT_HEIGHT

          return (
            <div
              key={coach.id}
              className="flex-1 min-w-[220px] border-r border-border last:border-r-0 flex flex-col"
            >
              {/* Coach header */}
              <div className="sticky top-0 z-10 flex h-16 flex-col items-center justify-center gap-1 border-b border-border bg-card px-3 pt-3">
                <div className={cn(
                  "flex h-7 w-7 shrink-0 aspect-square items-center justify-center rounded-full text-[10px] font-bold text-white",
                  coach.colour
                )}>
                  {coach.initials}
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-foreground leading-tight">{coach.name}</div>
                  <div className="text-[10px] text-muted-foreground">{coach.sport}</div>
                </div>
              </div>

              {/* Schedule body */}
              <div className="relative flex-1">
                {/* Hour grid lines */}
                {hourSlots.map((time) => (
                  <div key={time} className="h-12 border-b border-border/60" />
                ))}

                {/* Unavailable — before availableFrom */}
                {blockedTopHeight > 0 && (
                  <div
                    className="absolute inset-x-0 top-0 pointer-events-none bg-muted/40"
                    style={{ height: blockedTopHeight }}
                  />
                )}

                {/* Unavailable — after availableTo */}
                {blockedBottomTop < totalGridHeight && (
                  <div
                    className="absolute inset-x-0 pointer-events-none bg-muted/40"
                    style={{ top: blockedBottomTop, bottom: 0 }}
                  />
                )}

                {/* Booking cards */}
                {coachBookings.map((booking) => {
                  const pos = getCardPosition(booking.startTime, booking.endTime)
                  if (!pos) return null

                  const showCount =
                    booking.maxPlayers !== undefined &&
                    booking.type !== "maintenance"

                  // Slots under 30 min (< 24px) are truly tiny — hide court name only then
                  const isTiny = pos.height < 24

                  return (
                    <button
                      key={booking.id}
                      onClick={() => onBookingClick?.(booking)}
                      style={{ top: pos.top, height: pos.height }}
                      className={cn(
                        "absolute inset-x-1 rounded-xl text-left transition-all hover:brightness-95 hover:shadow-md overflow-hidden",
                        getBookingStyle(booking.type)
                      )}
                    >
                      <div className="px-2.5 py-1 h-full flex flex-col gap-0">
                        {/* Top row: title + badges */}
                        <div className="flex items-start justify-between gap-1">
                          <div className="text-[10px] font-bold leading-tight truncate flex-1">
                            {booking.title}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {booking.status === "pending" && (
                              <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                            )}
                            {showCount && (
                              <span className="text-[9px] font-semibold bg-black/15 px-1.5 py-0.5 rounded-full shrink-0 leading-none">
                                {booking.currentPlayers}/{booking.maxPlayers}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Time range */}
                        <div className="text-[9px] font-medium opacity-70 leading-none mt-0.5">
                          {booking.startTime}–{booking.endTime}
                        </div>
                        {/* Court name — always shown unless slot is tiny */}
                        {!isTiny && (
                          <div className="text-[9px] opacity-55 leading-none truncate mt-0.5">
                            {booking.courtName}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}

                {/* Current time line */}
                {currentTimePosition !== null && (
                  <div
                    className="absolute inset-x-0 z-20 pointer-events-none"
                    style={{ top: currentTimePosition }}
                  >
                    <div className="h-[1.5px] bg-foreground/40" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
