'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, TestTube, CheckCircle, User, FlaskConical } from 'lucide-react'
import Link from 'next/link'

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
    phone: string | null
    dateOfBirth: string
    gender: string
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
    test: {
      id: string
      name: string
      testCode: string
      category: string | null
    }
    collectedAt: string | null
    reportedAt: string | null
  }>
}

export default function LabOrdersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<LabOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')

  useEffect(() => {
    fetchOrders()
  }, [statusFilter])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/lab-orders?status=${statusFilter}&limit=50`)
      const data = await response.json()
      setOrders(data.data || [])
    } catch (error) {
      console.error('Error fetching lab orders:', error)
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
        return 'bg-yellow-100 text-yellow-700'
      case 'SAMPLE_COLLECTED':
        return 'bg-blue-100 text-blue-700'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700'
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const pendingCount = orders.filter(o => o.status === 'PENDING').length
  const inProgressCount = orders.filter(o => o.status === 'IN_PROGRESS' || o.status === 'SAMPLE_COLLECTED').length
  const completedCount = orders.filter(o => o.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Test Orders</h1>
          <p className="text-gray-500">Process and manage lab tests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('PENDING')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Pending
        </Button>
        <Button
          variant={statusFilter === 'IN_PROGRESS' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('IN_PROGRESS')}
        >
          <TestTube className="h-4 w-4 mr-2" />
          In Progress
        </Button>
        <Button
          variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('COMPLETED')}
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Completed
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading lab orders...
            </CardContent>
          </Card>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No lab orders found with status: {statusFilter.replace('_', ' ')}
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-blue-500">
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
                          {order.patient.firstName} {order.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {order.patient.patientId}
                          {order.patient.phone && ` | ${order.patient.phone}`}
                        </p>
                      </div>
                    </div>

                    {/* Order Details */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Ordered by:</span>{' '}
                        {order.doctor.user.firstName} {order.doctor.user.lastName} ({order.doctor.designation})
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Date:</span> {formatDate(order.orderDate)}
                        {order.priority && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded ${
                            order.priority === 'STAT' ? 'bg-red-100 text-red-700' :
                            order.priority === 'URGENT' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {order.priority}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Tests */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          {item.status === 'COMPLETED' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : item.status === 'SAMPLE_COLLECTED' ? (
                            <TestTube className="h-4 w-4 text-blue-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className={item.status === 'COMPLETED' ? 'text-gray-400' : 'text-gray-700'}>
                            {item.test.name} ({item.test.testCode})
                          </span>
                          {item.result && (
                            <span className="text-xs text-gray-500">
                              Result: {item.result}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Notes:</span> {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                    <Link href={`/lab/orders/${order.id}`}>
                      <Button size="sm">
                        <FlaskConical className="h-4 w-4 mr-1" />
                        Process
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
