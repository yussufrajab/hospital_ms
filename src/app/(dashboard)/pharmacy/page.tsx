'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pill, Clock, AlertTriangle, Package, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Prescription {
  id: string
  prescriptionDate: string
  status: string
  patient: {
    patientId: string
    firstName: string
    lastName: string
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
    }
    isDispensed: boolean
  }>
}

interface LowStockDrug {
  drugId: string
  drugName: string
  drugCode: string
  currentStock: number
  reorderLevel: number
}

export default function PharmacyDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [pendingPrescriptions, setPendingPrescriptions] = useState<Prescription[]>([])
  const [lowStockDrugs, setLowStockDrugs] = useState<LowStockDrug[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [session])

  const fetchData = async () => {
    try {
      // Fetch pending prescriptions
      const prescriptionsRes = await fetch('/api/prescriptions?status=PENDING&limit=10')
      const prescriptionsData = await prescriptionsRes.json()
      setPendingPrescriptions(prescriptionsData.data || [])

      // Fetch drug inventory for low stock alerts
      const inventoryRes = await fetch('/api/drug-inventory?limit=100')
      const inventoryData = await inventoryRes.json()
      setLowStockDrugs(inventoryData.lowStock || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = pendingPrescriptions.length
  const partiallyDispensedCount = pendingPrescriptions.filter(p => p.status === 'PARTIALLY_DISPENSED').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
        <p className="text-gray-500">Manage prescriptions and drug inventory</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Pill className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Partial</p>
                <p className="text-2xl font-bold">{partiallyDispensedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Low Stock</p>
                <p className="text-2xl font-bold">{lowStockDrugs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inventory</p>
                <Link href="/pharmacy/inventory">
                  <Button size="sm" variant="outline">Manage</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Prescriptions
              </span>
              <Link href="/pharmacy/queue">
                <Button size="sm" variant="outline">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPrescriptions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending prescriptions</p>
            ) : (
              <div className="space-y-3">
                {pendingPrescriptions.slice(0, 5).map((prescription) => (
                  <div key={prescription.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {prescription.patient.firstName} {prescription.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {prescription.items.length} medication(s) | {new Date(prescription.prescriptionDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/pharmacy/dispense/${prescription.id}`}>
                        <Button size="sm">Dispense</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockDrugs.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All drugs are adequately stocked</p>
            ) : (
              <div className="space-y-3">
                {lowStockDrugs.slice(0, 5).map((drug) => (
                  <div key={drug.drugId} className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-900">{drug.drugName}</p>
                        <p className="text-sm text-red-700">
                          {drug.drugCode} | Stock: {drug.currentStock} / Reorder: {drug.reorderLevel}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium bg-red-200 text-red-800 rounded">
                        Reorder
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
