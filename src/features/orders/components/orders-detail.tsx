"use client"

import { Suspense } from "react"
import { useQueryState } from "nuqs"
import { ShoppingCart, Package } from "lucide-react"

import { Separator } from "@/components/ui/separator"
import type { Order } from "@/lib/sample-data"
import { DetailSkeleton } from "@/components/layouts/sidebar/detail-skeleton"

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  shipped: "bg-purple-500/10 text-purple-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-600",
}

type OrdersDetailProps = {
  orders: Order[]
}

export function OrdersDetail({ orders }: OrdersDetailProps) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <OrdersDetailContent orders={orders} />
    </Suspense>
  )
}

function OrdersDetailContent({ orders }: OrdersDetailProps) {
  const [selectedId] = useQueryState("id")

  const order = selectedId ? orders.find((o) => o.id === selectedId) : null

  if (!order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <ShoppingCart className="size-12" />
        <p className="text-lg">Select an order to view details</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Order Header */}
      <div className="border-b p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">{order.id}</h2>
            <p className="text-muted-foreground">{order.customer}</p>
            <p className="text-sm text-muted-foreground">{order.email}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium capitalize ${statusColors[order.status]}`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Order Details */}
      <div className="flex-1 p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span>{order.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items</span>
                <span>{order.items}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span>{order.customer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{order.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Placeholder for order items */}
        <div className="mt-6 rounded-lg border p-4">
          <h3 className="mb-3 font-semibold">Order Items</h3>
          <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3">
            <Package className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">Sample Product</p>
              <p className="text-sm text-muted-foreground">Quantity: {order.items}</p>
            </div>
            <span className="ml-auto font-medium">${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Order Actions */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Update Status
          </button>
          <button className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent">
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  )
}
