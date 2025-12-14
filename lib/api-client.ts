import axios from 'axios'
import Cookies from 'js-cookie'
import { ApiResponse, Product, ProductFormData, Customer, CustomerFormData, StockMovement, FilterType, Order, CreateOrderRequest, DashboardData, Expense, CreateExpenseRequest, UpdateExpenseRequest, Note, CreateNoteRequest, UpdateNoteRequest } from '@/types'

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add token
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token')
      Cookies.remove('user')
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

// ==========================
// Product API Functions
// ==========================

interface GetAllProductsParams {
  pageNum?: number
  pageSize?: number
  searchTerm?: string
}

/**
 * Get all products with pagination and search
 */
export const getAllProducts = async (params: GetAllProductsParams = {}) => {
  const { pageNum = 1, pageSize = 50, searchTerm = '' } = params
  
  const response = await apiClient.get<ApiResponse<Product[]>>('/Product/getallproducts', {
    params: {
      pagenum: pageNum,
      pagesize: pageSize,
      SearchTerm: searchTerm,
    },
  })
  
  return response.data
}

/**
 * Get a single product by ID
 */
export const getProductById = async (productId: string) => {
  const response = await apiClient.get<ApiResponse<Product>>(`/Product/${productId}`)
  return response.data
}

/**
 * Add a new product
 */
