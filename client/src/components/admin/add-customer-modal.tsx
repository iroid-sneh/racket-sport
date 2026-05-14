import { useState } from "react"
import { UserPlus } from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { MembershipTier, SportLevel } from "@/lib/customers-data"

// ─── Types ───────────────────────────────────────────────────────────────────

interface AddCustomerModalProps {
  open: boolean
  onClose: () => void
  onAdd?: (customer: NewCustomerData) => void
}

export interface NewCustomerData {
  name: string
  email: string
  phone: string
  membershipTier: MembershipTier
  sport?: string
  sportLevel?: SportLevel
  notes: string
}

const INITIAL_DATA: NewCustomerData = {
  name: "",
  email: "",
  phone: "",
  membershipTier: "none",
  sport: undefined,
  sportLevel: undefined,
  notes: "",
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AddCustomerModal({ open, onClose, onAdd }: AddCustomerModalProps) {
  const [formData, setFormData] = useState<NewCustomerData>(INITIAL_DATA)
  const [errors, setErrors] = useState<Partial<Record<keyof NewCustomerData, string>>>({})

  function handleClose() {
    setFormData(INITIAL_DATA)
    setErrors({})
    onClose()
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof NewCustomerData, string>> = {}
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    onAdd?.(formData)
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 gap-0">
        <DialogHeader className="px-5 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
              <UserPlus className="h-4 w-4 text-foreground" />
            </div>
            <DialogTitle className="text-base font-semibold">Add Customer</DialogTitle>
          </div>
          <DialogDescription className="sr-only">
            Add a new customer to the system with their contact details and membership information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Basic details */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Details
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">Full Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Smith"
                  className={cn("h-9 text-xs", errors.name && "border-destructive")}
                />
                {errors.name && <p className="text-[10px] text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className={cn("h-9 text-xs", errors.email && "border-destructive")}
                />
                {errors.email && <p className="text-[10px] text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Phone *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+44 7700 900000"
                  className={cn("h-9 text-xs", errors.phone && "border-destructive")}
                />
                {errors.phone && <p className="text-[10px] text-destructive">{errors.phone}</p>}
              </div>
            </div>

            {/* Membership */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Membership
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { tier: "none" as const, label: "None" },
                  { tier: "basic" as const, label: "Basic" },
                  { tier: "premium" as const, label: "Premium" },
                  { tier: "vip" as const, label: "VIP" },
                ].map(({ tier, label }) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setFormData({ ...formData, membershipTier: tier })}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border p-3 transition-all",
                      formData.membershipTier === tier
                        ? "border-foreground bg-foreground/5"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    <span className="text-[11px] font-medium text-foreground">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sport (optional) */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Primary Sport (Optional)
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Sport</Label>
                  <Select
                    value={formData.sport ?? ""}
                    onValueChange={(v) => setFormData({ ...formData, sport: v || undefined })}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select sport..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tennis">Tennis</SelectItem>
                      <SelectItem value="Padel">Padel</SelectItem>
                      <SelectItem value="Pickleball">Pickleball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Level</Label>
                  <Select
                    value={formData.sportLevel ?? ""}
                    onValueChange={(v) => setFormData({ ...formData, sportLevel: (v || undefined) as SportLevel | undefined })}
                    disabled={!formData.sport}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Select level..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="improver">Improver</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-xs">Notes (Optional)</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about this customer..."
                className="text-xs min-h-[60px] resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-muted/30">
            <Button type="button" variant="outline" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
