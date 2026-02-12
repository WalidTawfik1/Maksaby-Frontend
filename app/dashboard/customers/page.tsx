'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Search, Edit, Trash2, ShoppingCart, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerFormDialog } from '@/components/customer-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { getAllCustomers, deleteCustomer as deleteCustomerApi, getOrdersByCustomerId } from '@/lib/api-client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Customer, Order } from '@/types'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [pageInput, setPageInput] = useState('1')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false)
  const [customerForHistory, setCustomerForHistory] = useState<Customer | null>(null)
  const queryClient = useQueryClient()

  const { data: customersResponse, isLoading } = useQuery({
    queryKey: ['customers', currentPage, pageSize, searchQuery],
    queryFn: async () => {
      return await getAllCustomers({
        pageNum: currentPage,
        pageSize: pageSize,
        searchTerm: searchQuery,
      })
    },
  })

  const customers = customersResponse?.data?.customers || []
  const totalPages = customersResponse?.data?.totalPages || 1
  const totalCount = customersResponse?.data?.totalCount || 0

  // Query for customer orders
  const { data: customerOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['customer-orders', customerForHistory?.id],
    queryFn: async () => {
      if (!customerForHistory?.id) return []
      const response = await getOrdersByCustomerId(customerForHistory.id, 1, 50)
      return response.isSuccess ? (response.data?.orders || []) : []
    },
    enabled: !!customerForHistory?.id && isPurchaseHistoryOpen,
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteCustomerApi(id)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success('تم حذف العميل بنجاح')
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'فشل حذف العميل'
      toast.error(errorMessage)
    },
  })

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleAddCustomer = () => {
    setSelectedCustomer(null)
    setIsFormOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsFormOpen(true)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.id)
      setIsDeleteDialogOpen(false)
      setCustomerToDelete(null)
    }
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setCustomerToDelete(null)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedCustomer(null)
  }

  const handleViewPurchaseHistory = (customer: Customer) => {
    setCustomerForHistory(customer)
    setIsPurchaseHistoryOpen(true)
  }

  const handleClosePurchaseHistory = () => {
    setIsPurchaseHistoryOpen(false)
    setCustomerForHistory(null)
  }

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
        <Button onClick={handleAddCustomer}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة عميل
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="البحث عن عميل... (اضغط Enter للبحث)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          className="pr-10"
        />
      </div>

      {/* Customers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customers?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا يوجد عملاء</p>
            </CardContent>
          </Card>
        ) : (
          customers?.map((customer) => (
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
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={() => handleViewPurchaseHistory(customer)}
                >
                  <ShoppingCart className="ml-2 h-3 w-3" />
                  عرض سجل المشتريات
                </Button>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditCustomer(customer)}
                  >
                    <Edit className="ml-1 h-3 w-3" />
                    تعديل
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteCustomer(customer)}
                  >
                    <Trash2 className="ml-1 h-3 w-3" />
                    حذف
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Customer Form Dialog */}
      <CustomerFormDialog
        customer={selectedCustomer}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="حذف العميل"
        message={`هل أنت متأكد من حذف العميل "${customerToDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteMutation.isPending}
      />

      {/* Pagination */}
      {customers.length > 0 && (
        <div className="flex items-center justify-center pt-4">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCurrentPage(1)
                setPageInput('1')
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
                setPageInput(newPage.toString())
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
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const page = parseInt(pageInput)
                    if (page >= 1 && page <= totalPages) {
                      setCurrentPage(page)
                    } else {
                      setPageInput(currentPage.toString())
                    }
                  }
                }}
                onBlur={() => setPageInput(currentPage.toString())}
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
                setPageInput(newPage.toString())
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
                setPageInput(totalPages.toString())
              }}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Purchase History Dialog */}
      {isPurchaseHistoryOpen && customerForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClosePurchaseHistory}>
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">سجل مشتريات {customerForHistory.name}</h2>
                <p className="text-sm text-muted-foreground">
                  إجمالي المشتريات: {formatCurrency(customerForHistory.totalSpent)}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleClosePurchaseHistory}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-6">
              {isLoadingOrders ? (
                <div className="text-center py-8">جاري التحميل...</div>
              ) : customerOrders && customerOrders.length > 0 ? (
                <div className="space-y-4">
                  {customerOrders.map((order: Order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">فاتورة #{order.invoiceNumber}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatDateTime(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-sm text-muted-foreground">الإجمالي</p>
                            <p className="text-xl font-bold text-primary">
                              {formatCurrency(order.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">عدد المنتجات:</span>
                            <span>{order.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">الخصم:</span>
                              <span className="text-orange-600">{order.discount}%</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">الربح:</span>
                            <span className="font-semibold text-green-600">
                              {formatCurrency(order.totalProfit)}
                            </span>
                          </div>
                          {order.notes && (
                            <div className="pt-2 border-t">
                              <p className="text-sm text-muted-foreground">ملاحظات:</p>
                              <p className="text-sm">{order.notes}</p>
                            </div>
                          )}
                          {order.orderItems && order.orderItems.length > 0 && (
                            <div className="pt-2 border-t">
                              <p className="text-sm font-semibold mb-2">المنتجات:</p>
                              <div className="space-y-1">
                                {order.orderItems.map((item, index) => (
                                  <div key={index} className="flex justify-between text-sm bg-muted/50 p-2 rounded">
                                    <span>{item.productName} × {item.quantity}</span>
                                    <span className="font-medium">{formatCurrency(item.totalPrice)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">لا توجد مشتريات لهـــــــذا العميل</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
