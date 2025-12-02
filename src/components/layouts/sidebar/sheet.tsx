"use client"

import * as React from "react"
import { Activity } from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const SheetAnimationContext = React.createContext(false)
const SheetPreserveStateContext = React.createContext(false)
const SheetOpenContext = React.createContext(true)

function Sheet({
  open,
  preserveState = false,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root> & {
  open?: boolean
  preserveState?: boolean
}) {
  const [enableAnimations, setEnableAnimations] = React.useState(false)

  React.useEffect(() => {
    if (open === false) {
      setEnableAnimations(true)
    }
  }, [open])

  return (
    <SheetAnimationContext.Provider value={enableAnimations}>
      <SheetPreserveStateContext.Provider value={preserveState}>
        <SheetOpenContext.Provider value={open ?? true}>
          <SheetPrimitive.Root data-slot="sheet" open={open} {...props} />
        </SheetOpenContext.Provider>
      </SheetPreserveStateContext.Provider>
    </SheetAnimationContext.Provider>
  )
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({
  forceMount,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  const preserveState = React.useContext(SheetPreserveStateContext)
  return (
    <SheetPrimitive.Portal
      data-slot="sheet-portal"
      forceMount={preserveState ? true : forceMount}
      {...props}
    />
  )
}

function SheetOverlay({
  className,
  mounted,
  forceMount,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay> & {
  mounted?: boolean
  forceMount?: true
}) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      forceMount={forceMount}
      className={cn(
        "fixed inset-0 z-50 bg-black/50",
        // Only apply open animation after first render to prevent animation on page load
        mounted && "data-[state=open]:animate-in data-[state=open]:fade-in-0",
        // Always allow close animation
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
        // Keep element in final position after close animation to prevent flicker
        forceMount && "data-[state=closed]:[animation-fill-mode:forwards]",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left"
}) {
  const enableAnimations = React.useContext(SheetAnimationContext)
  const preserveState = React.useContext(SheetPreserveStateContext)
  const isOpen = React.useContext(SheetOpenContext)

  // Track Activity visibility separately to allow close animation to complete
  const [activityVisible, setActivityVisible] = React.useState(isOpen)

  React.useEffect(() => {
    if (isOpen) {
      // Show immediately when opening
      setActivityVisible(true)
    }
    // When closing, we delay hiding via onAnimationEnd
  }, [isOpen])

  const handleAnimationEnd = React.useCallback(
    (e: React.AnimationEvent) => {
      // Only hide Activity after close animation completes
      if (!isOpen && e.animationName.includes("exit")) {
        setActivityVisible(false)
      }
    },
    [isOpen]
  )

  const content = (
    <SheetPortal>
      <SheetOverlay mounted={enableAnimations} forceMount={preserveState ? true : undefined} />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        forceMount={preserveState ? true : undefined}
        onAnimationEnd={preserveState ? handleAnimationEnd : undefined}
        className={cn(
          "bg-background fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out",
          enableAnimations &&
            "data-[state=open]:animate-in data-[state=open]:duration-500",
          "data-[state=closed]:animate-out data-[state=closed]:duration-300",
          // Keep element in final position after close animation to prevent flicker
          preserveState && "data-[state=closed]:[animation-fill-mode:forwards]",
          side === "right" &&
            cn(
              "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
              "data-[state=closed]:slide-out-to-right",
              enableAnimations && "data-[state=open]:slide-in-from-right"
            ),
          side === "left" &&
            cn(
              "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
              "data-[state=closed]:slide-out-to-left",
              enableAnimations && "data-[state=open]:slide-in-from-left"
            ),
          side === "top" &&
            cn(
              "inset-x-0 top-0 h-auto border-b",
              "data-[state=closed]:slide-out-to-top",
              enableAnimations && "data-[state=open]:slide-in-from-top"
            ),
          side === "bottom" &&
            cn(
              "inset-x-0 bottom-0 h-auto border-t",
              "data-[state=closed]:slide-out-to-bottom",
              enableAnimations && "data-[state=open]:slide-in-from-bottom"
            ),
          className
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  )

  if (preserveState) {
    return (
      <Activity mode={activityVisible ? "visible" : "hidden"}>
        {content}
      </Activity>
    )
  }

  return content
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
