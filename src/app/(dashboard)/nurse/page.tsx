'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HeartPulse,
  Pill,
  FileText,
  Users,
  Clock,
  Activity,
  Thermometer
} from 'lucide-react'

const stats = [
  { name: 'Assigned Patients', value: '8', icon: Users },
  { name: 'Vitals Pending', value: '3', icon: HeartPulse },
  { name: 'Medications Due', value: '12', icon: Pill },
  { name: 'Shift Hours Left', value: '4h', icon: Clock },
]

const medicationSchedule = [
  { id: '1', patient: 'John Smith', room: '101', medication: 'Metformin 500mg', time: '10:00 AM', status: 'pending' },
  { id: '2', patient: 'Emily Brown', room: '102', medication: 'Insulin Glargine', time: '10:30 AM', status: 'pending' },
  { id: '3', patient: 'Robert Johnson', room: '103', medication: 'Aspirin 81mg', time: '11:00 AM', status: 'completed' },
  { id: '4', patient: 'Lisa Anderson', room: '104', medication: 'Lisinopril 10mg', time: '11:30 AM', status: 'pending' },
]

const vitalsToRecord = [
  { id: '1', patient: 'John Smith', room: '101', lastRecorded: '2 hours ago' },
  { id: '2', patient: 'Emily Brown', room: '102', lastRecorded: '3 hours ago' },
  { id: '3', patient: 'Robert Johnson', room: '103', lastRecorded: '1 hour ago' },
]

export default function NurseDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nurse&apos;s Dashboard</h1>
          <p className="text-gray-500">Welcome, {session?.user?.name || 'Nurse'}!</p>
        </div>
        <Button>
          <HeartPulse className="h-4 w-4 mr-2" />
          Record Vitals
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
        {/* Medication Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Medication Administration (MAR)
            </CardTitle>
            <CardDescription>Upcoming medication schedules</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicationSchedule.map((med) => (
                <div key={med.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{med.patient}</p>
                    <p className="text-sm text-gray-500">{med.medication} • Room {med.room}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{med.time}</span>
                    <Badge variant={med.status === 'completed' ? 'success' : 'warning'}>
                      {med.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vitals to Record */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Vitals to Record
            </CardTitle>
            <CardDescription>Patients needing vital signs recording</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {vitalsToRecord.map((vital) => (
                <div key={vital.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{vital.patient}</p>
                    <p className="text-sm text-gray-500">Room {vital.room}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Last: {vital.lastRecorded}</span>
                    <Button variant="outline" size="sm">Record</Button>
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
            <a href="/nurse/vitals" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <HeartPulse className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Record Vitals</span>
            </a>
            <a href="/nurse/medications" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Pill className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Medications</span>
            </a>
            <a href="/nurse/notes" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Nursing Notes</span>
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
