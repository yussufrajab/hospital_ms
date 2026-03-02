'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Users, Search, Clock, CheckCircle, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'

interface Admission {
  id: string
  admissionDate: string
  admissionType: string
  status: string
  admissionReason: string | null
  diagnosis: string | null
  patient: {
    patientId: string
    firstName: string
    lastName: string
    phone: string | null
    dateOfBirth: string
    gender: string
  }
  ward: {
    name: string
    code: string
  } | null
  bed: {
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
}

export default function AdmissionsPage() {
  const { data: session } = useSession()
  const [admissions, setAdmissions] = useState<Admission[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ADMITTED')

  useEffect(() => {
    fetchAdmissions()
  }, [statusFilter])

  const fetchAdmissions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('status', statusFilter)
      params.append('limit', '100')

      const response = await fetch(`/api/admissions?${params.toString()}`)
      const data = await response.json()
      setAdmissions(data.data || [])
    } catch (error) {
      console.error('Error fetching admissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAdmissions = admissions.filter(admission =>
    admission.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
    admission.patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
    admission.patient.patientId.toLowerCase().includes(search.toLowerCase()) ||
    (admission.ward?.name.toLowerCase().includes(search.toLowerCase()) ?? false)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ADMITTED':
        return 'bg-blue-100 text-blue-700'
      case 'DISCHARGED':
        return 'bg-green-100 text-green-700'
      case 'TRANSFERRED':
        return 'bg-purple-100 text-purple-700'
      case 'ON_LEAVE':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
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
    const now = new Date()
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admissions</h1>
        <p className="text-gray-500">Manage patient admissions and discharges</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by patient name, ID, or ward..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === 'ADMITTED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('ADMITTED')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Admitted
          </Button>
          <Button
            variant={statusFilter === 'DISCHARGED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('DISCHARGED')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Discharged
          </Button>
          <Button
            variant={statusFilter === 'TRANSFERRED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('TRANSFERRED')}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Transferred
          </Button>
        </div>
      </div>

      {/* Admissions List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading admissions...
            </CardContent>
          </Card>
        ) : filteredAdmissions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No admissions found with status: {statusFilter.toLowerCase()}
            </CardContent>
          </Card>
        ) : (
          filteredAdmissions.map((admission) => (
            <Card key={admission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium text-gray-900">
                          {admission.patient.firstName} {admission.patient.lastName}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(admission.status)}`}>
                          {admission.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-500">Patient ID</p>
                          <p className="font-medium">{admission.patient.patientId}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Age / Gender</p>
                          <p className="font-medium">
                            {calculateAge(admission.patient.dateOfBirth)} yrs | {admission.patient.gender}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Ward / Bed</p>
                          <p className="font-medium">
                            {admission.ward?.name || 'N/A'} / {admission.bed?.bedNumber || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Admitted</p>
                          <p className="font-medium">
                            {formatDate(admission.admissionDate)}
                            {admission.status === 'ADMITTED' && (
                              <span className="text-gray-500 ml-1">
                                ({getDaysAdmitted(admission.admissionDate)} days)
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {admission.admissionReason && (
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Reason:</span> {admission.admissionReason}
                        </p>
                      )}

                      {admission.diagnosis && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Diagnosis:</span> {admission.diagnosis}
                        </p>
                      )}

                      {admission.attendingDoctor && (
                        <p className="text-sm text-gray-500 mt-2">
                          Attending: Dr. {admission.attendingDoctor.user.firstName} {admission.attendingDoctor.user.lastName} ({admission.attendingDoctor.designation})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Link href={`/wards/admissions/${admission.id}`}>
                      <Button size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
