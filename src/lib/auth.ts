import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import type { UserRole } from '@prisma/client'
import { authConfig } from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            staff: { select: { id: true } },
            patient: { select: { id: true } },
          },
        })

        if (!user || !user.isActive) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          staffId: user.staff?.id,
          patientId: user.patient?.id,
        }
      },
    }),
  ],
  events: {
    async signIn({ user }) {
      await prisma.auditLog.create({
        data: {
          userId: user.id!,
          action: 'LOGIN',
          entityType: 'User',
          entityId: user.id!,
        },
      })
    },
  },
})
