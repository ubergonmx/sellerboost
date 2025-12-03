import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { conversations, facebookPages } from "@/lib/db/schema";
import { encryptToken } from "@/lib/encryption";

export async function upsertFacebookPage(
  userId: string,
  businessId: number,
  pageId: string,
  pageName: string,
  pageAccessToken: string,
  pictureUrl: string,
  category: string,
  tasks: string[],
) {
  const encryptedAccessToken = await encryptToken(pageAccessToken);
  if (!encryptedAccessToken) {
    throw new Error("Failed to encrypt page access token");
  }
  await db
    .insert(facebookPages)
    .values({
      businessId: businessId,
      pageId: pageId,
      pageName: pageName,
      pageAccessToken: encryptedAccessToken,
      pictureUrl: pictureUrl,
      category: category,
      tasks: tasks,
      userId: parseInt(userId, 10),
      isActive: true,
    })
    .onConflictDoUpdate({
      target: [facebookPages.pageId],
      set: {
        pageName: pageName,
        pageAccessToken: encryptedAccessToken,
        pictureUrl: pictureUrl,
        category: category,
        tasks: tasks,
        isActive: true,
        lastSyncAt: new Date(),
        connectedAt: new Date(),
      },
    });
}

export async function getFacebookPages(userId: string) {
  const pages = await db
    .select()
    .from(facebookPages)
    .where(eq(facebookPages.userId, parseInt(userId, 10)));
  return pages;
}

export async function getConversationsWithPages(userId: number) {
  // Fetch conversations with joined Facebook page data
  const result = await db
    .select({
      conversation: conversations,
      page: {
        pageName: facebookPages.pageName,
        pictureUrl: facebookPages.pictureUrl,
        pageId: facebookPages.pageId,
      },
    })
    .from(conversations)
    .innerJoin(
      facebookPages,
      eq(conversations.facebookPageId, facebookPages.id),
    )
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.lastMessageAt))
    .limit(100);

  return result.map((row) => ({
    ...row.conversation,
    pageName: row.page.pageName,
    pagePictureUrl: row.page.pictureUrl,
    pageId: row.page.pageId,
  }));
}

/**
 * Fetch user profile information from Facebook Graph API
 * @param userPsid - Page-scoped user ID (PSID)
 * @param pageAccessToken - Page access token
 * @returns User profile data including name and profile picture
 */
export async function getUserInfo(userPsid: string, pageAccessToken: string) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v24.0/${userPsid}?` +
        `access_token=${pageAccessToken}&fields=first_name,last_name,profile_pic`,
    );
    const data = await response.json();

    if (data.error) {
      console.error("Facebook API error:", data.error);
      return null;
    }

    return {
      firstName: data.first_name,
      lastName: data.last_name,
      profilePic: data.profile_pic,
      fullName: `${data.first_name} ${data.last_name}`.trim(),
    };
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}
