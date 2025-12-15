'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { DashboardSidebar } from '@/components/dashboard-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, router])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null
  }

  if (!isAuthenticated()) {
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
