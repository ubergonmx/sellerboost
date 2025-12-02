import { Suspense } from "react"

import { SidebarLayout } from "@/components/layouts/sidebar/sidebar-layout"
import { PageHeader } from "@/components/layouts/sidebar/page-header"
import { InvoicesPanel } from "@/features/invoices/components/invoices-panel"
import { InvoicesDetail } from "@/features/invoices/components/invoices-detail"
import { invoices } from "@/lib/sample-data"
import LayoutLoader from "@/components/layouts/loader"

export default function InvoicesPage() {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <SidebarLayout panel={<InvoicesPanel invoices={invoices} />}>
        <PageHeader breadcrumbs={[{ label: "Invoices" }]} />
        <InvoicesDetail invoices={invoices} />
      </SidebarLayout>
    </Suspense>
  )
}
