'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, Edit, User, Phone, Mail, MapPin, Calendar,
  Heart, AlertTriangle, Activity
} from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: Date
  gender: string
  bloodGroup: string | null
  nationality: string | null
  nationalId: string | null
  phone: string | null
  alternatePhone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  postalCode: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  emergencyContactRelation: string | null
  maritalStatus: string | null
  occupation: string | null
  patientType: string
  createdAt: Date
  allergies: Array<{
    id: string
    allergen: string
    allergenType: string | null
    severity: string | null
    reaction: string | null
  }>
  medicalHistory: Array<{
    id: string
    condition: string
    conditionType: string | null
    diagnosedDate: string | null
    resolvedDate: string | null
    notes: string | null
  }>
  vitals: Array<{
    id: string
    recordedAt: Date
    temperature: number | null
    bloodPressureSystolic: number | null
    bloodPressureDiastolic: number | null
    pulseRate: number | null
    respiratoryRate: number | null
    spO2: number | null
    weight: number | null
    height: number | null
  }>
  appointments: Array<{
    id: string
    appointmentDate: Date
    status: string
    type: string | null
    reason: string | null
    doctor: {
      user: {
        firstName: string
        lastName: string
      }
    }
  }>
}

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatient()
  }, [params.id])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch patient')
      const data = await response.json()
      setPatient(data)
    } catch (error) {
      console.error('Error fetching patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading patient details...</div>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">Patient not found</div>
        <Button onClick={() => router.push('/patients')}>Back to Patients</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/patients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.firstName} {patient.middleName} {patient.lastName}
            </h1>
            <p className="text-gray-500">{patient.patientId}</p>
          </div>
        </div>
        <Link href={`/patients/${patient.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
        </Link>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Age / Gender</p>
                <p className="font-medium">{calculateAge(patient.dateOfBirth)} yrs / {patient.gender}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Group</p>
                <p className="font-medium">{patient.bloodGroup?.replace('_', ' ') || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Patient Type</p>
                <p className="font-medium">{patient.patientType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Registered</p>
                <p className="font-medium">{formatDate(patient.createdAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="allergies">Allergies ({patient.allergies?.length || 0})</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">First Name</p>
                    <p className="font-medium">{patient.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Name</p>
                    <p className="font-medium">{patient.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Date of Birth</p>
                    <p className="font-medium">{formatDate(patient.dateOfBirth)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="font-medium">{patient.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nationality</p>
                    <p className="font-medium">{patient.nationality || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">National ID</p>
                    <p className="font-medium">{patient.nationalId || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Marital Status</p>
                    <p className="font-medium">{patient.maritalStatus || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p className="font-medium">{patient.occupation || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{patient.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Alternate Phone</p>
                    <p className="font-medium">{patient.alternatePhone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{patient.email || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium">
                      {[patient.address, patient.city, patient.state, patient.country, patient.postalCode]
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{patient.emergencyContactName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{patient.emergencyContactPhone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Relationship</p>
                  <p className="font-medium">{patient.emergencyContactRelation || '-'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Allergies Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Known Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!patient.allergies || patient.allergies.length === 0 ? (
                  <p className="text-gray-500">No known allergies</p>
                ) : (
                  <div className="space-y-2">
                    {patient.allergies.map((allergy) => (
                      <div key={allergy.id} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg">
                        <div>
                          <p className="font-medium">{allergy.allergen}</p>
                          <p className="text-sm text-gray-500">{allergy.allergenType || 'Unknown type'}</p>
                        </div>
                        {allergy.severity && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            allergy.severity === 'SEVERE' ? 'bg-red-100 text-red-700' :
                            allergy.severity === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {allergy.severity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="allergies">
          <Card>
            <CardHeader>
              <CardTitle>Allergy List</CardTitle>
            </CardHeader>
            <CardContent>
              {!patient.allergies || patient.allergies.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No known allergies recorded
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Allergen</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Severity</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reaction</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.allergies.map((allergy) => (
                        <tr key={allergy.id} className="border-b">
                          <td className="py-3 px-4 font-medium">{allergy.allergen}</td>
                          <td className="py-3 px-4">{allergy.allergenType || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              allergy.severity === 'SEVERE' ? 'bg-red-100 text-red-700' :
                              allergy.severity === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {allergy.severity || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-4">{allergy.reaction || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              {!patient.medicalHistory || patient.medicalHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No medical history recorded
                </div>
              ) : (
                <div className="space-y-4">
                  {patient.medicalHistory.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{record.condition}</h4>
                        {record.conditionType && (
                          <span className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-full">
                            {record.conditionType}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        {record.diagnosedDate && (
                          <p>Diagnosed: {formatDate(record.diagnosedDate)}</p>
                        )}
                        {record.resolvedDate && (
                          <p>Resolved: {formatDate(record.resolvedDate)}</p>
                        )}
                        {record.notes && <p className="mt-2">{record.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs History</CardTitle>
            </CardHeader>
            <CardContent>
              {!patient.vitals || patient.vitals.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No vital signs recorded
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date/Time</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Temp (°C)</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">BP (mmHg)</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pulse</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">SpO2</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Weight (kg)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.vitals.map((vital) => (
                        <tr key={vital.id} className="border-b">
                          <td className="py-3 px-4">{new Date(vital.recordedAt).toLocaleString()}</td>
                          <td className="py-3 px-4">{vital.temperature || '-'}</td>
                          <td className="py-3 px-4">
                            {vital.bloodPressureSystolic && vital.bloodPressureDiastolic
                              ? `${vital.bloodPressureSystolic}/${vital.bloodPressureDiastolic}`
                              : '-'}
                          </td>
                          <td className="py-3 px-4">{vital.pulseRate || '-'}</td>
                          <td className="py-3 px-4">{vital.spO2 ? `${vital.spO2}%` : '-'}</td>
                          <td className="py-3 px-4">{vital.weight || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments">
          <Card>
            <CardHeader>
              <CardTitle>Appointment History</CardTitle>
            </CardHeader>
            <CardContent>
              {!patient.appointments || patient.appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments recorded
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Doctor</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reason</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.appointments.map((apt) => (
                        <tr key={apt.id} className="border-b">
                          <td className="py-3 px-4">{formatDate(apt.appointmentDate)}</td>
                          <td className="py-3 px-4">
                            Dr. {apt.doctor?.user?.firstName} {apt.doctor?.user?.lastName}
                          </td>
                          <td className="py-3 px-4">{apt.type || '-'}</td>
                          <td className="py-3 px-4">{apt.reason || '-'}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              apt.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                              apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}