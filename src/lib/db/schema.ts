import { pgTable, integer, text, boolean, timestamp, uuid, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";

// ============================================================================
// CORE AUTH TABLES (Better Auth)
// ============================================================================

// User table with integer ID (internal) and UUID uid (external/exposed)
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Session table with integer ID and integer userId foreign key
export const sessions = pgTable("sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Account table with integer ID and integer userId foreign key
export const accounts = pgTable("accounts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
  scope: text("scope"),
  idToken: text("id_token"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// Verification table with integer ID
export const verifications = pgTable("verifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================================================
// BUSINESS & TEAM TABLES (Multi-tenant support)
// ============================================================================

// Business settings type
export type BusinessSettings = {
  enableAutoReply?: boolean;
  autoReplyMessage?: string;
  businessHours?: {
    [day: string]: { open: string; close: string } | null;
  };
  paymentMethods?: string[];
  shippingMethods?: string[];
};

// Businesses (multi-tenant support for subdomain)
export const businesses = pgTable("businesses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // for subdomain routing
  logo: text("logo"),
  currency: text("currency").default("PHP"),
  timezone: text("timezone").default("Asia/Manila"),
  settings: jsonb("settings").$type<BusinessSettings>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_businesses_slug").on(table.slug),
  index("idx_businesses_user_id").on(table.userId),
]);

// Team member permissions type
export type TeamMemberPermissions = string[];

// Team members (team within a business)
export const teamMembers = pgTable("team_members", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'owner' | 'admin' | 'member'
  permissions: jsonb("permissions").$type<TeamMemberPermissions>(),
  invitedAt: timestamp("invited_at", { withTimezone: true }),
  joinedAt: timestamp("joined_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_team_members_business_user").on(table.businessId, table.userId),
]);

// ============================================================================
// FACEBOOK INTEGRATION TABLES
// ============================================================================

// Facebook Pages connected by users
export const facebookPages = pgTable("facebook_pages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  pageId: text("page_id").notNull().unique(), // Facebook Page ID
  pageName: text("page_name").notNull(),
  pageAccessToken: text("page_access_token").notNull(), // Encrypted token
  pictureUrl: text("picture_url"),
  category: text("category"),
  tasks: jsonb("tasks").$type<string[]>(), // Page permissions/roles
  connectedAt: timestamp("connected_at", { withTimezone: true }).notNull().defaultNow(),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => [
  index("idx_facebook_pages_business_id").on(table.businessId),
  index("idx_facebook_pages_user_id").on(table.userId),
  index("idx_facebook_pages_page_id").on(table.pageId),
]);

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

// User profiles (cache Facebook user data)
export const userProfiles = pgTable("user_profiles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  pageId: text("page_id").notNull(),
  userPsid: text("user_psid").notNull(), // Page-Scoped ID
  firstName: text("first_name"),
  lastName: text("last_name"),
  profilePic: text("profile_pic"),
  locale: text("locale"),
  timezone: integer("timezone"),
  lastUpdated: timestamp("last_updated", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_user_profiles_page_psid").on(table.pageId, table.userPsid),
  index("idx_user_profiles_business_id").on(table.businessId),
  index("idx_user_profiles_page_id").on(table.pageId),
]);

// ============================================================================
// CUSTOMER TABLES
// ============================================================================

// Customers (business customers, separate from Facebook userProfiles)
export const customers = pgTable("customers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  userProfileId: integer("user_profile_id")
    .references(() => userProfiles.id, { onDelete: "set null" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email"),
  phone: text("phone"),
  notes: text("notes"),
  tags: jsonb("tags").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_customers_business_id").on(table.businessId),
  index("idx_customers_user_profile_id").on(table.userProfileId),
  index("idx_customers_business_phone").on(table.businessId, table.phone),
]);

// Addresses (customer shipping/billing addresses)
export const addresses = pgTable("addresses", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  label: text("label").notNull(), // 'home' | 'work' | 'shipping' | 'billing' | 'other'
  recipientName: text("recipient_name"), // if different from customer
  phone: text("phone"),
  line1: text("line1").notNull(), // street address
  line2: text("line2"), // unit/apt/floor
  city: text("city").notNull(),
  province: text("province").notNull(),
  postalCode: text("postal_code"),
  country: text("country").default("PH"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_addresses_customer_id").on(table.customerId),
]);

// ============================================================================
// CONVERSATION & MESSAGING TABLES
// ============================================================================

// Conversations (aggregate view of message threads)
export const conversations = pgTable("conversations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  facebookPageId: integer("facebook_page_id")
    .notNull()
    .references(() => facebookPages.id, { onDelete: "cascade" }),
  pageId: text("page_id").notNull(), // Facebook Page ID (denormalized for quick lookups)
  userPsid: text("user_psid").notNull(), // Page-Scoped User ID
  userName: text("user_name"),
  userProfilePic: text("user_profile_pic"),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull(),
  lastMessageText: text("last_message_text"), // Cache last message for quick display
  lastMessageDirection: text("last_message_direction"), // 'incoming' | 'outgoing'
  unreadCount: integer("unread_count").default(0),
  status: text("status").default("active"), // active, archived, spam
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_conversations_page_psid").on(table.pageId, table.userPsid),
  index("idx_conversations_business_id").on(table.businessId, table.lastMessageAt),
  index("idx_conversations_user_id").on(table.userId, table.lastMessageAt),
  index("idx_conversations_page_id").on(table.pageId, table.lastMessageAt),
]);

// Conversation labels (labels/tags for conversations)
export const conversationLabels = pgTable("conversation_labels", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull(), // hex color e.g., '#FF5733'
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_conversation_labels_business_name").on(table.businessId, table.name),
]);

// Conversation label assignments (junction table: many-to-many)
export const conversationLabelAssignments = pgTable("conversation_label_assignments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  conversationId: integer("conversation_id")
    .notNull()
    .references(() => conversations.id, { onDelete: "cascade" }),
  labelId: integer("label_id")
    .notNull()
    .references(() => conversationLabels.id, { onDelete: "cascade" }),
  assignedBy: integer("assigned_by")
    .references(() => users.id, { onDelete: "set null" }),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("idx_conversation_label_assignments_conv_label").on(table.conversationId, table.labelId),
]);

// Messages (both incoming and outgoing)
export const messages = pgTable("messages", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  facebookPageId: integer("facebook_page_id")
    .notNull()
    .references(() => facebookPages.id, { onDelete: "cascade" }),
  pageId: text("page_id").notNull(), // Facebook Page ID (denormalized for quick lookups)
  messageId: text("message_id").notNull().unique(), // Facebook message ID
  conversationId: integer("conversation_id"), // Will reference conversations table
  senderId: text("sender_id").notNull(), // Facebook User ID (PSID) or Page ID
  recipientId: text("recipient_id").notNull(), // Facebook User ID (PSID) or Page ID
  direction: text("direction").notNull(), // 'incoming' | 'outgoing'
  messageType: text("message_type").default("message"), // 'message' | 'internal_note'
  authorId: integer("author_id")
    .references(() => users.id, { onDelete: "set null" }), // for internal notes, who wrote it
  messageText: text("message_text"),
  attachments: jsonb("attachments").$type<FacebookAttachment[]>(), // Facebook attachment data
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  status: text("status").default("sent"), // sent, delivered, read, failed
  isEcho: boolean("is_echo").default(false), // True for echo messages (sent from Page)
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_messages_user_timestamp").on(table.userId, table.timestamp),
  index("idx_messages_page_timestamp").on(table.pageId, table.timestamp),
  index("idx_messages_conversation_timestamp").on(table.conversationId, table.timestamp),
]);

