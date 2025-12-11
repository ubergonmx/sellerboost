import LayoutLoader from "@/components/layouts/loader";
import { PageHeader } from "@/components/layouts/sidebar/page-header";
import { InboxDetail } from "@/features/inbox/components/inbox-detail";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { businesses, facebookPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default function InboxPage() {
  return (
    <>
      <PageHeader breadcrumbs={[{ label: "Inbox" }]} />
      <Suspense fallback={<LayoutLoader />}>
        <InboxContent />
      </Suspense>
    </>
  );
}

async function InboxContent() {
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

  return <InboxDetail />;
}
