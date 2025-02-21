"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, Car, Shield, Gauge, Lock, Sparkles, ImageIcon, Zap, Users } from "lucide-react"
import Link from "next/link"
import { PLANS } from "@/lib/stripe"

export default function PricingPage() {
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
              <span className="font-medium text-blue-700 dark:text-blue-300">Choose Your Plan</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that best fits your needs. All plans include our advanced license plate detection and masking technology.
            </p>
          </div>

          {/* Enhanced Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 items-start mb-16">
            {Object.entries(PLANS).map(([key, plan]) => (
              <Card 
                key={key} 
                className={`group flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                  ${key === 'PRO' ? 'border-primary/50 shadow-lg relative bg-gradient-to-br from-blue-50/50 via-white to-blue-50/30 dark:from-blue-900/50 dark:via-gray-900 dark:to-blue-900/30' : 'bg-background/60 backdrop-blur-sm'}`}
              >
                {key === 'PRO' && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1 rounded-full">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-white animate-pulse" />
                      <span className="text-xs font-semibold text-white">Recommended</span>
                    </div>
                  </div>
                )}
                <div className="p-6 sm:p-8 flex flex-col h-full space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <Button 
                      className={`w-full group ${
                        key === 'PRO' 
                          ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl' 
                          : key === 'ENTERPRISE' 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg hover:shadow-xl'
                          : 'border-blue-200/50 dark:border-blue-800/50'
                      }`}
                      variant={key === 'BASIC' ? 'outline' : 'default'}
                      asChild
                    >
                      <Link href="/signup" className="flex items-center justify-center">
                        Get Started
                        <Zap className="ml-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      </Link>
                    </Button>
                  </div>
                  <div className="space-y-4 flex-1">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 group">
                        <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Enhanced Features Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
              Why Choose PlateGuard?
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