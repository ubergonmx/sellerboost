import "server-only"
import { db } from "@/lib/db"
import { facebookPages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { encryptToken } from "@/lib/encryption"

export async function createFacebookPage(userId: string, pageId: string, pageName: string, pageAccessToken: string, pictureUrl: string, category: string, tasks: string[]) {
  const encryptedAccessToken = await encryptToken(pageAccessToken)
  if (!encryptedAccessToken) {
    throw new Error("Failed to encrypt page access token")
  }
  await db.insert(facebookPages).values({
    pageId: pageId,
    pageName: pageName,
    pageAccessToken: encryptedAccessToken,
    pictureUrl: pictureUrl,
    category: category,
    tasks: tasks,
    userId: parseInt(userId),
    isActive: true,
  })
}

export async function getFacebookPages(userId: string) {
  const pages = await db.select().from(facebookPages).where(eq(facebookPages.userId, parseInt(userId)))
  return pages
}