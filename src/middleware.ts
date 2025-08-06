import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.includes('.') ||
    pathname === '/signin' ||
    pathname === '/signup' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname === '/signout' ||
    pathname === '/contact' ||
    pathname === '/auth-test' ||
    pathname === '/login-test'
  ) {
    return NextResponse.next()
  }

  // Check for session token
  const sessionToken = request.cookies.get('session-token')?.value
  
  // If no session token, redirect to signin
  if (!sessionToken) {
    const signInUrl = new URL('/signin', request.url)
    signInUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Allow access if session token exists (we could add JWT verification here)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}