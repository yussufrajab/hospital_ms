'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, FlaskConical, TestTube, CheckCircle, Save, AlertTriangle } from 'lucide-react'

interface LabOrder {
  id: string
  orderDate: string
  status: string
  priority: string | null
  notes: string | null
  patient: {
    id: string
    patientId: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
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
    status: string
    result: string | null
    resultStatus: string | null
    normalRange: string | null
    notes: string | null
    collectedAt: string | null
    reportedAt: string | null
    test: {
      id: string
      name: string
      testCode: string
      category: string | null
      specimenType: string | null
      normalRangeMin: number | null
      normalRangeMax: number | null
      unit: string | null
      turnaroundTime: number | null
    }
  }>
}

export default function LabOrderProcessPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [order, setOrder] = useState<LabOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [results, setResults] = useState<Record<string, {
    result: string
    resultStatus: string
    notes: string
  }>>({})

  useEffect(() => {
    fetchOrder()
  }, [params.id])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/lab-orders/${params.id}/results`)
      if (!response.ok) throw new Error('Failed to fetch order')
      const data = await response.json()
      setOrder(data)
      
      // Initialize results
      const initialResults: Record<string, { result: string; resultStatus: string; notes: string }> = {}
      data.items.forEach((item: LabOrder['items'][0]) => {
        initialResults[item.id] = {
          result: item.result || '',
          resultStatus: item.resultStatus || 'NORMAL',
          notes: item.notes || '',
        }
      })
      setResults(initialResults)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCollectSample = async (itemId: string) => {
    try {
      const response = await fetch(`/api/lab-orders/${order?.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      })

      if (!response.ok) throw new Error('Failed to collect sample')
      await fetchOrder()
    } catch (error) {
      console.error('Error collecting sample:', error)
      alert('Failed to collect sample')
    }
  }

  const handleSaveResult = async (itemId: string) => {
    const resultData = results[itemId]
    if (!resultData || !resultData.result) return

    setSaving(true)
    try {
      const response = await fetch(`/api/lab-orders/${order?.id}/results`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          result: resultData.result,
          resultStatus: resultData.resultStatus,
          notes: resultData.notes,
          normalRange: order?.items.find(i => i.id === itemId)?.test.unit 
            ? `${order.items.find(i => i.id === itemId)?.test.normalRangeMin}-${order.items.find(i => i.id === itemId)?.test.normalRangeMax} ${order.items.find(i => i.id === itemId)?.test.unit}`
            : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to save result')
      await fetchOrder()
      alert('Result saved successfully!')
    } catch (error) {
      console.error('Error saving result:', error)
      alert('Failed to save result')
    } finally {
      setSaving(false)
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">Order not found</div>
        <Button onClick={() => router.push('/lab/orders')}>Back to Orders</Button>
      </div>
    )
  }

  const allCompleted = order.items.every(item => item.status === 'COMPLETED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/lab/orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lab Order Processing</h1>
            <p className="text-gray-500">
              {order.patient.firstName} {order.patient.lastName} | {order.patient.patientId}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${
          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
          order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
          order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {order.status.replace('_', ' ')}
        </span>
      </div>

      {/* Patient Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient ID</p>
                  <p className="font-medium">{order.patient.patientId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Age / Gender</p>
                  <p className="font-medium">{calculateAge(order.patient.dateOfBirth)} yrs | {order.patient.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{order.patient.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Ordered By</p>
                  <p className="font-medium">
                    {order.doctor.user.firstName} {order.doctor.user.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Notes */}
      {order.notes && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Clinical Notes:</span> {order.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tests */}
      <div className="space-y-4">
        {order.items.map((item) => (
          <Card key={item.id} className={`border-l-4 ${
            item.status === 'COMPLETED' ? 'border-l-green-500' :
            item.status === 'SAMPLE_COLLECTED' ? 'border-l-blue-500' :
            'border-l-yellow-500'
          }`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  {item.test.name}
                  <span className="text-sm text-gray-500">({item.test.testCode})</span>
                </CardTitle>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  item.status === 'SAMPLE_COLLECTED' ? 'bg-blue-100 text-blue-700' :
                  item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Test Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium">{item.test.category || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Specimen</p>
                  <p className="font-medium">{item.test.specimenType || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Normal Range</p>
                  <p className="font-medium">
                    {item.test.normalRangeMin && item.test.normalRangeMax
                      ? `${item.test.normalRangeMin}-${item.test.normalRangeMax} ${item.test.unit || ''}`
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">TAT</p>
                  <p className="font-medium">{item.test.turnaroundTime ? `${item.test.turnaroundTime} min` : '-'}</p>
                </div>
              </div>

              {/* Sample Collection */}
              {item.status === 'PENDING' && (
                <Button onClick={() => handleCollectSample(item.id)}>
                  <TestTube className="h-4 w-4 mr-2" />
                  Collect Sample
                </Button>
              )}

              {/* Result Entry */}
              {item.status !== 'PENDING' && item.status !== 'COMPLETED' && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Result *</Label>
                      <Input
                        value={results[item.id]?.result || ''}
                        onChange={(e) => setResults({
                          ...results,
                          [item.id]: { ...results[item.id], result: e.target.value },
                        })}
                        placeholder="Enter result value"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={results[item.id]?.resultStatus || 'NORMAL'}
                        onChange={(e) => setResults({
                          ...results,
                          [item.id]: { ...results[item.id], resultStatus: e.target.value },
                        })}
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="ABNORMAL">Abnormal</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Input
                        value={results[item.id]?.notes || ''}
                        onChange={(e) => setResults({
                          ...results,
                          [item.id]: { ...results[item.id], notes: e.target.value },
                        })}
                        placeholder="Additional notes"
                      />
                    </div>
                  </div>
                  <Button onClick={() => handleSaveResult(item.id)} disabled={saving || !results[item.id]?.result}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Result
                  </Button>
                </div>
              )}

              {/* Completed Result */}
              {item.status === 'COMPLETED' && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">Result: {item.result}</span>
                    {item.resultStatus === 'CRITICAL' && (
                      <span className="px-2 py-0.5 text-xs bg-red-200 text-red-800 rounded flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Critical
                      </span>
                    )}
                    {item.resultStatus === 'ABNORMAL' && (
                      <span className="px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded">
                        Abnormal
                      </span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-sm text-green-600">Notes: {item.notes}</p>
                  )}
                  <p className="text-xs text-green-500 mt-2">
                    Reported: {item.reportedAt ? formatDate(item.reportedAt) : '-'}
                  </p>
                </div>
              )}

              {/* Collection Info */}
              {item.collectedAt && (
                <p className="text-xs text-gray-500">
                  Sample collected: {formatDate(item.collectedAt)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {allCompleted && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">All tests completed</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
