import { createClient } from "@supabase/supabase-js";
import { menuData } from "../data/menuData";

const supabaseUrl = "https://your-project.supabase.co";
const supabaseKey = "your-anon-key";

const supabase = createClient(supabaseUrl, supabaseKey);

interface MenuItem {
  name: string;
  price?: number;
  prices?: { L: number; M: number };
  options?: string[];
  description?: string;
}

interface MenuCategory {
  title: string;
  items: MenuItem[];
}

interface MenuData {
  [key: string]: MenuCategory;
}

async function importAllMenuData() {
  console.log("🚀 بدء استيراد جميع عناصر القائمة...");

  let totalImported = 0;
  let totalErrors = 0;

  try {
    // مسح البيانات الموجودة أولاً
    console.log("🧹 مسح البيانات الموجودة...");
    const { error: deleteError } = await supabase
      .from("menu_items" as any)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // حذف جميع البيانات

    if (deleteError) {
      console.warn(
        "⚠️ تحذير: لم يتم مسح البيانات الموجودة:",
        deleteError.message
      );
    } else {
      console.log("✅ تم مسح البيانات الموجودة بنجاح");
    }

    // استيراد كل تصنيف وعناصره
    for (const [categoryKey, categoryData] of Object.entries(menuData)) {
      console.log(`\n📁 معالجة التصنيف: ${categoryData.title}`);

      // إضافة رأس التصنيف
      const { error: headerError } = await supabase
        .from("menu_items" as any)
        .insert({
          name: categoryData.title,
          category: "category_header",
          price: 0,
          is_available: true,
          sort_order: Object.keys(menuData).indexOf(categoryKey) + 1,
        });

      if (headerError) {
        console.error(
          `❌ خطأ في إضافة رأس التصنيف ${categoryData.title}:`,
          headerError.message
        );
        totalErrors++;
      } else {
        console.log(`✅ تم إضافة رأس التصنيف: ${categoryData.title}`);
      }

      // إضافة عناصر التصنيف
      for (let i = 0; i < categoryData.items.length; i++) {
        const item = categoryData.items[i];

        const itemData = {
          name: item.name,
          category: categoryKey,
          price: item.price || null,
          prices: item.prices ? JSON.stringify(item.prices) : null,
          description: item.description || null,
          options: item.options ? JSON.stringify(item.options) : null,
          is_available: true,
          sort_order: i + 1,
        };

        const { error: itemError } = await supabase
          .from("menu_items" as any)
          .insert(itemData);

        if (itemError) {
          console.error(
            `❌ خطأ في إضافة العنصر ${item.name}:`,
            itemError.message
          );
          totalErrors++;
        } else {
          console.log(`✅ تم إضافة العنصر: ${item.name}`);
          totalImported++;
        }
      }
    }

    console.log("\n🎉 تم الانتهاء من الاستيراد!");
    console.log(`📊 الإحصائيات:`);
    console.log(`   ✅ تم استيراد: ${totalImported} عنصر`);
    console.log(`   ❌ أخطاء: ${totalErrors} خطأ`);
    console.log(`   📁 تصنيفات: ${Object.keys(menuData).length} تصنيف`);
  } catch (error) {
    console.error("💥 خطأ عام في الاستيراد:", error);
  }
}

// تشغيل الاستيراد
importAllMenuData();
