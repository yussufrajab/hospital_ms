'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, User, Pill, AlertTriangle, CheckCircle, Save } from 'lucide-react'

interface Prescription {
  id: string
  prescriptionDate: string
  status: string
  patient: {
    id: string
    patientId: string
    firstName: string
    lastName: string
    dateOfBirth: string
    gender: string
    phone: string | null
    allergies: Array<{
      allergen: string
      severity: string | null
      reaction: string | null
    }>
  }
  doctor: {
    designation: string
    user: {
      firstName: string
      lastName: string
    }
  }
  items: Array<{
    id: string
    drugId: string
    drug: {
      id: string
      name: string
      drugCode: string
      form: string | null
      strength: string | null
      unit: string | null
    }
    dosage: string
    frequency: string
    duration: string | null
    quantity: number
    instructions: string | null
    isDispensed: boolean
    dispensedQuantity: number | null
  }>
}

export default function DispensePrescriptionPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dispenseItems, setDispenseItems] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchPrescription()
  }, [params.id])

  const fetchPrescription = async () => {
    try {
      const response = await fetch(`/api/prescriptions/${params.id}/dispense`)
      if (!response.ok) throw new Error('Failed to fetch prescription')
      const data = await response.json()
      setPrescription(data)
      
      // Initialize dispense items with prescribed quantities
      const initialItems: Record<string, number> = {}
      data.items.forEach((item: { id: string; quantity: number }) => {
        initialItems[item.id] = item.quantity
      })
      setDispenseItems(initialItems)
    } catch (error) {
      console.error('Error fetching prescription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDispense = async () => {
    if (!prescription) return
    setSaving(true)

    try {
      const items = Object.entries(dispenseItems).map(([itemId, quantity]) => ({
        itemId,
        dispensedQuantity: quantity,
      }))

      const response = await fetch(`/api/prescriptions/${prescription.id}/dispense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })

      if (!response.ok) throw new Error('Failed to dispense')

      alert('Prescription dispensed successfully!')
      router.push('/pharmacy/queue')
    } catch (error) {
      console.error('Error dispensing:', error)
      alert('Failed to dispense prescription')
    } finally {
      setSaving(false)
    }
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

  const getDrugName = (item: Prescription['items'][0]) => {
    let name = item.drug.name
    if (item.drug.strength) name += ` ${item.drug.strength}`
    if (item.drug.form) name += ` (${item.drug.form})`
    return name
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading prescription...</div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">Prescription not found</div>
        <Button onClick={() => router.push('/pharmacy/queue')}>Back to Queue</Button>
      </div>
    )
  }

  const allItemsDispensed = prescription.items.every(item => item.isDispensed)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/pharmacy/queue')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispense Prescription</h1>
            <p className="text-gray-500">
              {prescription.patient.firstName} {prescription.patient.lastName} | {prescription.patient.patientId}
            </p>
          </div>
        </div>
        {!allItemsDispensed && (
          <Button onClick={handleDispense} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Dispensing...' : 'Complete Dispensing'}
          </Button>
        )}
      </div>

      {/* Patient Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient ID</p>
                  <p className="font-medium">{prescription.patient.patientId}</p>
                </div>
                <div>
                  <p className="text-gray-500">Age / Gender</p>
                  <p className="font-medium">{calculateAge(prescription.patient.dateOfBirth)} yrs | {prescription.patient.gender}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <p className="font-medium">{prescription.patient.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prescribed By</p>
                  <p className="font-medium">
                    {prescription.doctor.user.firstName} {prescription.doctor.user.lastName}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Allergies Alert */}
      {prescription.patient.allergies.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Allergies:</span>
              {prescription.patient.allergies.map((allergy, index) => (
                <span key={index} className="px-2 py-1 bg-red-100 rounded text-sm">
                  {allergy.allergen} {allergy.severity && `(${allergy.severity})`}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prescription.items.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg border ${item.isDispensed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {item.isDispensed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                      )}
                      <p className={`font-medium ${item.isDispensed ? 'text-green-700' : 'text-gray-900'}`}>
                        {getDrugName(item)}
                      </p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Dosage:</span> {item.dosage}
                      </div>
                      <div>
                        <span className="font-medium">Frequency:</span> {item.frequency}
                      </div>
                      <div>
                        <span className="font-medium">Duration:</span> {item.duration || 'As needed'}
                      </div>
                      <div>
                        <span className="font-medium">Qty:</span> {item.quantity}
                      </div>
                    </div>
                    {item.instructions && (
                      <p className="mt-2 text-sm text-gray-500">
                        <span className="font-medium">Instructions:</span> {item.instructions}
                      </p>
                    )}
                  </div>

                  {!item.isDispensed && (
                    <div className="w-32">
                      <Label className="text-xs">Dispense Qty</Label>
                      <Input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={dispenseItems[item.id] || 0}
                        onChange={(e) => setDispenseItems({
                          ...dispenseItems,
                          [item.id]: parseInt(e.target.value) || 0,
                        })}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {item.isDispensed && (
                    <div className="text-right">
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-medium">
                        Dispensed: {item.dispensedQuantity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {allItemsDispensed && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-700 font-medium">This prescription has been fully dispensed</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
