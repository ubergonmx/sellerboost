"use server";

import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import {
  type ActionResult,
  createMessageSchema,
  updateMessageSchema,
} from "@/features/inbox/schemas";
import { db, getTxId } from "@/lib/db";
import { facebookPages, messages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { sendToFacebook } from "./send-message";

/**
 * Create a message from collection mutations (UI sending a message).
 * Data comes in snake_case from Electric SQL, schema transforms to camelCase.
 *
 * This is only called for outgoing messages from the UI.
 * Incoming messages are handled by the webhook and synced via Electric SQL.
 */
export async function createMessageAction(
  messageData: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = parseInt(session.user.id, 10);

    // Validate and transform: snake_case input -> camelCase output
    const validatedData = createMessageSchema.safeParse(messageData);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message || "Validation failed",
      };
    }

    const data = validatedData.data;

    if (!data.conversationId || !data.pageId || !data.recipientId || !data.messageText) {
      return {
        success: false,
        error: "Missing required fields",
      };
    }

    // Get the facebookPageId from the page
    const [page] = await db
      .select({ id: facebookPages.id })
      .from(facebookPages)
      .where(
        and(
          eq(facebookPages.pageId, data.pageId),
          eq(facebookPages.userId, userId)
        )
      )
      .limit(1);

    if (!page) {
      return {
        success: false,
        error: "Page not found",
      };
    }

    const fbResult = await sendToFacebook({
      userId,
      facebookPageId: page.id,
      pageId: data.pageId,
      recipientId: data.recipientId,
      messageText: data.messageText,
      conversationId: data.conversationId,
    });

    if (!fbResult.success) {
      return {
        success: false,
        error: fbResult.error || "Failed to send message to Facebook",
      };
    }

    return {
      success: true,
      txid: fbResult.txid,
    };
  } catch (error) {
    console.error("Error in createMessageAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Update a message from collection mutations.
 * Data comes in snake_case from Electric SQL, schema transforms to camelCase.
 */
export async function updateMessageAction(
  messageId: number,
  data: Record<string, unknown>
): Promise<ActionResult> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = parseInt(session.user.id, 10);

    // Validate and transform: snake_case input -> camelCase output
    const validatedData = updateMessageSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message || "Validation failed",
      };
    }

    // Verify user owns this message
    const [message] = await db
      .select({ id: messages.id })
      .from(messages)
      .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
      .limit(1);

    if (!message) {
      return {
        success: false,
        error: "Message not found",
      };
    }

    const [result, txid] = await db.transaction(async (tx) => {
      const $result = await tx
        .update(messages)
        .set(validatedData.data)
        .where(eq(messages.id, messageId))
        .returning({ id: messages.id });
      const $txid = await getTxId(tx);
      return [$result[0], $txid];
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to update message",
      };
    }

    return {
      success: true,
      txid,
    };
  } catch (error) {
    console.error("Error in updateMessageAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

export async function deleteMessageAction(
  messageId: number
): Promise<ActionResult> {
  if (!messageId) {
    return {
      success: false,
      error: "Message ID is required",
    };
  }

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const userId = parseInt(session.user.id, 10);

    // Verify user owns this message before deleting
    const [message] = await db
      .select({ id: messages.id })
      .from(messages)
      .where(and(eq(messages.id, messageId), eq(messages.userId, userId)))
      .limit(1);

    if (!message) {
      return {
        success: false,
        error: "Message not found",
      };
    }

    const [result, txid] = await db.transaction(async (tx) => {
      const $result = await tx
        .delete(messages)
        .where(eq(messages.id, messageId))
        .returning({ id: messages.id });
      const $txid = await getTxId(tx);
      return [$result[0], $txid];
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to delete message",
      };
    }

    return {
      success: true,
      txid,
    };
  } catch (error) {
    console.error("Error in deleteMessageAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
