'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Users, Search, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CustomerFormDialog } from '@/components/customer-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { getAllCustomers, deleteCustomer as deleteCustomerApi } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import { Customer } from '@/types'
import toast from 'react-hot-toast'

export default function CustomersPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const queryClient = useQueryClient()

  const { data: customersResponse, isLoading } = useQuery({
    queryKey: ['customers', searchQuery],
    queryFn: async () => {
      return await getAllCustomers({
        pageNum: 1,
        pageSize: 50,
        searchTerm: searchQuery,
      })
    },
  })

  const customers = customersResponse?.data || []

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
                <Button variant="outline" size="sm" className="w-full mt-3">
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
    </div>
  )
}
