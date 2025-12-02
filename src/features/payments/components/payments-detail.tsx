"use client"

import { Suspense } from "react"
import { useQueryState } from "nuqs"
import { CreditCard, Landmark, CircleDollarSign, Building2, Mail, Calendar } from "lucide-react"

import type { Payment } from "@/lib/sample-data"
import { DetailSkeleton } from "@/components/layouts/sidebar/detail-skeleton"

const statusColors: Record<Payment["status"], string> = {
  completed: "bg-green-500/10 text-green-600",
  pending: "bg-yellow-500/10 text-yellow-600",
  failed: "bg-red-500/10 text-red-600",
  refunded: "bg-purple-500/10 text-purple-600",
}

const methodIcons: Record<Payment["method"], typeof CreditCard> = {
  card: CreditCard,
  bank: Landmark,
  paypal: CircleDollarSign,
}

type PaymentsDetailProps = {
  payments: Payment[]
}

export function PaymentsDetail({ payments }: PaymentsDetailProps) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <PaymentsDetailContent payments={payments} />
    </Suspense>
  )
}

function PaymentsDetailContent({ payments }: PaymentsDetailProps) {
  const [selectedId] = useQueryState("id")

  const payment = selectedId ? payments.find((p) => p.id === selectedId) : null

  if (!payment) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <CreditCard className="size-12" />
        <p className="text-lg">Select a payment to view details</p>
      </div>
    )
  }

  const MethodIcon = methodIcons[payment.method]

  return (
    <div className="flex flex-1 flex-col">
      {/* Payment Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary/10 p-2">
                <MethodIcon className="size-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">{payment.id}</h2>
            </div>
            <p className="text-muted-foreground">{payment.customer}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusColors[payment.status]}`}>
            {payment.status}
          </span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Payment Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MethodIcon className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm capitalize">{payment.method}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm">{payment.date}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="text-sm">{payment.customer}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm">{payment.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount */}
        <div className="mt-6 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="text-3xl font-bold">${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div className={`rounded-full p-4 ${statusColors[payment.status].replace("text-", "bg-").replace("/10", "/20")}`}>
              {payment.status === "completed" && <CircleDollarSign className="size-8 text-green-600" />}
              {payment.status === "pending" && <CircleDollarSign className="size-8 text-yellow-600" />}
              {payment.status === "failed" && <CircleDollarSign className="size-8 text-red-600" />}
              {payment.status === "refunded" && <CircleDollarSign className="size-8 text-purple-600" />}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Actions */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          {payment.status === "completed" && (
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Issue Refund
            </button>
          )}
          {(payment.status === "pending" || payment.status === "failed") && (
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Retry Payment
            </button>
          )}
          <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Download Receipt
          </button>
          <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Send to Customer
          </button>
        </div>
      </div>
    </div>
  )
}
