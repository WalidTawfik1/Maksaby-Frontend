'use client'

import { useQuery } from '@tanstack/react-query'
import { FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import apiClient from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'

interface ReportData {
  totalRevenue: number
  totalProfit: number
  totalExpenses: number
  netProfit: number
  profitMargin: number
}

export default function ReportsPage() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const response = await apiClient.get<ReportData>('/reports/summary')
      return response.data
    },
  })

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">التقارير</h1>
        <p className="text-muted-foreground">ملخص الأداء المالي</p>
      </div>

      {/* Financial Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الإيرادات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(report?.totalRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الأرباح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(report?.totalProfit || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(report?.totalExpenses || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              صافي الربح
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (report?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {formatCurrency(report?.netProfit || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit & Loss Statement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            قائمة الأرباح والخسائر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="font-medium">الإيرادات</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {formatCurrency(report?.totalRevenue || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="font-medium">إجمالي الأرباح</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {formatCurrency(report?.totalProfit || 0)}
              </span>
            </div>

            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="font-medium">المصروفات</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                {formatCurrency(report?.totalExpenses || 0)}
              </span>
            </div>

            <div className="border-t-2 border-primary pt-4">
              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                <span className="text-lg font-bold">صافي الربح</span>
                <span
                  className={`text-2xl font-bold ${
                    (report?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(report?.netProfit || 0)}
                </span>
              </div>
            </div>

            {report?.profitMargin !== undefined && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">هامش الربح</p>
                <p className="text-3xl font-bold text-primary">
                  {report.profitMargin.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
