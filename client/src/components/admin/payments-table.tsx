import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  AlertCircle,
  RotateCcw,
  Clock,
  CheckCircle2,
  User,
  CreditCard,
  Banknote,
  Coins,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatAmount, formatDate } from "@/lib/payments-data"
import type { Payment, ServiceCategory, PaymentMethod, PaymentStatus, PlayerPaymentStatus } from "@/lib/payments-data"

// ─── Badge helpers ────────────────────────────────────────────────────────────

const CATEGORY_STYLES: Record<ServiceCategory, string> = {
  booking: "bg-blue-50 text-blue-700 border-blue-200",
  lesson: "bg-emerald-50 text-emerald-700 border-emerald-200",
  activity: "bg-amber-50 text-amber-700 border-amber-200",
  manual: "bg-purple-50 text-purple-700 border-purple-200",
}

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  booking: "Booking",
  lesson: "Lesson",
  activity: "Activity",
  manual: "Manual",
}

const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  paid: {
    label: "Paid",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCircle2,
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  failed: {
    label: "Failed",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: AlertCircle,
  },
  refunded: {
    label: "Refunded",
    className: "bg-muted text-muted-foreground border-border",
    icon: RotateCcw,
  },
}

const PLAYER_STATUS_CONFIG: Record<
  PlayerPaymentStatus,
  { label: string; className: string; dot: string }
