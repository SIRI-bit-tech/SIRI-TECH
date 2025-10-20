"use client"

import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

export function useAuth() {
  const { data: session, isPending, error } = useSession()
  const router = useRouter()

  const isAuthenticated = !!session?.user
  const isAdmin = (session?.user as any)?.role === "ADMIN"
  const user = session?.user

  const redirectToLogin = useCallback((redirectTo?: string) => {
    const loginUrl = redirectTo 
      ? `/admin/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/admin/login"
    router.push(loginUrl)
  }, [router])

  const redirectToDashboard = useCallback(() => {
    router.push("/admin")
  }, [router])

  return {
    user,
    session,
    isAuthenticated,
    isAdmin,
    isPending,
    error,
    redirectToLogin,
    redirectToDashboard,
  }
}