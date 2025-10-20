"use client"

import { createAuthClient } from "better-auth/react"

export const { signIn, signOut, signUp, useSession } = createAuthClient({
  baseURL: process.env.NODE_ENV === "production" 
    ? process.env.NEXTAUTH_URL || "https://your-domain.com"
    : "http://localhost:3000"
})