// ============================================================================
// ORDER & INVOICE TABLES
// ============================================================================

// Orders
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  customerId: integer("customer_id")
    .references(() => customers.id, { onDelete: "set null" }),
  conversationId: integer("conversation_id")
    .references(() => conversations.id, { onDelete: "set null" }),
  shippingAddressId: integer("shipping_address_id")
    .references(() => addresses.id, { onDelete: "set null" }),
  orderNumber: text("order_number").notNull().unique(), // human-readable (e.g., ORD-2025-0001)
  status: text("status").notNull().default("draft"), // 'draft' | 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  subtotal: integer("subtotal").notNull(), // in cents
  discountAmount: integer("discount_amount").default(0), // in cents
  discountReason: text("discount_reason"),
  shippingFee: integer("shipping_fee").default(0), // in cents
  taxAmount: integer("tax_amount").default(0), // in cents
  grandTotal: integer("grand_total").notNull(), // in cents
  currency: text("currency").default("PHP"),
  customerNotes: text("customer_notes"), // notes from customer
  internalNotes: text("internal_notes"), // internal staff notes
  shippingMethod: text("shipping_method"), // e.g., 'LBC', 'J&T', 'Grab', 'Pickup'
  trackingNumber: text("tracking_number"),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  shippedAt: timestamp("shipped_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_orders_business_created").on(table.businessId, table.createdAt),
  index("idx_orders_customer_id").on(table.customerId),
  index("idx_orders_conversation_id").on(table.conversationId),
  uniqueIndex("idx_orders_order_number").on(table.orderNumber),
  index("idx_orders_status").on(table.status),
]);

