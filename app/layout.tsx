import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { ToasterProvider } from '@/components/toaster-provider'
import { Analytics } from '@vercel/analytics/next'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'مكسبي - نظام إدارة المخزون والطلبات',
  description: 'نظام متكامل لإدارة المخزون والطلبات للمحلات التجارية',
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className={cairo.className} suppressHydrationWarning>
        <Providers>
          {children}
          <ToasterProvider />
          <Analytics />
        </Providers>
      </body>
    </html>
  )
}
