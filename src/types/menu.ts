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
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  title: string;
  items: MenuItem[];
}

export interface MenuData {
  [key: string]: MenuCategory;
}

export interface CreateMenuItemData {
  name: string;
  category: string;
  price?: number;
  prices?: { L: number; M: number };
  description?: string;
  options?: string[];
  image_url?: string;
  is_available?: boolean;
  sort_order?: number;
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {
  id: string;
}
