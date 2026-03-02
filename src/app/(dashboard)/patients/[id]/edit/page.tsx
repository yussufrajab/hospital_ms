'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: string
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
}

export default function EditPatientPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [patient, setPatient] = useState<Partial<Patient>>({})

  useEffect(() => {
    fetchPatient()
  }, [params.id])

  const fetchPatient = async () => {
    try {
      const response = await fetch(`/api/patients/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch patient')
      const data = await response.json()
      setPatient({
        ...data,
        dateOfBirth: new Date(data.dateOfBirth).toISOString().split('T')[0],
      })
    } catch (error) {
      console.error('Error fetching patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/patients/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patient),
      })

      if (!response.ok) throw new Error('Failed to update patient')

      router.push(`/patients/${params.id}`)
    } catch (error) {
      console.error('Error updating patient:', error)
      alert('Failed to update patient')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof Patient, value: string) => {
    setPatient((prev) => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading patient details...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push(`/patients/${params.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Patient</h1>
          <p className="text-gray-500">{patient.patientId}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={patient.firstName || ''}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={patient.lastName || ''}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    value={patient.middleName || ''}
                    onChange={(e) => handleChange('middleName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={patient.dateOfBirth || ''}
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    className="w-full px-3 py-2 border rounded-md"
                    value={patient.gender || ''}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <select
                    id="bloodGroup"
                    className="w-full px-3 py-2 border rounded-md"
                    value={patient.bloodGroup || ''}
                    onChange={(e) => handleChange('bloodGroup', e.target.value)}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A_POSITIVE">A+</option>
                    <option value="A_NEGATIVE">A-</option>
                    <option value="B_POSITIVE">B+</option>
                    <option value="B_NEGATIVE">B-</option>
                    <option value="AB_POSITIVE">AB+</option>
                    <option value="AB_NEGATIVE">AB-</option>
                    <option value="O_POSITIVE">O+</option>
                    <option value="O_NEGATIVE">O-</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={patient.nationality || ''}
                    onChange={(e) => handleChange('nationality', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationalId">National ID</Label>
                  <Input
                    id="nationalId"
                    value={patient.nationalId || ''}
                    onChange={(e) => handleChange('nationalId', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maritalStatus">Marital Status</Label>
                  <Input
                    id="maritalStatus"
                    value={patient.maritalStatus || ''}
                    onChange={(e) => handleChange('maritalStatus', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    value={patient.occupation || ''}
                    onChange={(e) => handleChange('occupation', e.target.value)}
                  />
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
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={patient.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternatePhone">Alternate Phone</Label>
                <Input
                  id="alternatePhone"
                  value={patient.alternatePhone || ''}
                  onChange={(e) => handleChange('alternatePhone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={patient.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={patient.address || ''}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={patient.city || ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={patient.state || ''}
                    onChange={(e) => handleChange('state', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={patient.country || ''}
                    onChange={(e) => handleChange('country', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={patient.postalCode || ''}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                  />
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
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">Name</Label>
                <Input
                  id="emergencyContactName"
                  value={patient.emergencyContactName || ''}
                  onChange={(e) => handleChange('emergencyContactName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={patient.emergencyContactPhone || ''}
                  onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">Relationship</Label>
                <Input
                  id="emergencyContactRelation"
                  value={patient.emergencyContactRelation || ''}
                  onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Patient Type */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="patientType">Patient Type *</Label>
                <select
                  id="patientType"
                  className="w-full px-3 py-2 border rounded-md"
                  value={patient.patientType || 'OPD'}
                  onChange={(e) => handleChange('patientType', e.target.value)}
                  required
                >
                  <option value="OPD">OPD (Outpatient)</option>
                  <option value="IPD">IPD (Inpatient)</option>
                  <option value="EMERGENCY">Emergency</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/patients/${params.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
