# Developing locally with ngrok
Always change the following values in the respective files. No trailing forward slashes.

[`.env`](./.env):
```
BETTER_AUTH_URL=https://<your-url>.ngrok-free.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://<your-url>.ngrok-free.app
```

[`/src/lib/auth/config.ts`](./src/lib/auth/config.ts):
```ts
export const auth = betterAuth({
  trustedOrigins: [
    "https://<your-url>.ngrok-free.app"
  ]
})
```

Enter here your last URL so you can easily do Ctrl/Cmd+Shift+F and then replace all instances:

https://galilea-mouthy-veola.ngrok-free.dev

## Facebook Developer App
- You need to update the webhook URL and enter the secret token. 
- Update the trusted domains in the app settings to include:
`https://<your-url>.ngrok-free.app/api/auth/callback/facebook`
`https://<your-url>.ngrok-free.app/api/auth/oauth2/callback/facebook-pages`