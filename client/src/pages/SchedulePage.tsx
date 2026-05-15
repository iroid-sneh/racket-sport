import { useState, useMemo } from "react"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { CalendarHeader } from "@/components/admin/calendar-header"
import { CalendarFilters } from "@/components/admin/calendar-filters"
import { CalendarGrid, type Court, type Booking } from "@/components/admin/calendar-grid"
import type { BookingType } from "@/lib/setup-types"
import { CalendarMonthlyView } from "@/components/admin/calendar-monthly-view"
import { CoachScheduleView, type Coach, type CoachBooking } from "@/components/admin/coach-schedule-view"

// Sample booking types (durations configured in admin settings)
const sampleBookingTypes: BookingType[] = [
  { id: "bt-30",  duration: "30",  minCapacity: "1", maxCapacity: "4", perCourtPricing: false, pricePerCourt: "", courtPrices: {}, pricingConditions: [], expanded: false },
  { id: "bt-60",  duration: "60",  minCapacity: "1", maxCapacity: "4", perCourtPricing: false, pricePerCourt: "", courtPrices: {}, pricingConditions: [], expanded: false },
  { id: "bt-90",  duration: "90",  minCapacity: "1", maxCapacity: "4", perCourtPricing: false, pricePerCourt: "", courtPrices: {}, pricingConditions: [], expanded: false },
  { id: "bt-120", duration: "120", minCapacity: "1", maxCapacity: "4", perCourtPricing: false, pricePerCourt: "", courtPrices: {}, pricingConditions: [], expanded: false },
]

// Sample courts data
const courts: Court[] = [
  {
    id: "court-1",
    name: "Court 1 - Outdoor",
    subtitle: "Pickleball",
    sport: "pickleball",
    available: true,
  },
  {
    id: "court-2",
    name: "Court 2 - Indoor",
    subtitle: "Pickleball",
    sport: "pickleball",
    available: true,
  },
  {
    id: "court-3",
    name: "Court 3 - Covered",
    subtitle: "Padel",
    sport: "padel",
    available: true,
  },
  {
    id: "court-4",
    name: "Court 4 - Premium",
    subtitle: "Padel",
    sport: "padel",
    available: true,
  },
  {
    id: "court-5",
    name: "Court 5 - Covered",
    subtitle: "Pickleball",
    sport: "pickleball",
    available: true,
  },
]

// Sample coaches data
const sampleCoaches: Coach[] = [
  {
    id: "coach-1",
    name: "James Taylor",
    initials: "JT",
    colour: "bg-indigo-600",
    availableFrom: "09:00",
    availableTo: "19:00",
    sport: "Pickleball",
  },
  {
    id: "coach-2",
    name: "Sarah Mitchell",
    initials: "SM",
    colour: "bg-teal-600",
    availableFrom: "08:00",
    availableTo: "17:00",
    sport: "Padel",
  },
  {
    id: "coach-3",
    name: "David Okafor",
    initials: "DO",
    colour: "bg-amber-600",
    availableFrom: "08:00",
    availableTo: "18:00",
    sport: "Pickleball",
  },
  {
    id: "coach-4",
    name: "Priya Nair",
    initials: "PN",
    colour: "bg-rose-600",
    availableFrom: "09:30",
    availableTo: "20:00",
    sport: "Padel",
  },
]

