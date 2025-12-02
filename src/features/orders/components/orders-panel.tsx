"use client"

import { Suspense } from "react"
import { useQueryState } from "nuqs"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarTrigger,
  useSidebar,
} from "@/components/layouts/sidebar/sidebar"
import { PanelSkeleton } from "@/components/layouts/sidebar/panel-skeleton"
import { Switch } from "@/components/ui/switch"
import type { Order } from "@/lib/sample-data"

const statusColors: Record<Order["status"], string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  shipped: "bg-purple-500/10 text-purple-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-600",
}

type OrdersPanelProps = {
  orders: Order[]
}

export function OrdersPanel({ orders }: OrdersPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <OrdersPanelContent orders={orders} />
    </Suspense>
  )
}

function OrdersPanelContent({ orders }: OrdersPanelProps) {
  const { setOpenMobile, isMobile } = useSidebar()
  const [selectedId, setSelectedId] = useQueryState("id")

  const handleItemClick = (order: Order) => {
    setSelectedId(order.id)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="none" className="flex flex-1">
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && <SidebarTrigger className="-ml-1" />}
            <div className="text-foreground text-base font-medium">Orders</div>
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Pending</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Search orders..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => handleItemClick(order)}
                className={cn(
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap text-left last:border-b-0",
                  selectedId === order.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <div className="flex w-full items-center gap-2">
                  <span className="font-medium">{order.customer}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{order.date}</span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <span className="text-xs text-muted-foreground">{order.id}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  ${order.total.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({order.items} item{order.items > 1 ? "s" : ""})
                  </span>
                </span>
              </button>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
