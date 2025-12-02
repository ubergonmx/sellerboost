"use client"

import { Suspense } from "react"
import { useQueryState } from "nuqs"
import { FileText, Calendar, Building2, Mail } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import type { Invoice } from "@/lib/sample-data"
import { DetailSkeleton } from "@/components/layouts/sidebar/detail-skeleton"

const statusColors: Record<Invoice["status"], string> = {
  draft: "bg-gray-500/10 text-gray-600",
  pending: "bg-yellow-500/10 text-yellow-600",
  paid: "bg-green-500/10 text-green-600",
  overdue: "bg-red-500/10 text-red-600",
}

type InvoicesDetailProps = {
  invoices: Invoice[]
}

export function InvoicesDetail({ invoices }: InvoicesDetailProps) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <InvoicesDetailContent invoices={invoices} />
    </Suspense>
  )
}

function InvoicesDetailContent({ invoices }: InvoicesDetailProps) {
  const [selectedId] = useQueryState("id")

  const invoice = selectedId ? invoices.find((i) => i.id === selectedId) : null

  if (!invoice) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <FileText className="size-12" />
        <p className="text-lg">Select an invoice to view details</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Invoice Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="size-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold">{invoice.id}</h2>
            </div>
            <p className="text-muted-foreground">{invoice.customer}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusColors[invoice.status]}`}>
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Invoice Details</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Issued Date</p>
                  <p className="text-sm">{invoice.issuedDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="size-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="text-sm">{invoice.dueDate}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Bill To</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="text-sm">{invoice.customer}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm">{invoice.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Summary */}
        <div className="mt-6 rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${(invoice.amount * 0.9).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (10%)</span>
              <span>${(invoice.amount * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>${invoice.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Actions */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          {(invoice.status === "pending" || invoice.status === "overdue") && (
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Mark as Paid
            </button>
          )}
          <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Download PDF
          </button>
          <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Send Reminder
          </button>
        </div>
      </div>
    </div>
  )
}
