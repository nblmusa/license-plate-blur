import { useState, useEffect, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'

export interface DashboardStats {
  imagesProcessed: number
  monthlyQuota: number
  lastUploadTime: string | null
  detectedPlates: number
}

export interface RecentActivity {
  id: string
  filename: string
  processedAt: string
  licensePlatesDetected: number
  thumbnailUrl: string
  processedUrl: string
}

interface ProcessedImage {
  id: string
  filename: string
  processed_at: string
  license_plates_detected: number
  thumbnail_url: string
  processed_url: string
}

interface User {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    avatar_url?: string
  }
}

interface AlertState {
  isOpen: boolean
  title: string
  description: string
  onConfirm: () => void
  variant?: 'warning' | 'danger'
}

export function useDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    imagesProcessed: 0,
    monthlyQuota: 100,
    lastUploadTime: null,
    detectedPlates: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [alertState, setAlertState] = useState<AlertState | null>(null)
  const { toast } = useToast()

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard data')
      }

      setStats({
        imagesProcessed: data.stats?.images_processed || 0,
        monthlyQuota: data.stats?.monthly_quota || 100,
        lastUploadTime: data.stats?.last_upload_time,
        detectedPlates: data.stats?.detected_plates || 0
      })

      setRecentActivity((data.recentActivity || []).map((item: ProcessedImage): RecentActivity => ({
        id: item.id,
        filename: item.filename,
        processedAt: item.processed_at,
        licensePlatesDetected: item.license_plates_detected,
        thumbnailUrl: item.thumbnail_url,
        processedUrl: item.processed_url
      })))

      if (data.apiKey) {
        setApiKey(data.apiKey.key)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for session cookies
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setIsAuthenticated(false)
          setUser(null)
          return
        }
        throw new Error('Failed to check authentication')
      }

      const data = await response.json()
      const session = data.session

      setIsAuthenticated(!!session)
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata
        })
        fetchDashboardData()
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth error:', error)
      toast({
        title: "Authentication Error",
        description: "Failed to verify authentication status",
        variant: "destructive"
      })
      setIsAuthenticated(false)
      setUser(null)
    }
  }, [fetchDashboardData, toast])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const generateNewApiKey = async () => {
    return new Promise((resolve, reject) => {
      setAlertState({
        isOpen: true,
        title: "Generate New API Key",
        description: "Warning: Generating a new API key will invalidate your existing key. Any applications or scripts using the current key will stop working. Are you sure you want to continue?",
        variant: "warning",
        onConfirm: async () => {
          try {
            const response = await fetch('/api/dashboard/api-key', {
              method: 'POST'
            })
            
            const data = await response.json()
            if (!response.ok) {
              throw new Error(data.error || 'Failed to generate API key')
            }

            setApiKey(data.apiKey.key)
            toast({
              title: "Success",
              description: "New API key generated successfully. Make sure to copy it now - you won't be able to see it again."
            })
            setAlertState(null)
            resolve(data.apiKey.key)
          } catch (error) {
            console.error('Error generating API key:', error)
            toast({
              title: "Error",
              description: "Failed to generate new API key",
              variant: "destructive"
            })
            setAlertState(null)
            reject(error)
          }
        }
      })
    })
  }

  const revokeApiKey = async () => {
    return new Promise((resolve, reject) => {
      setAlertState({
        isOpen: true,
        title: "Revoke API Key",
        description: "Warning: This will permanently revoke your API key. Any applications or scripts using this key will stop working immediately. Are you sure you want to continue?",
        variant: "danger",
        onConfirm: async () => {
          try {
            const response = await fetch('/api/dashboard/api-key', {
              method: 'DELETE'
            })
            
            if (!response.ok) {
              const data = await response.json()
              throw new Error(data.error || 'Failed to revoke API key')
            }

            setApiKey(null)
            toast({
              title: "Success",
              description: "API key has been revoked successfully"
            })
            setAlertState(null)
            resolve(true)
          } catch (error) {
            console.error('Error revoking API key:', error)
            toast({
              title: "Error",
              description: "Failed to revoke API key",
              variant: "destructive"
            })
            setAlertState(null)
            reject(error)
          }
        }
      })
    })
  }

  const closeAlert = () => {
    setAlertState(null)
  }

  const copyApiKey = async () => {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey)
      toast({
        title: "Success",
        description: "API key copied to clipboard"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy API key",
        variant: "destructive"
      })
    }
  }

  return {
    isLoading,
    stats,
    recentActivity,
    apiKey,
    isAuthenticated,
    user,
    generateNewApiKey,
    revokeApiKey,
    copyApiKey,
    refreshData: fetchDashboardData,
    alertState,
    closeAlert
  }
} 