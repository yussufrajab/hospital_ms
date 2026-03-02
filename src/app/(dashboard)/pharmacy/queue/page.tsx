'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, User, Pill, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Prescription {
  id: string
  prescriptionDate: string
  status: string
  patient: {
    id: string
    patientId: string
    firstName: string
    lastName: string
    phone: string | null
  }
  doctor: {
    designation: string
    user: {
      firstName: string
      lastName: string
    }
  }
  items: Array<{
    id: string
    drug: {
      name: string
      strength: string | null
      form: string | null
    }
    dosage: string
    frequency: string
    quantity: number
    isDispensed: boolean
  }>
}

export default function PharmacyQueuePage() {
  const { data: session } = useSession()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')

  useEffect(() => {
    fetchPrescriptions()
  }, [statusFilter])

  const fetchPrescriptions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/prescriptions?status=${statusFilter}&limit=50`)
      const data = await response.json()
      setPrescriptions(data.data || [])
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'PARTIALLY_DISPENSED':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'DISPENSED':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const pendingCount = prescriptions.filter(p => p.status === 'PENDING').length
  const partialCount = prescriptions.filter(p => p.status === 'PARTIALLY_DISPENSED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescription Queue</h1>
          <p className="text-gray-500">Manage and dispense prescriptions</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('PENDING')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending ({pendingCount})
        </Button>
        <Button
          variant={statusFilter === 'PARTIALLY_DISPENSED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('PARTIALLY_DISPENSED')}
        >
          <Pill className="h-4 w-4 mr-2" />
          Partial ({partialCount})
        </Button>
        <Button
          variant={statusFilter === 'DISPENSED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('DISPENSED')}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Completed
        </Button>
      </div>

      {/* Prescription List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading prescriptions...
            </CardContent>
          </Card>
        ) : prescriptions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No prescriptions found with status: {statusFilter.replace('_', ' ')}
            </CardContent>
          </Card>
        ) : (
          prescriptions.map((prescription) => (
            <Card key={prescription.id} className="border-l-4 border-l-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Patient Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {prescription.patient.firstName} {prescription.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {prescription.patient.patientId}
                          {prescription.patient.phone && ` | ${prescription.patient.phone}`}
                        </p>
                      </div>
                    </div>

                    {/* Prescription Details */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Prescribed by:</span>{' '}
                        {prescription.doctor.user.firstName} {prescription.doctor.user.lastName} ({prescription.doctor.designation})
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {formatDate(prescription.prescriptionDate)}
                      </p>
                    </div>

                    {/* Medications */}
                    <div className="space-y-2">
                      {prescription.items.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          {item.isDispensed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                          )}
                          <span className={item.isDispensed ? 'text-gray-400 line-through' : 'text-gray-700'}>
                            {item.drug.name} {item.drug.strength} - {item.dosage} | {item.frequency} | Qty: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(prescription.status)}`}>
                      {prescription.status.replace('_', ' ')}
                    </span>
                    {prescription.status !== 'DISPENSED' && prescription.status !== 'CANCELLED' && (
                      <Link href={`/pharmacy/dispense/${prescription.id}`}>
                        <Button size="sm">
                          <Pill className="h-4 w-4 mr-1" />
                          Dispense
                        </Button>
                      </Link>
                    )}
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
