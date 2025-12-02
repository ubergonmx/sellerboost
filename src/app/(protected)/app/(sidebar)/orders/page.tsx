import { Suspense } from "react"

import { SidebarLayout } from "@/components/layouts/sidebar/sidebar-layout"
import { PageHeader } from "@/components/layouts/sidebar/page-header"
import { OrdersPanel } from "@/features/orders/components/orders-panel"
import { OrdersDetail } from "@/features/orders/components/orders-detail"
import { orders } from "@/lib/sample-data"
import LayoutLoader from "@/components/layouts/loader"

export default function OrdersPage() {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <SidebarLayout panel={<OrdersPanel orders={orders} />}>
        <PageHeader breadcrumbs={[{ label: "Orders" }]} />
        <OrdersDetail orders={orders} />
      </SidebarLayout>
    </Suspense>
  )
}
