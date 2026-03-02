import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { UserRole } from '@prisma/client'

// Role-based route access configuration (must match auth.config.ts)
const roleRoutes: Record<UserRole, string[]> = {
  SUPER_ADMIN: ['/admin', '/staff', '/patients', '/appointments', '/pharmacy', '/lab', '/radiology', '/billing', '/wards', '/reports', '/dashboard', '/doctor', '/nurse', '/receptionist', '/pharmacist', '/settings'],
  HOSPITAL_ADMIN: ['/admin', '/staff', '/patients', '/appointments', '/pharmacy', '/lab', '/radiology', '/billing', '/wards', '/reports', '/dashboard', '/settings'],
  DOCTOR: ['/doctor', '/patients', '/appointments', '/pharmacy', '/lab', '/radiology', '/dashboard', '/settings'],
  NURSE: ['/nurse', '/patients', '/appointments', '/dashboard', '/settings'],
  RECEPTIONIST: ['/receptionist', '/patients', '/appointments', '/billing', '/dashboard', '/settings'],
  PHARMACIST: ['/pharmacist', '/pharmacy', '/dashboard', '/settings'],
  LAB_TECHNICIAN: ['/lab', '/dashboard', '/settings'],
  RADIOLOGIST: ['/radiology', '/dashboard', '/settings'],
  BILLING_STAFF: ['/billing', '/patients', '/dashboard', '/settings'],
  INSURANCE_OFFICER: ['/billing', '/insurance', '/dashboard', '/settings'],
  WARD_MANAGER: ['/wards', '/patients', '/dashboard', '/settings'],
  PATIENT: ['/patient', '/appointments', '/billing', '/dashboard', '/settings'],
}

// Get default route for each role
function getDefaultRouteForRole(role: UserRole): string {
  const defaultRoutes: Record<UserRole, string> = {
    SUPER_ADMIN: '/admin',
    HOSPITAL_ADMIN: '/admin',
    DOCTOR: '/doctor',
    NURSE: '/nurse',
    RECEPTIONIST: '/receptionist',
    PHARMACIST: '/pharmacist',
    LAB_TECHNICIAN: '/lab',
    RADIOLOGIST: '/radiology',
    BILLING_STAFF: '/billing',
    INSURANCE_OFFICER: '/billing',
    WARD_MANAGER: '/wards',
    PATIENT: '/patient',
  }
  return defaultRoutes[role] || '/dashboard'
}

// Check if user has access to route
function hasRouteAccess(role: UserRole, pathname: string): boolean {
  const allowedRoutes = roleRoutes[role] || []
  return allowedRoutes.some(route => pathname.startsWith(route))
}

// Extract role from session token (simplified for edge runtime)
function getRoleFromCookies(request: NextRequest): UserRole | null {
  // The role is stored in the JWT token, but we can't decode it in edge middleware
  // Instead, we rely on auth.config.ts authorized callback for role checking
  // This middleware handles basic auth protection, auth.config.ts handles role-based
  return null
}

const publicRoutes = ['/', '/login', '/api/auth']
const authRoutes = ['/login']

export function middleware(request: NextRequest) {
  const { nextUrl } = request
  const isLoggedIn = request.cookies.has('authjs.session-token') || 
                     request.cookies.has('__Secure-authjs.session-token')
  
  const isPublicRoute = publicRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )
  
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  // Allow public routes
  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next()
  }

  // Redirect logged-in users away from auth routes
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl))
  }

  // Redirect non-logged-in users to login
  if (!isPublicRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)'],
}
