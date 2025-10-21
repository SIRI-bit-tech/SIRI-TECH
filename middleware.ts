import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes and API auth routes
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    !pathname.startsWith("/admin")
  ) {
    return NextResponse.next()
  }

  // Allow access to login page
  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  try {
    // Check if user is authenticated for admin routes
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role
    const userRole = (session.user as any).role
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      )
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware auth error:", error)
    // Redirect to login on auth error
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}