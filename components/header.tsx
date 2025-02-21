"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Shield } from "lucide-react"
import Link from "next/link"

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 max-w-7xl mx-auto items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 transition-colors hover:opacity-90"
            >
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-lg font-bold">PlateGuard</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/pricing" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
              <Link 
                href="/docs" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                API Docs
              </Link>
              <Link 
                href="/dashboard" 
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button 
              className="hidden sm:inline-flex"
              asChild
            >
              <Link href="/signup">Get Started</Link>
            </Button>
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}