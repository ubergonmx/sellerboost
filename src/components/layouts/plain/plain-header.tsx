"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"

type PlainHeaderProps = {
  title: string
}

export function PlainHeader({ title }: PlainHeaderProps) {
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/app"

  return (
    <header className="bg-background sticky top-0 z-50 border-b">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
        <Button variant="ghost" size="icon" asChild>
          {/* Cast to any to bypass typed routes for dynamic back navigation */}
          <Link href={from as "/app"}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
    </header>
  )
}
