# 🍽️ Cafe Hub - نظام إدارة المطاعم

نظام شامل لإدارة المطاعم يتضمن إدارة القوائم والعروض اليومية مع واجهة محسنة للهاتف والكمبيوتر.

## ✨ المميزات

### 📱 إدارة القائمة

- **عرض العناصر**: عرض جميع عناصر القائمة بتصميم جميل ومتجاوب
- **إضافة عناصر**: إضافة عناصر جديدة مع تفاصيل كاملة
- **تعديل العناصر**: تعديل أو حذف العناصر الموجودة
- **تفعيل/إلغاء تفعيل**: إدارة توفر العناصر
- **البحث والفلترة**: بحث متقدم وفلترة حسب التصنيف
- **الإحصائيات**: عرض إحصائيات مفصلة للقائمة

### 🎯 العروض اليومية

- **إنشاء العروض**: إنشاء عروض مع عناصر متعددة
- **حساب الخصومات**: حساب تلقائي لنسب الخصم
- **إدارة العروض**: تعديل وحذف العروض
- **تفعيل العروض**: إدارة حالة العروض

### 📱 تصميم متجاوب

- **محسن للهاتف**: واجهة محسنة للشاشات الصغيرة
- **تصميم حديث**: استخدام أحدث تقنيات UI/UX
- **سهولة الاستخدام**: واجهة بديهية وسهلة الاستخدام

## 🛠️ التقنيات المستخدمة

- **Frontend**: React + TypeScript
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 🚀 التثبيت والتشغيل

### المتطلبات

- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn
- حساب Supabase

### خطوات التثبيت

1. **استنساخ المشروع**

```bash
git clone https://github.com/yourusername/cafe-hub.git
cd cafe-hub
```

2. **تثبيت التبعيات**

```bash
npm install
```

3. **إعداد قاعدة البيانات**

- أنشئ مشروع جديد في Supabase
- انسخ ملفات الهجرة من مجلد `supabase/migrations/`
- قم بتشغيل الهجرات في Supabase

4. **إعداد متغيرات البيئة**

```bash
cp .env.example .env.local
```

قم بتحديث القيم في `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **تشغيل المشروع**

```bash
npm run dev
```

6. **فتح المتصفح**
   انتقل إلى `http://localhost:8080`

## 📊 قاعدة البيانات

### الجداول الرئيسية

#### `menu_items`

```sql
- id: UUID (Primary Key)
- name: TEXT (اسم العنصر)
- category: TEXT (التصنيف)
- price: DECIMAL (السعر)
- prices: JSONB (أسعار متعددة)
- description: TEXT (الوصف)
- options: JSONB (خيارات إضافية)
- image_url: TEXT (رابط الصورة)
- is_available: BOOLEAN (متوفر)
- sort_order: INTEGER (ترتيب العرض)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `daily_offers`

```sql
- id: UUID (Primary Key)
- title: TEXT (عنوان العرض)
- description: TEXT (وصف العرض)
- original_price: DECIMAL (السعر الأصلي)
- offer_price: DECIMAL (سعر العرض)
- discount_percentage: INTEGER (نسبة الخصم)
- image_url: TEXT (صورة العرض)
- is_active: BOOLEAN (نشط)
- start_date: TIMESTAMP (تاريخ البداية)
- end_date: TIMESTAMP (تاريخ النهاية)
- sort_order: INTEGER (ترتيب العرض)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `daily_offer_items`

```sql
- id: UUID (Primary Key)
- offer_id: UUID (معرف العرض)
- menu_item_id: UUID (معرف عنصر القائمة)
- quantity: INTEGER (الكمية)
- sort_order: INTEGER (ترتيب العنصر)
- created_at: TIMESTAMP
```

## 🎨 التصميم

### الألوان

- **الأساسي**: أزرق (#3B82F6)
- **النجاح**: أخضر (#10B981)
- **التحذير**: أصفر (#F59E0B)
- **الخطأ**: أحمر (#EF4444)
- **الرمادي**: رمادي (#6B7280)

### الخطوط

- **العنوان**: Inter Bold
- **النص**: Inter Regular
- **الأيقونات**: Lucide Icons

## 📱 الاستجابة

### نقاط التوقف

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### التحسينات للهاتف

- بطاقات أصغر وأزرار أكبر
- نصوص متجاوبة
- تخطيط عمودي للفلاتر
- مساحات محسنة

## 🔧 التطوير

### هيكل المشروع

```
src/
├── components/          # مكونات UI
├── pages/              # صفحات التطبيق
├── integrations/       # تكاملات خارجية
├── data/              # بيانات ثابتة
└── types/             # تعريفات TypeScript
```

### الأوامر المتاحة

```bash
npm run dev          # تشغيل خادم التطوير
npm run build        # بناء المشروع للإنتاج
npm run preview      # معاينة البناء
npm run lint         # فحص الكود
```

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ فرع للميزة الجديدة (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push للفرع (`git push origin feature/AmazingFeature`)
5. افتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 التواصل

- **المطور**: [اسمك]
- **البريد الإلكتروني**: [بريدك الإلكتروني]
- **GitHub**: [رابط GitHub]

## 🙏 شكر وتقدير

- [Shadcn/ui](https://ui.shadcn.com/) للمكونات الجميلة
- [Supabase](https://supabase.com/) لقاعدة البيانات
- [Vite](https://vitejs.dev/) لأداة البناء
- [Tailwind CSS](https://tailwindcss.com/) للتصميم

---

⭐ إذا أعجبك المشروع، لا تنس إعطاؤه نجمة!
