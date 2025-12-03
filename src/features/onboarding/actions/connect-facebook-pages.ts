"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { businesses } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { getPages, subscribePageToWebhook } from "@/lib/auth/facebook";
import { eq, and } from "drizzle-orm";
import { upsertFacebookPage } from "@/dal/facebook";

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  picture?: {
    data?: {
      url?: string;
    };
  };
  category?: string;
  tasks?: string[];
}

interface ConnectFacebookPagesResult {
  success: boolean;
  pagesConnected?: number;
  error?: string;
}

export async function connectFacebookPages(
  businessId: number
): Promise<ConnectFacebookPagesResult> {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "You must be logged in" };
    }

    const userId = session.user.id as unknown as number;

    // Verify business exists and user owns it
    const [business] = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(and(eq(businesses.id, businessId), eq(businesses.userId, userId)))
      .limit(1);

    if (!business) {
      return { success: false, error: "Business not found or unauthorized" };
    }

    // Get Facebook access token from linked account
    const { accessToken } = await auth.api.getAccessToken({
      body: {
        providerId: "facebook",
        userId: String(userId),
      },
    });

    if (!accessToken) {
      return { success: false, error: "Facebook account not connected" };
    }

    // Fetch available Facebook pages
    const pages: FacebookPage[] = await getPages(accessToken);

    if (!pages || pages.length === 0) {
      return { success: false, error: "No Facebook pages found" };
    }

    let connectedCount = 0;

    for (const page of pages) {
      try {
        // Upsert the Facebook page using DAL method (handles encryption internally)
        await upsertFacebookPage(
          String(userId),
          businessId,
          page.id,
          page.name,
          page.access_token,
          page.picture?.data?.url ?? "",
          page.category ?? "",
          page.tasks ?? []
        );

        // Subscribe page to webhooks
        await subscribePageToWebhook(page.id, page.access_token);

        connectedCount++;
        console.log(`Connected Facebook page: ${page.name} (${page.id})`);
      } catch (pageError) {
        console.error(`Error connecting page ${page.id}:`, pageError);
        // Continue with other pages even if one fails
      }
    }

    return {
      success: true,
      pagesConnected: connectedCount,
    };
  } catch (error) {
    console.error("Error connecting Facebook pages:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
