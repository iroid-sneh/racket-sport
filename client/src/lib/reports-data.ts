import { SAMPLE_PAYMENTS, getDateRange, formatAmount } from "@/lib/payments-data"
import type { Payment, ServiceCategory } from "@/lib/payments-data"

// ─── Types ────────────────────────────────────────────────────────────────────

export type SportFilter = "all" | "padel" | "pickleball" | "tennis"
export type ReportsQuickDate = "today" | "yesterday" | "this_week" | "month_to_date" | "this_month" | "custom" | null

export interface ReportsFiltersState {
  quickDate: ReportsQuickDate
  dateFrom: Date | undefined
  dateTo: Date | undefined
  sport: SportFilter
  category: ServiceCategory | "all"
}

export interface KpiCard {
  label: string
  value: string
  sub: string
  trend: number | null // % change vs prior period; null = no prior data
}

export interface RevenuePoint {
  date: string   // "DD MMM" display label
  revenue: number // in pence
}

export interface BookingTypePoint {
  category: string
  count: number
  color: string
}

export interface TopServiceRow {
  service: string
  category: ServiceCategory
  categoryLabel: string
  sport: string | null
  bookings: number
  revenue: number
}

export interface PaymentMethodPoint {
  method: string
  revenue: number
  color: string
}

export interface DayOfWeekPoint {
  day: string
  bookings: number
}

export interface PlayerRetentionData {
  newPlayers: number
  returningPlayers: number
  newPct: number
  returningPct: number
}

export interface MemberGuestData {
  members: number
  guests: number
  memberRevenue: number
  guestRevenue: number
}

// ─── Sport keyword map ────────────────────────────────────────────────────────

const SPORT_KEYWORDS: Record<SportFilter, string[]> = {
  all: [],
  padel: ["padel"],
  pickleball: ["pickleball"],
  tennis: ["tennis"],
}

// ─── Filter helpers ───────────────────────────────────────────────────────────

function applyDateRange(
  payments: Payment[],
  quickDate: ReportsQuickDate,
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
): Payment[] {
  return payments.filter((p) => {
    const d = new Date(p.date)
    d.setHours(0, 0, 0, 0)

    if (quickDate && quickDate !== "custom") {
      const range = getDateRange(quickDate)
      if (range) return d >= range.from && d <= range.to
    } else if (quickDate === "custom") {
      if (dateFrom) {
        const from = new Date(dateFrom)
        from.setHours(0, 0, 0, 0)
        if (d < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo)
        to.setHours(0, 0, 0, 0)
        if (d > to) return false
      }
    }
    return true
  })
}

function applyDateRangeWithOffset(
  payments: Payment[],
  quickDate: ReportsQuickDate,
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
  offsetDays: number,
): Payment[] {
  if (!quickDate || quickDate === "custom") return []

  const range = getDateRange(quickDate)
  if (!range) return []

  const priorFrom = new Date(range.from)
  priorFrom.setDate(priorFrom.getDate() - offsetDays)
  const priorTo = new Date(range.to)
  priorTo.setDate(priorTo.getDate() - offsetDays)

  return payments.filter((p) => {
    const d = new Date(p.date)
    d.setHours(0, 0, 0, 0)
    return d >= priorFrom && d <= priorTo
  })
}

function applySport(payments: Payment[], sport: SportFilter): Payment[] {
  if (sport === "all") return payments
  const keywords = SPORT_KEYWORDS[sport]
  return payments.filter((p) =>
    keywords.some(
      (kw) =>
        p.service.toLowerCase().includes(kw) ||
        (p.courtName?.toLowerCase().includes(kw) ?? false),
    ),
  )
}

function applyCategory(payments: Payment[], category: ServiceCategory | "all"): Payment[] {
  if (category === "all") return payments
  return payments.filter((p) => p.category === category)
}

function paidRevenue(payments: Payment[]): number {
  return payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0)
}

// ─── Period offset helper ─────────────────────────────────────────────────────

function getPeriodDays(quickDate: ReportsQuickDate): number {
  switch (quickDate) {
    case "today":
    case "yesterday":
      return 1
    case "this_week":
      return 7
    case "month_to_date":
    case "this_month":
      return 30
    default:
      return 0
  }
}

// ─── KPI derivation ───────────────────────────────────────────────────────────

