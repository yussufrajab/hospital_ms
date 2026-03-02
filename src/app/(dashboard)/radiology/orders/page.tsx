'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Scan,
  Eye,
  Play,
  CheckCircle
} from 'lucide-react'

const radiologyOrders = [
  {
    id: 'RO-001',
    patientId: 'P-001',
    patientName: 'John Smith',
    test: 'Chest X-Ray',
    modality: 'X-Ray',
    priority: 'routine',
    status: 'pending',
    orderedBy: 'Dr. James Wilson',
    orderedAt: '2024-01-15 09:30',
    clinicalNotes: 'Persistent cough for 2 weeks'
  },
  {
    id: 'RO-002',
    patientId: 'P-002',
    patientName: 'Emily Brown',
    test: 'CT Scan - Head',
    modality: 'CT',
    priority: 'urgent',
    status: 'scheduled',
    orderedBy: 'Dr. Sarah Johnson',
    orderedAt: '2024-01-15 10:15',
    clinicalNotes: 'Headache with visual disturbances'
  },
  {
    id: 'RO-003',
    patientId: 'P-003',
    patientName: 'Robert Johnson',
    test: 'MRI - Lumbar Spine',
    modality: 'MRI',
    priority: 'stat',
    status: 'in-progress',
    orderedBy: 'Dr. Michael Chen',
    orderedAt: '2024-01-15 11:00',
    clinicalNotes: 'Severe lower back pain, suspected disc herniation'
  },
  {
    id: 'RO-004',
    patientId: 'P-004',
    patientName: 'Lisa Anderson',
    test: 'Ultrasound - Abdomen',
    modality: 'Ultrasound',
    priority: 'routine',
    status: 'pending',
    orderedBy: 'Dr. Emily Davis',
    orderedAt: '2024-01-15 08:45',
    clinicalNotes: 'Abdominal pain and bloating'
  },
  {
    id: 'RO-005',
    patientId: 'P-005',
    patientName: 'Michael Davis',
    test: 'CT Scan - Chest',
    modality: 'CT',
    priority: 'urgent',
    status: 'completed',
    orderedBy: 'Dr. James Wilson',
    orderedAt: '2024-01-15 07:30',
    clinicalNotes: 'Follow-up on pulmonary nodule'
  },
]

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  scheduled: 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

const priorityColors: Record<string, string> = {
  routine: 'secondary',
  urgent: 'warning',
  stat: 'destructive',
}

export default function RadiologyOrdersPage() {
  const { data: session } = useSession()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = radiologyOrders.filter(order => {
    const matchesSearch = order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.test.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant="outline" className={statusColors[status] || ''}>
        {status}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    return (
      <Badge variant={priorityColors[priority] as any || 'secondary'}>
        {priority}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Radiology Orders</h1>
          <p className="text-gray-500">Manage and process radiology orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-xl font-bold">12</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Scheduled</p>
                <p className="text-xl font-bold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Scan className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Today</p>
                <p className="text-xl font-bold">28</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by patient name, test, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={setStatusFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>{filteredOrders.length} orders found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Test</TableHead>
                  <TableHead>Modality</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ordered By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.patientName}</p>
                        <p className="text-xs text-gray-500">{order.patientId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{order.test}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.modality}</Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{order.orderedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {order.status === 'pending' && (
                          <Button variant="ghost" size="sm">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        )}
                        {order.status === 'scheduled' && (
                          <Button variant="ghost" size="sm">
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
