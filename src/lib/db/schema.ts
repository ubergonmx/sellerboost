import { pgTable, integer, text, boolean, timestamp, uuid, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";

// User table with integer ID (internal) and UUID uid (external/exposed)
export const user = pgTable("user", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

// Session table with integer ID and integer userId foreign key
export const session = pgTable("session", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

// Account table with integer ID and integer userId foreign key
export const account = pgTable("account", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { withTimezone: true }),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

// Verification table with integer ID
export const verification = pgTable("verification", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
});

// Facebook Pages connected by users
export const facebookPages = pgTable("facebook_pages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(), // External ID for UI
  userId: integer("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  pageId: text("pageId").notNull().unique(), // Facebook Page ID
  pageName: text("pageName").notNull(),
  pageAccessToken: text("pageAccessToken").notNull(), // Encrypted token
  pictureUrl: text("pictureUrl"),
  category: text("category"),
  tasks: jsonb("tasks").$type<string[]>(), // Page permissions/roles
  connectedAt: timestamp("connectedAt", { withTimezone: true }).notNull().defaultNow(),
  lastSyncAt: timestamp("lastSyncAt", { withTimezone: true }),
  isActive: boolean("isActive").notNull().default(true),
}, (table) => ({
  userIdIdx: index("idx_user_pages").on(table.userId),
  pageIdIdx: index("idx_page_id").on(table.pageId),
}));

// Facebook attachment type definition
export type FacebookAttachment = {
  type: "image" | "video" | "audio" | "file" | "fallback";
  payload: {
    url?: string;
    sticker_id?: number;
    coordinates?: {
      lat: number;
      long: number;
    };
  };
};

// Messages (both incoming and outgoing)
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(), // External ID for UI
  userId: integer("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  facebookPageId: integer("facebookPageId")
    .notNull()
    .references(() => facebookPages.id, { onDelete: "cascade" }),
  pageId: text("pageId").notNull(), // Facebook Page ID (denormalized for quick lookups)
  messageId: text("messageId").notNull().unique(), // Facebook message ID
  conversationId: integer("conversationId"), // Will reference conversations table
  senderId: text("senderId").notNull(), // Facebook User ID (PSID) or Page ID
  recipientId: text("recipientId").notNull(), // Facebook User ID (PSID) or Page ID
  direction: text("direction").notNull(), // 'incoming' or 'outgoing'
  messageText: text("messageText"),
  attachments: jsonb("attachments").$type<FacebookAttachment[]>(), // Facebook attachment data
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  status: text("status").default("sent"), // sent, delivered, read, failed
  isEcho: boolean("isEcho").default(false), // True for echo messages (sent from Page)
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userMessagesIdx: index("idx_user_messages").on(table.userId, table.timestamp),
  pageMessagesIdx: index("idx_page_messages").on(table.pageId, table.timestamp),
  conversationIdx: index("idx_conversation_messages").on(table.conversationId, table.timestamp),
}));

// Conversations (aggregate view of message threads)
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(), // External ID for UI
  userId: integer("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  facebookPageId: integer("facebookPageId")
    .notNull()
    .references(() => facebookPages.id, { onDelete: "cascade" }),
  pageId: text("pageId").notNull(), // Facebook Page ID (denormalized for quick lookups)
  userPsid: text("userPsid").notNull(), // Page-Scoped User ID
  userName: text("userName"),
  userProfilePic: text("userProfilePic"),
  lastMessageAt: timestamp("lastMessageAt", { withTimezone: true }).notNull(),
  lastMessageText: text("lastMessageText"), // Cache last message for quick display
  lastMessageDirection: text("lastMessageDirection"), // 'incoming' or 'outgoing' - direction of last message
  unreadCount: integer("unreadCount").default(0),
  status: text("status").default("active"), // active, archived, spam
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniqueConversation: uniqueIndex("unique_page_user_conversation").on(table.pageId, table.userPsid),
  userConversationsIdx: index("idx_user_conversations").on(table.userId, table.lastMessageAt),
  pageConversationsIdx: index("idx_page_conversations").on(table.pageId, table.lastMessageAt),
}));

// User profiles (cache Facebook user data)
export const userProfiles = pgTable("user_profiles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(), // External ID for UI
  pageId: text("pageId").notNull(),
  userPsid: text("userPsid").notNull(), // Page-Scoped ID
  firstName: text("firstName"),
  lastName: text("lastName"),
  profilePic: text("profilePic"),
  locale: text("locale"),
  timezone: integer("timezone"),
  lastUpdated: timestamp("lastUpdated", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  uniquePageUser: uniqueIndex("unique_page_user").on(table.pageId, table.userPsid),
  pageUsersIdx: index("idx_page_users").on(table.pageId),
}));

// Invoices table for order management
export const invoices = pgTable("invoices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(), // External ID for UI
  userId: integer("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  conversationId: integer("conversationId")
    .references(() => conversations.id, { onDelete: "set null" }),
  invoiceNumber: text("invoiceNumber").notNull().unique(),
  customerName: text("customerName").notNull(),
  customerPsid: text("customerPsid"), // Link to Facebook user
  pageId: text("pageId"),
  items: jsonb("items").$type<Array<{
    description: string;
    quantity: number;
    price: number;
    total: number;
  }>>(),
  subtotal: integer("subtotal").notNull(), // Store in cents
  tax: integer("tax").default(0),
  total: integer("total").notNull(), // Store in cents
  status: text("status").default("draft"), // draft, sent, paid, cancelled
  paymentLinkId: text("paymentLinkId"), // Temporary payment link ID
  paidAt: timestamp("paidAt", { withTimezone: true }),
  dueAt: timestamp("dueAt", { withTimezone: true }),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userInvoicesIdx: index("idx_user_invoices").on(table.userId, table.createdAt),
  conversationInvoicesIdx: index("idx_conversation_invoices").on(table.conversationId),
}));

