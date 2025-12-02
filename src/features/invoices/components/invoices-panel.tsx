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
import type { Invoice } from "@/lib/sample-data"

const statusColors: Record<Invoice["status"], string> = {
  draft: "bg-gray-500/10 text-gray-600",
  pending: "bg-yellow-500/10 text-yellow-600",
  paid: "bg-green-500/10 text-green-600",
  overdue: "bg-red-500/10 text-red-600",
}

type InvoicesPanelProps = {
  invoices: Invoice[]
}

export function InvoicesPanel({ invoices }: InvoicesPanelProps) {
  return (
    <Suspense fallback={<PanelSkeleton />}>
      <InvoicesPanelContent invoices={invoices} />
    </Suspense>
  )
}

function InvoicesPanelContent({ invoices }: InvoicesPanelProps) {
  const { setOpenMobile, isMobile } = useSidebar()
  const [selectedId, setSelectedId] = useQueryState("id")

  const handleItemClick = (invoice: Invoice) => {
    setSelectedId(invoice.id)
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
            <div className="text-foreground text-base font-medium">Invoices</div>
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unpaid</span>
            <Switch className="shadow-none" />
          </Label>
        </div>
        <SidebarInput placeholder="Search invoices..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="px-0">
          <SidebarGroupContent>
            {invoices.map((invoice) => (
              <button
                key={invoice.id}
                onClick={() => handleItemClick(invoice)}
                className={cn(
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap text-left last:border-b-0",
                  selectedId === invoice.id && "bg-sidebar-accent text-sidebar-accent-foreground"
                )}
              >
                <div className="flex w-full items-center gap-2">
                  <span className="font-medium">{invoice.customer}</span>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-xs capitalize ${statusColors[invoice.status]}`}>
                    {invoice.status}
                  </span>
                </div>
                <div className="flex w-full items-center gap-2">
                  <span className="text-xs text-muted-foreground">{invoice.id}</span>
                </div>
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-semibold">${invoice.amount.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">Due {invoice.dueDate}</span>
                </div>
              </button>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
