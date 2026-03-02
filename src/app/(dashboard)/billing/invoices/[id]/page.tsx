'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, FileText, DollarSign, Printer, CheckCircle, CreditCard } from 'lucide-react'

interface Bill {
  id: string
  billNumber: string
  billDate: string
  dueDate: string | null
  subtotal: number
  discount: number
  tax: number
  totalAmount: number
  paidAmount: number
  status: string
  notes: string | null
  patient: {
    id: string
    patientId: string
    firstName: string
    lastName: string
    phone: string | null
    email: string | null
    address: string | null
    dateOfBirth: string
    gender: string
    insurancePolicies: Array<{
      id: string
      policyNumber: string
      policyName: string | null
      coverageAmount: number
      company: {
        name: string
        code: string
      }
    }>
  }
  items: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    discount: number
    total: number
    itemType: string | null
    referenceId: string | null
  }>
  payments: Array<{
    id: string
    paymentNumber: string
    amount: number
    method: string
    status: string
    transactionId: string | null
    paidAt: string
    notes: string | null
  }>
}

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [paymentData, setPaymentData] = useState({
    amount: '',
    method: 'CASH',
    transactionId: '',
    notes: '',
  })

  useEffect(() => {
    fetchBill()
  }, [params.id])

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch bill')
      const data = await response.json()
      setBill(data)
      setPaymentData(prev => ({
        ...prev,
        amount: (Number(data.totalAmount) - Number(data.paidAmount)).toFixed(2),
      }))
    } catch (error) {
      console.error('Error fetching bill:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bill) return

    setSaving(true)
    try {
      const response = await fetch(`/api/bills/${bill.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentData.amount),
          method: paymentData.method,
          transactionId: paymentData.transactionId || undefined,
          notes: paymentData.notes || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to record payment')

      await fetchBill()
      setShowPaymentForm(false)
      setPaymentData({
        amount: '',
        method: 'CASH',
        transactionId: '',
        notes: '',
      })
      alert('Payment recorded successfully!')
    } catch (error) {
      console.error('Error recording payment:', error)
      alert('Failed to record payment')
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

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
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading invoice...</div>
      </div>
    )
  }

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">Invoice not found</div>
        <Button onClick={() => router.push('/billing/invoices')}>Back to Invoices</Button>
      </div>
    )
  }

  const balance = Number(bill.totalAmount) - Number(bill.paidAmount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/billing/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoice {bill.billNumber}</h1>
            <p className="text-gray-500">
              {bill.patient.firstName} {bill.patient.lastName} | {bill.patient.patientId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
            <Button onClick={() => setShowPaymentForm(!showPaymentForm)}>
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      </div>

      {/* Payment Form */}
      {showPaymentForm && (
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle>Record Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Amount *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={paymentData.method}
                    onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  >
                    <option value="CASH">Cash</option>
                    <option value="CARD">Card</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="INSURANCE">Insurance</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Transaction ID</Label>
                  <Input
                    value={paymentData.transactionId}
                    onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Processing...' : 'Record Payment'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invoice Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Invoice */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient ID</p>
                  <p className="font-medium">{bill.patient.patientId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Patient Name</p>
                  <p className="font-medium">{bill.patient.firstName} {bill.patient.lastName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{bill.patient.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{bill.patient.email || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bill Items */}
          <Card>
            <CardHeader>
              <CardTitle>Bill Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Qty</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Unit Price</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Discount</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bill.items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-medium">{item.description}</p>
                          {item.itemType && (
                            <p className="text-xs text-gray-500">{item.itemType}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(Number(item.unitPrice))}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(Number(item.discount))}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(Number(item.total))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          {bill.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {bill.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{payment.paymentNumber}</p>
                        <p className="text-sm text-gray-500">
                          {payment.method.replace('_', ' ')} | {new Date(payment.paidAt).toLocaleDateString()}
                        </p>
                        {payment.transactionId && (
                          <p className="text-xs text-gray-400">TXN: {payment.transactionId}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{formatCurrency(Number(payment.amount))}</p>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500">Status</span>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(bill.status)}`}>
                  {bill.status.replace('_', ' ')}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bill Date</span>
                  <span className="font-medium">{new Date(bill.billDate).toLocaleDateString()}</span>
                </div>
                {bill.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Due Date</span>
                    <span className="font-medium">{new Date(bill.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">{formatCurrency(Number(bill.subtotal))}</span>
              </div>
              {Number(bill.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium text-green-600">-{formatCurrency(Number(bill.discount))}</span>
                </div>
              )}
              {Number(bill.tax) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-medium">{formatCurrency(Number(bill.tax))}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-bold text-lg">{formatCurrency(Number(bill.totalAmount))}</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-medium text-green-600">{formatCurrency(Number(bill.paidAmount))}</span>
              </div>
              {balance > 0 && (
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-red-600">Balance Due</span>
                    <span className="font-bold text-lg text-red-600">{formatCurrency(balance)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Insurance Info */}
          {bill.patient.insurancePolicies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Insurance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bill.patient.insurancePolicies.map((policy) => (
                  <div key={policy.id} className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium">{policy.company.name}</p>
                    <p className="text-sm text-gray-600">Policy: {policy.policyNumber}</p>
                    <p className="text-sm text-gray-600">
                      Coverage: {formatCurrency(Number(policy.coverageAmount))}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {bill.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{bill.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
