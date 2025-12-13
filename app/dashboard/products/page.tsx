'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductFormDialog } from '@/components/product-form-dialog'
import { getAllProducts, deleteProduct as deleteProductApi } from '@/lib/api-client'
import { formatCurrency } from '@/lib/utils'
import { Product } from '@/types'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const queryClient = useQueryClient()

  // Fetch products with pagination and search
  const { data: response, isLoading } = useQuery({
    queryKey: ['products', currentPage, pageSize, searchQuery],
    queryFn: async () => {
      return await getAllProducts({
        pageNum: currentPage,
        pageSize: pageSize,
        searchTerm: searchQuery,
      })
    },
  })

  const products = response?.data || []

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteProductApi(id)
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(response.message)
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'فشل حذف المنتج'
      toast.error(errorMessage)
    },
  })

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.name}"؟`)) {
      deleteMutation.mutate(product.id)
    }
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  // Calculate profit margin for display
  const calculateProfitMargin = (buyingPrice: number, sellingPrice: number) => {
    if (buyingPrice === 0) return 0
    return ((sellingPrice - buyingPrice) / buyingPrice * 100).toFixed(1)
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
          <h1 className="text-3xl font-bold">المنتجات</h1>
          <p className="text-muted-foreground">إدارة منتجات المتجر</p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة منتج
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="البحث عن منتج..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1) // Reset to first page on search
            }}
            className="pr-10"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          عدد المنتجات: <span className="font-semibold text-foreground">{products.length}</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد منتجات'}
            </p>
            {!searchQuery && (
              <Button onClick={handleAddProduct} className="mt-4">
                <Plus className="ml-2 h-4 w-4" />
                إضافة منتج جديد
              </Button>
            )}
          </div>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="p-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-40 object-cover rounded-md mb-2"
                  />
                ) : (
                  <div className="w-full h-40 bg-muted rounded-md mb-2 flex items-center justify-center">
                    <p className="text-muted-foreground text-sm">لا توجد صورة</p>
                  </div>
                )}
                <CardTitle className="text-lg truncate" title={product.name}>
                  {product.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">سعر البيع:</span>
                  <span className="font-semibold">{formatCurrency(product.sellingPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">سعر الشراء:</span>
                  <span>{formatCurrency(product.buyingPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الربح:</span>
                  <span className="text-green-600 font-medium">
                    {calculateProfitMargin(product.buyingPrice, product.sellingPrice)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">المخزون:</span>
                  <span
                    className={
                      product.stock <= 5
                        ? 'text-destructive font-semibold'
                        : 'text-green-600'
                    }
                  >
                    {product.stock}
                  </span>
                </div>
                {product.description && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p className="line-clamp-2">{product.description}</p>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Edit className="ml-1 h-3 w-3" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteProduct(product)}
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
      {products.length > 0 && (
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
              disabled={products.length < pageSize}
            >
              التالي
              <ChevronLeft className="h-4 w-4 mr-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Form Dialog */}
      <ProductFormDialog
        product={selectedProduct}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
      />
    </div>
  )
}
