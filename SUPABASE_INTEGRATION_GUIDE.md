# دليل ربط الموقع الآخر مع Supabase وقاعدة البيانات

## 📋 نظرة عامة

هذا الدليل يوضح كيفية ربط أي موقع أو تطبيق بقاعدة البيانات Supabase لإدارة قائمة الطعام والمشروبات.

## 🗄️ هيكل قاعدة البيانات

### جدول `menu_items`

```sql
CREATE TABLE menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price DECIMAL(10,2),
  prices JSONB,
  description TEXT,
  options JSONB,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### الفهارس (Indexes)

```sql
CREATE INDEX idx_menu_items_category ON menu_items(category);
CREATE INDEX idx_menu_items_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_sort ON menu_items(sort_order);
```

## 🔧 إعداد Supabase

### 1. إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ حساب جديد أو سجل الدخول
3. اضغط "New Project"
4. اختر اسم المشروع والمنطقة
5. انتظر حتى يتم إنشاء المشروع

### 2. الحصول على مفاتيح API

```javascript
// من لوحة تحكم Supabase > Settings > API
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_ANON_KEY = "your-anon-key";
const SUPABASE_SERVICE_KEY = "your-service-key"; // للعمليات الإدارية
```

### 3. إعداد RLS (Row Level Security)

```sql
-- تفعيل RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة العامة
CREATE POLICY "Allow public read access" ON menu_items
  FOR SELECT USING (true);

-- سياسة للكتابة (تحتاج مصادقة)
CREATE POLICY "Allow authenticated insert" ON menu_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON menu_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON menu_items
  FOR DELETE USING (auth.role() = 'authenticated');
```

## 📱 ربط الموقع الآخر

### 1. تثبيت Supabase Client

```bash
# JavaScript/Node.js
npm install @supabase/supabase-js

# Python
pip install supabase

# PHP
composer require supabase/supabase-php

# Flutter/Dart
dart pub add supabase_flutter
```

### 2. إعداد العميل (Client Setup)

#### JavaScript/React

```javascript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://your-project-id.supabase.co";
const supabaseKey = "your-anon-key";

export const supabase = createClient(supabaseUrl, supabaseKey);
```

#### Python

```python
from supabase import create_client, Client

url: str = "https://your-project-id.supabase.co"
key: str = "your-anon-key"

supabase: Client = create_client(url, key)
```

#### PHP

```php
use Supabase\Supabase;

$supabase = new Supabase('your-project-id', 'your-anon-key');
```

### 3. العمليات الأساسية (CRUD Operations)

#### جلب جميع العناصر

```javascript
// JavaScript
const { data: menuItems, error } = await supabase
  .from("menu_items")
  .select("*")
  .order("sort_order", { ascending: true });

if (error) {
  console.error("Error:", error);
} else {
  console.log("Menu items:", menuItems);
}
```

```python
# Python
response = supabase.table('menu_items').select('*').order('sort_order').execute()
menu_items = response.data
```

#### جلب عناصر حسب التصنيف

```javascript
// JavaScript
const { data: hotDrinks, error } = await supabase
  .from("menu_items")
  .select("*")
  .eq("category", "hotDrinks")
  .eq("is_available", true)
  .order("sort_order");
```

#### إضافة عنصر جديد

```javascript
// JavaScript
const { data, error } = await supabase.from("menu_items").insert([
  {
    name: "قهوة عربية سادة",
    category: "hotDrinks",
    price: 8.0,
    options: ["سادة", "معدلة", "ناقصة"],
    is_available: true,
    sort_order: 1,
  },
]);
```

#### تحديث عنصر

```javascript
// JavaScript
const { data, error } = await supabase
  .from("menu_items")
  .update({
    price: 9.0,
    is_available: false,
  })
  .eq("id", "item-id-here");
```

#### حذف عنصر

```javascript
// JavaScript
const { error } = await supabase
  .from("menu_items")
  .delete()
  .eq("id", "item-id-here");
```

## 🔄 Real-time Updates

### الاشتراك في التحديثات المباشرة

```javascript
// JavaScript
const subscription = supabase
  .channel("menu_items_changes")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "menu_items",
    },
    (payload) => {
      console.log("Change received!", payload);
      // تحديث واجهة المستخدم
    }
  )
  .subscribe();

