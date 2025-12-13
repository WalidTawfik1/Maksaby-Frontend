export interface User {
  userId: string
  email: string
  name: string
  token: string
  roles: string[]
}

// API Response wrapper
export interface ApiResponse<T> {
  isSuccess: boolean
  message: string
  data: T
  errors: string[]
}

export interface Product {
  id: string
  name: string
  buyingPrice: number
  sellingPrice: number
  stock: number
  imageUrl?: string | null
  description?: string | null
}

// Form data for creating/updating products
export interface ProductFormData {
  name: string
  buyingPrice: number
  sellingPrice: number
  stock: number
  imageUrl?: File | null
  description?: string
  id?: string // Only for update
}

export interface Customer {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  totalSpent: number
  createdAt: string
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  buyingPrice: number
  sellingPrice: number
  total: number
  profit: number
}

export interface Order {
  id: string
  orderNumber: string
  customerId?: string
  customerName?: string
  items: OrderItem[]
  subtotal: number
  tax: number
  discount: number
  total: number
  profit: number
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: string
}

export interface Expense {
  id: string
  category: string
  amount: number
  description?: string
  date: string
  linkedProductId?: string
  createdAt: string
}

export interface StockMovement {
  id: string
  productId: string
  productName: string
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  relatedOrderId?: string | null
  invoiceNumber?: number | null
  note: string
  createdAt: string
}

// Filter types for stock movements
export enum FilterType {
  Today = 0,
  ThisWeek = 1,
  ThisMonth = 2,
  Custom = 3
}

export interface DashboardMetrics {
  totalSales: number
  netProfit: number
  productsCount: number
  customersCount: number
  lowStockProducts: number
}

export interface ChartData {
  name: string
  value: number
  revenue?: number
  profit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
