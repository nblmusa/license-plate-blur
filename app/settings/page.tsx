"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Settings, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CustomAlertDialog } from "@/components/alert-dialog"
import { useRouter } from "next/navigation"

interface Profile {
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface AutoProcessing {
  autoMask: boolean
  autoDownload: boolean
  saveOriginal: boolean
  highQuality: boolean
}

export default function AccountSettingsPage() {
  const [loadingStates, setLoadingStates] = useState({
    profile: false,
    accountDeletion: false,
    initialLoad: true
  })
  const [profile, setProfile] = useState<Profile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [autoProcessing, setAutoProcessing] = useState<AutoProcessing>({
    autoMask: true,
    autoDownload: false,
    saveOriginal: true,
    highQuality: false
  })
  const { toast } = useToast()
  const router = useRouter()

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

      setAutoProcessing(data.preferences.auto_processing || {
        autoMask: true,
        autoDownload: false,
        saveOriginal: true,
        highQuality: false
      })
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
                checked={autoProcessing.autoMask}
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
                checked={autoProcessing.autoDownload}
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
                checked={autoProcessing.saveOriginal}
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
                checked={autoProcessing.highQuality}
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
    </div>
  )
} 