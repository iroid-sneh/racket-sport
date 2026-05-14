import { useState, useEffect, useRef } from "react"
import { cn, generateId } from "@/lib/utils"
import { Plus, Trash2, ChevronDown, Users, GripVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Location } from "@/pages/SetupPage"
import type { WeekHours, CoachRef } from "@/lib/setup-types"
import { DAYS_KEY, FULL_DAYS, defaultWeekHours } from "@/lib/setup-types"

interface Props {
  location: Location
  onCoachesChange: (coaches: CoachRef[]) => void
}

type Role = "Coach" | "Manager" | "Staff"
const ROLES: Role[] = ["Coach", "Manager", "Staff"]

const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Coach:   "Can view and manage Calendar, Chats and Notifications.",
  Manager: "Full access to all features.",
  Staff:   "Can view and manage all features except Admin Settings.",
}

// ---- Pricing variant ----

interface PriceVariant {
  id: string
  players: number
  price: string
}

function defaultPricingVariants(): PriceVariant[] {
  return [
    { id: generateId(), players: 1, price: "" },
    { id: generateId(), players: 2, price: "" },
    { id: generateId(), players: 3, price: "" },
    { id: generateId(), players: 4, price: "" },
  ]
}

// ---- Staff member ----

interface StaffMember {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  profilePicture: string
  sports: string[]
  availableHours: WeekHours
  differentHours: boolean
  priceVariants: PriceVariant[]
  expanded: boolean
}

function newStaff(): StaffMember {
  return {
    id: generateId(),
    name: "",
    email: "",
    phone: "",
    role: "Staff",
    profilePicture: "",
    sports: [],
    availableHours: defaultWeekHours(),
    differentHours: false,
    priceVariants: [],
    expanded: true,
  }
}

// ---- Shared UI ----

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
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

function RoleChip({ role }: { role: Role }) {
  const colours: Record<Role, string> = {
    Coach:   "bg-emerald-50 text-emerald-700",
    Manager: "bg-rose-50 text-rose-700",
    Staff:   "bg-sky-50 text-sky-700",
  }
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold shrink-0", colours[role])}>
      {role}
    </span>
  )
}

// ---- Available hours editor ----

