"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAnalytics } from "@/hooks/useAnalytics"

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const analytics = useAnalytics()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      
      // Check if passwords match
      const password = formData.get('password')
      const confirmPassword = formData.get('confirmPassword')
      
      if (password !== confirmPassword) {
        analytics.trackClientError('signup', 'Passwords do not match')
        throw new Error('Passwords do not match')
      }

      const response = await fetch('/auth/sign-up', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up')
      }

      analytics.trackSignup('email')
      
      toast({
        title: "Success",
        description: "Please check your email to confirm your account.",
      })

      router.push('/login')
    } catch (error) {
      analytics.trackApiError('/auth/sign-up', error instanceof Error ? error.message : 'Failed to sign up')
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 relative overflow-hidden">
      <div className="mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="max-w-md mx-auto p-6 sm:p-8 border-blue-100/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col items-center space-y-2 mb-8">
              <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-colors duration-300">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse-subtle" />
              </div>
              <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">Create an account</h1>
              <p className="text-sm text-muted-foreground text-center">
                Enter your details to create your account
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-blue-700 dark:text-blue-300">First name</Label>
                  <Input 
                    id="firstName"
                    name="firstName"
                    required 
                    className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-blue-700 dark:text-blue-300">Last name</Label>
                  <Input 
                    id="lastName"
                    name="lastName"
                    required 
                    className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-blue-700 dark:text-blue-300">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-blue-700 dark:text-blue-300">Password</Label>
                <Input 
                  id="password"
                  name="password"
                  type="password" 
                  required 
                  className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-blue-700 dark:text-blue-300">Confirm password</Label>
                <Input 
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password" 
                  required 
                  className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href="/login" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </Card>
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
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
      `}</style>
    </div>
  )
}