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
  initialCash: number
}

// Form data for updating profile
export interface UpdateProfileFormData {
  name: string
  phoneNumber: string
  logo?: File | null
  initialCash?: number
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
  supplierId?: string | null
}

// Form data for creating/updating products
export interface ProductFormData {
  name: string
  buyingPrice: number
  sellingPrice: number
  stock: number
  imageUrl?: File | null
  description?: string
  supplierId?: string
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

// Stock Movement types (updated with new cost tracking fields)
export interface StockMovement {
  id: string
  productId: string
  productName: string
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT'
  quantity: number
  unitPrice?: number       // NEW - buying/selling price per unit
  totalCost?: number       // NEW - unitPrice * quantity
  supplierId?: string      // NEW - for IN movements
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
  grossProfit: number  // NEW - TotalSales - COGS
  netProfit: number    // GrossProfit - OperatingExpenses
  totalExpenses: number
  productCount: number
  customerCount: number
  currentCash: number  // Updated calculation: InitialCash + TotalSales - TotalExpenses - TotalInventoryPurchases
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

// Paginated list responses
export interface CustomerListResponse {
  customers: Customer[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export interface OrderListResponse {
  orders: Order[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export interface ProductListResponse {
  products: Product[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export interface NoteListResponse {
  notes: Note[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export interface StockMovementListResponse {
  stockMovements: StockMovement[]
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}

// Expense types (updated - removed productId, removed supplierId, added fixedAssetId)
export interface Expense {
  id: string
  fixedAssetId?: string | null  // NEW - replaces productId
  title: string
  category?: string | null
  amount: number
  createdAt: string
}

export interface ExpensesResponse {
  expenses: Expense[]
  totalExpenses: number
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}

export interface CreateExpenseRequest {
  fixedAssetId?: string | null  // NEW - replaces productId
  title: string
  category?: string | null
  amount: number
}

export interface UpdateExpenseRequest {
  id: string
  fixedAssetId?: string | null  // NEW - replaces productId
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

// Supplier types
export interface Supplier {
  id: string
  name: string
  phone: string
  email?: string | null
  address?: string | null
  totalPurchased: number
  createdAt: string
}

export interface CreateSupplierRequest {
  name: string
  phone: string
  email?: string
  address?: string
}

export interface UpdateSupplierRequest {
  id: string
  name?: string
  phone?: string
  email?: string
  address?: string
}

// Fixed Asset types
export interface FixedAsset {
  id: string
  tenantId: string
  name: string
  category?: string | null
  purchaseCost: number
  purchaseDate: string
  usefulLifeMonths: number
  monthlyDepreciation: number
  accumulatedDepreciation: number
  currentBookValue: number
  isActive: boolean
  createdAt: string
}

export interface AssetDepreciation {
  id: number
  fixedAssetId: string
  amount: number
  month: number
  year: number
  createdAt: string
}

export interface CreateFixedAssetRequest {
  name: string
  category?: string | null
  purchasePrice: number
  purchaseDate: string
  usefulLifeMonths: number
}

export interface UpdateFixedAssetRequest {
  id: string
  name: string
  category?: string | null
  purchaseCost: number
  purchaseDate: string
  usefulLifeMonths: number
}

export interface FixedAssetListResponse {
  fixedAssets: FixedAsset[]
  totalFixedAssets: number  // Sum of all purchase costs
  currentPage: number
  pageSize: number
  totalPages: number
  totalCount: number
}
