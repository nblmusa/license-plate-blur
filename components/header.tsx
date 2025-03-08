"use client"

import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Shield, Menu, User, Settings, LogOut, ChevronDown, CreditCard } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user ?? null)
          router.refresh()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router, supabase])

  async function handleSignOut() {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
      toast({
        title: "Success",
        description: "You have been signed out successfully.",
      })
      router.push('/')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const navigation = [
    { name: 'About', href: '/about' },
    ...(!user ? [{ name: 'Pricing', href: '/pricing' }] : []),
    { name: 'Blog', href: '/blog' },
    { name: 'Docs', href: '/docs' },
    ...(user ? [
      // { name: 'Dashboard', href: '/dashboard' }
    ] : []),
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 max-w-7xl mx-auto items-center justify-between">
          <div className="flex items-center gap-6">
            <Link 
              href="/" 
              className="flex items-center gap-2.5 transition-all duration-300 hover:opacity-90 group"
            >
              <div className="relative p-2 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-blue-500/10 rounded-xl group-hover:from-blue-500/20 group-hover:via-indigo-500/20 group-hover:to-blue-500/20 transition-all duration-300">
                <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-pulse-subtle" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-75" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-400 dark:via-blue-300 dark:to-blue-200">
                  MaskingTech
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/80">Privacy Through Innovation</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground",
                    pathname === item.href
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {!isLoading && (
              <>
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        <User className="h-5 w-5" />
                        <span className="hidden sm:inline-block">
                          {user.user_metadata.full_name || user.email}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="cursor-pointer">
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={handleSignOut}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <>
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
                  </>
                )}
              </>
            )}

            <ModeToggle />

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "text-sm font-medium transition-colors hover:text-foreground",
                        pathname === item.href
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                  {!user && (
                    <>
                      <Link
                        href="/login"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}