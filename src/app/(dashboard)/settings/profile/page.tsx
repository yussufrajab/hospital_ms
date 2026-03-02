'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useTheme } from 'next-themes'
import {
  User,
  Lock,
  Bell,
  Palette,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  firstName: string
  lastName: string
  email: string
  phone: string | null
}

interface NotificationSettings {
  emailNotifications: boolean
  appointmentReminders: boolean
  prescriptionAlerts: boolean
  labResultNotifications: boolean
  billingNotifications: boolean
  systemAlerts: boolean
}

export default function ProfileSettingsPage() {
  const { data: session, update: updateSession } = useSession()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [profileLoading, setProfileLoading] = useState(false)

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    appointmentReminders: true,
    prescriptionAlerts: true,
    labResultNotifications: true,
    billingNotifications: true,
    systemAlerts: true
  })
  const [notificationLoading, setNotificationLoading] = useState(false)

  // Initialize profile from session
  useEffect(() => {
    if (session?.user) {
      setProfile({
        firstName: session.user.name?.split(' ')[0] || '',
        lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
        email: session.user.email || '',
        phone: null
      })
    }
  }, [session])

  const handleProfileSave = async () => {
    setProfileLoading(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })

      if (!response.ok) throw new Error('Failed to update profile')

      await updateSession()
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'New passwords do not match.',
        variant: 'destructive'
      })
      return
    }

    if (passwords.newPassword.length < 8) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive'
      })
      return
    }

    setPasswordLoading(true)
    try {
      const response = await fetch('/api/user/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to change password')
      }

      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleNotificationSave = async () => {
    setNotificationLoading(true)
    try {
      // Simulate API call - in real app, this would save to database
      await new Promise(resolve => setTimeout(resolve, 500))
      toast({
        title: 'Notification Settings Saved',
        description: 'Your notification preferences have been updated.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings.',
        variant: 'destructive'
      })
    } finally {
      setNotificationLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone || ''}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={profileLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwords.currentPassword}
                      onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    >
                      {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwords.newPassword}
                      onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    >
                      {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwords.confirmPassword}
                      onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    >
                      {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Password Requirements</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    {passwords.newPassword.length >= 8 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    {passwords.newPassword !== passwords.currentPassword && passwords.newPassword.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    Different from current password
                  </li>
                  <li className="flex items-center gap-2">
                    {passwords.newPassword === passwords.confirmPassword && passwords.newPassword.length > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    )}
                    Passwords match
                  </li>
                </ul>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handlePasswordChange}
                  disabled={passwordLoading || !passwords.currentPassword || !passwords.newPassword}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {passwordLoading ? 'Updating...' : 'Change Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                    <p className="text-sm text-gray-500">Get reminders for upcoming appointments</p>
                  </div>
                  <Switch
                    id="appointmentReminders"
                    checked={notifications.appointmentReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, appointmentReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="prescriptionAlerts">Prescription Alerts</Label>
                    <p className="text-sm text-gray-500">Notifications for new prescriptions</p>
                  </div>
                  <Switch
                    id="prescriptionAlerts"
                    checked={notifications.prescriptionAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, prescriptionAlerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="labResultNotifications">Lab Results</Label>
                    <p className="text-sm text-gray-500">Get notified when lab results are ready</p>
                  </div>
                  <Switch
                    id="labResultNotifications"
                    checked={notifications.labResultNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, labResultNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="billingNotifications">Billing Updates</Label>
                    <p className="text-sm text-gray-500">Notifications for bills and payments</p>
                  </div>
                  <Switch
                    id="billingNotifications"
                    checked={notifications.billingNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, billingNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemAlerts">System Alerts</Label>
                    <p className="text-sm text-gray-500">Important system announcements</p>
                  </div>
                  <Switch
                    id="systemAlerts"
                    checked={notifications.systemAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, systemAlerts: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNotificationSave} disabled={notificationLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {notificationLoading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize how the application looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-medium">Theme</Label>
                  <p className="text-sm text-gray-500 mb-4">Choose your preferred theme</p>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setTheme('light')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-20 bg-white rounded border border-gray-200 mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"></div>
                      </div>
                      <p className="text-sm font-medium text-center">Light</p>
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-20 bg-gray-900 rounded border border-gray-700 mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700"></div>
                      </div>
                      <p className="text-sm font-medium text-center">Dark</p>
                    </button>
                    <button
                      onClick={() => setTheme('system')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        theme === 'system' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="h-20 bg-gradient-to-r from-white to-gray-900 rounded border border-gray-300 mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-100 to-gray-800 border border-gray-400"></div>
                      </div>
                      <p className="text-sm font-medium text-center">System</p>
                    </button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}