export function deriveKpis(filters: ReportsFiltersState): KpiCard[] {
  const { quickDate, dateFrom, dateTo, sport, category } = filters

  let current = applyDateRange(SAMPLE_PAYMENTS, quickDate, dateFrom, dateTo)
  current = applySport(current, sport)
  current = applyCategory(current, category)

  const periodDays = getPeriodDays(quickDate)
  let prior: Payment[] = []
  if (periodDays > 0) {
    let p = applyDateRangeWithOffset(SAMPLE_PAYMENTS, quickDate, dateFrom, dateTo, periodDays)
    p = applySport(p, sport)
    p = applyCategory(p, category)
    prior = p
  }

  const currentRevenue = paidRevenue(current)
  const priorRevenue = paidRevenue(prior)
  const currentBookings = current.length
  const priorBookings = prior.length

  const avgRevenue = currentBookings > 0 ? Math.round(currentRevenue / currentBookings) : 0
  const priorAvg = priorBookings > 0 ? Math.round(priorRevenue / priorBookings) : 0

  // Occupancy mock: ratio of paid bookings to total possible slots (mock: 12 slots/day in period)
  const occupancyPct = quickDate
    ? Math.min(100, Math.round((current.filter((p) => p.status === "paid").length / Math.max(1, periodDays * 12)) * 100))
    : 0

  function trendPct(curr: number, prev: number): number | null {
    if (prev === 0) return null
    return Math.round(((curr - prev) / prev) * 100)
  }

  return [
    {
      label: "Total Revenue",
      value: formatAmount(currentRevenue),
      sub: "From paid transactions",
      trend: trendPct(currentRevenue, priorRevenue),
    },
    {
      label: "Total Bookings",
      value: String(currentBookings),
      sub: `${current.filter((p) => p.status === "paid").length} confirmed`,
      trend: trendPct(currentBookings, priorBookings),
    },
    {
      label: "Occupancy Rate",
      value: `${occupancyPct}%`,
      sub: "Average court usage",
      trend: null,
    },
    {
      label: "Avg. per Booking",
      value: formatAmount(avgRevenue),
      sub: "Revenue per booking",
      trend: trendPct(avgRevenue, priorAvg),
    },
  ]
}

// ─── Revenue chart data ────────────────────────────────────────────────────────

export function deriveRevenueOverTime(filters: ReportsFiltersState): RevenuePoint[] {
  const { quickDate, dateFrom, dateTo, sport, category } = filters

  let filtered = applyDateRange(SAMPLE_PAYMENTS, quickDate, dateFrom, dateTo)
  filtered = applySport(filtered, sport)
  filtered = applyCategory(filtered, category)
  filtered = filtered.filter((p) => p.status === "paid")

  // Build a map of date → revenue
  const map: Record<string, number> = {}
  for (const p of filtered) {
    map[p.date] = (map[p.date] ?? 0) + p.amount
  }

  // Determine the date range to plot
  let from: Date
  let to: Date

  if (quickDate && quickDate !== "custom") {
    const range = getDateRange(quickDate)
    if (!range) return Object.entries(map).map(([date, revenue]) => ({ date: formatLabel(date), revenue }))
    from = range.from
    to = range.to
  } else if (quickDate === "custom" && dateFrom && dateTo) {
    from = new Date(dateFrom)
    from.setHours(0, 0, 0, 0)
    to = new Date(dateTo)
    to.setHours(0, 0, 0, 0)
  } else {
    // No filter — plot last 14 days
    to = new Date()
    to.setHours(0, 0, 0, 0)
    from = new Date(to)
    from.setDate(from.getDate() - 13)
  }

  const points: RevenuePoint[] = []
  const cursor = new Date(from)
  while (cursor <= to) {
    const key = cursor.toISOString().split("T")[0]
    points.push({ date: formatLabel(key), revenue: map[key] ?? 0 })
    cursor.setDate(cursor.getDate() + 1)
  }
  return points
}

function formatLabel(isoDate: string): string {
  const d = new Date(isoDate)
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

// ─── Bookings by type chart data ──────────────────────────────────────────────

const CATEGORY_COLOURS: Record<ServiceCategory, string> = {
  booking:  "#3b82f6",  // blue
  lesson:   "#10b981",  // emerald
  activity: "#f59e0b",  // amber
  manual:   "#8b5cf6",  // violet
}

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  booking:  "Court Booking",
  lesson:   "Lesson",
  activity: "Activity",
  manual:   "Manual",
}

export function deriveBookingsByType(filters: ReportsFiltersState): BookingTypePoint[] {
  let filtered = applyDateRange(SAMPLE_PAYMENTS, filters.quickDate, filters.dateFrom, filters.dateTo)
  filtered = applySport(filtered, filters.sport)

  const counts: Record<ServiceCategory, number> = { booking: 0, lesson: 0, activity: 0, manual: 0 }
  for (const p of filtered) {
    counts[p.category] = (counts[p.category] ?? 0) + 1
  }

  return (Object.keys(counts) as ServiceCategory[]).map((cat) => ({
    category: CATEGORY_LABELS[cat],
    count: counts[cat],
    color: CATEGORY_COLOURS[cat],
  }))
}

