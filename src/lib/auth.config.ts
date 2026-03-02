import type { NextAuthConfig } from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import type { UserRole } from '@prisma/client'

// Role-based route access configuration
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

// Helper function to check if user has access to route
function hasRouteAccess(role: UserRole, pathname: string): boolean {
  const allowedRoutes = roleRoutes[role] || []
  return allowedRoutes.some(route => pathname.startsWith(route))
}

// Get default redirect route for each role
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

// Edge-compatible auth config (no database calls)
export const authConfig: NextAuthConfig = {
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      // authorize is called in the full auth.ts (Node.js runtime)
      async authorize() {
        return null
      },
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const userRole = auth?.user?.role as UserRole | undefined

      const publicRoutes = ['/', '/login', '/api/auth']
      const authRoutes = ['/login']

      const isPublicRoute = publicRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      )
      const isAuthRoute = authRoutes.some((route) =>
        nextUrl.pathname.startsWith(route)
      )

      // Allow public routes
      if (isPublicRoute && !isAuthRoute) {
        return true
      }

      // Redirect logged-in users away from auth routes
      if (isAuthRoute && isLoggedIn) {
        const defaultRoute = userRole ? getDefaultRouteForRole(userRole) : '/dashboard'
        return Response.redirect(new URL(defaultRoute, nextUrl))
      }

      // Require login for protected routes
      if (!isPublicRoute && !isLoggedIn) {
        return false
      }

      // Check role-based access for protected routes
      if (isLoggedIn && userRole) {
        // Allow access to dashboard for all authenticated users
        if (nextUrl.pathname === '/dashboard') {
          return true
        }
        
        // Check if user's role has access to the requested route
        if (!hasRouteAccess(userRole, nextUrl.pathname)) {
          // Redirect to their default route if they don't have access
          const defaultRoute = getDefaultRouteForRole(userRole)
          return Response.redirect(new URL(defaultRoute, nextUrl))
        }
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.staffId = user.staffId
        token.patientId = user.patientId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.staffId = token.staffId as string | undefined
        session.user.patientId = token.patientId as string | undefined
      }
      return session
    },
  },
}
