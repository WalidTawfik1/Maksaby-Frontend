'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUserProfile } from '@/lib/api-client'
import { translateApiMessage } from '@/lib/translations'
import { UpdateProfileFormData } from '@/types'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { Upload, ArrowLeft, Loader2, CheckCircle, User } from 'lucide-react'
import Image from 'next/image'
import Cookies from 'js-cookie'

export default function WelcomePage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user is authenticated
    const token = Cookies.get('token')
    if (!token) {
      router.push('/auth/login')
    }
  }, [router])

  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast.success(translateApiMessage(response.message) || 'تم رفع الشعار بنجاح')
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        toast.error(translateApiMessage(response.errors?.[0]) || 'فشل رفع الشعار')
        setIsUploading(false)
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      let errorMessage = 'فشل رفع الشعار'
      
      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map(translateApiMessage).join(', ')
        } else if (errorData.message) {
          errorMessage = translateApiMessage(errorData.message)
        }
      }
      
      toast.error(errorMessage)
      setIsUploading(false)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن لا يتجاوز 5 ميجابايت')
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار صورة صالحة')
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('يرجى اختيار صورة أولاً')
      return
    }

    setIsUploading(true)

    // Get user data from cookies
    const userStr = Cookies.get('user')
    const user = userStr ? JSON.parse(userStr) : null

    const data: UpdateProfileFormData = {
      name: user?.name || '',
      phoneNumber: user?.phoneNumber || user?.phone || '',
      logo: selectedFile,
    }

    updateMutation.mutate(data)
  }

  const handleSkip = () => {
    router.push('/dashboard')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 p-4 animate-in fade-in duration-500">
      <div className="absolute top-4 left-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-lg animate-in slide-in-from-bottom duration-700">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg animate-in zoom-in duration-500 delay-200">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2 animate-in fade-in duration-700 delay-300">
            <CardTitle className="text-3xl">مرحباً بك! 🎉</CardTitle>
            <CardDescription className="text-base">
              تم إنشاء حسابك بنجاح. الآن أضف شعار متجرك لجعل تجربتك أكثر تميزاً
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preview Area */}
          <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-700 delay-500">
            <div className="relative h-40 w-40 rounded-full overflow-hidden border-4 border-primary/20 shadow-xl transition-all duration-300 hover:border-primary/40 hover:scale-105">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                  <User className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Upload Button */}
            <label htmlFor="logo-upload" className="cursor-pointer group">
              <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-purple-500/10 hover:from-primary/20 hover:to-purple-500/20 rounded-xl transition-all duration-300 border-2 border-dashed border-primary/30 group-hover:border-primary/60">
                <Upload className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium text-primary">
                  {selectedFile ? 'تغيير الصورة' : 'اختر صورة الشعار'}
                </span>
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
            </label>

            <p className="text-sm text-muted-foreground text-center">
              PNG, JPG أو JPEG (حد أقصى 5MB)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 animate-in fade-in duration-700 delay-700">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 transition-all duration-300 shadow-lg hover:shadow-xl h-12"
            >
              {isUploading ? (
                <>
                  <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                  جاري الرفع...
                </>
              ) : (
                <>
                  <CheckCircle className="ml-2 h-5 w-5" />
                  رفع الشعار
                </>
              )}
            </Button>

            <Button
              onClick={handleSkip}
              variant="ghost"
              disabled={isUploading}
              className="w-full h-12 group hover:bg-muted transition-all duration-300"
            >
              <ArrowLeft className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              تخطي هذه الخطوة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
