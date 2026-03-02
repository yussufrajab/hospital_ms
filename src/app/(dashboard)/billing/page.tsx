'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  FileText,
  CreditCard,
  Receipt,
  AlertCircle
} from 'lucide-react'

const stats = [
  { name: 'Pending Invoices', value: '24', icon: FileText },
  { name: 'Payments Today', value: '$12,450', icon: DollarSign },
  { name: 'Overdue', value: '8', icon: AlertCircle },
  { name: 'Insurance Claims', value: '15', icon: CreditCard },
]

const recentInvoices = [
  { id: '1', patient: 'John Smith', amount: '$450', status: 'pending', date: '2024-03-01' },
  { id: '2', patient: 'Emily Brown', amount: '$1,250', status: 'paid', date: '2024-03-01' },
  { id: '3', patient: 'Robert Johnson', amount: '$890', status: 'overdue', date: '2024-02-25' },
  { id: '4', patient: 'Lisa Anderson', amount: '$320', status: 'pending', date: '2024-03-02' },
]

const insuranceClaims = [
  { id: '1', patient: 'Michael Davis', claim: '$2,500', status: 'approved', insurer: 'National Health' },
  { id: '2', patient: 'Sarah Parker', claim: '$1,800', status: 'pending', insurer: 'Global Medical' },
  { id: '3', patient: 'Tom Wilson', claim: '$3,200', status: 'under-review', insurer: 'National Health' },
]

export default function BillingDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
          <p className="text-gray-500">Welcome, {session?.user?.name || 'Staff'}!</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create Invoice
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
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${stat.name === 'Overdue' ? 'bg-red-50' : 'bg-blue-50'}`}>
                  <stat.icon className={`h-6 w-6 ${stat.name === 'Overdue' ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Recent Invoices
            </CardTitle>
            <CardDescription>Latest billing activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{inv.patient}</p>
                    <p className="text-sm text-gray-500">{inv.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{inv.amount}</span>
                    <Badge 
                      variant={
                        inv.status === 'paid' ? 'success' : 
                        inv.status === 'overdue' ? 'destructive' : 'warning'
                      }
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insurance Claims */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Insurance Claims
            </CardTitle>
            <CardDescription>Claims status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insuranceClaims.map((claim) => (
                <div key={claim.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-gray-900">{claim.patient}</p>
                    <p className="text-sm text-gray-500">{claim.insurer}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{claim.claim}</span>
                    <Badge 
                      variant={
                        claim.status === 'approved' ? 'success' : 
                        claim.status === 'pending' ? 'warning' : 'secondary'
                      }
                    >
                      {claim.status}
                    </Badge>
                  </div>
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
            <a href="/billing/invoices" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Invoices</span>
            </a>
            <a href="/billing/payments" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Payments</span>
            </a>
            <a href="/billing/insurance" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Insurance</span>
            </a>
            <a href="/billing/reports" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Receipt className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Reports</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