> = {
  paid: {
    label: "Paid",
    className: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  pending: {
    label: "Pending",
    className: "text-amber-700",
    dot: "bg-amber-400",
  },
  failed: {
    label: "Failed",
    className: "text-red-700",
    dot: "bg-red-500",
  },
}

const METHOD_CONFIG: Record<PaymentMethod, { label: string; icon: React.ElementType }> = {
  card: { label: "Card", icon: CreditCard },
  club_credit: { label: "Club Credit", icon: Coins },
  cash: { label: "Cash", icon: Banknote },
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

type SortKey = "date" | "service" | "category" | "customer" | "amount" | "status" | "method"
type SortDir = "asc" | "desc"

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3.5 w-3.5 opacity-30" />
  return dir === "asc"
    ? <ChevronUp className="h-3.5 w-3.5" />
    : <ChevronDown className="h-3.5 w-3.5" />
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function PaymentRow({ payment }: { payment: Payment }) {
  const [expanded, setExpanded] = useState(false)
  const statusCfg = STATUS_CONFIG[payment.status]
  const methodCfg = METHOD_CONFIG[payment.paymentMethod]
  const StatusIcon = statusCfg.icon
  const MethodIcon = methodCfg.icon
  const hasMultiplePlayers = payment.players.length > 1

  const pendingPlayers = payment.players.filter((p) => p.paymentStatus === "pending")
  const failedPlayers = payment.players.filter((p) => p.paymentStatus === "failed")

  return (
    <>
      <tr
        className={cn(
          "group border-b border-border transition-colors",
          expanded ? "bg-muted/20" : "hover:bg-muted/20"
        )}
      >
        {/* Expand toggle */}
        <td className="w-10 pl-4 pr-0 py-3">
          {hasMultiplePlayers ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              aria-label={expanded ? "Collapse players" : "Expand players"}
            >
              {expanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <div className="flex h-6 w-6 items-center justify-center">
              {payment.isManual ? (
                <Wrench className="h-3.5 w-3.5 text-muted-foreground/40" />
              ) : (
                <User className="h-3.5 w-3.5 text-muted-foreground/40" />
              )}
            </div>
          )}
        </td>

        {/* Date & time */}
        <td className="py-3 pr-4">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-foreground">{formatDate(payment.date)}</span>
            <span className="text-[11px] text-muted-foreground">{payment.time}</span>
          </div>
        </td>

        {/* Booking ID */}
        <td className="py-3 pr-6">
          <span className="font-mono text-[11px] text-muted-foreground">{payment.bookingId}</span>
        </td>

        {/* Service */}
        <td className="py-3 pr-6 max-w-[240px]">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-medium text-foreground truncate">{payment.service}</span>
            {payment.courtName && (
              <span className="text-[11px] text-muted-foreground truncate">{payment.courtName}</span>
            )}
          </div>
        </td>

        {/* Category */}
        <td className="py-3 pr-6">
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium",
              CATEGORY_STYLES[payment.category]
            )}
          >
            {CATEGORY_LABELS[payment.category]}
          </span>
        </td>

        {/* Primary player (or count) */}
        <td className="py-3 pr-6">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-foreground">{payment.players[0].name}</span>
            {hasMultiplePlayers ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">
                  +{payment.players.length - 1} player{payment.players.length - 1 > 1 ? "s" : ""}
                </span>
                {(pendingPlayers.length > 0 || failedPlayers.length > 0) && (
                  <span className={cn(
                    "text-[10px] font-medium",
                    failedPlayers.length > 0 ? "text-red-600" : "text-amber-600"
                  )}>
                    · {failedPlayers.length > 0
                      ? `${failedPlayers.length} failed`
                      : `${pendingPlayers.length} pending`}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground">{payment.players[0].email}</span>
            )}
          </div>
        </td>

        {/* Method */}
        <td className="py-3 pr-6">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MethodIcon className="h-3.5 w-3.5" />
            <span className="text-xs">{methodCfg.label}</span>
          </div>
        </td>

        {/* Status */}
        <td className="py-3 pr-6">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium",
              statusCfg.className
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {statusCfg.label}
          </span>
        </td>

        {/* Amount */}
        <td className="py-3 pr-4 text-right">
          <span className={cn(
            "text-sm font-semibold tabular-nums",
            payment.status === "refunded" ? "text-muted-foreground line-through" : "text-foreground"
          )}>
            {formatAmount(payment.amount)}
          </span>
        </td>
      </tr>

      {/* Expanded players */}
      {expanded && (
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={9} className="py-0 pl-10 pr-4">
            <div className="flex flex-col divide-y divide-border/60">
              {/* Pending/failed summary banner */}
              {(pendingPlayers.length > 0 || failedPlayers.length > 0) && (
                <div className={cn(
                  "flex items-center gap-2 py-2 text-[11px] font-medium",
                  failedPlayers.length > 0 ? "text-red-700" : "text-amber-700"
                )}>
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  {failedPlayers.length > 0
                    ? `${failedPlayers.length} player${failedPlayers.length > 1 ? "s" : ""} with a failed payment`
                    : `${pendingPlayers.length} player${pendingPlayers.length > 1 ? "s" : ""} yet to pay`}
                </div>
              )}

              {payment.players.map((player, i) => {
                const psCfg = PLAYER_STATUS_CONFIG[player.paymentStatus]
                return (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 py-2.5"
                  >
                    {/* Avatar */}
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px] font-bold">
                      {player.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>

                    {/* Name + email */}
                    <div className="flex flex-col gap-px min-w-0">
                      <span className="text-xs font-medium text-foreground">{player.name}</span>
                      <span className="text-[11px] text-muted-foreground">{player.email}</span>
                    </div>

                    {/* Player payment status */}
                    <div className="ml-4 flex items-center gap-1.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", psCfg.dot)} />
                      <span className={cn("text-[11px] font-medium", psCfg.className)}>
                        {psCfg.label}
                      </span>
                      {player.pendingReason && (
                        <span className="text-[11px] text-muted-foreground">
                          — {player.pendingReason}
                        </span>
                      )}
                    </div>

                    {/* Lead booker tag */}
                    {i === 0 && (
                      <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground shrink-0">
                        Lead booker
                      </span>
                    )}
                  </div>
                )
              })}

              {/* Notes */}
              {payment.notes && (
                <div className="flex items-start gap-2 py-2.5 pb-3">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground italic">{payment.notes}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Table ────────────────────────────────────────────────────────────────────

interface PaymentsTableProps {
  payments: Payment[]
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  const sorted = [...payments].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case "date":
        cmp = (a.date + a.time).localeCompare(b.date + b.time)
        break
      case "service":
        cmp = a.service.localeCompare(b.service)
        break
      case "category":
        cmp = a.category.localeCompare(b.category)
        break
      case "customer":
        cmp = a.players[0].name.localeCompare(b.players[0].name)
        break
      case "amount":
        cmp = a.amount - b.amount
        break
      case "status":
        cmp = a.status.localeCompare(b.status)
        break
      case "method":
        cmp = a.paymentMethod.localeCompare(b.paymentMethod)
        break
    }
    return sortDir === "asc" ? cmp : -cmp
  })

  function Th({
    children,
    sortable,
    align = "left",
    className,
  }: {
    children: React.ReactNode
    sortable?: SortKey
    align?: "left" | "right"
    className?: string
  }) {
    const isActive = sortable === sortKey
    return (
      <th
        className={cn(
          "border-b border-border bg-muted/30 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground select-none",
          align === "right" ? "text-right pr-4" : "text-left",
          sortable && "cursor-pointer hover:text-foreground transition-colors",
          className
        )}
        onClick={sortable ? () => handleSort(sortable) : undefined}
      >
        <div className={cn("flex items-center gap-1", align === "right" && "justify-end")}>
          {children}
          {sortable && <SortIcon active={isActive} dir={sortDir} />}
        </div>
      </th>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <CreditCard className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">No transactions found</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full min-w-[1000px] border-collapse">
        <thead className="sticky top-0 z-10">
          <tr>
            <th className="w-10 border-b border-border bg-muted/30 py-2.5 pl-4" />
            <Th sortable="date" className="pl-0 pr-4 w-32">Date</Th>
            <Th className="pr-6 w-24">Booking ID</Th>
            <Th sortable="service" className="pr-6">Service</Th>
            <Th sortable="category" className="pr-6 w-28">Category</Th>
            <Th sortable="customer" className="pr-6 w-44">Customer</Th>
            <Th sortable="method" className="pr-6 w-32">Method</Th>
            <Th sortable="status" className="pr-6 w-28">Status</Th>
            <Th sortable="amount" align="right" className="w-28">Amount</Th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))}
        </tbody>
        {/* Footer totals */}
        <tfoot>
          <tr className="border-t-2 border-border bg-muted/20">
            <td colSpan={8} className="py-3 pl-14 text-xs font-medium text-muted-foreground">
              {payments.length} transaction{payments.length !== 1 ? "s" : ""}
            </td>
            <td className="py-3 pr-4 text-right text-sm font-bold text-foreground tabular-nums">
              {formatAmount(payments.filter(p => p.status !== "refunded").reduce((sum, p) => sum + p.amount, 0))}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
