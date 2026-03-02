'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, Save, Plus, Trash2, Stethoscope, FileText, 
  Pill, FlaskConical, Activity
} from 'lucide-react'

interface Appointment {
  id: string
  tokenNumber: number
  patient: {
    id: string
    patientId: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    phone: string | null
    bloodGroup: string | null
  }
}

interface Drug {
  id: string
  name: string
  drugCode: string
  form: string | null
  strength: string | null
  unit: string | null
}

interface PrescriptionItem {
  drugId: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
}

export default function ConsultationPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // SOAP Notes
  const [soapNotes, setSoapNotes] = useState({
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
  })

  // Diagnosis
  const [diagnosis, setDiagnosis] = useState({
    diagnosisText: '',
    icdCode: '',
    notes: '',
  })

  // Prescription
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([{
    drugId: '',
    dosage: '',
    frequency: 'OD',
    duration: '5 days',
    quantity: 1,
    instructions: '',
  }])

  // Vital signs
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

  useEffect(() => {
    fetchAppointment()
    fetchDrugs()
  }, [params.id])

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${params.id}`)
      if (!response.ok) throw new Error('Failed to fetch appointment')
      const data = await response.json()
      setAppointment(data)
    } catch (error) {
      console.error('Error fetching appointment:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDrugs = async () => {
    try {
      const response = await fetch('/api/drugs?limit=100')
      if (response.ok) {
        const data = await response.json()
        setDrugs(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching drugs:', error)
    }
  }

  const handleSaveConsultation = async () => {
    if (!appointment) return
    setSaving(true)

    try {
      // Save vital signs
      if (vitals.temperature || vitals.bloodPressureSystolic) {
        await fetch('/api/vitals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: appointment.patient.id,
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
      }

      // Save diagnosis
      if (diagnosis.diagnosisText) {
        await fetch('/api/diagnoses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: appointment.patient.id,
            ...diagnosis,
          }),
        })
      }

      // Save prescription
      const validItems = prescriptionItems.filter(item => item.drugId)
      if (validItems.length > 0) {
        await fetch('/api/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: appointment.patient.id,
            items: validItems,
          }),
        })
      }

      // Update appointment status
      await fetch(`/api/appointments/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      router.push('/doctor/queue')
    } catch (error) {
      console.error('Error saving consultation:', error)
      alert('Failed to save consultation')
    } finally {
      setSaving(false)
    }
  }

  const addPrescriptionItem = () => {
    setPrescriptionItems([...prescriptionItems, {
      drugId: '',
      dosage: '',
      frequency: 'OD',
      duration: '5 days',
      quantity: 1,
      instructions: '',
    }])
  }

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index))
  }

  const updatePrescriptionItem = (index: number, field: string, value: string | number) => {
    const updated = [...prescriptionItems]
    updated[index] = { ...updated[index], [field]: value }
    setPrescriptionItems(updated)
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading consultation...</div>
      </div>
    )
  }

  if (!appointment) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">Appointment not found</div>
        <Button onClick={() => router.push('/doctor/queue')}>Back to Queue</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/doctor/queue')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consultation - Token #{appointment.tokenNumber}
            </h1>
            <p className="text-gray-500">
              {appointment.patient.firstName} {appointment.patient.lastName} | 
              {calculateAge(appointment.patient.dateOfBirth)} yrs | {appointment.patient.gender}
            </p>
          </div>
        </div>
        <Button onClick={handleSaveConsultation} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Complete Consultation'}
        </Button>
      </div>

      {/* Patient Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Patient ID</p>
              <p className="font-medium">{appointment.patient.patientId}</p>
            </div>
            <div>
              <p className="text-gray-500">Blood Group</p>
              <p className="font-medium">{appointment.patient.bloodGroup?.replace('_', ' ') || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{appointment.patient.phone || '-'}</p>
            </div>
            <div>
              <p className="text-gray-500">DOB</p>
              <p className="font-medium">{new Date(appointment.patient.dateOfBirth).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">
            <Activity className="h-4 w-4 mr-2" />
            Vitals
          </TabsTrigger>
          <TabsTrigger value="soap">
            <FileText className="h-4 w-4 mr-2" />
            SOAP Notes
          </TabsTrigger>
          <TabsTrigger value="diagnosis">
            <Stethoscope className="h-4 w-4 mr-2" />
            Diagnosis
          </TabsTrigger>
          <TabsTrigger value="prescription">
            <Pill className="h-4 w-4 mr-2" />
            Prescription
          </TabsTrigger>
        </TabsList>

        {/* Vitals Tab */}
        <TabsContent value="vitals">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* SOAP Notes Tab */}
        <TabsContent value="soap">
          <Card>
            <CardHeader>
              <CardTitle>SOAP Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subjective (Patient's complaints)</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={soapNotes.subjective}
                  onChange={(e) => setSoapNotes({ ...soapNotes, subjective: e.target.value })}
                  placeholder="Patient's reported symptoms and concerns..."
                />
              </div>
              <div className="space-y-2">
                <Label>Objective (Clinical findings)</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={soapNotes.objective}
                  onChange={(e) => setSoapNotes({ ...soapNotes, objective: e.target.value })}
                  placeholder="Physical examination findings..."
                />
              </div>
              <div className="space-y-2">
                <Label>Assessment (Diagnosis)</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={soapNotes.assessment}
                  onChange={(e) => setSoapNotes({ ...soapNotes, assessment: e.target.value })}
                  placeholder="Clinical assessment and diagnosis..."
                />
              </div>
              <div className="space-y-2">
                <Label>Plan (Treatment plan)</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={soapNotes.plan}
                  onChange={(e) => setSoapNotes({ ...soapNotes, plan: e.target.value })}
                  placeholder="Treatment plan, medications, follow-up..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diagnosis Tab */}
        <TabsContent value="diagnosis">
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Diagnosis *</Label>
                <Input
                  value={diagnosis.diagnosisText}
                  onChange={(e) => setDiagnosis({ ...diagnosis, diagnosisText: e.target.value })}
                  placeholder="Enter diagnosis"
                />
              </div>
              <div className="space-y-2">
                <Label>ICD Code</Label>
                <Input
                  value={diagnosis.icdCode}
                  onChange={(e) => setDiagnosis({ ...diagnosis, icdCode: e.target.value })}
                  placeholder="e.g., J06.9"
                />
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                  value={diagnosis.notes}
                  onChange={(e) => setDiagnosis({ ...diagnosis, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prescription Tab */}
        <TabsContent value="prescription">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Prescription
                <Button size="sm" variant="outline" onClick={addPrescriptionItem}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medication
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescriptionItems.map((item, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Medication {index + 1}</span>
                    {prescriptionItems.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePrescriptionItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Drug *</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={item.drugId}
                        onChange={(e) => updatePrescriptionItem(index, 'drugId', e.target.value)}
                      >
                        <option value="">Select Drug</option>
                        {drugs.map((drug) => (
                          <option key={drug.id} value={drug.id}>
                            {drug.name} {drug.strength} ({drug.form})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Dosage *</Label>
                      <Input
                        value={item.dosage}
                        onChange={(e) => updatePrescriptionItem(index, 'dosage', e.target.value)}
                        placeholder="e.g., 1 tablet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency *</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={item.frequency}
                        onChange={(e) => updatePrescriptionItem(index, 'frequency', e.target.value)}
                      >
                        <option value="OD">Once daily (OD)</option>
                        <option value="BD">Twice daily (BD)</option>
                        <option value="TDS">Three times daily (TDS)</option>
                        <option value="QDS">Four times daily (QDS)</option>
                        <option value="PRN">As needed (PRN)</option>
                        <option value="STAT">Immediately (STAT)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Duration *</Label>
                      <Input
                        value={item.duration}
                        onChange={(e) => updatePrescriptionItem(index, 'duration', e.target.value)}
                        placeholder="e.g., 5 days"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updatePrescriptionItem(index, 'quantity', parseInt(e.target.value))}
                        placeholder="10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Instructions</Label>
                      <Input
                        value={item.instructions}
                        onChange={(e) => updatePrescriptionItem(index, 'instructions', e.target.value)}
                        placeholder="e.g., After meals"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}