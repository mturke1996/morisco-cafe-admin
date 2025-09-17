import { supabase } from "@/integrations/supabase/client";
import { menuData } from "../data/menuData";

// Quick import function for all menu data
export const quickImportAllMenuData = async () => {
  try {
    console.log("🚀 بدء استيراد سريع لجميع عناصر القائمة...");

    // Convert to database format
    const menuItems: any[] = [];
    let sortOrder = 1;

    // Category mapping
    const categoryMapping: {
      [key: string]: { title: string; sortOrder: number };
    } = {
      hotDrinks: { title: "مشروبات ساخنة", sortOrder: 1 },
      coldDrinks: { title: "مشروبات باردة", sortOrder: 2 },
      cocktails: { title: "كوكتيلات", sortOrder: 3 },
      naturalJuices: { title: "عصائر طبيعية", sortOrder: 4 },
      Froppy: { title: "فروبي", sortOrder: 5 },
      shakes: { title: "ميلك شيك", sortOrder: 6 },
      Smoothie: { title: "سموذي", sortOrder: 7 },
      crepes: { title: "كريب", sortOrder: 8 },
      croissants: { title: "كرواسون", sortOrder: 9 },
      miniPancakes: { title: "ميني بان كيك", sortOrder: 10 },
      waffles: { title: "وافل", sortOrder: 11 },
      kunafa: { title: "كنافة", sortOrder: 12 },
      cakes: { title: "كيكات", sortOrder: 13 },
      sweets: { title: "حلويات وبقلاوة", sortOrder: 14 },
      Mohjito: { title: "موهيتو", sortOrder: 15 },
      iceCream: { title: "آيس كريم", sortOrder: 16 },
      breakfast: { title: "إفطار", sortOrder: 17 },
      shakshuka: { title: "شكشوكة تركية", sortOrder: 18 },
      toast: { title: "توست", sortOrder: 19 },
      sandwiches: { title: "سندويشات", sortOrder: 20 },
      pizza: { title: "بيتزا", sortOrder: 21 },
      pastries: { title: "معجنات", sortOrder: 22 },
    };

    Object.entries(menuData).forEach(([categoryKey, categoryData]) => {
      const categoryInfo = categoryMapping[categoryKey];

      // Add category header
      menuItems.push({
        name: categoryInfo.title,
        category: "category_header",
        price: 0,
        is_available: true,
        sort_order: categoryInfo.sortOrder,
        description: null,
        options: null,
        image_url: null,
      });

      // Add category items
      categoryData.items.forEach((item, index) => {
        const menuItem: any = {
          name: item.name,
          category: categoryKey,
          description: item.description || null,
          options: item.options || null,
          is_available: true,
          sort_order: index + 1,
          image_url: null,
        };

        // Handle pricing
        if (item.prices) {
          menuItem.prices = item.prices;
        } else if (item.price) {
          menuItem.price = item.price;
        }

        menuItems.push(menuItem);
      });
    });

    console.log(`📊 تم تحضير ${menuItems.length} عنصر للاستيراد`);

    // Clear existing data
    console.log("🗑️ حذف البيانات الموجودة...");
    await supabase
      .from("menu_items" as any)
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Insert new data in batches
    const batchSize = 50;
    const batches = [];

    for (let i = 0; i < menuItems.length; i += batchSize) {
      batches.push(menuItems.slice(i, i + batchSize));
    }

    console.log(`📦 تم تقسيم البيانات إلى ${batches.length} دفعة`);

    let totalInserted = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(
        `📤 استيراد الدفعة ${i + 1}/${batches.length} (${batch.length} عنصر)...`
      );

      const { data, error } = await supabase
        .from("menu_items" as any)
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ خطأ في الدفعة ${i + 1}:`, error);
        throw error;
      }

      totalInserted += data.length;
      console.log(`✅ تم استيراد ${data.length} عنصر بنجاح`);
    }

    console.log(
      `🎉 تم استيراد جميع البيانات بنجاح! إجمالي العناصر: ${totalInserted}`
    );

    return {
      success: true,
      totalItems: totalInserted,
      categories: Object.keys(menuData).length,
    };
  } catch (error) {
    console.error("❌ خطأ في استيراد البيانات:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Export for easy access
(window as any).quickImportAllMenuData = quickImportAllMenuData;