// Sample coach bookings
const sampleCoachBookings: CoachBooking[] = [
  {
    id: "cb-1",
    coachId: "coach-1",
    courtId: "court-1",
    courtName: "Court 1 - Outdoor",
    title: "July Mega Open Play",
    startTime: "09:00",
    endTime: "10:30",
    playerName: "Group",
    type: "activity",
    status: "confirmed",
    currentPlayers: 8,
    maxPlayers: 12,
  },
  {
    id: "cb-2",
    coachId: "coach-1",
    courtId: "court-1",
    courtName: "Court 1 - Outdoor",
    title: "Private Lesson | 2 PAX",
    startTime: "14:00",
    endTime: "15:00",
    playerName: "Emily Davis",
    type: "lesson",
    status: "confirmed",
  },
  {
    id: "cb-3",
    coachId: "coach-2",
    courtId: "court-3",
    courtName: "Court 3 - Covered",
    title: "Beginner Padel Clinic",
    startTime: "10:00",
    endTime: "11:30",
    playerName: "Group",
    type: "lesson",
    status: "confirmed",
    currentPlayers: 4,
    maxPlayers: 6,
  },
  {
    id: "cb-4",
    coachId: "coach-2",
    courtId: "court-4",
    courtName: "Court 4 - Premium",
    title: "Open Match Session",
    startTime: "16:00",
    endTime: "17:30",
    playerName: "Mike Chen",
    type: "open-match",
    status: "confirmed",
    currentPlayers: 3,
    maxPlayers: 4,
  },
  {
    id: "cb-5",
    coachId: "coach-3",
    courtId: "court-2",
    courtName: "Court 2 - Indoor",
    title: "Immediate Drills",
    startTime: "08:00",
    endTime: "09:30",
    playerName: "Group",
    type: "activity",
    status: "confirmed",
    currentPlayers: 6,
    maxPlayers: 8,
  },
  {
    id: "cb-6",
    coachId: "coach-3",
    courtId: "court-4",
    courtName: "Court 4 - Premium",
    title: "Advanced Tournament Prep",
    startTime: "11:00",
    endTime: "13:00",
    playerName: "Group",
    type: "tournament",
    status: "confirmed",
    currentPlayers: 12,
    maxPlayers: 16,
  },
  {
    id: "cb-7",
    coachId: "coach-4",
    courtId: "court-1",
    courtName: "Court 1 - Outdoor",
    title: "Private Lesson",
    startTime: "09:30",
    endTime: "11:00",
    playerName: "Sarah Johnson",
    type: "lesson",
    status: "pending",
  },
  {
    id: "cb-8",
    coachId: "coach-4",
    courtId: "court-3",
    courtName: "Court 3 - Covered",
    title: "Private Lesson",
    startTime: "14:00",
    endTime: "16:00",
    playerName: "Sarah Johnson",
    type: "lesson",
    status: "confirmed",
    currentPlayers: 3,
    maxPlayers: 4,
  },
]

// Sample bookings data
const sampleBookings: Booking[] = [
  {
    id: "booking-1",
    courtId: "court-1",
    startTime: "09:00",
    endTime: "10:30",
    playerName: "John Smith",
    type: "regular",
    status: "confirmed",
    isPaid: true,
  },
  {
    id: "booking-2",
    courtId: "court-1",
    startTime: "14:00",
    endTime: "15:00",
    playerName: "Sarah Johnson",
    type: "lesson",
    status: "confirmed",
    isPaid: false,
  },
  {
    id: "booking-3",
    courtId: "court-2",
    startTime: "10:00",
    endTime: "11:30",
    playerName: "Mike Chen",
    type: "regular",
    status: "confirmed",
    isPaid: true,
  },
  {
    id: "booking-4",
    courtId: "court-3",
    startTime: "08:00",
    endTime: "09:00",
    playerName: "Court Maintenance",
    type: "maintenance",
    status: "confirmed",
  },
  {
    id: "booking-5",
    courtId: "court-3",
    startTime: "11:00",
    endTime: "13:00",
    playerName: "Club Tournament",
    type: "tournament",
    status: "confirmed",
    currentPlayers: 12,
    maxPlayers: 16,
  },
  {
    id: "booking-6",
    courtId: "court-4",
    startTime: "09:30",
    endTime: "11:00",
    playerName: "Emily Davis",
    type: "regular",
    status: "pending",
    isPaid: false,
  },
  {
    id: "booking-7",
    courtId: "court-5",
    startTime: "15:00",
    endTime: "16:30",
    playerName: "Cancelled Session",
    type: "regular",
    status: "cancelled",
    isPaid: true,
  },
  {
    id: "booking-8",
    courtId: "court-2",
    startTime: "16:00",
    endTime: "17:30",
    playerName: "Group Lesson",
    type: "lesson",
    status: "confirmed",
    isPaid: true,
  },
  {
    id: "booking-9",
    courtId: "court-4",
    startTime: "14:00",
    endTime: "16:00",
    playerName: "Open Match",
    type: "open-match",
    status: "confirmed",
    currentPlayers: 3,
    maxPlayers: 4,
  },
  {
    id: "booking-10",
    courtId: "court-5",
    startTime: "10:00",
    endTime: "12:00",
    playerName: "Beginner Activity",
    type: "activity",
    status: "confirmed",
    currentPlayers: 6,
    maxPlayers: 8,
  },
]