// ─── Top Services ─────────────────────────────────────────────────────────────

const CATEGORY_LABEL_MAP: Record<ServiceCategory, string> = {
  booking:  "Court Booking",
  lesson:   "Lesson",
  activity: "Activity",
  manual:   "Manual",
}

function deriveSportLabel(p: Payment): string | null {
  // Prefer explicit sport field first, then fall back to keyword detection
  if (p.sport) return p.sport
  const haystack = `${p.service} ${p.courtName ?? ""}`.toLowerCase()
  if (haystack.includes("padel")) return "Padel"
  if (haystack.includes("pickleball")) return "Pickleball"
  if (haystack.includes("tennis")) return "Tennis"
  return null
}

// Build the display label for a service row:
// - Court bookings  → "Court Bookings" (grouped, sport shown as badge)
// - Lessons         → coach name if available, else original service name
// - Activities      → original service name (activity title)
// - Manual          → original service name
function buildServiceKey(p: Payment): { key: string; displayName: string } {
  if (p.category === "booking") {
    const sport = deriveSportLabel(p)
    const key = `Court Bookings__${sport ?? "Other"}`
    const displayName = sport ? `Court Bookings · ${sport}` : "Court Bookings"
    return { key, displayName }
  }
  if (p.category === "lesson" && p.coachName) {
    return { key: `Private Lesson — ${p.coachName}`, displayName: `Private Lesson — ${p.coachName}` }
  }
  return { key: p.service, displayName: p.service }
}

