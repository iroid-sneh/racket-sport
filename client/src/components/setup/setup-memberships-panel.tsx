import { useState } from "react"
import { cn, generateId } from "@/lib/utils"
import { Plus, Trash2, ChevronDown, GripVertical, Pencil, Check } from "lucide-react"
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
import type { Location } from "@/pages/SetupPage"

interface Props {
  locations: Location[]
}

// ---- Types ----

type AppliesTo = "bookings" | "lessons" | "activities"
type MembershipTier = "basic" | "premium"

interface DiscountCondition {
  id: string
  name: string
  discountType: "percent" | "absolute"
  discountValue: string
  appliesTo: AppliesTo[]
  fullCourt: boolean
  expanded: boolean
}

interface Membership {
  id: string
  name: string
  tier: MembershipTier
  durationType: "months" | "fixed-date"
  durationValue: string
  endDate: string
  price: string
  availableLocations: string[]   // location ids
  benefits: string                // newline-separated
  discountConditions: DiscountCondition[]
  advancedBookingDays: string
  expanded: boolean
}

function newDiscountCondition(): DiscountCondition {
  return {
    id: generateId(),
    name: "",
    discountType: "percent",
    discountValue: "",
    appliesTo: ["bookings"],
    fullCourt: false,
    expanded: true,
  }
}

function newMembership(allLocationIds: string[]): Membership {
  return {
    id: generateId(),
    name: "",
    tier: "basic",
    durationType: "months",
    durationValue: "12",
    endDate: "",
    price: "",
    availableLocations: allLocationIds,
    benefits: "",
    discountConditions: [],
    advancedBookingDays: "0",
    expanded: true,
  }
}

// ---- Sample seed data ----

function seedMemberships(allLocationIds: string[]): Membership[] {
  return [
    {
      id: generateId(),
      name: "Basic",
      tier: "basic",
      durationType: "months",
      durationValue: "6",
      endDate: "",
      price: "29.99",
      availableLocations: allLocationIds,
      benefits: "Off-peak access\n10% discount on lessons",
      discountConditions: [],
      advancedBookingDays: "0",
      expanded: false,
    },
    {
      id: generateId(),
      name: "Premium",
      tier: "premium",
      durationType: "months",
      durationValue: "12",
      endDate: "",
      price: "59.99",
      availableLocations: allLocationIds,
      benefits: "Full access\n20% discount on lessons\nPriority booking\nFree guest passes",
      discountConditions: [],
      advancedBookingDays: "3",
      expanded: false,
    },
  ]
}

const TIER_STYLES: Record<MembershipTier, string> = {
  basic:   "bg-blue-50 text-blue-700",
  premium: "bg-violet-50 text-violet-700",
}

const TIER_LABELS: Record<MembershipTier, string> = {
  basic:   "Basic",
  premium: "Premium",
}

