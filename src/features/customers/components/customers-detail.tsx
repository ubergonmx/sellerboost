"use client"

import { Suspense } from "react"
import { useQueryState } from "nuqs"
import { Users, Building2, Mail, ShoppingBag, DollarSign } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Customer } from "@/lib/sample-data"
import { DetailSkeleton } from "@/components/layouts/sidebar/detail-skeleton"

const statusColors: Record<Customer["status"], string> = {
  active: "bg-green-500/10 text-green-600",
  inactive: "bg-gray-500/10 text-gray-600",
}

type CustomersDetailProps = {
  customers: Customer[]
}

export function CustomersDetail({ customers }: CustomersDetailProps) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <CustomersDetailContent customers={customers} />
    </Suspense>
  )
}

function CustomersDetailContent({ customers }: CustomersDetailProps) {
  const [selectedId] = useQueryState("id")

  const customer = selectedId ? customers.find((c) => c.id === selectedId) : null

  if (!customer) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <Users className="size-12" />
        <p className="text-lg">Select a customer to view details</p>
      </div>
    )
  }

  const initials = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-1 flex-col">
      {/* Customer Header */}
      <div className="border-b p-6">
        <div className="flex items-start gap-4">
          <Avatar className="size-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{customer.name}</h2>
              <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusColors[customer.status]}`}>
                {customer.status}
              </span>
            </div>
            <p className="text-muted-foreground">{customer.id}</p>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span className="text-sm">{customer.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="size-4 text-muted-foreground" />
                <span className="text-sm">{customer.company}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-blue-500/10 p-2">
                  <ShoppingBag className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{customer.totalOrders}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-green-500/10 p-2">
                  <DollarSign className="size-4 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${customer.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="mt-6 rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Recent Activity</h3>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
                <div className="size-2 rounded-full bg-primary" />
                <div className="flex-1">
                  <p className="text-sm">Order #{1000 + i} placed</p>
                  <p className="text-xs text-muted-foreground">{i} day{i > 1 ? "s" : ""} ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Customer Actions */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Send Email
          </button>
          <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            View Orders
          </button>
        </div>
      </div>
    </div>
  )
}
