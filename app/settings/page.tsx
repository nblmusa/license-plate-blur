"use client"

import { useSettings } from "@/contexts/settings-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Bell, 
  Shield, 
  Users, 
  Mail, 
  Lock,
  Smartphone,
  CreditCard,
  LogOut,
  Trash2,
  KeyRound,
  AlertCircle,
  ImageIcon,
  Upload,
  Download,
  Settings,
  ChevronRight
} from "lucide-react"
import { useState, useEffect } from "react"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { CustomAlertDialog } from "@/components/alert-dialog"
import { useDashboard } from "@/hooks/use-dashboard"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState({
    newLogin: true,
    usageAlerts: true,
    newsletter: false,
    marketing: false
  })
  const [autoProcessing, setAutoProcessing] = useState({
    autoMask: true,
    autoDownload: false,
    saveOriginal: true,
    highQuality: false
  })
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const [showApiKey, setShowApiKey] = useState(true)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'account'
  
  const { 
    apiKey, 
    generateNewApiKey, 
    revokeApiKey, 
    copyApiKey,
    alertState,
    closeAlert
  } = useDashboard()

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load user settings')
      }

      setProfile({
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        email: data.profile.email,
        phone: data.profile.phone || ''
      })

      setEmailNotifications(data.preferences.email_notifications)
      setAutoProcessing(data.preferences.auto_processing)
      setUser(data.profile)
    } catch (error) {
      console.error('Error loading user profile:', error)
      toast({
        title: "Error",
        description: "Failed to load user settings",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleProfileUpdate() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile,
          preferences: {
            email_notifications: emailNotifications,
            auto_processing: autoProcessing
          }
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings')
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      })
      
      // Clear the form
      event.currentTarget.reset()
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAccountDeletion() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/settings/account', {
        method: 'DELETE'
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account')
      }

      router.push('/')
      toast({
        title: "Success",
        description: "Your account has been deleted",
      })
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGenerateApiKey() {
    if (isGeneratingKey) return
    
    try {
      setIsGeneratingKey(true)
      await generateNewApiKey()
      setShowApiKey(true)
    } catch (error) {
      console.error('Error generating API key:', error)
      toast({
        title: "Error",
        description: "Failed to generate API key",
        variant: "destructive"
      })
    } finally {
      setIsGeneratingKey(false)
    }
  }

  async function handleCopyApiKey() {
    await copyApiKey()
  }

  async function handleRevokeApiKey() {
    if (isGeneratingKey) return
    
    try {
      setIsGeneratingKey(true)
      await revokeApiKey()
      setShowApiKey(false)
    } finally {
      setIsGeneratingKey(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 gap-4 bg-transparent h-auto p-0">
            <TabsTrigger 
              value="account"
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 h-auto p-3"
            >
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 h-auto p-3"
            >
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 h-auto p-3"
            >
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary flex items-center gap-2 h-auto p-3"
            >
              <Users className="h-4 w-4" />
              Team
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input 
                      id="firstName" 
                      value={profile.firstName}
                      onChange={(e) => setProfile(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input 
                      id="lastName" 
                      value={profile.lastName}
                      onChange={(e) => setProfile(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={profile.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1 (555) 000-0000" 
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Processing Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic License Plate Masking</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically mask license plates when uploading images
                      </p>
                    </div>
                    <Switch 
                      checked={autoProcessing?.autoMask}
                      onCheckedChange={(checked) => setAutoProcessing(prev => ({ ...prev, autoMask: checked }))}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-Download</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically download processed images
                      </p>
                    </div>
                    <Switch 
                      checked={autoProcessing?.autoDownload}
                      onCheckedChange={(checked) => setAutoProcessing(prev => ({ ...prev, autoDownload: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Save Original Images</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep original images in your account
                      </p>
                    </div>
                    <Switch 
                      checked={autoProcessing?.saveOriginal}
                      onCheckedChange={(checked) => setAutoProcessing(prev => ({ ...prev, saveOriginal: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>High Quality Processing</Label>
                      <p className="text-sm text-muted-foreground">
                        Use higher quality settings for better results
                      </p>
                    </div>
                    <Switch 
                      checked={autoProcessing?.highQuality}
                      onCheckedChange={(checked) => setAutoProcessing(prev => ({ ...prev, highQuality: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => loadUserProfile()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleProfileUpdate}
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-destructive/50">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={handleAccountDeletion}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-6">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new login attempts
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications?.newLogin}
                    onCheckedChange={(checked) => setEmailNotifications(prev => ({ ...prev, newLogin: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when approaching usage limits
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications?.usageAlerts}
                    onCheckedChange={(checked) => setEmailNotifications(prev => ({ ...prev, usageAlerts: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Newsletter</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive our monthly newsletter
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications?.newsletter}
                    onCheckedChange={(checked) => setEmailNotifications(prev => ({ ...prev, newsletter: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive marketing communications
                    </p>
                  </div>
                  <Switch 
                    checked={emailNotifications?.marketing}
                    onCheckedChange={(checked) => setEmailNotifications(prev => ({ ...prev, marketing: checked }))}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Password</h3>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current password</Label>
                    <Input id="currentPassword" name="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New password</Label>
                    <Input id="newPassword" name="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input id="confirmPassword" name="confirmPassword" type="password" />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline">Enable</Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">API Access</p>
                      <p className="text-sm text-muted-foreground">
                        Manage your API keys for programmatic access
                      </p>
                    </div>
                    {!apiKey ? (
                      <Button
                        onClick={handleGenerateApiKey}
                        disabled={isGeneratingKey}
                      >
                        <KeyRound className="h-4 w-4 mr-2" />
                        {isGeneratingKey ? "Generating..." : "Generate Key"}
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        onClick={handleRevokeApiKey}
                        disabled={isGeneratingKey}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isGeneratingKey ? "Revoking..." : "Revoke Key"}
                      </Button>
                    )}
                  </div>

                  {apiKey && (
                    <>
                      <div className="p-4 bg-muted rounded-lg">
                        <div className="flex items-center justify-between">
                          <code className="text-sm font-mono break-all">
                            {showApiKey ? apiKey : '•'.repeat(40)}
                          </code>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowApiKey(!showApiKey)}
                              disabled={isGeneratingKey}
                            >
                              {showApiKey ? (
                                <AlertCircle className="h-4 w-4 mr-2" />
                              ) : (
                                <KeyRound className="h-4 w-4 mr-2" />
                              )}
                              {showApiKey ? "Hide" : "Show"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleCopyApiKey}
                              disabled={isGeneratingKey || !showApiKey}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Example Usage</Label>
                        <div className="p-4 bg-muted rounded-lg">
                          <code className="text-sm font-mono break-all">
                            curl -X POST https://api.plateguard.com/v1/process \<br />
                            &nbsp;&nbsp;-H "Authorization: Bearer {showApiKey ? apiKey : '•'.repeat(40)}" \<br />
                            &nbsp;&nbsp;-F "image=@photo.jpg"
                          </code>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Smartphone className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Last active: Just now
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Team Settings */}
          <TabsContent value="team" className="space-y-6">
            <Card className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <Button>
                    <Users className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    { name: user?.user_metadata?.full_name || user?.email, email: user?.email, role: "Owner" }
                  ].map((member, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {member.name 
                              ? member.name.split(" ").map((n: string) => n[0]).join("")
                              : member.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{member.role}</span>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Team Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require Approval</Label>
                      <p className="text-sm text-muted-foreground">
                        Require admin approval for new member invitations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Member Permissions</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow members to invite other members
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      {alertState && (
        <CustomAlertDialog
          isOpen={alertState.isOpen}
          onClose={closeAlert}
          onConfirm={alertState.onConfirm}
          title={alertState.title}
          description={alertState.description}
          variant={alertState.variant}
        />
      )}
    </div>
  )
} 