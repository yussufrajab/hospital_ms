'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Search, Plus, Eye, Edit } from 'lucide-react'
import Link from 'next/link'

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  middleName: string | null
  dateOfBirth: Date
  gender: string
  phone: string | null
  email: string | null
  patientType: string
  createdAt: Date
  admissions: Array<{ status: string }>
}

interface PaginatedResponse {
  data: Patient[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function PatientsPage() {
  const { data: session } = useSession()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchPatients()
  }, [page, search])

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
      })
      const response = await fetch(`/api/patients?${params}`)
      if (!response.ok) throw new Error('Failed to fetch patients')
      const data: PaginatedResponse = await response.json()
      setPatients(data?.data || [])
      setTotalPages(data?.totalPages || 1)
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([])
      setTotalPages(1)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Manage patient records and information</p>
        </div>
        <Link href="/patients/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register Patient
          </Button>
        </Link>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              type="search"
              placeholder="Search by name, patient ID, or phone..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Patient List
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : patients.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No patients found. Register a new patient to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Patient ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Age/Gender</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Phone</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className="font-mono text-sm text-blue-600">{patient.patientId}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.firstName} {patient.middleName} {patient.lastName}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600">
                          {calculateAge(patient.dateOfBirth)} yrs / {patient.gender}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{patient.phone || '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          patient.patientType === 'IPD' ? 'bg-purple-50 text-purple-700' :
                          patient.patientType === 'EMERGENCY' ? 'bg-red-50 text-red-700' :
                          'bg-green-50 text-green-700'
                        }`}>
                          {patient.patientType}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          patient.admissions?.length > 0 ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-700'
                        }`}>
                          {patient.admissions?.length > 0 ? 'Admitted' : 'Outpatient'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/patients/${patient.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/patients/${patient.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
