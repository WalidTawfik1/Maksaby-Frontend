'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    try {
      await forgotPassword.mutateAsync(data)
      setEmailSent(true)
    } catch (error) {
      // Error handled by mutation
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="مكسبي" width={180} height={70} />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">تحقق من بريدك الإلكتروني</CardTitle>
          <CardDescription className="text-base">
            تم إرسال رمز التحقق إلى بريدك الإلكتروني
          </CardDescription>
        </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-blue-50 p-4 text-center text-sm text-blue-900">
              <p className="mb-2">تم إرسال رمز إعادة تعيين كلمة المرور إلى:</p>
              <p className="font-bold">{getValues('email')}</p>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              يرجى التحقق من بريدك الإلكتروني واستخدام الرمز لإعادة تعيين كلمة المرور
            </p>
            <Link href={`/auth/reset-password?email=${encodeURIComponent(getValues('email'))}`}>
              <Button className="w-full">
                أدخل رمز التحقق
              </Button>
            </Link>
            <div className="text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline">
                العودة إلى تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-2"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى تسجيل الدخول
          </Link>
          <CardTitle className="text-2xl font-bold text-primary">نسيت كلمة المرور؟</CardTitle>
          <CardDescription className="text-base">
            أدخل بريدك الإلكتروني وسنرسل لك رمز إعادة تعيين كلمة المرور
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                {...register('email')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التحقق'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
