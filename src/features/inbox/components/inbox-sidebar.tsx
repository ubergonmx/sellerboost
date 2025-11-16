"use client"

import * as React from "react"
import {
  Inbox,
  ShoppingCart,
  Receipt,
  Package,
  Users,
  MessageSquare,
  Settings,
  BarChart3,
  FileText,
  CreditCard
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Logo } from "@/components/logo"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"

// Navigation items for SellerBoost
const navMain = [
  {
    title: "Inbox",
    url: "/dashboard",
    icon: Inbox,
    badge: "12", // Unread messages count
    isActive: true,
  },
  {
    title: "Conversations",
    url: "/dashboard/conversations",
    icon: MessageSquare,
    isActive: false,
  },
  {
    title: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingCart,
    badge: "3", // Pending orders
    isActive: false,
    disabled: true, // For future implementation
  },
  {
    title: "Invoices",
    url: "/dashboard/invoices",
    icon: Receipt,
    isActive: false,
    disabled: true, // For future implementation
  },
  {
    title: "Payment Links",
    url: "/dashboard/payments",
    icon: CreditCard,
    isActive: false,
    disabled: true, // For future implementation
  },
  {
    title: "Products",
    url: "/dashboard/products",
    icon: Package,
    isActive: false,
    disabled: true, // For future implementation
  },
  {
    title: "Customers",
    url: "/dashboard/customers",
    icon: Users,
    isActive: false,
    disabled: true, // For future implementation
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: BarChart3,
    isActive: false,
    disabled: true, // For future implementation
  },
  {
    title: "Reports",
    url: "/dashboard/reports",
    icon: FileText,
    isActive: false,
    disabled: true, // For future implementation
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
    isActive: false,
  },
];

export interface ConversationType {
  id: string
  name: string
  pageName: string
  message: string
  time: string
  unread: boolean
  profilePic: string | null
}

interface InboxSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string
    email: string
    avatar?: string
  }
  conversations?: ConversationType[]
  onConversationSelect?: (conversation: ConversationType) => void
}

export function InboxSidebar({ user, conversations = [], onConversationSelect, ...props }: InboxSidebarProps) {
  const [activeItem, setActiveItem] = React.useState(navMain[0])
  const [showUnreadOnly, setShowUnreadOnly] = React.useState(false)
  const { setOpen } = useSidebar()

  const filteredConversations = showUnreadOnly
    ? conversations.filter(c => c.unread)
    : conversations

  const userData = {
    name: user?.name || "SellerBoost User",
    email: user?.email || "user@sellerboost.com",
    avatar: user?.avatar || "/avatars/default.jpg",
  };

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>div]:flex-row"
      {...props}
    >
      {/* Main Navigation Sidebar */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)+1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Package className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">SellerBoost</span>
                    <span className="truncate text-xs">Business</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={{
                        children: item.title,
                        hidden: false,
                      }}
                      onClick={() => {
                        if (!item.disabled) {
                          setActiveItem(item)
                          setOpen(true)
                        }
                      }}
                      isActive={activeItem?.title === item.title}
                      className="px-2.5 md:px-2"
                      disabled={item.disabled}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge
                          variant="secondary"
                          className="ml-auto h-5 px-1.5 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={userData} />
        </SidebarFooter>
      </Sidebar>

      {/* Conversations List Sidebar */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex">
        <SidebarHeader className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-base font-medium text-foreground">
              {activeItem?.title}
            </div>
            <Label className="flex items-center gap-2 text-sm">
              <span>Unread only</span>
              <Switch
                className="shadow-none"
                checked={showUnreadOnly}
                onCheckedChange={setShowUnreadOnly}
              />
            </Label>
          </div>
          <SidebarInput placeholder="Search conversations..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {filteredConversations.length === 0 ? (
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageSquare />
                    </EmptyMedia>
                    <EmptyTitle>No conversations</EmptyTitle>
                    <EmptyDescription>
                      {showUnreadOnly
                        ? "No unread conversations at the moment"
                        : "Connect a Facebook Page to start receiving messages"}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => onConversationSelect?.(conversation)}
                    className="flex w-full flex-col items-start gap-2 border-b p-4 text-left text-sm leading-tight transition-colors last:border-b-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div className="flex w-full items-center gap-2">
                      <div className="flex flex-1 items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {conversation.profilePic ? (
                            <img
                              src={conversation.profilePic}
                              alt={conversation.name}
                              className="h-full w-full rounded-full"
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              {conversation.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className={conversation.unread ? "font-semibold" : ""}>
                            {conversation.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {conversation.pageName}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {conversation.time}
                      </span>
                    </div>
                    <div className="flex w-full items-center gap-2">
                      {conversation.unread && (
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                      <span className={`line-clamp-1 ${conversation.unread ? "font-medium" : "text-muted-foreground"}`}>
                        {conversation.message}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}