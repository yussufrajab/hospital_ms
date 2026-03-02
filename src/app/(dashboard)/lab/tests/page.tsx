'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FlaskConical, Search, Plus, Save, X } from 'lucide-react'

interface LabTest {
  id: string
  name: string
  testCode: string
  category: string | null
  description: string | null
  specimenType: string | null
  normalRangeMin: number | null
  normalRangeMax: number | null
  unit: string | null
  turnaroundTime: number | null
  price: number
  isActive: boolean
}

export default function LabTestsPage() {
  const { data: session } = useSession()
  const [tests, setTests] = useState<LabTest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newTest, setNewTest] = useState({
    name: '',
    testCode: '',
    category: '',
    description: '',
    specimenType: '',
    normalRangeMin: '',
    normalRangeMax: '',
    unit: '',
    turnaroundTime: '',
    price: '',
  })

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/lab-tests?limit=100')
      const data = await response.json()
      setTests(data.data || [])
    } catch (error) {
      console.error('Error fetching tests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/lab-tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTest,
          normalRangeMin: newTest.normalRangeMin ? parseFloat(newTest.normalRangeMin) : null,
          normalRangeMax: newTest.normalRangeMax ? parseFloat(newTest.normalRangeMax) : null,
          turnaroundTime: newTest.turnaroundTime ? parseInt(newTest.turnaroundTime) : null,
          price: parseFloat(newTest.price) || 0,
        }),
      })

      if (!response.ok) throw new Error('Failed to add test')

      await fetchTests()
      setShowAddForm(false)
      setNewTest({
        name: '',
        testCode: '',
        category: '',
        description: '',
        specimenType: '',
        normalRangeMin: '',
        normalRangeMax: '',
        unit: '',
        turnaroundTime: '',
        price: '',
      })
    } catch (error) {
      console.error('Error adding test:', error)
      alert('Failed to add test')
    } finally {
      setSaving(false)
    }
  }

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(search.toLowerCase()) ||
    test.testCode.toLowerCase().includes(search.toLowerCase()) ||
    (test.category && test.category.toLowerCase().includes(search.toLowerCase()))
  )

  // Group tests by category
  const groupedTests = filteredTests.reduce((acc, test) => {
    const category = test.category || 'Uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(test)
    return acc
  }, {} as Record<string, LabTest[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tests...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lab Test Catalog</h1>
          <p className="text-gray-500">Manage available laboratory tests</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showAddForm ? 'Cancel' : 'Add Test'}
        </Button>
      </div>

      {/* Add Test Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Lab Test</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTest} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Test Name *</Label>
                  <Input
                    value={newTest.name}
                    onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                    placeholder="Complete Blood Count"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Test Code *</Label>
                  <Input
                    value={newTest.testCode}
                    onChange={(e) => setNewTest({ ...newTest, testCode: e.target.value })}
                    placeholder="CBC"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    value={newTest.category}
                    onChange={(e) => setNewTest({ ...newTest, category: e.target.value })}
                    placeholder="Hematology"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Specimen Type</Label>
                  <Input
                    value={newTest.specimenType}
                    onChange={(e) => setNewTest({ ...newTest, specimenType: e.target.value })}
                    placeholder="Blood"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Normal Range Min</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTest.normalRangeMin}
                    onChange={(e) => setNewTest({ ...newTest, normalRangeMin: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Normal Range Max</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTest.normalRangeMax}
                    onChange={(e) => setNewTest({ ...newTest, normalRangeMax: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    value={newTest.unit}
                    onChange={(e) => setNewTest({ ...newTest, unit: e.target.value })}
                    placeholder="mg/dL"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Turnaround Time (min)</Label>
                  <Input
                    type="number"
                    value={newTest.turnaroundTime}
                    onChange={(e) => setNewTest({ ...newTest, turnaroundTime: e.target.value })}
                    placeholder="60"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newTest.price}
                    onChange={(e) => setNewTest({ ...newTest, price: e.target.value })}
                    placeholder="25.00"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md min-h-[80px]"
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  placeholder="Test description..."
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Add Test'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Search tests by name, code, or category..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Tests by Category */}
      {Object.entries(groupedTests).map(([category, categoryTests]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Test</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Code</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Specimen</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Normal Range</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">TAT</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {categoryTests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{test.name}</p>
                          {test.description && (
                            <p className="text-sm text-gray-500">{test.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                          {test.testCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{test.specimenType || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {test.normalRangeMin !== null && test.normalRangeMax !== null
                          ? `${test.normalRangeMin}-${test.normalRangeMax} ${test.unit || ''}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {test.turnaroundTime ? `${test.turnaroundTime} min` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">${test.price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {Object.keys(groupedTests).length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            No lab tests found
          </CardContent>
        </Card>
      )}
    </div>
  )
}
