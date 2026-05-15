import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { 
  X,
  Plus,

  Search,
  UserPlus,
  Clock,
  ChevronLeft,
  User,
  CreditCard,
  RepeatIcon,
  Trash2,
  Phone,
  Trophy,
  CheckCircle2,
  Circle,
  Banknote,
  Smartphone,
  ArrowUpDown,
} from "lucide-react"
import type { BookingType } from "@/lib/setup-types"

export interface Court {
  id: string
  name: string
  subtitle: string
  sport: "pickleball" | "padel" | "other"
  available: boolean
}

export interface Booking {
  id: string
  courtId: string
  startTime: string
  endTime: string
  playerName: string
  type: "regular" | "lesson" | "tournament" | "maintenance" | "activity" | "open-match"
  status: "confirmed" | "pending" | "cancelled"
  isPaid?: boolean
  currentPlayers?: number
  maxPlayers?: number
}

interface CalendarGridProps {
  courts: Court[]
  bookings: Booking[]
  onBookingClick?: (booking: Booking) => void
  onSlotClick?: (courtId: string, time: string) => void
  searchQuery?: string
  bookingTypes?: BookingType[]
}

type BookingCategory = "booking" | "lesson" | "activity" | "block"
type BookingSubType = "regular" | "open-match"


function computeEndTime(startTime: string, durationSlots: number): string {
  const idx = timeOptions.indexOf(startTime)
  if (idx === -1) return startTime
  return timeOptions[Math.min(idx + durationSlots, timeOptions.length - 1)]
}

const timeSlots = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30",
]

const hourSlots = timeSlots.filter(t => t.endsWith(":00"))

const timeOptions = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00",
]

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

function getSlotDashStyle(type: Booking["type"] = "regular") {
  switch (type) {
    case "lesson":      return "border-teal-400 text-teal-500"
    case "tournament":  return "border-violet-400 text-violet-500"
    case "activity":    return "border-amber-400 text-amber-500"
    case "maintenance": return "border-slate-400 text-slate-500"
    case "open-match":  return "border-sky-400 text-sky-500"
    default:            return "border-indigo-300 text-indigo-400"
  }
}

function getBookingPosition(startTime: string, endTime: string) {
  const startIndex = timeSlots.indexOf(startTime)
  const endIndex = timeSlots.indexOf(endTime)
  if (startIndex === -1 || endIndex === -1) return null
  
  const top = startIndex * 24
  const height = (endIndex - startIndex) * 24
  
  return { top, height }
}

function getCurrentTimePosition() {
  const now = new Date()
  const hours = now.getHours()
  const minutes = now.getMinutes()
  
  // Calculate position based on the time grid (7:00 - 20:30)
  const startHour = 7
  const endHour = 21
  
  if (hours < startHour || hours >= endHour) return null
  
  // Each hour is 48px (2 x 24px for half-hour slots)
  const hoursFromStart = hours - startHour
  const minuteFraction = minutes / 60
  const position = (hoursFromStart + minuteFraction) * 48
  
  return position
}

// Mock player database
interface Player {
  id: string
  name: string
  email: string
  initials: string
  color: string
}

const mockPlayers: Player[] = [
  { id: "p1", name: "John Smith", email: "john.smith@email.com", initials: "JS", color: "bg-indigo-500" },
  { id: "p2", name: "Sarah Johnson", email: "sarah.j@email.com", initials: "SJ", color: "bg-teal-500" },
  { id: "p3", name: "Mike Chen", email: "mike.chen@email.com", initials: "MC", color: "bg-amber-500" },
  { id: "p4", name: "Emily Davis", email: "emily.d@email.com", initials: "ED", color: "bg-rose-500" },
  { id: "p5", name: "David Okafor", email: "d.okafor@email.com", initials: "DO", color: "bg-sky-500" },
  { id: "p6", name: "Priya Nair", email: "priya.n@email.com", initials: "PN", color: "bg-violet-500" },
  { id: "p7", name: "James Taylor", email: "j.taylor@email.com", initials: "JT", color: "bg-emerald-500" },
  { id: "p8", name: "Lisa Wang", email: "lisa.wang@email.com", initials: "LW", color: "bg-orange-500" },
]

// Mock activity services (in production pulled from admin settings)
const mockActivityServices = [
  { value: "junior-camp",     label: "Junior Camp",       price: 15.00 },
  { value: "cardio-tennis",   label: "Cardio Tennis",     price: 12.00 },
  { value: "club-night",      label: "Club Night",        price: 8.00  },
  { value: "social-doubles",  label: "Social Doubles",    price: 10.00 },
  { value: "beginners-class", label: "Beginners Class",   price: 10.00 },
]

// Mock coaches
interface Coach {
  id: string
  name: string
  initials: string
  color: string
}

const mockCoaches: Coach[] = [
  { id: "c1", name: "Alex Rivera", initials: "AR", color: "bg-teal-500" },
  { id: "c2", name: "Jordan Blake", initials: "JB", color: "bg-indigo-500" },
  { id: "c3", name: "Sam Nguyen", initials: "SN", color: "bg-amber-500" },
  { id: "c4", name: "Casey Morgan", initials: "CM", color: "bg-rose-500" },
]



const LEVELS = [
  { value: 1, label: "Beginner" },
  { value: 2, label: "Improver" },
  { value: 3, label: "Intermediate" },
  { value: 4, label: "Advanced" },
  { value: 5, label: "Expert" },
]

