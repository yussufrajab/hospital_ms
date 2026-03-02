'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NewPatientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    bloodGroup: '',
    nationality: '',
    nationalId: '',
    phone: '',
    alternatePhone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
    maritalStatus: '',
    occupation: '',
    patientType: 'OPD',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register patient')
      }

      router.push(`/patients/${data.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/patients">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Patient</h1>
          <p className="text-gray-500">Fill in the patient information below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic patient details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(v) => handleChange('gender', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodGroup">Blood Group</Label>
              <Select value={formData.bloodGroup} onValueChange={(v) => handleChange('bloodGroup', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A_POSITIVE">A+</SelectItem>
                  <SelectItem value="A_NEGATIVE">A-</SelectItem>
                  <SelectItem value="B_POSITIVE">B+</SelectItem>
                  <SelectItem value="B_NEGATIVE">B-</SelectItem>
                  <SelectItem value="AB_POSITIVE">AB+</SelectItem>
                  <SelectItem value="AB_NEGATIVE">AB-</SelectItem>
                  <SelectItem value="O_POSITIVE">O+</SelectItem>
                  <SelectItem value="O_NEGATIVE">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input
                id="nationality"
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nationalId">National ID</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => handleChange('nationalId', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select value={formData.maritalStatus} onValueChange={(v) => handleChange('maritalStatus', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single</SelectItem>
                  <SelectItem value="MARRIED">Married</SelectItem>
                  <SelectItem value="DIVORCED">Divorced</SelectItem>
                  <SelectItem value="WIDOWED">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Patient contact details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alternatePhone">Alternate Phone</Label>
              <Input
                id="alternatePhone"
                type="tel"
                value={formData.alternatePhone}
                onChange={(e) => handleChange('alternatePhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>Person to contact in case of emergency</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => handleChange('emergencyContactName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => handleChange('emergencyContactPhone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">Relationship</Label>
              <Input
                id="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={(e) => handleChange('emergencyContactRelation', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Patient Type */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
            <CardDescription>Patient type and other details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="patientType">Patient Type *</Label>
              <Select value={formData.patientType} onValueChange={(v) => handleChange('patientType', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPD">Outpatient (OPD)</SelectItem>
                  <SelectItem value="IPD">Inpatient (IPD)</SelectItem>
                  <SelectItem value="EMERGENCY">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => handleChange('occupation', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/patients">
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Register Patient'}
          </Button>
        </div>
      </form>
    </div>
  )
}
