import { Suspense } from "react"

import { SidebarLayout } from "@/components/layouts/sidebar/sidebar-layout"
import { PageHeader } from "@/components/layouts/sidebar/page-header"
import { CustomersPanel } from "@/features/customers/components/customers-panel"
import { CustomersDetail } from "@/features/customers/components/customers-detail"
import { customers } from "@/lib/sample-data"
import LayoutLoader from "@/components/layouts/loader"

export default function CustomersPage() {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <SidebarLayout panel={<CustomersPanel customers={customers} />}>
        <PageHeader breadcrumbs={[{ label: "Customers" }]} />
        <CustomersDetail customers={customers} />
      </SidebarLayout>
    </Suspense>
  )
}
