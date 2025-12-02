"use client"

import * as React from "react"

import { NavRail } from "./nav-rail"
import { Sidebar, SidebarInset } from "./sidebar"
import { cn } from "@/lib/utils"

type SidebarLayoutProps = {
  panel: React.ReactNode
  children: React.ReactNode
}

export function SidebarLayout({ panel, children }: SidebarLayoutProps) {
  return (
    <>
      <Sidebar
        collapsible="icon"
        className={cn(
          "overflow-hidden",
          "[&>div[data-slot='sidebar-container']]:md:w-full",
          "[&>div[data-slot='sidebar-container']]:md:max-w-[calc(var(--sidebar-width-icon)+var(--sidebar-width))]",
          "[&>div[data-slot='sidebar-container']]:md:left-0",
        )}
      >
        <NavRail />
        {panel}
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  )
}
