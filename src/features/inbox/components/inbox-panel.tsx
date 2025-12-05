"use client";

import { useQueryState } from "nuqs";
import { useLiveQuery } from "@tanstack/react-db";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  SidebarTrigger,
  useSidebar,
} from "@/components/layouts/sidebar/sidebar";
import { PanelSkeleton } from "@/components/layouts/sidebar/panel-skeleton";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { conversationCollection } from "@/features/inbox/collections";
import { ClientOnly } from "@/providers/client-only";

export function InboxPanel() {
  return (
    <ClientOnly>
      <InboxPanelContent />
    </ClientOnly>
  );
}

function InboxPanelContent() {
  const { setOpenMobile, isMobile } = useSidebar();
  const [selectedId, setSelectedId] = useQueryState("id");
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [unreadOnly, setUnreadOnly] = useQueryState("unread", {
    defaultValue: "false",
    parse: (value) => value,
    serialize: (value) => value,
  });
  const panelClassName = isMobile
    ? "flex flex-1"
    : "w-[calc(var(--sidebar-width)-var(--sidebar-width-icon))]!";

  // Subscribe to conversations via Electric SQL (snake_case from DB)
  const { data: rawConversations, isLoading } = useLiveQuery((q) =>
    q
      .from({ conv: conversationCollection })
      .orderBy(({ conv }) => conv.last_message_at, "desc")
  );

  // Filter conversations based on search and unread filter
  const conversations = rawConversations?.filter((conv) => {
    // Unread filter
    if (unreadOnly === "true") {
      const isUnread =
        conv.last_message_direction === "incoming" && (conv.unread_count || 0) > 0;
      if (!isUnread) return false;
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const nameMatch = conv.user_name?.toLowerCase().includes(searchLower);
      const messageMatch = conv.last_message_text?.toLowerCase().includes(searchLower);
      if (!nameMatch && !messageMatch) return false;
    }

    return true;
  });

  const handleItemClick = (uid: string) => {
    setSelectedId(uid);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const formatTime = (date: Date | string | null | undefined): string => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return <PanelSkeleton />;
  }

  return (
    <Sidebar collapsible="none" className={panelClassName}>
      <SidebarHeader className="gap-3.5 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && <SidebarTrigger className="-ml-1" />}
            <div className="text-foreground text-base font-medium">Inbox</div>
          </div>
          <Label className="flex items-center gap-2 text-sm">
            <span>Unread</span>
            <Switch
              className="shadow-none"
              checked={unreadOnly === "true"}
              onCheckedChange={(checked) => setUnreadOnly(checked ? "true" : "false")}
            />
          </Label>
        </div>
        <SidebarInput
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value || null)}
        />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            {conversations?.map((conv) => {
              const initials = (conv.user_name || "U")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              const isUnread =
                conv.last_message_direction === "incoming" &&
                (conv.unread_count || 0) > 0;

              return (
                <button
                  key={conv.uid}
                  onClick={() => handleItemClick(conv.uid)}
                  className={cn(
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex w-full flex-col items-start gap-2 border-b p-4 text-sm leading-tight text-left last:border-b-0 overflow-hidden",
                    selectedId === conv.uid &&
                      "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <div className="flex w-full items-center gap-2">
                    <div className="relative shrink-0">
                      <Avatar className="size-10">
                        {conv.user_profile_pic && (
                          <AvatarImage
                            src={conv.user_profile_pic}
                            alt={conv.user_name || "User"}
                          />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {isUnread && (
                        <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-blue-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium truncate">
                          {conv.user_name || `User ${conv.user_psid?.slice(0, 8) ?? "Unknown"}`}
                        </span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.last_message_text || "No messages"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
            {(!conversations || conversations.length === 0) && (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
