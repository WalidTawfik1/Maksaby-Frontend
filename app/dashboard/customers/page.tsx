'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Users, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import { Customer } from '@/types'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await apiClient.get<Customer[]>('/customers')
      return response.data
    },
  })

  const filteredCustomers = customers?.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">العملاء</h1>
          <p className="text-muted-foreground">إدارة بيانات العملاء</p>
        </div>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          إضافة عميل
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="البحث عن عميل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا يوجد عملاء</p>
            </CardContent>
          </Card>
        ) : (
          filteredCustomers?.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl">{customer.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {customer.phone && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الهاتف:</span>
                    <span>{customer.phone}</span>
                  </div>
                )}
                {customer.email && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">البريد:</span>
                    <span className="text-xs">{customer.email}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">العنوان:</span>
                    <span className="text-xs">{customer.address}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">إجمالي المشتريات:</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  عرض سجل المشتريات
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
