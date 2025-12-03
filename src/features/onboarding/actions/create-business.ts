"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import { businesses, teamMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/config";
import { createBusinessSchema, type CreateBusinessInput } from "../schemas/business";
import { eq } from "drizzle-orm";

interface CreateBusinessResult {
  business?: {
    id: number;
    uid: string;
    name: string;
    slug: string;
  };
  error?: string;
}

export async function createBusiness(
  input: CreateBusinessInput
): Promise<CreateBusinessResult> {
  try {
    // Validate input
    const parsed = createBusinessSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || "Invalid input" };
    }

    // Get current user session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "You must be logged in to create a business" };
    }

    const userId = session.user.id as unknown as number;

    // Check if slug is already taken
    const existingBusiness = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.slug, parsed.data.slug))
      .limit(1);

    if (existingBusiness.length > 0) {
      return { error: "This URL slug is already taken. Please choose another." };
    }

    // Create the business
    const [newBusiness] = await db
      .insert(businesses)
      .values({
        userId,
        name: parsed.data.name,
        slug: parsed.data.slug,
      })
      .returning({
        id: businesses.id,
        uid: businesses.uid,
        name: businesses.name,
        slug: businesses.slug,
      });

    if (!newBusiness) {
      return { error: "Failed to create business" };
    }

    // Add the creator as owner in team_members
    await db.insert(teamMembers).values({
      businessId: newBusiness.id,
      userId,
      role: "owner",
      joinedAt: new Date(),
    });

    return { business: newBusiness };
  } catch (error) {
    console.error("Error creating business:", error);
    return { error: "An unexpected error occurred" };
  }
}
