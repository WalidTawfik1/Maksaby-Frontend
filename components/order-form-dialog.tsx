'use client'

import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Plus, Trash2, Loader2, ShoppingCart, User, Tag, FileText, Package, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createOrder, getAllCustomers, getAllProducts } from '@/lib/api-client'
import { CreateOrderRequest, CreateOrderItem } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { translateApiMessage } from '@/lib/translations'
import toast from 'react-hot-toast'

interface OrderFormDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface OrderItemForm extends CreateOrderItem {
  tempId: string
  productName?: string
  productPrice?: number
}

export function OrderFormDialog({ isOpen, onClose }: OrderFormDialogProps) {
  const queryClient = useQueryClient()
  const [customerId, setCustomerId] = useState<string>('')
  const [discount, setDiscount] = useState<number>(0)
  const [notes, setNotes] = useState<string>('')
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [customPrice, setCustomPrice] = useState<string>('')
  const [customerSearch, setCustomerSearch] = useState<string>('')
  const [productSearch, setProductSearch] = useState<string>('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState<boolean>(false)
  const [showProductDropdown, setShowProductDropdown] = useState<boolean>(false)
  
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const productDropdownRef = useRef<HTMLDivElement>(null)

  // Fetch customers
  const { data: customersResponse } = useQuery({
    queryKey: ['customers'],
    queryFn: () => getAllCustomers({ pageSize: 100 }),
  })

  // Fetch products
  const { data: productsResponse } = useQuery({
    queryKey: ['products'],
    queryFn: () => getAllProducts({ pageSize: 100 }),
  })

  const customers = customersResponse?.data || []
  const products = productsResponse?.data || []

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.phone.includes(customerSearch)
  )

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  // Get selected customer name
  const selectedCustomer = customers.find(c => c.id === customerId)
  const selectedCustomerDisplay = selectedCustomer 
    ? `${selectedCustomer.name} - ${selectedCustomer.phone}`
    : 'زبون عابر (بدون حساب)'

  // Get selected product
  const selectedProduct = products.find(p => p.id === selectedProductId)

  const mutation = useMutation({
    mutationFn: async (data: CreateOrderRequest) => {
      return await createOrder(data)
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        queryClient.invalidateQueries({ queryKey: ['orders'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard-data'] })
        toast.success(translateApiMessage(response.message))
        onClose()
        resetForm()
      } else {
        toast.error(translateApiMessage(response.message))
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء إنشاء الطلب'
      toast.error(translateApiMessage(errorMessage))
    },
  })

  const resetForm = () => {
    setCustomerId('')
    setDiscount(0)
    setNotes('')
    setOrderItems([])
    setSelectedProductId('')
    setQuantity(1)
    setCustomPrice('')
    setCustomerSearch('')
    setProductSearch('')
    setShowCustomerDropdown(false)
    setShowProductDropdown(false)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }
      if (productDropdownRef.current && !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddItem = () => {
    if (!selectedProductId) {
      toast.error('يرجى اختيار منتج')
      return
    }
    if (quantity <= 0) {
      toast.error('يرجى إدخال كمية صحيحة')
      return
    }

    const product = products.find(p => p.id === selectedProductId)
    if (!product) {
      toast.error('المنتج غير موجود')
      return
    }

    if (quantity > product.stock) {
      toast.error(`الكمية المتاحة في المخزون: ${product.stock}`)
      return
    }

    const newItem: OrderItemForm = {
      tempId: Date.now().toString(),
      productId: selectedProductId,
      quantity: quantity,
      customItemPrice: customPrice ? parseFloat(customPrice) : undefined,
      productName: product.name,
      productPrice: product.sellingPrice,
    }

    setOrderItems([...orderItems, newItem])
    setSelectedProductId('')
    setQuantity(1)
    setCustomPrice('')
    toast.success('تم إضافة المنتج')
  }

  const handleRemoveItem = (tempId: string) => {
    setOrderItems(orderItems.filter(item => item.tempId !== tempId))
  }

  const calculateItemTotal = (item: OrderItemForm) => {
    const price = item.customItemPrice || item.productPrice || 0
    return price * item.quantity
  }

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = (subtotal * discount) / 100
    return subtotal - discountAmount
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (orderItems.length === 0) {
      toast.error('يرجى إضافة منتج واحد على الأقل')
      return
    }

    if (discount < 0 || discount > 100) {
      toast.error('يرجى إدخال نسبة خصم صحيحة (0-100)')
      return
    }

    const orderData: CreateOrderRequest = {
      customerId: customerId || undefined,
      discount: discount || undefined,
      notes: notes || undefined,
      orderItems: orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        customItemPrice: item.customItemPrice,
      })),
    }

    mutation.mutate(orderData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-background rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">إنشاء فاتورة جديدة</h2>
              <p className="text-sm text-muted-foreground">أضف منتجات واحسب الإجمالي</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors rounded-lg p-2 hover:bg-muted"
            disabled={mutation.isPending}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Selection */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-blue-600" />
              <Label htmlFor="customer" className="font-semibold text-blue-900 dark:text-blue-100">
                معلومات العميل
              </Label>
            </div>
            <div className="relative" ref={customerDropdownRef}>
              <Input
                id="customer"
                type="text"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value)
                  setShowCustomerDropdown(true)
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                placeholder={selectedCustomerDisplay}
                className="w-full px-4 py-2.5 border border-input bg-background rounded-lg focus:ring-2 focus:ring-primary/20 transition-all"
                disabled={mutation.isPending}
              />
              {showCustomerDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setCustomerId('')
                      setCustomerSearch('')
                      setShowCustomerDropdown(false)
                    }}
                    className="w-full text-right px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors border-b"
                  >
                    🚶 زبون عابر (بدون حساب)
                  </button>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        onClick={() => {
                          setCustomerId(customer.id)
                          setCustomerSearch('')
                          setShowCustomerDropdown(false)
                        }}
                        className="w-full text-right px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors border-b last:border-b-0"
                      >
                        👤 {customer.name} - {customer.phone}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center text-muted-foreground text-sm">
                      لا توجد نتائج
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Add Product Section */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg p-5 border-2 border-dashed border-green-300 dark:border-green-800">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 text-green-600" />
              <h3 className="font-bold text-green-900 dark:text-green-100">إضافة منتج للفاتورة</h3>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="product" className="flex items-center gap-2">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  المنتج *
                </Label>
                <div className="relative" ref={productDropdownRef}>
                  <Input
                    id="product"
                    type="text"
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value)
                      setShowProductDropdown(true)
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    placeholder={selectedProduct ? `${selectedProduct.name} - ${formatCurrency(selectedProduct.sellingPrice)}` : '🔍 ابحث واختر منتج...'}
                    className="w-full px-4 py-2.5 border-2 border-input bg-background rounded-lg focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    disabled={mutation.isPending}
                  />
                  {showProductDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border-2 border-green-300 dark:border-green-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              if (product.stock > 0) {
                                setSelectedProductId(product.id)
                                setProductSearch('')
                                setShowProductDropdown(false)
                              }
                            }}
                            disabled={product.stock === 0}
                            className={`w-full text-right px-4 py-2.5 border-b last:border-b-0 transition-colors ${
                              product.stock === 0
                                ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-900'
                                : 'hover:bg-green-50 dark:hover:bg-green-950/50'
                            }`}
                          >
                            📦 {product.name} - {formatCurrency(product.sellingPrice)}
                            <span className={`text-sm mr-2 ${
                              product.stock > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {product.stock > 0 ? ` (متوفر: ${product.stock})` : ' ⚠️ نفذ من المخزون'}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-muted-foreground text-sm">
                          لا توجد نتائج
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5" />
                  الكمية *
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  disabled={mutation.isPending}
                  className="text-center font-bold text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customPrice" className="flex items-center gap-2 text-orange-600">
                  <Tag className="h-3.5 w-3.5" />
                  سعر مخصص
                </Label>
                <Input
                  id="customPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="اختياري"
                  disabled={mutation.isPending}
                  className="border-orange-300 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <Button
              type="button"
              onClick={handleAddItem}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
              disabled={mutation.isPending}
            >
              <Plus className="ml-2 h-5 w-5" />
              إضافة إلى الفاتورة
            </Button>
          </div>

          {/* Order Items List */}
          {orderItems.length > 0 && (
            <div className="border-2 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="font-bold text-lg">المنتجات المضافة</span>
                  </div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                    {orderItems.length} منتج
                  </span>
                </div>
              </div>
              <div className="divide-y">
                {orderItems.map((item, index) => (
                  <div 
                    key={item.tempId} 
                    className="px-5 py-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          <p className="font-bold text-base">{item.productName}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mr-8">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5" />
                            الكمية: <strong className="text-foreground">{item.quantity}</strong>
                          </span>
                          <span>×</span>
                          <span>
                            {formatCurrency(item.customItemPrice || item.productPrice || 0)}
                          </span>
                          {item.customItemPrice && (
                            <span className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-2 py-0.5 rounded-full text-xs font-medium">
                              سعر مخصص
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="text-xs text-muted-foreground">المجموع</p>
                          <p className="font-bold text-lg text-green-600">
                            {formatCurrency(calculateItemTotal(item))}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.tempId)}
                          disabled={mutation.isPending}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discount and Notes */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
              <Label htmlFor="discount" className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-2">
                <Tag className="h-4 w-4" />
                الخصم %
              </Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                disabled={mutation.isPending}
                className="border-orange-300 focus:ring-orange-500/20 text-lg font-bold"
                placeholder="0"
              />
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
              <Label htmlFor="notes" className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                ملاحظات
              </Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظة للفاتورة..."
                disabled={mutation.isPending}
              />
            </div>
          </div>

          {/* Total Summary */}
          {orderItems.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Receipt className="h-4 w-4" />
                    المجموع الفرعي:
                  </span>
                  <span className="font-semibold text-lg">{formatCurrency(calculateSubtotal())}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center bg-orange-100 dark:bg-orange-900/30 -mx-6 px-6 py-2">
                    <span className="text-orange-700 dark:text-orange-300 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      الخصم ({discount}%):
                    </span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      -{formatCurrency((calculateSubtotal() * discount) / 100)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3 border-t-2 border-dashed">
                  <span className="text-lg font-bold flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-600" />
                    الإجمالي النهائي:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg disabled:opacity-50"
              disabled={mutation.isPending || orderItems.length === 0}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 ml-2" />
                  إنشاء الطلب ({orderItems.length})
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
              className="border-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