// Order item metadata type
export type OrderItemMetadata = {
  imageUrl?: string;
  variant?: string;
  originalPrice?: number;
  [key: string]: unknown;
};

// Order items (line items within an order)
export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'product' | 'shipping' | 'fee' | 'discount'
  description: text("description").notNull(),
  sku: text("sku"), // for inventory tracking later
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(), // in cents
  totalPrice: integer("total_price").notNull(), // qty * unitPrice, in cents
  metadata: jsonb("metadata").$type<OrderItemMetadata>(),
  sortOrder: integer("sort_order").default(0), // for display ordering
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_order_items_order_id").on(table.orderId),
]);

// Invoices table for order management
export const invoices = pgTable("invoices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "set null" }),
  customerId: integer("customer_id")
    .references(() => customers.id, { onDelete: "set null" }),
  conversationId: integer("conversation_id")
    .references(() => conversations.id, { onDelete: "set null" }),
  invoiceNumber: text("invoice_number").notNull().unique(), // e.g., INV-2025-0001
  status: text("status").notNull().default("draft"), // 'draft' | 'open' | 'partially_paid' | 'paid' | 'overdue' | 'void'
  issueDate: timestamp("issue_date", { withTimezone: true }).notNull().defaultNow(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  subtotal: integer("subtotal").notNull(), // in cents
  discountAmount: integer("discount_amount").default(0),
  taxAmount: integer("tax_amount").default(0),
  totalAmount: integer("total_amount").notNull(), // in cents
  amountPaid: integer("amount_paid").default(0), // in cents, tracks partial payments
  amountDue: integer("amount_due").notNull(), // computed: totalAmount - amountPaid
  currency: text("currency").default("PHP"),
  notes: text("notes"), // invoice notes/terms
  paidAt: timestamp("paid_at", { withTimezone: true }),
  voidedAt: timestamp("voided_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_invoices_business_created").on(table.businessId, table.createdAt),
  index("idx_invoices_order_id").on(table.orderId),
  index("idx_invoices_customer_id").on(table.customerId),
  uniqueIndex("idx_invoices_invoice_number").on(table.invoiceNumber),
  index("idx_invoices_status").on(table.status),
]);

// Payments (track individual payments, supports partial payments)
export const payments = pgTable("payments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  uid: uuid("uid").notNull().unique().defaultRandom(),
  businessId: integer("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "cascade" }),
  orderId: integer("order_id")
    .references(() => orders.id, { onDelete: "set null" }), // denormalized for quick lookup
  amount: integer("amount").notNull(), // in cents
  currency: text("currency").default("PHP"),
  method: text("method").notNull(), // 'cash' | 'bank_transfer' | 'gcash' | 'maya' | 'credit_card' | 'cod' | 'cop' | 'layaway' | 'other'
  channel: text("channel"), // 'online' | 'walk_in' | 'delivery'
  status: text("status").notNull().default("pending"), // 'pending' | 'completed' | 'failed' | 'refunded'
  referenceNumber: text("reference_number"), // bank ref, transaction ID, etc.
  notes: text("notes"),
  receivedBy: integer("received_by")
    .references(() => users.id, { onDelete: "set null" }), // staff who received payment
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_payments_business_created").on(table.businessId, table.createdAt),
  index("idx_payments_invoice_id").on(table.invoiceId),
  index("idx_payments_order_id").on(table.orderId),
  index("idx_payments_status").on(table.status),
]);
