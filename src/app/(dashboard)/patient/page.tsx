'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  FileText,
  CreditCard,
  Clock
} from 'lucide-react'

const stats = [
  { name: 'Upcoming Appointments', value: '3', icon: Calendar },
  { name: 'Pending Bills', value: '2', icon: CreditCard },
  { name: 'Active Prescriptions', value: '5', icon: FileText },
  { name: 'Lab Results', value: '4', icon: Clock },
]

const upcomingAppointments = [
  { id: '1', doctor: 'Dr. Sarah Wilson', department: 'Cardiology', date: 'Mar 5, 2024', time: '10:00 AM', status: 'confirmed' },
  { id: '2', doctor: 'Dr. Michael Chen', department: 'Orthopedics', date: 'Mar 8, 2024', time: '2:30 PM', status: 'pending' },
  { id: '3', doctor: 'Dr. James Taylor', department: 'General Medicine', date: 'Mar 12, 2024', time: '11:00 AM', status: 'confirmed' },
]

const recentActivity = [
  { id: '1', action: 'Lab Result Available', details: 'Complete Blood Count', time: '2 hours ago' },
  { id: '2', action: 'Prescription Dispensed', details: 'Metformin 500mg', time: '1 day ago' },
  { id: '3', action: 'Appointment Confirmed', details: 'Dr. Sarah Wilson', time: '2 days ago' },
]

export default function PatientDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Portal</h1>
          <p className="text-gray-500">Welcome, {session?.user?.name || 'Patient'}!</p>
        </div>
        <Button>
          <Calendar className="h-4 w-4 mr-2" />
          Book Appointment
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
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your scheduled visits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{apt.doctor}</p>
                    <p className="text-sm text-gray-500">{apt.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{apt.date}</p>
                    <p className="text-xs text-gray-500">{apt.time}</p>
                    <Badge variant={apt.status === 'confirmed' ? 'success' : 'warning'} className="mt-1">
                      {apt.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest health updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.details}</p>
                  </div>
                  <span className="text-xs text-gray-400">{activity.time}</span>
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
            <a href="/patient/appointments" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Appointments</span>
            </a>
            <a href="/patient/records" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Medical Records</span>
            </a>
            <a href="/patient/bills" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-medium">View Bills</span>
            </a>
            <a href="/patient/prescriptions" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Prescriptions</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
