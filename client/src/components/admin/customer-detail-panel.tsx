import { useState } from "react"
import {
  X,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatAmount, formatDate } from "@/lib/customers-data"
import type { Customer, MembershipTier, SportLevel, BookingHistoryItem, WalletTransaction } from "@/lib/customers-data"

// ─── Badge configs ────────────────────────────────────────────────────────────

const MEMBERSHIP_TIER_CONFIG: Record<MembershipTier, { label: string; className: string }> = {
  vip: { label: "VIP", className: "bg-amber-100 text-amber-700" },
  premium: { label: "Premium", className: "bg-violet-100 text-violet-700" },
  basic: { label: "Basic", className: "bg-blue-100 text-blue-700" },
  none: { label: "Non-member", className: "bg-muted text-muted-foreground" },
}

const LEVEL_CONFIG: Record<SportLevel, { label: string; className: string }> = {
  beginner: { label: "Beginner", className: "bg-emerald-100 text-emerald-700" },
  improver: { label: "Improver", className: "bg-teal-100 text-teal-700" },
  intermediate: { label: "Intermediate", className: "bg-blue-100 text-blue-700" },
  advanced: { label: "Advanced", className: "bg-violet-100 text-violet-700" },
  expert: { label: "Expert", className: "bg-amber-100 text-amber-700" },
}

const SPORT_COLORS: Record<string, string> = {
  Tennis: "bg-emerald-100 text-emerald-700",
  Padel: "bg-blue-100 text-blue-700",
  Pickleball: "bg-orange-100 text-orange-700",
}

const BOOKING_TYPE_STYLES = {
  booking: "bg-blue-50 text-blue-700 border-blue-200",
  lesson: "bg-emerald-50 text-emerald-700 border-emerald-200",
  activity: "bg-amber-50 text-amber-700 border-amber-200",
}

const BOOKING_STATUS_STYLES = {
  completed: { icon: CheckCircle2, className: "text-emerald-600" },
  cancelled: { icon: XCircle, className: "text-muted-foreground" },
  "no-show": { icon: AlertCircle, className: "text-rose-600" },
}

// ─── Types ───────────────────────────────────────────────────────────────────

type TabId = "profile" | "membership" | "sports" | "wallet" | "history"

