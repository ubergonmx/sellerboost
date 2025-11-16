import { isPublicPath } from "@/lib/public-paths";
import { auth } from "@/lib/auth/config";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API auth routes (handled by Better Auth)
  if (pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  // Verify session using Better Auth API
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If user is already logged in and trying to access auth pages, redirect to dashboard
  if (session?.user && (pathname.startsWith("/login") || pathname.startsWith("/signup"))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow access to public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For protected paths, check authentication
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Match all routes except for static files and Next.js internal routes
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
