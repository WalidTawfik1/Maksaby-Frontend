// API Message translations
const apiMessageTranslations: Record<string, string> = {
  // Auth messages
  'Login successful.': 'تم تسجيل الدخول بنجاح',
  'Registration successful.': 'تم إنشاء الحساب بنجاح',
  'Logged out successfully.': 'تم تسجيل الخروج بنجاح',
  'If your email is registered, you will receive a password reset link shortly.': 'إذا كان بريدك الإلكتروني مسجلاً، ستتلقى رابط إعادة تعيين كلمة المرور قريباً',
  'Password has been reset successfully.': 'تم إعادة تعيين كلمة المرور بنجاح',
  
  // Common errors
  'Invalid email or password': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'Email already exists': 'البريد الإلكتروني مسجل مسبقاً',
  'Invalid or expired token': 'الرمز غير صالح أو منتهي الصلاحية',
  'User not found': 'المستخدم غير موجود',
  'Invalid OTP code': 'رمز التحقق غير صحيح',
  'OTP expired': 'رمز التحقق منتهي الصلاحية',
}

// Helper function to translate API messages
export const translateApiMessage = (message: string): string => {
  return apiMessageTranslations[message] || message
}

export const translations = {
  // Navigation
  dashboard: 'لوحة التحكم',
  products: 'المنتجات',
  orders: 'الطلبات',
  customers: 'العملاء',
  expenses: 'المصروفات',
  stock: 'المخزون',
  reports: 'التقارير',
  settings: 'الإعدادات',
  logout: 'تسجيل الخروج',

  // Dashboard
  totalSales: 'إجمالي المبيعات',
  netProfit: 'صافي الربح',
  productsCount: 'عدد المنتجات',
  customersCount: 'عدد العملاء',
  revenueVsProfit: 'الإيرادات مقابل الأرباح',
  topProducts: 'أفضل المنتجات',
  recentOrders: 'الطلبات الأخيرة',
  
  // Products
  addProduct: 'إضافة منتج',
  editProduct: 'تعديل منتج',
  deleteProduct: 'حذف منتج',
  productName: 'اسم المنتج',
  buyingPrice: 'سعر الشراء',
  sellingPrice: 'سعر البيع',
  productStock: 'المخزون',
  lowStock: 'مخزون منخفض',
  image: 'الصورة',
  profitMargin: 'هامش الربح',
  
  // Orders
  createOrder: 'إنشاء طلب',
  selectCustomer: 'اختر العميل',
  addItem: 'إضافة منتج',
  orderTotal: 'إجمالي الطلب',
  orderProfit: 'ربح الطلب',
  printInvoice: 'طباعة الفاتورة',
  
  // Customers
  addCustomer: 'إضافة عميل',
  customerName: 'اسم العميل',
  phone: 'رقم الهاتف',
  customerEmail: 'البريد الإلكتروني',
  address: 'العنوان',
  totalSpent: 'إجمالي المشتريات',
  purchaseHistory: 'سجل المشتريات',
  
  // Expenses
  addExpense: 'إضافة مصروف',
  expenseCategory: 'فئة المصروف',
  expenseAmount: 'المبلغ',
  expenseDate: 'التاريخ',
  expenseDescription: 'الوصف',
  monthlySummary: 'ملخص شهري',
  
  // Stock
  currentStock: 'المخزون الحالي',
  stockMovement: 'حركة المخزون',
  stockIn: 'إدخال مخزون',
  stockOut: 'إخراج مخزون',
  
  // Reports
  profitLoss: 'الأرباح والخسائر',
  salesByProduct: 'المبيعات حسب المنتج',
  expenseBreakdown: 'تفصيل المصروفات',
  
  // Common
  save: 'حفظ',
  cancel: 'إلغاء',
  delete: 'حذف',
  edit: 'تعديل',
  view: 'عرض',
  search: 'بحث',
  filter: 'تصفية',
  from: 'من',
  to: 'إلى',
  date: 'التاريخ',
  quantity: 'الكمية',
  price: 'السعر',
  total: 'الإجمالي',
  profit: 'الربح',
  status: 'الحالة',
  actions: 'الإجراءات',
  
  // Messages
  confirmDelete: 'هل أنت متأكد من الحذف؟',
  deleteSuccess: 'تم الحذف بنجاح',
  saveSuccess: 'تم الحفظ بنجاح',
  error: 'حدث خطأ',
  loading: 'جاري التحميل...',
  noData: 'لا توجد بيانات',
  
  // Auth
  login: 'تسجيل الدخول',
  register: 'إنشاء حساب',
  email: 'البريد الإلكتروني',
  password: 'كلمة المرور',
  forgotPassword: 'نسيت كلمة المرور؟',
  resetPassword: 'إعادة تعيين كلمة المرور',
  welcomeBack: 'مرحباً بعودتك',
}

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey): string {
  return translations[key]
}
