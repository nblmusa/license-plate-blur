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
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface Profile {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Preferences {
  emailNotifications: {
    newLogin: boolean
    usageAlerts: boolean
    newsletter: boolean
    marketing: boolean
  }
  autoProcessing: {
    autoMask: boolean
    autoDownload: boolean
    saveOriginal: boolean
    highQuality: boolean
  }
}

export default function SettingsPage() {
  const [loadingStates, setLoadingStates] = useState({
    profile: false,
    password: false,
    twoFactor: false,
    apiKey: false,
    accountDeletion: false,
    initialLoad: true
  })
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
  const [profile, setProfile] = useState<Profile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: {
      newLogin: true,
      usageAlerts: true,
      newsletter: false,
      marketing: false
    },
    autoProcessing: {
      autoMask: true,
      autoDownload: false,
      saveOriginal: true,
      highQuality: false
    }
  })
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const [showApiKey, setShowApiKey] = useState(true)
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isEnabling2FA, setIsEnabling2FA] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'account'
  const supabase = createClientComponentClient()
  
  const { 
    apiKey, 
    generateNewApiKey, 
    revokeApiKey, 
    copyApiKey
  } = useDashboard()

  const [localAlertState, setLocalAlertState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant: 'warning' | 'danger';
  } | null>(null)

  useEffect(() => {
    loadUserProfile()
  }, [])

  async function loadUserProfile() {
    try {
      setLoadingStates(prev => ({ ...prev, initialLoad: true }))
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load profile')
      }

      setProfile({
        firstName: data.profile.firstName,
        lastName: data.profile.lastName,
        email: data.profile.email,
        phone: data.profile.phone
      })

      setPreferences({
        emailNotifications: data.preferences.email_notifications || {
          newLogin: true,
          usageAlerts: true,
          newsletter: false,
          marketing: false
        },
        autoProcessing: data.preferences.auto_processing || {
          autoMask: true,
          autoDownload: false,
          saveOriginal: true,
          highQuality: false
        }
      })

      // Set 2FA status
      setIsTwoFactorEnabled(data.preferences.two_factor_enabled || false)
      
      // Reset 2FA setup state if it's already enabled
      if (data.preferences.two_factor_enabled) {
        setQrCodeUrl(null)
        setVerificationCode('')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, initialLoad: false }))
    }
  }

  async function handleProfileUpdate() {
    try {
      setLoadingStates(prev => ({ ...prev, profile: true }))
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
      setLoadingStates(prev => ({ ...prev, profile: false }))
    }
  }

  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    // Prevent multiple submissions while loading
    if (loadingStates.password) return
    
    const formData = new FormData(event.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    // Enhanced validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive"
      })
      return
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters long",
        variant: "destructive"
      })
      return
    }

    if (!/[A-Z]/.test(newPassword)) {
      toast({
        title: "Error",
        description: "New password must contain at least one uppercase letter",
        variant: "destructive"
      })
      return
    }

    if (!/[a-z]/.test(newPassword)) {
      toast({
        title: "Error",
        description: "New password must contain at least one lowercase letter",
        variant: "destructive"
      })
      return
    }

    if (!/[0-9]/.test(newPassword)) {
      toast({
        title: "Error",
        description: "New password must contain at least one number",
        variant: "destructive"
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      })
      return
    }

    try {
      // Set loading state at the start
      setLoadingStates(prev => ({ ...prev, password: true }))
      
      const response = await fetch('/api/settings/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      // Clear the form only on success
      event.currentTarget.reset()
      
      toast({
        title: "Success",
        description: "Password updated successfully",
      })
    } catch (error) {
      console.error('Error updating password:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update password",
        variant: "destructive"
      })
    } finally {
      // Reset loading state at the end
      setLoadingStates(prev => ({ ...prev, password: false }))
    }
  }

  async function handleAccountDeletion() {
    try {
      setLoadingStates(prev => ({ ...prev, accountDeletion: true }))
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
      setLoadingStates(prev => ({ ...prev, accountDeletion: false }))
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

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      })
      router.push('/')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    }
  }

  async function handleEnable2FA() {
    // Prevent multiple submissions
    if (loadingStates.twoFactor || isEnabling2FA) return
    
    try {
      setLoadingStates(prev => ({ ...prev, twoFactor: true }))
      setIsEnabling2FA(true)
      
      const response = await fetch('/api/settings/2fa/setup', {
        method: 'POST',
      })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup 2FA')
      }
      
      setQrCodeUrl(data.qrCodeUrl)
    } catch (error) {
      console.error('Error setting up 2FA:', error)
      toast({
        title: "Error",
        description: "Failed to setup two-factor authentication",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, twoFactor: false }))
      setIsEnabling2FA(false)
    }
  }

  async function handleVerify2FA() {
    // Prevent multiple submissions
    if (loadingStates.twoFactor) return
    
    try {
      setLoadingStates(prev => ({ ...prev, twoFactor: true }))
      
      const response = await fetch('/api/settings/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode })
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify 2FA')
      }

      setIsTwoFactorEnabled(true)
      setQrCodeUrl(null)
      setVerificationCode('')
      
      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully",
      })
    } catch (error) {
      console.error('Error verifying 2FA:', error)
      toast({
        title: "Error",
        description: "Failed to verify two-factor authentication",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, twoFactor: false }))
    }
  }

  async function handleDisable2FA() {
    // Prevent opening multiple dialogs
    if (loadingStates.twoFactor) return
    
    setLocalAlertState({
      isOpen: true,
      title: "Disable Two-Factor Authentication",
      description: "Warning: This will remove an important security feature from your account. Are you sure you want to disable two-factor authentication?",
      variant: "danger",
      onConfirm: async () => {
        try {
          setLoadingStates(prev => ({ ...prev, twoFactor: true }))
          
          const response = await fetch('/api/settings/2fa/disable', {
            method: 'POST'
          })
          
          const data = await response.json()
          if (!response.ok) {
            throw new Error(data.error || 'Failed to disable 2FA')
          }

          setIsTwoFactorEnabled(false)
          toast({
            title: "Success",
            description: "Two-factor authentication disabled successfully",
          })
        } catch (error) {
          console.error('Error disabling 2FA:', error)
          toast({
            title: "Error",
            description: "Failed to disable two-factor authentication",
            variant: "destructive"
          })
        } finally {
          setLoadingStates(prev => ({ ...prev, twoFactor: false }))
          setLocalAlertState(null)
        }
      }
    })
  }

  function handleEmailNotificationChange(key: keyof Preferences['emailNotifications']) {
    setPreferences((prev) => ({
      ...prev,
      emailNotifications: {
        ...prev.emailNotifications,
        [key]: !prev.emailNotifications[key]
      }
    }))
  }

  function handleAutoProcessingChange(key: keyof Preferences['autoProcessing']) {
    setPreferences((prev) => ({
      ...prev,
      autoProcessing: {
        ...prev.autoProcessing,
        [key]: !prev.autoProcessing[key]
      }
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {loadingStates.initialLoad ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <Settings className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="relative space-y-6">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4">
              <TabsList className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-lg bg-muted p-1 h-auto">
                <TabsTrigger 
                  value="account"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2 h-auto py-2.5 px-3 transition-all duration-200"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Account</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2 h-auto py-2.5 px-3 transition-all duration-200"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2 h-auto py-2.5 px-3 transition-all duration-200"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">Security</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="team" 
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex items-center gap-2 h-auto py-2.5 px-3 transition-all duration-200"
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </TabsTrigger>
              </TabsList>
            </div>

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
                        disabled={loadingStates.profile}
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
                    disabled={loadingStates.profile}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleProfileUpdate}
                    disabled={loadingStates.profile}
                  >
                    {loadingStates.profile ? (
                      <>
                        <Settings className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : "Save Changes"}
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
                      disabled={loadingStates.accountDeletion}
                    >
                      {loadingStates.accountDeletion ? (
                        <>
                          <Settings className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </>
                      )}
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
                      onCheckedChange={(checked) => handleEmailNotificationChange('newLogin')}
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
                      onCheckedChange={(checked) => handleEmailNotificationChange('usageAlerts')}
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
                      onCheckedChange={(checked) => handleEmailNotificationChange('newsletter')}
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
                      onCheckedChange={(checked) => handleEmailNotificationChange('marketing')}
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
                      <Input 
                        id="currentPassword" 
                        name="currentPassword" 
                        type="password"
                        required
                        minLength={8}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New password</Label>
                      <Input 
                        id="newPassword" 
                        name="newPassword" 
                        type="password"
                        required
                        minLength={8}
                        pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$"
                        title="Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
                      />
                      <p className="text-sm text-muted-foreground">
                        Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm new password</Label>
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword" 
                        type="password"
                        required
                        minLength={8}
                      />
                    </div>
                    <Button type="submit" disabled={loadingStates.password}>
                      {loadingStates.password ? (
                        <>
                          <Settings className="mr-2 h-4 w-4 animate-spin" />
                          Updating Password...
                        </>
                      ) : "Update Password"}
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
                      {isTwoFactorEnabled ? (
                        <Button 
                          variant="destructive" 
                          onClick={handleDisable2FA}
                          disabled={loadingStates.twoFactor}
                        >
                          Disable
                        </Button>
                      ) : (
                        <Button 
                          variant="outline"
                          onClick={handleEnable2FA}
                          disabled={loadingStates.twoFactor || isEnabling2FA}
                        >
                          {isEnabling2FA ? "Setting up..." : "Enable"}
                        </Button>
                      )}
                    </div>

                    {qrCodeUrl && (
                      <div className="space-y-4 p-4 bg-muted rounded-lg">
                        <div className="space-y-2">
                          <p className="font-medium">Scan QR Code</p>
                          <p className="text-sm text-muted-foreground">
                            Scan this QR code with your authenticator app
                          </p>
                          <div className="flex justify-center p-4 bg-white rounded-lg">
                            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="verificationCode">Verification Code</Label>
                          <div className="flex gap-2">
                            <Input
                              id="verificationCode"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="Enter 6-digit code"
                              maxLength={6}
                            />
                            <Button 
                              onClick={handleVerify2FA}
                              disabled={verificationCode.length !== 6 || loadingStates.twoFactor}
                            >
                              {loadingStates.twoFactor ? "Verifying..." : "Verify"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
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
                          disabled={loadingStates.apiKey}
                        >
                          <KeyRound className="h-4 w-4 mr-2" />
                          {loadingStates.apiKey ? "Generating..." : "Generate Key"}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={handleRevokeApiKey}
                          disabled={loadingStates.apiKey}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {loadingStates.apiKey ? "Revoking..." : "Revoke Key"}
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
                                disabled={loadingStates.apiKey}
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
                                disabled={loadingStates.apiKey || !showApiKey}
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
                              curl -X POST https://api.maskingtech.com/process-image \<br />
                              &nbsp;&nbsp;-H &quot;Authorization: Bearer {showApiKey ? apiKey : '•'.repeat(40)}&quot; \<br />
                              &nbsp;&nbsp;-F &quot;image=@photo.jpg&quot;
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
                      <Button variant="outline" size="sm" onClick={handleSignOut}>
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
      )}
      {localAlertState && (
        <CustomAlertDialog
          isOpen={localAlertState.isOpen}
          onClose={() => setLocalAlertState(null)}
          onConfirm={localAlertState.onConfirm}
          title={localAlertState.title}
          description={localAlertState.description}
          variant={localAlertState.variant}
          confirmText="Disable 2FA"
          cancelText="Cancel"
        />
      )}
    </div>
  )
} 