function AvailableHoursEditor({
  hours,
  different,
  onChangeHours,
  onChangeDifferent,
}: {
  hours: WeekHours
  different: boolean
  onChangeHours: (h: WeekHours) => void
  onChangeDifferent: (v: boolean) => void
}) {
  const setUniformTime = (field: "from" | "to", val: string) => {
    const next = { ...hours }
    DAYS_KEY.forEach((d) => { next[d] = { ...next[d], [field]: val } })
    onChangeHours(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <Toggle2 checked={different} onChange={onChangeDifferent} />
        <span className="text-xs text-muted-foreground">Different every day</span>
      </div>

      {!different ? (
        <div className="flex items-center gap-2">
          <Input
            type="time"
            value={hours["Mon"].from}
            onChange={(e) => setUniformTime("from", e.target.value)}
            className="h-8 w-28 text-xs"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="time"
            value={hours["Mon"].to}
            onChange={(e) => setUniformTime("to", e.target.value)}
            className="h-8 w-28 text-xs"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {DAYS_KEY.map((key, i) => {
            const h = hours[key]
            return (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={h.open}
                  onChange={(e) => onChangeHours({ ...hours, [key]: { ...h, open: e.target.checked } })}
                  className="h-3.5 w-3.5 rounded border-border accent-foreground cursor-pointer shrink-0"
                />
                <span className={cn("text-xs font-medium w-20 shrink-0", h.open ? "text-foreground" : "text-muted-foreground")}>
                  {FULL_DAYS[i]}
                </span>
                {h.open ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={h.from}
                      onChange={(e) => onChangeHours({ ...hours, [key]: { ...h, from: e.target.value } })}
                      className="h-7 w-24 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={h.to}
                      onChange={(e) => onChangeHours({ ...hours, [key]: { ...h, to: e.target.value } })}
                      className="h-7 w-24 text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">Not available</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ---- Pricing variants ----

function PricingVariantsEditor({
  variants,
  onChange,
}: {
  variants: PriceVariant[]
  onChange: (v: PriceVariant[]) => void
}) {
  if (variants.length === 0) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">No pricing variants added yet.</p>
        <button
          onClick={() => onChange(defaultPricingVariants())}
          className="flex items-center gap-1 text-xs font-medium text-foreground hover:text-foreground/80 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add variant
        </button>
      </div>
    )
  }

  function playerLabel(n: number) {
    return n === 1 ? "Price for a player" : `Price for ${n} player`
  }

  return (
    <div className="flex flex-col gap-2">
      {variants.map((variant) => (
        <div key={variant.id} className="flex items-center gap-3">
          <div className="relative w-24">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">£</span>
            <Input
              value={variant.price}
              onChange={(e) =>
                onChange(variants.map((v) => v.id === variant.id ? { ...v, price: e.target.value } : v))
              }
              placeholder="00.00"
              className="h-8 pl-6 text-xs"
            />
          </div>
          <span className="text-xs text-muted-foreground">{playerLabel(variant.players)}</span>
        </div>
      ))}
    </div>
  )
}

// ---- Staff card ----

function StaffCard({
  member,
  location,
  onChange,
  onDelete,
}: {
  member: StaffMember
  location: Location
  onChange: (m: StaffMember) => void
  onDelete: () => void
}) {
  const isCoach = member.role === "Coach"
  const locationSports = location.sports
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!member.expanded) {
    return (
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <button
          onClick={() => onChange({ ...member, expanded: true })}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-muted/30 transition-colors"
        >
          <span className="flex-1 text-sm font-semibold text-foreground">{member.name || "Unnamed staff"}</span>
          <RoleChip role={member.role} />
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            className="text-rose-500 hover:text-rose-600 transition-colors"
            aria-label="Delete staff member"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </span>
        </button>
      </div>
    )
  }

  // Expanded view
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <GripVertical className="h-4 w-4 text-muted-foreground/40 cursor-grab shrink-0" />
        {member.name ? (
          <>
            <span className="text-sm font-semibold text-foreground flex-1">{member.name}</span>
            <RoleChip role={member.role} />
          </>
        ) : (
          <Input
            value={member.name}
            onChange={(e) => onChange({ ...member, name: e.target.value })}
            placeholder="Full name..."
            className="h-7 flex-1 text-xs font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        )}
        <button
          onClick={() => onChange({ ...member, expanded: false })}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Collapse"
        >
          <ChevronDown className="h-3.5 w-3.5 rotate-180" />
        </button>
        <button
          onClick={onDelete}
          className="text-rose-500 hover:text-rose-600 transition-colors"
          aria-label="Delete staff member"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="px-5">
        {/* Name (only if not in header) */}
        {member.name && (
          <FieldRow label="Name">
            <Input
              value={member.name}
              onChange={(e) => onChange({ ...member, name: e.target.value })}
              placeholder="Full name"
              className="h-8 text-xs w-full"
            />
          </FieldRow>
        )}

        {/* Email */}
        <FieldRow label="Email">
          <Input
            type="email"
            value={member.email}
            onChange={(e) => onChange({ ...member, email: e.target.value })}
            placeholder="email@example.com"
            className="h-8 text-xs w-full"
          />
        </FieldRow>

        {/* Coach-only: Profile picture */}
        {isCoach && (
          <FieldRow
            label="Profile picture"
            hint="Required for coaches — shown to players in the app"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                {member.profilePicture ? (
                  <img src={member.profilePicture} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-muted-foreground/60 select-none">
                    {member.name ? member.name.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = (ev) => onChange({ ...member, profilePicture: ev.target?.result as string })
                  reader.readAsDataURL(file)
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-foreground hover:underline"
              >
                Upload photo
              </button>
            </div>
          </FieldRow>
        )}

        {/* Role */}
        <FieldRow
          label="Role"
          hint={isCoach ? "Determines permissions in the admin panel" : ROLE_DESCRIPTIONS[member.role]}
        >
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => onChange({ ...member, role: r })}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                  member.role === r
                    ? "bg-foreground text-background border-foreground"
                    : "border-border text-foreground hover:bg-secondary/50"
                )}
              >
                {r === "Manager" ? "Club Admin" : r}
              </button>
            ))}
          </div>
        </FieldRow>

        {/* Phone */}
        <FieldRow label="Phone number">
          <Input
            type="tel"
            value={member.phone}
            onChange={(e) => onChange({ ...member, phone: e.target.value })}
            placeholder="07700 900123"
            className="h-8 text-xs w-full"
          />
        </FieldRow>

        {/* Coach-only fields */}
        {isCoach && (
          <>
            {/* Sports */}
            <FieldRow label="Sport(s)" hint="Sports this coach leads">
              {locationSports.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No sports configured for this location.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {locationSports.map((sport) => {
                    const active = member.sports.includes(sport.id)
                    return (
                      <button
                        key={sport.id}
                        onClick={() =>
                          onChange({
                            ...member,
                            sports: active
                              ? member.sports.filter((s) => s !== sport.id)
                              : [...member.sports, sport.id],
                          })
                        }
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
                          active
                            ? "bg-foreground text-background border-foreground"
                            : "border-border text-foreground hover:bg-secondary/50"
                        )}
                      >
                        {sport.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </FieldRow>

            {/* Available hours */}
            <FieldRow label="Available hours" hint="Default weekly availability">
              <AvailableHoursEditor
                hours={member.availableHours}
                different={member.differentHours}
                onChangeHours={(h) => onChange({ ...member, availableHours: h })}
                onChangeDifferent={(v) => onChange({ ...member, differentHours: v })}
              />
            </FieldRow>

            {/* Pricing variants */}
            <FieldRow label="Pricing variants" hint="Rates by duration and player count">
              <PricingVariantsEditor
                variants={member.priceVariants}
                onChange={(v) => onChange({ ...member, priceVariants: v })}
              />
            </FieldRow>
          </>
        )}
      </div>
    </div>
  )
}

// ---- Mock data ----

const MOCK_STAFF: StaffMember[] = [
  {
    id: "coach-1",
    name: "Jamie Reid",
    email: "jamie.reid@opencourt.com",
    phone: "07700 900001",
    role: "Coach",
    profilePicture: "",
    sports: ["padel", "pickleball"],
    availableHours: defaultWeekHours(),
    differentHours: false,
    priceVariants: [],
    expanded: false,
  },
  {
    id: "coach-2",
    name: "Sofia Martins",
    email: "sofia.martins@opencourt.com",
    phone: "07700 900002",
    role: "Coach",
    profilePicture: "",
    sports: ["padel"],
    availableHours: defaultWeekHours(),
    differentHours: false,
    priceVariants: [],
    expanded: false,
  },
  {
    id: "staff-1",
    name: "Marcus Webb",
    email: "marcus.webb@opencourt.com",
    phone: "07700 900003",
    role: "Manager",
    profilePicture: "",
    sports: [],
    availableHours: defaultWeekHours(),
    differentHours: false,
    priceVariants: [],
    expanded: false,
  },
]

// ---- Panel ----

export function SetupStaffPanel({ location, onCoachesChange }: Props) {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF)

  useEffect(() => {
    const coaches: CoachRef[] = staff
      .filter((m) => m.role === "Coach")
      .map((m) => ({ id: m.id, name: m.name }))
    onCoachesChange(coaches)
  }, [staff, onCoachesChange])

  function updateStaff(updater: (prev: StaffMember[]) => StaffMember[]) {
    setStaff((prev) => updater(prev))
  }

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex items-start justify-between px-8 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Staff</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Coaches and admins can be assigned across multiple locations.
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs">
          Save Changes
        </Button>
      </div>

      <div className="px-8 pb-10 max-w-2xl">
        <div className="flex flex-col gap-3">
          {staff.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-12 text-center">
              <Users className="h-7 w-7 text-muted-foreground/40 mb-2" />
              <p className="text-sm font-semibold text-foreground">No staff added yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add coaches, admins, and staff members for your club.
              </p>
            </div>
          )}

          {staff.map((member) => (
            <StaffCard
              key={member.id}
              member={member}
              location={location}
              onChange={(updated) => updateStaff((prev) => prev.map((m) => m.id === updated.id ? updated : m))}
              onDelete={() => updateStaff((prev) => prev.filter((m) => m.id !== member.id))}
            />
          ))}

          <button
            onClick={() => updateStaff((prev) => [...prev, newStaff()])}
            className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-xs font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add staff member
          </button>
        </div>
      </div>
    </div>
  )
}
