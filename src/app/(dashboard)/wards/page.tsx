'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BedDouble,
  Users,
  ArrowRightLeft,
  Calendar,
  AlertCircle
} from 'lucide-react'

const stats = [
  { name: 'Total Beds', value: '120', icon: BedDouble },
  { name: 'Occupied', value: '94', icon: Users },
  { name: 'Available', value: '26', icon: BedDouble },
  { name: 'Pending Transfers', value: '5', icon: ArrowRightLeft },
]

const wardOverview = [
  { id: '1', name: 'General Ward A', capacity: 20, occupied: 18, type: 'general' },
  { id: '2', name: 'Private Ward B', capacity: 10, occupied: 8, type: 'private' },
  { id: '3', name: 'ICU 1', capacity: 8, occupied: 7, type: 'icu' },
  { id: '4', name: 'General Ward C', capacity: 25, occupied: 20, type: 'general' },
]

const recentAdmissions = [
  { id: '1', patient: 'John Smith', ward: 'General Ward A', bed: 'A-05', status: 'admitted', time: '2 hours ago' },
  { id: '2', patient: 'Emily Brown', ward: 'ICU 1', bed: 'ICU-03', status: 'critical', time: '4 hours ago' },
  { id: '3', patient: 'Robert Johnson', ward: 'Private Ward B', bed: 'PB-02', status: 'stable', time: '6 hours ago' },
]

export default function WardsDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ward Management</h1>
          <p className="text-gray-500">Welcome, {session?.user?.name || 'Manager'}!</p>
        </div>
        <Button>
          <BedDouble className="h-4 w-4 mr-2" />
          Manage Beds
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ward Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BedDouble className="h-5 w-5" />
              Ward Overview
            </CardTitle>
            <CardDescription>Current bed status by ward</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {wardOverview.map((ward) => (
                <div key={ward.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{ward.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{ward.type}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{ward.occupied}/{ward.capacity}</p>
                      <p className="text-xs text-gray-500">Occupied</p>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${ward.occupied / ward.capacity > 0.9 ? 'bg-red-500' : 'bg-blue-500'}`}
                        style={{ width: `${(ward.occupied / ward.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Admissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Admissions
            </CardTitle>
            <CardDescription>Latest patient admissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAdmissions.map((adm) => (
                <div key={adm.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{adm.patient}</p>
                    <p className="text-sm text-gray-500">{adm.ward} • Bed {adm.bed}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{adm.time}</span>
                    <Badge 
                      variant={
                        adm.status === 'critical' ? 'destructive' : 
                        adm.status === 'stable' ? 'success' : 'secondary'
                      }
                    >
                      {adm.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <a href="/wards/admissions" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Admissions</span>
            </a>
            <a href="/wards/transfers" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Transfers</span>
            </a>
            <a href="/wards/beds" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <BedDouble className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Bed Status</span>
            </a>
            <a href="/wards/discharge" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Discharge</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
