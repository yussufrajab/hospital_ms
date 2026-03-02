'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Settings as SettingsIcon,
  Building2,
  Clock,
  Database,
  Save,
  RefreshCw,
  Download,
  Upload,
  Server,
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface HospitalSettings {
  name: string
  address: string
  city: string
  state: string
  country: string
  postalCode: string
  phone: string
  email: string
  website: string
}

interface WorkingHours {
  day: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

export default function SystemSettingsPage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  // Check if user is admin
  const isAdmin = session?.user?.role === 'SUPER_ADMIN' || session?.user?.role === 'HOSPITAL_ADMIN'

  // Hospital settings state
  const [hospitalSettings, setHospitalSettings] = useState<HospitalSettings>({
    name: 'City General Hospital',
    address: '123 Healthcare Avenue',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    phone: '+1 (555) 123-4567',
    email: 'info@citygeneralhospital.com',
    website: 'www.citygeneralhospital.com'
  })
  const [hospitalLoading, setHospitalLoading] = useState(false)

  // Working hours state
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([
    { day: 'Monday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Tuesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Wednesday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Thursday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Friday', isOpen: true, openTime: '08:00', closeTime: '18:00' },
    { day: 'Saturday', isOpen: true, openTime: '09:00', closeTime: '14:00' },
    { day: 'Sunday', isOpen: false, openTime: '00:00', closeTime: '00:00' },
  ])
  const [hoursLoading, setHoursLoading] = useState(false)

  // System status
  const [systemStatus] = useState({
    database: 'healthy',
    server: 'running',
    lastBackup: new Date().toISOString(),
    storageUsed: '45%',
    activeUsers: 12
  })

  const handleHospitalSave = async () => {
    setHospitalLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      toast({
        title: 'Settings Saved',
        description: 'Hospital information has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save hospital settings.',
        variant: 'destructive'
      })
    } finally {
      setHospitalLoading(false)
    }
  }

  const handleWorkingHoursSave = async () => {
    setHoursLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      toast({
        title: 'Working Hours Updated',
        description: 'Working hours have been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save working hours.',
        variant: 'destructive'
      })
    } finally {
      setHoursLoading(false)
    }
  }

  const handleBackup = async () => {
    toast({
      title: 'Backup Started',
      description: 'Database backup has been initiated. You will be notified when complete.',
    })
  }

  const handleRestore = async () => {
    toast({
      title: 'Restore',
      description: 'Please select a backup file to restore.',
    })
  }

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="text-gray-500">Access denied</p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-medium text-red-900">Access Restricted</h3>
                <p className="text-sm text-red-700">
                  You need administrator privileges to access system settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="text-gray-500">Configure hospital settings and system preferences</p>
      </div>

      <Tabs defaultValue="hospital" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="hospital" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Hospital</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Hours</span>
          </TabsTrigger>
          <TabsTrigger value="database" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Database</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span className="hidden sm:inline">System</span>
          </TabsTrigger>
        </TabsList>

        {/* Hospital Information Tab */}
        <TabsContent value="hospital">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Information</CardTitle>
              <CardDescription>Basic hospital details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="hospitalName">Hospital Name</Label>
                  <Input
                    id="hospitalName"
                    value={hospitalSettings.name}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={hospitalSettings.address}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={hospitalSettings.city}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={hospitalSettings.state}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, state: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={hospitalSettings.country}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={hospitalSettings.postalCode}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, postalCode: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={hospitalSettings.phone}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={hospitalSettings.email}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={hospitalSettings.website}
                    onChange={(e) => setHospitalSettings({ ...hospitalSettings, website: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleHospitalSave} disabled={hospitalLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {hospitalLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Working Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Working Hours</CardTitle>
              <CardDescription>Configure hospital operating hours for each day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {workingHours.map((day, index) => (
                  <div key={day.day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-28">
                      <span className="font-medium">{day.day}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={day.isOpen}
                        onChange={(e) => {
                          const newHours = [...workingHours]
                          newHours[index].isOpen = e.target.checked
                          setWorkingHours(newHours)
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label className="text-sm">Open</Label>
                    </div>
                    {day.isOpen && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-500">From:</Label>
                          <Input
                            type="time"
                            value={day.openTime}
                            onChange={(e) => {
                              const newHours = [...workingHours]
                              newHours[index].openTime = e.target.value
                              setWorkingHours(newHours)
                            }}
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm text-gray-500">To:</Label>
                          <Input
                            type="time"
                            value={day.closeTime}
                            onChange={(e) => {
                              const newHours = [...workingHours]
                              newHours[index].closeTime = e.target.value
                              setWorkingHours(newHours)
                            }}
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
                    {!day.isOpen && (
                      <Badge variant="secondary" className="ml-4">Closed</Badge>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleWorkingHoursSave} disabled={hoursLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {hoursLoading ? 'Saving...' : 'Save Hours'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Management Tab */}
        <TabsContent value="database">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Status</CardTitle>
                <CardDescription>Current database health and statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      {systemStatus.database === 'healthy' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm text-gray-500">Database</span>
                    </div>
                    <p className="font-medium capitalize">{systemStatus.database}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-500">Server</span>
                    </div>
                    <p className="font-medium capitalize">{systemStatus.server}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-5 w-5 text-purple-500" />
                      <span className="text-sm text-gray-500">Storage Used</span>
                    </div>
                    <p className="font-medium">{systemStatus.storageUsed}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-orange-500" />
                      <span className="text-sm text-gray-500">Last Backup</span>
                    </div>
                    <p className="font-medium text-sm">
                      {new Date(systemStatus.lastBackup).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>Manage database backups and restoration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Button onClick={handleBackup} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Create Backup
                  </Button>
                  <Button onClick={handleRestore} variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore Backup
                  </Button>
                  <Button variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Important</h4>
                      <p className="text-sm text-yellow-700">
                        Database backups are stored securely. Restoration will replace all current data.
                        Please ensure you have a recent backup before proceeding.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Status Tab */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status and configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Application Version</p>
                    <p className="font-medium">1.0.0</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Environment</p>
                    <p className="font-medium capitalize">{process.env.NODE_ENV || 'development'}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Active Users</p>
                    <p className="font-medium">{systemStatus.activeUsers}</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Server Time</p>
                    <p className="font-medium">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>Recent system activity and errors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="space-y-1">
                    <p><span className="text-green-400">[INFO]</span> System started successfully</p>
                    <p><span className="text-green-400">[INFO]</span> Database connection established</p>
                    <p><span className="text-green-400">[INFO]</span> Authentication service running</p>
                    <p><span className="text-blue-400">[DEBUG]</span> Cache cleared at {new Date().toLocaleTimeString()}</p>
                    <p><span className="text-green-400">[INFO]</span> Backup scheduled for 02:00 AM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}