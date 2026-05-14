export type ServiceCategory = "booking" | "lesson" | "activity" | "manual"
export type PaymentMethod = "card" | "club_credit" | "cash"
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded"
export type PlayerPaymentStatus = "paid" | "pending" | "failed"

export interface PaymentPlayer {
  id: string
  name: string
  email: string
  paymentStatus: PlayerPaymentStatus
  pendingReason?: string // e.g. "Awaiting card details", "Invoice sent"
}

export interface Payment {
  id: string
  bookingId: string
  date: string // ISO date string
  time: string // e.g. "14:00"
  service: string // Human-readable service name
  category: ServiceCategory
  sport?: string // e.g. "Padel", "Tennis", "Pickleball"
  players: PaymentPlayer[]
  paymentMethod: PaymentMethod
  status: PaymentStatus
  amount: number // in pence
  courtName?: string
  coachName?: string
  notes?: string
  isManual?: boolean // true for ad-hoc manual payments
  isMember?: boolean // true if the player holds an active membership
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatAmount(amount: number): string {
  return `£${(amount / 100).toFixed(2)}`
}

export function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

// ─── Quick-date helpers ──────────────────────────────────────────────────────

export function getDateRange(preset: string): { from: Date; to: Date } | null {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay()) // Sunday

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

  switch (preset) {
    case "today":
      return { from: today, to: today }
    case "yesterday":
      return { from: yesterday, to: yesterday }
    case "this_week":
      return { from: weekStart, to: today }
    case "month_to_date":
      return { from: monthStart, to: today }
    case "this_month":
      return {
        from: monthStart,
        to: new Date(today.getFullYear(), today.getMonth() + 1, 0),
      }
    default:
      return null
  }
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const TODAY = new Date()
function daysAgo(n: number): string {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - n)
  return d.toISOString().split("T")[0]
}

