'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, User, Play, CheckCircle, Users } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  tokenNumber: number
  queuePosition: number
  appointmentDate: string
  startTime: string
  status: string
  reason: string | null
  patient: {
    id: string
    patientId: string
    firstName: string
    lastName: string
    phone: string | null
    dateOfBirth: string
    gender: string
  }
}

export default function DoctorQueuePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchQueue()
  }, [selectedDate, session])

  const fetchQueue = async () => {
    if (!session?.user?.staffId) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/appointments?date=${selectedDate}&limit=50`)
      const data = await response.json()
      // Filter appointments for this doctor
      const doctorAppointments = (data.data || []).filter(
        (apt: Appointment) => apt.status !== 'CANCELLED'
      )
      setAppointments(doctorAppointments)
    } catch (error) {
      console.error('Error fetching queue:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) throw new Error('Failed to update status')
      fetchQueue()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    }
  }

  const pendingCount = appointments.filter(a => a.status === 'SCHEDULED' || a.status === 'CONFIRMED').length
  const inProgressCount = appointments.filter(a => a.status === 'IN_PROGRESS').length
  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Queue</h1>
          <p className="text-gray-500">Manage your appointments for today</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Users className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Waiting</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Play className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading queue...
            </CardContent>
          </Card>
        ) : appointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No appointments scheduled for this date.
            </CardContent>
          </Card>
        ) : (
          appointments.map((appointment) => (
            <Card key={appointment.id} className={`border-l-4 ${
              appointment.status === 'IN_PROGRESS' ? 'border-l-blue-500' :
              appointment.status === 'COMPLETED' ? 'border-l-green-500' :
              'border-l-yellow-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Token Number */}
                    <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-700">
                        #{appointment.tokenNumber}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.patient.patientId} | {calculateAge(appointment.patient.dateOfBirth)} yrs | {appointment.patient.gender}
                      </p>
                      {appointment.patient.phone && (
                        <p className="text-sm text-gray-500">{appointment.patient.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Time & Status */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(appointment.startTime)}</span>
                    </div>

                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('_', ' ')}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {appointment.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          onClick={() => updateStatus(appointment.id, 'IN_PROGRESS')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {appointment.status === 'IN_PROGRESS' && (
                        <Link href={`/doctor/consultation/${appointment.id}`}>
                          <Button size="sm">
                            <User className="h-4 w-4 mr-1" />
                            Consult
                          </Button>
                        </Link>
                      )}
                      {appointment.status === 'COMPLETED' && (
                        <Link href={`/patients/${appointment.patient.id}`}>
                          <Button variant="outline" size="sm">
                            View Record
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {appointment.reason && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Reason:</span> {appointment.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
