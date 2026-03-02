'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Calendar, 
  Clock, 
  Stethoscope,
  Activity,
  UserCheck,
  FileText,
  Pill
} from 'lucide-react'

const stats = [
  {
    name: 'Patients Today',
    value: '24',
    change: '+5',
    icon: Users,
  },
  {
    name: 'Appointments',
    value: '18',
    change: '+3',
    icon: Calendar,
  },
  {
    name: 'Completed',
    value: '12',
    change: '+2',
    icon: UserCheck,
  },
  {
    name: 'Pending',
    value: '6',
    change: '-1',
    icon: Clock,
  },
]

const patientQueue = [
  { id: '1', name: 'John Smith', age: 45, reason: 'Follow-up - Hypertension', status: 'waiting', token: 'A01' },
  { id: '2', name: 'Emily Brown', age: 32, reason: 'Diabetes Review', status: 'in-progress', token: 'A02' },
  { id: '3', name: 'Robert Johnson', age: 58, reason: 'Chest Pain', status: 'waiting', token: 'A03' },
  { id: '4', name: 'Lisa Anderson', age: 28, reason: 'General Checkup', status: 'waiting', token: 'A04' },
  { id: '5', name: 'Michael Davis', age: 52, reason: 'Cardiac Screening', status: 'scheduled', token: 'A05' },
]

export default function DoctorDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Doctor&apos;s Dashboard
          </h1>
          <p className="text-gray-500">Welcome, Dr. {session?.user?.name?.split(' ')[1] || 'Doctor'}!</p>
        </div>
        <Button>
          <Stethoscope className="h-4 w-4 mr-2" />
          Start Consultation
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
                  <p className="text-xs text-green-600">{stat.change} from yesterday</p>
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
        {/* Patient Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Patient Queue
            </CardTitle>
            <CardDescription>Today&apos;s patient queue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patientQueue.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 font-medium text-sm">{patient.token}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <p className="text-sm text-gray-500">{patient.reason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        patient.status === 'in-progress' ? 'default' : 
                        patient.status === 'waiting' ? 'warning' : 'secondary'
                      }
                    >
                      {patient.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common clinical tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 grid-cols-2">
              <a href="/doctor/queue" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Users className="h-8 w-8 text-blue-600" />
                <span className="font-medium text-sm">View Queue</span>
              </a>
              <a href="/patients" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Activity className="h-8 w-8 text-blue-600" />
                <span className="font-medium text-sm">Patient Records</span>
              </a>
              <a href="/doctor/prescriptions" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <Pill className="h-8 w-8 text-blue-600" />
                <span className="font-medium text-sm">Prescriptions</span>
              </a>
              <a href="/doctor/notes" className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="font-medium text-sm">Clinical Notes</span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
