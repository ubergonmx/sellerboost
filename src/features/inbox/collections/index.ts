import { deleteConversationAction, updateConversationAction } from "@/features/inbox/actions/conversations";
import { createMessageAction, deleteMessageAction, updateMessageAction } from "@/features/inbox/actions/messages";
import {
  conversationCollectionSchema,
  messageCollectionSchema,
  type ConversationCollectionItem,
  type MessageCollectionItem,
} from "@/features/inbox/schemas";
import type { GetExtensions, Row, ShapeStreamOptions } from "@electric-sql/client";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";

export type { ConversationCollectionItem as Conversation, MessageCollectionItem as Message };

/**
 * Helper function to generate Electric SQL shape options for a given table.
 * @param table - The table name (e.g., "conversations", "messages")
 * @param apiUrl - The API endpoint URL (defaults to "/api/conversations")
 */
const getShapeOptions = <T extends Row<unknown>>(
  table: string,
  apiUrl = "/api/conversations"
): ShapeStreamOptions<GetExtensions<T>> => ({
  url: new URL(
    apiUrl,
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000"
  ).toString(),
  params: {
    table,
  },
  liveSse: true,
});
/**
 * Electric SQL collection for conversations.
 * Provides real-time sync of conversation data.
 */
export const conversationCollection = createCollection(
  electricCollectionOptions({
    id: "conversations",
    schema: conversationCollectionSchema,
    getKey: (item) => item.id as number,
    shapeOptions: getShapeOptions<ConversationCollectionItem>("conversations"),

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
 */
export const messageCollection = createCollection(
  electricCollectionOptions({
    id: "messages",
    schema: messageCollectionSchema,
    getKey: (item) => item.id as number,
    shapeOptions: getShapeOptions<MessageCollectionItem>("messages"),

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
