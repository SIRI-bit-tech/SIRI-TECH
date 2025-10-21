import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'

export async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Skip middleware for public routes and API auth routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/admin/login' ||
    !pathname.startsWith('/admin')
  ) {
    return NextResponse.next()
  }

  try {
    // Check if user is authenticated
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session?.user) {
      // Redirect to login if not authenticated
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has admin role
    if (session.user.role !== 'ADMIN') {
      // Redirect to login if not admin
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    // Redirect to login on any auth error
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ['/admin/:path*']
}