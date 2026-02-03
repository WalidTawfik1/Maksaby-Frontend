'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getUserProfile, updateUserProfile } from '@/lib/api-client'
import { UpdateProfileFormData } from '@/types'
import { translateApiMessage } from '@/lib/translations'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, User } from 'lucide-react'
import Image from 'next/image'

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Fetch user profile
  const { data: profileResponse, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: getUserProfile,
  })

  const profile = profileResponse?.data

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (response) => {
      if (response.isSuccess) {
        toast.success(translateApiMessage(response.message) || 'تم تحديث الملف الشخصي بنجاح')
        queryClient.invalidateQueries({ queryKey: ['user-profile'] })
        setSelectedFile(null)
        setPreviewUrl(null)
      } else {
        toast.error(translateApiMessage(response.errors?.[0]) || 'فشل تحديث الملف الشخصي')
      }
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      let errorMessage = 'فشل تحديث الملف الشخصي'
      
      if (errorData) {
        if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
          errorMessage = errorData.errors.map(translateApiMessage).join(', ')
        } else if (errorData.message) {
          errorMessage = translateApiMessage(errorData.message)
        }
      }
      
      toast.error(errorMessage)
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const initialCashValue = formData.get('initialCash') as string
    
    const data: UpdateProfileFormData = {
      name: formData.get('name') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      logo: selectedFile,
      initialCash: initialCashValue ? parseFloat(initialCashValue) : undefined,
    }
    
    updateMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          إعدادات الحساب
        </h1>
        <p className="text-muted-foreground mt-2">
          قم بتحديث معلومات ملفك الشخصي
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الحساب</CardTitle>
          <CardDescription>
            قم بتحديث الاسم ورقم الهاتف وصورة الملف الشخصي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center gap-6">
              <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-primary/20">
                {previewUrl || profile?.logoUrl ? (
                  <Image
                    src={previewUrl || profile?.logoUrl || ''}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="logo" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors w-fit">
                    <Upload className="h-4 w-4" />
                    <span>اختر صورة</span>
                  </div>
                  <input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  PNG, JPG أو JPEG (حد أقصى 5MB)
                </p>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                name="name"
                defaultValue={profile?.name}
                required
                placeholder="أدخل الاسم"
              />
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                name="email"
                defaultValue={profile?.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                لا يمكن تغيير البريد الإلكتروني
              </p>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">رقم الهاتف</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={profile?.phoneNumber}
                required
                placeholder="أدخل رقم الهاتف"
              />
            </div>

            {/* Initial Cash */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="initialCash">النقد الأولي</Label>
                <div className="relative group">
                  <div className="cursor-help p-1 hover:bg-muted rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity w-56 text-center z-10">
                    المبلغ النقدي الذي بدأت به. تغييره سيؤثر على النقد الحالي
                  </div>
                </div>
              </div>
              <Input
                id="initialCash"
                name="initialCash"
                type="number"
                step="1"
                min="0"
                defaultValue={profile?.initialCash ?? ''}
                placeholder="أدخل النقد الأولي"
              />
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                تحذير: تغيير هذا المبلغ سيؤثر على رصيد النقد الحالي
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
