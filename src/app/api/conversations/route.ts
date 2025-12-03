import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

const ELECTRIC_URL = process.env.ELECTRIC_URL || "http://localhost:4000";

// Allowed tables for this endpoint
const ALLOWED_TABLES = ["conversations", "messages"] as const;
type AllowedTable = (typeof ALLOWED_TABLES)[number];

/**
 * Proxy API route for Electric SQL shape endpoint.
 * Supports both conversations and messages tables.
 * Filters data by authenticated user's ID.
 */
export async function GET(request: Request) {
  try {
    // Verify session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    // Construct the Electric URL
    const url = new URL(request.url);
    const originUrl = new URL("/v1/shape", ELECTRIC_URL);

    // Get the table parameter
    const table = url.searchParams.get("table") as AllowedTable | null;

    // Validate table parameter
    if (!table || !ALLOWED_TABLES.includes(table)) {
      return NextResponse.json(
        { error: `Invalid table. Allowed: ${ALLOWED_TABLES.join(", ")}` },
        { status: 400 }
      );
    }

    // Forward all query params from the original request (except table)
    url.searchParams.forEach((value, key) => {
      if (key !== "table") {
        originUrl.searchParams.set(key, value);
      }
    });

    // Set the table
    originUrl.searchParams.set("table", table);

    // Filter to only return data for this user
    originUrl.searchParams.set("where", `user_id = ${userId}`);

    // Proxy the request to Electric
    const response = await fetch(originUrl.toString(), {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Electric SQL error:",
        response.status,
        response.statusText
      );
      return new NextResponse(response.statusText, {
        status: response.status,
      });
    }

    // Fetch decompresses the body but doesn't remove the
    // content-encoding & content-length headers which would
    // break decoding in the browser.
    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    // Add Vary header for cookie-based auth
    responseHeaders.set("Vary", "Cookie");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Error in conversations API route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
