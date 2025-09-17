import { menuData } from "@/data/menuData";
import { supabase } from "@/integrations/supabase/client";

// Convert menuData to database format
export const convertMenuDataToDB = () => {
  const menuItems: any[] = [];
  let sortOrder = 1;

  Object.entries(menuData).forEach(([categoryKey, categoryData]) => {
    // Add category header
    menuItems.push({
      name: categoryData.title,
      category: "category_header",
      price: 0,
      is_available: true,
      sort_order: sortOrder++,
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

  return menuItems;
};

// Import menu data to Supabase
export const importMenuDataToSupabase = async () => {
  try {
    const menuItems = convertMenuDataToDB();
    
    // Clear existing data (optional)
    await supabase.from("menu_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    // Insert new data
    const { data, error } = await supabase
      .from("menu_items")
      .insert(menuItems)
      .select();

    if (error) {
      console.error("Error importing menu data:", error);
      return { success: false, error };
    }

    console.log(`Successfully imported ${data.length} menu items`);
    return { success: true, data };
  } catch (error) {
    console.error("Error importing menu data:", error);
    return { success: false, error };
  }
};

// Function to run import (can be called from browser console)
export const runImport = async () => {
  const result = await importMenuDataToSupabase();
  if (result.success) {
    console.log("Import completed successfully!");
  } else {
    console.error("Import failed:", result.error);
  }
  return result;
};
