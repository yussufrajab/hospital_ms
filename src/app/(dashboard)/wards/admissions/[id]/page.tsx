'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, BedDouble, Calendar, FileText, CheckCircle, Stethoscope } from 'lucide-react'
import Link from 'next/link'

interface Admission {
  id: string
  admissionDate: string
  admissionType: string
  status: string
  admissionReason: string | null
  diagnosis: string | null
  dischargeDate: string | null
  dischargeSummary: string | null
  dischargeInstructions: string | null
  followUpDate: string | null
  patient: {
    id: string
    patientId: string
    firstName: string
    lastName: string
    phone: string | null
    email: string | null
    dateOfBirth: string
    gender: string
    bloodGroup: string | null
    address: string | null
  }
  ward: {
    id: string
    name: string
    code: string
  } | null
  bed: {
    id: string
    bedNumber: string
    type: string
  } | null
  attendingDoctor: {
    designation: string
    user: {
      firstName: string
      lastName: string
    }
  } | null
  referringDoctor: {
    designation: string
    user: {
      firstName: string
      lastName: string
    }
  } | null
}

export default function AdmissionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [admission, setAdmission] = useState<Admission | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDischargeForm, setShowDischargeForm] = useState(false)
  const [discharging, setDischarging] = useState(false)

  const [dischargeData, setDischargeData] = useState({
    dischargeSummary: '',
    dischargeInstructions: '',
    followUpDate: '',
    bedNeedsCleaning: true,
  })

  useEffect(() => {
    fetchAdmission()
  }, [params.id])

  const fetchAdmission = async () => {
    try {
      const response = await fetch(`/api/admissions/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch admission')
      const data = await response.json()
      setAdmission(data)
    } catch (error) {
      console.error('Error fetching admission:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDischarge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!admission) return

    setDischarging(true)
    try {
      const response = await fetch(`/api/admissions/${admission.id}/discharge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dischargeSummary: dischargeData.dischargeSummary,
          dischargeInstructions: dischargeData.dischargeInstructions,
          followUpDate: dischargeData.followUpDate || undefined,
          bedNeedsCleaning: dischargeData.bedNeedsCleaning,
        }),
      })

      if (!response.ok) throw new Error('Failed to discharge patient')

      await fetchAdmission()
      setShowDischargeForm(false)
      alert('Patient discharged successfully!')
    } catch (error) {
      console.error('Error discharging patient:', error)
      alert('Failed to discharge patient')
    } finally {
      setDischarging(false)
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getDaysAdmitted = (admissionDate: string) => {
    const start = new Date(admissionDate)
    const end = admission?.dischargeDate ? new Date(admission.dischargeDate) : new Date()
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED':
        return 'bg-blue-100 text-blue-700'
      case 'DISCHARGED':
        return 'bg-green-100 text-green-700'
      case 'TRANSFERRED':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!admission) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">Admission not found</div>
        <Button onClick={() => router.push('/wards/admissions')}>Back to Admissions</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/wards/admissions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {admission.patient.firstName} {admission.patient.lastName}
            </h1>
            <p className="text-gray-500">
              Patient ID: {admission.patient.patientId} | Admission: {formatDate(admission.admissionDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(admission.status)}`}>
            {admission.status}
          </span>
          {admission.status === 'ADMITTED' && (
            <Button onClick={() => setShowDischargeForm(!showDischargeForm)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Discharge
            </Button>
          )}
        </div>
      </div>

      {/* Discharge Form */}
      {showDischargeForm && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">Discharge Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDischarge} className="space-y-4">
              <div className="space-y-2">
                <Label>Discharge Summary *</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={dischargeData.dischargeSummary}
                  onChange={(e) => setDischargeData({ ...dischargeData, dischargeSummary: e.target.value })}
                  placeholder="Summary of treatment and condition at discharge..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Discharge Instructions</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                  value={dischargeData.dischargeInstructions}
                  onChange={(e) => setDischargeData({ ...dischargeData, dischargeInstructions: e.target.value })}
                  placeholder="Medications, follow-up care, restrictions..."
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Follow-up Date</Label>
                  <Input
                    type="date"
                    value={dischargeData.followUpDate}
                    onChange={(e) => setDischargeData({ ...dischargeData, followUpDate: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="bedNeedsCleaning"
                    checked={dischargeData.bedNeedsCleaning}
                    onChange={(e) => setDischargeData({ ...dischargeData, bedNeedsCleaning: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="bedNeedsCleaning">Mark bed as needing cleaning</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowDischargeForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={discharging}>
                  {discharging ? 'Processing...' : 'Confirm Discharge'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-7 w-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Patient ID</p>
                      <p className="font-medium">{admission.patient.patientId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Age / Gender</p>
                      <p className="font-medium">{calculateAge(admission.patient.dateOfBirth)} yrs | {admission.patient.gender}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Blood Group</p>
                      <p className="font-medium">{admission.patient.bloodGroup?.replace('_', ' ') || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Phone</p>
                      <p className="font-medium">{admission.patient.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admission Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Admission Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Admission Type</p>
                  <p className="font-medium">{admission.admissionType}</p>
                </div>
                <div>
                  <p className="text-gray-500">Admission Date</p>
                  <p className="font-medium">{formatDate(admission.admissionDate)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Length of Stay</p>
                  <p className="font-medium">{getDaysAdmitted(admission.admissionDate)} days</p>
                </div>
                <div>
                  <p className="text-gray-500">Ward</p>
                  <p className="font-medium">{admission.ward?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Bed</p>
                  <p className="font-medium">{admission.bed?.bedNumber || 'N/A'} ({admission.bed?.type || 'N/A'})</p>
                </div>
              </div>

              {admission.admissionReason && (
                <div className="pt-3 border-t">
                  <p className="text-gray-500 text-sm">Admission Reason</p>
                  <p className="font-medium">{admission.admissionReason}</p>
                </div>
              )}

              {admission.diagnosis && (
                <div className="pt-3 border-t">
                  <p className="text-gray-500 text-sm">Diagnosis</p>
                  <p className="font-medium">{admission.diagnosis}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Team */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Stethoscope className="h-4 w-4" />
                Medical Team
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {admission.attendingDoctor && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Attending Doctor</p>
                    <p className="font-medium">
                      Dr. {admission.attendingDoctor.user.firstName} {admission.attendingDoctor.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{admission.attendingDoctor.designation}</p>
                  </div>
                )}
                {admission.referringDoctor && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Referring Doctor</p>
                    <p className="font-medium">
                      Dr. {admission.referringDoctor.user.firstName} {admission.referringDoctor.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{admission.referringDoctor.designation}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Discharge Info */}
          {admission.status === 'DISCHARGED' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Discharge Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Discharge Date</p>
                    <p className="font-medium">{admission.dischargeDate ? formatDate(admission.dischargeDate) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Length of Stay</p>
                    <p className="font-medium">{getDaysAdmitted(admission.admissionDate)} days</p>
                  </div>
                </div>

                {admission.dischargeSummary && (
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-gray-500 text-sm">Discharge Summary</p>
                    <p className="font-medium">{admission.dischargeSummary}</p>
                  </div>
                )}

                {admission.dischargeInstructions && (
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-gray-500 text-sm">Discharge Instructions</p>
                    <p className="font-medium">{admission.dischargeInstructions}</p>
                  </div>
                )}

                {admission.followUpDate && (
                  <div className="pt-3 border-t border-green-200">
                    <p className="text-gray-500 text-sm">Follow-up Date</p>
                    <p className="font-medium">{formatDate(admission.followUpDate)}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/patients/${admission.patient.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  View Patient Record
                </Button>
              </Link>
              {admission.ward && (
                <Link href={`/wards/${admission.ward.code}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <BedDouble className="h-4 w-4 mr-2" />
                    View Ward
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    <div className="w-0.5 h-full bg-gray-200" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Admitted</p>
                    <p className="text-xs text-gray-500">{formatDate(admission.admissionDate)}</p>
                    {admission.ward && admission.bed && (
                      <p className="text-xs text-gray-500">{admission.ward.name} - Bed {admission.bed.bedNumber}</p>
                    )}
                  </div>
                </div>

                {admission.status === 'DISCHARGED' && admission.dischargeDate && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Discharged</p>
                      <p className="text-xs text-gray-500">{formatDate(admission.dischargeDate)}</p>
                      <p className="text-xs text-gray-500">{getDaysAdmitted(admission.admissionDate)} days stay</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
