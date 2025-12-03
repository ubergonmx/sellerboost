"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { facebookPages } from "@/lib/db/schema";

interface PageInfo {
  id: number;
  pageId: string;
  pageName: string;
  pictureUrl: string | null;
}

interface GetPageInfoResult {
  success: boolean;
  page?: PageInfo;
  error?: string;
}

/**
 * Get Facebook Page info by page_id string.
 * Used to display page name and avatar in conversation views.
 */
export async function getPageInfoAction(
  pageId: string
): Promise<GetPageInfoResult> {
  try {
    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorized. Please login.",
      };
    }

    const userId = parseInt(session.user.id, 10);

    // Get the Facebook Page
    const [page] = await db
      .select({
        id: facebookPages.id,
        pageId: facebookPages.pageId,
        pageName: facebookPages.pageName,
        pictureUrl: facebookPages.pictureUrl,
      })
      .from(facebookPages)
      .where(eq(facebookPages.pageId, pageId))
      .limit(1);

    if (!page) {
      return {
        success: false,
        error: "Page not found",
      };
    }

    // Verify user owns this page
    const [fullPage] = await db
      .select()
      .from(facebookPages)
      .where(eq(facebookPages.id, page.id))
      .limit(1);

    if (fullPage?.userId !== userId) {
      return {
        success: false,
        error: "Page not found or you don't have access",
      };
    }

    return {
      success: true,
      page: {
        id: page.id,
        pageId: page.pageId,
        pageName: page.pageName,
        pictureUrl: page.pictureUrl,
      },
    };
  } catch (error: any) {
    console.error("Error in getPageInfoAction:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred",
    };
  }
}
