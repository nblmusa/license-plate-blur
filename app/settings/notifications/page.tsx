"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailNotifications {
  newLogin: boolean
  usageAlerts: boolean
  newsletter: boolean
  marketing: boolean
}

export default function NotificationsPage() {
  const [loadingStates, setLoadingStates] = useState({
    notifications: false,
    initialLoad: true
  })
  const [emailNotifications, setEmailNotifications] = useState<EmailNotifications>({
    newLogin: true,
    usageAlerts: true,
    newsletter: false,
    marketing: false
  })
  const { toast } = useToast()

  useEffect(() => {
    loadNotificationSettings()
  }, [])

  async function loadNotificationSettings() {
    try {
      setLoadingStates(prev => ({ ...prev, initialLoad: true }))
      const response = await fetch('/api/settings')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load notification settings')
      }

      setEmailNotifications(data.preferences.email_notifications || {
        newLogin: true,
        usageAlerts: true,
        newsletter: false,
        marketing: false
      })
    } catch (error) {
      console.error('Error loading notification settings:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load notification settings",
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, initialLoad: false }))
    }
  }

  async function handleNotificationChange(key: keyof EmailNotifications) {
    try {
      setLoadingStates(prev => ({ ...prev, notifications: true }))
      const newSettings = {
        ...emailNotifications,
        [key]: !emailNotifications[key]
      }

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: {
            email_notifications: newSettings
          }
        })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update notification settings')
      }

      setEmailNotifications(newSettings)
      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      })
    } catch (error) {
      console.error('Error updating notification settings:', error)
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, notifications: false }))
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
              checked={emailNotifications.newLogin}
              onCheckedChange={() => handleNotificationChange('newLogin')}
              disabled={loadingStates.notifications}
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
              checked={emailNotifications.usageAlerts}
              onCheckedChange={() => handleNotificationChange('usageAlerts')}
              disabled={loadingStates.notifications}
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
              checked={emailNotifications.newsletter}
              onCheckedChange={() => handleNotificationChange('newsletter')}
              disabled={loadingStates.notifications}
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
              checked={emailNotifications.marketing}
              onCheckedChange={() => handleNotificationChange('marketing')}
              disabled={loadingStates.notifications}
            />
          </div>
        </div>
      </Card>
    </div>
  )
} 