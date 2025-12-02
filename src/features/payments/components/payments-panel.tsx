"use client"

import { Suspense } from "react"
import { useQueryState } from "nuqs"
import { CreditCard, Landmark, CircleDollarSign } from "lucide-react"

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
import type { Payment } from "@/lib/sample-data"

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

type PaymentsPanelProps = {
  payments: Payment[]
}

export function PaymentsPanel({ payments }: PaymentsPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <PaymentsPanelContent payments={payments} />
    </Suspense>
  )
}

function PaymentsPanelContent({ payments }: PaymentsPanelProps) {
  const { setOpenMobile, isMobile } = useSidebar()
  const [selectedId, setSelectedId] = useQueryState("id")

  const handleItemClick = (payment: Payment) => {
    setSelectedId(payment.id)
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
            <div className="text-foreground text-base font-medium">Payments</div>
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Pending</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Search payments..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {payments.map((payment) => {
              const MethodIcon = methodIcons[payment.method]

              return (
                <button
                  key={payment.id}
                  onClick={() => handleItemClick(payment)}
                  className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap text-left last:border-b-0",
                    selectedId === payment.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="font-medium">{payment.customer}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{payment.date}</span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <span className="text-xs text-muted-foreground">{payment.id}</span>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[payment.status]}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className="flex w-full items-center gap-2">
                    <MethodIcon className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground capitalize">{payment.method}</span>
                    <span className="ml-auto text-sm font-semibold">${payment.amount.toLocaleString()}</span>
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
