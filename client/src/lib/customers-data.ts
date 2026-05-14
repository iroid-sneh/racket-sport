// ─── Types ───────────────────────────────────────────────────────────────────

export type MembershipTier = "none" | "basic" | "premium" | "vip"
export type MembershipStatus = "active" | "expired" | "cancelled"
export type SportLevel = "beginner" | "improver" | "intermediate" | "advanced" | "expert"
export type AgeRange = "13-17" | "18-24" | "25-34" | "35-44" | "44-54" | "55-64" | "65-74" | "75+"
export type Gender = "male" | "female" | "prefer-not-to-say"

export interface SportProfile {
  sport: string
  level: SportLevel
}

export interface Membership {
  tier: MembershipTier
  status: MembershipStatus
  startDate: string
  endDate: string
  autoRenew: boolean
}

export interface BookingHistoryItem {
  id: string
  date: string
  time: string
  type: "booking" | "lesson" | "activity"
  service: string
  court: string
  amount: number
  status: "completed" | "cancelled" | "no-show"
}

export interface WalletTransaction {
  id: string
  date: string
  type: "credit" | "debit"
  amount: number
  description: string
  addedBy?: string
}

export interface Wallet {
  balance: number
  transactions: WalletTransaction[]
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  initials: string
  avatarColor: string
  joinDate: string
  lastVisit: string
  membership: Membership
  sports: SportProfile[]
  totalBookings: number
  totalSpent: number
  notes: string
  bookingHistory: BookingHistoryItem[]
  ageRange?: AgeRange
  gender?: Gender
  wallet: Wallet
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatAmount(cents: number): string {
  return `£${(cents / 100).toFixed(2)}`
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export function getInitials(name: string): string {
  return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
}

// ─── Sample Data ─────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
]

export const SAMPLE_CUSTOMERS: Customer[] = [
  {
    id: "cust_001",
    name: "James Wilson",
    email: "james.wilson@email.com",
    phone: "+44 7700 900123",
    initials: "JW",
    avatarColor: AVATAR_COLORS[0],
    joinDate: "2024-03-15",
    lastVisit: "2026-04-05",
    membership: {
      tier: "premium",
      status: "active",
      startDate: "2026-01-01",
      endDate: "2026-12-31",
      autoRenew: true,
    },
    sports: [
      { sport: "Tennis", level: "advanced" },
      { sport: "Padel", level: "intermediate" },
    ],
    totalBookings: 47,
    totalSpent: 128500,
    notes: "Prefers evening slots. Regular doubles partner with Sarah.",
    bookingHistory: [
      { id: "bk_101", date: "2026-04-05", time: "18:00", type: "booking", service: "Court Booking - 1 Hour", court: "Court 1", amount: 2000, status: "completed" },
      { id: "bk_102", date: "2026-04-02", time: "19:00", type: "lesson", service: "Private Lesson - Coach Mike", court: "Court 3", amount: 4500, status: "completed" },
      { id: "bk_103", date: "2026-03-28", time: "17:30", type: "booking", service: "Court Booking - 1.5 Hours", court: "Court 2", amount: 3000, status: "completed" },
    ],
    ageRange: "35-44",
    gender: "male",
    wallet: {
      balance: 5000,
      transactions: [
        { id: "wt_101", date: "2026-04-01", type: "credit", amount: 10000, description: "Credits added by admin", addedBy: "Admin" },
        { id: "wt_102", date: "2026-04-05", type: "debit", amount: 5000, description: "Court booking payment" },
      ],
    },
  },
  {
    id: "cust_002",
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    phone: "+44 7700 900456",
    initials: "SC",
    avatarColor: AVATAR_COLORS[1],
    joinDate: "2023-11-20",
    lastVisit: "2026-04-04",
    membership: {
      tier: "vip",
      status: "active",
      startDate: "2025-11-20",
      endDate: "2026-11-19",
      autoRenew: true,
    },
    sports: [
      { sport: "Tennis", level: "expert" },
      { sport: "Pickleball", level: "advanced" },
    ],
    totalBookings: 89,
    totalSpent: 245000,
    notes: "Competition player. Interested in tournament organisation.",
    bookingHistory: [
      { id: "bk_201", date: "2026-04-04", time: "10:00", type: "booking", service: "Court Booking - 2 Hours", court: "Court 1", amount: 4000, status: "completed" },
      { id: "bk_202", date: "2026-04-01", time: "09:00", type: "activity", service: "Cardio Tennis", court: "Court 4", amount: 1200, status: "completed" },
    ],
    ageRange: "25-34",
    gender: "female",
    wallet: { balance: 15000, transactions: [{ id: "wt_201", date: "2026-03-15", type: "credit", amount: 15000, description: "VIP bonus credits", addedBy: "Admin" }] },
  },
  {
    id: "cust_003",
    name: "Michael Brown",
    email: "m.brown@company.co.uk",
    phone: "+44 7700 900789",
    initials: "MB",
    avatarColor: AVATAR_COLORS[2],
    joinDate: "2025-06-10",
    lastVisit: "2026-03-28",
    membership: {
      tier: "basic",
      status: "active",
      startDate: "2026-01-01",
      endDate: "2026-06-30",
      autoRenew: false,
    },
    sports: [
      { sport: "Tennis", level: "beginner" },
    ],
    totalBookings: 12,
    totalSpent: 24000,
    notes: "New to tennis. Taking weekly lessons.",
    bookingHistory: [
      { id: "bk_301", date: "2026-03-28", time: "14:00", type: "lesson", service: "Private Lesson - Coach Emma", court: "Court 2", amount: 4500, status: "completed" },
      { id: "bk_302", date: "2026-03-21", time: "14:00", type: "lesson", service: "Private Lesson - Coach Emma", court: "Court 2", amount: 4500, status: "completed" },
    ],
    ageRange: "44-54",
    gender: "male",
    wallet: { balance: 0, transactions: [] },
  },
  {
    id: "cust_004",
    name: "Emma Thompson",
    email: "emma.t@outlook.com",
    phone: "+44 7700 900321",
    initials: "ET",
    avatarColor: AVATAR_COLORS[3],
    joinDate: "2024-08-05",
    lastVisit: "2026-04-03",
    membership: {
      tier: "premium",
      status: "active",
      startDate: "2025-08-05",
      endDate: "2026-08-04",
      autoRenew: true,
    },
    sports: [
      { sport: "Padel", level: "advanced" },
      { sport: "Tennis", level: "intermediate" },
    ],
    totalBookings: 34,
    totalSpent: 89500,
    notes: "",
    bookingHistory: [
      { id: "bk_401", date: "2026-04-03", time: "11:00", type: "booking", service: "Padel Court - 1 Hour", court: "Padel 1", amount: 2400, status: "completed" },
    ],
    ageRange: "25-34",
    gender: "female",
    wallet: { balance: 2400, transactions: [{ id: "wt_401", date: "2026-04-01", type: "credit", amount: 2400, description: "Referral bonus", addedBy: "Admin" }] },
  },
  {
    id: "cust_005",
    name: "David Lee",
    email: "david.lee@gmail.com",
    phone: "+44 7700 900654",
    initials: "DL",
    avatarColor: AVATAR_COLORS[4],
    joinDate: "2025-01-12",
    lastVisit: "2026-02-15",
    membership: {
      tier: "basic",
      status: "expired",
      startDate: "2025-01-12",
      endDate: "2026-01-11",
      autoRenew: false,
    },
    sports: [
      { sport: "Tennis", level: "intermediate" },
    ],
    totalBookings: 8,
    totalSpent: 16000,
    notes: "Membership expired. Follow up for renewal.",
    bookingHistory: [
      { id: "bk_501", date: "2026-02-15", time: "16:00", type: "booking", service: "Court Booking - 1 Hour", court: "Court 3", amount: 2000, status: "completed" },
    ],
    ageRange: "35-44",
    gender: "male",
    wallet: { balance: 0, transactions: [] },
  },
  {
    id: "cust_006",
    name: "Sophie Martin",
    email: "sophie.martin@email.com",
    phone: "+44 7700 900987",
    initials: "SM",
    avatarColor: AVATAR_COLORS[5],
    joinDate: "2024-05-22",
    lastVisit: "2026-04-06",
    membership: {
      tier: "none",
      status: "active",
      startDate: "",
      endDate: "",
      autoRenew: false,
    },
    sports: [
      { sport: "Tennis", level: "beginner" },
    ],
    totalBookings: 5,
    totalSpent: 10000,
    notes: "Pay-as-you-go customer. Potential membership conversion.",
    bookingHistory: [
      { id: "bk_601", date: "2026-04-06", time: "09:00", type: "activity", service: "Beginners Class", court: "Court 4", amount: 1000, status: "completed" },
    ],
    ageRange: "18-24",
    gender: "female",
    wallet: { balance: 1000, transactions: [{ id: "wt_601", date: "2026-04-06", type: "credit", amount: 1000, description: "Welcome bonus", addedBy: "Admin" }] },
  },
  {
    id: "cust_007",
    name: "Robert Johnson",
    email: "r.johnson@work.com",
    phone: "+44 7700 900111",
    initials: "RJ",
    avatarColor: AVATAR_COLORS[6],
    joinDate: "2023-09-01",
    lastVisit: "2026-04-01",
    membership: {
      tier: "vip",
      status: "active",
      startDate: "2025-09-01",
      endDate: "2026-08-31",
      autoRenew: true,
    },
    sports: [
      { sport: "Tennis", level: "advanced" },
      { sport: "Pickleball", level: "expert" },
      { sport: "Padel", level: "intermediate" },
    ],
    totalBookings: 156,
    totalSpent: 420000,
    notes: "Long-standing VIP member. Brings corporate groups for team events.",
    bookingHistory: [
      { id: "bk_701", date: "2026-04-01", time: "12:00", type: "booking", service: "Court Booking - 2 Hours", court: "Court 1", amount: 0, status: "completed" },
    ],
    ageRange: "55-64",
    gender: "male",
    wallet: { balance: 50000, transactions: [{ id: "wt_701", date: "2026-01-01", type: "credit", amount: 50000, description: "Annual VIP credit allocation", addedBy: "Admin" }] },
  },
  {
    id: "cust_008",
    name: "Lucy Adams",
    email: "lucy.adams@email.com",
    phone: "+44 7700 900222",
    initials: "LA",
    avatarColor: AVATAR_COLORS[7],
    joinDate: "2025-11-30",
    lastVisit: "2026-03-15",
    membership: {
      tier: "premium",
      status: "cancelled",
      startDate: "2025-11-30",
      endDate: "2026-05-29",
      autoRenew: false,
    },
    sports: [
      { sport: "Tennis", level: "intermediate" },
    ],
    totalBookings: 18,
    totalSpent: 45000,
    notes: "Cancelled membership due to relocation. May return.",
    bookingHistory: [
      { id: "bk_801", date: "2026-03-15", time: "15:00", type: "booking", service: "Court Booking - 1 Hour", court: "Court 2", amount: 2000, status: "cancelled" },
    ],
    ageRange: "25-34",
    gender: "female",
    wallet: { balance: 0, transactions: [] },
  },
  {
    id: "cust_009",
    name: "Tom Harris",
    email: "tom.harris@email.com",
    phone: "+44 7700 900333",
    initials: "TH",
    avatarColor: AVATAR_COLORS[0],
    joinDate: "2026-02-01",
    lastVisit: "2026-04-05",
    membership: {
      tier: "basic",
      status: "active",
      startDate: "2026-02-01",
      endDate: "2026-07-31",
      autoRenew: true,
    },
    sports: [
      { sport: "Padel", level: "beginner" },
    ],
    totalBookings: 6,
    totalSpent: 14400,
    notes: "New member. Very enthusiastic about padel.",
    bookingHistory: [
      { id: "bk_901", date: "2026-04-05", time: "20:00", type: "booking", service: "Padel Court - 1 Hour", court: "Padel 2", amount: 2400, status: "completed" },
    ],
    ageRange: "25-34",
    gender: "male",
    wallet: { balance: 0, transactions: [] },
  },
  {
    id: "cust_010",
    name: "Anna Williams",
    email: "anna.w@email.com",
    phone: "+44 7700 900444",
    initials: "AW",
    avatarColor: AVATAR_COLORS[1],
    joinDate: "2024-12-10",
    lastVisit: "2026-04-04",
    membership: {
      tier: "premium",
      status: "active",
      startDate: "2025-12-10",
      endDate: "2026-12-09",
      autoRenew: true,
    },
    sports: [
      { sport: "Tennis", level: "advanced" },
      { sport: "Padel", level: "advanced" },
    ],
    totalBookings: 52,
    totalSpent: 138000,
    notes: "Plays both tennis and padel competitively.",
    bookingHistory: [
      { id: "bk_1001", date: "2026-04-04", time: "18:30", type: "booking", service: "Court Booking - 1.5 Hours", court: "Court 1", amount: 3000, status: "completed" },
    ],
    ageRange: "35-44",
    gender: "prefer-not-to-say",
    wallet: { balance: 8000, transactions: [{ id: "wt_1001", date: "2026-03-01", type: "credit", amount: 8000, description: "Competition prize", addedBy: "Admin" }] },
  },
]
