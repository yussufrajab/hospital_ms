'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Search } from 'lucide-react'

interface Doctor {
  id: string
  employeeId: string
  designation: string
  specialization: string | null
  user: {
    firstName: string
    lastName: string
  }
  department: {
    name: string
  }
}

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  phone: string | null
}

export default function NewAppointmentPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:30',
    type: 'CONSULTATION',
    reason: '',
    notes: '',
    priority: 'ROUTINE',
  })

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/staff?role=DOCTOR&limit=50')
      const data = await response.json()
      setDoctors(data.data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setPatientResults([])
      return
    }

    try {
      const response = await fetch(`/api/patients?search=${query}&limit=10`)
      const data = await response.json()
      setPatientResults(data.data || [])
    } catch (error) {
      console.error('Error searching patients:', error)
    }
  }

  const handlePatientSearch = (value: string) => {
    setPatientSearch(value)
    searchPatients(value)
  }

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setFormData((prev) => ({ ...prev, patientId: patient.id }))
    setPatientSearch('')
    setPatientResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const startTime = new Date(`${formData.appointmentDate}T${formData.startTime}`)
      const endTime = new Date(`${formData.appointmentDate}T${formData.endTime}`)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create appointment')
      }

      router.push('/appointments')
    } catch (error) {
      console.error('Error creating appointment:', error)
      alert(error instanceof Error ? error.message : 'Failed to create appointment')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/appointments')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-500">Schedule a new patient appointment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedPatient ? (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </p>
                      <p className="text-sm text-green-700">
                        ID: {selectedPatient.patientId}
                        {selectedPatient.phone && ` | Phone: ${selectedPatient.phone}`}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedPatient(null)
                        setFormData((prev) => ({ ...prev, patientId: '' }))
                      }}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Label>Search Patient</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="Search by name, ID, or phone..."
                      className="pl-9"
                      value={patientSearch}
                      onChange={(e) => handlePatientSearch(e.target.value)}
                    />
                  </div>
                  {patientResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {patientResults.map((patient) => (
                        <button
                          key={patient.id}
                          type="button"
                          className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                          onClick={() => selectPatient(patient)}
                        >
                          <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                          <p className="text-sm text-gray-500">
                            {patient.patientId} {patient.phone && `| ${patient.phone}`}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="type">Appointment Type</Label>
                <select
                  id="type"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.type}
                  onChange={(e) => handleChange('type', e.target.value)}
                >
                  <option value="CONSULTATION">Consultation</option>
                  <option value="FOLLOW_UP">Follow-up</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="CHECKUP">Check-up</option>
                  <option value="PROCEDURE">Procedure</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                >
                  <option value="ROUTINE">Routine</option>
                  <option value="URGENT">Urgent</option>
                  <option value="STAT">STAT (Emergency)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Doctor & Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor & Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="doctorId">Doctor *</Label>
                <select
                  id="doctorId"
                  className="w-full px-3 py-2 border rounded-md"
                  value={formData.doctorId}
                  onChange={(e) => handleChange('doctorId', e.target.value)}
                  required
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.user.firstName} {doctor.user.lastName} - {doctor.designation}
                      {doctor.specialization && ` (${doctor.specialization})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="appointmentDate">Date *</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) => handleChange('appointmentDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleChange('startTime', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleChange('endTime', e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reason & Notes */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  placeholder="Enter the reason for the appointment"
                  value={formData.reason}
                  onChange={(e) => handleChange('reason', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  placeholder="Additional notes or instructions"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/appointments')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !formData.patientId || !formData.doctorId}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Booking...' : 'Book Appointment'}
          </Button>
        </div>
      </form>
    </div>
  )
}
