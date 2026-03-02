'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Pill,
  FlaskConical,
  Activity,
  CreditCard,
  BedDouble,
  Settings,
  LogOut,
  Menu,
  X,
  HeartPulse,
  FileText,
  Stethoscope,
  Package,
  TestTube,
  Receipt,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { useState, useMemo } from 'react'

const allNavigation = {
  default: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
    { name: 'Pharmacy', href: '/pharmacy', icon: Pill },
    { name: 'Laboratory', href: '/lab', icon: FlaskConical },
    { name: 'Radiology', href: '/radiology', icon: Activity },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Wards', href: '/wards', icon: BedDouble },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ],
  NURSE: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Vitals', href: '/nurse/vitals', icon: HeartPulse },
    { name: 'Medications (MAR)', href: '/nurse/medications', icon: Pill },
    { name: 'Nursing Notes', href: '/nurse/notes', icon: FileText },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
  ],
  DOCTOR: [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Patient Queue', href: '/doctor/queue', icon: Stethoscope },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
  ],
  PHARMACIST: [
    { name: 'Dashboard', href: '/pharmacy', icon: LayoutDashboard },
    { name: 'Prescription Queue', href: '/pharmacy/queue', icon: Pill },
    { name: 'Drug Inventory', href: '/pharmacy/inventory', icon: Package },
    { name: 'Patients', href: '/patients', icon: Users },
  ],
  LAB_TECHNICIAN: [
    { name: 'Dashboard', href: '/lab', icon: LayoutDashboard },
    { name: 'Test Orders', href: '/lab/orders', icon: FlaskConical },
    { name: 'Test Catalog', href: '/lab/tests', icon: TestTube },
    { name: 'Patients', href: '/patients', icon: Users },
  ],
  BILLING_STAFF: [
    { name: 'Dashboard', href: '/billing', icon: LayoutDashboard },
    { name: 'Invoices', href: '/billing/invoices', icon: FileText },
    { name: 'Payments', href: '/billing/payments', icon: DollarSign },
    { name: 'Insurance Claims', href: '/billing/insurance', icon: Receipt },
    { name: 'Patients', href: '/patients', icon: Users },
  ],
  WARD_MANAGER: [
    { name: 'Dashboard', href: '/wards', icon: LayoutDashboard },
    { name: 'Admissions', href: '/wards/admissions', icon: Users },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
  ],
}

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigation = useMemo(() => {
    const role = session?.user?.role as keyof typeof allNavigation
    return allNavigation[role] || allNavigation.default
  }, [session?.user?.role])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 z-40 p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="dark:text-gray-300"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen w-64 transform bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-transform duration-200 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">HMS</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-700 dark:text-blue-300 font-medium">
                  {session?.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session?.user?.role || 'Role'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