export function deriveTopServices(filters: ReportsFiltersState): TopServiceRow[] {
  let filtered = applyDateRange(SAMPLE_PAYMENTS, filters.quickDate, filters.dateFrom, filters.dateTo)
  filtered = applySport(filtered, filters.sport)
  filtered = applyCategory(filtered, filters.category)
  filtered = filtered.filter((p) => p.status === "paid")

  const map: Record<string, { displayName: string; category: ServiceCategory; sport: string | null; bookings: number; revenue: number }> = {}
  for (const p of filtered) {
    const { key, displayName } = buildServiceKey(p)
    const sport = deriveSportLabel(p)
    if (!map[key]) {
      map[key] = { displayName, category: p.category, sport, bookings: 0, revenue: 0 }
    }
    map[key].bookings += 1
    map[key].revenue += p.amount
  }

  return Object.entries(map)
    .map(([, data]) => ({
      service: data.displayName,
      category: data.category,
      categoryLabel: CATEGORY_LABEL_MAP[data.category],
      sport: data.sport,
      bookings: data.bookings,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
}

// ─── Payment Method Split ─────────────────────────────────────────────────────

const METHOD_DISPLAY: Record<string, string> = {
  card:        "Card",
  club_credit: "Club Credit",
  cash:        "Cash",
}

const METHOD_COLOURS: Record<string, string> = {
  card:        "#1d4ed8",
  club_credit: "#10b981",
  cash:        "#f59e0b",
}

export function derivePaymentMethodSplit(filters: ReportsFiltersState): PaymentMethodPoint[] {
  let filtered = applyDateRange(SAMPLE_PAYMENTS, filters.quickDate, filters.dateFrom, filters.dateTo)
  filtered = applySport(filtered, filters.sport)
  filtered = applyCategory(filtered, filters.category)
  filtered = filtered.filter((p) => p.status === "paid")

  const map: Record<string, number> = {}
  for (const p of filtered) {
    const key = p.paymentMethod
    map[key] = (map[key] ?? 0) + p.amount
  }

  return Object.entries(map)
    .map(([method, revenue]) => ({
      method: METHOD_DISPLAY[method] ?? method,
      revenue,
      color: METHOD_COLOURS[method] ?? "#94a3b8",
    }))
    .sort((a, b) => b.revenue - a.revenue)
}

// ─── Cancellation Rate ────────────────────────────────────────────────────────

export function deriveCancellationRate(filters: ReportsFiltersState): { rate: number; cancelled: number; total: number } {
  let filtered = applyDateRange(SAMPLE_PAYMENTS, filters.quickDate, filters.dateFrom, filters.dateTo)
  filtered = applySport(filtered, filters.sport)
  filtered = applyCategory(filtered, filters.category)

  const total = filtered.length
  const cancelled = filtered.filter((p) => p.status === "refunded").length
  const rate = total > 0 ? Math.round((cancelled / total) * 100) : 0

  return { rate, cancelled, total }
}

// ─── Day-of-week utilisation ──────────────────────────────────────────────────

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function deriveDayOfWeekBookings(filters: ReportsFiltersState): DayOfWeekPoint[] {
  let filtered = applyDateRange(SAMPLE_PAYMENTS, filters.quickDate, filters.dateFrom, filters.dateTo)
  filtered = applySport(filtered, filters.sport)
  filtered = applyCategory(filtered, filters.category)

  const counts = [0, 0, 0, 0, 0, 0, 0]
  for (const p of filtered) {
    const day = new Date(p.date).getDay()
    counts[day] += 1
  }

  return DAY_LABELS.map((day, i) => ({ day, bookings: counts[i] }))
}

// ─── New vs. Returning Players ────────────────────────────────────────────────

export function derivePlayerRetention(filters: ReportsFiltersState): PlayerRetentionData {
  // All bookings outside the current period = historical players
  const current = applyDateRange(SAMPLE_PAYMENTS, filters.quickDate, filters.dateFrom, filters.dateTo)
  const all = SAMPLE_PAYMENTS

  // Collect all player emails seen before the current period
  const currentIds = new Set(current.map((p) => p.id))
  const historicalEmails = new Set(
    all
      .filter((p) => !currentIds.has(p.id))
      .flatMap((p) => p.players.map((pl) => pl.email)),
  )

  // Within the current period, classify each unique player
  const currentEmails = new Set<string>()
  let newPlayers = 0
  let returningPlayers = 0

  for (const p of current) {
    for (const pl of p.players) {
      if (currentEmails.has(pl.email)) continue
      currentEmails.add(pl.email)
      if (historicalEmails.has(pl.email)) {
        returningPlayers += 1
      } else {
        newPlayers += 1
      }
    }
  }

  const total = newPlayers + returningPlayers
  return {
    newPlayers,
    returningPlayers,
    newPct: total > 0 ? Math.round((newPlayers / total) * 100) : 0,
    returningPct: total > 0 ? Math.round((returningPlayers / total) * 100) : 0,
  }
}

// ─── Member vs. Non-Member Split ─────────────────────────────────────────────

export function deriveMemberGuestSplit(filters: ReportsFiltersState): MemberGuestData {
  let filtered = applyDateRange(SAMPLE_PAYMENTS, filters.quickDate, filters.dateFrom, filters.dateTo)
  filtered = applySport(filtered, filters.sport)
  filtered = applyCategory(filtered, filters.category)

  let members = 0
  let guests = 0
  let memberRevenue = 0
  let guestRevenue = 0

  for (const p of filtered) {
    if (p.isMember === true) {
      members += 1
      memberRevenue += p.amount
    } else {
      guests += 1
      guestRevenue += p.amount
    }
  }

  return { members, guests, memberRevenue, guestRevenue }
}

// ─── Peak vs. Off-Peak (hourly buckets) ──────────────────────────────────────
// Buckets: Morning 06–12, Afternoon 12–17, Evening 17–22
// Peak = highest-booking bucket; off-peak = the rest

export interface TimeSlotPoint {
  slot: string
  label: string   // "Morning", "Afternoon", "Evening"
  bookings: number
  isPeak: boolean
}

export function deriveTimeSlotBookings(filters: ReportsFiltersState): TimeSlotPoint[] {
  let filtered = applyDateRange(SAMPLE_PAYMENTS, filters.quickDate, filters.dateFrom, filters.dateTo)
  filtered = applySport(filtered, filters.sport)
  filtered = applyCategory(filtered, filters.category)

  const slots: { label: string; from: number; to: number; bookings: number }[] = [
    { label: "Morning",   from: 6,  to: 12, bookings: 0 },
    { label: "Afternoon", from: 12, to: 17, bookings: 0 },
    { label: "Evening",   from: 17, to: 22, bookings: 0 },
  ]

  for (const p of filtered) {
    const hour = parseInt(p.time.split(":")[0], 10)
    for (const slot of slots) {
      if (hour >= slot.from && hour < slot.to) {
        slot.bookings += 1
        break
      }
    }
  }

  // TODO: make peakSlot configurable from Admin Settings — hardcoded to "Evening" for now
  const PEAK_SLOT = "Evening"

  return slots.map((s) => ({
    slot: s.label,
    label: s.label,
    bookings: s.bookings,
    isPeak: s.label === PEAK_SLOT,
  }))
}
