
-- حذف البيانات الوهمية من جدول المصروفات
DELETE FROM public.expenses 
WHERE title IN ('قهوة وشاي', 'كهرباء', 'صيانة آلة القهوة') 
   OR description IN ('شراء مواد خام للمشروبات', 'فاتورة الكهرباء الشهرية', 'إصلاح آلة الاسبريسو');

-- حذف البيانات الوهمية من جدول العملاء (إذا وجدت)
DELETE FROM public.customers 
WHERE name IN ('أحمد محمد', 'فاطمة علي', 'خالد السعد', 'مريم حسن') 
   OR email IN ('ahmed@example.com', 'fatima@example.com', 'khalid@example.com', 'mariam@example.com');

-- حذف ديون العملاء الوهمية المرتبطة بالعملاء المحذوفين
DELETE FROM public.customer_debts 
WHERE customer_id NOT IN (SELECT id FROM public.customers);
