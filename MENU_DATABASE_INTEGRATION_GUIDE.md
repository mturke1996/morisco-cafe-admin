# دليل ربط قائمة الطعام بقاعدة بيانات Supabase

## نظرة عامة

هذا الدليل يوضح كيفية ربط موقع قائمة الطعام بقاعدة بيانات Supabase التي تحتوي على جميع التصنيفات والعناصر.

## بنية قاعدة البيانات

### جدول menu_items

```sql
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,                    -- اسم العنصر
  category TEXT NOT NULL,                -- التصنيف
  price DECIMAL(10,2),                   -- السعر (للعناصر ذات السعر الواحد)
  prices JSONB,                          -- الأسعار (للعناصر ذات الأحجام المختلفة مثل L/M)
  description TEXT,                      -- الوصف
  options JSONB,                         -- الخيارات (مثل ["سكر", "بدون سكر"])
  image_url TEXT,                        -- رابط الصورة
  is_available BOOLEAN DEFAULT true,     -- متاح أم لا
  sort_order INTEGER DEFAULT 0,          -- ترتيب العرض
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### التصنيفات المتاحة

- `hotDrinks` - مشروبات ساخنة
- `coldDrinks` - مشروبات باردة
- `cocktails` - كوكتيلات
- `naturalJuices` - عصائر طبيعية
- `Froppy` - فروبي
- `shakes` - ميلك شيك
- `Smoothie` - سموذي
- `crepes` - كريب
- `croissants` - كرواسون
- `miniPancakes` - ميني بان كيك
- `waffles` - وافل
- `kunafa` - كنافة
- `cakes` - كيكات
- `sweets` - حلويات وبقلاوة
- `Mohjito` - موهيتو
- `iceCream` - آيس كريم
- `breakfast` - إفطار
- `shakshuka` - شكشوكة تركية
- `toast` - توست
- `sandwiches` - سندويشات
- `pizza` - بيتزا
- `pastries` - معجنات

## إعداد Supabase Client

### 1. تثبيت Supabase

```bash
npm install @supabase/supabase-js
```

### 2. إعداد ملف العميل

```typescript
// supabase/client.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kktnwrptrtldvkvxlshd.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrdG53cnB0cnRsZHZrdnhsc2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MTY5ODEsImV4cCI6MjA3MDQ5Mjk4MX0.fw7jrOldHU5QxnbFApeDvKU1Xcs2gI70SS3ZQ69az5Y";

export const supabase = createClient(supabaseUrl, supabaseKey);
```

## جلب البيانات من قاعدة البيانات

### 1. جلب جميع التصنيفات

```typescript
// جلب جميع التصنيفات الفريدة
const getCategories = async () => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("category")
    .neq("category", "category_header")
    .order("sort_order");

  if (error) throw error;
  return [...new Set(data.map((item) => item.category))];
};
```

### 2. جلب عناصر تصنيف معين

```typescript
// جلب عناصر تصنيف معين
const getMenuItemsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("category", category)
    .eq("is_available", true)
    .order("sort_order");

  if (error) throw error;
  return data;
};
```

### 3. جلب جميع العناصر مع التصنيفات

```typescript
// جلب جميع العناصر مع تجميعها حسب التصنيف
const getAllMenuItems = async () => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category, sort_order");

  if (error) throw error;

  // تجميع العناصر حسب التصنيف
  const groupedData = data.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  return groupedData;
};
```

### 4. البحث في العناصر

```typescript
// البحث في العناصر
const searchMenuItems = async (searchTerm: string) => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .ilike("name", `%${searchTerm}%`)
    .eq("is_available", true)
    .order("category, sort_order");

  if (error) throw error;
  return data;
};
```

## React Hook لإدارة قائمة الطعام

```typescript
// hooks/useMenu.ts
import { useState, useEffect } from "react";
import { supabase } from "../supabase/client";

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price?: number;
  prices?: { L: number; M: number };
  description?: string;
  options?: string[];
  image_url?: string;
  is_available: boolean;
  sort_order: number;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export const useMenu = () => {
  const [menuData, setMenuData] = useState<Record<string, MenuCategory>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("category, sort_order");

      if (error) throw error;

      // تجميع البيانات حسب التصنيف
      const groupedData = data.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = {
            title: getCategoryTitle(item.category),
            items: [],
          };
        }

        // إضافة العنصر فقط إذا لم يكن عنوان التصنيف
        if (item.price !== 0) {
          acc[item.category].items.push({
            ...item,
            options: item.options
              ? JSON.parse(item.options as string)
              : undefined,
            prices: item.prices ? JSON.parse(item.prices as string) : undefined,
          });
        }

        return acc;
      }, {});

      setMenuData(groupedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ في جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  return { menuData, loading, error, refetch: fetchMenuData };
};

// دالة لتحويل كود التصنيف إلى العنوان العربي
const getCategoryTitle = (category: string): string => {
  const categoryTitles: Record<string, string> = {
    hotDrinks: "مشروبات ساخنة",
    coldDrinks: "مشروبات باردة",
    cocktails: "كوكتيلات",
    naturalJuices: "عصائر طبيعية",
    Froppy: "فروبي",
    shakes: "ميلك شيك",
    Smoothie: "سموذي",
    crepes: "كريب",
    croissants: "كرواسون",
    miniPancakes: "ميني بان كيك",
    waffles: "وافل",
    kunafa: "كنافة",
    cakes: "كيكات",
    sweets: "حلويات وبقلاوة",
    Mohjito: "موهيتو",
    iceCream: "آيس كريم",
    breakfast: "إفطار",
    shakshuka: "شكشوكة تركية",
    toast: "توست",
    sandwiches: "سندويشات",
    pizza: "بيتزا",
    pastries: "معجنات",
  };

  return categoryTitles[category] || category;
};
```

## مكون عرض قائمة الطعام

```typescript
// components/MenuDisplay.tsx
import React from "react";
import { useMenu } from "../hooks/useMenu";

