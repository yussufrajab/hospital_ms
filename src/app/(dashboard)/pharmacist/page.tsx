'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Pill,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react'

const stats = [
  { name: 'Pending Prescriptions', value: '15', icon: FileText },
  { name: 'Dispensed Today', value: '42', icon: CheckCircle },
  { name: 'Low Stock Items', value: '8', icon: AlertTriangle },
  { name: 'Expiring Soon', value: '3', icon: Clock },
]

const prescriptionQueue = [
  { id: '1', patient: 'John Smith', doctor: 'Dr. Sarah Wilson', items: 3, status: 'pending', time: '10 mins ago' },
  { id: '2', patient: 'Emily Brown', doctor: 'Dr. Michael Chen', items: 2, status: 'pending', time: '25 mins ago' },
  { id: '3', patient: 'Robert Johnson', doctor: 'Dr. James Taylor', items: 1, status: 'processing', time: '30 mins ago' },
  { id: '4', patient: 'Lisa Anderson', doctor: 'Dr. Sarah Wilson', items: 4, status: 'pending', time: '45 mins ago' },
]

const lowStockItems = [
  { id: '1', name: 'Amoxicillin 500mg', stock: 15, reorderLevel: 100 },
  { id: '2', name: 'Paracetamol 500mg', stock: 45, reorderLevel: 200 },
  { id: '3', name: 'Insulin Glargine', stock: 8, reorderLevel: 50 },
]

export default function PharmacistDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-500">Welcome, {session?.user?.name || 'Pharmacist'}!</p>
        </div>
        <Button>
          <Pill className="h-4 w-4 mr-2" />
          Dispense Medication
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.name.includes('Low') || stat.name.includes('Expiring') ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <stat.icon className={`h-6 w-6 ${stat.name.includes('Low') || stat.name.includes('Expiring') ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Prescription Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Prescription Queue
            </CardTitle>
            <CardDescription>Pending prescriptions to dispense</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {prescriptionQueue.map((rx) => (
                <div key={rx.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{rx.patient}</p>
                    <p className="text-sm text-gray-500">{rx.doctor} • {rx.items} items</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{rx.time}</span>
                    <Badge variant={rx.status === 'processing' ? 'default' : 'warning'}>
                      {rx.status}
                    </Badge>
                    <Button variant="ghost" size="sm">View</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Low Stock Alert
            </CardTitle>
            <CardDescription>Items below reorder level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-red-500">Stock: {item.stock} / Reorder: {item.reorderLevel}</p>
                  </div>
                  <Button variant="outline" size="sm">Reorder</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <a href="/pharmacy/queue" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Pill className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Dispense</span>
            </a>
            <a href="/pharmacy/inventory" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Package className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Inventory</span>
            </a>
            <a href="/pharmacy/expiring" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Clock className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Expiring Soon</span>
            </a>
            <a href="/pharmacy/reports" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Reports</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
