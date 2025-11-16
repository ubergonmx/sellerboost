"use server"

import { auth } from "@/lib/auth/config"
import { db } from "@/lib/db"
import { facebookPages, messages, conversations } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { decryptToken } from "@/lib/encryption"
import { sendMessage as sendFacebookMessage } from "@/lib/auth/facebook"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

interface SendMessageInput {
  pageId: string
  recipientId: string
  messageText: string
  conversationId?: number
}

interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
}

export async function sendMessageAction(
  input: SendMessageInput
): Promise<SendMessageResult> {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized. Please login.",
      }
    }

    const userId = session.user.id

    // Get the Facebook Page and verify ownership
    const [page] = await db
      .select()
      .from(facebookPages)
      .where(
        and(
          eq(facebookPages.pageId, input.pageId),
          eq(facebookPages.userId, userId)
        )
      )
      .limit(1)

    if (!page) {
      return {
        success: false,
        error: "Page not found or you don't have permission to send messages from this page.",
      }
    }

    // Decrypt the page access token
    const pageAccessToken = await decryptToken(page.pageAccessToken)

    // Send message via Facebook API
    const result = await sendFacebookMessage(pageAccessToken, {
      recipientId: input.recipientId,
      text: input.messageText,
    })

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send message",
      }
    }

    // Store the sent message in database
    await db.insert(messages).values({
      userId: userId,
      facebookPageId: page.id,
      pageId: input.pageId,
      messageId: result.messageId!,
      conversationId: input.conversationId || null,
      senderId: input.pageId, // Page ID when sending
      recipientId: input.recipientId,
      direction: "outgoing",
      messageText: input.messageText,
      timestamp: new Date(),
      status: "sent",
      isEcho: false,
    })

    // Update conversation's last message
    if (input.conversationId) {
      await db
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessageText: input.messageText,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, input.conversationId))
    }

    // Revalidate the dashboard page to show the new message
    revalidatePath("/dashboard")

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error: any) {
    console.error("Error in sendMessageAction:", error)
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    }
  }
}
