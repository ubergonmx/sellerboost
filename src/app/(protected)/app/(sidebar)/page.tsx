import { Suspense } from "react";

import { SidebarLayout } from "@/components/layouts/sidebar/sidebar-layout";
import { PageHeader } from "@/components/layouts/sidebar/page-header";
import { InboxPanel } from "@/features/inbox/components/inbox-panel";
import { InboxDetail } from "@/features/inbox/components/inbox-detail";
import LayoutLoader from "@/components/layouts/loader";
import { auth } from "@/lib/auth/config";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { businesses, facebookPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function InboxPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id as unknown as number;

  // Check if user has a business - redirect to onboarding if not
  const existingBusinesses = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.userId, userId))
    .limit(1);

  if (existingBusinesses.length === 0) {
    redirect("/app/onboarding");
  }

  // Check if user has any Facebook pages connected - redirect to onboarding if not
  const existingPages = await db
    .select({ id: facebookPages.id })
    .from(facebookPages)
    .where(eq(facebookPages.userId, userId))
    .limit(1);

  if (existingPages.length === 0) {
    redirect("/app/onboarding");
  }

  return (
    <SidebarLayout panel={<InboxPanel />}>
      <PageHeader breadcrumbs={[{ label: "Inbox" }]} />
      <InboxDetail />
    </SidebarLayout>
  );
}
