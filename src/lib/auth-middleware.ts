import { NextRequest, NextResponse } from "next/server"
import { auth } from "./auth"

export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  try {
    // Get session from the request
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has admin role
    const userRole = (session.user as any).role
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    return await handler(request, session.user)
  } catch (error) {
    console.error("Auth middleware error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    )
  }
}

export async function requireAuth(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      throw new Error("No session found")
    }

    const userRole = (session.user as any).role
    if (userRole !== "ADMIN") {
      throw new Error("Admin access required")
    }

    return session.user
  } catch (error) {
    throw new Error("Unauthorized")
  }
}