export const addProduct = async (data: ProductFormData) => {
  const formData = new FormData()
  formData.append('Name', data.name)
  formData.append('BuyingPrice', data.buyingPrice.toString())
  formData.append('SellingPrice', data.sellingPrice.toString())
  formData.append('Stock', data.stock.toString())
  
  if (data.imageUrl) {
    formData.append('ImageUrl', data.imageUrl)
  }
  
  if (data.description) {
    formData.append('Description', data.description)
  }
  
  const response = await apiClient.post<ApiResponse<Product>>('/Product/addproduct', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

/**
 * Update an existing product
 */
export const updateProduct = async (data: ProductFormData) => {
  if (!data.id) {
    throw new Error('Product ID is required for update')
  }
  
  const formData = new FormData()
  formData.append('Id', data.id)
  formData.append('Name', data.name)
  formData.append('BuyingPrice', data.buyingPrice.toString())
  formData.append('SellingPrice', data.sellingPrice.toString())
  formData.append('Stock', data.stock.toString())
  
  if (data.imageUrl && data.imageUrl instanceof File) {
    formData.append('ImageUrl', data.imageUrl)
  }
  
  if (data.description) {
    formData.append('Description', data.description)
  }
  
  const response = await apiClient.patch<ApiResponse<boolean>>('/Product/updateproduct', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  
  return response.data
}

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string) => {
  const response = await apiClient.delete<ApiResponse<boolean>>(`/Product/${productId}`)
  return response.data
}

// ==========================
// Customer API Functions
// ==========================

interface GetAllCustomersParams {
  pageNum?: number
  pageSize?: number
  searchTerm?: string
}

/**
 * Get all customers with pagination and search
 */
export const getAllCustomers = async (params: GetAllCustomersParams = {}) => {
  const { pageNum = 1, pageSize = 50, searchTerm = '' } = params
  
  const response = await apiClient.get<ApiResponse<Customer[]>>('/Customer/getallcustomers', {
    params: {
      pagenum: pageNum,
      pagesize: pageSize,
      SearchTerm: searchTerm,
    },
  })
  
  return response.data
}

/**
 * Get a single customer by ID
 */
export const getCustomerById = async (customerId: string) => {
  const response = await apiClient.get<ApiResponse<Customer>>(`/Customer/${customerId}`)
  return response.data
}

/**
 * Add a new customer
 */
export const addCustomer = async (data: CustomerFormData) => {
  const payload = {
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    address: data.address,
  }
  
  const response = await apiClient.post<ApiResponse<Customer>>('/Customer/addcustomer', payload)
  return response.data
}

/**
 * Update an existing customer
 */
export const updateCustomer = async (data: CustomerFormData) => {
  if (!data.id) {
    throw new Error('Customer ID is required for update')
  }
  
  const payload = {
    id: data.id,
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    address: data.address,
  }
  
  const response = await apiClient.patch<ApiResponse<boolean>>('/Customer/updatecustomer', payload)
  return response.data
}

/**
 * Delete a customer
 */
export const deleteCustomer = async (customerId: string) => {
  const response = await apiClient.delete<ApiResponse<boolean>>(`/Customer/${customerId}`)
  return response.data
}

// ==========================
// Stock Movement API Functions
// ==========================

interface GetAllStockMovementsParams {
  pagenum?: number
  pagesize?: number
  SearchTerm?: string | null
  StartDate?: string | null
  EndDate?: string | null
  FilterType?: FilterType | null
}

/**
 * Get all stock movements with pagination and filters
 */
export const getAllStockMovements = async (params: GetAllStockMovementsParams = {}) => {
  const {
    pagenum = 1,
    pagesize = 50,
    SearchTerm = null,
    StartDate = null,
    EndDate = null,
    FilterType = null, // null means get all
  } = params

  const response = await apiClient.get<ApiResponse<StockMovement[]>>('/StockMovement/getallstockmovements', {
    params: {
      pagenum,
      pagesize,
      SearchTerm,
      StartDate,
      EndDate,
      FilterType,
    },
  })

  return response.data
}

// ==========================
// Order API Functions
// ==========================

interface GetAllOrdersParams {
  pageNum?: number
  pageSize?: number
  filterType?: FilterType | null
  startDate?: string | null
  endDate?: string | null
}

/**
 * Create a new order
 */
export const createOrder = async (data: CreateOrderRequest) => {
  const payload = {
    customerId: data.customerId || null,
    discount: data.discount || 0,
    notes: data.notes || null,
    orderItems: data.orderItems,
  }
  
  const response = await apiClient.post<ApiResponse<Order>>('/Order/createorder', payload)
  return response.data
}

/**
 * Get all orders with pagination and filters
 */
export const getAllOrders = async (params: GetAllOrdersParams = {}) => {
  const {
    pageNum = 1,
    pageSize = 10,
    filterType = null,
    startDate = null,
    endDate = null,
  } = params
  
  const response = await apiClient.get<ApiResponse<Order[]>>('/Order/getallorders', {
    params: {
      pagenum: pageNum,
      pagesize: pageSize,
      FilterType: filterType,
      StartDate: startDate,
      EndDate: endDate,
    },
  })
  
  return response.data
}

/**
 * Get a single order by ID
 */
export const getOrderById = async (orderId: string) => {
  const response = await apiClient.get<ApiResponse<Order>>(`/Order/${orderId}`)
  return response.data
}

/**
 * Get orders by customer ID
 */
export const getOrdersByCustomerId = async (
  customerId: string,
  pageNum: number = 1,
  pageSize: number = 10
) => {
  const response = await apiClient.get<ApiResponse<Order[]>>(
    `/Order/getorderbycustomerid/${customerId}`,
    {
      params: {
        pagenum: pageNum,
        pagesize: pageSize,
      },
    }
  )
  
  return response.data
}

/**
 * Delete an order (soft delete)
 */
export const deleteOrder = async (orderId: string) => {
  const response = await apiClient.delete<ApiResponse<string>>(`/Order/${orderId}`)
  return response.data
}

// ==========================
// Dashboard API Functions
// ==========================

/**
 * Get dashboard data with stats and recent orders
 */
export const getDashboardData = async () => {
  const response = await apiClient.get<ApiResponse<DashboardData>>('/Dashboard')
  return response.data
}

// ==========================
// Expense API Functions
// ==========================

interface GetAllExpensesParams {
  pageNum?: number
  pageSize?: number
  filterType?: FilterType | null
  startDate?: string | null
  endDate?: string | null
}

/**
 * Add a new expense
 */
export const addExpense = async (data: CreateExpenseRequest) => {
  const response = await apiClient.post<ApiResponse<Expense>>('/Expense/addexpense', data)
  return response.data
}

/**
 * Get all expenses with optional filters
 */
export const getAllExpenses = async (params: GetAllExpensesParams = {}) => {
  const queryParams: any = {
    pagenum: params.pageNum || 1,
    pagesize: params.pageSize || 10,
  }

  if (params.filterType !== null && params.filterType !== undefined) {
    queryParams.FilterType = params.filterType
  }

  if (params.filterType === FilterType.Custom) {
    if (params.startDate) queryParams.StartDate = params.startDate
    if (params.endDate) queryParams.EndDate = params.endDate
  }

  const response = await apiClient.get<ApiResponse<Expense[]>>('/Expense/getallexpenses', {
    params: queryParams,
  })
  return response.data
}

/**
 * Get expense by ID
 */
export const getExpenseById = async (expenseId: string) => {
  const response = await apiClient.get<ApiResponse<Expense>>(`/Expense/${expenseId}`)
  return response.data
}

/**
 * Update an existing expense
 */
export const updateExpense = async (data: UpdateExpenseRequest) => {
  const response = await apiClient.patch<ApiResponse<boolean>>('/Expense/updateexpense', data)
  return response.data
}

/**
 * Delete an expense
 */
export const deleteExpense = async (expenseId: string) => {
  const response = await apiClient.delete<ApiResponse<boolean>>(`/Expense/${expenseId}`)
  return response.data
}

// ==========================
// Note API Functions
// ==========================

interface GetAllNotesParams {
  pageNum?: number
  pageSize?: number
  searchTerm?: string | null
  isCompleted?: boolean | null
}

/**
 * Add a new note
 */
export const addNote = async (data: CreateNoteRequest) => {
  const response = await apiClient.post<ApiResponse<Note>>('/Note/addnote', data)
  return response.data
}

/**
 * Get all notes with optional filters
 */
export const getAllNotes = async (params: GetAllNotesParams = {}) => {
  const queryParams: any = {
    pagenum: params.pageNum || 1,
    pagesize: params.pageSize || 10,
  }

  if (params.searchTerm) queryParams.SearchTerm = params.searchTerm
  if (params.isCompleted !== null && params.isCompleted !== undefined) {
    queryParams.isCompleted = params.isCompleted
  }

  const response = await apiClient.get<ApiResponse<Note[]>>('/Note/getallnotes', {
    params: queryParams,
  })
  return response.data
}

/**
 * Get note by ID
 */
export const getNoteById = async (noteId: string) => {
  const response = await apiClient.get<ApiResponse<Note>>(`/Note/${noteId}`)
  return response.data
}

/**
 * Get notes by customer ID
 */
export const getNotesByCustomerId = async (customerId: string) => {
  const response = await apiClient.get<ApiResponse<Note[]>>(`/Note/customer/${customerId}`)
  return response.data
}

/**
 * Update an existing note
 */
export const updateNote = async (data: UpdateNoteRequest) => {
  const response = await apiClient.patch<ApiResponse<boolean>>('/Note/updatenote', data)
  return response.data
}

/**
 * Toggle note completion status
 */
export const toggleNoteCompletion = async (noteId: string) => {
  const response = await apiClient.patch<ApiResponse<Note>>(`/Note/${noteId}/toggle`)
  return response.data
}

/**
 * Delete a note
 */
export const deleteNote = async (noteId: string) => {
  const response = await apiClient.delete<ApiResponse<boolean>>(`/Note/${noteId}`)
  return response.data
}
