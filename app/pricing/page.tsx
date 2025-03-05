"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Car, Shield, Gauge, Lock, Sparkles, ImageIcon, Zap, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { PLANS } from "@/lib/stripe"
import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAnalytics } from "@/hooks/useAnalytics"

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionData {
  plan: typeof PLANS[keyof typeof PLANS];
  subscription: Subscription | null;
}

export default function PricingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const router = useRouter();
  const analytics = useAnalytics();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const response = await fetch('/api/billing/subscription');
        if (!response.ok) throw new Error('Failed to fetch subscription');
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      analytics.trackApiError('/api/billing/subscription', error instanceof Error ? error.message : 'Failed to fetch subscription');
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpgrade(planId: string) {
    try {
      setIsLoading(true);
      
      // Track subscription start
      const plan = Object.values(PLANS).find(p => p.id.toLowerCase() === planId.toLowerCase());
      if (plan) {
        analytics.trackSubscriptionStart(plan.name.toLowerCase(), plan.price);
      }

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Redirect to checkout
      router.push(data.url);
    } catch (error) {
      console.error('Upgrade error:', error);
      analytics.trackApiError('/api/billing/checkout', error instanceof Error ? error.message : 'Failed to start upgrade');
      toast({
        title: "Error",
        description: "Failed to start upgrade process",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  // Track plan view on component mount
  useEffect(() => {
    Object.values(PLANS).forEach(plan => {
      analytics.trackSubscriptionView(plan.name.toLowerCase());
    });
  }, [analytics]);

  function getPlanAction(planKey: string, plan: typeof PLANS[keyof typeof PLANS]) {
    if (isLoading) {
      return (
        <Button disabled className="w-full">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      );
    }

    // Not logged in - direct to signup
    if (!user) {
      return (
        <Button 
          className={`w-full group ${
            planKey === 'PRO' 
              ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
              : planKey === 'ENTERPRISE' 
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
              : 'border-blue-200/50 dark:border-blue-800/50'
          }`}
          variant={planKey === 'BASIC' ? 'outline' : 'default'}
          asChild
        >
          <Link href="/signup" className="flex items-center justify-center">
            Get Started
            <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
          </Link>
        </Button>
      );
    }

    // Current plan
    if (subscriptionData?.plan.id === plan.id.toLowerCase()) {
      return (
        <Button disabled className="w-full">
          Current Plan
        </Button>
      );
    }

    // Free plan can't downgrade
    if (subscriptionData?.plan.id === 'free' && plan.id === 'free') {
      return (
        <Button disabled className="w-full">
          Current Plan
        </Button>
      );
    }

    // Enterprise plan - contact sales
    if (planKey === 'ENTERPRISE') {
      return (
        <Button 
          className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
          asChild
        >
          <Link href="/contact">Contact Sales</Link>
        </Button>
      );
    }

    // Upgrade button
    return (
      <Button
        className={`w-full group ${
          planKey === 'PRO' 
            ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
            : 'border-blue-200/50 dark:border-blue-800/50'
        }`}
        variant={planKey === 'BASIC' ? 'outline' : 'default'}
        onClick={() => handleUpgrade(plan.id)}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Upgrade
            <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(60deg,rgba(59,130,246,0.05)_0%,rgba(59,130,246,0)_100%)]" />
      
      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute top-1/4 left-10 animate-float-slow">
          <Car className="h-12 w-12 text-blue-400/20 dark:text-blue-300/20 transform -rotate-12" />
        </div>
        <div className="absolute top-2/3 right-12 animate-float-slower">
          <Shield className="h-10 w-10 text-indigo-400/20 dark:text-indigo-300/20" />
        </div>
        <div className="absolute bottom-1/4 left-1/4 animate-float">
          <Lock className="h-8 w-8 text-blue-400/20 dark:text-blue-300/20 transform rotate-12" />
        </div>
      </div>

      <div className="mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/5 via-blue-400/5 to-indigo-500/5 px-6 py-3 rounded-full mb-6">
              <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {user ? 'Upgrade Your Plan' : 'Choose Your Plan'}
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {user 
                ? subscriptionData?.subscription
                  ? `You're currently on the ${subscriptionData.plan.name} plan. ${subscriptionData.subscription.cancelAtPeriodEnd ? 'Your plan will be cancelled at the end of the billing period.' : ''}`
                  : 'Choose a plan to get started with our advanced license plate detection and masking technology.'
                : 'Choose the plan that best fits your needs. All plans include our advanced license plate detection and masking technology.'
              }
            </p>
          </div>

          {/* Enhanced Pricing Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4 lg:gap-6 mb-16">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Card 
                key={key} 
                className={`group h-full flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                  ${key === 'PRO' ? 'border-primary/50 shadow-lg relative bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 dark:from-blue-900/50 dark:via-gray-900 dark:to-blue-900/30' : 'bg-background/60 backdrop-blur-sm'}
                  ${subscriptionData?.plan.id === plan.id.toLowerCase() ? 'ring-2 ring-primary' : ''}`}
              >
                {key === 'PRO' && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                      <span className="text-xs font-semibold text-white">Recommended</span>
                    </div>
                  </div>
                )}
                {subscriptionData?.plan.id === plan.id.toLowerCase() && (
                  <div className="absolute top-2 right-2 bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                    Current Plan
                  </div>
                )}
                <div className="p-6 sm:p-8 flex flex-col flex-1">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="space-y-4 flex-1 mb-6">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 group">
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                        </div>
                      ))}
                    </div>
                    {getPlanAction(key, plan)}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Enhanced Features Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
              Why Choose MaskingTech?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced AI technology ensures complete privacy for all license plates in your images.
                </p>
              </Card>
              <Card className="group p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Gauge className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Process images in seconds with our optimized detection algorithms.
                </p>
              </Card>
              <Card className="group p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">Enterprise Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Scalable solutions for businesses of any size with dedicated support.
                </p>
              </Card>
            </div>
          </div>

          {/* Enhanced FAQ Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground mb-8">
              Have more questions? <Link href="/docs" className="text-primary hover:text-primary/90 transition-colors">Check our documentation</Link>
            </p>
            <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
                <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">How does the image limit work?</h3>
                <p className="text-sm text-muted-foreground">
                  Image limits reset monthly. Unused images don&apos;t roll over to the next month. You can upgrade your plan at any time to increase your limit.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
                <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">What payment methods do you accept?</h3>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards and debit cards. Payment is processed securely through Stripe.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
                <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">Can I cancel my subscription?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You&apos;ll continue to have access until the end of your billing period.
                </p>
              </Card>
              <Card className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 border-blue-100/30 dark:border-blue-800/30">
                <h3 className="font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">Do you offer custom plans?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer custom enterprise plans for businesses with specific needs. Contact us to discuss your requirements.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(5deg); }
          50% { transform: translateY(-30px) rotate(-5deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50% { transform: translateY(-40px) rotate(5deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
      `}</style>
    </div>
  )
}