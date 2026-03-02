'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Search, Save } from 'lucide-react'

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string | null
}

export default function NurseVitalsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [saving, setSaving] = useState(false)
  const [vitals, setVitals] = useState({
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    pulseRate: '',
    respiratoryRate: '',
    spO2: '',
    weight: '',
    height: '',
    notes: '',
  })

  const searchPatients = async (query: string) => {
    if (query.length < 2) {
      setPatientResults([])
      return
    }

    try {
      const response = await fetch(`/api/patients?search=${query}&limit=10`)
      const data = await response.json()
      setPatientResults(data.data || [])
    } catch (error) {
      console.error('Error searching patients:', error)
    }
  }

  const handlePatientSearch = (value: string) => {
    setPatientSearch(value)
    searchPatients(value)
  }

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientSearch('')
    setPatientResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient) return

    setSaving(true)

    try {
      const response = await fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          ...vitals,
          temperature: vitals.temperature ? parseFloat(vitals.temperature) : null,
          bloodPressureSystolic: vitals.bloodPressureSystolic ? parseInt(vitals.bloodPressureSystolic) : null,
          bloodPressureDiastolic: vitals.bloodPressureDiastolic ? parseInt(vitals.bloodPressureDiastolic) : null,
          pulseRate: vitals.pulseRate ? parseInt(vitals.pulseRate) : null,
          respiratoryRate: vitals.respiratoryRate ? parseInt(vitals.respiratoryRate) : null,
          spO2: vitals.spO2 ? parseInt(vitals.spO2) : null,
          weight: vitals.weight ? parseFloat(vitals.weight) : null,
          height: vitals.height ? parseFloat(vitals.height) : null,
        }),
      })

      if (!response.ok) throw new Error('Failed to save vitals')

      // Reset form
      setVitals({
        temperature: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        pulseRate: '',
        respiratoryRate: '',
        spO2: '',
        weight: '',
        height: '',
        notes: '',
      })
      setSelectedPatient(null)
      alert('Vitals recorded successfully!')
    } catch (error) {
      console.error('Error saving vitals:', error)
      alert('Failed to save vitals')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Record Vital Signs</h1>
        <p className="text-gray-500">Record patient vital signs</p>
      </div>

      {/* Patient Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Patient</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedPatient ? (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-900">
                    {selectedPatient.firstName} {selectedPatient.lastName}
                  </p>
                  <p className="text-sm text-green-700">
                    ID: {selectedPatient.patientId} | {selectedPatient.gender}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <Input
                type="text"
                placeholder="Search patient by name, ID, or phone..."
                className="pl-9"
                value={patientSearch}
                onChange={(e) => handlePatientSearch(e.target.value)}
              />
              {patientResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {patientResults.map((patient) => (
                    <button
                      key={patient.id}
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 border-b last:border-b-0"
                      onClick={() => selectPatient(patient)}
                    >
                      <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                      <p className="text-sm text-gray-500">
                        {patient.patientId} {patient.phone && `| ${patient.phone}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vitals Form */}
      {selectedPatient && (
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Vital Signs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Temperature (°C)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitals.temperature}
                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                    placeholder="36.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>BP Systolic (mmHg)</Label>
                  <Input
                    type="number"
                    value={vitals.bloodPressureSystolic}
                    onChange={(e) => setVitals({ ...vitals, bloodPressureSystolic: e.target.value })}
                    placeholder="120"
                  />
                </div>
                <div className="space-y-2">
                  <Label>BP Diastolic (mmHg)</Label>
                  <Input
                    type="number"
                    value={vitals.bloodPressureDiastolic}
                    onChange={(e) => setVitals({ ...vitals, bloodPressureDiastolic: e.target.value })}
                    placeholder="80"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pulse Rate (bpm)</Label>
                  <Input
                    type="number"
                    value={vitals.pulseRate}
                    onChange={(e) => setVitals({ ...vitals, pulseRate: e.target.value })}
                    placeholder="72"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Respiratory Rate (/min)</Label>
                  <Input
                    type="number"
                    value={vitals.respiratoryRate}
                    onChange={(e) => setVitals({ ...vitals, respiratoryRate: e.target.value })}
                    placeholder="16"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SpO2 (%)</Label>
                  <Input
                    type="number"
                    value={vitals.spO2}
                    onChange={(e) => setVitals({ ...vitals, spO2: e.target.value })}
                    placeholder="98"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={vitals.weight}
                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                    placeholder="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={vitals.height}
                    onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                    placeholder="170"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label>Notes</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                  value={vitals.notes}
                  onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
                  placeholder="Additional observations..."
                />
              </div>

              <div className="mt-6">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Vitals'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  )
}
