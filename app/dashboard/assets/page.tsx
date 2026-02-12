'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Building2, Search, Edit, Trash2, TrendingDown, CheckCircle, XCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FixedAssetFormDialog } from '@/components/fixed-asset-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { getAllFixedAssets, deleteFixedAsset } from '@/lib/api-client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FixedAsset } from '@/types'
import toast from 'react-hot-toast'
import { translateApiMessage } from '@/lib/translations'

export default function FixedAssetsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [pageInput, setPageInput] = useState('1')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<FixedAsset | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [assetToDelete, setAssetToDelete] = useState<FixedAsset | null>(null)
  const queryClient = useQueryClient()

  const { data: response, isLoading } = useQuery({
    queryKey: ['fixed-assets', currentPage, pageSize, searchQuery],
    queryFn: async () => {
      return await getAllFixedAssets({
        pageNum: currentPage,
        pageSize: pageSize,
        searchTerm: searchQuery,
      })
    },
  })

  const assets = response?.data?.fixedAssets || []
  const totalFixedAssets = response?.data?.totalFixedAssets || 0
  const totalPages = response?.data?.totalPages || 1
  const totalCount = response?.data?.totalCount || 0

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteFixedAsset(id)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['fixed-assets'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
      toast.success(translateApiMessage(response.message))
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'فشل حذف الأصل الثابت'
      toast.error(translateApiMessage(errorMessage))
    },
  })

  const handleAddAsset = () => {
    setSelectedAsset(null)
    setIsFormOpen(true)
  }

  const handleEditAsset = (asset: FixedAsset) => {
    setSelectedAsset(asset)
    setIsFormOpen(true)
  }

  const handleDeleteAsset = (asset: FixedAsset) => {
    setAssetToDelete(asset)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (assetToDelete) {
      deleteMutation.mutate(assetToDelete.id)
      setIsDeleteDialogOpen(false)
      setAssetToDelete(null)
    }
  }

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setAssetToDelete(null)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedAsset(null)
  }

  const calculateDepreciationPercentage = (accumulated: number, total: number) => {
    if (total === 0) return 0
    return ((accumulated / total) * 100).toFixed(1)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الأصول الثابتة</h1>
          <p className="text-muted-foreground">إدارة الأصول الثابتة مع استهلاك تلقائي</p>
        </div>
        <Button onClick={handleAddAsset}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة أصل ثابت
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي قيمة الأصول</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalFixedAssets)}</div>
            <p className="text-xs text-muted-foreground">تكلفة الشراء الإجمالية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأصول النشطة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assets.filter(a => a.isActive).length}</div>
            <p className="text-xs text-muted-foreground">أصول قيد الاستخدام</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">عدد الأصول</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">إجمالي الأصول المسجلة</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث عن أصل... (اضغط Enter للبحث)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            className="pr-10"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assets.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد أصول ثابتة'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddAsset} className="mt-4">
                <Plus className="ml-2 h-4 w-4" />
                إضافة أصل ثابت جديد
              </Button>
            )}
          </div>
        ) : (
          assets.map((asset) => (
            <Card key={asset.id} className={`hover:shadow-lg transition-shadow ${!asset.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg truncate mb-1" title={asset.name}>
                      {asset.name}
                    </CardTitle>
                    {asset.category && (
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {asset.category}
                      </span>
                    )}
                  </div>
                  <div>
                    {asset.isActive ? (
                      <div title="نشط">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    ) : (
                      <div title="غير نشط">
                        <XCircle className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">تكلفة الشراء:</span>
                  <span className="font-semibold">{formatCurrency(asset.purchaseCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">القيمة الدفترية:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(asset.currentBookValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الاستهلاك المتراكم:</span>
                  <span className="text-orange-600">
                    {formatCurrency(asset.accumulatedDepreciation)}
                  </span>
                </div>
                
                {/* Depreciation Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>نسبة الاستهلاك</span>
                    <span>{calculateDepreciationPercentage(asset.accumulatedDepreciation, asset.purchaseCost)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-orange-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${calculateDepreciationPercentage(asset.accumulatedDepreciation, asset.purchaseCost)}%`
                      }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="text-muted-foreground">الاستهلاك الشهري:</span>
                  <span className="font-medium">{formatCurrency(asset.monthlyDepreciation)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">تاريخ الشراء:</span>
                  <span>{formatDate(asset.purchaseDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">العمر الإنتاجي:</span>
                  <span>{asset.usefulLifeMonths} شهر ({(asset.usefulLifeMonths / 12).toFixed(1)} سنة)</span>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEditAsset(asset)}
                  >
                    <Edit className="ml-1 h-3 w-3" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteAsset(asset)}
                    disabled={deleteMutation.isPending}
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

      {/* Pagination */}
      {assets.length > 0 && (
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

      {/* Asset Form Dialog */}
      <FixedAssetFormDialog
        asset={selectedAsset}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="حذف الأصل الثابت"
        message={`هل أنت متأكد من حذف "${assetToDelete?.name}"؟ سيتم حذف جميع سجلات الاستهلاك المرتبطة به.`}
        confirmText="حذف"
        cancelText="إلغاء"
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}
