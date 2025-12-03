"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useScrollToBottom } from "@/features/inbox/hooks/use-scroll-to-bottom";
import { useQueryState } from "nuqs";
import {
  Archive,
  CreditCard,
  FileText,
  Link,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Phone,
  Receipt,
  Send,
  Video,
} from "lucide-react";
import { useLiveQuery, eq } from "@tanstack/react-db";

import { ImageZoom } from "@/components/kibo-ui/image-zoom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Textarea } from "@/components/ui/textarea";
import { DetailSkeleton } from "@/components/layouts/sidebar/detail-skeleton";
import {
  conversationCollection,
  messageCollection,
  type Message as MessageType,
} from "@/features/inbox/collections";
import { getPageInfoAction } from "@/features/inbox/actions/get-page-info";
import {
  markConversationAsReadAction,
  archiveConversationAction,
} from "@/features/inbox/actions/conversations";
import { ClientOnly } from "@/providers/client-only";

interface PageInfo {
  id: number;
  pageId: string;
  pageName: string;
  pictureUrl: string | null;
}

export function InboxDetail() {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ClientOnly>
        <InboxDetailContent />
      </ClientOnly>
    </Suspense>
  );
}

function InboxDetailContent() {
  const [selectedId] = useQueryState("id");
  const [messageText, setMessageText] = useState("");
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get the selected conversation from the collection (real-time via Electric SQL)
  const { data: conversations, isLoading: isLoadingConversation } = useLiveQuery(
    (q) =>
      q
        .from({ conv: conversationCollection })
        .where(({ conv }) => (selectedId ? eq(conv.uid, selectedId) : eq(conv.id, -1))),
    [selectedId]
  );

  const rawConversation = conversations?.[0];
  const conversation = rawConversation
    ? {
        id: rawConversation.id,
        uid: rawConversation.uid,
        pageId: rawConversation.page_id,
        userPsid: rawConversation.user_psid,
        userName: rawConversation.user_name,
        userProfilePic: rawConversation.user_profile_pic,
        unreadCount: rawConversation.unread_count,
      }
    : null;

  // Get messages for the selected conversation (real-time via Electric SQL)
  const { data: messagesData, isLoading: isLoadingMessages } = useLiveQuery(
    (q) =>
      q
        .from({ msg: messageCollection })
        .where(({ msg }) =>
          conversation ? eq(msg.conversation_id, conversation.id) : eq(msg.id, -1)
        )
        .orderBy(({ msg }) => msg.timestamp, "asc"),
    [conversation?.id]
  );

  const messages = messagesData ?? [];

  const {
    scrollViewportRef,
    scrollEndRef: messagesEndRef,
    scrollToBottom,
  } = useScrollToBottom(messages.length);

  // Fetch page info when conversation changes
  useEffect(() => {
    if (!conversation?.pageId) {
      setPageInfo(null);
      return;
    }

    getPageInfoAction(conversation.pageId)
      .then((result) => {
        if (result.success && result.page) {
          setPageInfo(result.page);
        } else {
          setPageInfo(null);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch page info:", err);
        setPageInfo(null);
      });
  }, [conversation?.pageId]);

  // Mark as read when viewing conversation with unread messages
  useEffect(() => {
    if (conversation && conversation.unreadCount && conversation.unreadCount > 0) {
      markConversationAsReadAction(conversation.id).catch((err) =>
        console.error("Failed to mark as read:", err)
      );
    }
  }, [conversation?.id, conversation?.unreadCount]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !conversation) return;

    const text = messageText.trim();
    setMessageText("");

    try {
      // Insert into collection - triggers onInsert -> createMessageAction -> sendToFacebook
      // Use negative random ID within int32 range (won't conflict with real positive DB IDs)
      const tempId = -Math.floor(Math.random() * 2147483647);
      messageCollection.insert({
        id: tempId,
        page_id: conversation.pageId,
        conversation_id: conversation.id,
        sender_id: conversation.pageId,
        recipient_id: conversation.userPsid,
        direction: "outgoing",
        message_text: text,
        timestamp: new Date(),
      });

      // Scroll to bottom after a brief delay for the message to appear
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessageText(text);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleArchive = async () => {
    if (!conversation) return;
    try {
      await archiveConversationAction(conversation.id);
    } catch (error) {
      console.error("Failed to archive:", error);
    }
  };

  const handleCreateInvoice = () => {
    console.log("Creating invoice for conversation:", conversation?.id);
  };

  const handleGeneratePaymentLink = () => {
    console.log("Generating payment link for conversation:", conversation?.id);
  };

  const formatTime = (date: Date | string | null | undefined) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // No conversation selected
  if (!selectedId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <MessageSquare className="size-12" />
        <p className="text-lg">Select a conversation to view messages</p>
      </div>
    );
  }

  // Loading conversation
  if (isLoadingConversation || (!conversation && selectedId)) {
    return <DetailSkeleton />;
  }

  // No conversation found
  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <MessageSquare className="size-12" />
        <p className="text-lg">Conversation not found</p>
      </div>
    );
  }

  const displayName =
    conversation.userName || `User ${conversation.userPsid?.slice(0, 8) ?? "Unknown"}`;
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-1 flex-col">
      {/* Conversation Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              {conversation.userProfilePic && (
                <AvatarImage src={conversation.userProfilePic} alt={displayName} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{displayName}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {pageInfo?.pageName || conversation.pageId}
                </Badge>
                <span>•</span>
                <span>Active</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <Video className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCreateInvoice}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Invoice
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGeneratePaymentLink}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Generate Payment Link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {isLoadingMessages && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-muted-foreground">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessageSquare />
                </EmptyMedia>
                <EmptyTitle>No messages yet</EmptyTitle>
                <EmptyDescription>
                  Start the conversation by sending a message
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <div ref={scrollViewportRef} className="h-full overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  conversation={conversation}
                  pageInfo={pageInfo}
                  showAvatar={
                    index === 0 || messages[index - 1].direction !== message.direction
                  }
                  initials={initials}
                  formatTime={formatTime}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length > 0) {
                console.log("Files selected:", files);
              }
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="mb-1"
            onClick={handleFileSelect}
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Textarea
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[44px] resize-none"
            rows={1}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim()}
            className="mb-1"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCreateInvoice}>
            <Receipt className="mr-2 h-3 w-3" />
            Quick Invoice
          </Button>
          <Button variant="outline" size="sm" onClick={handleGeneratePaymentLink}>
            <Link className="mr-2 h-3 w-3" />
            Payment Link
          </Button>
        </div>
      </div>
    </div>
  );
}

// Extracted message bubble component for cleaner rendering
function MessageBubble({
  message,
  conversation,
  pageInfo,
  showAvatar,
  initials,
  formatTime,
}: {
  message: MessageType;
  conversation: { userName: string | null; userPsid: string; userProfilePic: string | null };
  pageInfo: PageInfo | null;
  showAvatar: boolean;
  initials: string;
  formatTime: (date: Date | string | null | undefined) => string;
}) {
  const isCustomer = message.direction === "incoming";
  const senderName = isCustomer
    ? conversation.userName || `User ${conversation.userPsid?.slice(0, 8) ?? "Unknown"}`
    : pageInfo?.pageName || "Page";

  const attachments = (message.attachments as any[])
    ?.map((attachment) => ({
      type: attachment.type || "file",
      url: attachment.payload?.url || "",
      name: attachment.payload?.name,
    }))
    .filter((a) => a.url);

  return (
    <div className={`flex gap-3 ${isCustomer ? "" : "justify-end"}`}>
      {isCustomer && showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={conversation.userProfilePic || undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}
      {isCustomer && !showAvatar && <div className="w-8" />}

      <div className={`flex max-w-[70%] flex-col gap-1 ${isCustomer ? "" : "items-end"}`}>
        {showAvatar && (
          <span className="text-xs font-medium text-muted-foreground">{senderName}</span>
        )}
        <div
          className={`rounded-lg ${
            isCustomer ? "bg-muted" : "bg-primary text-primary-foreground"
          }`}
        >
          {message.message_text && (
            <p className="text-sm px-3 py-2">{message.message_text}</p>
          )}
          {attachments && attachments.length > 0 && (
            <div
              className={message.message_text ? "px-3 pb-2 pt-0 space-y-2" : "p-1 space-y-2"}
            >
              {attachments.map((attachment, i) => (
                <AttachmentDisplay key={i} attachment={attachment} />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {!isCustomer && message.status && (
            <span className="text-xs text-muted-foreground">• {message.status}</span>
          )}
        </div>
      </div>

      {!isCustomer && showAvatar && (
        <Avatar className="h-8 w-8">
          {pageInfo?.pictureUrl && (
            <AvatarImage src={pageInfo.pictureUrl} alt={pageInfo.pageName || "Page"} />
          )}
          <AvatarFallback className="text-xs">
            {(pageInfo?.pageName?.[0] || "P").toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
      {!isCustomer && !showAvatar && <div className="w-8" />}
    </div>
  );
}

function AttachmentDisplay({
  attachment,
}: {
  attachment: { type: string; url: string; name?: string };
}) {
  if (attachment.type === "image" && attachment.url) {
    return (
      <div className="rounded overflow-hidden">
        <ImageZoom>
          <img
            src={attachment.url}
            alt="Shared image"
            className="max-w-[300px] max-h-[300px] object-cover rounded cursor-zoom-in"
          />
        </ImageZoom>
      </div>
    );
  }

  if (attachment.type === "video" && attachment.url) {
    return (
      <div className="rounded overflow-hidden">
        <video src={attachment.url} controls className="max-w-[300px] max-h-[300px]" />
      </div>
    );
  }

  if (attachment.type === "audio" && attachment.url) {
    return (
      <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
        <FileText className="h-4 w-4" />
        <audio src={attachment.url} controls className="flex-1" />
      </div>
    );
  }

  if (attachment.type === "file" && attachment.url) {
    return (
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 p-2 bg-background/50 rounded hover:bg-background/70 transition-colors"
      >
        <FileText className="h-4 w-4" />
        <span className="text-xs underline">{attachment.name || "Download file"}</span>
      </a>
    );
  }

  return null;
}
