'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Search, Edit, Trash2, X, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SupplierFormDialog } from '@/components/supplier-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { getAllSuppliers, deleteSupplier as deleteSupplierApi, getExpensesBySupplier } from '@/lib/api-client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Supplier } from '@/types'
import toast from 'react-hot-toast'
import { translateApiMessage } from '@/lib/translations'

export default function SuppliersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [isExpensesDialogOpen, setIsExpensesDialogOpen] = useState(false)
  const [supplierForExpenses, setSupplierForExpenses] = useState<Supplier | null>(null)
  const queryClient = useQueryClient()

  const { data: suppliersResponse, isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      return await getAllSuppliers()
    },
  })

  const suppliers = suppliersResponse?.data || []

  // Query for supplier expenses
  const { data: expensesResponse, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ['supplier-expenses', supplierForExpenses?.id],
    queryFn: async () => {
      if (!supplierForExpenses?.id) return null
      const response = await getExpensesBySupplier(supplierForExpenses.id, 1, 100)
      return response.isSuccess ? response.data : null
    },
    enabled: !!supplierForExpenses?.id && isExpensesDialogOpen,
  })

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter((supplier) => {
    const search = searchInput.toLowerCase()
    return (
      supplier.name.toLowerCase().includes(search) ||
      supplier.phone.toLowerCase().includes(search) ||
      supplier.address?.toLowerCase().includes(search)
    )
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteSupplierApi(id)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      const message = translateApiMessage(response.message)
      toast.success(message)
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'فشل حذف المورد'
      toast.error(translateApiMessage(errorMessage))
    },
  })

  const handleAddSupplier = () => {
    setSelectedSupplier(null)
    setIsFormOpen(true)
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsFormOpen(true)
  }

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (supplierToDelete) {
      deleteMutation.mutate(supplierToDelete.id)
      setIsDeleteDialogOpen(false)
      setSupplierToDelete(null)
    }
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setSupplierToDelete(null)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedSupplier(null)
  }

  const handleViewExpenses = (supplier: Supplier) => {
    setSupplierForExpenses(supplier)
    setIsExpensesDialogOpen(true)
  }

  const handleCloseExpensesDialog = () => {
    setIsExpensesDialogOpen(false)
    setSupplierForExpenses(null)
  }

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الموردين</h1>
          <p className="text-muted-foreground">إدارة بيانات الموردين</p>
        </div>
        <Button onClick={handleAddSupplier}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة مورد
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="البحث عن مورد..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموردين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                suppliers.reduce((sum, s) => sum + s.totalPurchased, 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا يوجد موردين
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-medium">اسم المورد</th>
                    <th className="text-right py-3 px-4 font-medium">رقم الهاتف</th>
                    <th className="text-right py-3 px-4 font-medium">العنوان</th>
                    <th className="text-right py-3 px-4 font-medium">إجمالي المشتريات</th>
                    <th className="text-right py-3 px-4 font-medium">تاريخ الإضافة</th>
                    <th className="text-right py-3 px-4 font-medium">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">{supplier.name}</td>
                      <td className="py-3 px-4 font-mono" dir="ltr">
                        {supplier.phone}
                      </td>
                      <td className="py-3 px-4">
                        {supplier.address || '-'}
                      </td>
                      <td className="py-3 px-4">
                        {formatCurrency(supplier.totalPurchased)}
                      </td>
                      <td className="py-3 px-4">
                        {formatDateTime(supplier.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewExpenses(supplier)}
                            title="عرض المشتريات"
                          >
                            <Receipt className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <SupplierFormDialog
        supplier={selectedSupplier}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="حذف المورد"
        message={`هل أنت متأكد من حذف المورد "${supplierToDelete?.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteMutation.isPending}
      />

      {/* Supplier Expenses Dialog */}
      {isExpensesDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">مشتريات من المورد</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {supplierForExpenses?.name} - {supplierForExpenses?.phone}
                </p>
              </div>
              <button
                onClick={handleCloseExpensesDialog}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {isLoadingExpenses ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
                </div>
              ) : expensesResponse?.expenses && expensesResponse.expenses.length > 0 ? (
                <>
                  {/* Summary */}
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">إجمالي المشتريات:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(expensesResponse.totalExpenses)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {expensesResponse.expenses.length} عملية شراء
                    </div>
                  </div>

                  {/* Expenses List */}
                  <div className="space-y-3">
                    {expensesResponse.expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{expense.title}</h3>
                            {expense.category && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {expense.category}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDateTime(expense.createdAt)}
                            </p>
                          </div>
                          <div className="text-left">
                            <p className="text-xl font-bold text-orange-600">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">لا توجد مشتريات من هذا المورد</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