export default function SchedulePage() {
  const [activeDate, setActiveDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<"courts" | "coaches">("courts")
  const [timeView, setTimeView] = useState<"daily" | "monthly">("daily")
  const [showCancelled, setShowCancelled] = useState(false)
  const [selectedSport, setSelectedSport] = useState("All Sports")
  const [bookings] = useState<Booking[]>(sampleBookings)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  // Bridges a coach-card click to the shared booking dialog hosted by CalendarGrid.
  // The nonce lets repeated clicks on the same booking re-open the dialog.
  const [coachBookingClick, setCoachBookingClick] = useState<{ booking: Booking; nonce: number } | null>(null)
  // Bridges an empty-slot click on the coaches grid to the shared create-mode dialog.
  const [coachSlotClick, setCoachSlotClick] = useState<{ courtId: string; time: string; nonce: number } | null>(null)

  const handlePrevDay = () => {
    setActiveDate((d) => { const n = new Date(d); n.setDate(d.getDate() - 1); return n })
  }

  const handleNextDay = () => {
    setActiveDate((d) => { const n = new Date(d); n.setDate(d.getDate() + 1); return n })
  }

  const handleToday = () => {
    setActiveDate(new Date())
  }

  const handleSelectDate = (date: Date) => {
    setActiveDate(date)
  }

  const handleBookingClick = (booking: Booking) => {
    console.log("[v0] Booking clicked:", booking)
  }

  const handleSlotClick = (courtId: string, time: string) => {
    console.log("[v0] Slot clicked:", courtId, time)
  }

  // Filter bookings based on settings
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      if (!showCancelled && booking.status === "cancelled") {
        return false
      }
      return true
    })
  }, [bookings, showCancelled])

  // Filter courts based on sport
  const filteredCourts = useMemo(() => {
    if (selectedSport === "All Sports") {
      return courts
    }
    return courts.filter((court) => 
      court.subtitle.toLowerCase() === selectedSport.toLowerCase()
    )
  }, [selectedSport])

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <main className="flex flex-1 flex-col overflow-hidden">
        {timeView !== "monthly" && (
          <CalendarHeader
            activeDate={activeDate}
            onPrevDay={handlePrevDay}
            onNextDay={handleNextDay}
            onToday={handleToday}
            onSelectDate={handleSelectDate}
          />
        )}
        
        <CalendarFilters
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          showCancelled={showCancelled}
          onShowCancelledChange={setShowCancelled}
          selectedSport={selectedSport}
          onSportChange={setSelectedSport}
          timeView={timeView}
          onTimeViewChange={(v) => setTimeView(v as "daily" | "monthly")}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {timeView === "monthly" ? (
          <CalendarMonthlyView
            courts={filteredCourts}
            currentDate={activeDate}
            viewMode={viewMode}
            selectedSport={selectedSport}
          />
        ) : viewMode === "coaches" ? (
          <>
            <CoachScheduleView
              coaches={sampleCoaches}
              bookings={sampleCoachBookings}
              onBookingClick={(b) => setCoachBookingClick({ booking: b, nonce: Date.now() })}
              onSlotClick={(_coachId, time) => setCoachSlotClick({ courtId: "", time, nonce: Date.now() })}
            />
            {/* Hidden CalendarGrid hosts the shared booking dialog so coach cards/slots open the same modal as court cards/slots. */}
            <CalendarGrid
              courts={filteredCourts}
              bookings={filteredBookings}
              onBookingClick={handleBookingClick}
              onSlotClick={handleSlotClick}
              searchQuery={searchQuery}
              bookingTypes={sampleBookingTypes}
              hideGrid
              externalBookingClick={coachBookingClick}
              externalSlotClick={coachSlotClick}
            />
          </>
        ) : (
          <CalendarGrid
            courts={filteredCourts}
            bookings={filteredBookings}
            onBookingClick={handleBookingClick}
            onSlotClick={handleSlotClick}
            searchQuery={searchQuery}
            bookingTypes={sampleBookingTypes}
          />
        )}
      </main>
    </div>
  )
}
