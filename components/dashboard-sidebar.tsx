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
  Settings,
  User as UserIcon,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import { getUserProfile } from '@/lib/api-client'

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
  {
    title: 'الإعدادات',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { logout, getCurrentUser } = useAuth()
  const user = getCurrentUser()
  
  // Fetch user profile for logo
  const { data: profileResponse } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })
  
  const profile = profileResponse?.data

  return (
    <div className="flex h-full w-64 flex-col bg-card/80 backdrop-blur-xl border-l border-border/50 shadow-2xl">
      {/* User Profile Logo */}
      <div className="flex h-20 items-center justify-center border-b border-border/50 px-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg">
          {profile?.logoUrl ? (
            <Image 
              src={profile.logoUrl} 
              alt={profile.name || 'User'} 
              fill
              sizes="56px"
              className="object-cover"
              priority 
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative overflow-hidden',
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/30'
                  : 'text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 hover:text-foreground hover:shadow-md'
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                isActive ? "" : "group-hover:scale-110"
              )} />
              <span className="relative z-10">{item.title}</span>
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 animate-pulse-subtle" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border/50 p-4 bg-gradient-to-t from-primary/5 to-transparent">
        <div className="mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 p-4 border border-primary/20 shadow-lg">
          <p className="text-sm font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            {user?.name || 'المستخدم'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
        </div>
        <Button
          onClick={logout}
          variant="outline"
          className="w-full group hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
        >
          <LogOut className="ml-2 h-4 w-4 group-hover:rotate-12 transition-transform" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  )
}
