'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import apiClient from '@/lib/api-client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Order } from '@/types'

export default function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get<Order[]>('/orders')
      return response.data
    },
  })

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الطلبات</h1>
          <p className="text-muted-foreground">إدارة طلبات المبيعات</p>
        </div>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          إنشاء طلب جديد
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {orders?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات</p>
            </CardContent>
          </Card>
        ) : (
          orders?.map((order) => (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    طلب #{order.orderNumber}
                  </CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {order.status === 'completed'
                      ? 'مكتمل'
                      : order.status === 'pending'
                      ? 'قيد الانتظار'
                      : 'ملغي'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(order.createdAt)}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {order.customerName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">العميل:</span>
                      <span className="font-medium">{order.customerName}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">عدد المنتجات:</span>
                    <span>{order.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الإجمالي:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الربح:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(order.profit)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    عرض التفاصيل
                  </Button>
                  <Button size="sm" className="flex-1">
                    طباعة الفاتورة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
