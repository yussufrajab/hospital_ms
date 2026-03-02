'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pill, Search, Save, Clock, User, History, CheckCircle } from 'lucide-react'

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string | null
}

interface Prescription {
  id: string
  prescriptionDate: string
  status: string
  doctor: {
    designation: string
    user: {
      firstName: string
      lastName: string
    }
  }
  items: PrescriptionItem[]
}

interface PrescriptionItem {
  id: string
  drugId: string
  drug: {
    name: string
    strength: string | null
    form: string | null
    unit: string | null
  }
  dosage: string
  frequency: string
  duration: string | null
  quantity: number
  instructions: string | null
  isDispensed: boolean
}

interface MedicationAdministration {
  id: string
  dosage: string
  route: string | null
  notes: string | null
  administeredAt: string
  administrator: {
    designation: string
    user: {
      firstName: string
      lastName: string
    }
  }
}

const ROUTES = [
  { value: 'ORAL', label: 'Oral' },
  { value: 'IV', label: 'Intravenous (IV)' },
  { value: 'IM', label: 'Intramuscular (IM)' },
  { value: 'SC', label: 'Subcutaneous (SC)' },
  { value: 'TOPICAL', label: 'Topical' },
  { value: 'INHALATION', label: 'Inhalation' },
  { value: 'NASAL', label: 'Nasal' },
  { value: 'OPHTHALMIC', label: 'Ophthalmic' },
  { value: 'OTIC', label: 'Otic (Ear)' },
  { value: 'RECTAL', label: 'Rectal' },
  { value: 'VAGINAL', label: 'Vaginal' },
]

