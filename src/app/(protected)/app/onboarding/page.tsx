import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { businesses, facebookPages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingWizard } from "@/features/onboarding/components/onboarding-wizard";
import LayoutLoader from "@/components/layouts/loader";

async function OnboardingContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const userId = session.user.id as unknown as number;

  // Check if user already has a business
  const existingBusinesses = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(eq(businesses.userId, userId))
    .limit(1);

  // Check if user has any Facebook pages connected
  const existingPages = await db
    .select({ id: facebookPages.id })
    .from(facebookPages)
    .where(eq(facebookPages.userId, userId))
    .limit(1);

  // Only redirect to /app if user has BOTH a business AND pages
  if (existingBusinesses.length > 0 && existingPages.length > 0) {
    redirect("/app");
  }

  // Pass the business ID if it exists so wizard starts at step 2
  const businessId = existingBusinesses.length > 0 ? existingBusinesses[0].id : null;

  return <OnboardingWizard existingBusinessId={businessId} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <OnboardingContent />
    </Suspense>
  );
}