export const SAMPLE_PAYMENTS: Payment[] = [
  {
    id: "pay-001",
    bookingId: "BK-2048",
    date: daysAgo(0),
    time: "09:00",
    service: "Court Booking — Court 1 Outdoor",
    category: "booking",
    sport: "Tennis",
    players: [
      { id: "p1", name: "James Hartley", email: "james.hartley@email.com", paymentStatus: "paid" },
      { id: "p2", name: "Sophie Lewis", email: "sophie.lewis@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "paid",
    amount: 2400,
    courtName: "Court 1 - Outdoor",
    isMember: true,
  },
  {
    id: "pay-002",
    bookingId: "BK-2049",
    date: daysAgo(0),
    time: "10:30",
    service: "Private Lesson — James Taylor",
    category: "lesson",
    sport: "Tennis",
    players: [{ id: "p3", name: "Emily Davis", email: "emily.davis@email.com", paymentStatus: "paid" }],
    paymentMethod: "club_credit",
    status: "paid",
    amount: 5500,
    courtName: "Court 2 - Indoor",
    coachName: "James Taylor",
    isMember: true,
  },
  {
    id: "pay-003",
    bookingId: "BK-2050",
    date: daysAgo(0),
    time: "11:00",
    service: "July Mega Open Play",
    category: "activity",
    sport: "Padel",
    players: [
      { id: "p4", name: "Tom Walker", email: "tom.walker@email.com", paymentStatus: "paid" },
      { id: "p5", name: "Aisha Patel", email: "aisha.patel@email.com", paymentStatus: "pending", pendingReason: "Awaiting card details" },
      { id: "p6", name: "Carlos Mendez", email: "carlos.mendez@email.com", paymentStatus: "pending", pendingReason: "Invoice sent" },
      { id: "p7", name: "Hannah Moore", email: "hannah.moore@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "pending",
    amount: 6000,
    courtName: "Court 3 - Covered",
    isMember: false,
  },
  {
    id: "pay-004",
    bookingId: "BK-2051",
    date: daysAgo(0),
    time: "14:00",
    service: "Court Booking — Court 4 Premium",
    category: "booking",
    sport: "Padel",
    players: [
      { id: "p8", name: "Mark Jenkins", email: "mark.jenkins@email.com", paymentStatus: "paid" },
      { id: "p9", name: "Laura Scott", email: "laura.scott@email.com", paymentStatus: "paid" },
      { id: "p10", name: "Dylan Price", email: "dylan.price@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "cash",
    status: "paid",
    amount: 3600,
    courtName: "Court 4 - Premium",
    isMember: false,
  },
  {
    id: "pay-005",
    bookingId: "BK-2052",
    date: daysAgo(1),
    time: "08:00",
    service: "Beginner Padel Clinic",
    category: "lesson",
    sport: "Padel",
    players: [
      { id: "p11", name: "Rachel Green", email: "rachel.green@email.com", paymentStatus: "paid" },
      { id: "p12", name: "Noah Williams", email: "noah.williams@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "paid",
    amount: 9000,
    courtName: "Court 3 - Covered",
    coachName: "Sarah Mitchell",
    isMember: true,
  },
  {
    id: "pay-006",
    bookingId: "BK-2053",
    date: daysAgo(1),
    time: "15:00",
    service: "Court Booking — Court 5 Covered",
    category: "booking",
    sport: "Pickleball",
    players: [{ id: "p13", name: "Oliver Brown", email: "oliver.brown@email.com", paymentStatus: "paid" }],
    paymentMethod: "club_credit",
    status: "refunded",
    amount: 2400,
    courtName: "Court 5 - Covered",
    notes: "Customer requested refund",
    isMember: true,
  },
  {
    id: "pay-007",
    bookingId: "BK-2054",
    date: daysAgo(1),
    time: "18:00",
    service: "Intermediate Drills",
    category: "activity",
    sport: "Tennis",
    players: [
      { id: "p14", name: "Sophia Turner", email: "sophia.turner@email.com", paymentStatus: "paid" },
      { id: "p15", name: "Ethan Hall", email: "ethan.hall@email.com", paymentStatus: "paid" },
      { id: "p16", name: "Mia Clark", email: "mia.clark@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "paid",
    amount: 4500,
    courtName: "Court 2 - Indoor",
    coachName: "David Okafor",
    isMember: false,
  },
  {
    id: "pay-008",
    bookingId: "BK-2055",
    date: daysAgo(2),
    time: "09:30",
    service: "Private Lesson — Priya Nair",
    category: "lesson",
    sport: "Tennis",
    players: [{ id: "p17", name: "Chloe Adams", email: "chloe.adams@email.com", paymentStatus: "failed" }],
    paymentMethod: "card",
    status: "failed",
    amount: 5500,
    courtName: "Court 4 - Premium",
    coachName: "Priya Nair",
    notes: "Card declined — customer to retry",
    isMember: false,
  },
  {
    id: "pay-009",
    bookingId: "BK-2056",
    date: daysAgo(2),
    time: "12:00",
    service: "Advanced Tournament Prep",
    category: "activity",
    sport: "Padel",
    players: [
      { id: "p18", name: "Jack Robinson", email: "jack.robinson@email.com", paymentStatus: "paid" },
      { id: "p19", name: "Isabelle King", email: "isabelle.king@email.com", paymentStatus: "paid" },
      { id: "p20", name: "Lucas Wright", email: "lucas.wright@email.com", paymentStatus: "paid" },
      { id: "p21", name: "Amelia Young", email: "amelia.young@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "paid",
    amount: 8000,
    courtName: "Court 4 - Premium",
    coachName: "Priya Nair",
    isMember: true,
  },
  {
    id: "pay-010",
    bookingId: "BK-2057",
    date: daysAgo(3),
    time: "16:00",
    service: "Court Booking — Court 1 Outdoor",
    category: "booking",
    sport: "Tennis",
    players: [
      { id: "p22", name: "Benjamin White", email: "ben.white@email.com", paymentStatus: "paid" },
      { id: "p23", name: "Charlotte Harris", email: "charlotte.harris@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "paid",
    amount: 2400,
    courtName: "Court 1 - Outdoor",
    isMember: false,
  },
  {
    id: "pay-011",
    bookingId: "BK-2058",
    date: daysAgo(4),
    time: "10:00",
    service: "Beginner Pickleball Activity",
    category: "activity",
    sport: "Pickleball",
    players: [
      { id: "p24", name: "Harry Thompson", email: "harry.t@email.com", paymentStatus: "paid" },
      { id: "p25", name: "Alice Cooper", email: "alice.c@email.com", paymentStatus: "paid" },
      { id: "p26", name: "George Evans", email: "george.e@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "cash",
    status: "paid",
    amount: 4500,
    courtName: "Court 5 - Covered",
    isMember: false,
  },
  {
    id: "pay-012",
    bookingId: "BK-2059",
    date: daysAgo(5),
    time: "17:00",
    service: "Private Lesson — James Taylor",
    category: "lesson",
    sport: "Tennis",
    players: [{ id: "p27", name: "Lily Martin", email: "lily.martin@email.com", paymentStatus: "pending", pendingReason: "Awaiting bank transfer" }],
    paymentMethod: "club_credit",
    status: "pending",
    amount: 5500,
    courtName: "Court 1 - Outdoor",
    coachName: "James Taylor",
    isMember: true,
  },
  {
    id: "pay-013",
    bookingId: "BK-2060",
    date: daysAgo(6),
    time: "11:30",
    service: "Court Booking — Court 2 Indoor",
    category: "booking",
    sport: "Padel",
    players: [
      { id: "p28", name: "Oscar Wilson", email: "oscar.w@email.com", paymentStatus: "paid" },
      { id: "p29", name: "Freya Anderson", email: "freya.a@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "paid",
    amount: 3000,
    courtName: "Court 2 - Indoor",
    isMember: true,
  },
  {
    id: "pay-014",
    bookingId: "BK-2061",
    date: daysAgo(8),
    time: "09:00",
    service: "Open Match Session",
    category: "activity",
    sport: "Tennis",
    players: [
      { id: "p30", name: "Ellie Hughes", email: "ellie.h@email.com", paymentStatus: "paid" },
      { id: "p31", name: "Isaac Thomas", email: "isaac.t@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "refunded",
    amount: 3000,
    courtName: "Court 3 - Covered",
    notes: "Event cancelled due to weather",
    isMember: false,
  },
  {
    id: "pay-015",
    bookingId: "BK-2062",
    date: daysAgo(10),
    time: "14:30",
    service: "Padel Group Lesson",
    category: "lesson",
    sport: "Padel",
    players: [
      { id: "p32", name: "Poppy Jackson", email: "poppy.j@email.com", paymentStatus: "paid" },
      { id: "p33", name: "Sebastian Garcia", email: "seb.g@email.com", paymentStatus: "pending", pendingReason: "Awaiting card details" },
      { id: "p34", name: "Daisy Roberts", email: "daisy.r@email.com", paymentStatus: "paid" },
    ],
    paymentMethod: "card",
    status: "pending",
    amount: 13500,
    courtName: "Court 4 - Premium",
    coachName: "Sarah Mitchell",
    isMember: false,
  },
  // Manual / ad-hoc payments
  {
    id: "pay-016",
    bookingId: "MAN-001",
    date: daysAgo(0),
    time: "12:15",
    service: "Grip Replacement — Wilson Pro",
    category: "manual",
    players: [{ id: "p35", name: "James Hartley", email: "james.hartley@email.com", paymentStatus: "paid" }],
    paymentMethod: "card",
    status: "paid",
    amount: 800,
    notes: "Over-grip x2",
    isManual: true,
    isMember: true,
  },
  {
    id: "pay-017",
    bookingId: "MAN-002",
    date: daysAgo(1),
    time: "16:45",
    service: "Racket Stringing — Babolat SG Spiraltek",
    category: "manual",
    players: [{ id: "p36", name: "Emily Davis", email: "emily.davis@email.com", paymentStatus: "paid" }],
    paymentMethod: "cash",
    status: "paid",
    amount: 1800,
    notes: "18kg tension",
    isManual: true,
    isMember: false,
  },
]
