'use client'

import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Building2, Tag, DollarSign, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addFixedAsset, updateFixedAsset } from '@/lib/api-client'
import { FixedAsset, CreateFixedAssetRequest, UpdateFixedAssetRequest } from '@/types'
import { translateApiMessage } from '@/lib/translations'
import toast from 'react-hot-toast'

interface FixedAssetFormDialogProps {
  asset?: FixedAsset | null
  isOpen: boolean
  onClose: () => void
}

export function FixedAssetFormDialog({ asset, isOpen, onClose }: FixedAssetFormDialogProps) {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [usefulLifeMonths, setUsefulLifeMonths] = useState('')

  useEffect(() => {
    if (asset) {
      setName(asset.name)
      setCategory(asset.category || '')
      setPurchasePrice(asset.purchaseCost.toString())
      setPurchaseDate(asset.purchaseDate.split('T')[0])
      setUsefulLifeMonths(asset.usefulLifeMonths.toString())
    } else {
      setName('')
      setCategory('')
      setPurchasePrice('')
      setPurchaseDate(new Date().toISOString().split('T')[0])
      setUsefulLifeMonths('')
    }
  }, [asset, isOpen])

  const mutation = useMutation({
    mutationFn: async (data: CreateFixedAssetRequest | UpdateFixedAssetRequest) => {
      if (asset) {
        return await updateFixedAsset(data as UpdateFixedAssetRequest)
      } else {
        return await addFixedAsset(data as CreateFixedAssetRequest)
      }
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ['fixed-assets'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        toast.success(translateApiMessage(response.message))
        onClose()
      } else {
        toast.error(translateApiMessage(response.message))
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء حفظ الأصل الثابت'
      toast.error(translateApiMessage(errorMessage))
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error('يرجى إدخال اسم الأصل الثابت')
      return
    }

    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      toast.error('يرجى إدخال سعر شراء صحيح')
      return
    }

    if (!purchaseDate) {
      toast.error('يرجى إدخال تاريخ الشراء')
      return
    }

    if (!usefulLifeMonths || parseInt(usefulLifeMonths) <= 0) {
      toast.error('يرجى إدخال العمر الإنتاجي بالأشهر')
      return
    }

    const data: CreateFixedAssetRequest | UpdateFixedAssetRequest = asset
      ? {
          id: asset.id,
          name: name.trim(),
          category: category.trim() || null,
          purchaseCost: parseFloat(purchasePrice),
          purchaseDate: purchaseDate,
          usefulLifeMonths: parseInt(usefulLifeMonths),
        }
      : {
          name: name.trim(),
          category: category.trim() || null,
          purchasePrice: parseFloat(purchasePrice),
          purchaseDate: purchaseDate,
          usefulLifeMonths: parseInt(usefulLifeMonths),
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
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {asset ? 'تعديل أصل ثابت' : 'إضافة أصل ثابت جديد'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {asset ? 'قم بتعديل بيانات الأصل الثابت' : 'سجل أصل ثابت مع استهلاك تلقائي'}
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
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 font-semibold">
              <Building2 className="h-4 w-4 text-blue-600" />
              اسم الأصل الثابت *
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: سيارة النقل - تويوتا هايلوكس"
              maxLength={200}
              required
              disabled={mutation.isPending}
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground">{name.length}/200 حرف</p>
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
              placeholder="مثال: معدات، مركبات، أثاث، أجهزة"
              maxLength={100}
              disabled={mutation.isPending}
            />
          </div>

          {/* Purchase Price */}
          <div className="space-y-2">
            <Label htmlFor="purchasePrice" className="flex items-center gap-2 font-semibold">
              <DollarSign className="h-4 w-4 text-green-600" />
              سعر الشراء *
            </Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              min="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="0.00"
              required
              disabled={!!mutation.isPending || (!!asset && asset.accumulatedDepreciation > 0)}
              className="text-2xl font-bold text-green-600"
            />
            {asset && asset.accumulatedDepreciation > 0 && (
              <p className="text-xs text-orange-600">
                ⚠️ لا يمكن تعديل سعر الشراء بعد بدء الاستهلاك
              </p>
            )}
          </div>

          {/* Purchase Date */}
          <div className="space-y-2">
            <Label htmlFor="purchaseDate" className="flex items-center gap-2 font-semibold">
              <Calendar className="h-4 w-4 text-blue-600" />
              تاريخ الشراء *
            </Label>
            <Input
              id="purchaseDate"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              disabled={mutation.isPending}
              className="text-lg"
            />
          </div>

          {/* Useful Life Months */}
          <div className="space-y-2">
            <Label htmlFor="usefulLifeMonths" className="flex items-center gap-2 font-semibold">
              <Clock className="h-4 w-4 text-orange-600" />
              العمر الإنتاجي (بالأشهر) *
            </Label>
            <Input
              id="usefulLifeMonths"
              type="number"
              step="1"
              min="1"
              value={usefulLifeMonths}
              onChange={(e) => setUsefulLifeMonths(e.target.value)}
              placeholder="مثال: 60 (5 سنوات)"
              required
              disabled={!!mutation.isPending || (!!asset && asset.accumulatedDepreciation > 0)}
              className="text-lg"
            />
            {usefulLifeMonths && parseInt(usefulLifeMonths) > 0 && (
              <p className="text-xs text-muted-foreground">
                = {(parseInt(usefulLifeMonths) / 12).toFixed(1)} سنة
              </p>
            )}
            {asset && asset.accumulatedDepreciation > 0 && (
              <p className="text-xs text-orange-600">
                ⚠️ لا يمكن تعديل العمر الإنتاجي بعد بدء الاستهلاك
              </p>
            )}
          </div>

          {/* Monthly Depreciation Preview (for new assets) */}
          {!asset && purchasePrice && usefulLifeMonths && parseFloat(purchasePrice) > 0 && parseInt(usefulLifeMonths) > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                الاستهلاك الشهري المتوقع:
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {(parseFloat(purchasePrice) / parseInt(usefulLifeMonths)).toFixed(2)} جنيه
              </p>
            </div>
          )}

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
              {mutation.isPending ? 'جاري الحفظ...' : asset ? 'تحديث الأصل' : 'إضافة الأصل'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
