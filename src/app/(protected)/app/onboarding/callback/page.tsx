import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { connectFacebookPages } from "@/features/onboarding/actions/connect-facebook-pages";
import LayoutLoader from "@/components/layouts/loader";

interface CallbackPageProps {
  searchParams: Promise<{
    businessId?: string;
  }>;
}

async function CallbackContent({ searchParams }: CallbackPageProps) {
  const params = await searchParams;
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const businessId = params.businessId ? parseInt(params.businessId, 10) : null;

  if (!businessId || isNaN(businessId)) {
    redirect("/app/onboarding?error=missing_business");
  }

  // Connect Facebook pages for this business
  const result = await connectFacebookPages(businessId);

  if (result.success) {
    // Redirect to the app with success message
    redirect("/app?onboarding=complete");
  } else {
    // Redirect back to onboarding with error
    redirect(`/app/onboarding?error=${encodeURIComponent(result.error || "unknown")}`);
  }

  // This return is technically unreachable due to redirects above,
  // but satisfies TypeScript's return type requirement
  return null;
}

export default function OnboardingCallbackPage(props: CallbackPageProps) {
  return (
    <Suspense fallback={<LayoutLoader />}>
      <CallbackContent {...props} />
    </Suspense>
  );
}
