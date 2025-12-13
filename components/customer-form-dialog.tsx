'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addCustomer, updateCustomer } from '@/lib/api-client'
import { Customer, CustomerFormData } from '@/types'
import toast from 'react-hot-toast'

interface CustomerFormDialogProps {
  customer?: Customer | null
  isOpen: boolean
  onClose: () => void
}

export function CustomerFormDialog({ customer, isOpen, onClose }: CustomerFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
  })

  // Update form when customer changes
  useEffect(() => {
    if (customer) {
      setFormData({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email || '',
        address: customer.address,
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
      })
    }
  }, [customer])

  const mutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      if (customer) {
        return await updateCustomer(data)
      } else {
        return await addCustomer(data)
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      toast.success(customer ? 'تم تحديث العميل بنجاح' : 'تم إضافة العميل بنجاح')
      onClose()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ العميل'
      toast.error(errorMessage)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم العميل')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف')
      return
    }
    if (!formData.address.trim()) {
      toast.error('يرجى إدخال العنوان')
      return
    }

    mutation.mutate(formData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {customer ? 'تعديل العميل' : 'إضافة عميل جديد'}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            disabled={mutation.isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">اسم العميل *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم العميل"
              required
              disabled={mutation.isPending}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="أدخل رقم الهاتف"
              required
              disabled={mutation.isPending}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="أدخل البريد الإلكتروني (اختياري)"
              disabled={mutation.isPending}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">العنوان *</Label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="أدخل العنوان"
              className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              required
              disabled={mutation.isPending}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={mutation.isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                customer ? 'تحديث العميل' : 'إضافة العميل'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
