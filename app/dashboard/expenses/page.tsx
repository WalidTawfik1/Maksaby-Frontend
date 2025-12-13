'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import apiClient from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Expense } from '@/types'

export default function ExpensesPage() {
  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses'],
    queryFn: async () => {
      const response = await apiClient.get<Expense[]>('/expenses')
      return response.data
    },
  })

  const totalExpenses = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المصروفات</h1>
          <p className="text-muted-foreground">تتبع مصروفات العمل</p>
        </div>
        <Button>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مصروف
        </Button>
      </div>

      {/* Total Expenses Card */}
      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            إجمالي المصروفات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="space-y-3">
        {expenses?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد مصروفات</p>
            </CardContent>
          </Card>
        ) : (
          expenses?.map((expense) => (
            <Card key={expense.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-100 p-2 rounded-lg">
                        <Wallet className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{expense.category}</h3>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground">
                            {expense.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(expense.date)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
