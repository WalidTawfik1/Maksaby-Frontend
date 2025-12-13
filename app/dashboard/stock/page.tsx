'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package2, TrendingDown, TrendingUp, ArrowUpCircle, ArrowDownCircle, RefreshCw, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllStockMovements, getAllProducts } from '@/lib/api-client'
import { formatDate, formatCurrency } from '@/lib/utils'
import { StockMovement, FilterType, Product } from '@/types'

export default function StockPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [filterType, setFilterType] = useState<FilterType | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: productsResponse, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-stock'],
    queryFn: async () => await getAllProducts({ pageSize: 100 }),
  })

  const products = productsResponse?.data || []

  const { data: movementsResponse, isLoading: loadingMovements } = useQuery({
    queryKey: ['stock-movements', currentPage, pageSize, filterType, startDate, endDate],
    queryFn: async () => await getAllStockMovements({
      pagenum: currentPage,
      pagesize: pageSize,
      SearchTerm: null,
      StartDate: filterType === FilterType.Custom && startDate ? startDate : null,
      EndDate: filterType === FilterType.Custom && endDate ? endDate : null,
      FilterType: filterType,
    }),
  })

  const movements = movementsResponse?.data || []
  const lowStockProducts = products.filter((p) => p.stock <= 5)
  const totalProducts = products.length
  const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.buyingPrice), 0)

  const getMovementIcon = (type: string) => {
    if (type === 'IN') return <ArrowUpCircle className="h-4 w-4 text-green-600" />
    if (type === 'OUT') return <ArrowDownCircle className="h-4 w-4 text-red-600" />
    if (type === 'ADJUSTMENT') return <RefreshCw className="h-4 w-4 text-blue-600" />
    return null
  }

  const getMovementColor = (type: string) => {
    if (type === 'IN') return 'text-green-600'
    if (type === 'OUT') return 'text-red-600'
    if (type === 'ADJUSTMENT') return 'text-blue-600'
    return ''
  }

  const getFilterTypeLabel = (type: FilterType | null) => {
    if (type === null) return 'الكل'
    if (type === FilterType.Today) return 'اليوم'
    if (type === FilterType.ThisWeek) return 'هذا الأسبوع'
    if (type === FilterType.ThisMonth) return 'هذا الشهر'
    if (type === FilterType.Custom) return 'مخصص'
    return 'الكل'
  }

  if (loadingProducts || loadingMovements) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">إدارة المخزون</h1>
        <p className="text-muted-foreground">متابعة المخزون وحركة المنتجات</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
            <Package2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">منتج في المخزون</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">قيمة إجمالية</p>
          </CardContent>
        </Card>
        <Card className={lowStockProducts.length > 0 ? 'border-red-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مخزون منخفض</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">منتج يحتاج إعادة شراء</p>
          </CardContent>
        </Card>
      </div>

      {lowStockProducts.length > 0 && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              تنبيه: منتجات بمخزون منخفض ({lowStockProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      المخزون: <span className="text-red-600 font-semibold">{product.stock}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle>المخزون الحالي</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-md border"><div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50"><tr>
                <th className="px-4 py-3 text-right text-sm font-medium">المنتج</th>
                <th className="px-4 py-3 text-right text-sm font-medium">الكمية</th>
                <th className="px-4 py-3 text-right text-sm font-medium">سعر الشراء</th>
                <th className="px-4 py-3 text-right text-sm font-medium">القيمة الإجمالية</th>
                <th className="px-4 py-3 text-right text-sm font-medium">الحالة</th>
              </tr></thead>
              <tbody className="divide-y">
                {products.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">لا توجد منتجات في المخزون</td></tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3"><span className={product.stock <= 5 ? 'text-red-600 font-semibold' : ''}>{product.stock}</span></td>
                      <td className="px-4 py-3">{formatCurrency(product.buyingPrice)}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(product.stock * product.buyingPrice)}</td>
                      <td className="px-4 py-3">
                        {product.stock <= 5 ? (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">منخفض</span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">متوفر</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>حركة المخزون</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 ml-2" />تصفية
            </Button>
          </div>
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Button variant={filterType === null ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(null)}>الكل</Button>
                <Button variant={filterType === FilterType.Today ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(FilterType.Today)}>اليوم</Button>
                <Button variant={filterType === FilterType.ThisWeek ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(FilterType.ThisWeek)}>هذا الأسبوع</Button>
                <Button variant={filterType === FilterType.ThisMonth ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(FilterType.ThisMonth)}>هذا الشهر</Button>
                <Button variant={filterType === FilterType.Custom ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(FilterType.Custom)}>مخصص</Button>
              </div>
              {filterType === FilterType.Custom && (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">من تاريخ</Label>
                    <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">إلى تاريخ</Label>
                    <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="text-sm text-muted-foreground">الفلتر الحالي: <span className="font-semibold">{getFilterTypeLabel(filterType)}</span></div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border"><div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50"><tr>
                <th className="px-4 py-3 text-right text-sm font-medium">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-medium">المنتج</th>
                <th className="px-4 py-3 text-right text-sm font-medium">الكمية</th>
                <th className="px-4 py-3 text-right text-sm font-medium">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right text-sm font-medium">الملاحظة</th>
                <th className="px-4 py-3 text-right text-sm font-medium">التاريخ</th>
              </tr></thead>
              <tbody className="divide-y">
                {movements.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">لا توجد حركات مخزون</td></tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getMovementIcon(movement.movementType)}
                          <span className={`text-sm font-medium ${getMovementColor(movement.movementType)}`}>
                            {movement.movementType === 'IN' ? 'إدخال' : movement.movementType === 'OUT' ? 'إخراج' : 'تعديل'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{movement.productName}</td>
                      <td className="px-4 py-3">
                        <span className={getMovementColor(movement.movementType)}>
                          {movement.movementType === 'OUT' ? '-' : '+'}{movement.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {movement.invoiceNumber !== null ? (
                          <span className="text-sm">{movement.invoiceNumber}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">{movement.note}</td>
                      <td className="px-4 py-3 text-sm">{formatDate(movement.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div></div>
          {movements.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">الصفحة {currentPage}</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronRight className="h-4 w-4" />السابق
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={movements.length < pageSize}>
                  التالي<ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
