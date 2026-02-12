'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Package2, TrendingDown, TrendingUp, ArrowUpCircle, ArrowDownCircle, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllStockMovements, getAllProductsWithoutPagination } from '@/lib/api-client'
import { formatDate, formatCurrency } from '@/lib/utils'
import { StockMovement, FilterType, Product } from '@/types'

export default function StockPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [filterType, setFilterType] = useState<FilterType | null>(FilterType.ThisMonth)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [movementTypeFilter, setMovementTypeFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL')
  const [lowStockPage, setLowStockPage] = useState(1)
  const [lowStockPageSize] = useState(6)
  const [currentStockPage, setCurrentStockPage] = useState(1)
  const [currentStockPageSize] = useState(10)
  const [lowStockPageInput, setLowStockPageInput] = useState('1')
  const [currentStockPageInput, setCurrentStockPageInput] = useState('1')
  const [movementsPageInput, setMovementsPageInput] = useState('1')

  const { data: productsResponse, isLoading: loadingProducts } = useQuery({
    queryKey: ['products-stock'],
    queryFn: async () => await getAllProductsWithoutPagination(),
  })

  const allProducts = productsResponse?.data || []
  const products = allProducts.filter((p) => p.stock > 0)

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

  const movements = movementsResponse?.data?.stockMovements || []
  const totalPages = movementsResponse?.data?.totalPages || 1
  const totalMovementsCount = movementsResponse?.data?.totalCount || 0
  const lowStockProducts = allProducts.filter((p) => p.stock <= 2 && p.stock > 0)
  const totalProducts = allProducts.length
  const totalStockValue = allProducts.reduce((sum, p) => sum + (p.stock * p.buyingPrice), 0)
  
  // Pagination for low stock products
  const lowStockTotalPages = Math.ceil(lowStockProducts.length / lowStockPageSize)
  const paginatedLowStock = lowStockProducts.slice(
    (lowStockPage - 1) * lowStockPageSize,
    lowStockPage * lowStockPageSize
  )
  
  // Pagination for current stock
  const currentStockTotalPages = Math.ceil(products.length / currentStockPageSize)
  const paginatedCurrentStock = products.slice(
    (currentStockPage - 1) * currentStockPageSize,
    currentStockPage * currentStockPageSize
  )
  
  // Filter movements by type
  const filteredMovements = movementTypeFilter === 'ALL' 
    ? movements 
    : movements.filter(m => m.movementType === movementTypeFilter)

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
              {paginatedLowStock.map((product) => (
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
            {lowStockProducts.length > lowStockPageSize && (
              <div className="flex items-center justify-center mt-4">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLowStockPage(1)
                      setLowStockPageInput('1')
                    }}
                    disabled={lowStockPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newPage = Math.max(1, lowStockPage - 1)
                      setLowStockPage(newPage)
                      setLowStockPageInput(newPage.toString())
                    }}
                    disabled={lowStockPage === 1}
                    className="h-8 px-3"
                  >
                    <ChevronRight className="h-4 w-4 ml-1" />
                    السابق
                  </Button>
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-sm text-muted-foreground">صفحة</span>
                    <Input
                      type="number"
                      min="1"
                      max={lowStockTotalPages}
                      value={lowStockPageInput}
                      onChange={(e) => setLowStockPageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const page = parseInt(lowStockPageInput)
                          if (page >= 1 && page <= lowStockTotalPages) {
                            setLowStockPage(page)
                          } else {
                            setLowStockPageInput(lowStockPage.toString())
                          }
                        }
                      }}
                      onBlur={() => setLowStockPageInput(lowStockPage.toString())}
                      className="w-16 h-8 text-center"
                    />
                    <span className="text-sm text-muted-foreground">من {lowStockTotalPages}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newPage = Math.min(lowStockTotalPages, lowStockPage + 1)
                      setLowStockPage(newPage)
                      setLowStockPageInput(newPage.toString())
                    }}
                    disabled={lowStockPage >= lowStockTotalPages}
                    className="h-8 px-3"
                  >
                    التالي
                    <ChevronLeft className="h-4 w-4 mr-1" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLowStockPage(lowStockTotalPages)
                      setLowStockPageInput(lowStockTotalPages.toString())
                    }}
                    disabled={lowStockPage === lowStockTotalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
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
                  paginatedCurrentStock.map((product) => (
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
          {products.length > currentStockPageSize && (
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentStockPage(1)
                    setCurrentStockPageInput('1')
                  }}
                  disabled={currentStockPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, currentStockPage - 1)
                    setCurrentStockPage(newPage)
                    setCurrentStockPageInput(newPage.toString())
                  }}
                  disabled={currentStockPage === 1}
                  className="h-8 px-3"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  السابق
                </Button>
                <div className="flex items-center gap-2 px-2">
                  <span className="text-sm text-muted-foreground">صفحة</span>
                  <Input
                    type="number"
                    min="1"
                    max={currentStockTotalPages}
                    value={currentStockPageInput}
                    onChange={(e) => setCurrentStockPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const page = parseInt(currentStockPageInput)
                        if (page >= 1 && page <= currentStockTotalPages) {
                          setCurrentStockPage(page)
                        } else {
                          setCurrentStockPageInput(currentStockPage.toString())
                        }
                      }
                    }}
                    onBlur={() => setCurrentStockPageInput(currentStockPage.toString())}
                    className="w-20 h-8 text-center"
                  />
                  <span className="text-sm text-muted-foreground">من {currentStockTotalPages}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(currentStockTotalPages, currentStockPage + 1)
                    setCurrentStockPage(newPage)
                    setCurrentStockPageInput(newPage.toString())
                  }}
                  disabled={currentStockPage >= currentStockTotalPages}
                  className="h-8 px-3"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentStockPage(currentStockTotalPages)
                    setCurrentStockPageInput(currentStockTotalPages.toString())
                  }}
                  disabled={currentStockPage === currentStockTotalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>حركة المخزون ({getFilterTypeLabel(filterType)})</CardTitle>
            <div className="flex gap-2">
              <div className="flex gap-1 border rounded-md p-1">
                <Button
                  variant={movementTypeFilter === 'ALL' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMovementTypeFilter('ALL')}
                >
                  الكل
                </Button>
                <Button
                  variant={movementTypeFilter === 'IN' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMovementTypeFilter('IN')}
                  className={movementTypeFilter === 'IN' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  <ArrowUpCircle className="h-4 w-4 ml-1" />
                  إدخال
                </Button>
                <Button
                  variant={movementTypeFilter === 'OUT' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setMovementTypeFilter('OUT')}
                  className={movementTypeFilter === 'OUT' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  <ArrowDownCircle className="h-4 w-4 ml-1" />
                  إخراج
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 ml-2" />تصفية
              </Button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Button variant={filterType === null ? 'default' : 'outline'} size="sm" onClick={() => {
                  setFilterType(null)
                  setCurrentPage(1)
                  setMovementsPageInput('1')
                }}>الكل</Button>
                <Button variant={filterType === FilterType.Today ? 'default' : 'outline'} size="sm" onClick={() => {
                  setFilterType(FilterType.Today)
                  setCurrentPage(1)
                  setMovementsPageInput('1')
                }}>اليوم</Button>
                <Button variant={filterType === FilterType.ThisWeek ? 'default' : 'outline'} size="sm" onClick={() => {
                  setFilterType(FilterType.ThisWeek)
                  setCurrentPage(1)
                  setMovementsPageInput('1')
                }}>هذا الأسبوع</Button>
                <Button variant={filterType === FilterType.ThisMonth ? 'default' : 'outline'} size="sm" onClick={() => {
                  setFilterType(FilterType.ThisMonth)
                  setCurrentPage(1)
                  setMovementsPageInput('1')
                }}>هذا الشهر</Button>
                <Button variant={filterType === FilterType.Custom ? 'default' : 'outline'} size="sm" onClick={() => {
                  setFilterType(FilterType.Custom)
                  setCurrentPage(1)
                  setMovementsPageInput('1')
                }}>مخصص</Button>
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
                <th className="px-4 py-3 text-right text-sm font-medium">سعر الوحدة</th>
                <th className="px-4 py-3 text-right text-sm font-medium">التكلفة الإجمالية</th>
                <th className="px-4 py-3 text-right text-sm font-medium">رقم الفاتورة</th>
                <th className="px-4 py-3 text-right text-sm font-medium">الملاحظة</th>
                <th className="px-4 py-3 text-right text-sm font-medium">التاريخ</th>
              </tr></thead>
              <tbody className="divide-y">
                {filteredMovements.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">لا توجد حركات مخزون</td></tr>
                ) : (
                  filteredMovements.map((movement) => (
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
                        {movement.unitPrice !== null && movement.unitPrice !== undefined ? (
                          <span className="text-sm">{formatCurrency(movement.unitPrice)}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {movement.totalCost !== null && movement.totalCost !== undefined ? (
                          <span className="text-sm font-medium">{formatCurrency(movement.totalCost)}</span>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
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
          {filteredMovements.length > 0 && (
            <div className="flex items-center justify-center mt-4">
              <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(1)
                    setMovementsPageInput('1')
                  }}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(1, currentPage - 1)
                    setCurrentPage(newPage)
                    setMovementsPageInput(newPage.toString())
                  }}
                  disabled={currentPage === 1}
                  className="h-8 px-3"
                >
                  <ChevronRight className="h-4 w-4 ml-1" />
                  السابق
                </Button>
                <div className="flex items-center gap-2 px-2">
                  <span className="text-sm text-muted-foreground">صفحة</span>
                  <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={movementsPageInput}
                    onChange={(e) => setMovementsPageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const page = parseInt(movementsPageInput)
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page)
                        } else {
                          setMovementsPageInput(currentPage.toString())
                        }
                      }
                    }}
                    onBlur={() => setMovementsPageInput(currentPage.toString())}
                    className="w-20 h-8 text-center"
                  />
                  <span className="text-sm text-muted-foreground">من {totalPages}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1)
                    setCurrentPage(newPage)
                    setMovementsPageInput(newPage.toString())
                  }}
                  disabled={currentPage >= totalPages}
                  className="h-8 px-3"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4 mr-1" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentPage(totalPages)
                    setMovementsPageInput(totalPages.toString())
                  }}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
