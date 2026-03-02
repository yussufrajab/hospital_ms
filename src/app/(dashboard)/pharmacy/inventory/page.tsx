'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Search, Plus, AlertTriangle, Edit, Save, X } from 'lucide-react'

interface Drug {
  id: string
  name: string
  genericName: string | null
  brandName: string | null
  drugCode: string
  form: string | null
  strength: string | null
  unit: string | null
  reorderLevel: number
}

interface InventoryItem {
  id: string
  batchNumber: string
  lotNumber: string | null
  quantity: number
  unitPrice: number
  sellingPrice: number
  expiryDate: string
  manufacturingDate: string | null
  supplier: string | null
  location: string | null
  status: string
  drug: Drug
}

export default function DrugInventoryPage() {
  const { data: session } = useSession()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newItem, setNewItem] = useState({
    drugId: '',
    batchNumber: '',
    lotNumber: '',
    quantity: 0,
    unitPrice: 0,
    sellingPrice: 0,
    expiryDate: '',
    manufacturingDate: '',
    supplier: '',
    location: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [inventoryRes, drugsRes] = await Promise.all([
        fetch('/api/drug-inventory?limit=100'),
        fetch('/api/drugs?limit=100'),
      ])
      const inventoryData = await inventoryRes.json()
      const drugsData = await drugsRes.json()
      setInventory(inventoryData.data || [])
      setDrugs(drugsData.data || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/drug-inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          unitPrice: parseFloat(newItem.unitPrice.toString()),
          sellingPrice: parseFloat(newItem.sellingPrice.toString()),
          quantity: parseInt(newItem.quantity.toString()),
        }),
      })

      if (!response.ok) throw new Error('Failed to add inventory')

      await fetchData()
      setShowAddForm(false)
      setNewItem({
        drugId: '',
        batchNumber: '',
        lotNumber: '',
        quantity: 0,
        unitPrice: 0,
        sellingPrice: 0,
        expiryDate: '',
        manufacturingDate: '',
        supplier: '',
        location: '',
      })
    } catch (error) {
      console.error('Error adding inventory:', error)
      alert('Failed to add inventory')
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilExpiry < 0) return { color: 'bg-red-100 text-red-700', label: 'Expired' }
    if (daysUntilExpiry <= 30) return { color: 'bg-red-100 text-red-700', label: `${daysUntilExpiry} days` }
    if (daysUntilExpiry <= 90) return { color: 'bg-yellow-100 text-yellow-700', label: `${daysUntilExpiry} days` }
    return { color: 'bg-green-100 text-green-700', label: `${daysUntilExpiry} days` }
  }

  const filteredInventory = inventory.filter(item =>
    item.drug.name.toLowerCase().includes(search.toLowerCase()) ||
    item.drug.drugCode.toLowerCase().includes(search.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading inventory...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Drug Inventory</h1>
          <p className="text-gray-500">Manage drug stock and batches</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showAddForm ? 'Cancel' : 'Add Stock'}
        </Button>
      </div>

      {/* Add Inventory Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddInventory} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Drug *</Label>
                  <select
                    className="w-full px-3 py-2 border rounded-md"
                    value={newItem.drugId}
                    onChange={(e) => setNewItem({ ...newItem, drugId: e.target.value })}
                    required
                  >
                    <option value="">Select Drug</option>
                    {drugs.map((drug) => (
                      <option key={drug.id} value={drug.id}>
                        {drug.name} ({drug.drugCode})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Batch Number *</Label>
                  <Input
                    value={newItem.batchNumber}
                    onChange={(e) => setNewItem({ ...newItem, batchNumber: e.target.value })}
                    placeholder="BTH-001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Lot Number</Label>
                  <Input
                    value={newItem.lotNumber}
                    onChange={(e) => setNewItem({ ...newItem, lotNumber: e.target.value })}
                    placeholder="LOT-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity *</Label>
                  <Input
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                    placeholder="100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.unitPrice}
                    onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="10.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Selling Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newItem.sellingPrice}
                    onChange={(e) => setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="15.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date *</Label>
                  <Input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Manufacturing Date</Label>
                  <Input
                    type="date"
                    value={newItem.manufacturingDate}
                    onChange={(e) => setNewItem({ ...newItem, manufacturingDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Input
                    value={newItem.supplier}
                    onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                    placeholder="Supplier name"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Add Stock'}
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
          placeholder="Search by drug name, code, or batch number..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Drug</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Batch</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Qty</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Unit Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Sell Price</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Expiry</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInventory.map((item) => {
                  const expiryStatus = getExpiryStatus(item.expiryDate)
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.drug.name}</p>
                          <p className="text-sm text-gray-500">{item.drug.drugCode}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">{item.batchNumber}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.quantity} {item.drug.unit}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm">${item.unitPrice.toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">${item.sellingPrice.toFixed(2)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm">{formatDate(item.expiryDate)}</p>
                          <span className={`inline-block px-2 py-0.5 text-xs rounded ${expiryStatus.color}`}>
                            {expiryStatus.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          item.status === 'IN_STOCK' ? 'bg-green-100 text-green-700' :
                          item.status === 'LOW_STOCK' ? 'bg-yellow-100 text-yellow-700' :
                          item.status === 'OUT_OF_STOCK' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredInventory.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No inventory items found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