export function CalendarGrid({ courts, bookings, onBookingClick, onSlotClick, searchQuery = "", bookingTypes = [] }: CalendarGridProps) {
  // Derive duration options from admin-configured booking types
  const bookingServices = bookingTypes.map((bt) => {
    const mins = parseInt(bt.duration, 10) || 60
    const durationSlots = Math.round(mins / 30)
    const hours = mins / 60
    const label = hours === Math.floor(hours) ? `${hours} hr` : `${hours} hr`
    return {
      value: bt.id,
      label: `${mins} min`,
      durationSlots,
      maxPlayers: parseInt(bt.maxCapacity, 10) || 4,
    }
  })
  const [selectedSlot, setSelectedSlot] = useState<{ courtId: string; time: string } | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogStep, setDialogStep] = useState<"select" | "form">("select")
  const [selectedCategory, setSelectedCategory] = useState<BookingCategory>("booking")
  const [selectedSubType, setSelectedSubType] = useState<BookingSubType>("regular")
  const [isViewMode, setIsViewMode] = useState(false)
  const [viewModeTab, setViewModeTab] = useState<"details" | "payment">("details")
  const [viewedBooking, setViewedBooking] = useState<Booking | null>(null)
  const [activeTab, setActiveTab] = useState<"payments" | "logs">("payments")
  const [playerTab, setPlayerTab] = useState<"players" | "cancelled" | "waiting">("players")
  const [selectedCoachId, setSelectedCoachId] = useState<string>("")
  const [selectedCourtIds, setSelectedCourtIds] = useState<string[]>([])
  const [currentTimePosition, setCurrentTimePosition] = useState<number | null>(null)
  const [playerSearch, setPlayerSearch] = useState("")
  const [showPlayerSearch, setShowPlayerSearch] = useState(false)
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([])
  const [maxPlayers, setMaxPlayers] = useState(4)
  const [playerPayments, setPlayerPayments] = useState<Record<string, { paid: boolean; method: string; amount: string }>>({})
  const [collectingPaymentFor, setCollectingPaymentFor] = useState<string | null>(null)
  // Open-match: two unnamed groups of 2, separated by a divider
  const [groupTop, setGroupTop] = useState<Player[]>([])
  const [groupBottom, setGroupBottom] = useState<Player[]>([])
  // Which group the next player-search pick goes into ("top" | "bottom" | null = flat mode)
  const [addingToGroup, setAddingToGroup] = useState<"top" | "bottom" | null>(null)
  const [showNewPlayerForm, setShowNewPlayerForm] = useState(false)
  const [newPlayerForm, setNewPlayerForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    levels: {
      tennis: "",
      padel: "",
      pickleball: "",
    },
  })
  const playerSearchRef = useRef<HTMLDivElement>(null)

  // Update current time position every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTimePosition(getCurrentTimePosition())
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])
  
  const [formData, setFormData] = useState({
    bookingService: "",
    date: "",
    startTime: "11:30",
    endTime: "12:30",
    location: "KI",
    court: "",
    recurring: false,
    recurringFrequency: "weekly" as "weekly" | "daily",
    recurringStartDate: "",
    recurringEndDate: "",
    requireApproval: false,
    players: [] as string[],
    notes: "",
    blockReason: "",
    activityService: "",
    levelMin: 1,
    levelMax: 5,
  })

  // Initialize date on client side only to avoid hydration mismatch
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      date: new Date().toLocaleDateString("en-GB")
    }))
  }, [])

  const handleSlotClick = (courtId: string, time: string) => {
    setSelectedSlot({ courtId, time })
    setDialogStep("form")
    setSelectedCategory("booking")
    setSelectedSubType("regular")

    const endTime = computeEndTime(time, 2)

    setFormData(prev => ({
      ...prev,
      bookingService: "",
      court: courtId,
      startTime: time,
      endTime: endTime,
      date: new Date().toLocaleDateString("en-GB"),
    }))
    setMaxPlayers(4)
    setDialogOpen(true)
    onSlotClick?.(courtId, time)
  }

  const handleCategorySelect = (category: BookingCategory) => {
    setSelectedCategory(category)
    setDialogStep("form")
  }

  const handleBookingCardClick = (booking: Booking) => {
    setViewedBooking(booking)
    setIsViewMode(true)
    setViewModeTab("details")
    setSelectedCategory(
      booking.type === "lesson" ? "lesson"
      : booking.type === "activity" ? "activity"
      : booking.type === "open-match" || booking.type === "regular" ? "booking"
      : "block"
    )
    setSelectedSubType(booking.type === "open-match" ? "open-match" : "regular")
    const isBlockType = booking.type === "maintenance" || booking.type === "tournament"
    setFormData(prev => ({
      ...prev,
      court: booking.courtId,
      startTime: booking.startTime,
      endTime: booking.endTime,
      date: new Date().toLocaleDateString("en-GB"),
      blockReason: isBlockType ? booking.playerName : prev.blockReason,
    }))
    // Seed players — in production these come from the stored booking record
    const count = booking.currentPlayers ?? booking.maxPlayers ?? 2
    const seeded = mockPlayers.slice(0, Math.min(count, mockPlayers.length))
    setSelectedPlayers(seeded)
    if (booking.type === "open-match") {
      setGroupTop(seeded.slice(0, 2))
      setGroupBottom(seeded.slice(2, 4))
    } else {
      setGroupTop([])
      setGroupBottom([])
    }
    setDialogOpen(true)
    onBookingClick?.(booking)
  }

  const handleBookingSubmit = () => {
    setDialogOpen(false)
    resetForm()
  }

  const resetForm = () => {
    setDialogStep("form")
    setSelectedCategory("booking")
    setSelectedSubType("regular")
    setIsViewMode(false)
    setViewModeTab("details")
    setViewedBooking(null)
    setSelectedCoachId("")
    setSelectedCourtIds([])
    setPlayerSearch("")
    setShowPlayerSearch(false)
    setSelectedPlayers([])
    setGroupTop([])
    setGroupBottom([])
    setAddingToGroup(null)
    setMaxPlayers(4)
    setPlayerPayments({})
    setCollectingPaymentFor(null)
    setShowNewPlayerForm(false)
    setNewPlayerForm({ firstName: "", lastName: "", email: "", phone: "", levels: { tennis: "", padel: "", pickleball: "" } })
    setFormData({
      bookingService: "",
      date: new Date().toLocaleDateString("en-GB"),
      startTime: "11:30",
      endTime: "12:30",
      location: "KI",
      court: "",
      recurring: false,
      recurringFrequency: "weekly" as "weekly" | "daily",
      recurringStartDate: "",
      recurringEndDate: "",
      requireApproval: false,
      players: [],
      notes: "",
      blockReason: "",
      activityService: "",
      levelMin: 1,
      levelMax: 5,
    })
  }

  const addPlayer = (player: Player) => {
    if (addingToGroup === "top") {
      if (!groupTop.find(p => p.id === player.id) && groupTop.length < 2) {
        setGroupTop(prev => [...prev, player])
      }
    } else if (addingToGroup === "bottom") {
      if (!groupBottom.find(p => p.id === player.id) && groupBottom.length < 2) {
        setGroupBottom(prev => [...prev, player])
      }
    } else {
      if (!selectedPlayers.find(p => p.id === player.id)) {
        setSelectedPlayers(prev => [...prev, player])
      }
    }
    setPlayerSearch("")
    setShowPlayerSearch(false)
    setAddingToGroup(null)
  }

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(prev => prev.filter(p => p.id !== playerId))
    setPlayerPayments(prev => { const n = { ...prev }; delete n[playerId]; return n })
    if (collectingPaymentFor === playerId) setCollectingPaymentFor(null)
  }

  const handleCreateNewPlayer = () => {
    const { firstName, lastName, email } = newPlayerForm
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return
    const fullName = `${firstName.trim()} ${lastName.trim()}`
    const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
    const colors = ["bg-indigo-500","bg-teal-500","bg-amber-500","bg-rose-500","bg-sky-500","bg-violet-500","bg-emerald-500","bg-orange-500"]
    const color = colors[Math.floor(Math.random() * colors.length)]
    const newPlayer: Player = { id: `new-${Date.now()}`, name: fullName, email, initials, color }
    addPlayer(newPlayer)
    setShowNewPlayerForm(false)
    setNewPlayerForm({ firstName: "", lastName: "", email: "", phone: "", levels: { tennis: "", padel: "", pickleball: "" } })
    setShowPlayerSearch(false)
  }

  const filteredPlayers = mockPlayers.filter(p =>
    !selectedPlayers.find(sp => sp.id === p.id) &&
    (p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
     p.email.toLowerCase().includes(playerSearch.toLowerCase()))
  )

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const getCourtBookings = (courtId: string) => {
    return bookings.filter(b => b.courtId === courtId)
  }

  const selectedCourt = courts.find(c => c.id === selectedSlot?.courtId)

  return (
    <>
      <div className="flex flex-1 overflow-auto">
        {/* Time Column */}
        <div className="sticky left-0 z-20 w-16 flex-shrink-0 border-r border-border bg-card">
          <div className="h-14 border-b border-border" />
          <div className="relative">
            {hourSlots.map((time) => (
              <div
                key={time}
                className="flex h-12 items-start justify-end border-b border-border/60 pr-2"
              >
                <span className="text-[10px] font-medium text-muted-foreground -translate-y-2">{time}</span>
              </div>
            ))}
            {/* Current time pill */}
            {currentTimePosition !== null && (
              <div
                className="absolute right-0 z-10 pointer-events-none"
                style={{ top: currentTimePosition - 10 }}
              >
                <div className="flex items-center justify-end pr-1.5">
                  <span className="bg-foreground text-background text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Courts Grid */}
        <div className="flex flex-1">
          {courts.map((court) => (
            <div
              key={court.id}
              className="flex-1 min-w-[200px] border-r border-border last:border-r-0"
            >
              {/* Court Header */}
              <div className="sticky top-0 z-10 flex h-14 flex-col items-center justify-center border-b border-border bg-card px-2">
                <span className="text-xs font-bold tracking-wide text-foreground">
                  {court.name}
                </span>
                <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                  {court.subtitle}
                </span>
              </div>
              
                {/* Time Slots */}
                <div
                  className="relative"
                  style={!court.available ? {
                    backgroundImage: "repeating-linear-gradient(135deg, transparent, transparent 6px, rgba(0,0,0,0.04) 6px, rgba(0,0,0,0.04) 12px)"
                  } : undefined}
                >
                  {hourSlots.map((time) => {
                    const halfTime = time.replace(":00", ":30")
                    return (
                      <div
                        key={time}
                        className="h-12 border-b border-border/60"
                      >
                        {/* Full-hour half slot */}
                        <div
                          className="group h-6 border-b border-border/30 cursor-pointer transition-colors"
                          onClick={() => court.available && handleSlotClick(court.id, time)}
                        >
                          {court.available && (
                            <div className={cn(
                              "hidden group-hover:flex h-full mx-1 mt-0.5 mb-0 rounded border border-dashed items-center justify-center",
                              getSlotDashStyle()
                            )}>
                              <span className="text-[9px] font-semibold leading-none">+ {time}</span>
                            </div>
                          )}
                        </div>
                        {/* Half-hour slot */}
                        <div
                          className="group h-6 cursor-pointer transition-colors"
                          onClick={() => court.available && handleSlotClick(court.id, halfTime)}
                        >
                          {court.available && (
                            <div className={cn(
                              "hidden group-hover:flex h-full mx-1 mb-0.5 rounded border border-dashed items-center justify-center",
                              getSlotDashStyle()
                            )}>
                              <span className="text-[9px] font-semibold leading-none">+ {halfTime}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                
                {/* Bookings Overlay */}
                {getCourtBookings(court.id).map((booking) => {
                  const position = getBookingPosition(booking.startTime, booking.endTime)
                  if (!position) return null
                  
                  const showPlayerCount = (booking.type === "tournament" || booking.type === "activity" || booking.type === "open-match") && 
                    booking.maxPlayers !== undefined

                  const isSearchActive = searchQuery.trim().length > 0
                  const isMatch = isSearchActive && booking.playerName.toLowerCase().includes(searchQuery.toLowerCase().trim())
                  const isDimmed = isSearchActive && !isMatch
                  
                  return (
                    <button
                      key={booking.id}
                      onClick={() => handleBookingCardClick(booking)}
                      style={{
                        top: position.top,
                        height: position.height,
                      }}
                      className={cn(
                        "absolute inset-x-1 rounded-xl text-left transition-all hover:brightness-95 hover:shadow-md px-2.5 py-2",
                        getBookingStyle(booking.type),
                        booking.status === "cancelled" && "opacity-40",
                        isDimmed && "opacity-20 grayscale",
                        isMatch && "ring-2 ring-offset-1 ring-foreground/40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className={cn("text-xs font-bold truncate flex-1 leading-tight", booking.status === "cancelled" && "line-through")}>
                          {booking.playerName}
                        </div>
                        {showPlayerCount && (
                          <span className="text-[9px] font-semibold bg-black/15 px-1.5 py-0.5 rounded-full shrink-0">
                            {booking.currentPlayers ?? 0}/{booking.maxPlayers}
                          </span>
                        )}
                        {booking.isPaid === false && (
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive mt-0.5 shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] font-medium opacity-70 mt-0.5">
                        {booking.startTime}–{booking.endTime}
                      </div>
                    </button>
                  )
                })}

                {/* Current Time Indicator */}
                {currentTimePosition !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: currentTimePosition }}
                  >
                    <div className="flex items-center">
                      <div className="flex-1 h-[1.5px] bg-foreground/50" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-[520px]" showCloseButton={false}>
          {/* Always show the form directly */}
          <div className="flex flex-col max-h-[90vh]">
              <DialogHeader className="sr-only">
                <DialogTitle>Create {selectedCategory}</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new {selectedCategory}
                </DialogDescription>
              </DialogHeader>

              {/* Modal Header — single row: title + date badge | tabs | close */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border">
                {/* Left: title + date */}
                <div className="flex flex-col min-w-0 flex-1">
                  <h2 className="text-sm font-semibold text-foreground truncate">
                    {isViewMode
                      ? viewedBooking?.type === "regular" ? "Booking"
                        : viewedBooking?.type === "lesson" ? "Private Lesson"
                        : viewedBooking?.type === "activity" ? "Activity"
                        : viewedBooking?.type === "open-match" ? "Open Match"
                        : viewedBooking?.type === "maintenance" || viewedBooking?.type === "tournament" ? "Block"
                        : "Booking"
                      : selectedCategory === "lesson"
                        ? "New Private Lesson"
                        : `New ${selectedCategory === "block" ? "Block" : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`}
                  </h2>
                  {formData.date && (
                    <span className="text-[11px] text-muted-foreground mt-0.5">{formData.date}</span>
                  )}
                </div>
                {/* Centre: tabs */}
                {isViewMode ? (
                  <div className="flex items-center bg-secondary rounded-lg p-0.5 shrink-0">
                    {(["details", "payment"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setViewModeTab(tab)}
                        className={cn(
                          "px-3 py-1 text-[11px] font-medium rounded-md transition-all capitalize",
                          viewModeTab === tab
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {tab === "payment" ? "Payment" : "Details"}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center bg-secondary rounded-lg p-0.5 shrink-0">
                    {(["booking", "lesson", "activity", "block"] as BookingCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "px-3 py-1 text-[11px] font-medium rounded-md transition-all capitalize",
                          selectedCategory === cat
                            ? "bg-card text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
                {/* Right: close */}
                <button
                  onClick={() => handleDialogClose(false)}
                  className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors shrink-0"
                  aria-label="Close dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 relative">

                {/* View mode: wrap content in tab check */}
                {isViewMode && viewModeTab === "payment" ? (
                  /* Payment tab — structured accounting view */
                  (() => {
                    // Derived values — in production these come from admin settings / membership rules
                    const basePrice = 20.00
                    const membershipDiscount = 0.00 // auto-applied from membership lookup
                    const totalDue = Math.max(0, basePrice - membershipDiscount)
                    const perPlayerShare = selectedPlayers.length > 0 ? totalDue / selectedPlayers.length : totalDue

                    const totalCollected = selectedPlayers.reduce((sum, p) => {
                      if (!playerPayments[p.id]?.paid) return sum
                      return sum + (parseFloat(playerPayments[p.id]?.amount || "0") || 0)
                    }, 0)
                    const totalOutstanding = Math.max(0, totalDue - totalCollected)
                    const allPaid = selectedPlayers.length > 0 && selectedPlayers.every(p => playerPayments[p.id]?.paid)
                    const somePaid = selectedPlayers.some(p => playerPayments[p.id]?.paid)

                    return (
                      <div className="px-5 py-4 space-y-4">

                        {/* Total due summary */}
                        <div className="rounded-xl bg-secondary border border-border px-4 py-3 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              {viewedBooking?.playerName ?? "Booking"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {formData.startTime}–{formData.endTime} · {courts.find(c => c.id === formData.court)?.name ?? "Court"}
                              {membershipDiscount > 0 && (
                                <span className="ml-2 text-emerald-600 font-medium">
                                  −£{membershipDiscount.toFixed(2)} membership
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <p className="text-[10px] text-muted-foreground">Total due</p>
                            <p className="text-base font-bold text-foreground tabular-nums">£{totalDue.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Per-player payment ledger */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Payments
                            </p>
                            {selectedPlayers.length > 0 && (
                              <span className={cn(
                                "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                allPaid ? "bg-emerald-500/10 text-emerald-600"
                                : somePaid ? "bg-amber-500/10 text-amber-600"
                                : "bg-rose-500/10 text-rose-500"
                              )}>
                                {allPaid ? "Settled" : somePaid ? "Partial" : "Outstanding"}
                              </span>
                            )}
                          </div>

                          {selectedPlayers.length === 0 ? (
                            <div className="flex items-center justify-center py-8 rounded-xl bg-secondary border border-border border-dashed">
                              <p className="text-xs text-muted-foreground">No players on this booking</p>
                            </div>
                          ) : (
                            <div className="rounded-xl border border-border overflow-hidden">
                              <div className={cn(selectedPlayers.length > 4 && "max-h-[272px] overflow-y-auto")}>
                              {selectedPlayers.map((player, index) => {
                                const payment = playerPayments[player.id]
                                const isPaid = payment?.paid ?? false
                                const isCollecting = collectingPaymentFor === player.id
                                const collectedAmt = isPaid ? (parseFloat(payment?.amount || "0") || 0) : 0

                                return (
                                  <div key={player.id} className={cn(index < selectedPlayers.length - 1 && "border-b border-border")}>
                                    {/* Player row */}
                                    <div className={cn(
                                      "flex items-center gap-3 px-3 py-2.5",
                                      isPaid ? "bg-card" : "bg-card"
                                    )}>
                                      <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0", player.color)}>
                                        {player.initials}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-foreground truncate">{player.name}</p>
                                        <p className="text-[10px] text-muted-foreground">
                                          Share: <span className="font-medium text-foreground tabular-nums">£{perPlayerShare.toFixed(2)}</span>
                                        </p>
                                      </div>
                                      {isPaid ? (
                                        <div className="flex items-center gap-2">
                                          <div className="text-right">
                                            <p className="text-[10px] font-semibold text-emerald-600 tabular-nums">£{collectedAmt.toFixed(2)}</p>
                                            <p className="text-[9px] text-muted-foreground capitalize">{payment?.method ?? "cash"}</p>
                                          </div>
                                          <button
                                            onClick={() => setPlayerPayments(prev => ({ ...prev, [player.id]: { ...prev[player.id], paid: false } }))}
                                            className="w-6 h-6 flex items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                                            title="Mark as unpaid"
                                          >
                                            <CheckCircle2 className="h-3.5 w-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setCollectingPaymentFor(isCollecting ? null : player.id)
                                            // Pre-fill amount to player share
                                            if (!isCollecting) {
                                              setPlayerPayments(prev => ({
                                                ...prev,
                                                [player.id]: {
                                                  paid: false,
                                                  method: prev[player.id]?.method ?? "cash",
                                                  amount: prev[player.id]?.amount || perPlayerShare.toFixed(2),
                                                }
                                              }))
                                            }
                                          }}
                                          className={cn(
                                            "text-[11px] font-medium px-3 py-1 rounded-lg transition-colors shrink-0",
                                            isCollecting
                                              ? "bg-foreground text-background"
                                              : "bg-secondary text-foreground hover:bg-foreground/10 border border-border"
                                          )}
                                        >
                                          Collect
                                        </button>
                                      )}
                                    </div>

                                    {/* Inline payment collection panel */}
                                    {isCollecting && !isPaid && (
                                      <div className="px-3 pb-3 pt-2 bg-secondary/40 border-t border-border space-y-2.5">
                                        {/* Amount + method */}
                                        <div className="flex items-center gap-2">
                                          <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-medium select-none">£</span>
                                            <Input
                                              type="number" min="0" step="0.01"
                                              value={playerPayments[player.id]?.amount ?? perPlayerShare.toFixed(2)}
                                              onChange={(e) => setPlayerPayments(prev => ({
                                                ...prev,
                                                [player.id]: { paid: false, method: prev[player.id]?.method ?? "cash", amount: e.target.value }
                                              }))}
                                              className="h-8 pl-6 text-xs bg-card border border-border focus-visible:ring-1"
                                              style={{ fontSize: "0.75rem" }}
                                            />
                                          </div>
                                          <div className="flex items-center bg-card rounded-lg p-0.5 border border-border">
                                            {[
                                              { value: "cash", icon: <Banknote className="h-3 w-3" />, label: "Cash" },
                                              { value: "card", icon: <CreditCard className="h-3 w-3" />, label: "Card" },
                                            ].map(({ value, icon, label }) => (
                                              <button
                                                key={value}
                                                title={label}
                                                onClick={() => setPlayerPayments(prev => ({
                                                  ...prev,
                                                  [player.id]: { paid: false, method: value, amount: prev[player.id]?.amount ?? perPlayerShare.toFixed(2) }
                                                }))}
                                                className={cn(
                                                  "flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all",
                                                  (playerPayments[player.id]?.method ?? "cash") === value
                                                    ? "bg-foreground text-background shadow-sm"
                                                    : "text-muted-foreground hover:text-foreground"
                                                )}
                                              >
                                                {icon}
                                                <span>{label}</span>
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                        {/* Confirm button */}
                                        <button
                                          onClick={() => {
                                            setPlayerPayments(prev => ({
                                              ...prev,
                                              [player.id]: {
                                                paid: true,
                                                method: prev[player.id]?.method ?? "cash",
                                                amount: prev[player.id]?.amount ?? perPlayerShare.toFixed(2),
                                              }
                                            }))
                                            setCollectingPaymentFor(null)
                                          }}
                                          className="w-full flex items-center justify-center gap-1.5 h-8 bg-foreground text-background text-xs font-semibold rounded-lg hover:bg-foreground/90 transition-colors"
                                        >
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                          Confirm Payment
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Running total footer */}
                        {selectedPlayers.length > 0 && (
                          <div className="rounded-xl bg-secondary border border-border divide-y divide-border overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2.5">
                              <span className="text-[11px] text-muted-foreground">Collected</span>
                              <span className="text-xs font-semibold text-emerald-600 tabular-nums">£{totalCollected.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between px-4 py-2.5">
                              <span className="text-[11px] text-muted-foreground">Outstanding</span>
                              <span className={cn(
                                "text-xs font-semibold tabular-nums",
                                totalOutstanding > 0 ? "text-rose-500" : "text-muted-foreground"
                              )}>
                                £{totalOutstanding.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                      </div>
                    )
                  })()
                ) : (
                  /* Details tab (or create mode) */
                  <>

                {/* Section: Schedule — two-column layout */}
                {(() => {
                  const svc = bookingServices.find(s => s.value === formData.bookingService)
                  const lockedDurationSlots = isViewMode
                    ? (() => {
                        const startIdx = timeOptions.indexOf(formData.startTime)
                        const endIdx = timeOptions.indexOf(formData.endTime)
                        return endIdx > startIdx ? endIdx - startIdx : svc?.durationSlots ?? 2
                      })()
                    : svc?.durationSlots ?? 2

                  return (
                    <div className="px-5 py-4 border-b border-border">
                      <div className="flex gap-3 items-stretch">

                        {/* ── LEFT column: primary selector ── */}
                        <div className="flex-1 min-w-0 flex flex-col gap-2">

                          {/* Booking: open match toggle + duration pills */}
                          {selectedCategory === "booking" && (
                            <>
                              {/* Open match segmented control — create mode only */}
                              {!isViewMode && (
                                <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Booking Type</span>
                                <div className="flex items-center bg-secondary rounded-lg p-0.5">
                                  <button
                                    onClick={() => setSelectedSubType("regular")}
                                    className={cn(
                                      "flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all",
                                      selectedSubType === "regular"
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    Regular
                                  </button>
                                  <button
                                    onClick={() => setSelectedSubType("open-match")}
                                    className={cn(
                                      "flex-1 py-1.5 text-[11px] font-medium rounded-md transition-all",
                                      selectedSubType === "open-match"
                                        ? "bg-card text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                    )}
                                  >
                                    Open Match
                                  </button>
                                </div>
                                </div>
                              )}

                              {/* Duration selector */}
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Duration</span>
                                {!isViewMode ? (
                                  bookingServices.length === 0 ? (
                                    <p className="text-[11px] text-muted-foreground italic px-0.5">No durations configured.</p>
                                  ) : (
                                    <Select
                                      value={formData.bookingService}
                                      onValueChange={(value) => {
                                        const s = bookingServices.find(s => s.value === value)
                                        if (!s) return
                                        const newEnd = computeEndTime(formData.startTime, s.durationSlots)
                                        setMaxPlayers(s.maxPlayers)
                                        setFormData({ ...formData, bookingService: value, endTime: newEnd })
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs bg-secondary border-0 focus:ring-0 w-full">
                                        <SelectValue placeholder="Select duration..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {bookingServices.map((s) => (
                                          <SelectItem key={s.value} value={s.value}>
                                            {s.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )
                                ) : (
                                  <div className="px-3 py-2 rounded-lg bg-secondary/50 text-xs font-medium text-muted-foreground">
                                    {lockedDurationSlots * 30} min
                                  </div>
                                )}
                              </div>

                              {/* Level range — open match only */}
                              {selectedSubType === "open-match" && (
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Level Range</span>
                                  <div className="rounded-lg bg-secondary overflow-hidden divide-y divide-border/60">
                                    <Select
                                      value={String(formData.levelMin)}
                                      onValueChange={(v) => {
                                        const min = Number(v)
                                        setFormData({ ...formData, levelMin: min, levelMax: Math.max(formData.levelMax, min) })
                                      }}
                                    >
                                      <SelectTrigger className="h-8 px-3 text-xs bg-transparent border-0 focus:ring-0 w-full font-medium text-foreground [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-60">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-[10px] text-muted-foreground w-6 shrink-0">from</span>
                                          <SelectValue />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {LEVELS.map((l) => (
                                          <SelectItem key={l.value} value={String(l.value)}>
                                            {l.value} — {l.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Select
                                      value={String(formData.levelMax)}
                                      onValueChange={(v) => {
                                        const max = Number(v)
                                        setFormData({ ...formData, levelMax: max, levelMin: Math.min(formData.levelMin, max) })
                                      }}
                                    >
                                      <SelectTrigger className="h-8 px-3 text-xs bg-transparent border-0 focus:ring-0 w-full font-medium text-foreground [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-60">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <span className="text-[10px] text-muted-foreground w-6 shrink-0">to</span>
                                          <SelectValue />
                                        </div>
                                      </SelectTrigger>
                                      <SelectContent>
                                        {LEVELS.map((l) => (
                                          <SelectItem key={l.value} value={String(l.value)}>
                                            {l.value} — {l.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              )}

                              {/* Approve players before joining — open match only */}
                              {selectedSubType === "open-match" && (
                                <label className="flex items-center gap-2 px-0.5 cursor-pointer group w-fit">
                                  <Checkbox
                                    checked={formData.requireApproval}
                                    onCheckedChange={(checked) => setFormData({ ...formData, requireApproval: !!checked })}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                  />
                                  <div className="flex items-center gap-1.5">
                                    <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Approve players before they join</span>
                                  </div>
                                </label>
                              )}

                            </>
                          )}

                          {/* Lesson: coach selector */}
                          {selectedCategory === "lesson" && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Coach</span>
                              {isViewMode ? (
                                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-secondary">
                                  {(() => {
                                    const coach = mockCoaches.find(c => c.id === selectedCoachId)
                                    return coach ? (
                                      <>
                                        <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0", coach.color)}>
                                          {coach.initials}
                                        </div>
                                        <span className="text-xs font-medium text-foreground">{coach.name}</span>
                                      </>
                                    ) : <span className="text-xs text-muted-foreground">No coach assigned</span>
                                  })()}
                                </div>
                              ) : (
                                <Select value={selectedCoachId} onValueChange={setSelectedCoachId}>
                                <SelectTrigger className="h-8 text-xs bg-secondary border-0 focus:ring-0 w-full">
                                  <SelectValue placeholder="Select a coach..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockCoaches.map((coach) => (
                                      <SelectItem key={coach.id} value={coach.id}>
                                        <div className="flex items-center gap-2">
                                          <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0", coach.color)}>
                                            {coach.initials}
                                          </div>
                                          <span>{coach.name}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          )}

                          {/* Activity: event/activity selector */}
                          {selectedCategory === "activity" && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Activity</span>
                              <Select
                                value={formData.activityService}
                                onValueChange={(value) => setFormData({ ...formData, activityService: value })}
                              >
                                <SelectTrigger className="h-8 text-xs bg-secondary border-0 focus:ring-0 w-full">
                                  <SelectValue placeholder="Select an activity..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockActivityServices.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Recurring — lessons and activities only */}
                          {(selectedCategory === "lesson" || selectedCategory === "activity") && (
                            <div className="flex flex-col gap-2">
                              <label className="flex items-center gap-2 px-0.5 cursor-pointer group w-fit">
                                <Checkbox
                                  checked={formData.recurring}
                                  onCheckedChange={(checked) => setFormData({ ...formData, recurring: !!checked, recurringStartDate: "", recurringEndDate: "" })}
                                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <div className="flex items-center gap-1.5">
                                  <RepeatIcon className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">Recurring</span>
                                </div>
                              </label>

                              {formData.recurring && (
                                <div className="flex flex-col gap-2 pl-1">
                                  {/* Frequency toggle */}
                                  <div className="flex items-center gap-1.5 p-0.5 rounded-md bg-secondary w-fit">
                                    <button
                                      type="button"
                                      onClick={() => setFormData({ ...formData, recurringFrequency: "weekly" })}
                                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${formData.recurringFrequency === "weekly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                      Weekly
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setFormData({ ...formData, recurringFrequency: "daily" })}
                                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${formData.recurringFrequency === "daily" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                      Daily
                                    </button>
                                  </div>

                                  {/* Finishing date */}
                                  <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Finishing date</span>
                                    <label className="flex items-center gap-2 px-3 h-8 rounded-lg bg-secondary cursor-pointer">
                                      <input
                                        type="date"
                                        value={formData.recurringEndDate}
                                        onChange={(e) => setFormData({ ...formData, recurringEndDate: e.target.value })}
                                        className="flex-1 bg-transparent border-0 text-xs font-medium text-foreground focus:outline-none"
                                      />
                                    </label>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Block: reason input */}
                          {selectedCategory === "block" && (
                            <div className="flex flex-col gap-1.5 flex-1 min-h-0">
                              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Reason</span>
                              <Textarea
                                value={formData.blockReason}
                                onChange={(e) => setFormData({ ...formData, blockReason: e.target.value })}
                                placeholder="e.g. Maintenance, Resurfacing..."
                                className="flex-1 min-h-0 resize-none text-xs bg-secondary border-0 focus-visible:ring-1"
                              />
                            </div>
                          )}
                        </div>

                        {/* ── Vertical divider ── */}
                        <div className="w-px bg-border/60 shrink-0 self-stretch" />

                        {/* ── RIGHT column: time + court ── */}
                        <div className="w-[44%] shrink-0 flex flex-col gap-2">

                          {/* Time block — compact unified container */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">Time</span>
                            <div className="rounded-lg bg-secondary overflow-hidden divide-y divide-border/60">
                              {/* Start time — always editable */}
                              <Select
                                value={formData.startTime}
                                onValueChange={(value) => {
                                  const newEnd = computeEndTime(value, lockedDurationSlots)
                                  setFormData({ ...formData, startTime: value, endTime: newEnd })
                                }}
                              >
                                <SelectTrigger className="h-8 px-3 text-xs bg-transparent border-0 focus:ring-0 w-full font-medium text-foreground [&>svg]:h-3 [&>svg]:w-3 [&>svg]:opacity-60">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-[10px] text-muted-foreground w-6 shrink-0">from</span>
                                    <SelectValue />
                                  </div>
                                </SelectTrigger>
                                <SelectContent className="max-h-[160px] overflow-y-auto">
                                  {timeOptions.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {/* End time — derived/locked, dimmed to signal non-editable */}
                              <div className="flex items-center gap-2 px-3 h-8 bg-secondary/50">
                                <span className="text-[10px] text-muted-foreground/60 w-6 shrink-0">to</span>
                                <span className="text-xs font-medium text-muted-foreground tabular-nums">{formData.endTime}</span>
                              </div>
                            </div>
                          </div>

                          {/* Court selector */}
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-0.5">
                              {selectedCategory === "activity" ? "Courts" : "Court"}
                            </span>
                            {selectedCategory === "activity" ? (
                              <Select
                                onValueChange={(value) => {
                                  setSelectedCourtIds(prev =>
                                    prev.includes(value) ? prev.filter(id => id !== value) : [...prev, value]
                                  )
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs bg-secondary border-0 focus:ring-0 w-full">
                                  <span className={cn("truncate text-xs", selectedCourtIds.length === 0 && "text-muted-foreground")}>
                                    {selectedCourtIds.length === 0
                                      ? "Select courts..."
                                      : selectedCourtIds.length === 1
                                        ? courts.find(c => c.id === selectedCourtIds[0])?.name ?? "1 court"
                                        : `${courts.find(c => c.id === selectedCourtIds[0])?.name ?? ""} + ${selectedCourtIds.length - 1} more`}
                                  </span>
                                </SelectTrigger>
                                <SelectContent>
                                  {courts.map((court) => {
                                    const isSelected = selectedCourtIds.includes(court.id)
                                    return (
                                      <SelectItem key={court.id} value={court.id}>
                                        <div className="flex items-center gap-2">
                                          <div className={cn(
                                            "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors",
                                            isSelected ? "bg-foreground border-foreground" : "border-muted-foreground/40"
                                          )}>
                                            {isSelected && <CheckCircle2 className="w-2.5 h-2.5 text-background" />}
                                          </div>
                                          <span>{court.name}</span>
                                        </div>
                                      </SelectItem>
                                    )
                                  })}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Select
                                value={formData.court}
                                onValueChange={(value) => setFormData({ ...formData, court: value })}
                              >
                                <SelectTrigger className="h-8 text-xs bg-secondary border-0 focus:ring-0 w-full">
                                  <SelectValue placeholder="Select court..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {courts.map((court) => (
                                    <SelectItem key={court.id} value={court.id}>
                                      {court.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  )
                })()}

                {/* Section: Players — hidden for block category */}
                {selectedCategory !== "block" && <div className="px-5 py-4 border-b border-border">

                  {/* ── Open-match: 2 + divider + 2 split layout ── */}
                  {selectedSubType === "open-match" ? (() => {
                    // Compute players not yet in either group (for the search filter)
                    const allGrouped = [...groupTop, ...groupBottom]
                    const filteredGroupPlayers = mockPlayers.filter(p =>
                      !allGrouped.find(gp => gp.id === p.id) &&
                      (p.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                       p.email.toLowerCase().includes(playerSearch.toLowerCase()))
                    )

                    const renderGroupRow = (player: Player | null, group: "top" | "bottom", idx: number) => {
                      if (player) {
                        return (
                          <div key={player.id} className="flex items-center gap-3 px-3 py-2.5 bg-card">
                            <div className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                              player.color
                            )}>
                              {player.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{player.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{player.email}</p>
                            </div>
                            {/* Swap to other group */}
                            <button
                              onClick={() => {
                                if (group === "top") {
                                  if (groupBottom.length < 2) {
                                    setGroupTop(prev => prev.filter(p => p.id !== player.id))
                                    setGroupBottom(prev => [...prev, player])
                                  }
                                } else {
                                  if (groupTop.length < 2) {
                                    setGroupBottom(prev => prev.filter(p => p.id !== player.id))
                                    setGroupTop(prev => [...prev, player])
                                  }
                                }
                              }}
                              className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
                              aria-label="Move to other side"
                            >
                              <ArrowUpDown className="h-3.5 w-3.5" />
                            </button>
                            {/* Remove */}
                            <button
                              onClick={() => {
                                if (group === "top") setGroupTop(prev => prev.filter(p => p.id !== player.id))
                                else setGroupBottom(prev => prev.filter(p => p.id !== player.id))
                              }}
                              className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                              aria-label={`Remove ${player.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )
                      }
                      // Empty slot placeholder
                      return (
                        <button
                          key={`empty-${group}-${idx}`}
                          onClick={() => { setAddingToGroup(group); setShowPlayerSearch(true) }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 bg-card hover:bg-secondary/50 transition-colors text-left group"
                        >
                          <div className="w-7 h-7 rounded-full border-2 border-dashed border-border flex items-center justify-center shrink-0 group-hover:border-muted-foreground/40 transition-colors">
                            <Plus className="h-3 w-3 text-muted-foreground/50" />
                          </div>
                          <span className="text-[11px] text-muted-foreground/60">Add player</span>
                        </button>
                      )
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Players</p>
                        </div>

                        {/* Player search dropdown (shared, routed by addingToGroup) */}
                        {showPlayerSearch && (
                          <div className="mb-3" ref={playerSearchRef}>
                            <div className="relative mb-2">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                              <Input
                                autoFocus
                                value={playerSearch}
                                onChange={(e) => setPlayerSearch(e.target.value)}
                                placeholder="Search by name or email..."
                                className="h-9 pl-9 text-xs bg-secondary border-0 focus-visible:ring-1"
                              />
                              <button
                                onClick={() => { setShowPlayerSearch(false); setPlayerSearch(""); setAddingToGroup(null) }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="rounded-xl border border-border overflow-hidden">
                              {filteredGroupPlayers.length > 0 ? (
                                filteredGroupPlayers.slice(0, 5).map((player) => (
                                  <button
                                    key={player.id}
                                    onClick={() => addPlayer(player)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left border-b border-border last:border-b-0"
                                  >
                                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0", player.color)}>
                                      {player.initials}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-foreground truncate">{player.name}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{player.email}</p>
                                    </div>
                                    <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  </button>
                                ))
                              ) : (
                                <div className="px-3 py-4 text-center">
                                  <p className="text-xs text-muted-foreground">No players found</p>
                                  <button
                                    onClick={() => { setShowNewPlayerForm(true); setShowPlayerSearch(false) }}
                                    className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-primary mx-auto hover:underline"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Create new account
                                  </button>
                                </div>
                              )}
                              {filteredGroupPlayers.length > 0 && (
                                <button
                                  onClick={() => { setShowNewPlayerForm(true); setShowPlayerSearch(false) }}
                                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary/60 hover:bg-secondary transition-colors border-t border-border"
                                >
                                  <Plus className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-[11px] text-muted-foreground">Create new account</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* 2 + divider + 2 */}
                        <div className="rounded-xl border border-border overflow-hidden">
                          {/* Top group — 2 slots */}
                          {[groupTop[0] ?? null, groupTop[1] ?? null].map((p, i) => (
                            <div key={i} className={cn(i < 1 && "border-b border-border/60")}>
                              {renderGroupRow(p, "top", i)}
                            </div>
                          ))}

                          {/* Divider */}
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/40 border-y border-border/60">
                            <div className="flex-1 h-px bg-border/80" />
                            <div className="flex-1 h-px bg-border/80" />
                          </div>

                          {/* Bottom group — 2 slots */}
                          {[groupBottom[0] ?? null, groupBottom[1] ?? null].map((p, i) => (
                            <div key={i} className={cn(i < 1 && "border-b border-border/60")}>
                              {renderGroupRow(p, "bottom", i)}
                            </div>
                          ))}
                        </div>
                      </>
                    )
                  })() : (
                  /* ── Regular / lesson / activity flat player list ── */
                  <>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Players
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPlayerTab("players")}
                        className={cn(
                          "text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors",
                          playerTab === "players"
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        Active {selectedPlayers.length}
                      </button>
                      <button
                        onClick={() => setPlayerTab("cancelled")}
                        className={cn(
                          "text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors",
                          playerTab === "cancelled"
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        Cancelled 0
                      </button>
                      <button
                        onClick={() => setPlayerTab("waiting")}
                        className={cn(
                          "text-[11px] font-medium px-2.5 py-0.5 rounded-full transition-colors",
                          playerTab === "waiting"
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                        )}
                      >
                        Waiting 0
                      </button>
                    </div>
                  </div>

                  {/* Player search dropdown */}
                  {showPlayerSearch && (
                    <div className="mb-3" ref={playerSearchRef}>
                      <div className="relative mb-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                        <Input
                          autoFocus
                          value={playerSearch}
                          onChange={(e) => setPlayerSearch(e.target.value)}
                          placeholder="Search by name or email..."
                          className="h-9 pl-9 text-xs bg-secondary border-0 focus-visible:ring-1"
                        />
                        <button
                          onClick={() => { setShowPlayerSearch(false); setPlayerSearch("") }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="rounded-xl border border-border overflow-hidden">
                        {filteredPlayers.length > 0 ? (
                          filteredPlayers.slice(0, 5).map((player) => (
                            <button
                              key={player.id}
                              onClick={() => addPlayer(player)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left border-b border-border last:border-b-0"
                            >
                              <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                                player.color
                              )}>
                                {player.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground truncate">{player.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{player.email}</p>
                              </div>
                              <Plus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-4 text-center">
                            <p className="text-xs text-muted-foreground">No players found</p>
                            <button
                              onClick={() => { setShowNewPlayerForm(true); setShowPlayerSearch(false) }}
                              className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-primary mx-auto hover:underline"
                            >
                              <Plus className="h-3 w-3" />
                              Create new account
                            </button>
                          </div>
                        )}
                        {filteredPlayers.length > 0 && (
                          <button
                            onClick={() => { setShowNewPlayerForm(true); setShowPlayerSearch(false) }}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-secondary/60 hover:bg-secondary transition-colors border-t border-border"
                          >
                            <Plus className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[11px] text-muted-foreground">Create new account</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Players List */}
                  {playerTab === "players" && (
                    <>
                      {selectedPlayers.length === 0 ? (
                        <button
                          onClick={() => setShowPlayerSearch(true)}
                          className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-border hover:border-primary/30 hover:bg-secondary/50 transition-all group"
                        >
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">No players added yet</p>
                          <p className="text-[11px] text-primary font-medium">+ Add a player</p>
                        </button>
                      ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                          <div className="max-h-[220px] overflow-y-auto">
                            {selectedPlayers.map((player, index) => (
                              <div
                                key={player.id}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2.5 bg-card border-b border-border"
                                )}
                              >
                                <div className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                                  player.color
                                )}>
                                  {player.initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{player.name}</p>
                                  <p className="text-[10px] text-muted-foreground truncate">{player.email}</p>
                                </div>
                                <button
                                  onClick={() => removePlayer(player.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors p-1 rounded-md hover:bg-destructive/10"
                                  aria-label={`Remove ${player.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <button
                            onClick={() => setShowPlayerSearch(true)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-xs font-medium"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Player
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  {playerTab === "cancelled" && (
                    <div className="flex items-center justify-center py-6">
                      <p className="text-xs text-muted-foreground">No cancelled players</p>
                    </div>
                  )}
                  {playerTab === "waiting" && (
                    <div className="flex items-center justify-center py-6">
                      <p className="text-xs text-muted-foreground">No players on the waiting list</p>
                    </div>
                  )}
                  </>
                  )}
                </div>}

                {/* Section: Notes */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Internal Notes
                  </p>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add a note visible only to staff..."
                    className="text-xs min-h-[72px] resize-none bg-secondary border-0 focus-visible:ring-1 rounded-xl"
                  />
                </div>
                </> /* end details tab / create mode */
                )} {/* end isViewMode payment ternary */}

                {/* New Player Form — slides over the entire content area */}
                {showNewPlayerForm && (
                  <div className="absolute inset-0 bg-card flex flex-col overflow-y-auto z-10">
                    {/* Sub-header */}
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-border shrink-0">
                      <button
                        onClick={() => setShowNewPlayerForm(false)}
                        className="flex items-center justify-center w-7 h-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                        aria-label="Back"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div>
                        <p className="text-sm font-semibold text-foreground">New Player</p>
                        <p className="text-[11px] text-muted-foreground">Create a new player account</p>
                      </div>
                    </div>

                    <div className="px-5 py-4 space-y-5 flex-1">
                      {/* Personal info section */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                          Personal Info
                        </p>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-muted-foreground">First Name</Label>
                            <Input
                              value={newPlayerForm.firstName}
                              onChange={(e) => setNewPlayerForm(p => ({ ...p, firstName: e.target.value }))}
                              placeholder="e.g. John"
                              className="h-9 text-xs bg-secondary border-0 focus-visible:ring-1"
                              style={{ fontSize: "0.75rem" }}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-medium text-muted-foreground">Last Name</Label>
                            <Input
                              value={newPlayerForm.lastName}
                              onChange={(e) => setNewPlayerForm(p => ({ ...p, lastName: e.target.value }))}
                              placeholder="e.g. Smith"
                              className="h-9 text-xs bg-secondary border-0 focus-visible:ring-1"
                              style={{ fontSize: "0.75rem" }}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5 mb-3">
                          <Label className="text-[11px] font-medium text-muted-foreground">Email Address</Label>
                          <Input
                            type="email"
                            value={newPlayerForm.email}
                            onChange={(e) => setNewPlayerForm(p => ({ ...p, email: e.target.value }))}
                            placeholder="john@example.com"
                            className="h-9 text-xs bg-secondary border-0 focus-visible:ring-1"
                            style={{ fontSize: "0.75rem" }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
                            <Phone className="h-3 w-3" />
                            Phone Number
                          </Label>
                          <Input
                            type="tel"
                            value={newPlayerForm.phone}
                            onChange={(e) => setNewPlayerForm(p => ({ ...p, phone: e.target.value }))}
                            placeholder="+60 12 345 6789"
                            className="h-9 text-xs bg-secondary border-0 focus-visible:ring-1"
                            style={{ fontSize: "0.75rem" }}
                          />
                        </div>
                      </div>

                      {/* Sport levels section */}
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                          <Trophy className="h-3 w-3" />
                          Sport Levels
                        </p>
                        <div className="space-y-3">
                          {(["tennis", "padel", "pickleball"] as const).map((sport) => (
                            <div key={sport} className="flex items-center justify-between bg-secondary rounded-xl px-4 py-2.5">
                              <span className="text-xs font-medium text-foreground capitalize">{sport}</span>
                              <Select
                                value={newPlayerForm.levels[sport]}
                                onValueChange={(val) => setNewPlayerForm(p => ({
                                  ...p,
                                  levels: { ...p.levels, [sport]: val }
                                }))}
                              >
                                <SelectTrigger className="h-7 text-[11px] w-36 bg-card border-0 focus:ring-1">
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                  <SelectItem value="competitive">Competitive</SelectItem>
                                  <SelectItem value="professional">Professional</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Avatar preview */}
                      {(newPlayerForm.firstName || newPlayerForm.lastName) && (
                        <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                            {`${newPlayerForm.firstName[0] ?? ""}${newPlayerForm.lastName[0] ?? ""}`.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-foreground">
                              {[newPlayerForm.firstName, newPlayerForm.lastName].filter(Boolean).join(" ")}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{newPlayerForm.email || "No email yet"}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sub-footer */}
                    <div className="flex items-center justify-between border-t border-border px-5 py-3.5 shrink-0 bg-card">
                      <Button
                        variant="ghost"
                        onClick={() => setShowNewPlayerForm(false)}
                        className="text-xs h-9 text-muted-foreground"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateNewPlayer}
                        disabled={!newPlayerForm.firstName.trim() || !newPlayerForm.lastName.trim() || !newPlayerForm.email.trim()}
                        className="text-xs h-9 px-5 bg-foreground text-background hover:bg-foreground/90 rounded-lg disabled:opacity-40"
                      >
                        Add Player
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between border-t border-border px-5 py-3.5 bg-card">
                <Button
                  variant="ghost"
                  onClick={() => handleDialogClose(false)}
                  className="text-xs h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  {isViewMode ? "Close" : "Discard"}
                </Button>
                {(!isViewMode || viewModeTab === "details") && (
                  <Button
                    onClick={handleBookingSubmit}
                    className="text-xs h-9 px-5 bg-foreground text-background hover:bg-foreground/90 rounded-lg"
                  >
                    Save
                  </Button>
                )}
              </div>
            </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
