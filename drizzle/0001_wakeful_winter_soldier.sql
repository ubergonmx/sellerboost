CREATE TABLE "conversations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "conversations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"facebookPageId" integer NOT NULL,
	"pageId" text NOT NULL,
	"userPsid" text NOT NULL,
	"userName" text,
	"userProfilePic" text,
	"lastMessageAt" timestamp with time zone NOT NULL,
	"lastMessageText" text,
	"unreadCount" integer DEFAULT 0,
	"status" text DEFAULT 'active',
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
CREATE TABLE "facebook_pages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "facebook_pages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"pageId" text NOT NULL,
	"pageName" text NOT NULL,
	"pageAccessToken" text NOT NULL,
	"pictureUrl" text,
	"category" text,
	"tasks" jsonb,
	"connectedAt" timestamp with time zone DEFAULT now() NOT NULL,
	"lastSyncAt" timestamp with time zone,
	"isActive" boolean DEFAULT true NOT NULL,
	CONSTRAINT "facebook_pages_uid_unique" UNIQUE("uid"),
	CONSTRAINT "facebook_pages_pageId_unique" UNIQUE("pageId")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "invoices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"conversationId" integer,
	"invoiceNumber" text NOT NULL,
	"customerName" text NOT NULL,
	"customerPsid" text,
	"pageId" text,
	"items" jsonb,
	"subtotal" integer NOT NULL,
	"tax" integer DEFAULT 0,
	"total" integer NOT NULL,
	"status" text DEFAULT 'draft',
	"paymentLinkId" text,
	"paidAt" timestamp with time zone,
	"dueAt" timestamp with time zone,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoices_uid_unique" UNIQUE("uid"),
	CONSTRAINT "invoices_invoiceNumber_unique" UNIQUE("invoiceNumber")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "messages_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"userId" integer NOT NULL,
	"facebookPageId" integer NOT NULL,
	"pageId" text NOT NULL,
	"messageId" text NOT NULL,
	"conversationId" integer,
	"senderId" text NOT NULL,
	"recipientId" text NOT NULL,
	"direction" text NOT NULL,
	"messageText" text,
	"attachments" jsonb,
	"timestamp" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'sent',
	"isEcho" boolean DEFAULT false,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_uid_unique" UNIQUE("uid"),
	CONSTRAINT "messages_messageId_unique" UNIQUE("messageId")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_profiles_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"uid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"pageId" text NOT NULL,
	"userPsid" text NOT NULL,
	"firstName" text,
	"lastName" text,
	"profilePic" text,
	"locale" text,
	"timezone" integer,
	"lastUpdated" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_facebookPageId_facebook_pages_id_fk" FOREIGN KEY ("facebookPageId") REFERENCES "public"."facebook_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facebook_pages" ADD CONSTRAINT "facebook_pages_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_conversationId_conversations_id_fk" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_facebookPageId_facebook_pages_id_fk" FOREIGN KEY ("facebookPageId") REFERENCES "public"."facebook_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_page_user_conversation" ON "conversations" USING btree ("pageId","userPsid");--> statement-breakpoint
CREATE INDEX "idx_user_conversations" ON "conversations" USING btree ("userId","lastMessageAt");--> statement-breakpoint
CREATE INDEX "idx_page_conversations" ON "conversations" USING btree ("pageId","lastMessageAt");--> statement-breakpoint
CREATE INDEX "idx_user_pages" ON "facebook_pages" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "idx_page_id" ON "facebook_pages" USING btree ("pageId");--> statement-breakpoint
CREATE INDEX "idx_user_invoices" ON "invoices" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "idx_conversation_invoices" ON "invoices" USING btree ("conversationId");--> statement-breakpoint
CREATE INDEX "idx_user_messages" ON "messages" USING btree ("userId","timestamp");--> statement-breakpoint
CREATE INDEX "idx_page_messages" ON "messages" USING btree ("pageId","timestamp");--> statement-breakpoint
CREATE INDEX "idx_conversation_messages" ON "messages" USING btree ("conversationId","timestamp");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_page_user" ON "user_profiles" USING btree ("pageId","userPsid");--> statement-breakpoint
CREATE INDEX "idx_page_users" ON "user_profiles" USING btree ("pageId");