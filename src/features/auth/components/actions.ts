"use server"

import { auth } from "@/lib/auth/config"
import { loginSchema, type LoginInput, signUpSchema, type SignUpInput } from "@/schemas/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(data: LoginInput) {
  const validatedData = loginSchema.safeParse(data)

  if (!validatedData.success) {
    return {
      success: false as const,
      error: validatedData.error.issues[0]?.message || "Validation failed",
    }
  }

  try {
    const headersList = await headers()
    
    const response = await auth.api.signInEmail({
      body: {
        email: validatedData.data.email,
        password: validatedData.data.password,
        rememberMe: validatedData.data.rememberMe,
      },
      headers: headersList,
    })

    // With nextCookies() plugin, cookies should be automatically set
    // But we need to ensure they're set on the response
    // The response from auth.api methods includes cookie information
    if (response.user) {
      redirect("/dashboard")
    }

    return {
      success: false as const,
      error: "Failed to sign in",
    }
  } catch (err) {
    // Next.js redirect throws a special error, re-throw it
    if (err && typeof err === "object" && "digest" in err) {
      throw err
    }
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "An unexpected error occurred",
    }
  }
}

export async function signUpAction(data: SignUpInput) {
  const validatedData = signUpSchema.safeParse(data)

  if (!validatedData.success) {
    return {
      success: false as const,
      error: validatedData.error.issues[0]?.message || "Validation failed",
    }
  }

  try {
    const headersList = await headers()
    
    const response = await auth.api.signUpEmail({
      body: {
        email: validatedData.data.email,
        password: validatedData.data.password,
        name: `${validatedData.data.firstname} ${validatedData.data.lastname}`,
      },
      headers: headersList,
    })

    // With nextCookies() plugin, cookies are automatically set
    // If sign up was successful, redirect to dashboard
    if (response.user) {
      redirect("/dashboard")
    }

    return {
      success: false as const,
      error: "Failed to create account",
    }
  } catch (err) {
    // Next.js redirect throws a special error, re-throw it
    if (err && typeof err === "object" && "digest" in err) {
      throw err
    }
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "An unexpected error occurred",
    }
  }
}

