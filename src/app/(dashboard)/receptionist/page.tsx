'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users,
  Calendar,
  Clock,
  UserPlus,
  Phone,
  Activity
} from 'lucide-react'

const stats = [
  { name: 'Appointments Today', value: '48', icon: Calendar },
  { name: 'Walk-ins', value: '12', icon: Users },
  { name: 'Completed', value: '32', icon: Clock },
  { name: 'Waiting', value: '8', icon: Activity },
]

const todayAppointments = [
  { id: '1', patient: 'John Smith', time: '09:00 AM', doctor: 'Dr. Sarah Wilson', status: 'completed' },
  { id: '2', patient: 'Emily Brown', time: '09:30 AM', doctor: 'Dr. Michael Chen', status: 'in-progress' },
  { id: '3', patient: 'Robert Johnson', time: '10:00 AM', doctor: 'Dr. Sarah Wilson', status: 'waiting' },
  { id: '4', patient: 'Lisa Anderson', time: '10:30 AM', doctor: 'Dr. James Taylor', status: 'waiting' },
  { id: '5', patient: 'Michael Davis', time: '11:00 AM', doctor: 'Dr. Michael Chen', status: 'scheduled' },
]

const recentRegistrations = [
  { id: '1', name: 'Sarah Parker', type: 'New Patient', time: '10 mins ago' },
  { id: '2', name: 'Tom Wilson', type: 'Walk-in', time: '25 mins ago' },
  { id: '3', name: 'Jane Doe', type: 'New Patient', time: '1 hour ago' },
]

export default function ReceptionistDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receptionist Dashboard</h1>
          <p className="text-gray-500">Welcome, {session?.user?.name || 'Receptionist'}!</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Call Queue
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
        </div>
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
        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today&apos;s Appointments
            </CardTitle>
            <CardDescription>Current appointment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient}</p>
                    <p className="text-sm text-gray-500">{apt.doctor}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{apt.time}</span>
                    <Badge 
                      variant={
                        apt.status === 'completed' ? 'success' : 
                        apt.status === 'in-progress' ? 'default' : 
                        apt.status === 'waiting' ? 'warning' : 'secondary'
                      }
                    >
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Registrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Recent Registrations
            </CardTitle>
            <CardDescription>Newly registered patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRegistrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{reg.name}</p>
                    <p className="text-sm text-gray-500">{reg.type}</p>
                  </div>
                  <span className="text-xs text-gray-400">{reg.time}</span>
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
            <a href="/patients/new" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <UserPlus className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Register Patient</span>
            </a>
            <a href="/appointments/new" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Book Appointment</span>
            </a>
            <a href="/appointments" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">View Schedule</span>
            </a>
            <a href="/patients" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Patient List</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
