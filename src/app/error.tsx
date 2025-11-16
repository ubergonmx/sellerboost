"use client"

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Only log errors in development to avoid exposing sensitive information in production
  // In production, consider using an error monitoring service (e.g., Sentry)
  if (process.env.NODE_ENV === 'development') {
    console.error("Global Error:", {
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }

  // TODO: In production, send errors to monitoring service:
  // Example: Sentry.captureException(error)

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
      <div className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
        <div className="p-8 pb-6">
          <div>
            <Link
              href="/"
              aria-label="go home">
              <LogoIcon />
            </Link>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Something went wrong!</h1>
            <p className="text-sm text-muted-foreground">
              We encountered an unexpected error. Please try again.
            </p>
          </div>

          <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <p className="text-sm font-medium text-destructive">Error Details</p>
            <p className="mt-2 text-xs text-destructive/80">{error.message}</p>
            {error.digest && (
              <p className="mt-1 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              onClick={reset}
              className="w-full">
              Try Again
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

