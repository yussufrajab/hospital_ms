'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FileText, Search, Plus, Clock, CreditCard, CheckCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Bill {
  id: string
  billNumber: string
  billDate: string
  dueDate: string | null
  totalAmount: number
  paidAmount: number
  status: string
  patient: {
    patientId: string
    firstName: string
    lastName: string
    phone: string | null
  }
  items: Array<{
    description: string
    quantity: number
    total: number
  }>
}

export default function InvoicesPage() {
  const { data: session } = useSession()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchBills()
  }, [statusFilter])

  const fetchBills = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      params.append('limit', '100')

      const response = await fetch(`/api/bills?${params.toString()}`)
      const data = await response.json()
      setBills(data.data || [])
    } catch (error) {
      console.error('Error fetching bills:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBills = bills.filter(bill =>
    bill.billNumber.toLowerCase().includes(search.toLowerCase()) ||
    bill.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
    bill.patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
    bill.patient.patientId.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700'
      case 'PARTIALLY_PAID':
        return 'bg-blue-100 text-blue-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'OVERDUE':
        return 'bg-red-100 text-red-700'
      case 'CANCELLED':
        return 'bg-gray-100 text-gray-700'
      case 'REFUNDED':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500">Manage patient bills and invoices</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by bill number, patient name, or ID..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PENDING')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Pending
          </Button>
          <Button
            variant={statusFilter === 'PARTIALLY_PAID' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PARTIALLY_PAID')}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Partial
          </Button>
          <Button
            variant={statusFilter === 'PAID' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('PAID')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Paid
          </Button>
          <Button
            variant={statusFilter === 'OVERDUE' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('OVERDUE')}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Overdue
          </Button>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading invoices...
            </CardContent>
          </Card>
        ) : filteredBills.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No invoices found
            </CardContent>
          </Card>
        ) : (
          filteredBills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Bill Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {bill.patient.firstName} {bill.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {bill.billNumber} | Patient ID: {bill.patient.patientId}
                        </p>
                      </div>
                    </div>

                    {/* Bill Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Bill Date</p>
                        <p className="font-medium">{new Date(bill.billDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Due Date</p>
                        <p className="font-medium">
                          {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Total Amount</p>
                        <p className="font-medium">{formatCurrency(Number(bill.totalAmount))}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount Paid</p>
                        <p className="font-medium text-green-600">{formatCurrency(Number(bill.paidAmount))}</p>
                      </div>
                    </div>

                    {/* Items Summary */}
                    <div className="text-sm text-gray-500">
                      {bill.items.length} item(s): {bill.items.map(i => i.description).join(', ').substring(0, 100)}
                      {bill.items.map(i => i.description).join(', ').length > 100 && '...'}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(bill.status)}`}>
                      {bill.status.replace('_', ' ')}
                    </span>
                    <Link href={`/billing/invoices/${bill.id}`}>
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
