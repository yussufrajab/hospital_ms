'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Building2,
  Clock,
  Key
} from 'lucide-react'
import Link from 'next/link'

const settingsSections = [
  {
    title: 'Profile Settings',
    description: 'Manage your personal information and preferences',
    icon: User,
    href: '/settings/profile',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Security',
    description: 'Password and authentication settings',
    icon: Key,
    href: '/settings/profile',
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'Notifications',
    description: 'Configure notification preferences',
    icon: Bell,
    href: '/settings/profile#notifications',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    title: 'Appearance',
    description: 'Theme and display settings',
    icon: Palette,
    href: '/settings/profile#appearance',
    color: 'bg-purple-50 text-purple-600',
  },
]

const adminSettings = [
  {
    title: 'System Configuration',
    description: 'Hospital settings, working hours, and general configuration',
    icon: SettingsIcon,
    href: '/settings/system',
    color: 'bg-red-50 text-red-600',
  },
  {
    title: 'Hospital Information',
    description: 'Hospital name, address, contact details',
    icon: Building2,
    href: '/settings/system#hospital',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    title: 'Working Hours',
    description: 'Configure shifts and schedules',
    icon: Clock,
    href: '/settings/system#hours',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    title: 'Database Management',
    description: 'Backup, restore, and data management',
    icon: Database,
    href: '/settings/system#database',
    color: 'bg-cyan-50 text-cyan-600',
  },
]

export default function SettingsPage() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'HOSPITAL_ADMIN'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your account and application preferences</p>
      </div>

      {/* Personal Settings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Settings</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {settingsSections.map((section) => (
            <Link key={section.title} href={section.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${section.color}`}>
                      <section.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{section.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin Settings */}
      {isAdmin && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-600" />
            Administration
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {adminSettings.map((section) => (
              <Link key={section.title} href={section.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full border-l-4 border-l-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${section.color}`}>
                        <section.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{section.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{section.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Info */}
      <Card className="bg-gray-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-blue-50">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Current Session</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Name:</span> {session?.user?.name || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {session?.user?.email || 'N/A'}</p>
                <p><span className="font-medium">Role:</span> {session?.user?.role || 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
