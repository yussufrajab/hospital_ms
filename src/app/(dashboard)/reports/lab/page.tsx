'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { FlaskConical, Clock, AlertTriangle, TrendingUp, CheckCircle, XCircle, Activity } from 'lucide-react'

interface LabData {
  period: { startDate: string; endDate: string }
  summary: {
    totalOrders: number
    completedOrders: number
    pendingOrders: number
    cancelledOrders: number
    completionRate: number
    totalTests: number
    averageTurnaroundHours: number
    labRevenue: number
  }
  results: {
    critical: number
    abnormal: number
    normal: number
    criticalPendingFollowup: number
  }
  ordersByStatus: Array<{ status: string; count: number }>
  ordersByPriority: Array<{ priority: string; count: number }>
  topTests: Array<{ test: string; count: number }>
  ordersByMonth: Array<{ month: string; count: number }>
  testsByCategory: Array<{ category: string; count: number }>
  dailyOrders: Array<{ date: string; count: number }>
}

export default function LabReportsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<LabData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLabData()
  }, [session])

  const fetchLabData = async () => {
    try {
      const response = await fetch('/api/reports/lab')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching lab data:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Laboratory Reports</h1>
        <p className="text-gray-500">Test volumes, turnaround times, and result analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <FlaskConical className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Orders</p>
                <p className="text-2xl font-bold">{data.summary.totalOrders}</p>
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
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-2xl font-bold">{data.summary.completionRate}%</p>
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
                <p className="text-sm text-gray-500">Avg. Turnaround</p>
                <p className="text-2xl font-bold">{data.summary.averageTurnaroundHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Lab Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.labRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-800">{data.summary.completedOrders}</p>
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
                <p className="text-2xl font-bold text-yellow-800">{data.summary.pendingOrders}</p>
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
                <p className="text-2xl font-bold text-red-800">{data.summary.cancelledOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Status */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Result Status Distribution
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-600">{data.results.normal}</p>
              <p className="text-sm text-green-700">Normal</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-yellow-600">{data.results.abnormal}</p>
              <p className="text-sm text-yellow-700">Abnormal</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-red-600">{data.results.critical}</p>
              <p className="text-sm text-red-700">Critical</p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg text-center">
              <p className="text-3xl font-bold text-orange-600">{data.results.criticalPendingFollowup}</p>
              <p className="text-sm text-orange-700">Critical Pending Follow-up</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Orders & Top Tests */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Orders */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Daily Orders (Last 7 Days)</h3>
            <div className="h-40 flex items-end gap-2">
              {data.dailyOrders.slice(0, 7).reverse().map((item, idx) => {
                const maxCount = Math.max(...data.dailyOrders.map(d => d.count))
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-orange-500 rounded-t"
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

        {/* Top Tests */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top Ordered Tests
            </h3>
            <div className="space-y-2">
              {data.topTests.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-5">{idx + 1}.</span>
                    <span className="text-sm truncate">{item.test}</span>
                  </div>
                  <span className="font-medium text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders by Status/Priority & Tests by Category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Orders by Status</h3>
            <div className="space-y-3">
              {data.ordersByStatus.map((item) => {
                const total = data.ordersByStatus.reduce((sum, s) => sum + s.count, 0)
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.status}</span>
                      <span>{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.status === 'COMPLETED'
                            ? 'bg-green-500'
                            : item.status === 'CANCELLED'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Orders by Priority */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Orders by Priority</h3>
            <div className="space-y-3">
              {data.ordersByPriority.map((item) => {
                const total = data.ordersByPriority.reduce((sum, p) => sum + p.count, 0)
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0
                return (
                  <div key={item.priority}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.priority}</span>
                      <span>{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.priority === 'STAT'
                            ? 'bg-red-500'
                            : item.priority === 'URGENT'
                            ? 'bg-orange-500'
                            : 'bg-blue-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tests by Category */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Tests by Category</h3>
            <div className="space-y-2">
              {data.testsByCategory.slice(0, 8).map((item) => (
                <div key={item.category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{item.category}</span>
                  <span className="font-medium text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      {data.results.criticalPendingFollowup > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <p className="font-medium text-red-800">
                  {data.results.criticalPendingFollowup} critical results pending follow-up
                </p>
                <p className="text-sm text-red-600">
                  These results require immediate attention and acknowledgment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
