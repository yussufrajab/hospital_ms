'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  FileText,
  Image,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  User,
  Scan
} from 'lucide-react'

const pendingStudies = [
  {
    id: 'RO-001',
    patientId: 'P-001',
    patientName: 'John Smith',
    test: 'Chest X-Ray',
    modality: 'X-Ray',
    status: 'pending',
    clinicalNotes: 'Persistent cough for 2 weeks',
    studyDate: '2024-01-15 09:30'
  },
  {
    id: 'RO-003',
    patientId: 'P-003',
    patientName: 'Robert Johnson',
    test: 'MRI - Lumbar Spine',
    modality: 'MRI',
    status: 'in-progress',
    clinicalNotes: 'Severe lower back pain, suspected disc herniation',
    studyDate: '2024-01-15 11:00'
  },
]

const recentReports = [
  {
    id: 'RR-001',
    orderId: 'RO-005',
    patientName: 'Michael Davis',
    test: 'CT Scan - Chest',
    finding: 'No change in pulmonary nodule. Recommend follow-up in 6 months.',
    impression: 'Stable pulmonary nodule',
    reportedBy: 'Dr. Sarah Wilson',
    reportedAt: '2024-01-15 12:30',
    status: 'final'
  },
  {
    id: 'RR-002',
    orderId: 'RO-006',
    patientName: 'Jane Wilson',
    test: 'Chest X-Ray',
    finding: 'Lungs are clear. Heart size normal. No pleural effusion.',
    impression: 'No acute cardiopulmonary abnormality',
    reportedBy: 'Dr. Sarah Wilson',
    reportedAt: '2024-01-15 11:45',
    status: 'final'
  },
]

export default function RadiologyResultsPage() {
  const { data: session } = useSession()
  const [selectedStudy, setSelectedStudy] = useState(pendingStudies[0])
  const [report, setReport] = useState({
    findings: '',
    impression: '',
    isCritical: false
  })

  const handleSaveReport = () => {
    // Save as draft
    console.log('Saving report:', report)
  }

  const handleSubmitReport = () => {
    // Submit final report
    console.log('Submitting report:', report)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Radiology Results</h1>
          <p className="text-gray-500">Enter and manage radiology reports</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pending Studies List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Pending Studies
            </CardTitle>
            <CardDescription>Studies awaiting interpretation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingStudies.map((study) => (
                <div
                  key={study.id}
                  onClick={() => setSelectedStudy(study)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStudy?.id === study.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">{study.patientName}</p>
                    <Badge variant="outline">{study.modality}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{study.test}</p>
                  <p className="text-xs text-gray-500 mt-1">{study.studyDate}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Entry Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Report Entry
            </CardTitle>
            <CardDescription>
              {selectedStudy ? `Report for ${selectedStudy.test} - ${selectedStudy.patientName}` : 'Select a study to enter report'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudy ? (
              <div className="space-y-6">
                {/* Patient Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Patient</p>
                      <p className="font-medium">{selectedStudy.patientName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Patient ID</p>
                      <p className="font-medium">{selectedStudy.patientId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Study</p>
                      <p className="font-medium">{selectedStudy.test}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Modality</p>
                      <p className="font-medium">{selectedStudy.modality}</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">Clinical Notes</p>
                    <p className="text-sm">{selectedStudy.clinicalNotes}</p>
                  </div>
                </div>

                {/* Image Viewer Placeholder */}
                <div className="bg-gray-900 rounded-lg p-8 text-center">
                  <Image className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-400">DICOM Viewer</p>
                  <p className="text-sm text-gray-500">Image viewer would be integrated here</p>
                  <Button variant="outline" className="mt-4">
                    Open in PACS Viewer
                  </Button>
                </div>

                {/* Report Form */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="findings">Findings</Label>
                    <Textarea
                      id="findings"
                      placeholder="Enter detailed findings..."
                      rows={6}
                      value={report.findings}
                      onChange={(e) => setReport({ ...report, findings: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="impression">Impression</Label>
                    <Textarea
                      id="impression"
                      placeholder="Enter impression/conclusion..."
                      rows={3}
                      value={report.impression}
                      onChange={(e) => setReport({ ...report, impression: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="critical"
                      checked={report.isCritical}
                      onChange={(e) => setReport({ ...report, isCritical: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="critical" className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Critical Finding (requires immediate notification)
                    </Label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={handleSaveReport}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Draft
                    </Button>
                    <Button onClick={handleSubmitReport}>
                      <Send className="h-4 w-4 mr-2" />
                      Submit Report
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-3" />
                <p>Select a study from the list to enter a report</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Reports
          </CardTitle>
          <CardDescription>Recently submitted radiology reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((rep) => (
              <div key={rep.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{rep.patientName}</p>
                    <p className="text-sm text-gray-500">{rep.test}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {rep.status}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm"><span className="font-medium">Finding:</span> {rep.finding}</p>
                  <p className="text-sm mt-1"><span className="font-medium">Impression:</span> {rep.impression}</p>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                  <span>Reported by: {rep.reportedBy}</span>
                  <span>{rep.reportedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}