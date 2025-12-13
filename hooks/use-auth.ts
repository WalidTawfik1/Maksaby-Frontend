import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import apiClient from '@/lib/api-client'
import { User, ApiResponse } from '@/types'
import { translateApiMessage } from '@/lib/translations'

interface LoginData {
  email: string
  password: string
}

interface RegisterData {
  name: string
  email: string
  password: string
  phoneNumber: string
}

interface ForgotPasswordData {
  email: string
}

interface ResetPasswordData {
  email: string
  otpCode: string
  newPassword: string
}

export function useAuth() {
  const router = useRouter()

  const login = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiClient.post<ApiResponse<User>>('/Auth/login', data)
      return response.data
    },
    onSuccess: (response) => {
      if (response.isSuccess && response.data) {
        Cookies.set('token', response.data.token, { expires: 7 })
        Cookies.set('user', JSON.stringify(response.data), { expires: 7 })
        toast.success(translateApiMessage(response.message) || 'تم تسجيل الدخول بنجاح')
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      } else {
        toast.error(translateApiMessage(response.errors?.[0]) || 'فشل تسجيل الدخول')
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      let errorMessage = 'فشل تسجيل الدخول'
      
      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map(translateApiMessage).join(', ')
        } else if (errorData.message) {
          errorMessage = translateApiMessage(errorData.message)
        } else if (typeof errorData === 'object' && errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat()
          errorMessage = validationErrors.map((err: any) => translateApiMessage(String(err))).join(', ')
        }
      }
      
      toast.error(errorMessage)
    },
  })

  const register = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await apiClient.post<ApiResponse<User>>('/Auth/register', data)
      return response.data
    },
    onSuccess: (response) => {
      if (response.isSuccess && response.data) {
        Cookies.set('token', response.data.token, { expires: 7 })
        Cookies.set('user', JSON.stringify(response.data), { expires: 7 })
        toast.success(translateApiMessage(response.message) || 'تم إنشاء الحساب بنجاح')
        router.push('/dashboard')
      } else {
        toast.error(translateApiMessage(response.errors?.[0]) || 'فشل إنشاء الحساب')
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      let errorMessage = 'فشل إنشاء الحساب'
      
      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map(translateApiMessage).join(', ')
        } else if (errorData.message) {
          errorMessage = translateApiMessage(errorData.message)
        } else if (typeof errorData === 'object' && errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat()
          errorMessage = validationErrors.map((err: any) => translateApiMessage(String(err))).join(', ')
        }
      }
      
      toast.error(errorMessage)
    },
  })

  const forgotPassword = useMutation({
    mutationFn: async (data: ForgotPasswordData) => {
      const response = await apiClient.post<ApiResponse<null>>('/Auth/forgot-password', data)
      return response.data
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast.success(translateApiMessage(response.message) || 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
      } else {
        toast.error(translateApiMessage(response.errors?.[0]) || 'فشل إرسال رابط إعادة تعيين كلمة المرور')
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      let errorMessage = 'فشل إرسال رابط إعادة تعيين كلمة المرور'
      
      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map(translateApiMessage).join(', ')
        } else if (errorData.message) {
          errorMessage = translateApiMessage(errorData.message)
        } else if (typeof errorData === 'object' && errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat()
          errorMessage = validationErrors.map((err: any) => translateApiMessage(String(err))).join(', ')
        }
      }
      
      toast.error(errorMessage)
    },
  })

  const resetPassword = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await apiClient.post<ApiResponse<null>>('/Auth/reset-password', data)
      return response.data
    },
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast.success(translateApiMessage(response.message) || 'تم إعادة تعيين كلمة المرور بنجاح')
        setTimeout(() => {
          router.push('/auth/login')
        }, 500)
      } else {
        toast.error(translateApiMessage(response.errors?.[0]) || 'فشل إعادة تعيين كلمة المرور')
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      let errorMessage = 'فشل إعادة تعيين كلمة المرور'
      
      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map(translateApiMessage).join(', ')
        } else if (errorData.message) {
          errorMessage = translateApiMessage(errorData.message)
        } else if (typeof errorData === 'object' && errorData.errors) {
          const validationErrors = Object.values(errorData.errors).flat()
          errorMessage = validationErrors.map((err: any) => translateApiMessage(String(err))).join(', ')
        }
      }
      
      toast.error(errorMessage)
    },
  })

  const logout = async () => {
    try {
      await apiClient.post<ApiResponse<null>>('/Auth/logout')
      Cookies.remove('token')
      Cookies.remove('user')
      toast.success('تم تسجيل الخروج بنجاح')
      router.push('/auth/login')
    } catch (error) {
      // Still clear cookies even if API call fails
      Cookies.remove('token')
      Cookies.remove('user')
      router.push('/auth/login')
    }
  }

  const getCurrentUser = (): User | null => {
    const userStr = Cookies.get('user')
    return userStr ? JSON.parse(userStr) : null
  }

  const isAuthenticated = (): boolean => {
    return !!Cookies.get('token')
  }

  return {
    login,
    register,
    forgotPassword,
    resetPassword,
    logout,
    getCurrentUser,
    isAuthenticated,
  }
}
