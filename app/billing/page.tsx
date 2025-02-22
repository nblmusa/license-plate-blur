"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { PLANS } from "@/lib/stripe"
import Link from "next/link"
import {
  CreditCard,
  Download,
  History,
  Loader2,
  Receipt,
  Settings,
  Shield,
  Sparkles,
  Zap
} from "lucide-react"

interface Invoice {
  id: string
  stripe_invoice_id: string
  amount_due: number
  amount_paid: number
  status: string
  invoice_pdf: string
  created_at: string
}

interface UsageRecord {
  images_processed: number
  month_year: string
}

interface SubscriptionData {
  plan: typeof PLANS[keyof typeof PLANS]
  subscription: {
    id: string
    status: string
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  } | null
}

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [usage, setUsage] = useState<UsageRecord[]>([])
  const supabase = createClientComponentClient()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadBillingData()
  }, [])

  async function loadBillingData() {
    try {
      setIsLoading(true)

      // Load subscription data
      const subscriptionResponse = await fetch('/api/billing/subscription')
      if (!subscriptionResponse.ok) throw new Error('Failed to load subscription')
      const subscriptionData = await subscriptionResponse.json()
      setSubscriptionData(subscriptionData)

      // Load invoices
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
      if (invoicesError) throw invoicesError
      setInvoices(invoices || [])

      // Load usage records
      const { data: usage, error: usageError } = await supabase
        .from('usage_records')
        .select('images_processed, month_year')
        .order('month_year', { ascending: false })
        .limit(6)
      if (usageError) throw usageError
      setUsage(usage || [])

    } catch (error) {
      console.error('Error loading billing data:', error)
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleManageSubscription() {
    try {
      setIsLoading(true)
      const response = await fetch('/api/billing/portal', {
        method: 'POST'
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      router.push(data.url)
    } catch (error) {
      console.error('Error opening customer portal:', error)
      toast({
        title: "Error",
        description: "Failed to open billing portal",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/5 dark:to-indigo-500/5">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Billing & Usage</span>
            </div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">Billing</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your subscription and view usage
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => loadBillingData()}
            >
              <History className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              size="sm"
              className="gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700"
              onClick={handleManageSubscription}
            >
              <Settings className="h-4 w-4" />
              Manage Subscription
            </Button>
          </div>
        </div>

        {/* Subscription Overview */}
        <Card className="p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Current Plan</h2>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-medium">{subscriptionData?.plan.name}</span>
                {subscriptionData?.plan.id === 'pro' && (
                  <div className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-medium">
                    Pro Plan
                  </div>
                )}
              </div>
              {subscriptionData?.subscription && (
                <p className="text-sm text-muted-foreground">
                  Current period ends {formatDate(subscriptionData.subscription.currentPeriodEnd)}
                  {subscriptionData.subscription.cancelAtPeriodEnd && 
                    " (Cancels at end of period)"}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="gap-2"
                asChild
              >
                <Link href="/pricing">
                  <Sparkles className="h-4 w-4" />
                  Compare Plans
                </Link>
              </Button>
              {subscriptionData?.plan.id === 'free' && (
                <Button
                  className="gap-2 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700"
                  asChild
                >
                  <Link href="/pricing">
                    <Zap className="h-4 w-4" />
                    Upgrade Now
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            <div className="p-6 border-b border-blue-100/30 dark:border-blue-800/30">
              <h2 className="text-lg font-semibold">Usage History</h2>
            </div>
            <div className="p-6">
              {usage.length > 0 ? (
                <div className="space-y-4">
                  {usage.map((record) => (
                    <div key={record.month_year} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{record.month_year}</span>
                        <span>{record.images_processed} images</span>
                      </div>
                      <Progress
                        value={(record.images_processed / subscriptionData!.plan.limits.imagesPerMonth) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No usage data available
                </div>
              )}
            </div>
          </Card>

          {/* Invoice History */}
          <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
            <div className="p-6 border-b border-blue-100/30 dark:border-blue-800/30">
              <h2 className="text-lg font-semibold">Invoice History</h2>
            </div>
            <div className="p-6">
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">
                          {formatAmount(invoice.amount_paid)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.created_at)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2"
                        asChild
                      >
                        <a
                          href={invoice.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Receipt className="h-4 w-4" />
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No invoices available
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 