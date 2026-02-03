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
  
  // Order messages
  'Order created successfully.': 'تم إنشاء الطلب بنجاح',
  'Orders retrieved successfully.': 'تم استرجاع الطلبات بنجاح',
  'Order deleted successfully.': 'تم حذف الطلب بنجاح',
  
  // Dashboard messages
  'Dashboard data retrieved successfully.': 'تم استرجاع بيانات لوحة التحكم بنجاح',
  
  // Expense messages
  'Expense added successfully.': 'تم إضافة المصروف بنجاح',
  'Expenses retrieved successfully.': 'تم استرجاع المصروفات بنجاح',
  'Expense retrieved successfully.': 'تم استرجاع المصروف بنجاح',
  'Expense updated successfully.': 'تم تحديث المصروف بنجاح',
  'Expense deleted successfully.': 'تم حذف المصروف بنجاح',
  'Expense not found': 'المصروف غير موجود',
  
  // Note messages
  'Note added successfully.': 'تم إضافة الملاحظة بنجاح',
  'Notes retrieved successfully.': 'تم استرجاع الملاحظات بنجاح',
  'Note retrieved successfully.': 'تم استرجاع الملاحظة بنجاح',
  'Customer notes retrieved successfully.': 'تم استرجاع ملاحظات العميل بنجاح',
  'Note updated successfully.': 'تم تحديث الملاحظة بنجاح',
  'Note completion status toggled successfully.': 'تم تغيير حالة الملاحظة بنجاح',
  'Note deleted successfully.': 'تم حذف الملاحظة بنجاح',
  'Note not found': 'الملاحظة غير موجودة',
  
  // Profile messages
  'Profile retrieved successfully.': 'تم استرجاع الملف الشخصي بنجاح',
  'Profile updated successfully.': 'تم تحديث الملف الشخصي بنجاح',
  
  // Supplier messages
  'Supplier added successfully.': 'تم إضافة المورد بنجاح',
  'Suppliers retrieved successfully.': 'تم استرجاع الموردين بنجاح',
  'Supplier retrieved successfully.': 'تم استرجاع المورد بنجاح',
  'Supplier updated successfully.': 'تم تحديث المورد بنجاح',
  'Supplier deleted successfully.': 'تم حذف المورد بنجاح',
  'Supplier not found': 'المورد غير موجود',
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
  suppliers: 'الموردين',
  expenses: 'المصروفات',
  stock: 'المخزون',
  notes: 'الملاحظات',
  settings: 'الإعدادات',
  logout: 'تسجيل الخروج',

  // Dashboard
  totalSales: 'إجمالي المبيعات',
  netProfit: 'صافي الربح',
  productsCount: 'عدد المنتجات',
  customersCount: 'عدد العملاء',
  currentCash: 'النقد الحالي',
  initialCash: 'النقد الأولي',
  totalExpenses: 'إجمالي المصروفات',
  costOfGoodsSold: 'تكلفة البضاعة المباعة',
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
  
  // Suppliers
  addSupplier: 'إضافة مورد',
  editSupplier: 'تعديل مورد',
  deleteSupplier: 'حذف مورد',
  supplierName: 'اسم المورد',
  supplierPhone: 'رقم هاتف المورد',
  supplierEmail: 'بريد المورد الإلكتروني',
  supplierAddress: 'عنوان المورد',
  totalPurchased: 'إجمالي المشتريات',
  selectSupplier: 'اختر المورد',
  supplier: 'المورد',
  supplierOptional: 'المورد (اختياري)',
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
  
  // Profile/Settings
  profile: 'الملف الشخصي',
  accountSettings: 'إعدادات الحساب',
  updateProfile: 'تحديث الملف الشخصي',
  profilePicture: 'صورة الملف الشخصي',
  chooseImage: 'اختر صورة',
  saveChanges: 'حفظ التغييرات',
  name: 'الاسم',
  phoneNumber: 'رقم الهاتف',
}

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey): string {
  return translations[key]
}
