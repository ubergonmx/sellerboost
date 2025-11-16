import { db } from "@/lib/db"
import { facebookPages, messages, conversations } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import crypto from "crypto"
import { NextRequest } from "next/server"

// GET: Webhook verification (one-time setup by Facebook)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  console.log("Webhook verification request:", { mode, token, challenge })
  console.log("VERIFY_TOKEN:", process.env.FACEBOOK_VERIFY_TOKEN)
  if (mode === "subscribe" && token === process.env.FACEBOOK_VERIFY_TOKEN) {
    console.log("✓ Webhook verified successfully")
    return new Response(challenge, { status: 200 })
  }

  console.error("✗ Webhook verification failed")
  return new Response("Forbidden", { status: 403 })
}

// POST: Receive message events from Facebook
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-hub-signature-256")

    // Verify signature
    if (!verifySignature(body, signature)) {
      console.error("✗ Invalid webhook signature")
      return new Response("Forbidden", { status: 403 })
    }

    const data = JSON.parse(body)

    // Quick acknowledgment (must respond within 20 seconds)
    const responsePromise = Promise.resolve(new Response("OK", { status: 200 }))

    // Process webhook events asynchronously
    if (data.object === "page") {
      processWebhookEvents(data).catch((error) => {
        console.error("Error processing webhook events:", error)
      })
    }

    return responsePromise
  } catch (error) {
    console.error("Error in webhook POST handler:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

// Verify webhook signature from Facebook
function verifySignature(payload: string, signature: string | null): boolean {
  if (!signature) return false

  const expectedSignature = crypto
    .createHmac("sha256", process.env.FACEBOOK_CLIENT_SECRET!)
    .update(payload)
    .digest("hex")

  return `sha256=${expectedSignature}` === signature
}

// Process webhook events
async function processWebhookEvents(body: any) {
  for (const entry of body.entry) {
    const pageId = entry.id // Facebook Page ID

    // Find which user owns this Page
    const [page] = await db
      .select()
      .from(facebookPages)
      .where(eq(facebookPages.pageId, pageId))
      .limit(1)

    if (!page) {
      console.warn(`⚠ No user found for Page ID: ${pageId}`)
      continue
    }

    console.log(`📨 Processing events for Page: ${page.pageName} (User ID: ${page.userId})`)

    // Process each messaging event
    for (const event of entry.messaging || []) {
      await processMessagingEvent(page, event)
    }
  }
}

// Handle individual messaging event
async function processMessagingEvent(page: typeof facebookPages.$inferSelect, event: any) {
  const timestamp = new Date(event.timestamp)

  // 1. Handle incoming message (not an echo)
  if (event.message && !event.message.is_echo) {
    const senderId = event.sender.id // Customer's PSID

    console.log(`💬 New message from ${senderId}: ${event.message.text || "[attachment]"}`)

    // Store message in database
    await db.insert(messages).values({
      userId: page.userId,
      facebookPageId: page.id,
      pageId: page.pageId,
      messageId: event.message.mid,
      senderId: senderId,
      recipientId: event.recipient.id,
      direction: "incoming",
      messageText: event.message.text || null,
      attachments: event.message.attachments || null,
      timestamp: timestamp,
      status: "delivered",
      isEcho: false,
    })

    // Update or create conversation
    await upsertConversation(page, senderId, event.message.text, timestamp)

    console.log(`✓ Message saved for user ${page.userId}`)
  }

  // 2. Handle message echo (message sent by Page)
  if (event.message && event.message.is_echo) {
    console.log(`📤 Echo message: ${event.message.text || "[attachment]"}`)

    // Update message status if we sent it
    await db
      .update(messages)
      .set({ status: "sent" })
      .where(eq(messages.messageId, event.message.mid))
  }

  // 3. Handle delivery confirmation
  if (event.delivery) {
    console.log(`✓ Delivery confirmed for ${event.delivery.mids?.length || 0} messages`)

    for (const mid of event.delivery.mids || []) {
      await db
        .update(messages)
        .set({ status: "delivered" })
        .where(eq(messages.messageId, mid))
    }
  }

  // 4. Handle read receipt
  if (event.read) {
    const readTimestamp = new Date(event.read.watermark)
    console.log(`👀 Messages read up to: ${readTimestamp.toISOString()}`)

    // Update all messages from this sender that were sent before watermark
    await db
      .update(messages)
      .set({ status: "read" })
      .where(
        and(
          eq(messages.pageId, page.pageId),
          eq(messages.senderId, event.sender.id),
          eq(messages.direction, "outgoing")
        )
      )

    // Reset unread count for conversation
    await db
      .update(conversations)
      .set({ unreadCount: 0 })
      .where(
        and(
          eq(conversations.pageId, page.pageId),
          eq(conversations.userPsid, event.sender.id)
        )
      )
  }
}

// Update or create conversation
async function upsertConversation(
  page: typeof facebookPages.$inferSelect,
  userPsid: string,
  messageText: string | null,
  timestamp: Date
) {
  // Check if conversation exists
  const [existingConversation] = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.pageId, page.pageId),
        eq(conversations.userPsid, userPsid)
      )
    )
    .limit(1)

  if (existingConversation) {
    // Update existing conversation
    await db
      .update(conversations)
      .set({
        lastMessageAt: timestamp,
        lastMessageText: messageText || existingConversation.lastMessageText,
        unreadCount: (existingConversation.unreadCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, existingConversation.id))
  } else {
    // Create new conversation
    await db.insert(conversations).values({
      userId: page.userId,
      facebookPageId: page.id,
      pageId: page.pageId,
      userPsid: userPsid,
      userName: null, // Will be updated when we fetch user profile
      userProfilePic: null,
      lastMessageAt: timestamp,
      lastMessageText: messageText,
      unreadCount: 1,
      status: "active",
    })

    console.log(`✓ New conversation created for user ${userPsid}`)
  }
}
