import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SettingsProvider } from "@/contexts/settings-context"
import Header from '@/components/header'
import Footer from '@/components/footer'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { PageViewTracker } from '@/components/PageViewTracker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MaskingTech - License Plate Masking Service',
  description: 'Professional license plate detection and masking service',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#020817' },
  ],
  viewport: 'width=device-width, initial-scale=1.0',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleAnalytics />
        <PageViewTracker />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 bg-background">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}