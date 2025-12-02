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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { Customer } from "@/lib/sample-data"

const statusColors: Record<Customer["status"], string> = {
  active: "bg-green-500/10 text-green-600",
  inactive: "bg-gray-500/10 text-gray-600",
}

type CustomersPanelProps = {
  customers: Customer[]
}

export function CustomersPanel({ customers }: CustomersPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <CustomersPanelContent customers={customers} />
    </Suspense>
  )
}

function CustomersPanelContent({ customers }: CustomersPanelProps) {
  const { setOpenMobile, isMobile } = useSidebar()
  const [selectedId, setSelectedId] = useQueryState("id")

  const handleItemClick = (customer: Customer) => {
    setSelectedId(customer.id)
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
            <div className="text-foreground text-base font-medium">Customers</div>
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Active</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Search customers..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {customers.map((customer) => {
              const initials = customer.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)

              return (
                <button
                  key={customer.id}
                  onClick={() => handleItemClick(customer)}
                  className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap text-left last:border-b-0",
                    selectedId === customer.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex w-full items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium block truncate">{customer.name}</span>
                      <span className="text-xs text-muted-foreground block truncate">{customer.company}</span>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[customer.status]}`}>
                      {customer.status}
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-4 text-xs text-muted-foreground">
                    <span>{customer.totalOrders} orders</span>
                    <span>${customer.totalSpent.toLocaleString()}</span>
                  </div>
                </button>
              )
            })}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