// ---- Shared UI ----

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-border last:border-0">
      <div className="min-w-0 shrink-0 w-44 pt-1.5">
        <Label className="text-xs font-semibold text-foreground">{label}</Label>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function Toggle2({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-foreground" : "bg-border"
      )}
    >
      <span className={cn(
        "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  )
}

const APPLIES_TO_OPTIONS: { value: AppliesTo; label: string }[] = [
  { value: "bookings",   label: "Bookings" },
  { value: "lessons",    label: "Private lessons" },
  { value: "activities", label: "Activities" },
]

// ---- Collapsed card view (Figma list) ----

function MembershipCollapsedCard({
  membership,
  onEdit,
  onDelete,
}: {
  membership: Membership
  onEdit: () => void
  onDelete: () => void
}) {
  const benefits = membership.benefits
    .split("\n")
    .map((b) => b.trim())
    .filter(Boolean)
  const durationLabel =
    membership.durationType === "months"
      ? `/${membership.durationValue} months`
      : membership.endDate
      ? ` until ${membership.endDate}`
      : ""

  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 relative">
      {/* Top right actions */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={onEdit}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Edit membership"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="text-rose-500 hover:text-rose-600 transition-colors"
          aria-label="Delete membership"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-foreground">{membership.name || "Untitled membership"}</h3>
        <span className={cn(
          "self-start rounded-md px-2 py-0.5 text-[11px] font-semibold",
          TIER_STYLES[membership.tier]
        )}>
          {TIER_LABELS[membership.tier]}
        </span>
      </div>

      {/* Price */}
      <div className="flex items-baseline">
        <span className="text-3xl font-bold text-foreground tabular-nums">
          £{membership.price || "0.00"}
        </span>
        <span className="text-xs text-muted-foreground ml-0.5">{durationLabel}</span>
      </div>

      {/* Benefits */}
      {benefits.length > 0 && (
        <ul className="flex flex-col gap-1.5 mt-1">
          {benefits.map((b, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-foreground">
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              {b}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---- Discount condition card ----

function DiscountConditionCard({
  condition,
  onChange,
  onDelete,
}: {
  condition: DiscountCondition
  onChange: (c: DiscountCondition) => void
  onDelete: () => void
}) {
  function toggleAppliesTo(val: AppliesTo) {
    const next = condition.appliesTo.includes(val)
      ? condition.appliesTo.filter((v) => v !== val)
      : [...condition.appliesTo, val]
    if (next.length === 0) return
    onChange({ ...condition, appliesTo: next })
  }

  const bookingsSelected = condition.appliesTo.includes("bookings")

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
        <Input
          value={condition.name}
          onChange={(e) => onChange({ ...condition, name: e.target.value })}
          placeholder="Condition name (e.g. 20% off court bookings)"
          className="h-7 flex-1 text-xs border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 font-medium"
        />
        <button
          onClick={() => onChange({ ...condition, expanded: !condition.expanded })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", condition.expanded && "rotate-180")} />
        </button>
        <button onClick={onDelete} className="text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>

      {condition.expanded && (
        <div className="px-4 py-3 flex flex-col">
          {/* Discount value */}
          <div className="flex items-center gap-6 py-2.5 border-b border-border">
            <span className="text-xs font-semibold text-foreground w-28 shrink-0">Discount</span>
            <div className="flex items-center gap-2">
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["percent", "absolute"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onChange({ ...condition, discountType: type })}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium transition-colors",
                      condition.discountType === type
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground bg-transparent"
                    )}
                  >
                    {type === "percent" ? "%" : "£ off"}
                  </button>
                ))}
              </div>
              <div className="relative w-24">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {condition.discountType === "percent" ? "%" : "£"}
                </span>
                <Input
                  value={condition.discountValue}
                  onChange={(e) => onChange({ ...condition, discountValue: e.target.value })}
                  placeholder="0"
                  className="h-8 pl-6 text-xs w-full"
                />
              </div>
            </div>
          </div>

          {/* Applies to */}
          <div className="flex items-center gap-6 py-2.5 border-b border-border">
            <span className="text-xs font-semibold text-foreground w-28 shrink-0">Applies to</span>
            <div className="flex flex-wrap gap-1.5">
              {APPLIES_TO_OPTIONS.map(({ value, label }) => {
                const active = condition.appliesTo.includes(value)
                return (
                  <button
                    key={value}
                    onClick={() => toggleAppliesTo(value)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Full court toggle */}
          {bookingsSelected && (
            <div className="flex items-center gap-6 py-2.5">
              <span className="text-xs font-semibold text-foreground w-28 shrink-0">Full court</span>
              <div className="flex items-center gap-2.5">
                <Toggle2
                  checked={condition.fullCourt}
                  onChange={(v) => onChange({ ...condition, fullCourt: v })}
                />
                <span className="text-[11px] text-muted-foreground">
                  {condition.fullCourt
                    ? "Discount applies to the full court — all players benefit"
                    : "Discount applies to the member's share only"}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ---- Expanded membership form ----

function MembershipExpandedCard({
  membership,
  locations,
  onChange,
  onDelete,
}: {
  membership: Membership
  locations: Location[]
  onChange: (m: Membership) => void
  onDelete: () => void
}) {
  function toggleLocation(id: string) {
    const next = membership.availableLocations.includes(id)
      ? membership.availableLocations.filter((l) => l !== id)
      : [...membership.availableLocations, id]
    onChange({ ...membership, availableLocations: next })
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <GripVertical className="h-4 w-4 text-muted-foreground/50 cursor-grab shrink-0" />
        <Input
          value={membership.name}
          onChange={(e) => onChange({ ...membership, name: e.target.value })}
          className="h-7 flex-1 text-xs font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Membership name..."
        />
        <button
          onClick={() => onChange({ ...membership, expanded: !membership.expanded })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", membership.expanded && "rotate-180")} />
        </button>
        <button onClick={onDelete} className="text-rose-500 hover:text-rose-600 transition-colors ml-1">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-5">
        {/* Duration */}
        <FieldRow label="Duration" hint="Set a fixed length or an end date">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              {(["months", "fixed-date"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ ...membership, durationType: type })}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                    membership.durationType === type
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {type === "months" ? "Fixed length" : "End date"}
                </button>
              ))}
            </div>
            {membership.durationType === "months" ? (
              <div className="flex items-center gap-2">
                <Input
                  value={membership.durationValue}
                  onChange={(e) => onChange({ ...membership, durationValue: e.target.value })}
                  placeholder="12"
                  className="h-8 w-20 text-xs"
                />
                <span className="text-xs text-muted-foreground">months</span>
              </div>
            ) : (
              <Input
                type="date"
                value={membership.endDate}
                onChange={(e) => onChange({ ...membership, endDate: e.target.value })}
                className="h-8 w-44 text-xs"
              />
            )}
          </div>
        </FieldRow>

        {/* Membership type */}
        <FieldRow label="Membership type">
          <Select
            value={membership.tier}
            onValueChange={(v) => onChange({ ...membership, tier: v as MembershipTier })}
          >
            <SelectTrigger className="h-8 w-44 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic" className="text-xs">Basic</SelectItem>
              <SelectItem value="premium" className="text-xs">Premium</SelectItem>
            </SelectContent>
          </Select>
        </FieldRow>

        {/* Price */}
        <FieldRow label="Price">
          <div className="relative w-44">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
            <Input
              value={membership.price}
              onChange={(e) => onChange({ ...membership, price: e.target.value })}
              placeholder="0.00"
              className="h-8 pl-6 text-xs w-full"
            />
          </div>
        </FieldRow>

        {/* Available at */}
        <FieldRow label="Available at" hint="Which locations offer this membership">
          <div className="flex flex-wrap gap-2">
            {locations.map((loc) => {
              const active = membership.availableLocations.includes(loc.id)
              return (
                <button
                  key={loc.id}
                  onClick={() => toggleLocation(loc.id)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-xs font-medium transition-all",
                    active
                      ? "bg-card border-foreground text-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {loc.name}
                </button>
              )
            })}
          </div>
        </FieldRow>

        {/* Benefits */}
        <FieldRow label="Benefits" hint="Describe what is included">
          <textarea
            value={membership.benefits}
            onChange={(e) => onChange({ ...membership, benefits: e.target.value })}
            placeholder="e.g. Unlimited court access, priority booking..."
            rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </FieldRow>

        {/* Advanced booking */}
        <FieldRow label="Advance booking bonus" hint="Extra days members can book ahead">
          <div className="flex items-center gap-2">
            <Input
              value={membership.advancedBookingDays}
              onChange={(e) => onChange({ ...membership, advancedBookingDays: e.target.value })}
              placeholder="0"
              className="h-8 w-20 text-xs"
            />
            <span className="text-xs text-muted-foreground">extra days</span>
          </div>
        </FieldRow>

        {/* Discount conditions */}
        <div className="py-5 border-t border-border mt-2">
          <div className="mb-3">
            <p className="text-xs font-semibold text-foreground">Discount conditions</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Add one or more discounts that apply across bookings, private lessons, or activities.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {(membership.discountConditions ?? []).map((cond) => (
              <DiscountConditionCard
                key={cond.id}
                condition={cond}
                onChange={(updated) =>
                  onChange({
                    ...membership,
                    discountConditions: membership.discountConditions.map((c) =>
                      c.id === updated.id ? updated : c
                    ),
                  })
                }
                onDelete={() =>
                  onChange({
                    ...membership,
                    discountConditions: membership.discountConditions.filter((c) => c.id !== cond.id),
                  })
                }
              />
            ))}
            <button
              onClick={() =>
                onChange({
                  ...membership,
                  discountConditions: [...(membership.discountConditions ?? []), newDiscountCondition()],
                })
              }
              className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border py-2.5 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
            >
              <Plus className="h-3 w-3" />
              Add discount condition
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---- Panel ----

export function SetupMembershipsPanel({ locations }: Props) {
  const locationIds = locations.map((l) => l.id)
  const [memberships, setMemberships] = useState<Membership[]>(() => seedMemberships(locationIds))

  function updateMembership(updated: Membership) {
    setMemberships((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
  }

  function deleteMembership(id: string) {
    setMemberships((prev) => prev.filter((x) => x.id !== id))
  }

  function addMembership() {
    setMemberships((prev) => [...prev, newMembership(locationIds)])
  }

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex items-start justify-between px-8 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Membership</h1>
          <p className="text-xs text-muted-foreground mt-1">Membership tiers apply across all locations.</p>
        </div>
        <Button size="sm" className="h-8 text-xs">
          Save Changes
        </Button>
      </div>

      <div className="px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memberships.map((m) =>
            m.expanded ? (
              // Expanded form spans both columns
              <div key={m.id} className="md:col-span-2">
                <MembershipExpandedCard
                  membership={m}
                  locations={locations}
                  onChange={updateMembership}
                  onDelete={() => deleteMembership(m.id)}
                />
              </div>
            ) : (
              <MembershipCollapsedCard
                key={m.id}
                membership={m}
                onEdit={() => updateMembership({ ...m, expanded: true })}
                onDelete={() => deleteMembership(m.id)}
              />
            )
          )}

          {/* Add membership card */}
          <button
            onClick={addMembership}
            className="md:col-span-2 flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add membership
          </button>
        </div>
      </div>
    </div>
  )
}
