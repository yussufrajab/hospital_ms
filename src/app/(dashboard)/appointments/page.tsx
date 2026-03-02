'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Plus, Clock, User } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  tokenNumber: number
  appointmentDate: string
  startTime: string
  status: string
  reason: string | null
  patient: {
    patientId: string
    firstName: string
    lastName: string
    phone: string | null
  }
  doctor: {
    id: string
    designation: string
    user: {
      firstName: string
      lastName: string
    }
  }
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        date: selectedDate,
        limit: '50',
      })
      const response = await fetch(`/api/appointments?${params}`)
      const data = await response.json()
      setAppointments(data.data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
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
        return 'bg-green-50 text-green-700'
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700'
      case 'CANCELLED':
        return 'bg-red-50 text-red-700'
      case 'NO_SHOW':
        return 'bg-gray-50 text-gray-700'
      default:
        return 'bg-yellow-50 text-yellow-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Manage patient appointments and schedules</p>
        </div>
        <Link href="/appointments/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-500" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading appointments...
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
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Token Number */}
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-700">
                        #{appointment.tokenNumber}
                      </span>
                    </div>

                    {/* Patient Info */}
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {appointment.patient.patientId}
                        {appointment.patient.phone && ` | ${appointment.patient.phone}`}
                      </p>
                    </div>
                  </div>

                  {/* Doctor & Time */}
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        Dr. {appointment.doctor.user.firstName} {appointment.doctor.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{appointment.doctor.designation}</p>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{formatTime(appointment.startTime)}</span>
                    </div>

                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
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
