'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addProduct, updateProduct } from '@/lib/api-client'
import { Product, ProductFormData } from '@/types'
import toast from 'react-hot-toast'

interface ProductFormDialogProps {
  product?: Product | null
  isOpen: boolean
  onClose: () => void
}

export function ProductFormDialog({ product, isOpen, onClose }: ProductFormDialogProps) {
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    buyingPrice: 0,
    sellingPrice: 0,
    stock: 0,
    description: '',
    imageUrl: null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id,
        name: product.name,
        buyingPrice: product.buyingPrice,
        sellingPrice: product.sellingPrice,
        stock: product.stock,
        description: product.description || '',
        imageUrl: null,
      })
      setImagePreview(product.imageUrl || null)
    } else {
      setFormData({
        name: '',
        buyingPrice: 0,
        sellingPrice: 0,
        stock: 0,
        description: '',
        imageUrl: null,
      })
      setImagePreview(null)
    }
  }, [product])

  const mutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      if (product) {
        return await updateProduct(data)
      } else {
        return await addProduct(data)
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(response.message)
      onClose()
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ المنتج'
      toast.error(errorMessage)
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, imageUrl: file })
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال اسم المنتج')
      return
    }
    if (formData.buyingPrice <= 0) {
      toast.error('يرجى إدخال سعر شراء صحيح')
      return
    }
    if (formData.sellingPrice <= 0) {
      toast.error('يرجى إدخال سعر بيع صحيح')
      return
    }
    if (formData.stock < 0) {
      toast.error('يرجى إدخال كمية مخزون صحيحة')
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
            {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
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
            <Label htmlFor="name">اسم المنتج *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="أدخل اسم المنتج"
              required
              disabled={mutation.isPending}
            />
          </div>

          {/* Buying Price */}
          <div className="space-y-2">
            <Label htmlFor="buyingPrice">سعر الشراء *</Label>
            <Input
              id="buyingPrice"
              type="number"
              step="0.01"
              value={formData.buyingPrice}
              onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
              disabled={mutation.isPending}
            />
          </div>

          {/* Selling Price */}
          <div className="space-y-2">
            <Label htmlFor="sellingPrice">سعر البيع *</Label>
            <Input
              id="sellingPrice"
              type="number"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
              disabled={mutation.isPending}
            />
          </div>

          {/* Stock */}
          <div className="space-y-2">
            <Label htmlFor="stock">الكمية في المخزون *</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
              disabled={mutation.isPending}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="أدخل وصف المنتج (اختياري)"
              className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={mutation.isPending}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">صورة المنتج</Label>
            <div className="flex flex-col gap-3">
              {imagePreview && (
                <div className="relative w-full h-40 border rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="relative">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={mutation.isPending}
                />
                <label
                  htmlFor="image"
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background rounded-md cursor-pointer hover:bg-accent transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">
                    {formData.imageUrl ? 'تغيير الصورة' : 'رفع صورة'}
                  </span>
                </label>
              </div>
            </div>
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
                product ? 'تحديث المنتج' : 'إضافة المنتج'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
