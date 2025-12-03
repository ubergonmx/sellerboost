import * as z from "zod";
import { createSelectSchema, createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { conversations, messages } from "@/lib/db/schema";

// ============================================================================
// UTILITY: Key transformation helpers
// ============================================================================

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Transform object keys from camelCase to snake_case
 */
export function toSnakeCaseKeys<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[toSnakeCase(key)] = obj[key];
  }
  return result;
}

/**
 * Transform object keys from snake_case to camelCase
 */
export function toCamelCaseKeys<T extends Record<string, unknown>>(
  obj: T
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    result[toCamelCase(key)] = obj[key];
  }
  return result;
}

// ============================================================================
// DRIZZLE BASE SCHEMAS (camelCase - single source of truth)
// ============================================================================

// These are the source of truth - derived directly from Drizzle schema
export const conversationSelectBase = createSelectSchema(conversations);
// Update schema - omit immutable fields (id is auto-excluded by drizzle-zod for updates)
export const conversationUpdateBase = createUpdateSchema(conversations).omit({
  uid: true,
  userId: true,
  pageId: true,
  userPsid: true,
  createdAt: true,
});

export const messageSelectBase = createSelectSchema(messages);
// Insert schema - omit auto-generated and server-set fields (id is auto-excluded by drizzle-zod for inserts)
export const messageInsertBase = createInsertSchema(messages).omit({
  uid: true,
  userId: true,
  facebookPageId: true,
  messageId: true,
  messageType: true,
  authorId: true,
  attachments: true,
  status: true,
  isEcho: true,
  createdAt: true,
});
// Update schema - omit immutable fields (id is auto-excluded by drizzle-zod for updates)
export const messageUpdateBase = createUpdateSchema(messages).omit({
  uid: true,
  userId: true,
  facebookPageId: true,
  messageId: true,
  createdAt: true,
});

// ============================================================================
// COLLECTION SCHEMAS (snake_case - for Electric SQL)
// Using z.preprocess to transform keys before validation
// ============================================================================

// Type helpers for snake_case versions
type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Uppercase<T> ? "_" : ""}${Lowercase<T>}${CamelToSnake<U>}`
  : S;

type CamelToSnakeKeys<T> = {
  [K in keyof T as CamelToSnake<K & string>]: T[K];
};

/**
 * Creates a schema that accepts snake_case keys and validates them.
 * Returns data with snake_case keys (for Electric SQL collection compatibility).
 */
function createSnakeCaseSelectSchema<T extends z.ZodRawShape>(
  baseSchema: z.ZodObject<T>
) {
  return z.preprocess(
    (data) => {
      // Transform snake_case to camelCase for validation
      if (typeof data === "object" && data !== null) {
        return toCamelCaseKeys(data as Record<string, unknown>);
      }
      return data;
    },
    baseSchema
  ).transform((data) => {
    // Transform back to snake_case for output
    return toSnakeCaseKeys(data as Record<string, unknown>) as CamelToSnakeKeys<z.infer<typeof baseSchema>>;
  });
}

/**
 * Schema for Electric SQL collection - uses snake_case keys.
 * Derived from the Drizzle schema (single source of truth).
 */
export const conversationCollectionSchema = createSnakeCaseSelectSchema(conversationSelectBase);

/**
 * Message collection schema - uses partial select schema to allow inserts with minimal fields.
 * Reading from DB will have all fields; inserting only requires direction + timestamp.
 */
export const messageCollectionSchema = createSnakeCaseSelectSchema(
  messageSelectBase.partial()
);

// ============================================================================
// ACTION SCHEMAS (snake_case input -> camelCase output for Drizzle)
// ============================================================================

/**
 * Schema for updating conversations from collection mutations.
 * Accepts snake_case input, transforms to camelCase for Drizzle.
 * Uses passthrough() to ignore extra keys (like id) from collection data.
 */
export const updateConversationSchema = z.preprocess(
  (data) => {
    if (typeof data === "object" && data !== null) {
      return toCamelCaseKeys(data as Record<string, unknown>);
    }
    return data;
  },
  conversationUpdateBase.partial().passthrough()
);

/**
 * Schema for creating messages from collection mutations.
 * Accepts snake_case input, transforms to camelCase for Drizzle.
 * Uses passthrough() to ignore extra keys (like id) from collection data.
 */
export const createMessageSchema = z.preprocess(
  (data) => {
    if (typeof data === "object" && data !== null) {
      return toCamelCaseKeys(data as Record<string, unknown>);
    }
    return data;
  },
  messageInsertBase.passthrough()
);

/**
 * Schema for updating messages from collection mutations.
 * Accepts snake_case input, transforms to camelCase for Drizzle.
 * Uses passthrough() to ignore extra keys (like id) from collection data.
 */
export const updateMessageSchema = z.preprocess(
  (data) => {
    if (typeof data === "object" && data !== null) {
      return toCamelCaseKeys(data as Record<string, unknown>);
    }
    return data;
  },
  messageUpdateBase.partial().passthrough()
);

// ============================================================================
// TYPES
// ============================================================================

// Types for internal use (camelCase - matches Drizzle)
export type SelectConversation = z.infer<typeof conversationSelectBase>;
export type UpdateConversationInput = z.infer<typeof conversationUpdateBase>;

export type SelectMessage = z.infer<typeof messageSelectBase>;
export type CreateMessageInput = z.infer<typeof messageInsertBase>;
export type UpdateMessageInput = z.infer<typeof messageUpdateBase>;

// Types for collection data (snake_case - matches Electric SQL)
export type ConversationCollectionItem = z.infer<typeof conversationCollectionSchema>;
export type MessageCollectionItem = z.infer<typeof messageCollectionSchema>;

// ============================================================================
// ACTION RESULT SCHEMA
// ============================================================================

export const actionResultSchema = z.object({
  success: z.boolean(),
  txid: z.number().optional(),
  error: z.string().optional(),
});

export type ActionResult = z.infer<typeof actionResultSchema>;
