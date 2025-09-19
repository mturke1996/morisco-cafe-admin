import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Settings,
  Menu,
  Coffee,
  Utensils,
  IceCream,
  Cake,
  Sandwich,
  Pizza,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
  Check,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Star,
  Clock,
  Users,
  BarChart3,
  Save,
  RefreshCw,
  Download,
  AlertCircle,
  CheckCircle,
  Zap,
  Crown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Heart,
  ShoppingCart,
  Power,
  PowerOff,
  Camera,
} from "lucide-react";
import {
  useMenuItems,
  useAddMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
  useToggleMenuItemAvailability,
} from "@/hooks/useMenu";
import { MenuItem, CreateMenuItemData } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";
import DailyOffersManagement from "./DailyOffersManagement";

const UltimateMenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showStats, setShowStats] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("hotDrinks");
  const [showCategoryTabs, setShowCategoryTabs] = useState(true);
  const [activeTab, setActiveTab] = useState("menu");
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryKey, setNewCategoryKey] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Form states for add item
  const [addFormData, setAddFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    priceM: "",
    priceL: "",
  });

  // Form states for edit item
  const [editFormData, setEditFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    priceM: "",
    priceL: "",
    imageUrl: "",
    isAvailable: false,
  });

  const { toast } = useToast();
  const { data: menuItems = [], isLoading, refetch } = useMenuItems();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const toggleAvailability = useToggleMenuItemAvailability();

  // Filter and sort items
  const filteredItems = menuItems
    .filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return (
        matchesSearch && matchesCategory && item.category !== "category_header"
      );
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          const priceA =
            a.price || (a.prices ? Math.max(a.prices.L, a.prices.M) : 0);
          const priceB =
            b.price || (b.prices ? Math.max(b.prices.L, b.prices.M) : 0);
          comparison = priceA - priceB;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Get unique categories in the correct order from menuData
  const categories = useMemo(() => {
    const categoryOrder = [
      "hotDrinks",
      "coldDrinks",
      "cocktails",
      "naturalJuices",
      "Froppy",
      "shakes",
      "Smoothie",
      "crepes",
      "croissants",
      "miniPancakes",
      "waffles",
      "kunafa",
      "cakes",
      "sweets",
      "Mohjito",
      "iceCream",
      "breakfast",
      "shakshuka",
      "toast",
      "sandwiches",
      "pizza",
      "pastries",
    ];

    const uniqueCategories = Array.from(
      new Set(
        menuItems
          .filter((item) => item.category !== "category_header")
          .map((item) => item.category)
      )
    );

    // Sort according to the original order
    return categoryOrder.filter((category) =>
      uniqueCategories.includes(category)
    );
  }, [menuItems]);

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      hotDrinks: Coffee,
      coldDrinks: Coffee,
      cocktails: Coffee,
      naturalJuices: Coffee,
      Froppy: Coffee,
      shakes: Coffee,
      Smoothie: Coffee,
      crepes: Cake,
      croissants: Cake,
      miniPancakes: Cake,
      waffles: Cake,
      kunafa: Cake,
      cakes: Cake,
      sweets: Cake,
      Mohjito: Coffee,
      iceCream: IceCream,
      breakfast: Utensils,
      shakshuka: Utensils,
      toast: Sandwich,
      sandwiches: Sandwich,
      pizza: Pizza,
      pastries: Cake,
    };
    return iconMap[category] || Menu;
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      hotDrinks: "bg-orange-100 text-orange-800 border-orange-200",
      coldDrinks: "bg-blue-100 text-blue-800 border-blue-200",
      cocktails: "bg-pink-100 text-pink-800 border-pink-200",
      naturalJuices: "bg-green-100 text-green-800 border-green-200",
      Froppy: "bg-purple-100 text-purple-800 border-purple-200",
      shakes: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Smoothie: "bg-indigo-100 text-indigo-800 border-indigo-200",
      crepes: "bg-rose-100 text-rose-800 border-rose-200",
      croissants: "bg-amber-100 text-amber-800 border-amber-200",
      miniPancakes: "bg-cyan-100 text-cyan-800 border-cyan-200",
      waffles: "bg-lime-100 text-lime-800 border-lime-200",
      kunafa: "bg-emerald-100 text-emerald-800 border-emerald-200",
      cakes: "bg-violet-100 text-violet-800 border-violet-200",
      sweets: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      Mohjito: "bg-teal-100 text-teal-800 border-teal-200",
      iceCream: "bg-sky-100 text-sky-800 border-sky-200",
      breakfast: "bg-orange-100 text-orange-800 border-orange-200",
      shakshuka: "bg-red-100 text-red-800 border-red-200",
      toast: "bg-yellow-100 text-yellow-800 border-yellow-200",
      sandwiches: "bg-green-100 text-green-800 border-green-200",
      pizza: "bg-red-100 text-red-800 border-red-200",
      pastries: "bg-amber-100 text-amber-800 border-amber-200",
    };
    return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get category name in Arabic
  const getCategoryName = (category: string) => {
    const nameMap: { [key: string]: string } = {
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
    return nameMap[category] || category;
  };

  // Calculate stats
  const stats = {
    totalItems: menuItems.filter((item) => item.category !== "category_header")
      .length,
    availableItems: menuItems.filter(
      (item) => item.is_available && item.category !== "category_header"
    ).length,
    unavailableItems: menuItems.filter(
      (item) => !item.is_available && item.category !== "category_header"
    ).length,
    totalCategories: categories.length,
  };

  const handleAddItem = useCallback(() => {
    if (!addFormData.name || !addFormData.category) {
      toast({
        title: "خطأ في البيانات",
        description: "اسم العنصر والتصنيف مطلوبان",
        variant: "destructive",
      });
      return;
    }

    const newItemData: CreateMenuItemData = {
      name: addFormData.name,
      category: addFormData.category,
      description: addFormData.description || undefined,
      is_available: true,
    };

    // Handle pricing - prioritize multiple prices over single price
    if (addFormData.priceM && addFormData.priceL) {
      newItemData.prices = {
        M: parseFloat(addFormData.priceM),
        L: parseFloat(addFormData.priceL),
      };
    } else if (addFormData.price) {
      newItemData.price = parseFloat(addFormData.price);
    }

    addMenuItem.mutate(newItemData, {
      onSuccess: () => {
        setIsAddModalOpen(false);
        // Reset form
        setAddFormData({
          name: "",
          category: "",
          description: "",
          price: "",
          priceM: "",
          priceL: "",
        });
        toast({
          title: "تم الإضافة بنجاح",
          description: "تم إضافة العنصر الجديد بنجاح",
        });
      },
    });
  }, [addFormData, addMenuItem, toast]);

  const handleUpdateItem = useCallback(() => {
    if (!selectedItem) return;

    if (!editFormData.name || !editFormData.category) {
      toast({
        title: "خطأ في البيانات",
        description: "اسم العنصر والتصنيف مطلوبان",
        variant: "destructive",
      });
      return;
    }

    const updateData: CreateMenuItemData = {
      name: editFormData.name,
      category: editFormData.category,
      description: editFormData.description || undefined,
      image_url: editFormData.imageUrl || undefined,
      is_available: editFormData.isAvailable,
    };

    // Handle pricing - prioritize multiple prices over single price
    if (editFormData.priceM && editFormData.priceL) {
      updateData.prices = {
        M: parseFloat(editFormData.priceM),
        L: parseFloat(editFormData.priceL),
      };
    } else if (editFormData.price) {
      updateData.price = parseFloat(editFormData.price);
    }

    updateMenuItem.mutate(
      { id: selectedItem.id, ...updateData },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
          toast({
            title: "تم التحديث بنجاح",
            description: "تم تحديث العنصر بنجاح",
          });
        },
      }
    );
  }, [selectedItem, editFormData, updateMenuItem, toast]);

  // Update edit form data when selected item changes
  useEffect(() => {
    if (selectedItem) {
      setEditFormData({
        name: selectedItem.name || "",
        category: selectedItem.category || "",
        description: selectedItem.description || "",
        price: selectedItem.price?.toString() || "",
        priceM: selectedItem.prices?.M?.toString() || "",
        priceL: selectedItem.prices?.L?.toString() || "",
        imageUrl: selectedItem.image_url || "",
        isAvailable: selectedItem.is_available || false,
      });
    }
  }, [selectedItem]);

  const handleDeleteItem = useCallback((id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!itemToDelete) return;

    deleteMenuItem.mutate(itemToDelete, {
      onSuccess: () => {
        toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف العنصر بنجاح",
        });
        setDeleteConfirmOpen(false);
        setItemToDelete(null);
      },
    });
  }, [itemToDelete, deleteMenuItem, toast]);

  const handleToggleAvailability = useCallback(
    (item: MenuItem) => {
      toggleAvailability.mutate(
        {
          id: item.id,
          is_available: !item.is_available,
        },
        {
          onSuccess: () => {
            toast({
              title: item.is_available ? "تم إلغاء التوفر" : "تم تفعيل التوفر",
              description: `العنصر ${item.name} ${
                item.is_available ? "غير متوفر" : "متوفر"
              } الآن`,
            });
          },
        }
      );
    },
    [toggleAvailability, toast]
  );

  const handleAddCategory = useCallback(() => {
    if (!newCategoryName || !newCategoryKey) {
      toast({
        title: "خطأ في البيانات",
        description: "اسم التصنيف والمفتاح مطلوبان",
        variant: "destructive",
      });
      return;
    }

    // Add category to the list (this would typically be saved to database)
    const newCategory = {
      key: newCategoryKey,
      name: newCategoryName,
      icon: "Menu",
      color: "bg-gray-100 text-gray-800 border-gray-200",
    };

    // Reset form
    setNewCategoryName("");
    setNewCategoryKey("");
    setIsAddCategoryModalOpen(false);

    toast({
      title: "تم إضافة التصنيف",
      description: `تم إضافة تصنيف "${newCategoryName}" بنجاح`,
    });
  }, [newCategoryName, newCategoryKey, toast]);

  const handleQuickImport = async () => {
    setIsImporting(true);
    try {
      const { quickImportAllMenuData } = await import(
        "@/scripts/quickImportMenu"
      );
      const result = await quickImportAllMenuData();

      if (result.success) {
        toast({
          title: "تم الاستيراد بنجاح!",
          description: `تم استيراد ${result.totalItems} عنصر من ${result.categories} تصنيف`,
        });
        refetch();
      } else {
        toast({
          title: "فشل الاستيراد",
          description: result.error || "حدث خطأ أثناء الاستيراد",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      setIsImportModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل القائمة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 arabic-text">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="menu" className="flex items-center gap-2">
            <Menu className="w-4 h-4" />
            إدارة القائمة
          </TabsTrigger>
          <TabsTrigger value="offers" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            عروض اليوم
          </TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                إدارة القائمة
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                إدارة شاملة لعناصر القائمة
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">الإحصائيات</span>
                <span className="sm:hidden">إحصائيات</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 text-xs sm:text-sm"
                disabled={isImporting}
              >
                {isImporting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isImporting ? "جاري الاستيراد..." : "استيراد سريع"}
                </span>
                <span className="sm:hidden">
                  {isImporting ? "جاري..." : "استيراد"}
                </span>
              </Button>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">إضافة عنصر</span>
                <span className="sm:hidden">إضافة</span>
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {showStats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 border-blue-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-blue-600">
                        إجمالي العناصر
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-900">
                        {stats.totalItems}
                      </p>
                    </div>
                    <Menu className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-200 border-green-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-green-600">
                        متوفر
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-900">
                        {stats.availableItems}
                      </p>
                    </div>
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 via-red-100 to-red-200 border-red-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-red-600">
                        غير متوفر
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-900">
                        {stats.unavailableItems}
                      </p>
                    </div>
                    <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200 border-purple-300 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-purple-600">
                        التصنيفات
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-900">
                        {stats.totalCategories}
                      </p>
                    </div>
                    <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium">
                    البحث في القائمة
                  </Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="ابحث عن عنصر في القائمة..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10 text-sm h-10"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <div className="sm:w-40">
                    <Label htmlFor="category" className="text-sm font-medium">
                      التصنيف
                    </Label>
                    <Select
                      value={selectedCategory}
                      onValueChange={setSelectedCategory}
                    >
                      <SelectTrigger className="text-sm h-10">
                        <SelectValue placeholder="اختر التصنيف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع التصنيفات</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {getCategoryName(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="sm:w-32">
                    <Label htmlFor="sort" className="text-sm font-medium">
                      الترتيب
                    </Label>
                    <Select
                      value={sortBy}
                      onValueChange={(value: any) => setSortBy(value)}
                    >
                      <SelectTrigger className="text-sm h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">الاسم</SelectItem>
                        <SelectItem value="price">السعر</SelectItem>
                        <SelectItem value="category">التصنيف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                      }
                      className="px-2 sm:px-3 h-10"
                    >
                      {sortOrder === "asc" ? (
                        <SortAsc className="w-4 h-4" />
                      ) : (
                        <SortDesc className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setViewMode(viewMode === "grid" ? "list" : "grid")
                      }
                      className="px-2 sm:px-3 h-10"
                    >
                      {viewMode === "grid" ? (
                        <List className="w-4 h-4" />
                      ) : (
                        <Grid className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Categories Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  التصنيفات المتاحة
                </div>
                <Button
                  onClick={() => setIsAddCategoryModalOpen(true)}
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  إضافة تصنيف
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {/* All Categories Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                      selectedCategory === "all"
                        ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground ring-2 ring-offset-2 ring-primary shadow-lg"
                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 border-gray-200 hover:from-gray-200 hover:to-gray-300"
                    }`}
                    onClick={() => setSelectedCategory("all")}
                  >
                    <CardContent className="p-2 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="p-2 rounded-full bg-primary text-primary-foreground">
                          <Menu className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-xs leading-tight">
                            جميع التصنيفات
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {
                              menuItems.filter(
                                (item) => item.category !== "category_header"
                              ).length
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {categories.map((category) => {
                  const IconComponent = getCategoryIcon(category);
                  const categoryColor = getCategoryColor(category);
                  const categoryItems = menuItems.filter(
                    (item) => item.category === category
                  );
                  const isSelected = selectedCategory === category;

                  return (
                    <motion.div
                      key={category}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                          isSelected
                            ? `${categoryColor} ring-2 ring-offset-2 ring-primary shadow-lg`
                            : `${categoryColor} hover:shadow-md`
                        }`}
                        onClick={() => setSelectedCategory(category)}
                      >
                        <CardContent className="p-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <div
                              className={`p-2 rounded-full ${categoryColor}`}
                            >
                              <IconComponent className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="font-medium text-xs leading-tight">
                                {getCategoryName(category)}
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                {categoryItems.length}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredItems.map((item, index) => {
                const IconComponent = getCategoryIcon(item.category);
                const categoryColor = getCategoryColor(item.category);

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full hover:shadow-xl hover:scale-105 transition-all duration-300 border-0 shadow-sm bg-gradient-to-br from-white to-gray-50">
                      <CardContent className="p-3 sm:p-4 h-full flex flex-col relative">
                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2 flex items-center gap-1 sm:gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleAvailability(item)}
                            className={`h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation ${
                              item.is_available
                                ? "bg-green-500 hover:bg-green-600 text-white active:bg-green-700"
                                : "bg-red-500 hover:bg-red-600 text-white active:bg-red-700"
                            }`}
                            title={
                              item.is_available
                                ? "إلغاء التوفر"
                                : "تفعيل التوفر"
                            }
                          >
                            {item.is_available ? (
                              <Power className="w-6 h-6 sm:w-5 sm:h-5" />
                            ) : (
                              <PowerOff className="w-6 h-6 sm:w-5 sm:h-5" />
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsEditModalOpen(true);
                            }}
                            className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:bg-blue-700"
                            title="تعديل العنصر"
                          >
                            <Edit className="w-6 h-6 sm:w-5 sm:h-5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:bg-red-700"
                            title="حذف العنصر"
                          >
                            <Trash2 className="w-6 h-6 sm:w-5 sm:h-5" />
                          </Button>
                        </div>

                        <div className="flex-1 pr-16 sm:pr-20">
                          {/* Category Badge */}
                          <div className="flex items-center gap-2 mb-2 sm:mb-3">
                            <div
                              className={`p-1.5 sm:p-2 rounded-lg ${categoryColor} shadow-sm`}
                            >
                              <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getCategoryName(item.category)}
                            </Badge>
                          </div>

                          <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 mb-2 leading-tight">
                            {item.name}
                          </h3>

                          {item.description && (
                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                              {item.description}
                            </p>
                          )}

                          {/* Options */}
                          {item.options && item.options.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-4">
                              {item.options
                                .slice(0, 2)
                                .map((option, optionIndex) => (
                                  <Badge
                                    key={optionIndex}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {option}
                                  </Badge>
                                ))}
                              {item.options.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{item.options.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-auto">
                          {/* Pricing */}
                          {item.prices ? (
                            <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                              <div className="flex justify-between items-center p-1.5 sm:p-2 bg-gray-50 rounded-lg">
                                <Badge variant="secondary" className="text-xs">
                                  وسط
                                </Badge>
                                <span className="font-bold text-gray-900 text-sm">
                                  {item.prices.M} د.ل
                                </span>
                              </div>
                              <div className="flex justify-between items-center p-1.5 sm:p-2 bg-yellow-50 rounded-lg">
                                <Badge className="bg-yellow-500 text-white text-xs">
                                  كبير
                                </Badge>
                                <span className="font-bold text-gray-900 text-sm">
                                  {item.prices.L} د.ل
                                </span>
                              </div>
                              <div className="flex justify-center">
                                <Badge
                                  variant={
                                    item.is_available ? "default" : "secondary"
                                  }
                                  className={`text-xs ${
                                    item.is_available
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {item.is_available ? "متوفر" : "غير متوفر"}
                                </Badge>
                              </div>
                            </div>
                          ) : item.price ? (
                            <div className="flex justify-between items-center mb-2 sm:mb-3">
                              <div className="text-base sm:text-lg lg:text-xl font-bold text-emerald-600">
                                {item.price} د.ل
                              </div>
                              <Badge
                                variant={
                                  item.is_available ? "default" : "secondary"
                                }
                                className={`text-xs ${
                                  item.is_available
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.is_available ? "متوفر" : "غير متوفر"}
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex justify-center mb-2 sm:mb-3">
                              <Badge
                                variant={
                                  item.is_available ? "default" : "secondary"
                                }
                                className={`text-xs ${
                                  item.is_available
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {item.is_available ? "متوفر" : "غير متوفر"}
                              </Badge>
                            </div>
                          )}

                          {/* Image */}
                          {item.image_url && (
                            <div className="mb-2 sm:mb-3">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-16 sm:h-20 lg:h-24 object-cover rounded-md"
                              />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const IconComponent = getCategoryIcon(item.category);
                const categoryColor = getCategoryColor(item.category);

                return (
                  <Card
                    key={item.id}
                    className="hover:shadow-xl hover:scale-102 transition-all duration-300 bg-gradient-to-br from-white to-gray-50"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className={`p-2 sm:p-3 rounded-lg ${categoryColor} flex-shrink-0`}
                          >
                            <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm sm:text-base truncate">
                              {item.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {getCategoryName(item.category)}
                            </p>
                            {item.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="text-right">
                            {item.prices ? (
                              <div className="text-xs sm:text-sm space-y-1">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Badge className="bg-yellow-500 text-white text-xs">
                                    كبير
                                  </Badge>
                                  <span className="font-bold text-green-600">
                                    {item.prices.L} د.ل
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    وسط
                                  </Badge>
                                  <span className="font-bold text-blue-600">
                                    {item.prices.M} د.ل
                                  </span>
                                </div>
                              </div>
                            ) : item.price ? (
                              <span className="font-bold text-sm sm:text-lg text-green-600">
                                {item.price} د.ل
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm text-gray-500">
                                بدون سعر
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <Badge
                              variant={
                                item.is_available ? "default" : "secondary"
                              }
                              className={`text-xs ${
                                item.is_available
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.is_available ? "متوفر" : "غير متوفر"}
                            </Badge>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleAvailability(item)}
                              className={`h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation ${
                                item.is_available
                                  ? "bg-green-500 hover:bg-green-600 text-white active:bg-green-700"
                                  : "bg-red-500 hover:bg-red-600 text-white active:bg-red-700"
                              }`}
                              title={
                                item.is_available
                                  ? "إلغاء التوفر"
                                  : "تفعيل التوفر"
                              }
                            >
                              {item.is_available ? (
                                <Power className="w-6 h-6 sm:w-5 sm:h-5" />
                              ) : (
                                <PowerOff className="w-6 h-6 sm:w-5 sm:h-5" />
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item);
                                setIsEditModalOpen(true);
                              }}
                              className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:bg-blue-700"
                              title="تعديل العنصر"
                            >
                              <Edit className="w-6 h-6 sm:w-5 sm:h-5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                              className="h-12 w-12 sm:h-10 sm:w-10 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:bg-red-700"
                              title="حذف العنصر"
                            >
                              <Trash2 className="w-6 h-6 sm:w-5 sm:h-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="text-center py-16">
                <Menu className="w-20 h-20 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-3">
                  لا توجد عناصر
                </h3>
                <p className="text-muted-foreground mb-8">
                  {searchTerm || selectedCategory !== "all"
                    ? "لم يتم العثور على عناصر مطابقة للبحث"
                    : "ابدأ بإضافة عناصر جديدة للقائمة"}
                </p>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أول عنصر
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <DailyOffersManagement />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>إضافة عنصر جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">اسم العنصر *</Label>
                <Input
                  id="name"
                  placeholder="اسم العنصر"
                  value={addFormData.name}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="category">التصنيف *</Label>
                <Select
                  value={addFormData.category}
                  onValueChange={(value) =>
                    setAddFormData({ ...addFormData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryName(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="price">السعر الثابت (د.ل)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={addFormData.price}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, price: e.target.value })
                  }
                />
              </div>

              {/* Multiple Prices */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  أسعار متعددة (اختياري)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price-m" className="text-sm">
                      السعر المتوسط (د.ل)
                    </Label>
                    <Input
                      id="price-m"
                      type="number"
                      placeholder="0.00"
                      value={addFormData.priceM}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          priceM: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-l" className="text-sm">
                      السعر الكبير (د.ل)
                    </Label>
                    <Input
                      id="price-l"
                      type="number"
                      placeholder="0.00"
                      value={addFormData.priceL}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          priceL: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  ملاحظة: إذا تم ملء هذين الحقلين، سيتم استخدامهما بدلاً من
                  السعر الثابت
                </p>
              </div>
            </div>
            <div>
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                placeholder="وصف العنصر"
                value={addFormData.description}
                onChange={(e) =>
                  setAddFormData({
                    ...addFormData,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleAddItem}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:scale-95"
                disabled={addMenuItem.isPending}
              >
                {addMenuItem.isPending ? (
                  <RefreshCw className="w-4 h-4 ml-1 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 ml-1" />
                )}
                {addMenuItem.isPending ? "جاري الإضافة..." : "إضافة"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="touch-manipulation active:scale-95"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              تعديل العنصر - {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                المعلومات الأساسية
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">اسم العنصر *</Label>
                  <Input
                    id="edit-name"
                    placeholder="اسم العنصر"
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">التصنيف *</Label>
                  <Select
                    value={editFormData.category}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التصنيف" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {getCategoryName(category)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">الوصف</Label>
                <Textarea
                  id="edit-description"
                  placeholder="وصف العنصر"
                  value={editFormData.description}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      description: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                التسعير
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">السعر الثابت (د.ل)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    placeholder="0.00"
                    value={editFormData.price}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="edit-image">رابط الصورة</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-image"
                      placeholder="https://example.com/image.jpg"
                      value={editFormData.imageUrl}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          imageUrl: e.target.value,
                        })
                      }
                    />
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Multiple Prices */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  أسعار متعددة (اختياري)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price-m" className="text-sm">
                      السعر المتوسط (د.ل)
                    </Label>
                    <Input
                      id="edit-price-m"
                      type="number"
                      placeholder="0.00"
                      value={editFormData.priceM}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          priceM: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-price-l" className="text-sm">
                      السعر الكبير (د.ل)
                    </Label>
                    <Input
                      id="edit-price-l"
                      type="number"
                      placeholder="0.00"
                      value={editFormData.priceL}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          priceL: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  ملاحظة: إذا تم ملء هذين الحقلين، سيتم استخدامهما بدلاً من
                  السعر الثابت
                </p>
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                التوفر والإعدادات
              </h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-available"
                  checked={editFormData.isAvailable}
                  onCheckedChange={(checked) =>
                    setEditFormData({ ...editFormData, isAvailable: checked })
                  }
                />
                <Label htmlFor="edit-available">متوفر للطلب</Label>
              </div>
            </div>

            {/* Image Preview */}
            {selectedItem?.image_url && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  معاينة الصورة
                </h3>
                <div className="flex justify-center">
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleUpdateItem}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation active:scale-95"
                disabled={updateMenuItem.isPending}
              >
                {updateMenuItem.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {updateMenuItem.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              استيراد سريع للقائمة
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              سيتم استيراد جميع عناصر القائمة من البيانات المحددة مسبقاً
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">تنبيه</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                سيتم حذف جميع البيانات الموجودة واستبدالها بالبيانات الجديدة
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleQuickImport}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                disabled={isImporting}
              >
                {isImporting ? (
                  <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 ml-2" />
                )}
                {isImporting ? "جاري الاستيراد..." : "استيراد الآن"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsImportModalOpen(false)}
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Category Modal */}
      <Dialog
        open={isAddCategoryModalOpen}
        onOpenChange={setIsAddCategoryModalOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              إضافة تصنيف جديد
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="category-name">اسم التصنيف *</Label>
              <Input
                id="category-name"
                placeholder="مثال: مشروبات ساخنة"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="category-key">مفتاح التصنيف *</Label>
              <Input
                id="category-key"
                placeholder="مثال: hotDrinks"
                value={newCategoryKey}
                onChange={(e) => setNewCategoryKey(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                يجب أن يكون المفتاح باللغة الإنجليزية وبدون مسافات
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsAddCategoryModalOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleAddCategory}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                إضافة التصنيف
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              تأكيد الحذف
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              هل أنت متأكد من أنك تريد حذف هذا العنصر؟ لا يمكن التراجع عن هذا
              الإجراء.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="touch-manipulation active:scale-95"
              >
                إلغاء
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white touch-manipulation active:scale-95"
                disabled={deleteMenuItem.isPending}
              >
                {deleteMenuItem.isPending ? (
                  <RefreshCw className="w-4 h-4 ml-1 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 ml-1" />
                )}
                {deleteMenuItem.isPending ? "جاري الحذف..." : "حذف"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UltimateMenuManagement;
