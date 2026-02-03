'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addSupplier, updateSupplier } from '@/lib/api-client'
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '@/types'
import toast from 'react-hot-toast'
import { translateApiMessage } from '@/lib/translations'

interface SupplierFormDialogProps {
  supplier?: Supplier | null
  isOpen: boolean
  onClose: () => void
}

export function SupplierFormDialog({ supplier, isOpen, onClose }: SupplierFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<CreateSupplierRequest & { id?: string }>({
    name: '',
    phone: '',
    email: '',
    address: '',
  })

  // Update form when supplier changes
  useEffect(() => {
    if (supplier) {
      setFormData({
        id: supplier.id,
        name: supplier.name,
        phone: supplier.phone,
        email: supplier.email || '',
        address: supplier.address || '',
      })
    } else {
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
      })
    }
  }, [supplier])

  const mutation = useMutation({
    mutationFn: async (data: CreateSupplierRequest & { id?: string }) => {
      if (supplier && data.id) {
        const updateData: UpdateSupplierRequest = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
        }
        return await updateSupplier(updateData)
      } else {
        return await addSupplier(data)
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      const message = translateApiMessage(response.message)
      toast.success(message)
      onClose()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ المورد'
      toast.error(translateApiMessage(errorMessage))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم المورد')
      return
    }
    if (!formData.phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف')
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
            {supplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
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
            <Label htmlFor="name">اسم المورد *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم المورد"
              disabled={mutation.isPending}
              maxLength={200}
              required
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
              disabled={mutation.isPending}
              maxLength={20}
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني (اختياري)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="أدخل البريد الإلكتروني"
              disabled={mutation.isPending}
            />
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">العنوان (اختياري)</Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="أدخل العنوان"
              disabled={mutation.isPending}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {supplier ? 'تحديث' : 'إضافة'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
