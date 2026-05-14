import { generateId } from "@/lib/utils"

// Shared types for the club setup flow

export interface PricingCondition {
  id: string
  name: string                      // e.g. "Peak", "Off-peak", "Summer holiday"
  fromTime: string                  // "HH:MM"
  toTime: string                    // "HH:MM"
  conditionMode: "days" | "dates"   // either recurring days-of-week OR a date range
  days: string[]                    // used when conditionMode === "days"
  dateFrom: string                  // ISO date, used when conditionMode === "dates"
  dateTo: string                    // ISO date, used when conditionMode === "dates"
  price: string
  expanded: boolean
}

export const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Minimal coach reference passed between panels
export interface CoachRef {
  id: string
  name: string
}

export function newPricingCondition(): PricingCondition {
  return {
    id: generateId(),
    name: "",
    fromTime: "08:00",
    toTime: "22:00",
    conditionMode: "days",
    days: [],
    dateFrom: "",
    dateTo: "",
    price: "",
    expanded: true,
  }
}

export interface BookingType {
  id: string
  duration: string          // minutes as string
  minCapacity: string
  maxCapacity: string
  perCourtPricing: boolean  // false = single price for all courts, true = per-court
  pricePerCourt: string     // used when perCourtPricing is false
  courtPrices: Record<string, string> // courtId → price, used when perCourtPricing is true
  pricingConditions: PricingCondition[]
  expanded: boolean
}

export interface DayHours {
  open: boolean
  from: string
  to: string
}

export type WeekHours = Record<string, DayHours>

export const DAYS_KEY  = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const FULL_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export function defaultWeekHours(): WeekHours {
  return Object.fromEntries(DAYS_KEY.map((d) => [d, { open: true, from: "07:00", to: "22:00" }]))
}
