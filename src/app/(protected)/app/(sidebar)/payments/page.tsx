import { Suspense } from "react"

import { SidebarLayout } from "@/components/layouts/sidebar/sidebar-layout"
import { PageHeader } from "@/components/layouts/sidebar/page-header"
import { PaymentsPanel } from "@/features/payments/components/payments-panel"
import { PaymentsDetail } from "@/features/payments/components/payments-detail"
import { payments } from "@/lib/sample-data"
import LayoutLoader from "@/components/layouts/loader"

export default function PaymentsPage() {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <SidebarLayout panel={<PaymentsPanel payments={payments} />}>
        <PageHeader breadcrumbs={[{ label: "Payments" }]} />
        <PaymentsDetail payments={payments} />
      </SidebarLayout>
    </Suspense>
  )
}
