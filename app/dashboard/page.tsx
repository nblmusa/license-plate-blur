"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  BarChart3, 
  Image as ImageIcon, 
  Upload, 
  Settings, 
  CreditCard,
  History,
  Car,
  Shield,
  Gauge,
  Lock,
  ArrowRight,
  Sparkles,
  Users,
  Key,
  Bell,
  Copy,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronRight,
  Zap,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { useDashboard } from "@/hooks/use-dashboard"
import { formatDistanceToNow } from 'date-fns'
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const {
    isLoading,
    stats,
    recentActivity,
    apiKey,
    isAuthenticated,
    user,
    generateNewApiKey,
    copyApiKey,
    refreshData
  } = useDashboard()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const subscription = searchParams.get('subscription');
    const returnTo = searchParams.get('returnTo');

    // Handle subscription status
    if (subscription === 'success') {
      toast({
        title: "Success",
        description: "Your subscription has been updated successfully.",
      });
    } else if (subscription === 'cancelled') {
      toast({
        description: "Subscription process was cancelled.",
      });
    }

    // Clean up URL parameters
    if (subscription || returnTo) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('subscription');
      newUrl.searchParams.delete('returnTo');
      window.history.replaceState({}, '', newUrl.toString());
    }

    // Handle return URL if present
    if (returnTo) {
      try {
        const returnUrl = new URL(returnTo);
        // Only allow redirects to our own domain
        if (returnUrl.origin === window.location.origin) {
          router.push(returnUrl.pathname + returnUrl.search);
        }
      } catch (error) {
        console.error('Invalid return URL:', error);
      }
    }
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-4 mb-8">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-1 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <div className="p-6 border-b">
                <Skeleton className="h-6 w-32" />
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              </div>
            </Card>

            <div className="space-y-8">
              <Card>
                <div className="p-6 border-b">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="p-6">
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              </Card>

              <Card>
                <div className="p-6 border-b">
                  <Skeleton className="h-6 w-32" />
                </div>
                <div className="divide-y">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-6">
                      <div className="flex justify-between items-center">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Card className="max-w-md mx-auto p-6">
          <div className="text-center space-y-4">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Authentication Required</h2>
            <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const usagePercentage = (stats.imagesProcessed / stats.monthlyQuota) * 100
  const isNearLimit = usagePercentage >= 80

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your license plate masking and view your usage
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2" onClick={refreshData}>
              <Loader2 className="h-4 w-4" />
              Refresh
            </Button>
            <Button size="sm" className="gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700" asChild>
              <Link href="/upload">
                <Upload className="h-4 w-4" />
                Upload Image
              </Link>
            </Button>
          </div>
        </div>

        {/* Usage Alert */}
        {isNearLimit && (
          <Alert className="bg-yellow-50/50 dark:bg-yellow-950/50 border-yellow-200/50 dark:border-yellow-800/50">
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-600 dark:text-yellow-400">Usage Limit Approaching</AlertTitle>
            <AlertDescription className="text-yellow-600/90 dark:text-yellow-400/90">
              You have used {Math.round(usagePercentage)}% of your monthly image processing limit. Consider upgrading to our Pro plan for unlimited processing.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-1 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <ImageIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Images Processed</p>
                    <h3 className="text-2xl font-bold">{stats.imagesProcessed}</h3>
                  </div>
                </div>
                <Progress value={usagePercentage} className="h-1" />
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.monthlyQuota - stats.imagesProcessed} images remaining this month
                </p>
              </>
            )}
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-1 w-full" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Gauge className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Monthly Usage</p>
                    <h3 className="text-2xl font-bold">{Math.round(usagePercentage)}%</h3>
                  </div>
                </div>
                <Progress value={usagePercentage} className="h-1" />
                <p className="text-xs text-muted-foreground mt-2">Reset in {new Date().getDate()} days</p>
              </>
            )}
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">License Plates Detected</p>
                    <h3 className="text-2xl font-bold">{stats.detectedPlates}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Car className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">Total plates detected and masked</span>
                </div>
              </>
            )}
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <History className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">Last Upload</p>
                    <h3 className="text-2xl font-bold">
                      {stats.lastUploadTime ? formatDistanceToNow(new Date(stats.lastUploadTime), { addSuffix: true }) : 'Never'}
                    </h3>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs text-muted-foreground">Process more images</span>
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            <div className="p-6 border-b border-blue-100/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/50 dark:to-indigo-900/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm" className="gap-2" onClick={refreshData}>
                  Refresh
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {recentActivity.map((item) => (
                    <div key={item.id} className="aspect-square rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer relative group overflow-hidden">
                      {item.thumbnailUrl ? (
                        <>
                          <Image
                            src={item.processedUrl || item.thumbnailUrl}
                            alt={item.filename}
                            fill
                            className="object-cover group-hover:opacity-0 transition-opacity"
                          />
                          <Image
                            src={item.thumbnailUrl}
                            alt={`Original ${item.filename}`}
                            fill
                            className="object-cover opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                        <p className="text-xs text-white truncate">{item.filename}</p>
                        <p className="text-xs text-white/70">
                          {formatDistanceToNow(new Date(item.processedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* API Access */}
          <div className="space-y-8">
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
              <div className="p-6 border-b border-blue-100/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/50 dark:to-indigo-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">API Key</h2>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/settings?tab=security">
                      <Settings className="h-4 w-4 mr-2" />
                      Manage Keys
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {isLoading ? (
                  <Skeleton className="h-12 rounded-lg" />
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 font-mono text-sm truncate">
                        {apiKey ? (showApiKey ? apiKey : '•'.repeat(40)) : 'No API key generated'}
                      </div>
                      {apiKey && (
                        <>
                          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowApiKey(!showApiKey)}>
                            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2" onClick={copyApiKey}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* Account Overview */}
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
              <div className="p-6 border-b border-blue-100/30 dark:border-blue-800/30 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/50 dark:to-indigo-900/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Account Overview</h2>
                  </div>
                </div>
              </div>
              <div className="divide-y">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Free Plan</p>
                      <p className="text-sm text-muted-foreground">{stats.monthlyQuota} images per month</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link href="/pricing">
                        <Sparkles className="h-4 w-4" />
                        Upgrade
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Billing & Usage</p>
                      <p className="text-sm text-muted-foreground">View invoices and manage subscription</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link href="/billing">
                        <CreditCard className="h-4 w-4" />
                        View Billing
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">API Access</p>
                      <p className="text-sm text-muted-foreground">View your API keys and usage</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <Link href="/docs">
                        <Lock className="h-4 w-4" />
                        View Docs
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="font-medium">Team Members</p>
                      <p className="text-sm text-muted-foreground">Manage team access</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Users className="h-4 w-4" />
                      Invite
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}