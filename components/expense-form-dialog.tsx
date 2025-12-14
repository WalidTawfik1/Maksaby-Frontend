'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, DollarSign, Tag, FileText, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addExpense, updateExpense, getAllProducts } from '@/lib/api-client'
import { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '@/types'
import { translateApiMessage } from '@/lib/translations'
import toast from 'react-hot-toast'

interface ExpenseFormDialogProps {
  expense?: Expense | null
  isOpen: boolean
  onClose: () => void
}

export function ExpenseFormDialog({ expense, isOpen, onClose }: ExpenseFormDialogProps) {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [productId, setProductId] = useState<string>('')

  // Fetch products for optional linking
  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProducts({ pageSize: 100 }),
  })

  const products = productsResponse?.data || []

  useEffect(() => {
    if (expense) {
      setTitle(expense.title)
      setCategory(expense.category || '')
      setAmount(expense.amount.toString())
      setProductId(expense.productId || '')
    } else {
      setTitle('')
      setCategory('')
      setAmount('')
      setProductId('')
    }
  }, [expense, isOpen])

  const mutation = useMutation({
    mutationFn: async (data: CreateExpenseRequest | UpdateExpenseRequest) => {
      if (expense) {
        return await updateExpense(data as UpdateExpenseRequest)
      } else {
        return await addExpense(data as CreateExpenseRequest)
      }
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ['expenses'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        toast.success(translateApiMessage(response.message))
        onClose()
      } else {
        toast.error(translateApiMessage(response.message))
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ المصروف'
      toast.error(translateApiMessage(errorMessage))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان المصروف')
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح')
      return
    }

    const data: CreateExpenseRequest | UpdateExpenseRequest = expense
      ? {
          id: expense.id,
          title: title.trim(),
          category: category.trim() || null,
          amount: parseFloat(amount),
          productId: productId || null,
        }
      : {
          title: title.trim(),
          category: category.trim() || null,
          amount: parseFloat(amount),
          productId: productId || null,
        }

    mutation.mutate(data)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {expense ? 'تعديل مصروف' : 'إضافة مصروف جديد'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {expense ? 'قم بتعديل بيانات المصروف' : 'سجل مصروفات العمل والتشغيل'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            disabled={mutation.isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2 font-semibold">
              <FileText className="h-4 w-4 text-blue-600" />
              عنوان المصروف *
            </Label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: إيجار المكتب - ديسمبر 2025"
              maxLength={200}
              required
              disabled={mutation.isPending}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">{title.length}/200 حرف</p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2 font-semibold">
              <Tag className="h-4 w-4 text-purple-600" />
              الفئة (اختياري)
            </Label>
            <Input
              id="category"
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="مثال: تشغيلي، شراء مخزون، مرافق"
              maxLength={100}
              disabled={mutation.isPending}
            />
          </div>

          {/* Product (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="product" className="flex items-center gap-2 font-semibold">
              <Package className="h-4 w-4 text-green-600" />
              ربط بمنتج (اختياري)
            </Label>
            <select
              id="product"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={mutation.isPending}
            >
              <option value="">بدون ربط بمنتج</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              اختر منتج إذا كان المصروف متعلق بشراء مخزون معين
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2 font-semibold">
              <DollarSign className="h-4 w-4 text-orange-600" />
              المبلغ *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              disabled={mutation.isPending}
              className="text-2xl font-bold text-orange-600"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {mutation.isPending ? 'جاري الحفظ...' : expense ? 'تحديث المصروف' : 'إضافة المصروف'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
