"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ReCAPTCHA } from "@/components/recaptcha"

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState<string>("")
  const formRef = useRef<HTMLFormElement>(null)
  const { toast } = useToast()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    if (!recaptchaToken) {
      toast({
        title: "Error",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData(event.currentTarget)
      formData.append('recaptchaToken', recaptchaToken)
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      toast({
        title: "Success",
        description: "Your message has been sent. We will get back to you soon.",
      })

      // Reset form using the ref
      formRef.current?.reset()
      // Reset reCAPTCHA
      if (typeof window !== 'undefined' && window.grecaptcha) {
        window.grecaptcha.reset()
      }
      setRecaptchaToken("")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleRecaptchaVerify(token: string) {
    setRecaptchaToken(token)
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our services? We are here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Contact Form */}
          <Card className="p-6 sm:p-8 border-blue-100/50 dark:border-blue-800/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
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
                  required
                  className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-blue-700 dark:text-blue-300">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  required
                  className="border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-blue-700 dark:text-blue-300">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  className="min-h-[150px] border-blue-200/50 dark:border-blue-800/50 focus:border-blue-400 dark:focus:border-blue-600 transition-colors"
                  disabled={isLoading}
                />
              </div>

              <ReCAPTCHA onVerify={handleRecaptchaVerify} />

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading || !recaptchaToken}
              >
                {isLoading ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="p-6 border-blue-100/50 dark:border-blue-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Security First</h3>
                  <p className="text-sm text-muted-foreground">Your data is always protected</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-blue-100/50 dark:border-blue-800/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <a 
                    href="mailto:support@maskingtech.com"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    support@maskingtech.com
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 