"use client"

import React, { useState, useRef, useEffect } from "react"
import { Send, Paperclip, MoreVertical, Phone, Video, Info, Image, FileText, Link, MessageSquare, Archive, Inbox, Receipt, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty"

interface Message {
  id: string
  senderId: string
  senderName: string
  senderType: "customer" | "page"
  text: string
  timestamp: Date
  status?: "sent" | "delivered" | "read"
  attachments?: Array<{
    type: string
    url: string
    name?: string
  }>
}

interface ConversationViewProps {
  conversation?: {
    id: string
    name: string
    pageName: string
    profilePic?: string | null
    userPsid?: string
  }
  messages?: Message[]
  onSendMessage?: (message: string, attachments?: File[]) => void
  onCreateInvoice?: () => void
  onGeneratePaymentLink?: () => void
}

export function ConversationView({
  conversation,
  messages = [],
  onSendMessage,
  onCreateInvoice,
  onGeneratePaymentLink
}: ConversationViewProps) {
  const [messageText, setMessageText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock messages if none provided
  const displayMessages = messages.length > 0 ? messages : conversation ? [
    {
      id: "1",
      senderId: conversation.userPsid || "customer-1",
      senderName: conversation.name,
      senderType: "customer" as const,
      text: "Hi, do you have summer dresses available?",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
      status: "read" as const,
    },
    {
      id: "2",
      senderId: conversation.pageName,
      senderName: conversation.pageName,
      senderType: "page" as const,
      text: "Hello! Yes, we have a great selection of summer dresses. What size are you looking for?",
      timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 min ago
      status: "read" as const,
    },
    {
      id: "3",
      senderId: conversation.userPsid || "customer-1",
      senderName: conversation.name,
      senderType: "customer" as const,
      text: "I'm looking for size Medium. Do you have any in floral prints?",
      timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 min ago
      status: "read" as const,
    },
    {
      id: "4",
      senderId: conversation.pageName,
      senderName: conversation.pageName,
      senderType: "page" as const,
      text: "Yes! We have several floral print dresses in medium. Let me send you some photos.",
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 min ago
      status: "delivered" as const,
    },
    {
      id: "5",
      senderId: conversation.userPsid || "customer-1",
      senderName: conversation.name,
      senderType: "customer" as const,
      text: "Great! How much are they?",
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 min ago
      status: "read" as const,
    },
  ] : []

  useEffect(() => {
    scrollToBottom()
  }, [displayMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (messageText.trim() && onSendMessage) {
      onSendMessage(messageText.trim())
      setMessageText("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (!conversation) {
    return (
      <div className="flex h-full items-center justify-center">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquare />
            </EmptyMedia>
            <EmptyTitle>No conversation selected</EmptyTitle>
            <EmptyDescription>
              Choose a conversation from the sidebar to start messaging
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Conversation Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={conversation.profilePic || undefined} />
            <AvatarFallback>
              {conversation.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold">{conversation.name}</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {conversation.pageName}
              </Badge>
              <span>•</span>
              <span>Active now</span>
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
              <DropdownMenuItem onClick={onCreateInvoice}>
                <Receipt className="mr-2 h-4 w-4" />
                Create Invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onGeneratePaymentLink}>
                <CreditCard className="mr-2 h-4 w-4" />
                Generate Payment Link
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Info className="mr-2 h-4 w-4" />
                View Customer Info
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Archive className="mr-2 h-4 w-4" />
                Archive Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="space-y-4">
          {displayMessages.map((message, index) => {
            const isCustomer = message.senderType === "customer"
            const showAvatar = index === 0 ||
              displayMessages[index - 1].senderType !== message.senderType

            return (
              <div
                key={message.id}
                className={`flex gap-3 ${isCustomer ? '' : 'justify-end'}`}
              >
                {isCustomer && showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={conversation.profilePic || undefined} />
                    <AvatarFallback className="text-xs">
                      {message.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                {isCustomer && !showAvatar && <div className="w-8" />}

                <div className={`flex max-w-[70%] flex-col gap-1 ${isCustomer ? '' : 'items-end'}`}>
                  {showAvatar && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {message.senderName}
                    </span>
                  )}
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isCustomer
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {message.attachments.map((attachment, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {attachment.type.startsWith('image') ? (
                              <Image className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="text-xs underline">
                              {attachment.name || 'Attachment'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                    {!isCustomer && message.status && (
                      <span className="text-xs text-muted-foreground">
                        • {message.status}
                      </span>
                    )}
                  </div>
                </div>

                {!isCustomer && showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {conversation.pageName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isCustomer && !showAvatar && <div className="w-8" />}
              </div>
            )
          })}
          {isTyping && (
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={conversation.profilePic || undefined} />
                <AvatarFallback className="text-xs">
                  {conversation.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg bg-muted px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="border-t px-6 py-4">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (files.length > 0 && onSendMessage) {
                // Handle file attachments
                console.log('Files selected:', files)
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
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateInvoice}
          >
            <Receipt className="mr-2 h-3 w-3" />
            Quick Invoice
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onGeneratePaymentLink}
          >
            <Link className="mr-2 h-3 w-3" />
            Payment Link
          </Button>
        </div>
      </div>
    </div>
  )
}