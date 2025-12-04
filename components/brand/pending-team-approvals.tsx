'use client'

import { useState, useEffect } from 'react'
import { User, Clock, Building2, Check, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  getPendingTeamRequestsAction,
  approveTeamRequestAction,
  rejectTeamRequestAction
} from '@/app/brand/team/actions'
import type { RoleScope } from '@/lib/types/database'

interface TeamRequest {
  id: string
  email: string
  department: string
  requested_role: string
  requested_scope: RoleScope
  job_title: string | null
  request_message: string | null
  created_at: string
  expires_at: string
  requires_group_approval: boolean
  profiles: {
    id: string
    full_name: string | null
    avatar_url: string | null
  }
}

interface PendingTeamApprovalsProps {
  brandId: string
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

// Scope type for team approval (simplified from RoleScope)
type ScopeType = 'brand' | 'region' | 'store'

export function PendingTeamApprovals({ brandId, onRequestProcessed }: PendingTeamApprovalsProps) {
  const [requests, setRequests] = useState<TeamRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)
  const [assignedRole, setAssignedRole] = useState<string>('')
  const [assignedScopeType, setAssignedScopeType] = useState<ScopeType>('brand')

  useEffect(() => {
    loadRequests()
  }, [brandId])

  const loadRequests = async () => {
    setLoading(true)
    try {
      const data = await getPendingTeamRequestsAction(brandId)
      // Transform the nested profiles array to single object
      const transformed = data.map((item: any) => ({
        ...item,
        profiles: Array.isArray(item.profiles) ? item.profiles[0] : item.profiles
      }))
      setRequests(transformed as TeamRequest[])
    } catch (error) {
      console.error('Error loading requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: TeamRequest) => {
    setProcessingId(request.id)
    const role = assignedRole || request.requested_role
    // Convert scope type to RoleScope object
    const scope: RoleScope = {
      geographic: assignedScopeType === 'brand' ? 'global' : 'regional',
      divisions: []
    }
    
    const result = await approveTeamRequestAction(request.id, role, scope)
    
    if (result.success) {
      setRequests(prev => prev.filter(r => r.id !== request.id))
      onRequestProcessed?.()
    } else {
      alert(result.error || 'Failed to approve request')
    }
    setProcessingId(null)
    setExpandedId(null)
  }

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    
    setProcessingId(requestId)
    const result = await rejectTeamRequestAction(requestId, rejectReason)
    
    if (result.success) {
      setRequests(prev => prev.filter(r => r.id !== requestId))
      onRequestProcessed?.()
    } else {
      alert(result.error || 'Failed to reject request')
    }
    setProcessingId(null)
    setShowRejectModal(null)
    setRejectReason('')
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

  const getExpiresIn = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Expired'
    if (diffDays === 1) return 'Expires tomorrow'
    return `Expires in ${diffDays} days`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Pending Team Requests
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
    return null // Don't show card if no pending requests
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-amber-600" />
              Pending Team Requests
            </div>
            <Badge variant="warning">
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
                  <Badge variant="default" size="sm">
                    <Building2 className="h-3 w-3 mr-1" />
                    {DEPARTMENT_LABELS[request.department] || request.department}
                  </Badge>
                  <Badge variant="default" size="sm">
                    Requested: {ROLE_LABELS[request.requested_role] || request.requested_role}
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
                    
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{getExpiresIn(request.expires_at)}</span>
                      {request.requires_group_approval && (
                        <Badge variant="info" size="sm">
                          Requires Group Approval
                        </Badge>
                      )}
                    </div>
                    
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
                  size="sm"
                  onClick={() => handleApprove(request)}
                  disabled={processingId === request.id}
                  className="bg-green-600 hover:bg-green-700"
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