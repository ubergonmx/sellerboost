"use server";

import { db, getTxId } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import {
  type ActionResult,
  updateConversationSchema,
} from "../schemas";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { eq } from "drizzle-orm";

/**
 * Update a conversation from collection mutations.
 * Data comes in snake_case from Electric SQL, schema transforms to camelCase.
 */
export async function updateConversationAction(
  conversationId: number,
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

    // Validate and transform: snake_case input -> camelCase output
    const validatedData = updateConversationSchema.safeParse(data);
    if (!validatedData.success) {
      return {
        success: false,
        error: validatedData.error.issues[0]?.message || "Validation failed",
      };
    }

    // Verify user owns this conversation
    const [conversation] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(eq(conversations.id, conversationId))
      .limit(1);

    if (!conversation) {
      return {
        success: false,
        error: "Conversation not found",
      };
    }

    // Update the conversation (validatedData.data is already camelCase)
    const [result, txid] = await db.transaction(async (tx) => {
      const $result = await tx
        .update(conversations)
        .set({
          ...validatedData.data,
          updatedAt: new Date(),
        })
        .where(eq(conversations.id, conversationId))
        .returning({ id: conversations.id });
      const $txid = await getTxId(tx);
      return [$result[0], $txid];
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to update conversation",
      };
    }

    return {
      success: true,
      txid,
    };
  } catch (error) {
    console.error("Error in updateConversationAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Mark a conversation as read (sets unreadCount to 0).
 * Convenience wrapper for common operation.
 */
export async function markConversationAsReadAction(
  conversationId: number
): Promise<ActionResult> {
  return updateConversationAction(conversationId, { unread_count: 0 });
}

/**
 * Archive a conversation.
 * Convenience wrapper for common operation.
 */
export async function archiveConversationAction(
  conversationId: number
): Promise<ActionResult> {
  return updateConversationAction(conversationId, { status: "archived" });
}

export async function deleteConversationAction(
  conversationId: number
): Promise<ActionResult> {
  if (!conversationId) {
    return {
      success: false,
      error: "Conversation ID is required",
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

    // Delete the conversation
    const [result, txid] = await db.transaction(async (tx) => {
      const $result = await tx
        .delete(conversations)
        .where(eq(conversations.id, conversationId))
        .returning({ id: conversations.id });
      const $txid = await getTxId(tx);
      return [$result[0], $txid];
    });

    if (!result) {
      return {
        success: false,
        error: "Failed to delete conversation",
      };
    }

    return {
      success: true,
      txid,
    };
  } catch (error) {
    console.error("Error in deleteConversationAction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
