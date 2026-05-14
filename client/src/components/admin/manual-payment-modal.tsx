import { useState } from "react"
import { X, ChevronDown, Check, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/lib/payments-data"

// ─── Types ────────────────────────────────────────────────────────────────────

interface ManualPaymentModalProps {
  open: boolean
  onClose: () => void
  onSubmit?: (data: ManualPaymentData) => void
}

export interface ManualPaymentData {
  description: string
  customerName: string
  customerEmail: string
  amount: string // raw string, e.g. "12.50"
  paymentMethod: PaymentMethod
  notes: string
}

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "card", label: "Card" },
  { value: "cash", label: "Cash" },
  { value: "club_credit", label: "Club Credit" },
]

const QUICK_ITEMS = [
  { label: "Grip Replacement", amount: "8.00" },
  { label: "Racket Stringing", amount: "18.00" },
  { label: "Ball Can (3-pack)", amount: "5.00" },
  { label: "Towel Hire", amount: "2.50" },
  { label: "Locker Rental", amount: "3.00" },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function ManualPaymentModal({ open, onClose, onSubmit }: ManualPaymentModalProps) {
  const [form, setForm] = useState<ManualPaymentData>({
    description: "",
    customerName: "",
    customerEmail: "",
    amount: "",
    paymentMethod: "card",
    notes: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ManualPaymentData, string>>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!open) return null

  function set<K extends keyof ManualPaymentData>(key: K, value: ManualPaymentData[K]) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function applyQuickItem(item: { label: string; amount: string }) {
    setForm((f) => ({ ...f, description: item.label, amount: item.amount }))
    setErrors((e) => ({ ...e, description: undefined, amount: undefined }))
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ManualPaymentData, string>> = {}
    if (!form.description.trim()) newErrors.description = "Description is required"
    if (!form.customerName.trim()) newErrors.customerName = "Customer name is required"
    if (!form.amount.trim()) {
      newErrors.amount = "Amount is required"
    } else if (isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) {
      newErrors.amount = "Enter a valid amount"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    setSubmitted(true)
    onSubmit?.(form)
  }

  function handleClose() {
    setForm({
      description: "",
      customerName: "",
      customerEmail: "",
      amount: "",
      paymentMethod: "card",
      notes: "",
    })
    setErrors({})
    setSubmitted(false)
    onClose()
  }

  const selectedMethod = METHOD_OPTIONS.find((m) => m.value === form.paymentMethod)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-payment-title"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-card shadow-2xl border-l border-border"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 id="manual-payment-title" className="text-sm font-semibold text-foreground">
              Add Manual Payment
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Record an ad-hoc sale such as equipment or services
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {submitted ? (
          // ─── Success state ───────────────────────────────────────────────
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Payment recorded</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {form.description} — £{parseFloat(form.amount).toFixed(2)} via {selectedMethod?.label}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setSubmitted(false); setForm({ description: "", customerName: "", customerEmail: "", amount: "", paymentMethod: "card", notes: "" }) }}>
                Add another
              </Button>
              <Button size="sm" onClick={handleClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Quick items */}
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Quick items
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_ITEMS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => applyQuickItem(item)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                        form.description === item.label
                          ? "border-foreground/30 bg-secondary text-foreground"
                          : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/40"
                      )}
                    >
                      {item.label}
                      <span className="ml-1.5 text-muted-foreground">£{item.amount}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="mp-description" className="text-xs font-medium">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mp-description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="e.g. Grip replacement, towel hire..."
                  className={cn("h-9 text-sm", errors.description && "border-destructive")}
                />
                {errors.description && (
                  <p className="text-[11px] text-destructive">{errors.description}</p>
                )}
              </div>

              {/* Customer */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mp-customer-name" className="text-xs font-medium">
                    Customer name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mp-customer-name"
                    value={form.customerName}
                    onChange={(e) => set("customerName", e.target.value)}
                    placeholder="Full name"
                    className={cn("h-9 text-sm", errors.customerName && "border-destructive")}
                  />
                  {errors.customerName && (
                    <p className="text-[11px] text-destructive">{errors.customerName}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mp-customer-email" className="text-xs font-medium">
                    Email
                  </Label>
                  <Input
                    id="mp-customer-email"
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => set("customerEmail", e.target.value)}
                    placeholder="Optional"
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Amount + Method */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="mp-amount" className="text-xs font-medium">
                    Amount (£) <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                      £
                    </span>
                    <Input
                      id="mp-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => set("amount", e.target.value)}
                      placeholder="0.00"
                      className={cn("h-9 pl-7 text-sm", errors.amount && "border-destructive")}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-[11px] text-destructive">{errors.amount}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Payment method</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 w-full justify-between text-sm font-normal border-border"
                      >
                        {selectedMethod?.label}
                        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-44">
                      {METHOD_OPTIONS.map((opt) => (
                        <DropdownMenuItem
                          key={opt.value}
                          onClick={() => set("paymentMethod", opt.value)}
                          className="flex items-center justify-between text-sm"
                        >
                          {opt.label}
                          {form.paymentMethod === opt.value && <Check className="h-3.5 w-3.5" />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="mp-notes" className="text-xs font-medium">
                  Notes
                </Label>
                <textarea
                  id="mp-notes"
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                  placeholder="Any additional details..."
                  rows={3}
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4">
              <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Record payment
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
