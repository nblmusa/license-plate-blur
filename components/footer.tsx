"use client"

import { Shield, Github, Twitter, Car, Mail } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 py-8 max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/5 rounded-lg">
                  <Shield className="h-6 w-6 text-primary/80" />
                </div>
                <span className="text-lg font-bold">PlateGuard</span>
              </div>
              <p className="text-sm text-muted-foreground/80">
                Advanced license plate masking technology for your vehicle images.
              </p>
              <div className="flex items-center gap-3">
                <Link 
                  href="https://github.com" 
                  target="_blank"
                  className="p-2 rounded-full hover:bg-primary/5 transition-colors"
                >
                  <Github className="h-5 w-5 text-foreground/80 hover:text-foreground transition-colors" />
                </Link>
                <Link 
                  href="https://twitter.com" 
                  target="_blank"
                  className="p-2 rounded-full hover:bg-primary/5 transition-colors"
                >
                  <Twitter className="h-5 w-5 text-foreground/80 hover:text-foreground transition-colors" />
                </Link>
                <Link 
                  href="mailto:contact@plateguard.com"
                  className="p-2 rounded-full hover:bg-primary/5 transition-colors"
                >
                  <Mail className="h-5 w-5 text-foreground/80 hover:text-foreground transition-colors" />
                </Link>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground/90">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/pricing" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/upload" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Upload
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground/90">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground/90">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-muted-foreground/80 hover:text-foreground/90 transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-border/40">
            <p className="text-sm text-muted-foreground/70">
              © {new Date().getFullYear()} PlateGuard. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground/70">
              <Car className="h-4 w-4" />
              <span>Protecting vehicle privacy worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 