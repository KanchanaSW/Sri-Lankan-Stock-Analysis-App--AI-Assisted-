import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import { ConvexClientProvider } from './ConvexClientProvider'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sri Lankan Stock Analysis - AI-Assisted',
  description: 'AI-assisted stock analysis for the Colombo Stock Exchange',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
