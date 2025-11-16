"use client"

import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  useEffect(() => {
    // Redirect to landing page if no error parameter
    if (!error) {
      router.push('/')
    }
  }, [error, router])

  // Don't render content if redirecting
  if (!error) {
    return null
  }

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'OAuthAccountNotLinked':
        return 'To confirm your identity, sign in with the same account you used originally.'
      case 'OAuthSignin':
        return 'Error occurred while attempting to sign in with OAuth provider.'
      case 'OAuthCallback':
        return 'Error occurred in the OAuth callback handler.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account in the database.'
      case 'EmailCreateAccount':
        return 'Could not create email account in the database.'
      case 'Callback':
        return 'Error occurred in the callback handler.'
      default:
        return errorDescription || 'An unexpected error occurred during authentication.'
    }
  }

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
            <h1 className="mb-1 mt-4 text-xl font-semibold">Authentication Error</h1>
            <p className="text-sm text-muted-foreground">
              {getErrorMessage()}
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">Error Code: {error}</p>
              {errorDescription && (
                <p className="mt-2 text-xs text-destructive/80">{errorDescription}</p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Button
              asChild
              className="w-full">
              <Link href="/login">Try Again</Link>
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

