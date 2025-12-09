import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { nextCookies } from "better-auth/next-js";
import { genericOAuth } from "better-auth/plugins";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
    },
    usePlural: true,
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
      // Facebook page connection is now handled during onboarding
      // via linkSocial with extended scopes, not during initial login
      // This hook is kept for any future post-auth processing needs
      if (ctx.path.includes("/callback/") && ctx.params.id === "facebook") {
        const session = ctx.context.newSession;
        if (session?.user?.id) {
          console.log(
            "Facebook login completed for user:",
            session.user.id,
            "- Redirecting to onboarding for page connection"
          );
        }
      }
    }),
  },
  socialProviders: {
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
      // Basic login configId - email + pages_show_list (required for Business type apps)
      configId: "1533455441256952",
      // scopes: ["email", "pages_show_list", "pages_manage_engagement", "pages_read_engagement", "pages_manage_metadata"],
      // scopes: ["email", "public_profile"],
      onError: (error: Error, request: { url: string; method: string }) => {
        console.error("Facebook OAuth Error:", {
          error,
          message: error.message,
          stack: error.stack,
          request: {
            url: request.url,
            method: request.method,
          },
        });
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
        });
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, _request) => {
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
      trustedProviders: ["facebook", "facebook-pages", "google"],
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://192.168.88.104:3000",
    "https://sellerboost.com",
    "https://sellerboost.vercel.app",
    "https://galilea-mouthy-veola.ngrok-free.dev",
  ],
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET as string,
  plugins: [
    nextCookies(),
    genericOAuth({
      config: [
        {
          // Facebook Pages provider for onboarding - has full page permissions
          providerId: "facebook-pages",
          clientId: process.env.FACEBOOK_CLIENT_ID as string,
          clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
          authorizationUrl: "https://www.facebook.com/v19.0/dialog/oauth",
          tokenUrl: "https://graph.facebook.com/v19.0/oauth/access_token",
          // Onboarding configId with page permissions: pages_messaging, pages_manage_engagement, etc.
          authorizationUrlParams: {
            config_id: "4613696038857789",
          },
          getUserInfo: async (tokens) => {
            const response = await fetch(
              `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokens.accessToken}`
            );
            const data = await response.json();
            return {
              id: data.id,
              name: data.name,
              email: data.email,
              image: data.picture?.data?.url,
              emailVerified: true,
            };
          },
        },
      ],
    }),
  ],
});
