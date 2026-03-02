'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Receipt, Search, Clock, CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react'

interface InsuranceClaim {
  id: string
  claimNumber: string
  claimDate: string
  amount: number
  approvedAmount: number | null
  status: string
  submittedAt: string | null
  reviewedAt: string | null
  rejectionReason: string | null
  notes: string | null
  policy: {
    id: string
    policyNumber: string
    policyName: string | null
    coverageAmount: number
    patient: {
      patientId: string
      firstName: string
      lastName: string
      phone: string | null
    }
    company: {
      name: string
      code: string
    }
  }
}

export default function InsuranceClaimsPage() {
  const { data: session } = useSession()
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [approvedAmount, setApprovedAmount] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchClaims()
  }, [statusFilter])

  const fetchClaims = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      params.append('limit', '100')

      const response = await fetch(`/api/insurance-claims?${params.toString()}`)
      const data = await response.json()
      setClaims(data.data || [])
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClaims = claims.filter(claim =>
    claim.claimNumber.toLowerCase().includes(search.toLowerCase()) ||
    claim.policy.patient.firstName.toLowerCase().includes(search.toLowerCase()) ||
    claim.policy.patient.lastName.toLowerCase().includes(search.toLowerCase()) ||
    claim.policy.patient.patientId.toLowerCase().includes(search.toLowerCase()) ||
    claim.policy.company.name.toLowerCase().includes(search.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700'
      case 'UNDER_REVIEW':
        return 'bg-yellow-100 text-yellow-700'
      case 'APPROVED':
        return 'bg-green-100 text-green-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      case 'PAID':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleApprove = async () => {
    if (!selectedClaim) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/insurance-claims/${selectedClaim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'APPROVED',
          approvedAmount: parseFloat(approvedAmount),
        }),
      })

      if (!response.ok) throw new Error('Failed to approve claim')

      await fetchClaims()
      setShowApproveModal(false)
      setSelectedClaim(null)
      setApprovedAmount('')
      alert('Claim approved successfully!')
    } catch (error) {
      console.error('Error approving claim:', error)
      alert('Failed to approve claim')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (claim: InsuranceClaim) => {
    const reason = prompt('Enter rejection reason:')
    if (!reason) return

    setProcessing(true)
    try {
      const response = await fetch(`/api/insurance-claims/${claim.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'REJECTED',
          rejectionReason: reason,
        }),
      })

      if (!response.ok) throw new Error('Failed to reject claim')

      await fetchClaims()
      alert('Claim rejected')
    } catch (error) {
      console.error('Error rejecting claim:', error)
      alert('Failed to reject claim')
    } finally {
      setProcessing(false)
    }
  }

  // Calculate stats
  const pendingCount = claims.filter(c => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length
  const approvedCount = claims.filter(c => c.status === 'APPROVED').length
  const rejectedCount = claims.filter(c => c.status === 'REJECTED').length
  const totalClaimed = claims.reduce((sum, c) => sum + Number(c.amount), 0)
  const totalApproved = claims
    .filter(c => c.approvedAmount)
    .reduce((sum, c) => sum + Number(c.approvedAmount), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Insurance Claims</h1>
        <p className="text-gray-500">Manage and process insurance claims</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Claimed</p>
                <p className="text-2xl font-bold">{formatCurrency(totalClaimed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Approved</p>
                <p className="text-2xl font-bold">{formatCurrency(totalApproved)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            type="text"
            placeholder="Search by claim number, patient, or company..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'SUBMITTED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('SUBMITTED')}
          >
            <Clock className="h-4 w-4 mr-2" />
            Submitted
          </Button>
          <Button
            variant={statusFilter === 'APPROVED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('APPROVED')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approved
          </Button>
          <Button
            variant={statusFilter === 'REJECTED' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('REJECTED')}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Rejected
          </Button>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              Loading claims...
            </CardContent>
          </Card>
        ) : filteredClaims.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No insurance claims found
            </CardContent>
          </Card>
        ) : (
          filteredClaims.map((claim) => (
            <Card key={claim.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Patient & Company Info */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {claim.policy.patient.firstName} {claim.policy.patient.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {claim.claimNumber} | {claim.policy.company.name}
                        </p>
                      </div>
                    </div>

                    {/* Claim Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-gray-500">Policy Number</p>
                        <p className="font-medium">{claim.policy.policyNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Claim Date</p>
                        <p className="font-medium">{new Date(claim.claimDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Claimed Amount</p>
                        <p className="font-medium">{formatCurrency(Number(claim.amount))}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Coverage</p>
                        <p className="font-medium">{formatCurrency(Number(claim.policy.coverageAmount))}</p>
                      </div>
                    </div>

                    {/* Approved Amount */}
                    {claim.approvedAmount && (
                      <div className="text-sm text-green-600 font-medium">
                        Approved: {formatCurrency(Number(claim.approvedAmount))}
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {claim.rejectionReason && (
                      <div className="text-sm text-red-600">
                        Reason: {claim.rejectionReason}
                      </div>
                    )}

                    {/* Notes */}
                    {claim.notes && (
                      <div className="text-sm text-gray-500 mt-2">
                        Notes: {claim.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                    {(claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW') && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(claim)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedClaim(claim)
                            setApprovedAmount(claim.amount.toString())
                            setShowApproveModal(true)
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && selectedClaim && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Approve Claim</h3>
              <p className="text-sm text-gray-500 mb-4">
                Claim: {selectedClaim.claimNumber}<br />
                Patient: {selectedClaim.policy.patient.firstName} {selectedClaim.policy.patient.lastName}<br />
                Claimed: {formatCurrency(Number(selectedClaim.amount))}
              </p>
              <div className="space-y-2 mb-4">
                <Label>Approved Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  placeholder="Enter approved amount"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowApproveModal(false)
                    setSelectedClaim(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleApprove} disabled={processing}>
                  {processing ? 'Processing...' : 'Approve'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Import DollarSign icon
function DollarSign({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
