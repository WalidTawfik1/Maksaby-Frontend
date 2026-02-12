'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDashboardData, getUserProfile } from '@/lib/api-client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { translateApiMessage } from '@/lib/translations'
import { LayoutDashboard, TrendingUp, Package, Users, ShoppingCart, User as UserIcon, Filter, X, Wallet, Receipt, Banknote, TrendingDown } from 'lucide-react'
import { FilterType } from '@/types'
import toast from 'react-hot-toast'
import Link from 'next/link'
import Image from 'next/image'

export default function DashboardPage() {
  const [filterType, setFilterType] = useState<FilterType | null>(FilterType.ThisMonth)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data', filterType, startDate, endDate],
    queryFn: async () => {
      try {
        const response = await getDashboardData({
          filterType,
          startDate: filterType === FilterType.Custom && startDate ? startDate : null,
          endDate: filterType === FilterType.Custom && endDate ? endDate : null,
        })
        if (response.isSuccess) {
          return response.data
        } else {
          toast.error(translateApiMessage(response.message))
          return null
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء تحميل البيانات'
        toast.error(translateApiMessage(errorMsg))
        return null
      }
    },
  })
  
  const { data: profileResponse } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })
  
  const profile = profileResponse?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const stats = dashboardData?.stats
  const recentOrders = dashboardData?.recentOrders || []

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg flex-shrink-0">
          {profile?.logoUrl ? (
            <Image 
              src={profile.logoUrl} 
              alt={profile.name || 'User'} 
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
            مرحباً، {profile?.name || 'المستخدم'} 👋
          </h1>
          <p className="text-muted-foreground text-lg">نظرة عامة على أعمالك اليوم</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'إخفاء الفلاتر' : 'فلتر حسب التاريخ'}
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterType === null ? 'default' : 'outline'}
                  onClick={() => {
                    setFilterType(null)
                    setStartDate('')
                    setEndDate('')
                  }}
                  size="sm"
                >
                  الكل
                </Button>
                <Button
                  variant={filterType === FilterType.Today ? 'default' : 'outline'}
                  onClick={() => {
                    setFilterType(FilterType.Today)
                    setStartDate('')
                    setEndDate('')
                  }}
                  size="sm"
                >
                  اليوم
                </Button>
                <Button
                  variant={filterType === FilterType.ThisWeek ? 'default' : 'outline'}
                  onClick={() => {
                    setFilterType(FilterType.ThisWeek)
                    setStartDate('')
                    setEndDate('')
                  }}
                  size="sm"
                >
                  هذا الأسبوع
                </Button>
                <Button
                  variant={filterType === FilterType.ThisMonth ? 'default' : 'outline'}
                  onClick={() => {
                    setFilterType(FilterType.ThisMonth)
                    setStartDate('')
                    setEndDate('')
                  }}
                  size="sm"
                >
                  هذا الشهر
                </Button>
                <Button
                  variant={filterType === FilterType.Custom ? 'default' : 'outline'}
                  onClick={() => setFilterType(FilterType.Custom)}
                  size="sm"
                >
                  تاريخ مخصص
                </Button>
              </div>

              {filterType === FilterType.Custom && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">من تاريخ</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">إلى تاريخ</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {(filterType !== null || startDate || endDate) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFilterType(null)
                    setStartDate('')
                    setEndDate('')
                  }}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  مسح الفلاتر
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
        {/* Current Cash - Prominent Display */}
        <Card className="relative col-span-full md:col-span-2 lg:col-span-1">
          <div className={`absolute inset-0 rounded-lg ${(stats?.currentCash ?? 0) >= 0 ? 'bg-gradient-to-br from-emerald-500/10 to-green-500/10' : 'bg-gradient-to-br from-red-500/10 to-rose-500/10'}`} />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">النقد الحالي</CardTitle>
              <div className="relative group">
                <div className="cursor-help p-1 hover:bg-muted rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-56 text-center z-50">
                  النقد الأولي + المبيعات - المصروفات - مشتريات المخزون
                  <div className="mt-1 pt-1 border-t border-border text-muted-foreground">
                    انتقل إلى الإعدادات لتعديل النقد الأولي
                  </div>
                </div>
              </div>
            </div>
            <div className={`p-2 ${(stats?.currentCash ?? 0) >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'} rounded-lg`}>
              <Banknote className={`h-5 w-5 ${(stats?.currentCash ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className={`text-3xl font-bold ${(stats?.currentCash ?? 0) >= 0 ? 'bg-gradient-to-r from-emerald-600 to-green-600' : 'bg-gradient-to-r from-red-600 to-rose-600'} bg-clip-text text-transparent`}>
              {formatCurrency(stats?.currentCash || 0)}
            </div>
            {(stats?.currentCash ?? 0) < 0 && (
              <p className="text-xs text-red-600 mt-2">تحذير: الرصيد سالب</p>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {formatCurrency(stats?.totalSales || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">تكلفة البضاعة المباعة</CardTitle>
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Receipt className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
              {formatCurrency(stats?.cogs || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">إجمالي الربح</CardTitle>
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <TrendingDown className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              {formatCurrency(stats?.grossProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">المبيعات - تكلفة البضاعة</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {formatCurrency(stats?.netProfit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">إجمالي الربح - المصروفات</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-yellow-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Wallet className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              {formatCurrency(stats?.totalExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-amber-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">عدد المنتجات</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              {stats?.productCount || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
            <CardTitle className="text-sm font-medium">عدد العملاء</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {stats?.customerCount || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="animate-fade-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <CardTitle>الطلبات الأخيرة</CardTitle>
          </div>
          <Link href="/dashboard/orders">
            <span className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
              عرض الكل
              <span className="text-lg">←</span>
            </span>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="p-4 bg-muted/50 rounded-full w-fit mx-auto mb-4">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">لا توجد طلبات حديثة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <Link href={`/dashboard/orders`} key={order.id}>
                  <div className="group flex items-center justify-between p-4 border-2 rounded-xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5 hover:border-primary/30 transition-all duration-300 cursor-pointer hover:shadow-md"
                       style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-primary/10 rounded-lg">
                          <p className="font-bold text-primary">#{order.invoiceNumber}</p>
                        </div>
                        <p className="font-medium group-hover:text-primary transition-colors">{order.customerName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 mr-1">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
