'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users, BedDouble, CheckCircle, AlertTriangle, User } from 'lucide-react'
import Link from 'next/link'

interface Bed {
  id: string
  bedNumber: string
  type: string
  status: string
  dailyRate: number | null
  features: string | null
  admissions: Array<{
    id: string
    patient: {
      patientId: string
      firstName: string
      lastName: string
    }
  }>
}

interface Ward {
  id: string
  name: string
  code: string
  floor: string | null
  capacity: number
  type: string | null
  department: {
    name: string
    code: string
  }
  beds: Bed[]
  admissions: Array<{
    id: string
    patient: {
      patientId: string
      firstName: string
      lastName: string
      dateOfBirth: string
      gender: string
    }
    bed: {
      bedNumber: string
    } | null
  }>
}

export default function WardDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [ward, setWard] = useState<Ward | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBed, setSelectedBed] = useState<Bed | null>(null)

  useEffect(() => {
    fetchWard()
  }, [params.code])

  const fetchWard = async () => {
    try {
      // First get all wards to find the ID by code
      const wardsRes = await fetch('/api/wards')
      const wardsData = await wardsRes.json()
      const wardInfo = wardsData.data?.find((w: Ward) => w.code === params.code)

      if (!wardInfo) {
        setLoading(false)
        return
      }

      // Then get detailed ward info
      const response = await fetch(`/api/wards/${wardInfo.id}`)
      const data = await response.json()
      setWard(data)
    } catch (error) {
      console.error('Error fetching ward:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-green-100 border-green-300 hover:bg-green-200'
      case 'OCCUPIED':
        return 'bg-red-100 border-red-300 hover:bg-red-200'
      case 'RESERVED':
        return 'bg-blue-100 border-blue-300 hover:bg-blue-200'
      case 'MAINTENANCE':
        return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200'
      case 'DIRTY':
        return 'bg-orange-100 border-orange-300 hover:bg-orange-200'
      default:
        return 'bg-gray-100 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'OCCUPIED':
        return <User className="h-4 w-4 text-red-600" />
      case 'DIRTY':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      default:
        return <BedDouble className="h-4 w-4 text-gray-600" />
    }
  }

  const getBedTypeLabel = (type: string) => {
    switch (type) {
      case 'GENERAL':
        return 'General'
      case 'PRIVATE':
        return 'Private'
      case 'ICU':
        return 'ICU'
      case 'SEMI_PRIVATE':
        return 'Semi-Private'
      default:
        return type
    }
  }

  const handleBedStatusChange = async (bedId: string, newStatus: string) => {
    try {
      await fetch(`/api/beds/${bedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      await fetchWard()
      setSelectedBed(null)
    } catch (error) {
      console.error('Error updating bed status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!ward) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">Ward not found</div>
        <Button onClick={() => router.push('/wards')}>Back to Wards</Button>
      </div>
    )
  }

  const occupiedBeds = ward.beds.filter(b => b.status === 'OCCUPIED').length
  const availableBeds = ward.beds.filter(b => b.status === 'AVAILABLE').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/wards')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{ward.name}</h1>
            <p className="text-gray-500">
              {ward.department.name} | {ward.floor ? `Floor ${ward.floor}` : 'N/A'} | Code: {ward.code}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Occupancy</p>
            <p className="text-lg font-bold">
              {occupiedBeds}/{ward.beds.length} beds
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BedDouble className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Beds</p>
                <p className="text-2xl font-bold">{ward.beds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Users className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Occupied</p>
                <p className="text-2xl font-bold">{occupiedBeds}</p>
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
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold">{availableBeds}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Needs Cleaning</p>
                <p className="text-2xl font-bold">
                  {ward.beds.filter(b => b.status === 'DIRTY').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bed Grid */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-4">Bed Layout</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {ward.beds.map((bed) => (
              <div
                key={bed.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${getStatusColor(bed.status)}`}
                onClick={() => setSelectedBed(bed)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{bed.bedNumber}</span>
                  {getStatusIcon(bed.status)}
                </div>
                <p className="text-xs text-gray-600">{getBedTypeLabel(bed.type)}</p>
                {bed.status === 'OCCUPIED' && bed.admissions[0] && (
                  <p className="text-xs text-gray-700 mt-1 truncate">
                    {bed.admissions[0].patient.firstName} {bed.admissions[0].patient.lastName}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
              <span className="text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
              <span className="text-sm">Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300" />
              <span className="text-sm">Reserved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-100 border border-orange-300" />
              <span className="text-sm">Needs Cleaning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
              <span className="text-sm">Maintenance</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Admissions */}
      {ward.admissions.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Current Patients</h3>
            <div className="space-y-3">
              {ward.admissions.map((admission) => (
                <div key={admission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {admission.patient.firstName} {admission.patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        ID: {admission.patient.patientId} | Bed: {admission.bed?.bedNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <Link href={`/wards/admissions/${admission.id}`}>
                    <Button size="sm" variant="outline">View Details</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bed Detail Modal */}
      {selectedBed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Bed {selectedBed.bedNumber}</h3>
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="font-medium">{getBedTypeLabel(selectedBed.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-medium">{selectedBed.status.replace('_', ' ')}</span>
                </div>
                {selectedBed.dailyRate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Daily Rate:</span>
                    <span className="font-medium">${Number(selectedBed.dailyRate).toFixed(2)}</span>
                  </div>
                )}
                {selectedBed.features && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Features:</span>
                    <span className="font-medium">{selectedBed.features}</span>
                  </div>
                )}
                {selectedBed.status === 'OCCUPIED' && selectedBed.admissions[0] && (
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-500 mb-1">Current Patient:</p>
                    <p className="font-medium">
                      {selectedBed.admissions[0].patient.firstName} {selectedBed.admissions[0].patient.lastName}
                    </p>
                  </div>
                )}
              </div>

              {/* Status Change Buttons */}
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-500">Change Status:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBed.status !== 'AVAILABLE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBedStatusChange(selectedBed.id, 'AVAILABLE')}
                    >
                      Set Available
                    </Button>
                  )}
                  {selectedBed.status !== 'OCCUPIED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBedStatusChange(selectedBed.id, 'OCCUPIED')}
                    >
                      Set Occupied
                    </Button>
                  )}
                  {selectedBed.status !== 'DIRTY' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBedStatusChange(selectedBed.id, 'DIRTY')}
                    >
                      Mark Dirty
                    </Button>
                  )}
                  {selectedBed.status !== 'MAINTENANCE' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBedStatusChange(selectedBed.id, 'MAINTENANCE')}
                    >
                      Set Maintenance
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedBed(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
