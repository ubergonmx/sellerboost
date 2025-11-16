import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { nextCookies } from "better-auth/next-js";
import { getPages, subscribePageToWebhook } from "./facebook";
import { createFacebookPage } from "@/dal/facebook";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.user,
    }
  }),
  advanced: {
    database: {
      generateId: false,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  hooks: {
    after: createAuthMiddleware(async (ctx) => {
      // Run after sign-in/sign-up with Facebook
      if (ctx.path.includes("facebook")) {
        const session = ctx.context.newSession;
        
        if (session?.user?.id) {
          try {
            // Get the access token for Facebook
            const { accessToken } = await auth.api.getAccessToken({
              body: {
                providerId: "facebook",
                userId: session.user.id,
              },
            });

            if (accessToken) {
              const pages = await getPages(accessToken);
              console.log("Facebook pages:", pages);
              for (const page of pages) {
                console.log("Creating & subscribing to Facebook page:", page);
                await createFacebookPage(session.user.id, page.id, page.name, page.access_token, page.picture?.data?.url, page.category, page.tasks);
                await subscribePageToWebhook(page.id, page.access_token);
              }
            }
          } catch (error) {
            console.error("Error getting Facebook pages:", error);
          }
        }
      }
    })
  },
  socialProviders: {
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      scope: [
        "email", // User&apos;s email
        "pages_messaging", // Send/receive messages
        "pages_manage_engagement", // Manage inbox
        "pages_read_engagement", // Read engagement data
        "pages_manage_metadata", // REQUIRED for webhooks!
      ],
      onError: (error: Error, request: { url: string; method: string }) => {
        console.error("Facebook OAuth Error:", {
          error,
          message: error.message,
          stack: error.stack,
          request: {
            url: request.url,
            method: request.method,
          },
        })
      },
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      onError: (error: Error, request: { url: string; method: string }) => {
        console.error("Google OAuth Error:", {
          error,
          message: error.message,
          stack: error.stack,
          request: {
            url: request.url,
            method: request.method,
          },
        })
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Console log for now - replace with actual email sending later
      console.log("=== Email Verification ===");
      console.log("To:", user.email);
      console.log("Verification URL:", url);
      console.log("Token:", token);
      console.log("========================");
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["facebook", "google"],
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://localhost:3006",
    "http://localhost:3007",
    "http://localhost:3008",
    "http://localhost:3009",
    "https://6ecb64e5d3a5.ngrok-free.app",
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET as string,
  plugins: [
    nextCookies(),
  ]
});