// إلغاء الاشتراك
subscription.unsubscribe();
```

## 🎨 أمثلة تطبيقية

### 1. صفحة قائمة الطعام

```javascript
// React Component
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function MenuPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("sort_order");

    if (error) {
      console.error("Error:", error);
    } else {
      setMenuItems(data);
      // استخراج التصنيفات الفريدة
      const uniqueCategories = [...new Set(data.map((item) => item.category))];
      setCategories(uniqueCategories);
    }
  };

  const filteredItems =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <div>
      {/* شريط التصنيفات */}
      <div className="category-tabs">
        <button onClick={() => setSelectedCategory("all")}>الكل</button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "active" : ""}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {/* عرض العناصر */}
      <div className="menu-items">
        {filteredItems.map((item) => (
          <div key={item.id} className="menu-item">
            <h3>{item.name}</h3>
            <p>{item.description}</p>
            <div className="price">
              {item.price
                ? `$${item.price}`
                : item.prices
                ? `$${item.prices.M} - $${item.prices.L}`
                : "السعر غير محدد"}
            </div>
            {item.options && (
              <div className="options">
                {item.options.map((option) => (
                  <span key={option} className="option-tag">
                    {option}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. إدارة القائمة (للمدير)

```javascript
// Admin Panel
function AdminMenuManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const addMenuItem = async (itemData) => {
    const { data, error } = await supabase
      .from("menu_items")
      .insert([itemData])
      .select();

    if (error) {
      alert("خطأ في إضافة العنصر: " + error.message);
    } else {
      setMenuItems([...menuItems, ...data]);
    }
  };

  const updateMenuItem = async (id, updates) => {
    const { data, error } = await supabase
      .from("menu_items")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) {
      alert("خطأ في تحديث العنصر: " + error.message);
    } else {
      setMenuItems(
        menuItems.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        )
      );
    }
  };

  const deleteMenuItem = async (id) => {
    const { error } = await supabase.from("menu_items").delete().eq("id", id);

    if (error) {
      alert("خطأ في حذف العنصر: " + error.message);
    } else {
      setMenuItems(menuItems.filter((item) => item.id !== id));
    }
  };

  const toggleAvailability = async (id, isAvailable) => {
    await updateMenuItem(id, { is_available: isAvailable });
  };

  return (
    <div>
      {/* نموذج إضافة/تعديل */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="اسم العنصر"
          value={editingItem?.name || ""}
          onChange={(e) =>
            setEditingItem({ ...editingItem, name: e.target.value })
          }
        />
        <select
          value={editingItem?.category || ""}
          onChange={(e) =>
            setEditingItem({ ...editingItem, category: e.target.value })
          }
        >
          <option value="hotDrinks">مشروبات ساخنة</option>
          <option value="coldDrinks">مشروبات باردة</option>
          {/* المزيد من التصنيفات */}
        </select>
        <input
          type="number"
          placeholder="السعر"
          value={editingItem?.price || ""}
          onChange={(e) =>
            setEditingItem({
              ...editingItem,
              price: parseFloat(e.target.value),
            })
          }
        />
        <button type="submit">{editingItem?.id ? "تحديث" : "إضافة"}</button>
      </form>

      {/* قائمة العناصر */}
      <div className="items-list">
        {menuItems.map((item) => (
          <div key={item.id} className="item-card">
            <h3>{item.name}</h3>
            <p>{item.category}</p>
            <p>${item.price}</p>
            <div className="actions">
              <button onClick={() => setEditingItem(item)}>تعديل</button>
              <button
                onClick={() => toggleAvailability(item.id, !item.is_available)}
              >
                {item.is_available ? "إخفاء" : "إظهار"}
              </button>
              <button onClick={() => deleteMenuItem(item.id)}>حذف</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 🔐 المصادقة والأمان

### 1. إعداد المصادقة

```javascript
// تسجيل الدخول
const { data, error } = await supabase.auth.signInWithPassword({
  email: "admin@example.com",
  password: "password123",
});

// تسجيل الخروج
await supabase.auth.signOut();

// التحقق من حالة المصادقة
const {
  data: { user },
} = await supabase.auth.getUser();
```

### 2. حماية العمليات الحساسة

```javascript
// فقط المستخدمين المصادق عليهم يمكنهم التعديل
const updateMenuItem = async (id, updates) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("يجب تسجيل الدخول أولاً");
  }

  const { data, error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", id)
    .select();

  return { data, error };
};
```

## 📊 استعلامات متقدمة

### 1. البحث والتصفية

```javascript
// البحث في الأسماء والأوصاف
const { data } = await supabase
  .from("menu_items")
  .select("*")
  .or("name.ilike.%قهوة%,description.ilike.%قهوة%")
  .eq("is_available", true);

// تصفية حسب السعر
const { data } = await supabase
  .from("menu_items")
  .select("*")
  .gte("price", 5)
  .lte("price", 15)
  .order("price");
```

### 2. إحصائيات

```javascript
// عدد العناصر في كل تصنيف
const { data } = await supabase
  .from("menu_items")
  .select("category")
  .eq("is_available", true);

const categoryCounts = data.reduce((acc, item) => {
  acc[item.category] = (acc[item.category] || 0) + 1;
  return acc;
}, {});

// متوسط الأسعار
const { data: prices } = await supabase
  .from("menu_items")
  .select("price")
  .not("price", "is", null);

const averagePrice =
  prices.reduce((sum, item) => sum + item.price, 0) / prices.length;
```

## 🚀 نشر البيانات الأولية

### 1. إدراج البيانات من ملف JSON

```javascript
// استيراد البيانات من ملف
import menuData from "./menuData.json";

const importMenuData = async () => {
  const items = [];

  Object.entries(menuData).forEach(([categoryKey, categoryData]) => {
    categoryData.items.forEach((item, index) => {
      items.push({
        name: item.name,
        category: categoryKey,
        price: item.price,
        prices: item.prices,
        options: item.options,
        description: item.description,
        is_available: true,
        sort_order: index,
      });
    });
  });

  const { data, error } = await supabase.from("menu_items").insert(items);

  if (error) {
    console.error("Error importing data:", error);
  } else {
    console.log("Data imported successfully:", data.length, "items");
  }
};
```

### 2. SQL Script للبيانات الأولية

```sql
-- إدراج البيانات مباشرة في قاعدة البيانات
INSERT INTO menu_items (name, category, price, options, is_available, sort_order) VALUES
('قهوة عربية سادة', 'hotDrinks', 8.00, '["سادة", "معدلة", "ناقصة"]', true, 1),
('قهوة عربية معدلة', 'hotDrinks', 8.00, '["سادة", "معدلة", "ناقصة"]', true, 2),
('كابتشينو', 'hotDrinks', 6.00, null, true, 3),
-- المزيد من البيانات...
```

## 🔧 استكشاف الأخطاء

### 1. أخطاء شائعة وحلولها

```javascript
// خطأ في الاتصال
if (error?.code === "PGRST301") {
  console.log("خطأ في الاتصال بقاعدة البيانات");
}

// خطأ في الصلاحيات
if (error?.code === "42501") {
  console.log("ليس لديك صلاحية للقيام بهذه العملية");
}

// خطأ في البيانات
if (error?.code === "23505") {
  console.log("العنصر موجود مسبقاً");
}
```

### 2. تسجيل الأخطاء

```javascript
const logError = (operation, error) => {
  console.error(`${operation} failed:`, {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  });
};

// استخدامها
const { data, error } = await supabase.from("menu_items").select("*");

if (error) {
  logError("fetchMenuItems", error);
}
```

## 📱 تطبيقات مختلفة

### 1. تطبيق Flutter

```dart
// pubspec.yaml
dependencies:
  supabase_flutter: ^2.0.0

// main.dart
import 'package:supabase_flutter/supabase_flutter.dart';

class MenuService {
  static Future<List<Map<String, dynamic>>> getMenuItems() async {
    final response = await Supabase.instance.client
        .from('menu_items')
        .select()
        .eq('is_available', true)
        .order('sort_order');

    return response;
  }
}
```

### 2. تطبيق React Native

```javascript
// App.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://your-project-id.supabase.co",
  "your-anon-key"
);

const fetchMenu = async () => {
  const { data, error } = await supabase
    .from("menu_items")
    .select("*")
    .eq("is_available", true);

  return data;
};
```

## 🎯 نصائح مهمة

1. **استخدم الفهارس** لتحسين الأداء
2. **فعّل RLS** لحماية البيانات
3. **استخدم Real-time** للتحديثات المباشرة
4. **اختبر الاستعلامات** قبل النشر
5. **احتفظ بنسخة احتياطية** من البيانات
6. **راقب الأداء** باستخدام لوحة تحكم Supabase

## 📞 الدعم والمساعدة

- [وثائق Supabase الرسمية](https://supabase.com/docs)
- [مجتمع Supabase](https://github.com/supabase/supabase/discussions)
- [أمثلة الكود](https://github.com/supabase/supabase/tree/master/examples)

---

**ملاحظة**: تأكد من استبدال `your-project-id` و `your-anon-key` بالقيم الفعلية من مشروع Supabase الخاص بك.
