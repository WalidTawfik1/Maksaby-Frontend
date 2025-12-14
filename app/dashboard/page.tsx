'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardData } from '@/lib/api-client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { translateApiMessage } from '@/lib/translations'
import { LayoutDashboard, TrendingUp, Package, Users, ShoppingCart } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      try {
        const response = await getDashboardData()
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً بك في نظام مكسبي</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalSales || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats?.netProfit || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.productCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.customerCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>الطلبات الأخيرة</CardTitle>
          <Link href="/dashboard/orders">
            <span className="text-sm text-primary hover:underline">عرض الكل</span>
          </Link>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">لا توجد طلبات حديثة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link href={`/dashboard/orders`} key={order.id}>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">فاتورة #{order.invoiceNumber}</p>
                        <span className="text-sm text-muted-foreground">•</span>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(order.createdAt)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-lg">{formatCurrency(order.totalAmount)}</p>
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
