'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  DollarSign,
  Pill,
  FlaskConical,
  BedDouble,
  Calendar,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  period: { startDate: string; endDate: string }
  patients: { total: number; new: number }
  admissions: { total: number; active: number; byType: Array<{ type: string; count: number }> }
  appointments: {
    total: number
    completed: number
    completionRate: number
    byStatus: Array<{ status: string; count: number }>
    daily: Array<{ date: string; count: number }>
  }
  beds: { total: number; occupied: number; occupancyRate: number }
  billing: {
    totalBills: number
    paidBills: number
    totalRevenue: number
    pendingRevenue: number
    collectionRate: number
    dailyRevenue: Array<{ date: string; amount: number }>
  }
  pharmacy: { totalPrescriptions: number; dispensed: number; dispensingRate: number }
  laboratory: { totalOrders: number; completed: number; completionRate: number }
}

export default function ReportsDashboard() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [session])

  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/reports/dashboard')
      const result = await response.json()
      
      if (!response.ok) {
        console.error('API Error:', result)
        return
      }
      
      // Validate the response has the expected structure
      if (result && result.patients && result.admissions && result.appointments && 
          result.beds && result.billing && result.pharmacy && result.laboratory) {
        setData(result)
      } else {
        console.error('Invalid response structure:', result)
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
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
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500">Hospital performance overview and insights</p>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/reports/patients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Patient Reports</p>
                  <p className="text-sm text-gray-500">Demographics & trends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reports/financial">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Financial Reports</p>
                  <p className="text-sm text-gray-500">Revenue & billing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reports/pharmacy">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Pill className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Pharmacy Reports</p>
                  <p className="text-sm text-gray-500">Inventory & dispensing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/reports/lab">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <FlaskConical className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">Lab Reports</p>
                  <p className="text-sm text-gray-500">Tests & turnaround</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold">{data.patients.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-200" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              +{data.patients.new} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Bed Occupancy</p>
                <p className="text-2xl font-bold">{data.beds.occupancyRate}%</p>
              </div>
              <BedDouble className="h-8 w-8 text-purple-200" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.beds.occupied}/{data.beds.total} beds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Appointments</p>
                <p className="text-2xl font-bold">{data.appointments.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-200" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              {data.appointments.completionRate}% completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.billing.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {data.billing.collectionRate}% collection rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Prescriptions</p>
                <p className="text-2xl font-bold">{data.pharmacy.totalPrescriptions}</p>
              </div>
              <Pill className="h-8 w-8 text-purple-200" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              {data.pharmacy.dispensingRate}% dispensed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Lab Tests</p>
                <p className="text-2xl font-bold">{data.laboratory.totalOrders}</p>
              </div>
              <FlaskConical className="h-8 w-8 text-orange-200" />
            </div>
            <p className="text-xs text-green-600 mt-1">
              {data.laboratory.completionRate}% completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments by Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Appointments by Status</h3>
            <div className="space-y-3">
              {data.appointments.byStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.status === 'COMPLETED'
                          ? 'bg-green-500'
                          : item.status === 'CANCELLED'
                          ? 'bg-red-500'
                          : item.status === 'IN_PROGRESS'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-sm">{item.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.count}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((item.count / data.appointments.total) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admissions by Type */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Admissions by Type</h3>
            <div className="space-y-3">
              {data.admissions.byType.map((item) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        item.type === 'EMERGENCY'
                          ? 'bg-red-500'
                          : item.type === 'IPD'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <span className="text-sm">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.count}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((item.count / data.admissions.total) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Currently Admitted:</span>
                <span className="font-medium">{data.admissions.active}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-4">Daily Revenue (Last 7 Days)</h3>
          <div className="h-48 flex items-end gap-2">
            {data.billing.dailyRevenue.slice(0, 7).reverse().map((item, idx) => {
              const maxRevenue = Math.max(...data.billing.dailyRevenue.map(d => d.amount))
              const height = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-green-500 rounded-t"
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

      {/* Pending Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Pending Revenue</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatCurrency(data.billing.pendingRevenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Active Admissions</p>
                <p className="text-2xl font-bold text-blue-900">{data.admissions.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Pill className="h-5 w-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800">Pending Prescriptions</p>
                <p className="text-2xl font-bold text-purple-900">
                  {data.pharmacy.totalPrescriptions - data.pharmacy.dispensed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
