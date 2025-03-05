"use client"

import { Button } from "@/components/ui/button"
import { Shield, Upload, Download, Key, ArrowRight, Car, Lock, Gauge, CheckCircle2, Sparkles, Camera, ImageIcon, Cog, BadgeCheck } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center">
      {/* Hero Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-28 overflow-hidden bg-gradient-to-b from-blue-50/60 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900/90 dark:to-gray-900/95">
        {/* Enhanced background patterns */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(60deg,rgba(59,130,246,0.02)_0%,rgba(59,130,246,0)_100%)]" />
        
        {/* Enhanced floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div className="absolute top-1/4 left-10 animate-float-slow">
            <Car className="h-14 w-14 text-blue-400/20 dark:text-blue-300/20 transform -rotate-12" />
          </div>
          <div className="absolute top-1/3 right-12 animate-float-slower">
            <Shield className="h-12 w-12 text-indigo-400/20 dark:text-indigo-300/20" />
          </div>
          <div className="absolute bottom-1/4 left-1/4 animate-float">
            <Lock className="h-10 w-10 text-blue-400/20 dark:text-blue-300/20 transform rotate-12" />
          </div>
          <div className="absolute top-2/3 right-1/4 animate-float-slow">
            <Gauge className="h-8 w-8 text-indigo-400/20 dark:text-indigo-300/20" />
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col items-center space-y-6 sm:space-y-8 text-center">
            <div className="space-y-4 sm:space-y-6 max-w-3xl">
              <div className="mx-auto bg-gradient-to-r from-blue-500/3 via-blue-400/3 to-indigo-500/3 dark:from-blue-400/3 dark:via-blue-300/3 dark:to-indigo-400/3 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-blue-200/20 dark:border-blue-800/20 w-fit animate-fade-in shadow-lg hover:shadow-xl transition-all duration-300">
                <p className="text-xs sm:text-sm font-medium text-blue-700/90 dark:text-blue-300/90 flex items-center gap-2">
                  <Car className="h-3 w-3 sm:h-4 sm:w-4 animate-bounce-subtle" />
                  <span className="relative">
                    Advanced License Plate Protection
                    <Sparkles className="absolute -right-4 sm:-right-6 -top-2 sm:-top-4 h-3 w-3 sm:h-4 sm:w-4 text-yellow-400/80 animate-pulse" />
                  </span>
                </p>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl/none font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 via-blue-800/80 to-indigo-800/80 dark:from-blue-400/80 dark:via-blue-300/80 dark:to-blue-200/80 animate-fade-in-up [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
                Privacy Protection for Your Vehicle Images
              </h1>
              <p className="mx-auto max-w-[700px] text-base sm:text-lg md:text-xl text-gray-600/90 dark:text-gray-300/90 animate-fade-in-up delay-100 px-4">
                Instantly mask license plates in your photos with our advanced AI technology. Perfect for automotive businesses, real estate listings, and social media content.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-fade-in-up delay-200 w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto min-w-[150px] group bg-gradient-to-r from-blue-600/80 via-blue-700/80 to-indigo-600/80 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 dark:from-blue-500/80 dark:via-blue-600/80 dark:to-indigo-500/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                <Link href="/upload" className="flex items-center justify-center w-full">
                  Try It Now <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto min-w-[150px] border-blue-200/30 dark:border-blue-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/pricing" className="w-full text-center">View Pricing</Link>
              </Button>
            </div>

            {/* Add hero image grid */}
            <div className="w-full max-w-5xl mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4 animate-fade-in-up delay-300">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/original-image.png"
                  alt="Original car image"
                  fill
                  className="object-cover transition-transform hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="absolute bottom-4 left-4 text-white font-medium text-sm sm:text-base">Original Image</p>
                </div>
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl sm:translate-y-8 hidden sm:block">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-blue-500/5" />
              </div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/protected-image.png"
                  alt="Masked car image"
                  fill
                  className="object-cover transition-transform hover:scale-105 duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="absolute bottom-4 left-4 text-white font-medium text-sm sm:text-base">Protected Image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section (New) */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 lg:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(59,130,246,0.02)_0%,rgba(59,130,246,0)_100%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-4 sm:mb-6 shadow-lg">
              <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-300">See It In Action</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600/80 via-blue-700/80 to-indigo-600/80 dark:from-blue-400/80 dark:via-blue-300/80 dark:to-indigo-400/80 [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
              Watch The Magic Happen
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
              Experience our advanced license plate detection and masking technology in real-time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100/80 via-blue-50/80 to-indigo-50/80 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950 border border-blue-100/30 dark:border-blue-800/30 group order-2 md:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 group-hover:scale-110 transition-transform duration-500" />
              <Image
                src="/images/blur-description.webp"
                alt="License plate masking demo"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-scan w-full h-1 bg-gradient-to-r from-transparent via-blue-500/25 to-transparent blur-sm" />
              </div>
            </div>
            <div className="space-y-4 sm:space-y-6 order-1 md:order-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/5 rounded-lg">
                    <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-300">Real-Time Processing</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 pl-9">
                  Our AI model processes your images instantly, providing immediate results with high accuracy.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/5 rounded-lg">
                    <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-300">Smart Detection</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 pl-9">
                  Advanced algorithms detect license plates in any orientation or lighting condition.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/5 rounded-lg">
                    <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-blue-700 dark:text-blue-300">Privacy First</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 pl-9">
                  Secure masking ensures complete privacy while maintaining image quality.
                </p>
              </div>
              <Button size="lg" className="mt-4 bg-gradient-to-r from-blue-600/80 via-blue-700/80 to-indigo-600/80 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300" asChild>
                <Link href="/upload" className="flex items-center">
                  Try Demo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative w-full py-12 sm:py-16 md:py-20 bg-gradient-to-b from-gray-50/40 via-white to-gray-50/40 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-800/90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(59,130,246,0.02)_0%,rgba(59,130,246,0)_100%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600/80 via-blue-700/80 to-indigo-600/80 dark:from-blue-400/80 dark:via-blue-300/80 dark:to-indigo-400/80 [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
              How MaskingTech Works
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Secure and efficient license plate masking in three simple steps.
            </p>
          </div>
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
            <div className="group flex flex-col items-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100/30 dark:border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">1. Upload Photos</h3>
              <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Simply drag and drop your vehicle images. We support all major image formats.
              </p>
            </div>
            <div className="group flex flex-col items-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100/30 dark:border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">2. AI Detection</h3>
              <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Our AI instantly identifies and masks license plates with enterprise-grade accuracy.
              </p>
            </div>
            <div className="group flex flex-col items-center space-y-3 sm:space-y-4 p-6 sm:p-8 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-blue-100/30 dark:border-blue-800/30">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500/3 to-indigo-500/2 rounded-2xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300 shadow-inner">
                <Download className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">3. Download Secure</h3>
              <p className="text-center text-sm sm:text-base text-gray-600 dark:text-gray-300">
                Get your privacy-protected images instantly, ready for immediate use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-white via-gray-50/40 to-white dark:from-gray-800/90 dark:via-gray-900/95 dark:to-gray-900/90">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.05),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(60deg,rgba(59,130,246,0.02)_0%,rgba(59,130,246,0)_100%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/5 via-blue-400/5 to-indigo-500/5 px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:shadow-lg transition-all duration-300">
                <Car className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-sm sm:text-base text-blue-700 dark:text-blue-300">Why Choose MaskingTech</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 via-blue-800/80 to-indigo-700/80 dark:from-blue-400/80 dark:via-blue-300/80 dark:to-indigo-400/80 [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
                Industry-Leading Privacy Protection
              </h2>
              <div className="space-y-4">
                <div className="group flex items-start gap-3 p-3 sm:p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/5 dark:hover:to-indigo-900/5 transition-colors duration-300">
                  <div className="shrink-0">
                    <div className="p-2 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">Enterprise-Grade Security</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">All processing happens on secure servers with end-to-end encryption.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-3 p-3 sm:p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/5 dark:hover:to-indigo-900/5 transition-colors duration-300">
                  <div className="shrink-0">
                    <div className="p-2 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">Lightning Fast Processing</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Get your protected images in seconds with our optimized AI technology.</p>
                  </div>
                </div>
                <div className="group flex items-start gap-3 p-3 sm:p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/5 dark:hover:to-indigo-900/5 transition-colors duration-300">
                  <div className="shrink-0">
                    <div className="p-2 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                      <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">Universal Compatibility</h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Works with all vehicle types and license plate formats worldwide.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100/80 via-blue-50/80 to-indigo-50/80 dark:from-blue-950 dark:via-blue-900 dark:to-indigo-950 border border-blue-100/30 dark:border-blue-800/30 group hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
              <Image
                src="/images/collage.jpg"
                alt="Various vehicles with masked license plates"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10" />
            </div>
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-gray-50/40 via-white to-gray-50/40 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-800/90">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(59,130,246,0.02)_0%,rgba(59,130,246,0)_100%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="flex flex-col items-center space-y-8 text-center">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600/80 via-blue-700/80 to-indigo-600/80 dark:from-blue-400/80 dark:via-blue-300/80 dark:to-indigo-400/80 [text-shadow:0_4px_8px_rgba(59,130,246,0.05)]">
                Powerful API Integration
              </h2>
              <p className="mx-auto max-w-[700px] text-lg text-gray-600 md:text-xl dark:text-gray-300">
                Seamlessly integrate our license plate masking technology into your application with just a few lines of code.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 p-8 bg-gradient-to-br from-white via-blue-50/10 to-blue-100/5 dark:from-gray-800 dark:via-blue-900/3 dark:to-blue-800/5 rounded-2xl max-w-4xl w-full hover:shadow-xl transition-all duration-300 border border-blue-100/30 dark:border-blue-800/30">
              <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/5 dark:hover:to-indigo-900/5 transition-colors duration-300">
                <div className="p-3 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                  <Key className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">Simple Integration</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get started quickly with our well-documented RESTful API and SDKs.
                  </p>
                </div>
              </div>
              <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/5 dark:hover:to-indigo-900/5 transition-colors duration-300">
                <div className="p-3 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                  <Gauge className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">High Performance</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Process thousands of images with our scalable infrastructure.
                  </p>
                </div>
              </div>
              <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/5 dark:hover:to-indigo-900/5 transition-colors duration-300">
                <div className="p-3 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                  <Lock className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">Secure by Design</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enterprise-grade security with API key authentication.
                  </p>
                </div>
              </div>
              <div className="group flex items-start gap-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-blue-50/20 hover:to-indigo-50/20 dark:hover:from-blue-900/5 dark:hover:to-indigo-900/5 transition-colors duration-300">
                <div className="p-3 bg-gradient-to-br from-blue-500/3 to-indigo-500/3 rounded-xl group-hover:from-blue-500/5 group-hover:to-indigo-500/5 transition-colors duration-300">
                  <Car className="h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700/80 to-indigo-700/80 dark:from-blue-400/80 dark:to-indigo-400/80">Vehicle Analytics</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Optional metadata about vehicle type and positioning.
                  </p>
                </div>
              </div>
            </div>
            <Button variant="outline" size="lg" className="group border-blue-200/30 dark:border-blue-800/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300" asChild>
              <Link href="/docs" className="flex items-center">
                View Documentation <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Add new gallery section */}
      <section className="relative w-full py-12 sm:py-16 bg-gradient-to-b from-gray-50/40 via-white to-gray-50/40 dark:from-gray-900/90 dark:via-gray-900/95 dark:to-gray-800/90">
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600/80 via-blue-700/80 to-indigo-600/80 dark:from-blue-400/80 dark:via-blue-300/80 dark:to-indigo-400/80">
              See It In Action
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              See real examples of our license plate masking technology in action.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src={`/images/gallery-${i}.jpg`}
                  alt={`Gallery image ${i}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4">
                    <p className="text-white text-xs sm:text-sm">License plate automatically detected and masked</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
        @keyframes scan {
          0% { transform: translateY(-100%) translateX(-10px) rotate(-2deg); }
          100% { transform: translateY(200%) translateX(10px) rotate(2deg); }
        }
        @keyframes spin-slow {
          to { transform: rotate(360deg) scale(1.05); }
        }
        @keyframes spin-reverse {
          to { transform: rotate(-360deg) scale(0.95); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.95); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-slower { animation: float-slower 10s ease-in-out infinite; }
        .animate-scan { animation: scan 2s linear infinite; }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 3s linear infinite; }
        .animate-pulse-subtle { animation: pulse-subtle 3s ease-in-out infinite; }
      `}</style>
    </main>
  )
}