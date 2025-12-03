import { and, desc, eq } from "drizzle-orm";
import { sendMessage as sendFacebookMessage } from "@/lib/auth/facebook";
import { db, getTxId } from "@/lib/db";
import { conversations, facebookPages, messages } from "@/lib/db/schema";
import { decryptToken } from "@/lib/encryption";

interface SendToFacebookInput {
  userId: number;
  facebookPageId: number;
  pageId: string;
  recipientId: string;
  messageText: string;
  conversationId: number;
}

interface SendToFacebookResult {
  success: boolean;
  messageId?: string;
  txid?: number;
  error?: string;
}

/**
 * Send a message to Facebook Messenger, insert to DB, and update conversation.
 * This handles the full outgoing message flow:
 * 1. Check 24-hour messaging window
 * 2. Send to Facebook API
 * 3. Insert message to DB with Facebook's messageId
 * 4. Update conversation metadata
 */
export async function sendToFacebook(
  input: SendToFacebookInput
): Promise<SendToFacebookResult> {
  try {
    // Get the Facebook Page and verify ownership
    const [page] = await db
      .select()
      .from(facebookPages)
      .where(
        and(
          eq(facebookPages.pageId, input.pageId),
          eq(facebookPages.userId, input.userId)
        )
      )
      .limit(1);

    if (!page) {
      return {
        success: false,
        error:
          "Page not found or you don't have permission to send messages from this page.",
      };
    }

    // Check 24-hour messaging window
    const isOutside24HourWindow = await check24HourWindow(
      input.conversationId,
      input.recipientId,
      input.pageId
    );

    // Decrypt the page access token
    const pageAccessToken = await decryptToken(page.pageAccessToken);

    // Send message via Facebook API
    const result = await sendFacebookMessage(pageAccessToken, {
      recipientId: input.recipientId,
      text: input.messageText,
      isOutside24HourWindow,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Failed to send message",
      };
    }

    // Insert message and update conversation in a transaction
    const txid = await db.transaction(async (tx) => {
      // Insert the sent message
      await tx.insert(messages).values({
        userId: input.userId,
        facebookPageId: input.facebookPageId,
        pageId: input.pageId,
        messageId: result.messageId!,
        conversationId: input.conversationId,
        senderId: input.pageId,
        recipientId: input.recipientId,
        direction: "outgoing",
        messageText: input.messageText,
        timestamp: new Date(),
        status: "sent",
        isEcho: false,
      });

      // Update conversation metadata
      await tx
        .update(conversations)
        .set({
          lastMessageAt: new Date(),
          lastMessageText: input.messageText,
          lastMessageDirection: "outgoing",
          unreadCount: 0,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, input.conversationId));

      return await getTxId(tx);
    });

    return {
      success: true,
      messageId: result.messageId,
      txid,
    };
  } catch (error) {
    console.error("Error in sendToFacebook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Check if we're outside the Facebook 24-hour messaging window.
 * Returns true if we need to use message tags (outside window).
 */
async function check24HourWindow(
  conversationId: number,
  recipientId: string,
  pageId: string
): Promise<boolean> {
  const MESSAGING_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
  const now = new Date();

  // Find the last incoming message from the customer
  const [lastIncomingMessage] = await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.direction, "incoming"),
        eq(messages.senderId, recipientId),
        eq(messages.recipientId, pageId)
      )
    )
    .orderBy(desc(messages.timestamp))
    .limit(1);

  if (!lastIncomingMessage) {
    // No incoming messages found - allow sending (conservative approach)
    return false;
  }

  const lastCustomerMessageTime = new Date(lastIncomingMessage.timestamp).getTime();
  const timeSinceLastCustomerMessage = now.getTime() - lastCustomerMessageTime;

  return timeSinceLastCustomerMessage > MESSAGING_WINDOW_MS;
}
