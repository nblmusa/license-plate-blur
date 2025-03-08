"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertCircle, 
  Settings, 
  ExternalLink, 
  Check, 
  Zap, 
  BarChart, 
  Receipt, 
  Download,
  History,
  RefreshCw,
  CreditCard
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { PLANS, getNextPlan } from "@/lib/stripe"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

interface UsageHistory {
  month: string
  imagesProcessed: number
}

interface Invoice {
  id: string
  stripe_invoice_id: string
  amount_due: number
  amount_paid: number
  status: string
  invoice_pdf: string
  created_at: string
}

interface Subscription {
  tier: string
  status: string
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  usage: {
    imagesProcessed: number
    periodStart: string
    periodEnd: string
    daysLeft: number
  }
  usageHistory: UsageHistory[]
}

export default function BillingPage() {
  const [loadingStates, setLoadingStates] = useState({
    billing: false,
    portal: false,
    initialLoad: true,
    refreshingInvoices: false,
    error: false
  })
  const [subscription, setSubscription] = useState<Subscription>({
    tier: 'free',
    status: 'active',
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
    usage: {
      imagesProcessed: 0,
      periodStart: new Date().toISOString(),
      periodEnd: new Date().toISOString(),
      daysLeft: 30
    },
    usageHistory: []
  })
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadSubscription()
    loadInvoices()
  }, [])

  async function loadSubscription() {
    try {
      setLoadingStates(prev => ({ ...prev, initialLoad: true, error: false }))
      const response = await fetch('/api/billing/subscription')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load subscription')
      }

      setSubscription({
        tier: data.tier || 'free',
        status: data.status || 'active',
        currentPeriodEnd: data.currentPeriodEnd || null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
        usage: {
          imagesProcessed: data.usage?.imagesProcessed || 0,
          periodStart: data.usage?.periodStart || new Date().toISOString(),
          periodEnd: data.usage?.periodEnd || new Date().toISOString(),
          daysLeft: data.usage?.daysLeft || 30
        },
        usageHistory: data.usageHistory || []
      })
    } catch (error) {
      console.error('Error loading subscription:', error)
      setLoadingStates(prev => ({ ...prev, error: true }))
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load subscription",
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, initialLoad: false }))
    }
  }

  async function loadInvoices() {
    try {
      setLoadingStates(prev => ({ ...prev, refreshingInvoices: true }))
      const response = await fetch('/api/billing/invoices')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load invoices')
      }

      setInvoices(data.invoices || [])
    } catch (error) {
      console.error('Error loading invoices:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load invoices",
        variant: "destructive",
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, refreshingInvoices: false }))
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function formatAmount(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  async function handleUpgradeSubscription(planId: string) {
    try {
      setLoadingStates(prev => ({ ...prev, billing: true }))
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      window.location.href = data.url
    } catch (error) {
      console.error('Error starting upgrade:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start upgrade process",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, billing: false }))
    }
  }

  async function handleCancelSubscription() {
    try {
      setLoadingStates(prev => ({ ...prev, billing: true }))
      const response = await fetch('/api/billing/cancel', {
        method: 'POST'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: true
      }))

      toast({
        title: "Success",
        description: "Your subscription will be canceled at the end of the billing period"
      })
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to cancel subscription",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, billing: false }))
    }
  }

  async function handleResumeSubscription() {
    try {
      setLoadingStates(prev => ({ ...prev, billing: true }))
      const response = await fetch('/api/billing/resume', {
        method: 'POST'
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)

      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: false
      }))

      toast({
        title: "Success",
        description: "Your subscription has been resumed"
      })
    } catch (error) {
      console.error('Error resuming subscription:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resume subscription",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, billing: false }))
    }
  }

  async function handleManageBilling() {
    try {
      setLoadingStates(prev => ({ ...prev, portal: true }))
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      
      if (!data.url) {
        throw new Error('No portal URL received')
      }

      // Redirect to Stripe portal
      window.location.href = data.url
    } catch (error) {
      console.error('Error accessing billing portal:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to access billing portal",
        variant: "destructive"
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, portal: false }))
    }
  }

  async function handleDownloadAllInvoices(e: React.MouseEvent) {
    e.preventDefault()
    try {
      const response = await fetch('/api/billing/invoices/download-all')
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to download invoices')
      }
      
      // Get the filename from the Content-Disposition header or use a default
      const contentDisposition = response.headers.get('Content-Disposition')
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'invoices.zip'

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoices:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download invoices",
        variant: "destructive"
      })
    }
  }

  async function handleInvoiceDownload(url: string, e: React.MouseEvent) {
    e.preventDefault()
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to download invoice')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = url.split('/').pop() || 'invoice.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast({
        title: "Error",
        description: "Failed to download invoice. Please try again.",
        variant: "destructive"
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

  if (loadingStates.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <div className="space-y-2">
            <h3 className="font-semibold">Failed to Load Subscription</h3>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t load your subscription information. Please try refreshing the page or contact support if the problem persists.
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing & Subscription</h2>
          <p className="text-muted-foreground mt-2">
            Manage your plan, billing information, and subscription settings
          </p>
        </div>
        <div className="flex items-start gap-3">
          <Button 
            variant="outline" 
            onClick={handleManageBilling}
            disabled={loadingStates.portal}
            className="w-full md:w-auto"
          >
            {loadingStates.portal ? (
              <>
                <Settings className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ExternalLink className="mr-2 h-4 w-4" />
                Billing Portal
              </>
            )}
          </Button>
          {subscription.tier === 'free' && (
            <Button 
              onClick={() => handleUpgradeSubscription('pro')}
              disabled={loadingStates.billing}
              className="w-full md:w-auto bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700"
            >
              {loadingStates.billing ? (
                <>
                  <Settings className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid gap-6">
        {/* Current Plan & Usage Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Plan */}
          <Card className="md:col-span-2">
            <div className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">Current Plan</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      subscription.tier === 'pro' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : subscription.tier === 'enterprise'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                    }`}>
                      {subscription.tier === 'free' ? 'Free Plan' : `${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Plan`}
                    </span>
                    {subscription.tier !== 'free' && subscription.currentPeriodEnd && (
                      <span className="text-sm text-muted-foreground">
                        Next billing date: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                {subscription.tier !== 'free' && (
                  <div>
                    {subscription.cancelAtPeriodEnd ? (
                      <Button 
                        onClick={handleResumeSubscription}
                        disabled={loadingStates.billing}
                      >
                        {loadingStates.billing ? (
                          <>
                            <Settings className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>Resume Subscription</>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        onClick={handleCancelSubscription}
                        disabled={loadingStates.billing}
                      >
                        {loadingStates.billing ? (
                          <>
                            <Settings className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>Cancel Subscription</>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {subscription.cancelAtPeriodEnd && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Subscription Canceling</AlertTitle>
                  <AlertDescription>
                    Your subscription will be canceled on {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}. 
                    You can resume your subscription anytime before this date.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Current Usage */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-blue-600" />
                  <h4 className="font-medium">Current Usage</h4>
                </div>
                <span className="text-sm text-muted-foreground">
                  {subscription.usage.daysLeft} days left
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Images Processed</span>
                  <span className="font-medium">
                    {subscription.usage.imagesProcessed} / {PLANS[subscription.tier.toUpperCase()].limits.imagesPerMonth === Infinity ? '∞' : PLANS[subscription.tier.toUpperCase()].limits.imagesPerMonth}
                  </span>
                </div>
                <Progress 
                  value={PLANS[subscription.tier.toUpperCase()].limits.imagesPerMonth === Infinity ? 0 : (subscription.usage.imagesProcessed / PLANS[subscription.tier.toUpperCase()].limits.imagesPerMonth) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </Card>

          {/* Usage History */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Usage History</h4>
              </div>
              
              <div className="space-y-4">
                {subscription.usageHistory.map((record) => (
                  <div key={record.month} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{record.month}</span>
                      <span className="font-medium">
                        {record.imagesProcessed} images
                      </span>
                    </div>
                    <Progress 
                      value={PLANS[subscription.tier.toUpperCase()].limits.imagesPerMonth === Infinity ? 0 : (record.imagesProcessed / PLANS[subscription.tier.toUpperCase()].limits.imagesPerMonth) * 100} 
                      className="h-1.5"
                    />
                  </div>
                ))}
                {subscription.usageHistory.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No usage history available
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Invoices & Plans Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Invoice History */}
          <Card className="md:col-span-2">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-medium">Invoice History</h3>
                </div>
                <div className="flex items-center gap-2">
                  {invoices.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownloadAllInvoices}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadInvoices}
                    disabled={loadingStates.refreshingInvoices}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {loadingStates.refreshingInvoices ? (
                      <Settings className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              {invoices.length > 0 ? (
                <div className="divide-y">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between py-3"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {formatAmount(invoice.amount_paid)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === 'paid'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                        {invoice.invoice_pdf && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => handleInvoiceDownload(invoice.invoice_pdf, e)}
                          >
                            <span className="sr-only">Download Invoice</span>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No invoices available
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium">Quick Actions</h3>
              </div>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleManageBilling}
                  disabled={loadingStates.portal}
                >
                  {loadingStates.portal ? (
                    <>
                      <Settings className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Update Payment Method
                    </>
                  )}
                </Button>
                {subscription.tier !== 'free' && (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={subscription.cancelAtPeriodEnd ? handleResumeSubscription : handleCancelSubscription}
                    disabled={loadingStates.billing}
                  >
                    {loadingStates.billing ? (
                      <>
                        <Settings className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : subscription.cancelAtPeriodEnd ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resume Subscription
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Cancel Subscription
                      </>
                    )}
                  </Button>
                )}
                {subscription.tier === 'free' && (
                  <Button 
                    className="w-full justify-start bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700"
                    onClick={() => handleUpgradeSubscription('pro')}
                    disabled={loadingStates.billing}
                  >
                    {loadingStates.billing ? (
                      <>
                        <Settings className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Upgrade to Pro
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Available Plans */}
        {subscription.tier !== 'enterprise' && (
          <div className="pt-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium">Available Plans</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose the plan that best fits your needs
                </p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {Object.entries(PLANS)
                .filter(([key]) => key !== subscription.tier.toUpperCase())
                .map(([key, plan]) => (
                  <Card 
                    key={key} 
                    className={`relative group transition-all duration-300 hover:scale-[1.01] ${
                      key === 'PRO' 
                        ? 'border-primary/50 shadow-lg bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 dark:from-blue-900/50 dark:via-gray-900 dark:to-blue-900/30' 
                        : 'bg-background/60 backdrop-blur-sm hover:shadow-lg'
                    }`}
                  >
                    {key === 'PRO' && (
                      <div className="absolute -top-2 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-0.5 rounded-full">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3.5 w-3.5 text-white animate-pulse" />
                          <span className="text-xs font-semibold text-white">Recommended</span>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className={`text-lg font-semibold ${
                            key === 'PRO' 
                              ? 'bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400'
                              : ''
                          }`}>{plan.name}</h4>
                          <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-2xl font-bold">${plan.price}</span>
                            <span className="text-sm text-muted-foreground">/month</span>
                          </div>
                        </div>
                        <Separator />
                        <ul className="space-y-2 min-h-[180px]">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <div className={`mt-1 h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                                key === 'PRO'
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-primary'
                              }`}>
                                <Check className="h-3 w-3" />
                              </div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button 
                          className={`w-full ${
                            key === 'PRO' 
                              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700' 
                              : key === 'ENTERPRISE'
                              ? 'border-blue-200/50 dark:border-blue-800/50'
                              : ''
                          }`}
                          variant={key === 'ENTERPRISE' ? 'outline' : 'default'}
                          onClick={() => handleUpgradeSubscription(plan.id.toLowerCase())}
                          disabled={loadingStates.billing}
                        >
                          {loadingStates.billing ? (
                            <>
                              <Settings className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              {key === 'ENTERPRISE' ? (
                                <>Contact Sales</>
                              ) : (
                                <>
                                  {plan.price > PLANS[subscription.tier.toUpperCase()].price ? 'Upgrade to ' : 'Switch to '}
                                  {plan.name}
                                  <Zap className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 