export interface User {
  userId: string
  email: string
  name: string
  token: string
  roles: string[]
}

// User Profile
export interface UserProfile {
  name: string
  email: string
  userName: string
  phoneNumber: string
  logoUrl: string
}

// Form data for updating profile
export interface UpdateProfileFormData {
  name: string
  phoneNumber: string
  logo?: File | null
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
  phone: string
  email?: string | null
  address: string
  totalSpent: number
  createdAt: string
}

// Form data for creating/updating customers
export interface CustomerFormData {
  name: string
  phone: string
  email?: string
  address: string
  id?: string // Only for update
}

// Order Item types
export interface ProductInOrderItem {
  id: string
  name: string
  sellingPrice: number
  buyingPrice: number
  stock: number
  category?: string
  description?: string
}

export interface OrderItem {
  id?: string
  productId: string
  productName?: string
  quantity: number
  unitPrice: number
  buyingPrice: number
  totalPrice: number
  product?: ProductInOrderItem
}

export interface CreateOrderItem {
  productId: string
  quantity: number
  customItemPrice?: number
}

// Order types
export interface Order {
  id: string
  tenantId?: string
  customerId?: string | null
  customerName?: string
  invoiceNumber: number
  totalAmount: number
  totalCost: number
  totalProfit: number
  discount: number
  notes?: string | null
  isDeleted?: boolean
  createdAt: string
  orderItems: OrderItem[]
}

// Form data for creating orders
export interface CreateOrderRequest {
  customerId?: string | null
  discount?: number
  notes?: string
  orderItems: CreateOrderItem[]
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
  cogs: number
  netProfit: number
  totalExpenses: number
  productCount: number
  customerCount: number
}

export interface RecentOrder {
  id: string
  customerName: string
  totalAmount: number
  invoiceNumber: number
  createdAt: string
}

export interface DashboardData {
  stats: DashboardMetrics
  recentOrders: RecentOrder[]
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

// Expense types
export interface Expense {
  id: string
  productId?: string | null
  title: string
  category?: string | null
  amount: number
  createdAt: string
}

export interface ExpensesResponse {
  expenses: Expense[]
  totalExpenses: number
}

export interface CreateExpenseRequest {
  productId?: string | null
  title: string
  category?: string | null
  amount: number
}

export interface UpdateExpenseRequest {
  id: string
  productId?: string | null
  title?: string
  category?: string | null
  amount?: number
}

// Note types
export interface Note {
  id: string
  customerId?: string | null
  customerName?: string | null
  content: string
  isCompleted: boolean
  completedAt?: string | null
  createdAt: string
}

export interface CreateNoteRequest {
  customerId?: string | null
  content: string
}

export interface UpdateNoteRequest {
  id: string
  customerId?: string | null
  content?: string
  isCompleted?: boolean
}
