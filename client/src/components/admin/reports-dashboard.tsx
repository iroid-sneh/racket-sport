import { useMemo } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import { cn } from "@/lib/utils"
import { formatAmount } from "@/lib/payments-data"
import {
  deriveKpis,
  deriveRevenueOverTime,
  deriveBookingsByType,
  deriveTopServices,
  derivePaymentMethodSplit,
  deriveCancellationRate,
  derivePlayerRetention,
  deriveMemberGuestSplit,
  deriveTimeSlotBookings,
} from "@/lib/reports-data"
import type { ReportsFiltersState } from "@/lib/reports-data"
import type { ServiceCategory } from "@/lib/payments-data"

// ─── Category colours ────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<ServiceCategory, string> = {
  booking:  "bg-blue-50 text-blue-700",
  lesson:   "bg-emerald-50 text-emerald-700",
  activity: "bg-amber-50 text-amber-700",
  manual:   "bg-violet-50 text-violet-700",
}

// ─── KPI Cards ────────────────────────────────────────────────────────────────

function KpiCards({ filters }: { filters: ReportsFiltersState }) {
  const kpis = useMemo(() => deriveKpis(filters), [filters])

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3"
        >
          <span className="text-xs font-medium text-muted-foreground">{kpi.label}</span>
          <span className="text-2xl font-bold tracking-tight text-foreground leading-none">
            {kpi.value}
          </span>
          <span className="text-[11px] text-muted-foreground leading-relaxed">{kpi.sub}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Revenue chart custom tooltip ─────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-foreground mb-0.5">{label}</p>
      <p className="text-muted-foreground">
        Revenue: <span className="font-semibold text-foreground">{formatAmount(payload[0].value)}</span>
      </p>
    </div>
  )
}

// ─── Bookings chart custom tooltip ────────────────────────────────────────────

function BookingsTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-foreground mb-0.5">{label}</p>
      <p className="text-muted-foreground">
        Bookings: <span className="font-semibold text-foreground">{payload[0].value}</span>
      </p>
    </div>
  )
}

// ─── Charts row ───────────────────────────────────────────────────────────────

