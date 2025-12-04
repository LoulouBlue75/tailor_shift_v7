'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button, Input, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { Plus, Mail, Trash2, Edit, Users, Shield, AlertTriangle } from 'lucide-react'
import { checkBrandPermissionAction, getBrandTeamMembersAction } from './actions'

const ROLES = [
  { id: 'owner', name: 'Owner', desc: 'Tous les droits', color: 'bg-purple-100 text-purple-800' },
  { id: 'admin_global', name: 'Admin Global', desc: 'Administration complète', color: 'bg-red-100 text-red-800' },
  { id: 'admin_brand', name: 'Admin Marque', desc: 'Gestion marque spécifique', color: 'bg-orange-100 text-orange-800' },
  { id: 'hr_global', name: 'HR Global', desc: 'Recrutement global', color: 'bg-blue-100 text-blue-800' },
  { id: 'hr_regional', name: 'HR Régional', desc: 'Recrutement régional', color: 'bg-cyan-100 text-cyan-800' },
  { id: 'recruiter', name: 'Recruteur', desc: 'Opérations recrutement', color: 'bg-green-100 text-green-800' },
  { id: 'manager_store', name: 'Manager Boutique', desc: 'Gestion boutique', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'viewer', name: 'Viewer', desc: 'Lecture seule', color: 'bg-gray-100 text-gray-800' },
]

interface TeamMember {
  id: string
  role: string
  role_scope: any
  invited_at: string
  accepted_at: string | null
  profiles: {
    id: string
    email: string
    full_name: string | null
  }[]
}

interface PendingInvitation {
  id: string
  email: string
  role: string
  created_at: string
}

export default function BrandTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invitations, setInvitations] = useState<PendingInvitation[]>([])
  const [showInvite, setShowInvite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [canManageTeam, setCanManageTeam] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'viewer',
    message: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError('Utilisateur non authentifié')
        return
      }

      // Get brand ID
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!brand) {
        setError('Marque non trouvée')
        return
      }

      // Check permissions
      const hasPermission = await checkBrandPermissionAction(user.id, brand.id, 'manage_team')
      setCanManageTeam(hasPermission)

      // Load team members
      const teamMembers = await getBrandTeamMembersAction(brand.id)
      setMembers(teamMembers as TeamMember[])

      // Load pending invitations
      const { data: invitesData, error: invitesError } = await supabase
        .from('brand_invitations')
        .select('*')
        .eq('brand_id', brand.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (!invitesError) {
        setInvitations(invitesData || [])
      }

    } catch (err) {
      console.error('Error loading team data:', err)
      setError('Erreur lors du chargement des données équipe')
    } finally {
      setLoading(false)
    }
  }

  const sendInvitation = async () => {
    if (!inviteForm.email.trim()) {
      setError('Email requis')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return

      // Get brand ID
      const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!brand) return

      // Create invitation
      const { error: inviteError } = await supabase
        .from('brand_invitations')
        .insert({
          brand_id: brand.id,
          email: inviteForm.email.trim(),
          role: inviteForm.role,
          message: inviteForm.message.trim() || null
        })

      if (inviteError) {
        throw inviteError
      }

      // Reset form and reload
      setInviteForm({ email: '', role: 'viewer', message: '' })
      setShowInvite(false)
      setSuccess('Invitation envoyée avec succès')
      await loadTeamData()

    } catch (err: any) {
      console.error('Error sending invitation:', err)
      setError(err.message || 'Erreur lors de l\'envoi de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) return

    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('brand_team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setSuccess('Membre supprimé avec succès')
      await loadTeamData()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression')
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('brand_invitations')
        .delete()
        .eq('id', invitationId)

      if (error) throw error

      setSuccess('Invitation annulée')
      await loadTeamData()
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'annulation')
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-[var(--gold)]" />
          <div>
            <h1 className="text-h2">Team Management</h1>
            <p className="text-[var(--grey-600)]">Gérez les membres de votre équipe</p>
          </div>
        </div>
        {canManageTeam && (
          <Button onClick={() => setShowInvite(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Inviter un membre
          </Button>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-500" />
          <span className="text-green-700">{success}</span>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Active Members */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Membres actifs ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-[var(--grey-500)] text-center py-8">
              Aucun membre dans l'équipe
            </p>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const roleInfo = ROLES.find(r => r.id === member.role)
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-[var(--grey-200)] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--gold-light)] rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-[var(--gold-dark)]">
                          {(member.profiles[0]?.full_name || member.profiles[0]?.email || '?')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.profiles[0]?.full_name || 'Utilisateur'}
                        </p>
                        <p className="text-sm text-[var(--grey-600)]">
                          {member.profiles[0]?.email}
                        </p>
                        <Badge className={`mt-1 ${roleInfo?.color}`}>
                          {roleInfo?.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--grey-500)]">
                        {member.accepted_at
                          ? `Membre depuis ${new Date(member.accepted_at).toLocaleDateString()}`
                          : 'Invitation en attente'
                        }
                      </span>
                      {canManageTeam && member.role !== 'owner' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invitations en attente ({invitations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invitations.map((invite) => {
                const roleInfo = ROLES.find(r => r.id === invite.role)
                return (
                  <div key={invite.id} className="flex items-center justify-between p-4 border border-[var(--grey-200)] rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invite.email}</p>
                        <Badge className={`mt-1 ${roleInfo?.color}`}>
                          {roleInfo?.name}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--grey-500)]">
                        Invité le {new Date(invite.created_at).toLocaleDateString()}
                      </span>
                      {canManageTeam && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitation(invite.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Inviter un nouveau membre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Adresse email"
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="colleague@brand.com"
                required
              />

              <div>
                <label className="block text-sm font-medium mb-2">Rôle</label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-[var(--grey-200)] rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
                >
                  {ROLES.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.desc}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Message personnalisé (optionnel)"
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Bienvenue dans l'équipe recrutement !"
              />

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowInvite(false)} className="flex-1">
                  Annuler
                </Button>
                <Button
                  onClick={sendInvitation}
                  loading={loading}
                  disabled={!inviteForm.email.trim()}
                  className="flex-1"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Envoyer l'invitation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
