import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/verify-otp',
  '/approval-pending',
  '/under-development'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclude static files, _next, api, and root route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/assets') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route))
  const token = request.cookies.get('courtify_vendor_token')?.value

  if (!token && !isPublicRoute) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Optional: Redirect authenticated users away from login/register
  if (token && (pathname === '/login' || pathname === '/register')) {
    const dashUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
