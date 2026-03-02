'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DollarSign, Search, Download, Filter } from 'lucide-react'
import Link from 'next/link'

interface Payment {
  id: string
  paymentNumber: string
  amount: number
  method: string
  status: string
  transactionId: string | null
  paidAt: string
  notes: string | null
  patient: {
    patientId: string
    firstName: string
    lastName: string
    phone: string | null
  }
  bill: {
    billNumber: string
    totalAmount: number
  }
}

export default function PaymentsPage() {
  const { data: session } = useSession()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [methodFilter, setMethodFilter] = useState('')

  useEffect(() => {
    fetchPayments()
  }, [methodFilter])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (methodFilter) params.append('method', methodFilter)
      params.append('limit', '100')

      const response = await fetch(`/api/payments?${params.toString()}`)
      const data = await response.json()
      setPayments(data.data || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPayments = payments.filter(payment =>
    payment.paymentNumber.toLowerCase().includes(search.toLowerCase()) ||
    payment.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
    payment.patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
    payment.patient.patientId.toLowerCase().includes(search.toLowerCase()) ||
    payment.bill.billNumber.toLowerCase().includes(search.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'CASH':
        return 'bg-green-100 text-green-700'
      case 'CARD':
        return 'bg-blue-100 text-blue-700'
      case 'MOBILE_MONEY':
        return 'bg-purple-100 text-purple-700'
      case 'BANK_TRANSFER':
        return 'bg-indigo-100 text-indigo-700'
      case 'INSURANCE':
        return 'bg-orange-100 text-orange-700'
      case 'CHEQUE':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Calculate totals
  const totalAmount = filteredPayments.reduce((sum, p) => sum + Number(p.amount), 0)
  const todayPayments = filteredPayments.filter(p => 
    new Date(p.paidAt).toDateString() === new Date().toDateString()
  )
  const todayTotal = todayPayments.reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500">View all payment records</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Payments</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today's Collections</p>
                <p className="text-2xl font-bold">{formatCurrency(todayTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Today's Transactions</p>
                <p className="text-2xl font-bold">{todayPayments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by payment number, patient, or bill..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={methodFilter === '' ? 'default' : 'outline'}
            onClick={() => setMethodFilter('')}
          >
            All Methods
          </Button>
          <Button
            variant={methodFilter === 'CASH' ? 'default' : 'outline'}
            onClick={() => setMethodFilter('CASH')}
          >
            Cash
          </Button>
          <Button
            variant={methodFilter === 'CARD' ? 'default' : 'outline'}
            onClick={() => setMethodFilter('CARD')}
          >
            Card
          </Button>
          <Button
            variant={methodFilter === 'MOBILE_MONEY' ? 'default' : 'outline'}
            onClick={() => setMethodFilter('MOBILE_MONEY')}
          >
            Mobile Money
          </Button>
          <Button
            variant={methodFilter === 'INSURANCE' ? 'default' : 'outline'}
            onClick={() => setMethodFilter('INSURANCE')}
          >
            Insurance
          </Button>
        </div>
      </div>

      {/* Payments List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading payments...
            </CardContent>
          </Card>
        ) : filteredPayments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No payments found
            </CardContent>
          </Card>
        ) : (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {payment.patient.firstName} {payment.patient.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {payment.paymentNumber} | Bill: {payment.bill.billNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(Number(payment.amount))}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(payment.paidAt).toLocaleDateString()} at{' '}
                        {new Date(payment.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getMethodColor(payment.method)}`}>
                      {payment.method.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {payment.transactionId && (
                  <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                    Transaction ID: {payment.transactionId}
                  </div>
                )}

                {payment.notes && (
                  <div className="mt-2 pt-2 border-t text-sm text-gray-500">
                    Notes: {payment.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
