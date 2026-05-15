import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Location } from "@/pages/SetupPage"
import type { WeekHours } from "@/lib/setup-types"
import { DAYS_KEY, FULL_DAYS, defaultWeekHours } from "@/lib/setup-types"

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

function TimeRange({ from, to, onFromChange, onToChange }: {
  from: string; to: string
  onFromChange: (v: string) => void; onToChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Input type="time" value={from} onChange={(e) => onFromChange(e.target.value)} className="h-7 w-24 text-xs px-2" />
      <span className="text-[11px] text-muted-foreground">to</span>
      <Input type="time" value={to} onChange={(e) => onToChange(e.target.value)} className="h-7 w-24 text-xs px-2" />
    </div>
  )
}

function OperatingHoursEditor({ hours, onChange }: { hours: WeekHours; onChange: (h: WeekHours) => void }) {
  const [differentEachDay, setDifferentEachDay] = useState(false)
  const defaultFrom = hours["Mon"].from
  const defaultTo   = hours["Mon"].to

  const setUniformTime = (field: "from" | "to", val: string) => {
    const next = { ...hours }
    DAYS_KEY.forEach((d) => { next[d] = { ...next[d], [field]: val } })
    onChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Toggle2 checked={differentEachDay} onChange={setDifferentEachDay} />
        <span className="text-xs text-muted-foreground">Different every day</span>
      </div>
      {!differentEachDay ? (
        <TimeRange
          from={defaultFrom} to={defaultTo}
          onFromChange={(v) => setUniformTime("from", v)}
          onToChange={(v) => setUniformTime("to", v)}
        />
      ) : (
        <div className="flex flex-col gap-1.5">
          {DAYS_KEY.map((key, i) => {
            const h = hours[key]
            return (
              <div key={key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={h.open}
                  onChange={(e) => onChange({ ...hours, [key]: { ...h, open: e.target.checked } })}
                  className="h-3.5 w-3.5 rounded border-border accent-primary cursor-pointer shrink-0"
                />
                <span className={cn("text-xs font-medium w-20 shrink-0", h.open ? "text-foreground" : "text-muted-foreground")}>
                  {FULL_DAYS[i]}
                </span>
                {h.open ? (
                  <TimeRange
                    from={h.from} to={h.to}
                    onFromChange={(v) => onChange({ ...hours, [key]: { ...h, from: v } })}
                    onToChange={(v) => onChange({ ...hours, [key]: { ...h, to: v } })}
                  />
                ) : (
                  <span className="text-[11px] text-muted-foreground italic">Closed</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

interface Props {
  location: Location
}

interface SettingsState {
  maxActiveBookings: string
  advancedBookingDays: string
  cancellationHours: string
  activityAutoCancelHours: string
  openMatchAutoCancelHours: string
  openMatchCreateBeforeHours: string
  nearlyFullProtectionHours: string
  developingProtectionHours: string
}

function defaultSettings(): SettingsState {
  return {
    maxActiveBookings: "5",
    advancedBookingDays: "14",
    cancellationHours: "24",
    activityAutoCancelHours: "2",
    openMatchAutoCancelHours: "1",
    openMatchCreateBeforeHours: "2",
    nearlyFullProtectionHours: "2",
    developingProtectionHours: "12",
  }
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 py-4 border-b border-border last:border-0">
      <div className="min-w-0 shrink-0 w-64">
        <Label className="text-xs font-semibold text-foreground">{label}</Label>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{hint}</p>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pt-6 pb-1">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
  )
}

function InlineNum({
  value,
  onChange,
  width = "w-20",
  suffix,
  min = "0",
}: {
  value: string
  onChange: (v: string) => void
  width?: string
  suffix?: string
  min?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-8 text-xs", width)}
      />
      {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
    </div>
  )
}

export function SetupSettingsPanel({ location }: Props) {
  const [s, setS] = useState<SettingsState>(defaultSettings)
  const [operatingHours, setOperatingHours] = useState<WeekHours>(defaultWeekHours)

  function update(patch: Partial<SettingsState>) {
    setS((prev) => ({ ...prev, ...patch }))
  }

  return (
    <div className="flex flex-col">
      {/* Page header */}
      <div className="flex items-start justify-between px-8 pt-6 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Booking Settings</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure booking rules and cancellation policies
          </p>
        </div>
        <Button size="sm" className="h-8 text-xs">
          Save Changes
        </Button>
      </div>

      <div className="px-8 pb-10">
        <div className="max-w-2xl">

          {/* ---- Operating Hours ---- */}
          <SectionHeader
            title="Operating Hours"
            description="When the location is open for bookings. Applies to all courts unless manually blocked."
          />
          <div className="rounded-xl border border-border bg-card px-4 py-4">
            <OperatingHoursEditor hours={operatingHours} onChange={setOperatingHours} />
          </div>

          {/* ---- General ---- */}
          <SectionHeader
            title="General"
            description="Global booking rules that apply across all courts and sports."
          />
          <div className="rounded-xl border border-border bg-card px-4">
            <FieldRow
              label="Max active bookings"
              hint="Maximum number of upcoming bookings a customer can hold at once"
            >
              <InlineNum value={s.maxActiveBookings} onChange={(v) => update({ maxActiveBookings: v })} suffix="bookings" />
            </FieldRow>

            <FieldRow
              label="Advance booking window"
              hint="How far ahead customers can see and book on the mobile app"
            >
              <InlineNum value={s.advancedBookingDays} onChange={(v) => update({ advancedBookingDays: v })} suffix="days" />
            </FieldRow>

            <FieldRow
              label="Cancellation policy"
              hint="Customers can cancel up to X hours before start for a full refund"
            >
              <InlineNum value={s.cancellationHours} onChange={(v) => update({ cancellationHours: v })} suffix="hours before start" />
            </FieldRow>
          </div>

          {/* ---- Activities ---- */}
          <SectionHeader
            title="Activities"
            description="Auto-cancel rules for group sessions and clinics."
          />
          <div className="rounded-xl border border-border bg-card px-4">
            <FieldRow
              label="Auto-cancel threshold"
              hint="Cancel the activity if fewer than the minimum players have joined, X hours before it starts"
            >
              <InlineNum
                value={s.activityAutoCancelHours}
                onChange={(v) => update({ activityAutoCancelHours: v })}
                suffix="hours before"
              />
            </FieldRow>
          </div>

          {/* ---- Open Matches ---- */}
          <SectionHeader
            title="Open Matches"
            description="Rules governing how open match sessions are created and managed."
          />
          <div className="rounded-xl border border-border bg-card px-4">
            <FieldRow
              label="Creation window"
              hint="Open matches must be created at least X hours before the booking starts"
            >
              <InlineNum
                value={s.openMatchCreateBeforeHours}
                onChange={(v) => update({ openMatchCreateBeforeHours: v })}
                suffix="hours before start"
              />
            </FieldRow>

            <FieldRow
              label="Match Protection Policy"
              hint="To maximise court occupancy, the system prioritises matches based on how close they are to being full."
            >
              <div className="flex flex-col gap-3">
                {/* Developing */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">Developing</p>
                    <p className="text-[11px] text-muted-foreground">Needs 2+ more players</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-muted-foreground">Protected until</span>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min="0"
                        value={s.developingProtectionHours}
                        onChange={(e) => update({ developingProtectionHours: e.target.value })}
                        className="h-8 w-14 text-xs text-foreground text-center"
                      />
                      <span className="text-[11px] text-muted-foreground">hrs before</span>
                    </div>
                  </div>
                </div>
                {/* Nearly Full */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground">Nearly Full</p>
                    <p className="text-[11px] text-muted-foreground">Needs 1 more player</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[11px] text-muted-foreground">Protected until</span>
                    <div className="flex items-center gap-1.5">
                      <Input
                        type="number"
                        min="0"
                        value={s.nearlyFullProtectionHours}
                        onChange={(e) => update({ nearlyFullProtectionHours: e.target.value })}
                        className="h-8 w-14 text-xs text-foreground text-center"
                      />
                      <span className="text-[11px] text-muted-foreground">hrs before</span>
                    </div>
                  </div>
                </div>
                {/* Unprotected note */}
                <p className="text-[11px] text-muted-foreground leading-snug border-t border-border pt-3">
                  If a match fails to reach these thresholds, the court is released to the public calendar. Any regular booking made during this time will automatically cancel the Open Match and trigger instant player refunds.
                </p>
              </div>
            </FieldRow>

            <FieldRow
              label="Auto-cancel threshold"
              hint="Cancel the match if the required number of players isn't met (4 players for doubles and 2 players for singles), X hours before it starts"
            >
              <InlineNum
                value={s.openMatchAutoCancelHours}
                onChange={(v) => update({ openMatchAutoCancelHours: v })}
                suffix="hours before"
              />
            </FieldRow>
          </div>

          <div className="h-8" />
        </div>
      </div>
    </div>
  )
}
