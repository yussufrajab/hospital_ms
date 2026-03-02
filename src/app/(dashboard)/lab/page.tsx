'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FlaskConical,
  TestTube,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText
} from 'lucide-react'

const stats = [
  { name: 'Pending Tests', value: '18', icon: Clock },
  { name: 'In Progress', value: '7', icon: FlaskConical },
  { name: 'Completed Today', value: '35', icon: CheckCircle },
  { name: 'Critical Results', value: '2', icon: AlertCircle },
]

const pendingTests = [
  { id: '1', patient: 'John Smith', test: 'Complete Blood Count', priority: 'routine', status: 'pending', ordered: '1 hour ago' },
  { id: '2', patient: 'Emily Brown', test: 'Blood Glucose', priority: 'urgent', status: 'sample-collected', ordered: '2 hours ago' },
  { id: '3', patient: 'Robert Johnson', test: 'Lipid Profile', priority: 'stat', status: 'in-progress', ordered: '30 mins ago' },
  { id: '4', patient: 'Lisa Anderson', test: 'Liver Function Test', priority: 'routine', status: 'pending', ordered: '3 hours ago' },
]

const criticalResults = [
  { id: '1', patient: 'Michael Davis', test: 'Blood Glucose', value: '450 mg/dL', normalRange: '70-100 mg/dL' },
  { id: '2', patient: 'Sarah Parker', test: 'Potassium', value: '6.5 mEq/L', normalRange: '3.5-5.0 mEq/L' },
]

export default function LabDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-gray-500">Welcome, {session?.user?.name || 'Lab Tech'}!</p>
        </div>
        <Button>
          <TestTube className="h-4 w-4 mr-2" />
          Process Sample
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
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.name.includes('Critical') ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <stat.icon className={`h-6 w-6 ${stat.name.includes('Critical') ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Tests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Test Orders
            </CardTitle>
            <CardDescription>Lab tests awaiting processing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{test.patient}</p>
                    <p className="text-sm text-gray-500">{test.test}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={
                        test.priority === 'stat' ? 'destructive' : 
                        test.priority === 'urgent' ? 'warning' : 'secondary'
                      }
                    >
                      {test.priority}
                    </Badge>
                    <Badge variant="outline">{test.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Critical Results
            </CardTitle>
            <CardDescription>Results requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between border-b border-red-100 pb-3 last:border-0 last:pb-0 bg-red-50 p-3 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{result.patient}</p>
                    <p className="text-sm text-gray-500">{result.test}</p>
                    <p className="text-sm text-red-600 font-medium">{result.value} (Normal: {result.normalRange})</p>
                  </div>
                  <Button variant="destructive" size="sm">Notify</Button>
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
            <a href="/lab/orders" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FlaskConical className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Test Orders</span>
            </a>
            <a href="/lab/results" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Enter Results</span>
            </a>
            <a href="/lab/tests" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <TestTube className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Test Catalog</span>
            </a>
            <a href="/lab/reports" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <CheckCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Reports</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
