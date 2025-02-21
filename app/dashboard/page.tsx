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
  Zap
} from "lucide-react"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useState } from "react"

export default function DashboardPage() {
  const [showApiKey, setShowApiKey] = useState(false)
  const demoApiKey = "pk_test_51QuXNUPcpoWva5n6..."

  const copyApiKey = () => {
    navigator.clipboard.writeText(demoApiKey)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-primary/5">
              <Car className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Welcome back!</span>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your license plate masking and view your usage
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
            <Button size="sm" className="gap-2" asChild>
              <Link href="/upload">
                <Upload className="h-4 w-4" />
                Upload Image
              </Link>
            </Button>
          </div>
        </div>

        {/* Usage Alert */}
        <Alert className="bg-yellow-50/50 dark:bg-yellow-950/50 border-yellow-200/50 dark:border-yellow-800/50">
          <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-600 dark:text-yellow-400">Usage Limit Approaching</AlertTitle>
          <AlertDescription className="text-yellow-600/90 dark:text-yellow-400/90">
            You have used 80% of your monthly image processing limit. Consider upgrading to our Pro plan for unlimited processing.
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30 cursor-pointer group">
            <Link href="/upload" className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Upload className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Upload Image</p>
                <p className="text-sm text-muted-foreground">Process new images</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30 cursor-pointer group">
            <Link href="/docs" className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Key className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">API Access</p>
                <p className="text-sm text-muted-foreground">View documentation</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30 cursor-pointer group">
            <Link href="/pricing" className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Upgrade Plan</p>
                <p className="text-sm text-muted-foreground">Get more features</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
          <Card className="p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30 cursor-pointer group">
            <Link href="/settings" className="flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Team Access</p>
                <p className="text-sm text-muted-foreground">Manage members</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <ImageIcon className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Images Processed</p>
                <h3 className="text-2xl font-bold">80</h3>
              </div>
            </div>
            <Progress value={80} className="h-1" />
            <p className="text-xs text-muted-foreground mt-2">20 images remaining this month</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Gauge className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Monthly Usage</p>
                <h3 className="text-2xl font-bold">80%</h3>
              </div>
            </div>
            <Progress value={80} className="h-1" />
            <p className="text-xs text-muted-foreground mt-2">Reset in 7 days</p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Current Plan</p>
                <h3 className="text-2xl font-bold">Free</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Upgrade for more features</span>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <History className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Last Upload</p>
                <h3 className="text-2xl font-bold">2h ago</h3>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <Upload className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs text-muted-foreground">Process more images</span>
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            <div className="p-6 border-b bg-muted/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Recent Activity</h2>
                </div>
                <Button variant="ghost" size="sm" className="gap-2">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="aspect-square rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer relative group overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                      <p className="text-xs text-white">car_{i}.jpg</p>
                      <p className="text-xs text-white/70">2 hours ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* API Access */}
          <div className="space-y-8">
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
              <div className="p-6 border-b bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">API Key</h2>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 font-mono text-sm truncate">
                    {showApiKey ? demoApiKey : '•'.repeat(20)}
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2" onClick={copyApiKey}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Use this key to authenticate your API requests. Keep it secure and never share it publicly.
                </p>
              </div>
            </Card>

            {/* Account Overview */}
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
              <div className="p-6 border-b bg-muted/50">
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
                      <p className="text-sm text-muted-foreground">100 images per month</p>
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