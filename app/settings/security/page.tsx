"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  Settings, 
  KeyRound, 
  AlertCircle, 
  Smartphone,
  LogOut,
  Trash2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useDashboard } from "@/hooks/use-dashboard"

export default function SecurityPage() {
  const [loadingStates, setLoadingStates] = useState({
    password: false,
    twoFactor: false,
    apiKey: false,
    initialLoad: true
  })
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [isEnabling2FA, setIsEnabling2FA] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isGeneratingKey, setIsGeneratingKey] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { apiKey, generateNewApiKey, revokeApiKey, copyApiKey } = useDashboard()

  useEffect(() => {
    loadSecuritySettings()
  }, [])

  async function loadSecuritySettings() {
    try {
      setLoadingStates(prev => ({ ...prev, initialLoad: true }))
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load security settings')
      }

      setIsTwoFactorEnabled(data.preferences.two_factor_enabled || false)
      
      if (data.preferences.two_factor_enabled) {
        setQrCodeUrl(null)
        setVerificationCode('')
      }
    } catch (error) {
      console.error('Error loading security settings:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load security settings",
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, initialLoad: false }))
    }
  }

  async function handlePasswordUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    
    if (loadingStates.password) return
    
    const formData = new FormData(event.currentTarget)
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

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
      setLoadingStates(prev => ({ ...prev, password: false }))
    }
  }

  async function handleEnable2FA() {
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
    if (loadingStates.twoFactor) return
    
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

  if (loadingStates.initialLoad) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <Settings className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
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
                        <KeyRound className="h-4 w-4 mr-2" />
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
    </div>
  )
} 