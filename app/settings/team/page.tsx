"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Settings, 
  Users, 
  Loader2, 
  Mail, 
  AlertCircle,
  MoreVertical,
  Shield,
  UserX,
  ChevronRight
} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { User } from '@supabase/supabase-js'
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"

interface TeamMember {
  id: string
  name: string | null
  email: string | null
  role: 'owner' | 'admin' | 'member'
  avatarUrl?: string
  status: 'active' | 'pending' | 'inactive'
}

interface TeamSettings {
  requireApproval: boolean
  allowMemberInvites: boolean
}

export default function TeamPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [settings, setSettings] = useState<TeamSettings>({
    requireApproval: true,
    allowMemberInvites: false
  })
  const [loadingStates, setLoadingStates] = useState({
    invite: false,
    settings: false
  })
  
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    loadInitialData()
  }, [])

  async function loadInitialData() {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Load team members
      const { data: members, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .order('role', { ascending: false })
      
      if (membersError) throw membersError

      // Load team settings
      const { data: settings, error: settingsError } = await supabase
        .from('team_settings')
        .select('*')
        .single()
      
      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError

      setTeamMembers(members || [
        { 
          id: user?.id || 'owner',
          name: user?.user_metadata?.full_name || user?.email?.split('@')[0], 
          email: user?.email, 
          role: 'owner',
          status: 'active'
        }
      ])

      if (settings) {
        setSettings({
          requireApproval: settings.require_approval,
          allowMemberInvites: settings.allow_member_invites
        })
      }
    } catch (error) {
      console.error('Error loading team data:', error)
      toast({
        title: "Error",
        description: "Failed to load team information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleInviteMember() {
    // TODO: Implement invite modal
    toast({
      title: "Coming Soon",
      description: "Team invites will be available soon!",
    })
  }

  async function handleUpdateSettings(key: keyof TeamSettings, value: boolean) {
    try {
      setLoadingStates(prev => ({ ...prev, settings: true }))
      
      const { error } = await supabase
        .from('team_settings')
        .upsert({ 
          [key === 'requireApproval' ? 'require_approval' : 'allow_member_invites']: value,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      setSettings(prev => ({ ...prev, [key]: value }))
      
      toast({
        title: "Settings Updated",
        description: "Team settings have been updated successfully.",
      })
    } catch (error) {
      console.error('Error updating settings:', error)
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, settings: false }))
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      setTeamMembers(prev => prev.filter(member => member.id !== memberId))
      
      toast({
        title: "Member Removed",
        description: "Team member has been removed successfully.",
      })
    } catch (error) {
      console.error('Error removing member:', error)
      toast({
        title: "Error",
        description: "Failed to remove team member. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-9 w-28" />
            </div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-7 w-32" />
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-11" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Team Members</h2>
            </div>
            <Button onClick={handleInviteMember} disabled={loadingStates.invite}>
              {loadingStates.invite ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Inviting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Invite Member
                </>
              )}
            </Button>
          </div>

          <div className="space-y-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-4">
                  <Avatar>
                    {member.avatarUrl && (
                      <AvatarImage src={member.avatarUrl} alt={member.name || 'Team member'} />
                    )}
                    <AvatarFallback>
                      {member.name 
                        ? member.name.split(" ").map((n) => n[0]).join("").toUpperCase()
                        : member.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{member.name || member.email?.split('@')[0]}</p>
                      {member.status === 'pending' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${
                    member.role === 'owner' 
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-muted-foreground'
                  }`}>
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                  {member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage Member</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Shield className="h-4 w-4 mr-2" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleRemoveMember(member.id)}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Team Settings</h2>
          </div>
          
          {!user?.email?.endsWith('@company.com') && (
            <Alert className="bg-blue-50/50 dark:bg-blue-950/50 border-blue-200/50 dark:border-blue-800/50">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-600 dark:text-blue-400">Enterprise Features</AlertTitle>
              <AlertDescription className="text-blue-600/90 dark:text-blue-400/90">
                Some team features are only available on enterprise plans. 
                <Button variant="link" className="px-1.5 py-0 h-auto text-blue-600 dark:text-blue-400" asChild>
                  <a href="/settings/billing">
                    Upgrade your plan
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="require-approval">Require Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require admin approval for new member invitations
                </p>
              </div>
              <Switch 
                id="require-approval"
                checked={settings.requireApproval}
                onCheckedChange={(checked) => handleUpdateSettings('requireApproval', checked)}
                disabled={loadingStates.settings}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-invites">Member Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Allow members to invite other members
                </p>
              </div>
              <Switch 
                id="allow-invites"
                checked={settings.allowMemberInvites}
                onCheckedChange={(checked) => handleUpdateSettings('allowMemberInvites', checked)}
                disabled={loadingStates.settings}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
} 