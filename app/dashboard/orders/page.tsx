'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ShoppingCart, Eye, Printer, X, Filter, Calendar, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllOrders, getOrderById, deleteOrder } from '@/lib/api-client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Order, FilterType } from '@/types'
import { translateApiMessage } from '@/lib/translations'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { OrderFormDialog } from '@/components/order-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'

export default function OrdersPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [filterType, setFilterType] = useState<FilterType | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', currentPage, pageSize, filterType, startDate, endDate],
    queryFn: async () => {
      try {
        const response = await getAllOrders({ 
          pageNum: currentPage, 
          pageSize: pageSize,
          filterType: filterType,
          startDate: filterType === FilterType.Custom ? startDate : null,
          endDate: filterType === FilterType.Custom ? endDate : null,
        })
        if (response.isSuccess) {
          console.log('Orders data:', response.data)
          return response.data
        } else {
          const errorMsg = translateApiMessage(response.message)
          toast.error(errorMsg)
          return []
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء تحميل الطلبات'
        toast.error(translateApiMessage(errorMsg))
        return []
      }
    },
  })

  const getFilterTypeLabel = (type: FilterType | null) => {
    if (type === null) return 'الكل'
    if (type === FilterType.Today) return 'اليوم'
    if (type === FilterType.ThisWeek) return 'هذا الأسبوع'
    if (type === FilterType.ThisMonth) return 'هذا الشهر'
    if (type === FilterType.Custom) return 'مخصص'
    return 'الكل'
  }

  const handleViewDetails = async (orderId: string) => {
    setIsLoadingDetails(true)
    try {
      const response = await getOrderById(orderId)
      if (response.isSuccess) {
        setSelectedOrder(response.data)
        setIsDetailDialogOpen(true)
      } else {
        toast.error(translateApiMessage(response.message))
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء تحميل التفاصيل'
      toast.error(translateApiMessage(errorMsg))
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handlePrintInvoice = (order: Order) => {
    // Create a printable invoice
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('يرجى السماح بفتح النوافذ المنبثقة')
      return
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>فاتورة #${order.invoiceNumber}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            padding: 20px;
            direction: rtl;
          }
          .invoice-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .invoice-header h1 {
            margin: 0;
            font-size: 28px;
          }
          .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          .invoice-info div {
            flex: 1;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
          }
          th {
            background-color: #f4f4f4;
            font-weight: bold;
          }
          .totals {
            margin-top: 20px;
            text-align: left;
          }
          .totals div {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .totals .total {
            font-size: 20px;
            font-weight: bold;
            border-top: 2px solid #333;
            margin-top: 10px;
            padding-top: 10px;
          }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-header">
          <h1>فاتورة مبيعات</h1>
          <p>رقم الفاتورة: ${order.invoiceNumber}</p>
          <p>التاريخ: ${formatDateTime(order.createdAt)}</p>
        </div>
        
        <div class="invoice-info">
          <div>
            <strong>معلومات الفاتورة:</strong><br>
            ${order.customerName ? `العميل: ${order.customerName}` : 'زبون عابر'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>سعر الوحدة</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${order.orderItems.map(item => `
              <tr>
                <td>${item.productName || item.product?.name || 'منتج'}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${formatCurrency(item.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <div>
            <span>المجموع الفرعي:</span>
            <span>${formatCurrency(order.totalCost)}</span>
          </div>
          ${order.discount > 0 ? `
            <div>
              <span>الخصم (${order.discount}%):</span>
              <span>-${formatCurrency((order.totalCost * order.discount) / 100)}</span>
            </div>
          ` : ''}
          <div class="total">
            <span>الإجمالي النهائي:</span>
            <span>${formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        ${order.notes ? `
          <div style="margin-top: 20px;">
            <strong>ملاحظات:</strong>
            <p>${order.notes}</p>
          </div>
        ` : ''}

        <div style="margin-top: 50px; text-align: center; color: #666;">
          <p>شكراً لتعاملكم معنا</p>
        </div>

        <button onclick="window.print()" style="margin: 20px auto; display: block; padding: 10px 30px; font-size: 16px; cursor: pointer;">
          طباعة
        </button>
      </body>
      </html>
    `

    printWindow.document.write(invoiceHTML)
    printWindow.document.close()
  }

  const handleCreateNewOrder = () => {
    setIsOrderFormOpen(true)
  }

  const deleteMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast.success(translateApiMessage(response.message))
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        setIsDeleteDialogOpen(false)
        setOrderToDelete(null)
      } else {
        toast.error(translateApiMessage(response.message))
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء حذف الطلب'
      toast.error(translateApiMessage(errorMsg))
    },
  })

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (orderToDelete) {
      deleteMutation.mutate(orderToDelete.id)
    }
  }

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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 ml-2" />
            تصفية
          </Button>
          <Button onClick={handleCreateNewOrder}>
            <Plus className="ml-2 h-4 w-4" />
            إنشاء طلب جديد
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Button 
                  variant={filterType === null ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => {
                    setFilterType(null)
                    setCurrentPage(1)
                  }}
                >
                  الكل
                </Button>
                <Button 
                  variant={filterType === FilterType.Today ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => {
                    setFilterType(FilterType.Today)
                    setCurrentPage(1)
                  }}
                >
                  اليوم
                </Button>
                <Button 
                  variant={filterType === FilterType.ThisWeek ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => {
                    setFilterType(FilterType.ThisWeek)
                    setCurrentPage(1)
                  }}
                >
                  هذا الأسبوع
                </Button>
                <Button 
                  variant={filterType === FilterType.ThisMonth ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => {
                    setFilterType(FilterType.ThisMonth)
                    setCurrentPage(1)
                  }}
                >
                  هذا الشهر
                </Button>
                <Button 
                  variant={filterType === FilterType.Custom ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => {
                    setFilterType(FilterType.Custom)
                    setCurrentPage(1)
                  }}
                >
                  مخصص
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
              <div className="text-sm text-muted-foreground">
                الفلتر الحالي: <span className="font-semibold">{getFilterTypeLabel(filterType)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                    فاتورة #{order.invoiceNumber}
                  </CardTitle>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    مكتمل
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
                    <span>{order.orderItems?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الخصم:</span>
                      <span className="text-orange-600">{order.discount}%</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الإجمالي:</span>
                    <span className="font-bold text-lg">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الربح:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(order.totalProfit)}
                    </span>
                  </div>
                  {order.notes && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ملاحظات:</span>
                      <span className="text-sm">{order.notes}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewDetails(order.id)}
                    disabled={isLoadingDetails}
                  >
                    <Eye className="ml-2 h-4 w-4" />
                    عرض التفاصيل
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handlePrintInvoice(order)}
                  >
                    <Printer className="ml-2 h-4 w-4" />
                    طباعة الفاتورة
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteClick(order)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {orders && orders.length > 0 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            الصفحة {currentPage}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={orders.length < pageSize}
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Order Form Dialog */}
      <OrderFormDialog 
        isOpen={isOrderFormOpen} 
        onClose={() => setIsOrderFormOpen(false)} 
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setOrderToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف الطلب"
        message={`هل أنت متأكد من حذف الطلب #${orderToDelete?.invoiceNumber}؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteMutation.isPending}
      />

      {/* Order Details Dialog */}
      {isDetailDialogOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setIsDetailDialogOpen(false)}>
          <div className="bg-background rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">تفاصيل الفاتورة #{selectedOrder.invoiceNumber}</h2>
                <p className="text-sm text-muted-foreground">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsDetailDialogOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">{selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">رقم الفاتورة:</span>
                  <p className="font-medium">{selectedOrder.invoiceNumber}</p>
                </div>
                {selectedOrder.customerName && (
                  <div>
                    <span className="text-sm text-muted-foreground">اسم العميل:</span>
                    <p className="font-medium">{selectedOrder.customerName}</p>
                  </div>
                )}
                {selectedOrder.discount > 0 && (
                  <div>
                    <span className="text-sm text-muted-foreground">الخصم:</span>
                    <p className="font-medium text-orange-600">{selectedOrder.discount}%</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <span className="text-sm text-muted-foreground">ملاحظات:</span>
                    <p className="font-medium">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-3">المنتجات</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-right p-3 text-sm font-medium">المنتج</th>
                        <th className="text-right p-3 text-sm font-medium">الكمية</th>
                        <th className="text-right p-3 text-sm font-medium">سعر الوحدة</th>
                        <th className="text-right p-3 text-sm font-medium">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.orderItems.map((item, index) => (
                        <tr key={item.id || index} className={index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{item.productName || item.product?.name || 'منتج'}</p>
                              {item.product?.description && (
                                <p className="text-xs text-muted-foreground">{item.product.description}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">{formatCurrency(item.unitPrice)}</td>
                          <td className="p-3 font-medium">{formatCurrency(item.totalPrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">التكلفة الإجمالية:</span>
                    <span className="font-medium">{formatCurrency(selectedOrder.totalCost)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">بعد الخصم ({selectedOrder.discount}%):</span>
                      <span className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>المبلغ النهائي:</span>
                    <span className="text-green-600">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الربح:</span>
                    <span className="font-bold text-green-600">{formatCurrency(selectedOrder.totalProfit)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button 
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  className="flex-1"
                >
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة الفاتورة
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setIsDetailDialogOpen(false)}
                  className="flex-1"
                >
                  إغلاق
                </Button>
              </div>
            </div>
          )}</div>
          </div>
        </div>
      )}
    </div>
  )
}
