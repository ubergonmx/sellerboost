import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const error = searchParams.get("error") || "unknown";
  const errorDescription = searchParams.get("error_description") || "";

  // Redirect to custom error page with query params
  const errorPageUrl = new URL("/error", request.url);
  errorPageUrl.searchParams.set("error", error);
  if (errorDescription) {
    errorPageUrl.searchParams.set("error_description", errorDescription);
  }

  return NextResponse.redirect(errorPageUrl);
}
