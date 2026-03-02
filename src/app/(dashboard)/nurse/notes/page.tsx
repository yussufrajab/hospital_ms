'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Search, Save, Clock, User, History } from 'lucide-react'

interface Patient {
  id: string
  patientId: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string | null
}

interface NursingNote {
  id: string
  noteType: string | null
  note: string
  shift: string | null
  createdAt: string
  nurse: {
    designation: string
    user: {
      firstName: string
      lastName: string
    }
  }
}

const NOTE_TYPES = [
  { value: 'GENERAL', label: 'General Note' },
  { value: 'SHIFT_HANDOVER', label: 'Shift Handover' },
  { value: 'CARE_PLAN', label: 'Care Plan' },
  { value: 'FALL_RISK', label: 'Fall Risk Assessment' },
  { value: 'INTAKE_OUTPUT', label: 'Intake/Output Chart' },
]

const SHIFTS = [
  { value: 'MORNING', label: 'Morning (7AM - 3PM)' },
  { value: 'AFTERNOON', label: 'Afternoon (3PM - 11PM)' },
  { value: 'NIGHT', label: 'Night (11PM - 7AM)' },
]

export default function NursingNotesPage() {
  const { data: session } = useSession()
  const [patientSearch, setPatientSearch] = useState('')
  const [patientResults, setPatientResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create')
  const [notesHistory, setNotesHistory] = useState<NursingNote[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  
  const [formData, setFormData] = useState({
    noteType: 'GENERAL',
    note: '',
    shift: 'MORNING',
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
    await fetchNotesHistory(patient.id)
  }

  const fetchNotesHistory = async (patientId: string) => {
    setLoadingHistory(true)
    try {
      const response = await fetch(`/api/nursing-notes?patientId=${patientId}&limit=50`)
      const data = await response.json()
      setNotesHistory(data.data || [])
    } catch (error) {
      console.error('Error fetching notes history:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPatient || !formData.note.trim()) return

    setSaving(true)

    try {
      const response = await fetch('/api/nursing-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.id,
          noteType: formData.noteType,
          note: formData.note,
          shift: formData.shift,
        }),
      })

      if (!response.ok) throw new Error('Failed to save note')

      // Reset form
      setFormData({
        noteType: 'GENERAL',
        note: '',
        shift: 'MORNING',
      })
      
      // Refresh history
      await fetchNotesHistory(selectedPatient.id)
      setActiveTab('history')
      alert('Nursing note saved successfully!')
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save nursing note')
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

  const getNoteTypeLabel = (type: string | null) => {
    return NOTE_TYPES.find(t => t.value === type)?.label || type || 'General'
  }

  const getShiftLabel = (shift: string | null) => {
    return SHIFTS.find(s => s.value === shift)?.label || shift || '-'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nursing Notes</h1>
        <p className="text-gray-500">Document patient care and observations</p>
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
                    setNotesHistory([])
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
              variant={activeTab === 'create' ? 'default' : 'outline'}
              onClick={() => setActiveTab('create')}
            >
              <FileText className="h-4 w-4 mr-2" />
              New Note
            </Button>
            <Button
              variant={activeTab === 'history' ? 'default' : 'outline'}
              onClick={() => setActiveTab('history')}
            >
              <History className="h-4 w-4 mr-2" />
              View History ({notesHistory.length})
            </Button>
          </div>

          {/* Create Note Tab */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    New Nursing Note
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Note Type</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.noteType}
                        onChange={(e) => setFormData({ ...formData, noteType: e.target.value })}
                      >
                        {NOTE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Shift</Label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.shift}
                        onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                      >
                        {SHIFTS.map((shift) => (
                          <option key={shift.value} value={shift.value}>
                            {shift.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Note Content *</Label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md min-h-[200px]"
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      placeholder="Document patient observations, care provided, and any relevant information..."
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Note'}
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
                    Loading notes history...
                  </CardContent>
                </Card>
              ) : notesHistory.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center text-gray-500">
                    No nursing notes found for this patient.
                  </CardContent>
                </Card>
              ) : (
                notesHistory.map((note) => (
                  <Card key={note.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                            {getNoteTypeLabel(note.noteType)}
                          </span>
                          {note.shift && (
                            <span className="ml-2 inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                              {getShiftLabel(note.shift)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          {formatDate(note.createdAt)}
                        </div>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{note.note}</p>
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                        <User className="h-4 w-4" />
                        {note.nurse.user.firstName} {note.nurse.user.lastName}
                        <span className="text-gray-300">|</span>
                        {note.nurse.designation}
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
