import { Inbox } from "@/features/inbox/components/inbox"
import { auth } from "@/lib/auth/config"
import { headers } from "next/headers"
import { Suspense } from "react"

async function DashboardContent() {
  // Get the current user session
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const user = session?.user
    ? {
        name: session.user.name || "SellerBoost User",
        email: session.user.email || "user@sellerboost.com",
        avatar: session.user.image || undefined,
      }
    : undefined

  return <Inbox user={user} />
}

function DashboardSkeleton() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-muted-foreground">Loading...</div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="h-screen">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

