'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Pill, Package, AlertTriangle, Clock, TrendingUp, CheckCircle, XCircle } from 'lucide-react'

interface PharmacyData {
  period: { startDate: string; endDate: string }
  summary: {
    totalPrescriptions: number
    dispensedPrescriptions: number
    pendingPrescriptions: number
    cancelledPrescriptions: number
    dispensingRate: number
    averageDispensingHours: number
  }
  inventory: {
    totalDrugs: number
    lowStock: number
    outOfStock: number
    expired: number
    nearExpiry: number
    totalQuantity: number
  }
  topDispensedDrugs: Array<{ drug: string; count: number }>
  prescriptionsByMonth: Array<{ month: string; count: number }>
  inventoryByCategory: Array<{ category: string; drugCount: number; totalQuantity: number }>
  dispensingByType: Array<{ type: string; count: number }>
  dailyPrescriptions: Array<{ date: string; count: number }>
}

export default function PharmacyReportsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<PharmacyData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPharmacyData()
  }, [session])

  const fetchPharmacyData = async () => {
    try {
      const response = await fetch('/api/reports/pharmacy')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching pharmacy data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Reports</h1>
        <p className="text-gray-500">Inventory, dispensing, and prescription analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Pill className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Prescriptions</p>
                <p className="text-2xl font-bold">{data.summary.totalPrescriptions}</p>
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
                <p className="text-sm text-gray-500">Dispensing Rate</p>
                <p className="text-2xl font-bold">{data.summary.dispensingRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Dispensing Time</p>
                <p className="text-2xl font-bold">{data.summary.averageDispensingHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Package className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Drugs</p>
                <p className="text-2xl font-bold">{data.inventory.totalDrugs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prescription Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Dispensed</p>
                <p className="text-2xl font-bold text-green-800">{data.summary.dispensedPrescriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{data.summary.pendingPrescriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Cancelled</p>
                <p className="text-2xl font-bold text-red-800">{data.summary.cancelledPrescriptions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Alerts */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Inventory Alerts
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-600">{data.inventory.outOfStock}</p>
              <p className="text-sm text-red-700">Out of Stock</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-orange-600">{data.inventory.lowStock}</p>
              <p className="text-sm text-orange-700">Low Stock</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-yellow-600">{data.inventory.nearExpiry}</p>
              <p className="text-sm text-yellow-700">Near Expiry (30d)</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg text-center">
              <p className="text-3xl font-bold text-gray-600">{data.inventory.expired}</p>
              <p className="text-sm text-gray-700">Expired</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-blue-600">{data.inventory.totalQuantity}</p>
              <p className="text-sm text-blue-700">Total Units</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Prescriptions & Top Drugs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Prescriptions */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Daily Prescriptions (Last 7 Days)</h3>
            <div className="h-40 flex items-end gap-2">
              {data.dailyPrescriptions.slice(0, 7).reverse().map((item, idx) => {
                const maxCount = Math.max(...data.dailyPrescriptions.map(d => d.count))
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-purple-500 rounded-t"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Dispensed Drugs */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Dispensed Drugs
            </h3>
            <div className="space-y-2">
              {data.topDispensedDrugs.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-5">{idx + 1}.</span>
                    <span className="text-sm truncate">{item.drug}</span>
                  </div>
                  <span className="font-medium text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory by Category & Dispensing by Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inventory by Category */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Inventory by Category</h3>
            <div className="space-y-3">
              {data.inventoryByCategory.slice(0, 8).map((item) => {
                const totalQty = data.inventoryByCategory.reduce((sum, c) => sum + c.totalQuantity, 0)
                const percentage = totalQty > 0 ? (item.totalQuantity / totalQty) * 100 : 0
                return (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.category}</span>
                      <span>{item.totalQuantity} units ({item.drugCount} drugs)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-purple-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Dispensing by Drug Type */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Dispensing by Drug Type</h3>
            <div className="grid grid-cols-2 gap-3">
              {data.dispensingByType.map((item) => {
                const total = data.dispensingByType.reduce((sum, t) => sum + t.count, 0)
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.type} className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">{item.type || 'Unknown'}</p>
                    <p className="text-xl font-bold">{item.count}</p>
                    <p className="text-xs text-gray-400">{percentage}%</p>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
