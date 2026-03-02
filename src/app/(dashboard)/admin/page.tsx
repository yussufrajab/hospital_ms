'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  BedDouble, 
  Activity,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Settings,
  Shield,
  Building2,
  BarChart3
} from 'lucide-react'

const stats = [
  {
    name: 'Total Patients',
    value: '2,543',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: "Today's Appointments",
    value: '48',
    change: '+8%',
    changeType: 'positive',
    icon: Calendar,
  },
  {
    name: 'Revenue (MTD)',
    value: '$125,430',
    change: '+23%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Bed Occupancy',
    value: '78%',
    change: '-2%',
    changeType: 'negative',
    icon: BedDouble,
  },
]

const recentUsers = [
  { id: '1', name: 'Dr. Sarah Wilson', email: 'sarah.wilson@hms.com', role: 'DOCTOR', status: 'active' },
  { id: '2', name: 'Emma Johnson', email: 'emma.johnson@hms.com', role: 'NURSE', status: 'active' },
  { id: '3', name: 'David Miller', email: 'david.miller@hms.com', role: 'PHARMACIST', status: 'active' },
  { id: '4', name: 'Jennifer White', email: 'jennifer.white@hms.com', role: 'BILLING_STAFF', status: 'inactive' },
]

const departments = [
  { id: '1', name: 'Cardiology', doctors: 5, patients: 23, revenue: '$45,230' },
  { id: '2', name: 'Orthopedics', doctors: 4, patients: 18, revenue: '$38,450' },
  { id: '3', name: 'Pediatrics', doctors: 3, patients: 32, revenue: '$28,900' },
  { id: '4', name: 'General Medicine', doctors: 6, patients: 45, revenue: '$52,100' },
]

export default function AdminDashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-gray-500">Welcome back, {session?.user?.name || 'Admin'}!</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
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
                  <div className="flex items-center gap-1 mt-1">
                    {stat.changeType === 'positive' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change} from last month
                    </p>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>Recently added users</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Department Overview
            </CardTitle>
            <CardDescription>Performance by department</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Doctors</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.doctors}</TableCell>
                    <TableCell>{dept.patients}</TableCell>
                    <TableCell className="text-green-600">{dept.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <a href="/admin/users" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Manage Users</span>
            </a>
            <a href="/admin/departments" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Departments</span>
            </a>
            <a href="/reports" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">View Reports</span>
            </a>
            <a href="/settings" className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
              <Settings className="h-5 w-5 text-blue-600" />
              <span className="font-medium">System Settings</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
