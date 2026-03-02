'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, User, Activity, TrendingUp, Calendar, Stethoscope } from 'lucide-react'

interface PatientData {
  period: { startDate: string; endDate: string }
  summary: {
    totalPatients: number
    newPatients: number
    averageLengthOfStay: number
    readmissionRate: number
  }
  demographics: {
    gender: Array<{ gender: string; count: number }>
    bloodGroup: Array<{ bloodGroup: string; count: number }>
    ageGroups: Array<{ group: string; count: number }>
  }
  patientTypes: Array<{ type: string; count: number }>
  trends: {
    newPatientsByMonth: Array<{ month: string; count: number }>
  }
  topDiagnoses: Array<{ diagnosis: string; count: number }>
  admissionsByDepartment: Array<{ department: string; count: number }>
}

export default function PatientReportsPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<PatientData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatientData()
  }, [session])

  const fetchPatientData = async () => {
    try {
      const response = await fetch('/api/reports/patients')
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching patient data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">No data available</div>
      </div>
    )
  }

  const totalGender = data.demographics.gender.reduce((sum, g) => sum + g.count, 0)
  const totalBloodGroup = data.demographics.bloodGroup.reduce((sum, b) => sum + b.count, 0)
  const totalAgeGroups = data.demographics.ageGroups.reduce((sum, a) => sum + a.count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patient Reports</h1>
        <p className="text-gray-500">Demographics, trends, and admission analytics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Patients</p>
                <p className="text-2xl font-bold">{data.summary.totalPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">New Patients</p>
                <p className="text-2xl font-bold">{data.summary.newPatients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg. Length of Stay</p>
                <p className="text-2xl font-bold">{data.summary.averageLengthOfStay} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Readmission Rate</p>
                <p className="text-2xl font-bold">{data.summary.readmissionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Gender Distribution</h3>
            <div className="space-y-3">
              {data.demographics.gender.map((item) => (
                <div key={item.gender}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.gender}</span>
                    <span>{item.count} ({Math.round((item.count / totalGender) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.gender === 'MALE' ? 'bg-blue-500' : item.gender === 'FEMALE' ? 'bg-pink-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${(item.count / totalGender) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Age Distribution</h3>
            <div className="space-y-3">
              {data.demographics.ageGroups.map((item) => (
                <div key={item.group}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.group} years</span>
                    <span>{item.count} ({Math.round((item.count / totalAgeGroups) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-green-500"
                      style={{ width: `${(item.count / totalAgeGroups) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blood Group Distribution */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Blood Group Distribution</h3>
            <div className="grid grid-cols-2 gap-2">
              {data.demographics.bloodGroup.map((item) => (
                <div key={item.bloodGroup} className="p-2 bg-gray-50 rounded-lg text-center">
                  <p className="font-bold text-lg">{item.bloodGroup?.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-500">{item.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patient Types & Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patient Types */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">Patient Types (Admissions)</h3>
            <div className="flex gap-4">
              {data.patientTypes.map((item) => (
                <div
                  key={item.type}
                  className={`flex-1 p-4 rounded-lg text-center ${
                    item.type === 'EMERGENCY'
                      ? 'bg-red-50'
                      : item.type === 'IPD'
                      ? 'bg-blue-50'
                      : 'bg-green-50'
                  }`}
                >
                  <p className="text-2xl font-bold">{item.count}</p>
                  <p className="text-sm text-gray-600">{item.type}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Patients Trend */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4">New Patients by Month</h3>
            <div className="h-40 flex items-end gap-1">
              {data.trends.newPatientsByMonth.slice(0, 12).reverse().map((item, idx) => {
                const maxCount = Math.max(...data.trends.newPatientsByMonth.map(d => d.count))
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-gray-500 transform -rotate-45 origin-left">
                      {new Date(item.month).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Diagnoses & Departments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Diagnoses */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Stethoscope className="h-4 w-4" />
              Top Diagnoses
            </h3>
            <div className="space-y-2">
              {data.topDiagnoses.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-5">{idx + 1}.</span>
                    <span className="text-sm truncate">{item.diagnosis}</span>
                  </div>
                  <span className="font-medium text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Admissions by Department */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Admissions by Department
            </h3>
            <div className="space-y-2">
              {data.admissionsByDepartment.slice(0, 10).map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-5">{idx + 1}.</span>
                    <span className="text-sm">{item.department}</span>
                  </div>
                  <span className="font-medium text-sm">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
