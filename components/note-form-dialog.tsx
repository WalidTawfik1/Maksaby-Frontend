'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, FileText, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { addNote, updateNote, getAllCustomers } from '@/lib/api-client'
import { Note, CreateNoteRequest, UpdateNoteRequest } from '@/types'
import { translateApiMessage } from '@/lib/translations'
import toast from 'react-hot-toast'

interface NoteFormDialogProps {
  note?: Note | null
  isOpen: boolean
  onClose: () => void
}

export function NoteFormDialog({ note, isOpen, onClose }: NoteFormDialogProps) {
  const queryClient = useQueryClient()
  const [content, setContent] = useState('')
  const [customerId, setCustomerId] = useState<string>('')

  // Fetch customers for optional linking
  const { data: customersResponse } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getAllCustomers({ pageSize: 100 }),
  })

  const customers = customersResponse?.data || []

  useEffect(() => {
    if (note) {
      setContent(note.content)
      setCustomerId(note.customerId || '')
    } else {
      setContent('')
      setCustomerId('')
    }
  }, [note, isOpen])

  const mutation = useMutation({
    mutationFn: async (data: CreateNoteRequest | UpdateNoteRequest) => {
      if (note) {
        return await updateNote(data as UpdateNoteRequest)
      } else {
        return await addNote(data as CreateNoteRequest)
      }
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ['notes'] })
        toast.success(translateApiMessage(response.message))
        onClose()
      } else {
        toast.error(translateApiMessage(response.message))
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ الملاحظة'
      toast.error(translateApiMessage(errorMessage))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('يرجى إدخال محتوى الملاحظة')
      return
    }

    const data: CreateNoteRequest | UpdateNoteRequest = note
      ? {
          id: note.id,
          content: content.trim(),
          customerId: customerId || null,
        }
      : {
          content: content.trim(),
          customerId: customerId || null,
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
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {note ? 'تعديل ملاحظة' : 'إضافة ملاحظة جديدة'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {note ? 'قم بتعديل محتوى الملاحظة' : 'سجل ملاحظة أو مهمة للمتابعة'}
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
          {/* Customer (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="customer" className="flex items-center gap-2 font-semibold">
              <User className="h-4 w-4 text-blue-600" />
              ربط بعميل (اختياري)
            </Label>
            <select
              id="customer"
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
              disabled={mutation.isPending}
            >
              <option value="">ملاحظة عامة (غير مرتبطة بعميل)</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.phone}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              اختر عميل إذا كانت الملاحظة متعلقة بعميل معين
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="flex items-center gap-2 font-semibold">
              <FileText className="h-4 w-4 text-purple-600" />
              محتوى الملاحظة *
            </Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="مثال: الاتصال بالعميل الأسبوع القادم بخصوص خصم الطلبات الكبيرة..."
              maxLength={2000}
              rows={6}
              required
              disabled={mutation.isPending}
              className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            />
            <p className="text-xs text-muted-foreground">{content.length}/2000 حرف</p>
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
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {mutation.isPending ? 'جاري الحفظ...' : note ? 'تحديث الملاحظة' : 'إضافة الملاحظة'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
