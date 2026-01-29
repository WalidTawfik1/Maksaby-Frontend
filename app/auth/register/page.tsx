'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to home page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 p-4">
      <div className="absolute top-4 left-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-500" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">التسجيل غير متاح</h1>
            <CardDescription className="text-base">
              التسجيل المباشر متاح للمسؤولين فقط
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-lg p-4">
            <h3 className="font-bold text-foreground mb-2">هل تريد تجربة النظام؟</h3>
            <p className="text-sm text-muted-foreground mb-4">
              احصل على حساب تجريبي مجاني لمدة 7 أيام مع جميع المميزات
            </p>
            <Link href="/" className="block">
              <Button className="w-full" size="lg">
                احصل على حساب تجريبي مجاني
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              لديك حساب بالفعل؟
            </p>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">
                تسجيل الدخول
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            سيتم توجيهك تلقائياً إلى الصفحة الرئيسية خلال 5 ثواني
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
