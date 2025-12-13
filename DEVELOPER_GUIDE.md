# مكسبي - دليل المطور الشامل

## محتويات الدليل
1. [نظرة عامة](#نظرة-عامة)
2. [البدء السريع](#البدء-السريع)
3. [البنية التقنية](#البنية-التقنية)
4. [الوحدات الرئيسية](#الوحدات-الرئيسية)
5. [API Integration](#api-integration)
6. [التخصيص](#التخصيص)
7. [المشاكل الشائعة](#المشاكل-الشائعة)

---

## نظرة عامة

مكسبي هو نظام إدارة مخزون وطلبات للمحلات التجارية مع واجهة عربية كاملة ودعم RTL.

### التقنيات
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS + RTL
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **UI Components**: shadcn/ui

---

## البدء السريع

### التثبيت

```powershell
# 1. تثبيت المكتبات
npm install

# 2. إعداد البيئة
# تأكد من وجود ملف .env.local

# 3. تشغيل المشروع
npm run dev
```

### الوصول
- Frontend: http://localhost:3000
- تسجيل الدخول: http://localhost:3000/auth/login

---

## البنية التقنية

### App Router Structure

```
app/
├── auth/               # صفحات المصادقة
│   ├── login/         # تسجيل دخول
│   └── register/      # إنشاء حساب
└── dashboard/         # المحمي بالمصادقة
    ├── layout.tsx     # Layout مع Sidebar
    ├── page.tsx       # لوحة القيادة
    ├── products/      # إدارة المنتجات
    ├── orders/        # إدارة الطلبات
    ├── customers/     # إدارة العملاء
    ├── expenses/      # المصروفات
    ├── stock/         # المخزون
    └── reports/       # التقارير
```

### Core Libraries

#### 1. API Client (`lib/api-client.ts`)
```typescript
import apiClient from '@/lib/api-client'

// استخدام
const response = await apiClient.get('/products')
const data = await apiClient.post('/products', { name: 'منتج' })
```

#### 2. Authentication Hook (`hooks/use-auth.ts`)
```typescript
import { useAuth } from '@/hooks/use-auth'

function Component() {
  const { login, logout, isAuthenticated } = useAuth()
  
  // تسجيل دخول
  await login.mutateAsync({ email, password })
  
  // تحقق من المصادقة
  if (isAuthenticated()) {
    // مصادق
  }
}
```

#### 3. Utilities (`lib/utils.ts`)
```typescript
import { formatCurrency, formatDate } from '@/lib/utils'

formatCurrency(1500) // "1500.00 ج.م"
formatDate(new Date()) // "١٢ ديسمبر ٢٠٢٥"
```

---

## الوحدات الرئيسية

### 1. المصادقة (Authentication)

#### Login Page
```typescript
// app/auth/login/page.tsx
- نموذج تسجيل دخول
- التحقق من البيانات مع Zod
- إعادة توجيه للـ Dashboard
- عرض الأخطاء بالعربية
```

#### Register Page
```typescript
// app/auth/register/page.tsx
- نموذج إنشاء حساب
- حقول: الاسم، البريد، كلمة المرور، اسم المتجر
- Multi-tenant support
```

### 2. لوحة القيادة (Dashboard)

```typescript
// app/dashboard/page.tsx
- 4 بطاقات للإحصائيات:
  * إجمالي المبيعات
  * صافي الربح
  * عدد المنتجات
  * عدد العملاء
- جاهز لإضافة الرسوم البيانية
```

### 3. المنتجات (Products)

```typescript
// app/dashboard/products/page.tsx

الميزات:
- عرض Grid للمنتجات
- بحث في الوقت الفعلي
- عرض الصور أو placeholder
- تنبيه للمخزون المنخفض
- حذف مع تأكيد

البيانات:
- الاسم
- سعر البيع/الشراء
- المخزون
- الصورة
```

### 4. الطلبات (Orders)

```typescript
// app/dashboard/orders/page.tsx

الميزات:
- قائمة الطلبات
- حالة الطلب (مكتمل، قيد الانتظار، ملغي)
- عرض العميل والمنتجات
- حساب الأرباح تلقائياً
- جاهز لطباعة الفاتورة

البيانات:
- رقم الطلب
- العميل
- المنتجات
- الإجمالي والربح
```

### 5. العملاء (Customers)

```typescript
// app/dashboard/customers/page.tsx

الميزات:
- دليل العملاء
- بحث سريع
- عرض إجمالي المشتريات
- بيانات الاتصال

البيانات:
- الاسم
- الهاتف
- البريد
- العنوان
- إجمالي المشتريات
```

### 6. المصروفات (Expenses)

```typescript
// app/dashboard/expenses/page.tsx

الميزات:
- تسجيل المصروفات
- تصنيف حسب الفئة
- عرض إجمالي المصروفات
- تواريخ المصروفات

البيانات:
- الفئة
- المبلغ
- الوصف
- التاريخ
```

### 7. المخزون (Stock)

```typescript
// app/dashboard/stock/page.tsx

الميزات:
- عرض المخزون الحالي
- تنبيهات للمخزون المنخفض
- سجل حركات المخزون (IN/OUT)
- مؤشرات بصرية

البيانات:
- المنتج
- الكمية
- نوع الحركة
- السبب
- التاريخ
```

### 8. التقارير (Reports)

```typescript
// app/dashboard/reports/page.tsx

التقارير:
- الإيرادات
- الأرباح
- المصروفات
- صافي الربح
- هامش الربح

التصميم:
- بطاقات ملونة
- قائمة أرباح وخسائر
- مؤشرات واضحة
```

---

## API Integration

### Backend Endpoints المطلوبة

```typescript
// Authentication
POST   /api/auth/login
POST   /api/auth/register

// Products
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

// Orders
GET    /api/orders
POST   /api/orders
GET    /api/orders/:id

// Customers
GET    /api/customers
POST   /api/customers
PUT    /api/customers/:id

// Expenses
GET    /api/expenses
POST   /api/expenses

// Stock
GET    /api/stockmovements
POST   /api/stockmovements

// Dashboard
GET    /api/dashboard/metrics

// Reports
GET    /api/reports/summary
```

### Request Format

```typescript
// مع Token
{
  headers: {
    'Authorization': 'Bearer {token}',
    'Content-Type': 'application/json'
  }
}

// Multi-tenant
// TenantId يأتي من JWT token
```

### Response Format

```typescript
// نجاح
{
  data: T,
  message?: string,
  success: true
}

// خطأ
{
  message: string,
  success: false
}
```

---

## التخصيص

### تغيير الألوان

```typescript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: '#2563eb', // غير هنا
    }
  }
}
```

### تغيير العملة

```env
# .env.local
NEXT_PUBLIC_CURRENCY=$ # أو أي عملة
```

### إضافة صفحة جديدة

```typescript
// 1. أنشئ الملف
app/dashboard/newpage/page.tsx

// 2. أضف للـ Sidebar
// components/dashboard-sidebar.tsx
{
  title: 'صفحة جديدة',
  href: '/dashboard/newpage',
  icon: YourIcon,
}
```

### إضافة Endpoint جديد

```typescript
// في أي component
const { data } = useQuery({
  queryKey: ['key'],
  queryFn: async () => {
    const res = await apiClient.get('/your-endpoint')
    return res.data
  }
})
```

---

## المشاكل الشائعة

### 1. أخطاء TypeScript عند الإنشاء

**المشكلة**: أخطاء `Cannot find module`

**الحل**: 
```powershell
npm install
```

### 2. API لا يستجيب

**المشكلة**: Axios errors

**الحل**:
1. تحقق من Backend يعمل
2. تحقق من `NEXT_PUBLIC_API_URL` في `.env.local`
3. تحقق من CORS في Backend

### 3. Token expired

**المشكلة**: Auto logout

**الحل**: هذا طبيعي - api-client يحول للـ login تلقائياً

### 4. RTL لا يعمل

**المشكلة**: النص من اليسار

**الحل**: تأكد من:
```typescript
<html dir="rtl" lang="ar">
```

### 5. الخطوط لا تظهر

**المشكلة**: خط Cairo لا يعمل

**الحل**: 
```powershell
npm install
# الخط يُحمّل تلقائياً من Google Fonts
```

---

## Best Practices

### 1. استخدام Types

```typescript
import { Product, Order } from '@/types'

// ✅ جيد
const product: Product = {...}

// ❌ سيء
const product: any = {...}
```

### 2. Error Handling

```typescript
// ✅ جيد
try {
  await apiClient.post(...)
  toast.success('نجح')
} catch (error) {
  toast.error('فشل')
}
```

### 3. Loading States

```typescript
// ✅ جيد
if (isLoading) {
  return <div>جاري التحميل...</div>
}
```

### 4. استخدام TanStack Query

```typescript
// ✅ جيد - auto caching
const { data } = useQuery({
  queryKey: ['products'],
  queryFn: fetchProducts
})

// ❌ سيء - manual fetch
useEffect(() => {
  fetch(...)
}, [])
```

---

## الخلاصة

مكسبي نظام متكامل جاهز للاستخدام مع:

✅ بنية قوية وقابلة للتوسع
✅ كود نظيف ومنظم
✅ واجهة عربية كاملة
✅ RTL شامل
✅ أمان عالي
✅ أداء ممتاز

للدعم أو الاستفسارات، راجع الملفات:
- `README.md` - نظرة عامة
- `INSTALLATION.md` - التثبيت
- `PROJECT_SUMMARY.md` - ملخص المشروع
