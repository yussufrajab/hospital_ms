'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, BedDouble, Activity, TrendingUp } from 'lucide-react'

const stats = [
  {
    name: 'Total Patients',
    value: '2,543',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: "Today's Appointments",
    value: '48',
    change: '+8%',
    changeType: 'positive',
    icon: Calendar,
  },
  {
    name: 'Revenue (MTD)',
    value: '$125,430',
    change: '+23%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Bed Occupancy',
    value: '78%',
    change: '-2%',
    changeType: 'negative',
    icon: BedDouble,
  },
]

const recentAppointments = [
  { id: 1, patient: 'John Smith', doctor: 'Dr. Sarah Wilson', time: '09:00 AM', status: 'Completed' },
  { id: 2, patient: 'Emily Brown', doctor: 'Dr. Michael Chen', time: '09:30 AM', status: 'In Progress' },
  { id: 3, patient: 'Robert Johnson', doctor: 'Dr. Sarah Wilson', time: '10:00 AM', status: 'Scheduled' },
  { id: 4, patient: 'Lisa Anderson', doctor: 'Dr. James Taylor', time: '10:30 AM', status: 'Scheduled' },
  { id: 5, patient: 'Michael Davis', doctor: 'Dr. Michael Chen', time: '11:00 AM', status: 'Scheduled' },
]

const recentPatients = [
  { id: 1, name: 'John Smith', age: 45, diagnosis: 'Hypertension', admitted: '2024-03-01' },
  { id: 2, name: 'Emily Brown', age: 32, diagnosis: 'Diabetes Type 2', admitted: '2024-03-02' },
  { id: 3, name: 'Robert Johnson', age: 58, diagnosis: 'Cardiac Arrhythmia', admitted: '2024-03-02' },
]

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name || 'User'}!
        </h1>
        <p className="text-gray-500">Here&apos;s what&apos;s happening at your hospital today.</p>
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
                  <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Appointments
            </CardTitle>
            <CardDescription>Today&apos;s scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{appointment.patient}</p>
                    <p className="text-sm text-gray-500">{appointment.doctor}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{appointment.time}</p>
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      appointment.status === 'Completed' ? 'bg-green-50 text-green-700' :
                      appointment.status === 'In Progress' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Admissions
            </CardTitle>
            <CardDescription>Recently admitted patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.diagnosis}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Age: {patient.age}</p>
                    <p className="text-xs text-gray-400">Admitted: {patient.admitted}</p>
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
          <CardDescription>Common tasks you can perform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <a href="/patients/new" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Register Patient</span>
            </a>
            <a href="/appointments/new" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Book Appointment</span>
            </a>
            <a href="/billing/new" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Create Invoice</span>
            </a>
            <a href="/wards" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <BedDouble className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Manage Beds</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
