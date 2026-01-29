'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { useTheme } from 'next-themes'
import { Input } from '@/components/ui/input'
import { requestDemo } from '@/lib/api-client'
import toast from 'react-hot-toast'

export default function Home() {
  const router = useRouter()
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [demoEmail, setDemoEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = Cookies.get('token')
    if (token) {
      router.push('/dashboard')
    }
  }, [router])

  const handleDemoRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!demoEmail || !demoEmail.includes('@')) {
      toast.error('الرجاء إدخال بريد إلكتروني صحيح')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await requestDemo(demoEmail)
      if (response.isSuccess) {
        toast.success(`تم إنشاء حساب تجريبي بنجاح! تم إرسال بيانات الدخول إلى ${demoEmail}`)
        setDemoEmail('')
      } else {
        const errorMsg = response.errors?.[0]
        // Translate common error messages
        if (errorMsg?.toLowerCase().includes('already have an active demo')) {
          toast.error('لديك بالفعل حساب تجريبي نشط. يرجى التحقق من بريدك الإلكتروني للحصول على بيانات الدخول.')
        } else {
          toast.error(errorMsg || 'فشل طلب الحساب التجريبي')
        }
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.errors?.[0] || error?.response?.data?.message
      
      // Translate common error messages
      if (errorMsg?.toLowerCase().includes('already have an active demo')) {
        toast.error('لديك بالفعل حساب تجريبي نشط. يرجى التحقق من بريدك الإلكتروني للحصول على بيانات الدخول.')
      } else {
        toast.error(errorMsg || 'حدث خطأ أثناء طلب الحساب التجريبي')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentTheme = mounted ? (resolvedTheme || theme) : 'light'
  const logoSrc = currentTheme === 'dark' ? '/logodark.png' : '/logo.png'
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm fixed w-full top-0 z-50 border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src={logoSrc} alt="مكسبي" className="h-10" />
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button>تسجيل الدخول</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            أدر متجرك بذكاء مع <span className="text-primary">مكسبي</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            نظام متكامل لإدارة المخزون والطلبات والعملاء - صمم خصيصاً للمحلات التجارية
            مع دعم كامل للغة العربية
          </p>
          
          {/* Demo Request Form */}
          <div className="max-w-md mx-auto mb-4">
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20 border-primary/20">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  جرب النظام مجاناً لمدة 7 أيام
                </h3>
                <p className="text-muted-foreground text-sm">
                  احصل على حساب تجريبي كامل المميزات - سنرسل لك بيانات الدخول على بريدك الإلكتروني
                </p>
              </div>
              <form onSubmit={handleDemoRequest} className="space-y-3">
                <Input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  value={demoEmail}
                  onChange={(e) => setDemoEmail(e.target.value)}
                  disabled={isSubmitting}
                  required
                  className="text-lg h-12"
                />
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full text-lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جاري الإرسال...' : 'احصل على حساب تجريبي مجاني'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  لا حاجة لبطاقة ائتمان • جاهز للاستخدام فوراً
                </p>
              </form>
            </Card>
          </div>

          {/* Full Account Contact Info */}
          <div className="max-w-md mx-auto mb-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-center text-foreground mb-2">
                <span className="font-semibold">تريد حساباً كاملاً دائماً؟</span>
              </p>
              <p className="text-sm text-center text-muted-foreground">
                تواصل معنا عبر{' '}
                <a 
                  href="mailto:maksaby.business@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  maksaby.business@gmail.com
                </a>
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center items-center text-sm text-muted-foreground">
            <span>لديك حساب بالفعل؟</span>
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              كل ما تحتاجه لإدارة متجرك
            </h2>
            <p className="text-xl text-muted-foreground">
              مميزات قوية لتسهيل عملك اليومي
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">إدارة المخزون</h3>
              <p className="text-muted-foreground">
                تتبع المنتجات والكميات بسهولة مع تنبيهات المخزون المنخفض
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">إدارة الطلبات</h3>
              <p className="text-muted-foreground">
                سجل وتتبع الطلبات مع حساب تلقائي للأرباح والتكاليف
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">دليل العملاء</h3>
              <p className="text-muted-foreground">
                احفظ بيانات العملاء وتتبع مشترياتهم وملاحظاتهم
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">تقارير وإحصائيات</h3>
              <p className="text-muted-foreground">
                لوحة تحكم شاملة مع إحصائيات المبيعات والأرباح
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">إدارة المصروفات</h3>
              <p className="text-muted-foreground">
                سجل مصروفات متجرك لحساب الأرباح الصافية بدقة
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">إدارة الملاحظات</h3>
              <p className="text-muted-foreground">
                احفظ ملاحظات مهمة عن العملاء والطلبات
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-6">
                لماذا تختار مكسبي؟
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">سهل الاستخدام</h3>
                    <p className="text-muted-foreground">واجهة بسيطة وسهلة لا تحتاج إلى تدريب معقد</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">دعم كامل للعربية</h3>
                    <p className="text-muted-foreground">مصمم خصيصاً للسوق العربي مع RTL كامل</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">آمن وموثوق</h3>
                    <p className="text-muted-foreground">بيانات محمية وآمنة مع نسخ احتياطي تلقائي</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">متاح في أي مكان</h3>
                    <p className="text-muted-foreground">تابع متجرك من الكمبيوتر أو الموبايل</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-8 rounded-2xl shadow-xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-foreground">جرب مكسبي الآن</h3>
              <div className="space-y-4">
                <div className="text-center pb-4 border-b border-border">
                  <div className="text-4xl font-bold text-primary mb-2">7 أيام</div>
                  <p className="text-muted-foreground">تجربة مجانية كاملة</p>
                </div>
                <ul className="space-y-3">
                  <li className="flex gap-3 items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground">جميع المميزات متاحة</span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground">إدارة غير محدودة للمنتجات</span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground">تقارير وإحصائيات شاملة</span>
                  </li>
                  <li className="flex gap-3 items-center">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground">جاهز للاستخدام فوراً</span>
                  </li>
                </ul>
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    سنرسل لك بيانات الدخول على بريدك الإلكتروني
                  </p>
                  <a href="#hero" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                    <Button size="lg" className="w-full">
                      احصل على حساب تجريبي
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-4xl font-bold mb-6">
            جرب مكسبي مجاناً لمدة 7 أيام
          </h2>
          <p className="text-xl mb-8 opacity-90">
            اختبر جميع المميزات بدون الحاجة لبطاقة ائتمان
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="#hero" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
              <Button size="lg" variant="secondary" className="text-lg px-8">
                احصل على حساب تجريبي
              </Button>
            </a>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg px-8 border-white bg-transparent text-white hover:bg-white hover:text-primary dark:border-gray-300">
                لدي حساب بالفعل
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 py-12 border-t border-gray-800 dark:border-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <img src={logoSrc} alt="مكسبي" className="h-12 mb-4" />
              <p className="text-gray-400 dark:text-gray-500">
                نظام متكامل لإدارة المخزون والطلبات للمحلات التجارية
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">روابط سريعة</h4>
              <ul className="space-y-2">
                <li><Link href="/auth/login" className="hover:text-white transition-colors">تسجيل الدخول</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">تواصل معنا</h4>
              <p className="text-gray-400 dark:text-gray-500 mb-2">
                نحن هنا لمساعدتك في تطوير عملك
              </p>
              <a href="mailto:maksaby.business@gmail.com" className="text-primary hover:text-primary/80 transition-colors">
                maksaby.business@gmail.com
              </a>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-900 mt-8 pt-8 text-center text-gray-500">
            <p>© 2026 مكسبي. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
