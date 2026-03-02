'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { DollarSign, CreditCard, TrendingUp, Clock, AlertTriangle, CheckCircle, FileText, Receipt } from 'lucide-react'

interface FinancialData {
  period: { startDate: string; endDate: string }
  summary: {
    totalBills: number
    paidBills: number
    pendingBills: number
    overdueBills: number
    totalRevenue: number
    totalDiscount: number
    totalTax: number
    collectionRate: number
    averageCollectionDays: number
  }
  paymentsByMethod: Array<{ method: string; count: number; amount: number }>
  revenueByMonth: Array<{ month: string; revenue: number }>
  revenueByDepartment: Array<{ department: string; revenue: number }>
  topPayers: Array<{ patientId: string; name: string; total: number }>
  insurance: {
    totalClaims: number
    claimedAmount: number
    approvedAmount: number
  }
  outstandingByAge: Array<{ bucket: string; count: number; amount: number }>
  dailyRevenue: Array<{ date: string; revenue: number }>
}

export default function FinancialReportsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<FinancialData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFinancialData()
  }, [session])

  const fetchFinancialData = async () => {
    try {
      const response = await fetch('/api/reports/financial')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching financial data:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-500">Revenue, billing, and payment analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(data.summary.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Collection Rate</p>
                <p className="text-2xl font-bold">{data.summary.collectionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Collection Days</p>
                <p className="text-2xl font-bold">{data.summary.averageCollectionDays}</p>
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
                <p className="text-sm text-gray-500">Overdue Bills</p>
                <p className="text-2xl font-bold">{data.summary.overdueBills}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bills Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700">Paid Bills</p>
                <p className="text-2xl font-bold text-green-800">{data.summary.paidBills}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700">Pending Bills</p>
                <p className="text-2xl font-bold text-yellow-800">{data.summary.pendingBills}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700">Overdue Bills</p>
                <p className="text-2xl font-bold text-red-800">{data.summary.overdueBills}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-4">Daily Revenue (Last 30 Days)</h3>
          <div className="h-48 flex items-end gap-1">
            {data.dailyRevenue.slice(0, 30).reverse().map((item, idx) => {
              const maxRevenue = Math.max(...data.dailyRevenue.map(d => d.revenue))
              const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0
              return (
                <div key={idx} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Payments by Method & Revenue by Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payments by Method */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Payments by Method</h3>
            <div className="space-y-3">
              {data.paymentsByMethod.map((item) => {
                const totalAmount = data.paymentsByMethod.reduce((sum, p) => sum + p.amount, 0)
                const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0
                return (
                  <div key={item.method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{item.method}</span>
                      <span>{formatCurrency(item.amount)} ({item.count} payments)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Department */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue by Department
            </h3>
            <div className="space-y-2">
              {data.revenueByDepartment.slice(0, 8).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-5">{idx + 1}.</span>
                    <span className="text-sm">{item.department}</span>
                  </div>
                  <span className="font-medium text-sm">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Outstanding Aging & Insurance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outstanding by Age */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Outstanding by Age
            </h3>
            <div className="space-y-3">
              {data.outstandingByAge.map((item) => (
                <div key={item.bucket} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{item.bucket}</p>
                    <p className="text-sm text-gray-500">{item.count} bills</p>
                  </div>
                  <p className="font-bold text-lg">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insurance Claims */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Insurance Claims
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">Total Claims</p>
                <p className="text-2xl font-bold text-blue-800">{data.insurance.totalClaims}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">Claimed Amount</p>
                  <p className="font-bold">{formatCurrency(data.insurance.claimedAmount)}</p>
                </div>
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-sm text-gray-600">Approved Amount</p>
                  <p className="font-bold text-green-700">{formatCurrency(data.insurance.approvedAmount)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Payers */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Top Payers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.topPayers.slice(0, 10).map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    #{idx + 1}
                  </span>
                  <span className="text-xs text-gray-500">{item.patientId}</span>
                </div>
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