export const MenuDisplay: React.FC = () => {
  const { menuData, loading, error } = useMenu();

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  return (
    <div className="menu-container">
      {Object.entries(menuData).map(([categoryKey, category]) => (
        <div key={categoryKey} className="category-section">
          <h2 className="category-title">{category.title}</h2>
          <div className="items-grid">
            {category.items.map((item) => (
              <div key={item.id} className="menu-item">
                <h3>{item.name}</h3>
                {item.description && (
                  <p className="description">{item.description}</p>
                )}

                {/* عرض السعر */}
                {item.price ? (
                  <p className="price">{item.price} د.ك</p>
                ) : item.prices ? (
                  <div className="prices">
                    <span>كبير: {item.prices.L} د.ك</span>
                    <span>متوسط: {item.prices.M} د.ك</span>
                  </div>
                ) : null}

                {/* عرض الخيارات */}
                {item.options && (
                  <div className="options">
                    {item.options.map((option, index) => (
                      <span key={index} className="option-tag">
                        {option}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
```

## إدارة البيانات (CRUD Operations)

### 1. إضافة عنصر جديد

```typescript
const addMenuItem = async (
  item: Omit<MenuItem, "id" | "created_at" | "updated_at">
) => {
  const { data, error } = await supabase
    .from("menu_items")
    .insert([
      {
        ...item,
        options: item.options ? JSON.stringify(item.options) : null,
        prices: item.prices ? JSON.stringify(item.prices) : null,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
};
```

### 2. تحديث عنصر موجود

```typescript
const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
  const { data, error } = await supabase
    .from("menu_items")
    .update({
      ...updates,
      options: updates.options ? JSON.stringify(updates.options) : undefined,
      prices: updates.prices ? JSON.stringify(updates.prices) : undefined,
    })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};
```

### 3. حذف عنصر

```typescript
const deleteMenuItem = async (id: string) => {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);

  if (error) throw error;
};
```

### 4. تغيير حالة التوفر

```typescript
const toggleItemAvailability = async (id: string, isAvailable: boolean) => {
  const { data, error } = await supabase
    .from("menu_items")
    .update({ is_available: isAvailable })
    .eq("id", id)
    .select();

  if (error) throw error;
  return data[0];
};
```

## إعدادات الأمان (RLS Policies)

تأكد من إعداد Row Level Security policies في Supabase:

```sql
-- تفعيل RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة (جميع المستخدمين يمكنهم قراءة العناصر المتاحة)
CREATE POLICY "Anyone can view available menu items"
ON menu_items FOR SELECT
USING (is_available = true);

-- سياسة للإدارة (المستخدمون المصادق عليهم فقط)
CREATE POLICY "Authenticated users can manage menu items"
ON menu_items FOR ALL
USING (auth.uid() IS NOT NULL);
```

## نصائح للتحسين

### 1. التخزين المؤقت (Caching)

```typescript
// استخدام React Query أو SWR للتخزين المؤقت
import { useQuery } from "@tanstack/react-query";

export const useMenuQuery = () => {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: fetchAllMenuItems,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    cacheTime: 10 * 60 * 1000, // 10 دقائق
  });
};
```

### 2. التحميل التدريجي (Pagination)

```typescript
const getMenuItemsPaginated = async (page: number, limit: number = 20) => {
  const from = page * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true)
    .order("category, sort_order")
    .range(from, to);

  if (error) throw error;
  return data;
};
```

### 3. البحث المتقدم

```typescript
const searchMenuItemsAdvanced = async (filters: {
  searchTerm?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  let query = supabase.from("menu_items").select("*").eq("is_available", true);

  if (filters.searchTerm) {
    query = query.ilike("name", `%${filters.searchTerm}%`);
  }

  if (filters.category) {
    query = query.eq("category", filters.category);
  }

  if (filters.minPrice) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice) {
    query = query.lte("price", filters.maxPrice);
  }

  const { data, error } = await query.order("category, sort_order");

  if (error) throw error;
  return data;
};
```

## مثال كامل للاستخدام

```typescript
// App.tsx
import React from "react";
import { MenuDisplay } from "./components/MenuDisplay";
import { MenuProvider } from "./context/MenuContext";

function App() {
  return (
    <MenuProvider>
      <div className="App">
        <header>
          <h1>قائمة الطعام - مقهى موريسكو</h1>
        </header>
        <main>
          <MenuDisplay />
        </main>
      </div>
    </MenuProvider>
  );
}

export default App;
```

## الخلاصة

هذا الدليل يوفر كل ما تحتاجه لربط موقع قائمة الطعام بقاعدة بيانات Supabase. يمكنك:

1. جلب جميع التصنيفات والعناصر من قاعدة البيانات
2. عرضها بطريقة منظمة وجميلة
3. إدارة البيانات (إضافة، تعديل، حذف)
4. البحث والفلترة
5. إدارة حالة التوفر

البيانات موجودة بالفعل في قاعدة البيانات وجاهزة للاستخدام!