export default function MedicationsPage() {
  const { data: session } = useSession()
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'administer' | 'history'>('prescriptions')
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PrescriptionItem | null>(null)
  const [administrationHistory, setAdministrationHistory] = useState<MedicationAdministration[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  const [adminForm, setAdminForm] = useState({
    dosage: '',
    route: 'ORAL',
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

  const selectPatient = async (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientSearch('')
    setPatientResults([])
    await Promise.all([
      fetchPrescriptions(patient.id),
      fetchAdministrationHistory(patient.id)
    ])
  }

  const fetchPrescriptions = async (patientId: string) => {
    setLoadingPrescriptions(true)
    try {
      const response = await fetch(`/api/prescriptions?patientId=${patientId}&limit=50`)
      const data = await response.json()
      setPrescriptions(data.data || [])
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
    } finally {
      setLoadingPrescriptions(false)
    }
  }

  const fetchAdministrationHistory = async (patientId: string) => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/medication-admins?patientId=${patientId}&limit=50`)
      const data = await response.json()
      setAdministrationHistory(data.data || [])
    } catch (error) {
      console.error('Error fetching administration history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const selectItemForAdministration = (item: PrescriptionItem) => {
    setSelectedItem(item)
    setAdminForm({
      dosage: item.dosage,
      route: 'ORAL',
      notes: '',
    })
    setActiveTab('administer')
  }

  const handleAdminister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !selectedItem) return

    setSaving(true)

    try {
      const response = await fetch('/api/medication-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          medicationId: selectedItem.id,
          dosage: adminForm.dosage,
          route: adminForm.route,
          notes: adminForm.notes,
        }),
      })

      if (!response.ok) throw new Error('Failed to record administration')

      // Reset form
      setSelectedItem(null)
      setAdminForm({
        dosage: '',
        route: 'ORAL',
        notes: '',
      })
      
      // Refresh history
      await fetchAdministrationHistory(selectedPatient.id)
      setActiveTab('history')
      alert('Medication administration recorded successfully!')
    } catch (error) {
      console.error('Error recording administration:', error)
      alert('Failed to record medication administration')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const getDrugName = (item: PrescriptionItem) => {
    let name = item.drug.name
    if (item.drug.strength) name += ` ${item.drug.strength}`
    if (item.drug.form) name += ` (${item.drug.form})`
    return name
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Medication Administration Record (MAR)</h1>
        <p className="text-gray-500">Record and track medication administrations</p>
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
                  onClick={() => {
                    setSelectedPatient(null)
                    setPrescriptions([])
                    setAdministrationHistory([])
                  }}
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

      {/* Main Content */}
      {selectedPatient && (
        <div className="space-y-4">
          {/* Tab Buttons */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'prescriptions' ? 'default' : 'outline'}
              onClick={() => setActiveTab('prescriptions')}
            >
              <Pill className="h-4 w-4 mr-2" />
              Prescriptions
            </Button>
            <Button
              variant={activeTab === 'administer' ? 'default' : 'outline'}
              onClick={() => setActiveTab('administer')}
              disabled={!selectedItem}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Administer
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'outline'}
              onClick={() => setActiveTab('history')}
            >
              <History className="h-4 w-4 mr-2" />
              History ({administrationHistory.length})
            </Button>
          </div>

          {/* Prescriptions Tab */}
          {activeTab === 'prescriptions' && (
            <div className="space-y-4">
              {loadingPrescriptions ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Loading prescriptions...
                  </CardContent>
                </Card>
              ) : prescriptions.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No prescriptions found for this patient.
                  </CardContent>
                </Card>
              ) : (
                prescriptions.map((prescription) => (
                  <Card key={prescription.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Prescription - {formatDate(prescription.prescriptionDate)}
                        </CardTitle>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          prescription.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          prescription.status === 'DISPENSED' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {prescription.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Prescribed by: {prescription.doctor.user.firstName} {prescription.doctor.user.lastName} ({prescription.doctor.designation})
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {prescription.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{getDrugName(item)}</p>
                              <p className="text-sm text-gray-600">
                                {item.dosage} | {item.frequency} | {item.duration || 'As needed'}
                              </p>
                              {item.instructions && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Instructions: {item.instructions}
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => selectItemForAdministration(item)}
                              disabled={!item.isDispensed}
                              title={!item.isDispensed ? 'Medication not yet dispensed' : 'Administer this medication'}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Administer
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Administer Tab */}
          {activeTab === 'administer' && selectedItem && (
            <form onSubmit={handleAdminister}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Administer Medication
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Selected Medication Info */}
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">{getDrugName(selectedItem)}</p>
                    <p className="text-sm text-blue-700">
                      Prescribed: {selectedItem.dosage} | {selectedItem.frequency}
                    </p>
                    {selectedItem.instructions && (
                      <p className="text-sm text-blue-600 mt-1">
                        Instructions: {selectedItem.instructions}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Dosage Administered *</Label>
                      <Input
                        value={adminForm.dosage}
                        onChange={(e) => setAdminForm({ ...adminForm, dosage: e.target.value })}
                        placeholder="e.g., 1 tablet, 500mg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Route *</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={adminForm.route}
                        onChange={(e) => setAdminForm({ ...adminForm, route: e.target.value })}
                      >
                        {ROUTES.map((route) => (
                          <option key={route.value} value={route.value}>
                            {route.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                      value={adminForm.notes}
                      onChange={(e) => setAdminForm({ ...adminForm, notes: e.target.value })}
                      placeholder="Any observations or notes about the administration..."
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSelectedItem(null)
                        setActiveTab('prescriptions')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Recording...' : 'Record Administration'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </form>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {loadingHistory ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    Loading administration history...
                  </CardContent>
                </Card>
              ) : administrationHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No medication administrations recorded for this patient.
                  </CardContent>
                </Card>
              ) : (
                administrationHistory.map((admin) => (
                  <Card key={admin.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{admin.dosage}</p>
                          {admin.route && (
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mt-1">
                              {ROUTES.find(r => r.value === admin.route)?.label || admin.route}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {formatDate(admin.administeredAt)}
                        </div>
                      </div>
                      {admin.notes && (
                        <p className="text-gray-600 text-sm mt-2">{admin.notes}</p>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        {admin.administrator.user.firstName} {admin.administrator.user.lastName}
                        <span className="text-gray-300">|</span>
                        {admin.administrator.designation}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}