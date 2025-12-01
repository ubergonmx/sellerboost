import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";

const baseURL =
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [genericOAuthClient()],
});

const DEFAULT_LOGIN_REDIRECT = "/app";
const ERROR_CALLBACK_URL = `${baseURL}/error`;

export const signInWithFacebook = async () => {
  await authClient.signIn.social({
    provider: "facebook",
    callbackURL: DEFAULT_LOGIN_REDIRECT,
    errorCallbackURL: ERROR_CALLBACK_URL,
  });
};

export const signInWithGoogle = async () => {
  await authClient.signIn.social({
    provider: "google",
    callbackURL: DEFAULT_LOGIN_REDIRECT,
    errorCallbackURL: ERROR_CALLBACK_URL,
  });
};

export const signOut = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        window.location.href = "/";
      },
    },
  });
};
