'use client'

import { useState, useEffect } from 'react'
import { User, Clock, Building2, Check, X, ChevronDown, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { RoleScope } from '@/lib/types/database'

interface GroupTeamRequest {
  id: string
  brand_id: string
  brand_name: string
  email: string
  department: string
  requested_role: string
  job_title: string | null
  request_message: string | null
  created_at: string
  requires_group_approval: boolean
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface GroupPendingApprovalsProps {
  groupId: string
  requiresGroupApproval?: boolean
  onRequestProcessed?: () => void
}

const DEPARTMENT_LABELS: Record<string, string> = {
  direction: 'Direction',
  hr: 'Human Resources',
  operations: 'Operations',
  business: 'Business Development'
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Administrator',
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring Manager',
  viewer: 'Viewer'
}

type ScopeType = 'brand' | 'region' | 'store'

export function GroupPendingApprovals({ 
  groupId, 
  requiresGroupApproval,
  onRequestProcessed 
}: GroupPendingApprovalsProps) {
  const [requests, setRequests] = useState<GroupTeamRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [assignedRole, setAssignedRole] = useState<string>('')
  const [assignedScopeType, setAssignedScopeType] = useState<ScopeType>('brand')

  useEffect(() => {
    loadRequests()
  }, [groupId, requiresGroupApproval])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ groupId })
      if (requiresGroupApproval) {
        params.append('requiresGroupApproval', 'true')
      }
      
      const response = await fetch(`/api/group/pending-requests?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      }
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: GroupTeamRequest) => {
    setProcessingId(request.id)
    const role = assignedRole || request.requested_role
    const scope: RoleScope = {
      geographic: assignedScopeType === 'brand' ? 'global' : 'regional',
      divisions: []
    }
    
    try {
      const response = await fetch('/api/group/approve-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          requestId: request.id,
          assignedRole: role,
          assignedScope: scope
        })
      })
      
      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== request.id))
        onRequestProcessed?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to approve request')
      }
    } catch (error) {
      alert('Failed to approve request')
    } finally {
      setProcessingId(null)
      setExpandedId(null)
    }
  }

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    
    setProcessingId(requestId)
    try {
      const response = await fetch('/api/group/reject-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          requestId,
          reason: rejectReason
        })
      })
      
      if (response.ok) {
        setRequests(prev => prev.filter(r => r.id !== requestId))
        onRequestProcessed?.()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to reject request')
      }
    } catch (error) {
      alert('Failed to reject request')
    } finally {
      setProcessingId(null)
      setShowRejectModal(null)
      setRejectReason('')
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Group-Level Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-slate-100 rounded-lg" />
            <div className="h-20 bg-slate-100 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Group-Level Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-[var(--grey-500)]">
            <Check className="w-12 h-12 mx-auto mb-4 opacity-50 text-green-500" />
            <p className="font-medium">All caught up!</p>
            <p className="text-small">No pending requests requiring group approval</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-[var(--gold)] bg-[var(--gold-light)]/10">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[var(--gold)]" />
              Group-Level Approvals
            </div>
            <Badge variant="gold">
              {requests.length} pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map(request => (
            <div
              key={request.id}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden"
            >
              {/* Request Header */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {request.profiles.avatar_url ? (
                      <img
                        src={request.profiles.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-slate-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-slate-900">
                        {request.profiles.full_name || 'Unknown User'}
                      </p>
                      <p className="text-sm text-slate-500">{request.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                    className="p-1 hover:bg-slate-100 rounded"
                  >
                    <ChevronDown
                      className={`h-5 w-5 text-slate-400 transition-transform ${
                        expandedId === request.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
                
                {/* Quick Info */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="gold" size="sm">
                    <Building2 className="h-3 w-3 mr-1" />
                    {request.brand_name}
                  </Badge>
                  <Badge variant="default" size="sm">
                    {DEPARTMENT_LABELS[request.department] || request.department}
                  </Badge>
                  <Badge variant="default" size="sm">
                    Role: {ROLE_LABELS[request.requested_role] || request.requested_role}
                  </Badge>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(request.created_at)}
                  </span>
                </div>
                
                {/* Expanded Details */}
                {expandedId === request.id && (
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                    {request.job_title && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Job Title</p>
                        <p className="text-sm text-slate-700">{request.job_title}</p>
                      </div>
                    )}
                    
                    {request.request_message && (
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase mb-1">Message</p>
                        <p className="text-sm text-slate-700">{request.request_message}</p>
                      </div>
                    )}
                    
                    {/* Role Assignment */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">
                          Assign Role
                        </label>
                        <select
                          value={assignedRole || request.requested_role}
                          onChange={(e) => setAssignedRole(e.target.value)}
                          className="w-full text-sm border border-slate-200 rounded-md px-3 py-2"
                        >
                          <option value="admin">Administrator</option>
                          <option value="recruiter">Recruiter</option>
                          <option value="hiring_manager">Hiring Manager</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">
                          Scope
                        </label>
                        <select
                          value={assignedScopeType}
                          onChange={(e) => setAssignedScopeType(e.target.value as ScopeType)}
                          className="w-full text-sm border border-slate-200 rounded-md px-3 py-2"
                        >
                          <option value="brand">All Brand</option>
                          <option value="region">Region Only</option>
                          <option value="store">Store Only</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <Button
                  variant="destructiveOutline"
                  size="sm"
                  onClick={() => setShowRejectModal(request.id)}
                  disabled={processingId === request.id}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  onClick={() => handleApprove(request)}
                  disabled={processingId === request.id}
                >
                  {processingId === request.id ? (
                    <span className="animate-spin">⏳</span>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              Reject Team Request
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Please provide a reason for rejecting this request. This will be shared with the applicant.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full border border-slate-200 rounded-lg p-3 text-sm resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowRejectModal(null)
                  setRejectReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleReject(showRejectModal)}
                disabled={processingId === showRejectModal || !rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}