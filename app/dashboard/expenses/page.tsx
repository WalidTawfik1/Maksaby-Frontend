'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, DollarSign, Filter, Calendar, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAllExpenses, deleteExpense } from '@/lib/api-client'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Expense, FilterType } from '@/types'
import { translateApiMessage } from '@/lib/translations'
import toast from 'react-hot-toast'
import { ExpenseFormDialog } from '@/components/expense-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'

export default function ExpensesPage() {
  const queryClient = useQueryClient()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null)
  const [filterType, setFilterType] = useState<FilterType | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const { data: expensesData, isLoading } = useQuery({
    queryKey: ['expenses', currentPage, pageSize, filterType, startDate, endDate],
    queryFn: async () => {
      try {
        const response = await getAllExpenses({
          pageNum: currentPage,
          pageSize: pageSize,
          filterType: filterType,
          startDate: filterType === FilterType.Custom ? startDate : null,
          endDate: filterType === FilterType.Custom ? endDate : null,
        })
        if (response.isSuccess) {
          return response.data
        } else {
          toast.error(translateApiMessage(response.message))
          return { expenses: [], totalExpenses: 0 }
        }
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء تحميل المصروفات'
        toast.error(translateApiMessage(errorMsg))
        return { expenses: [], totalExpenses: 0 }
      }
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast.success(translateApiMessage(response.message))
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        setIsDeleteDialogOpen(false)
        setExpenseToDelete(null)
      } else {
        toast.error(translateApiMessage(response.message))
      }
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء حذف المصروف'
      toast.error(translateApiMessage(errorMsg))
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

  const handleAddExpense = () => {
    setSelectedExpense(null)
    setIsFormOpen(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense)
    setIsFormOpen(true)
  }

  const handleDeleteClick = (expense: Expense) => {
    setExpenseToDelete(expense)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete.id)
    }
  }

  const expenses = expensesData?.expenses || []
  const totalExpenses = expensesData?.totalExpenses || 0

  if (isLoading) {
    return <div className="text-center">جاري التحميل...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">المصروفات</h1>
          <p className="text-muted-foreground">إدارة مصروفات العمل والتشغيل</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 ml-2" />
            تصفية
          </Button>
          <Button onClick={handleAddExpense}>
            <Plus className="ml-2 h-4 w-4" />
            إضافة مصروف
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              تصفية المصروفات
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
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
                <Calendar className="h-4 w-4 ml-2" />
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
          </CardContent>
        </Card>
      )}

      {/* Total Summary */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
            <DollarSign className="h-5 w-5" />
            إجمالي المصروفات ({getFilterTypeLabel(filterType)})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-orange-600">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            عدد المصروفات: {expenses?.length || 0}
          </p>
        </CardContent>
      </Card>

      {/* Expenses List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {expenses.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">لا توجد مصروفات</p>
            </CardContent>
          </Card>
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">
                      {expense.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDateTime(expense.createdAt)}
                    </p>
                  </div>
                  {expense.category && (
                    <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs font-medium">
                      {expense.category}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-3 border-t border-b">
                  <span className="text-muted-foreground">المبلغ:</span>
                  <span className="text-2xl font-bold text-orange-600">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditExpense(expense)}
                  >
                    <Edit className="ml-1 h-3 w-3" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(expense)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {expenses.length > 0 && (
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
              disabled={expenses.length < pageSize}
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Expense Form Dialog */}
      <ExpenseFormDialog
        expense={selectedExpense}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedExpense(null)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setExpenseToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        title="تأكيد حذف المصروف"
        message={`هل أنت متأكد من حذف المصروف "${expenseToDelete?.title}"؟ هذا الإجراء نهائي ولا يمكن التراجع عنه.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
