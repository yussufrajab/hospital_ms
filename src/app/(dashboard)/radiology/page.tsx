'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Scan,
  XIcon,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Image,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

const stats = [
  { name: 'Pending Scans', value: '12', icon: Clock },
  { name: 'In Progress', value: '5', icon: Scan },
  { name: 'Completed Today', value: '28', icon: CheckCircle },
  { name: 'Critical Findings', value: '1', icon: AlertCircle },
]

const pendingOrders = [
  { id: '1', patient: 'John Smith', test: 'Chest X-Ray', priority: 'routine', status: 'pending', ordered: '1 hour ago', modality: 'X-Ray' },
  { id: '2', patient: 'Emily Brown', test: 'CT Scan - Head', priority: 'urgent', status: 'scheduled', ordered: '2 hours ago', modality: 'CT' },
  { id: '3', patient: 'Robert Johnson', test: 'MRI - Spine', priority: 'stat', status: 'in-progress', ordered: '30 mins ago', modality: 'MRI' },
  { id: '4', patient: 'Lisa Anderson', test: 'Ultrasound - Abdomen', priority: 'routine', status: 'pending', ordered: '3 hours ago', modality: 'Ultrasound' },
]

const criticalFindings = [
  { id: '1', patient: 'Michael Davis', test: 'CT Scan - Chest', finding: 'Suspected pulmonary embolism', reportedBy: 'Dr. Sarah Wilson' },
]

const recentResults = [
  { id: '1', patient: 'Jane Wilson', test: 'Chest X-Ray', result: 'No acute findings', reportedAt: '10 mins ago' },
  { id: '2', patient: 'Tom Harris', test: 'CT Scan - Abdomen', result: 'Normal study', reportedAt: '25 mins ago' },
  { id: '3', patient: 'Mary Clark', test: 'MRI - Knee', result: 'Meniscal tear noted', reportedAt: '1 hour ago' },
]

export default function RadiologyDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Radiology Dashboard</h1>
          <p className="text-gray-500">Welcome, {session?.user?.name || 'Radiologist'}!</p>
        </div>
        <div className="flex gap-2">
          <Link href="/radiology/orders">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </Link>
          <Link href="/radiology/results">
            <Button>
              <Scan className="h-4 w-4 mr-2" />
              New Study
            </Button>
          </Link>
        </div>
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
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.name.includes('Critical') ? 'bg-red-50' : 'bg-purple-50'}`}>
                  <stat.icon className={`h-6 w-6 ${stat.name.includes('Critical') ? 'text-red-600' : 'text-purple-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XIcon className="h-5 w-5" />
              Pending Orders
            </CardTitle>
            <CardDescription>Radiology orders awaiting processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{order.patient}</p>
                    <p className="text-sm text-gray-500">{order.test}</p>
                    <p className="text-xs text-gray-400">{order.modality}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        order.priority === 'stat' ? 'destructive' : 
                        order.priority === 'urgent' ? 'warning' : 'secondary'
                      }
                    >
                      {order.priority}
                    </Badge>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/radiology/orders" className="block mt-4">
              <Button variant="outline" className="w-full">View All Orders</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Critical Findings */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Critical Findings
            </CardTitle>
            <CardDescription>Findings requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            {criticalFindings.length > 0 ? (
              <div className="space-y-4">
                {criticalFindings.map((finding) => (
                  <div key={finding.id} className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{finding.patient}</p>
                        <p className="text-sm text-gray-600">{finding.test}</p>
                        <p className="text-sm text-red-600 font-medium mt-1">{finding.finding}</p>
                        <p className="text-xs text-gray-500 mt-1">Reported by: {finding.reportedBy}</p>
                      </div>
                      <Button variant="destructive" size="sm">Notify</Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No critical findings at this time</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Results
          </CardTitle>
          <CardDescription>Recently completed radiology studies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {recentResults.map((result) => (
              <div key={result.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium text-gray-900">{result.patient}</p>
                  <span className="text-xs text-gray-500">{result.reportedAt}</span>
                </div>
                <p className="text-sm text-gray-600">{result.test}</p>
                <p className="text-sm text-gray-500 mt-1">{result.result}</p>
                <Button variant="ghost" size="sm" className="mt-2">
                  <Image className="h-4 w-4 mr-1" />
                  View Images
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link href="/radiology/orders" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="font-medium">View Orders</span>
            </Link>
            <Link href="/radiology/results" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Enter Results</span>
            </Link>
            <Link href="/radiology/tests" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Scan className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Test Catalog</span>
            </Link>
            <Link href="/reports/radiology" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Reports</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
