import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MenuItem, CreateMenuItemData, UpdateMenuItemData } from "@/types/menu";

// Get all menu items
export const useMenuItems = () => {
  return useQuery({
    queryKey: ["menu-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items" as any)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as MenuItem[];
    },
  });
};

// Get menu items by category
export const useMenuItemsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["menu-items", category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items" as any)
        .select("*")
        .eq("category", category)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as MenuItem[];
    },
    enabled: !!category,
  });
};

// Get available menu items only
export const useAvailableMenuItems = () => {
  return useQuery({
    queryKey: ["menu-items", "available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items" as any)
        .select("*")
        .eq("is_available", true)
        .neq("category", "category_header")
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      return data as MenuItem[];
    },
  });
};

// Get menu categories
export const useMenuCategories = () => {
  return useQuery({
    queryKey: ["menu-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("menu_items" as any)
        .select("category")
        .eq("category", "category_header")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data.map(item => item.category);
    },
  });
};

// Add new menu item
export const useAddMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (menuItemData: CreateMenuItemData) => {
      const { data, error } = await supabase
        .from("menu_items" as any)
        .insert([menuItemData])
        .select()
        .single();

      if (error) throw error;
      return data as MenuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      toast({
        title: "تم الإضافة بنجاح",
        description: "تم إضافة عنصر القائمة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الإضافة",
        description: "حدث خطأ في إضافة عنصر القائمة",
        variant: "destructive",
      });
      console.error(error);
    },
  });
};

// Update menu item
export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateMenuItemData) => {
      const { data, error } = await supabase
        .from("menu_items" as any)
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MenuItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث عنصر القائمة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ في تحديث عنصر القائمة",
        variant: "destructive",
      });
      console.error(error);
    },
  });
};

// Delete menu item
export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("menu_items" as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف عنصر القائمة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ في حذف عنصر القائمة",
        variant: "destructive",
      });
      console.error(error);
    },
  });
};

// Toggle menu item availability
export const useToggleMenuItemAvailability = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { data, error } = await supabase
        .from("menu_items" as any)
        .update({ is_available })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MenuItem;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      toast({
        title: "تم التحديث بنجاح",
        description: variables.is_available 
          ? "تم تفعيل عنصر القائمة" 
          : "تم إلغاء تفعيل عنصر القائمة",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في التحديث",
        description: "حدث خطأ في تحديث حالة العنصر",
        variant: "destructive",
      });
      console.error(error);
    },
  });
};

// Bulk import menu items
export const useBulkImportMenuItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (menuItems: CreateMenuItemData[]) => {
      const { data, error } = await supabase
        .from("menu_items" as any)
        .insert(menuItems)
        .select();

      if (error) throw error;
      return data as MenuItem[];
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["menu-items"] });
      queryClient.invalidateQueries({ queryKey: ["menu-categories"] });
      toast({
        title: "تم الاستيراد بنجاح",
        description: `تم استيراد ${variables.length} عنصر من القائمة`,
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ في استيراد عناصر القائمة",
        variant: "destructive",
      });
      console.error(error);
    },
  });
};
