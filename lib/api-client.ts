import axios from 'axios'
import Cookies from 'js-cookie'
import { ApiResponse, Product, ProductFormData, Customer, CustomerFormData } from '@/types'

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

import { StockMovement, FilterType } from '@/types'

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
