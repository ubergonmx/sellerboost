import { createCollection } from "@tanstack/react-db";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import {
  conversationCollectionSchema,
  messageCollectionSchema,
  type ConversationCollectionItem,
  type MessageCollectionItem,
} from "@/features/inbox/schemas";
import { updateConversationAction, deleteConversationAction } from "@/features/inbox/actions/conversations";
import { createMessageAction, updateMessageAction, deleteMessageAction } from "@/features/inbox/actions/messages";

export type { ConversationCollectionItem as Conversation, MessageCollectionItem as Message };

/**
 * Helper function to generate Electric SQL shape options for a given table.
 * @param table - The table name (e.g., "conversations", "messages")
 * @param apiUrl - The API endpoint URL (defaults to "/api/conversations")
 */
const getShapeOptions = (
  table: string,
  apiUrl = "/api/conversations"
) => ({
  url: new URL(
    apiUrl,
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000"
  ).toString(),
  params: {
    table,
  },
});

/**
 * Electric SQL collection for conversations.
 * Provides real-time sync of conversation data.
 *
 * Note: Conversations are created via webhook (incoming messages),
 * so onInsert is not implemented. Only onUpdate is needed for:
 * - Marking as read (unreadCount = 0)
 * - Archiving (status = "archived")
 */
export const conversationCollection = createCollection(
  electricCollectionOptions({
    id: "conversations",
    schema: conversationCollectionSchema,
    getKey: (item) => item.id as number,
    shapeOptions: getShapeOptions("conversations"),

    // DO NOT DELETE this code. We might come back to this later.
    // onUpdate: async ({ transaction }) => {
    //   const results: number[] = [];

    //   for (const mutation of transaction.mutations) {
    //     const conversationId = mutation.key as number;
    //     const changes = mutation.changes;

    //     // Extract only the fields we allow to be updated (using snake_case to match DB)
    //     const updateData: { unread_count?: number; status?: "active" | "archived" | "spam" } = {};

    //     if (typeof changes.unread_count === "number") {
    //       updateData.unread_count = changes.unread_count;
    //     }
    //     if (changes.status === "active" || changes.status === "archived" || changes.status === "spam") {
    //       updateData.status = changes.status;
    //     }

    //     const result = await updateConversationAction(conversationId, updateData);

    //     if (!result.success) {
    //       throw new Error(result.error || "Failed to update conversation");
    //     }

    //     results.push(result.txid!);
    //   }

    //   return { txid: results };
    // },

    onUpdate: async ({ transaction }) => {
      const results: number[] = [];
      for (const mutation of transaction.mutations) {
        const conversationId = Number(mutation.key);
        const changes = mutation.changes;

        const { id, ...updateData } = changes;

        const result = await updateConversationAction(conversationId, updateData);

        if (!result.success) {
          throw new Error(result.error || "Failed to update conversation");
        }

        // txid is guaranteed to exist when success is true
        results.push(result.txid!);
      }

      return { txid: results };
    },

    onDelete: async ({ transaction }) => {
      const results: number[] = [];

      for (const mutation of transaction.mutations) {
        const conversationId = Number(mutation.key);

        const result = await deleteConversationAction(conversationId);

        if (!result.success) {
          throw new Error(result.error || "Failed to delete conversation");
        }

        // txid is guaranteed to exist when success is true
        results.push(result.txid!);
      }

      return { txid: results };
    },
  }),
);

/**
 * Electric SQL collection for messages.
 * Provides real-time sync of message data.
 *
 * Note: Messages are created via webhook (incoming) or send-message action (outgoing),
 * so no mutation handlers are implemented here - this is read-only sync.
 */
export const messageCollection = createCollection(
  electricCollectionOptions({
    id: "messages",
    schema: messageCollectionSchema,
    getKey: (item) => item.id as number,
    shapeOptions: getShapeOptions("messages"),


    onInsert: async ({ transaction }) => {
      const results: number[] = [];

      for (const mutation of transaction.mutations) {
        const messageData = mutation.modified;

        const result = await createMessageAction(messageData);

        if (!result.success) {
          throw new Error(result.error || "Failed to create message");
        }

        // txid is guaranteed to exist when success is true
        results.push(result.txid!);
      }

      return { txid: results };
    },

    onUpdate: async ({ transaction }) => {
      const results: number[] = [];

      for (const mutation of transaction.mutations) {
        const messageId = Number(mutation.key);
        const changes = mutation.changes;

        const { id, ...updateData } = changes;

        const result = await updateMessageAction(messageId, updateData);

        if (!result.success) {
          throw new Error(result.error || "Failed to update message");
        }

        // txid is guaranteed to exist when success is true
        results.push(result.txid!);
      }

      return { txid: results };
    },

    onDelete: async ({ transaction }) => {
      const results: number[] = [];

      for (const mutation of transaction.mutations) {
        const messageId = Number(mutation.key);

        const result = await deleteMessageAction(messageId);

        if (!result.success) {
          throw new Error(result.error || "Failed to delete message");
        }

        // txid is guaranteed to exist when success is true
        results.push(result.txid!);
      }

      return { txid: results };
    },
  })
);