interface CustomerDetailPanelProps {
  customer: Customer | null
  open: boolean
  onClose: () => void
  onSave?: (customer: Customer) => void
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CustomerDetailPanel({
  customer,
  open,
  onClose,
  onSave,
}: CustomerDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<Customer>>({})

  // Reset when customer changes
  if (customer && editData.id !== customer.id) {
    setEditData({ ...customer })
    setIsEditing(false)
    setActiveTab("profile")
  }

  if (!customer) return null

  const tierCfg = MEMBERSHIP_TIER_CONFIG[customer.membership.tier]

  const tabs: { id: TabId; label: string }[] = [
    { id: "profile", label: "Profile" },
    { id: "membership", label: "Membership" },
    { id: "sports", label: "Sports" },
    { id: "wallet", label: "Wallet" },
    { id: "history", label: "History" },
  ]

  function handleSave() {
    if (onSave && editData) {
      onSave(editData as Customer)
    }
    setIsEditing(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 z-40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          "fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-xl z-50 flex flex-col transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <header className="flex items-start gap-4 border-b border-border px-5 py-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white",
              customer.avatarColor
            )}
          >
            {customer.initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground truncate">
                {customer.name}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0",
                  tierCfg.className
                )}
              >
                {tierCfg.label}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {customer.email}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
              <Phone className="h-3 w-3" />
              {customer.phone}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 py-2 border-b border-border bg-muted/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                activeTab === tab.id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "profile" && (
            <ProfileTab
              customer={customer}
              isEditing={isEditing}
              editData={editData}
              setEditData={setEditData}
            />
          )}
          {activeTab === "membership" && (
            <MembershipTab customer={customer} />
          )}
          {activeTab === "sports" && (
            <SportsTab customer={customer} />
          )}
          {activeTab === "wallet" && (
            <WalletTab customer={customer} />
          )}
          {activeTab === "history" && (
            <HistoryTab customer={customer} />
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border px-5 py-3 bg-muted/30">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-3.5 w-3.5" />
                Edit Customer
              </Button>
            </>
          )}
        </footer>
      </aside>
    </>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  customer,
  isEditing,
  editData,
  setEditData,
}: {
  customer: Customer
  isEditing: boolean
  editData: Partial<Customer>
  setEditData: (data: Partial<Customer>) => void
}) {
  return (
    <div className="p-5 space-y-5">
      {/* Wallet Balance */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-1">
          Wallet Balance
        </p>
        <p className="text-2xl font-bold text-emerald-700 tabular-nums">
          {formatAmount(customer.wallet.balance)}
        </p>
      </div>

      {/* Contact details */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Contact Details
        </p>
        {isEditing ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={editData.name ?? ""}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={editData.email ?? ""}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input
                value={editData.phone ?? ""}
                onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 bg-card">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Email</p>
                <p className="text-xs font-medium text-foreground truncate">{customer.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-card">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Phone</p>
                <p className="text-xs font-medium text-foreground">{customer.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 bg-card">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Last Visit</p>
                <p className="text-xs font-medium text-foreground">{formatDate(customer.lastVisit)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Internal Notes
        </p>
        {isEditing ? (
          <Textarea
            value={editData.notes ?? ""}
            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            placeholder="Add notes about this customer..."
            className="text-xs min-h-[80px] resize-none"
          />
        ) : customer.notes ? (
          <div className="rounded-xl bg-secondary px-4 py-3">
            <p className="text-xs text-foreground">{customer.notes}</p>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground">No notes added</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Membership Tab ───────────────────────────────────────────────────────────

function MembershipTab({ customer }: { customer: Customer }) {
  const tierCfg = MEMBERSHIP_TIER_CONFIG[customer.membership.tier]
  const isNonMember = customer.membership.tier === "none"

  return (
    <div className="p-5 space-y-5">
      {/* Member Since */}
      <div className="rounded-xl bg-secondary p-3 text-center">
        <p className="text-sm font-semibold text-foreground">
          {formatDate(customer.joinDate)}
        </p>
        <p className="text-[10px] text-muted-foreground font-medium">Member Since</p>
      </div>

      {/* Current membership card */}
      <div className={cn(
        "rounded-xl border p-4",
        isNonMember ? "border-dashed border-border bg-muted/30" : "border-border bg-card"
      )}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold", tierCfg.className)}>
              {tierCfg.label.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{tierCfg.label}</p>
              {!isNonMember && (
                <p className={cn(
                  "text-[11px] font-medium",
                  customer.membership.status === "active" ? "text-emerald-600" :
                  customer.membership.status === "expired" ? "text-amber-600" : "text-muted-foreground"
                )}>
                  {customer.membership.status.charAt(0).toUpperCase() + customer.membership.status.slice(1)}
                </p>
              )}
            </div>
          </div>
          {!isNonMember && customer.membership.autoRenew && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <RotateCcw className="h-3 w-3" />
              Auto-renew
            </span>
          )}
        </div>

        {!isNonMember && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
            <div>
              <p className="text-[10px] text-muted-foreground">Start Date</p>
              <p className="text-xs font-medium text-foreground">
                {formatDate(customer.membership.startDate)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">End Date</p>
              <p className="text-xs font-medium text-foreground">
                {formatDate(customer.membership.endDate)}
              </p>
            </div>
          </div>
        )}

        {isNonMember && (
          <p className="text-xs text-muted-foreground text-center py-2">
            This customer does not have an active membership
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Membership Actions
        </p>
        <div className="grid grid-cols-2 gap-2">
          {isNonMember ? (
            <Button variant="outline" size="sm" className="col-span-2">
              Add Membership
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm">
                Change Tier
              </Button>
              <Button variant="outline" size="sm">
                Extend / Renew
              </Button>
              {customer.membership.status === "active" && (
                <Button variant="outline" size="sm" className="col-span-2 text-destructive hover:text-destructive">
                  Cancel Membership
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Sports Tab ───────────────────────────────────────────────────────────────

function SportsTab({ customer }: { customer: Customer }) {
  return (
    <div className="p-5 space-y-5">
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sport Profiles
        </p>
        {customer.sports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground">No sports added yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customer.sports.map((sp, i) => {
              const levelCfg = LEVEL_CONFIG[sp.level]
              const sportColor = SPORT_COLORS[sp.sport] || "bg-muted text-muted-foreground"
              return (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg text-xs font-bold", sportColor)}>
                      {sp.sport.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{sp.sport}</p>
                      <span className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5",
                        levelCfg.className
                      )}>
                        {levelCfg.label}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">
                    Edit
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Button variant="outline" size="sm" className="w-full">
        Add Sport
      </Button>
    </div>
  )
}

// ─── Wallet Tab ───────────────────────────────────────────────────────────────

function WalletTab({ customer }: { customer: Customer }) {
  const [creditAmount, setCreditAmount] = useState("")
  const [description, setDescription] = useState("")

  const handleAddCredits = () => {
    const amount = parseFloat(creditAmount)
    if (isNaN(amount) || amount <= 0) return
    // In a real app, this would call an API
    console.log("Adding credits:", { amount: amount * 100, description })
    setCreditAmount("")
    setDescription("")
  }

  return (
    <div className="p-5 space-y-5">
      {/* Current Balance */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 mb-1">
          Current Balance
        </p>
        <p className="text-2xl font-bold text-emerald-700 tabular-nums">
          {formatAmount(customer.wallet.balance)}
        </p>
      </div>

      {/* Add Credits */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Add Credits
        </p>
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Amount (£)</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="e.g. Referral bonus, Compensation..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={handleAddCredits}
            disabled={!creditAmount || parseFloat(creditAmount) <= 0}
          >
            Add Credits
          </Button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Transaction History
        </p>
        {customer.wallet.transactions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
            <p className="text-xs text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {customer.wallet.transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {tx.description}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {formatDate(tx.date)}
                    {tx.addedBy && <span> · by {tx.addedBy}</span>}
                  </p>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold tabular-nums",
                    tx.type === "credit" ? "text-emerald-600" : "text-rose-600"
                  )}
                >
                  {tx.type === "credit" ? "+" : "-"}{formatAmount(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab({ customer }: { customer: Customer }) {
  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Booking History
        </p>
        <span className="text-xs text-muted-foreground">
          {customer.bookingHistory.length} booking{customer.bookingHistory.length !== 1 ? "s" : ""}
        </span>
      </div>

      {customer.bookingHistory.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center">
          <p className="text-xs text-muted-foreground">No booking history</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customer.bookingHistory.map((booking) => {
            const statusCfg = BOOKING_STATUS_STYLES[booking.status]
            const StatusIcon = statusCfg.icon
            return (
              <div
                key={booking.id}
                className="rounded-xl border border-border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        "rounded-md border px-1.5 py-0.5 text-[10px] font-medium capitalize",
                        BOOKING_TYPE_STYLES[booking.type]
                      )}>
                        {booking.type}
                      </span>
                      <StatusIcon className={cn("h-3.5 w-3.5", statusCfg.className)} />
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">
                      {booking.service}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.court}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn(
                      "text-xs font-semibold tabular-nums",
                      booking.status === "cancelled" ? "text-muted-foreground line-through" : "text-foreground"
                    )}>
                      {booking.amount === 0 ? "Free" : formatAmount(booking.amount)}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
