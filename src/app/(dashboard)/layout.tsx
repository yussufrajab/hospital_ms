'use client'

import { SessionProvider } from 'next-auth/react'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { ThemeProvider } from '@/components/theme-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
          <Sidebar />
          <div className="lg:pl-64">
            <Header />
            <main className="p-4 lg:p-6">{children}</main>
          </div>
        </div>
      </ThemeProvider>
    </SessionProvider>
  )
}
