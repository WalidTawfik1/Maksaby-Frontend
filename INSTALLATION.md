# دليل التثبيت السريع - مكسبي

## الخطوات

### 1. تثبيت المكتبات

في مجلد المشروع، قم بتشغيل:

```powershell
npm install
```

أو إذا كنت تفضل yarn:

```powershell
yarn install
```

أو pnpm:

```powershell
pnpm install
```

### 2. إعداد ملف البيئة

تأكد من وجود ملف `.env.local` مع المتغيرات التالية:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=مكسبي
NEXT_PUBLIC_CURRENCY=ج.م
```

### 3. تشغيل المشروع

```powershell
npm run dev
```

سيعمل التطبيق على: http://localhost:3000

### 4. البناء للإنتاج

```powershell
npm run build
npm start
```

## ملاحظات مهمة

### الأخطاء المتوقعة (TypeScript)

الأخطاء الحالية في الملفات طبيعية وستختفي بعد تثبيت المكتبات:
- `Cannot find module 'react'` 
- `Cannot find module 'next'`
- `JSX element implicitly has type 'any'`

هذه الأخطاء ستحل تلقائياً بعد تشغيل `npm install`

### متطلبات Backend

تأكد من أن الـ Backend API يعمل على المنفذ المحدد في `.env.local`

### الصفحات المتاحة

بعد التشغيل، يمكنك الوصول إلى:

- `/auth/login` - صفحة تسجيل الدخول
- `/auth/register` - صفحة إنشاء حساب
- `/dashboard` - لوحة القيادة (يتطلب تسجيل دخول)
- `/dashboard/products` - إدارة المنتجات
- `/dashboard/orders` - إدارة الطلبات
- `/dashboard/customers` - إدارة العملاء
- `/dashboard/expenses` - إدارة المصروفات
- `/dashboard/stock` - إدارة المخزون
- `/dashboard/reports` - التقارير

## الدعم

للمشاكل التقنية، تحقق من:
1. تثبيت Node.js 18 أو أحدث
2. تشغيل Backend API
3. صحة ملف `.env.local`
