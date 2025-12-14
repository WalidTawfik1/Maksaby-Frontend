'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  Package2,
  FileText,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'

const navigationItems = [
  {
    title: 'لوحة التحكم',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'المنتجات',
    href: '/dashboard/products',
    icon: Package,
  },
  {
    title: 'الطلبات',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    title: 'العملاء',
    href: '/dashboard/customers',
    icon: Users,
  },
  {
    title: 'المصروفات',
    href: '/dashboard/expenses',
    icon: Wallet,
  },
  {
    title: 'المخزون',
    href: '/dashboard/stock',
    icon: Package2,
  },
  {
    title: 'الملاحظات',
    href: '/dashboard/notes',
    icon: FileText,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout, getCurrentUser } = useAuth()
  const user = getCurrentUser()

  return (
    <div className="flex h-full w-64 flex-col bg-card border-l border-border">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border px-4">
        <div className="relative w-32 h-12">
          <Image 
            src="/logo.png" 
            alt="مكسبي" 
            fill
            sizes="128px"
            className="object-contain"
            priority 
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="mb-3 rounded-lg bg-accent p-3">
          <p className="text-sm font-medium">{user?.name || 'المستخدم'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="w-full"
        >
          <LogOut className="ml-2 h-4 w-4" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}