function ChartsRow({ filters }: { filters: ReportsFiltersState }) {
  const revenueData = useMemo(() => deriveRevenueOverTime(filters), [filters])
  const bookingsData = useMemo(() => deriveBookingsByType(filters), [filters])

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">

      {/* Revenue Over Time — 3 cols */}
      <div className="lg:col-span-3 rounded-lg border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Revenue Over Time</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Daily revenue for the selected period</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `£${(v / 100).toFixed(0)}`}
                width={42}
              />
              <Tooltip content={<RevenueTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#10b981", stroke: "var(--color-card)", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bookings by Type — 2 cols */}
      <div className="lg:col-span-2 rounded-lg border border-border bg-card p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Bookings by Type</h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">Distribution across booking categories</p>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bookingsData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barCategoryGap="30%">
              <CartesianGrid
                vertical={false}
                stroke="var(--color-border)"
                strokeDasharray="3 3"
              />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={24}
              />
              <Tooltip content={<BookingsTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {bookingsData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
          {bookingsData.map((item) => (
            <div key={item.category} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-muted-foreground">{item.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Top Services table ───────────────────────────────────────────────────────

function TopServicesTable({ filters }: { filters: ReportsFiltersState }) {
  const rows = useMemo(() => deriveTopServices(filters), [filters])

  const maxRevenue = rows[0]?.revenue ?? 1

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Top Services by Revenue</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Highest earning services for the selected period</p>
      </div>
      {rows.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No data for selected period.</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {rows.map((row, i) => (
            <div key={row.service} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
              <span className="text-xs font-semibold text-muted-foreground w-4 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-medium text-foreground truncate">{row.service}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0", CATEGORY_STYLES[row.category])}>
                      {row.categoryLabel}
                    </span>
                    {row.sport && (
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0 bg-slate-100 text-slate-600">
                        {row.sport}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-[11px] text-muted-foreground">{row.bookings} booking{row.bookings !== 1 ? "s" : ""}</span>
                    <span className="text-xs font-semibold text-foreground tabular-nums w-20 text-right">{formatAmount(row.revenue)}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-foreground/20 transition-all"
                    style={{ width: `${Math.round((row.revenue / maxRevenue) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Payment Method Split ─────────────────────────────────────────────────────

function PaymentMethodTooltip({ active, payload }: {
  active?: boolean
  payload?: { name: string; value: number; payload: { color: string } }[]
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-foreground mb-0.5">{payload[0].name}</p>
      <p className="text-muted-foreground">
        Revenue: <span className="font-semibold text-foreground">{formatAmount(payload[0].value)}</span>
      </p>
    </div>
  )
}

function PaymentMethodSplit({ filters }: { filters: ReportsFiltersState }) {
  const data = useMemo(() => derivePaymentMethodSplit(filters), [filters])
  const total = data.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Payment Methods</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">Revenue split by payment method</p>
      </div>
      {total === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm text-muted-foreground">No data for selected period.</p>
        </div>
      ) : (
        <>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="revenue"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="80%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PaymentMethodTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {data.map((item) => (
              <div key={item.method} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.method}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{Math.round((item.revenue / total) * 100)}%</span>
                  <span className="font-semibold text-foreground tabular-nums w-16 text-right">{formatAmount(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── Shared segmented bar card ────────────────────────────────────────────────

function SegmentedBarCard({
  title,
  subtitle,
  bars,
  empty,
}: {
  title: string
  subtitle: string
  bars: { label: string; value: number; pct: number; color: string }[]
  empty: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col">
      <h3 className="text-sm font-semibold text-foreground mb-0.5">{title}</h3>
      <p className="text-[11px] text-muted-foreground mb-4">{subtitle}</p>
      <div className="flex h-2 rounded-full overflow-hidden mb-4">
        {empty
          ? <div className="flex-1 bg-muted" />
          : bars.map((b) => (
              <div key={b.label} style={{ width: `${b.pct}%`, backgroundColor: b.color }} />
            ))
        }
      </div>
      <div className="flex flex-col gap-2.5 mt-auto">
        {bars.map((b) => (
          <div key={b.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: b.color }} />
              <span className="text-muted-foreground">{b.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground w-8 text-right">{b.pct}%</span>
              <span className="font-semibold text-foreground tabular-nums w-5 text-right">{b.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Operational insights row ─────────────────────────────────────────────────

function OperationalInsightsRow({ filters }: { filters: ReportsFiltersState }) {
  const cancellation = useMemo(() => deriveCancellationRate(filters), [filters])
  const timeSlots    = useMemo(() => deriveTimeSlotBookings(filters), [filters])
  const retention    = useMemo(() => derivePlayerRetention(filters), [filters])
  const memberGuest  = useMemo(() => deriveMemberGuestSplit(filters), [filters])

  const totalPlayers  = retention.newPlayers + retention.returningPlayers
  const totalBookings = memberGuest.members + memberGuest.guests
  const maxSlot = Math.max(...timeSlots.map((s) => s.bookings), 1)

  const retentionBars = [
    { label: "New",       value: retention.newPlayers,       pct: totalPlayers > 0 ? Math.round((retention.newPlayers / totalPlayers) * 100) : 0,        color: "#3b82f6" },
    { label: "Returning", value: retention.returningPlayers, pct: totalPlayers > 0 ? Math.round((retention.returningPlayers / totalPlayers) * 100) : 0,   color: "#10b981" },
  ]

  const memberBars = [
    { label: "Member",     value: memberGuest.members, pct: totalBookings > 0 ? Math.round((memberGuest.members / totalBookings) * 100) : 0, color: "#8b5cf6" },
    { label: "Non-Member", value: memberGuest.guests,  pct: totalBookings > 0 ? Math.round((memberGuest.guests  / totalBookings) * 100) : 0, color: "#f59e0b" },
  ]

  const cancellationAccent =
    cancellation.rate > 15 ? "text-red-600" :
    cancellation.rate > 5  ? "text-amber-600" :
    "text-foreground"

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

      {/* Cancellation Rate */}
      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3">
        <span className="text-xs font-medium text-muted-foreground">Cancellation Rate</span>
        <span className={cn("text-2xl font-bold tracking-tight leading-none", cancellationAccent)}>
          {cancellation.rate}%
        </span>
        <span className="text-[11px] text-muted-foreground leading-relaxed">
          {cancellation.cancelled} cancellation{cancellation.cancelled !== 1 ? "s" : ""} out of {cancellation.total} bookings
        </span>
      </div>

      {/* Peak vs. Off-Peak */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-0.5">Peak vs. Off-Peak</h3>
        <p className="text-[11px] text-muted-foreground mb-4">Booking volume by time of day</p>
        <div className="flex flex-col gap-3">
          {timeSlots.map((slot) => (
            <div key={slot.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{slot.label}</span>
                  {slot.isPeak && (
                    <span className="rounded-full bg-amber-50 px-1.5 py-px text-[10px] font-semibold text-amber-700">Peak</span>
                  )}
                </div>
                <span className="text-xs font-semibold text-foreground tabular-nums">{slot.bookings}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", slot.isPeak ? "bg-amber-400" : "bg-blue-300")}
                  style={{ width: `${maxSlot > 0 ? Math.round((slot.bookings / maxSlot) * 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
          Morning 6–12 · Afternoon 12–17 · Evening 17–22
        </p>
      </div>

      {/* New vs. Returning */}
      <SegmentedBarCard
        title="New vs. Returning"
        subtitle="Unique players this period"
        bars={retentionBars}
        empty={totalPlayers === 0}
      />

      {/* Member vs. Non-Member */}
      <SegmentedBarCard
        title="Member vs. Non-Member"
        subtitle="Booking split by membership status"
        bars={memberBars}
        empty={totalBookings === 0}
      />

    </div>
  )
}

// ─── Section divider ──────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ─��─ Dashboard shell ──────────────────────────────────────────────────────────

interface ReportsDashboardProps {
  filters: ReportsFiltersState
}

export function ReportsDashboard({ filters }: ReportsDashboardProps) {
  return (
    <div className="flex flex-col gap-5 p-6 overflow-y-auto">
      <SectionLabel label="Financial" />
      <KpiCards filters={filters} />
      <ChartsRow filters={filters} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TopServicesTable filters={filters} />
        </div>
        <PaymentMethodSplit filters={filters} />
      </div>
      <SectionLabel label="Operational" />
      <OperationalInsightsRow filters={filters} />
    </div>
  )
}
