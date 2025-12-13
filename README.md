# مكسبي (Maksaby) - Frontend

نظام إدارة المخزون والطلبات للمحلات التجارية مبني بـ Next.js 15 مع دعم كامل للغة العربية والـ RTL.

## المميزات

- ✅ **لوحة قيادة شاملة**: عرض المبيعات، الأرباح، وإحصائيات المنتجات
- ✅ **إدارة المنتجات**: إضافة، تعديل، وحذف المنتجات مع رفع الصور
- ✅ **نظام الطلبات**: إنشاء طلبات POS مع حساب الأرباح تلقائياً
- ✅ **إدارة العملاء**: متابعة بيانات العملاء وسجل المشتريات
- ✅ **تتبع المصروفات**: تسجيل المصروفات بفئات مختلفة
- ✅ **إدارة المخزون**: تتبع حركة المخزون IN/OUT
- ✅ **التقارير**: تقارير الأرباح والخسائر والمبيعات
- ✅ **نظام مستأجرين متعدد**: دعم Multi-tenant
- ✅ **مصادقة JWT**: نظام تسجيل دخول آمن
- ✅ **دعم RTL**: واجهة عربية كاملة مع تخطيط من اليمين لليسار

## التقنيات المستخدمة

- **Next.js 15** - App Router مع TypeScript
- **Tailwind CSS** - مع plugin RTL
- **shadcn/ui** - مكتبة المكونات
- **TanStack Query** - إدارة حالة الـ Server
- **React Hook Form** - إدارة النماذج
- **Zod** - التحقق من البيانات
- **Axios** - HTTP Client
- **Lucide React** - الأيقونات
- **Cairo Font** - الخط العربي

## المتطلبات

- Node.js 18+ 
- npm أو yarn أو pnpm

## التثبيت

### 1. تثبيت المكتبات

```bash
npm install
```

### 2. إعداد ملف البيئة

انسخ ملف `.env.example` إلى `.env.local` وعدّل القيم:

```bash
cp .env.example .env.local
```

محتوى `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=مكسبي
NEXT_PUBLIC_CURRENCY=ج.م
```

### 3. تشغيل المشروع

```bash
npm run dev
```

افتح المتصفح على [http://localhost:3000](http://localhost:3000)

## البناء للإنتاج

```bash
npm run build
npm start
```

## هيكل المشروع

```
maksaby-frontend/
├── app/
│   ├── auth/
│   │   ├── login/         # صفحة تسجيل الدخول
│   │   └── register/      # صفحة إنشاء حساب
│   ├── dashboard/
│   │   ├── page.tsx       # لوحة التحكم
│   │   ├── products/      # صفحات المنتجات
│   │   ├── orders/        # صفحات الطلبات
│   │   ├── customers/     # صفحات العملاء
│   │   ├── expenses/      # صفحات المصروفات
│   │   ├── stock/         # صفحات المخزون
│   │   └── reports/       # صفحات التقارير
│   ├── layout.tsx         # الـ Layout الرئيسي
│   └── globals.css        # الأنماط العامة
├── components/
│   ├── ui/                # مكونات shadcn/ui
│   ├── dashboard-sidebar.tsx
│   └── providers.tsx
├── lib/
│   ├── api-client.ts      # Axios configuration
│   ├── utils.ts           # وظائف مساعدة
│   └── translations.ts    # الترجمات العربية
├── hooks/
│   └── use-auth.ts        # Hook المصادقة
├── types/
│   └── index.ts           # TypeScript types
└── package.json
```

## الواجهة الخلفية (Backend API)

يحتاج المشروع إلى API مبني بـ .NET 8 مع Endpoints التالية:

### Authentication
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - إنشاء حساب

### Products
- `GET /api/products` - الحصول على كل المنتجات
- `POST /api/products` - إضافة منتج
- `PUT /api/products/{id}` - تعديل منتج
- `DELETE /api/products/{id}` - حذف منتج

### Orders
- `GET /api/orders` - الحصول على كل الطلبات
- `POST /api/orders` - إنشاء طلب جديد
- `GET /api/orders/{id}` - تفاصيل طلب

### Customers
- `GET /api/customers` - الحصول على كل العملاء
- `POST /api/customers` - إضافة عميل
- `PUT /api/customers/{id}` - تعديل عميل

### Expenses
- `GET /api/expenses` - الحصول على كل المصروفات
- `POST /api/expenses` - إضافة مصروف

### Stock Movements
- `GET /api/stockmovements` - الحصول على حركات المخزون
- `POST /api/stockmovements` - إضافة حركة مخزون

### Dashboard
- `GET /api/dashboard/metrics` - إحصائيات لوحة التحكم

## الترخيص

MIT License

## المطور

تم التطوير بواسطة Copilot
