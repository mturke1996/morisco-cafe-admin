import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  BarChart3
} from "lucide-react";
import { useMenuItems, useAddMenuItem, useUpdateMenuItem, useDeleteMenuItem, useToggleMenuItemAvailability, useBulkImportMenuItems } from "@/hooks/useMenu";
import { MenuItem, CreateMenuItemData } from "@/types/menu";
import { useToast } from "@/hooks/use-toast";

const EnhancedMenuManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "price" | "category">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showStats, setShowStats] = useState(false);
  
  const { toast } = useToast();
  const { data: menuItems = [], isLoading } = useMenuItems();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();
  const toggleAvailability = useToggleMenuItemAvailability();
  const bulkImport = useBulkImportMenuItems();

  // Filter and sort items
  const filteredItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory && item.category !== "category_header";
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "price":
          const priceA = a.price || (a.prices ? Math.max(a.prices.L, a.prices.M) : 0);
          const priceB = b.price || (b.prices ? Math.max(b.prices.L, b.prices.M) : 0);
          comparison = priceA - priceB;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Get unique categories
  const categories = Array.from(new Set(menuItems
    .filter(item => item.category !== "category_header")
    .map(item => item.category)
  ));

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: any } = {
      "hotDrinks": Coffee,
      "coldDrinks": Coffee,
      "cocktails": Coffee,
      "naturalJuices": Coffee,
      "Froppy": Coffee,
      "shakes": Coffee,
      "Smoothie": Coffee,
      "crepes": Cake,
      "croissants": Cake,
      "miniPancakes": Cake,
      "waffles": Cake,
      "kunafa": Cake,
      "cakes": Cake,
      "sweets": Cake,
      "Mohjito": Coffee,
      "iceCream": IceCream,
      "breakfast": Utensils,
      "shakshuka": Utensils,
      "toast": Sandwich,
      "sandwiches": Sandwich,
      "pizza": Pizza,
      "pastries": Cake,
    };
    return iconMap[category] || Menu;
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      "hotDrinks": "bg-orange-100 text-orange-800 border-orange-200",
      "coldDrinks": "bg-blue-100 text-blue-800 border-blue-200",
      "cocktails": "bg-pink-100 text-pink-800 border-pink-200",
      "naturalJuices": "bg-green-100 text-green-800 border-green-200",
      "Froppy": "bg-purple-100 text-purple-800 border-purple-200",
      "shakes": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Smoothie": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "crepes": "bg-rose-100 text-rose-800 border-rose-200",
      "croissants": "bg-amber-100 text-amber-800 border-amber-200",
      "miniPancakes": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "waffles": "bg-lime-100 text-lime-800 border-lime-200",
      "kunafa": "bg-emerald-100 text-emerald-800 border-emerald-200",
      "cakes": "bg-violet-100 text-violet-800 border-violet-200",
      "sweets": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
      "Mohjito": "bg-teal-100 text-teal-800 border-teal-200",
      "iceCream": "bg-sky-100 text-sky-800 border-sky-200",
      "breakfast": "bg-orange-100 text-orange-800 border-orange-200",
      "shakshuka": "bg-red-100 text-red-800 border-red-200",
      "toast": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "sandwiches": "bg-green-100 text-green-800 border-green-200",
      "pizza": "bg-red-100 text-red-800 border-red-200",
      "pastries": "bg-amber-100 text-amber-800 border-amber-200",
    };
    return colorMap[category] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Calculate stats
  const stats = {
    totalItems: menuItems.filter(item => item.category !== "category_header").length,
    availableItems: menuItems.filter(item => item.is_available && item.category !== "category_header").length,
    unavailableItems: menuItems.filter(item => !item.is_available && item.category !== "category_header").length,
    totalCategories: categories.length,
  };

  const handleAddItem = (data: CreateMenuItemData) => {
    addMenuItem.mutate(data, {
      onSuccess: () => {
        setIsAddModalOpen(false);
      },
    });
  };

  const handleUpdateItem = (data: CreateMenuItemData) => {
    if (!selectedItem) return;
    
    updateMenuItem.mutate({ id: selectedItem.id, ...data }, {
      onSuccess: () => {
        setIsEditModalOpen(false);
        setSelectedItem(null);
      },
    });
  };

  const handleDeleteItem = (id: string) => {
    deleteMenuItem.mutate(id);
  };

  const handleToggleAvailability = (item: MenuItem) => {
    toggleAvailability.mutate({ 
      id: item.id, 
      is_available: !item.is_available 
    });
  };

  const handleBulkImport = async () => {
    try {
      // Import the function dynamically
      const { runFullImport } = await import("@/scripts/importAllMenuData");
      await runFullImport();
      setIsImportModalOpen(false);
    } catch (error) {
      toast({
        title: "خطأ في الاستيراد",
        description: "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
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
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">إدارة القائمة</h1>
          <p className="text-muted-foreground mt-1">إدارة شاملة لعناصر القائمة والمشروبات</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            الإحصائيات
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            استيراد
          </Button>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة عنصر
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-600">إجمالي العناصر</p>
                  <p className="text-lg sm:text-xl font-bold text-blue-900">{stats.totalItems}</p>
                </div>
                <Menu className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-green-600">متوفر</p>
                  <p className="text-lg sm:text-xl font-bold text-green-900">{stats.availableItems}</p>
                </div>
                <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-red-600">غير متوفر</p>
                  <p className="text-lg sm:text-xl font-bold text-red-900">{stats.unavailableItems}</p>
                </div>
                <X className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-purple-600">التصنيفات</p>
                  <p className="text-lg sm:text-xl font-bold text-purple-900">{stats.totalCategories}</p>
                </div>
                <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs sm:text-sm">البحث في القائمة</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="ابحث عن عنصر في القائمة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 text-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="sm:w-32">
                <Label htmlFor="category" className="text-xs sm:text-sm">التصنيف</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="text-sm">
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:w-32">
                <Label htmlFor="sort" className="text-xs sm:text-sm">الترتيب</Label>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="text-sm">
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
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="px-2"
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="px-2"
                >
                  {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Items */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredItems.map((item) => {
            const IconComponent = getCategoryIcon(item.category);
            const categoryColor = getCategoryColor(item.category);
            
            return (
              <Card key={item.id} className="relative hover:shadow-md transition-all duration-200 group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${categoryColor}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleAvailability(item)}
                        className="h-7 w-7 p-0"
                      >
                        {item.is_available ? (
                          <Eye className="w-3 h-3 text-green-600" />
                        ) : (
                          <EyeOff className="w-3 h-3 text-red-600" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedItem(item);
                          setIsEditModalOpen(true);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.name}</h3>
                  {item.description && (
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    {item.prices ? (
                      <div className="flex gap-2 text-xs">
                        <span className="font-medium">L: {item.prices.L} د.ل</span>
                        <span className="font-medium">M: {item.prices.M} د.ل</span>
                      </div>
                    ) : item.price ? (
                      <span className="font-medium text-sm">{item.price} د.ل</span>
                    ) : null}
                    {item.options && item.options.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.options.slice(0, 2).map((option, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
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
                  {item.image_url && (
                    <div className="mt-3">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-20 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <Badge 
                      variant={item.is_available ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {item.is_available ? "متوفر" : "غير متوفر"}
                    </Badge>
                    {item.image_url && (
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const IconComponent = getCategoryIcon(item.category);
            const categoryColor = getCategoryColor(item.category);
            
            return (
              <Card key={item.id} className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${categoryColor} flex-shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{item.category}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="text-right">
                        {item.prices ? (
                          <div className="text-xs">
                            <div>L: {item.prices.L} د.ل</div>
                            <div>M: {item.prices.M} د.ل</div>
                          </div>
                        ) : item.price ? (
                          <span className="font-medium text-sm">{item.price} د.ل</span>
                        ) : null}
                      </div>
                      
                      <Badge 
                        variant={item.is_available ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {item.is_available ? "متوفر" : "غير متوفر"}
                      </Badge>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAvailability(item)}
                          className="h-7 w-7 p-0"
                        >
                          {item.is_available ? (
                            <Eye className="w-3 h-3 text-green-600" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-red-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsEditModalOpen(true);
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
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
          <CardContent className="text-center py-12">
            <Menu className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              لا توجد عناصر
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedCategory !== "all"
                ? "لم يتم العثور على عناصر مطابقة للبحث"
                : "ابدأ بإضافة عناصر جديدة للقائمة"}
            </p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة أول عنصر
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      <MenuItemModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSubmit={handleAddItem}
        categories={categories}
        title="إضافة عنصر جديد"
      />

      <MenuItemModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleUpdateItem}
        categories={categories}
        title="تعديل العنصر"
        initialData={selectedItem}
      />

      {/* Import Modal */}
      <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>استيراد عناصر القائمة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              سيتم استيراد جميع عناصر القائمة من ملف البيانات الموجود
            </p>
            <div className="flex gap-2">
              <Button onClick={handleBulkImport} className="flex-1">
                <Upload className="w-4 h-4 ml-2" />
                استيراد الآن
              </Button>
              <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Menu Item Modal Component
interface MenuItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateMenuItemData) => void;
  categories: string[];
  title: string;
  initialData?: MenuItem | null;
}

const MenuItemModal = ({ 
  open, 
  onOpenChange, 
  onSubmit, 
  categories, 
  title, 
  initialData 
}: MenuItemModalProps) => {
  const [formData, setFormData] = useState<CreateMenuItemData>({
    name: "",
    category: "",
    price: undefined,
    prices: undefined,
    description: "",
    options: [],
    image_url: "",
    is_available: true,
    sort_order: 0,
  });

  const [newOption, setNewOption] = useState("");
  const [priceType, setPriceType] = useState<"single" | "multiple">("single");

  // Initialize form data when modal opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        category: initialData.category,
        price: initialData.price,
        prices: initialData.prices,
        description: initialData.description || "",
        options: initialData.options || [],
        image_url: initialData.image_url || "",
        is_available: initialData.is_available,
        sort_order: initialData.sort_order,
      });
      setPriceType(initialData.prices ? "multiple" : "single");
    } else {
      setFormData({
        name: "",
        category: "",
        price: undefined,
        prices: undefined,
        description: "",
        options: [],
        image_url: "",
        is_available: true,
        sort_order: 0,
      });
      setPriceType("single");
    }
  }, [initialData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = { ...formData };
    if (priceType === "single") {
      delete submitData.prices;
    } else {
      delete submitData.price;
    }
    
    onSubmit(submitData);
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...(prev.options || []), newOption.trim()]
      }));
      setNewOption("");
    }
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">اسم العنصر *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="text-sm"
              />
            </div>
            
            <div>
              <Label htmlFor="category">التصنيف *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>نوع السعر</Label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="single"
                  checked={priceType === "single"}
                  onChange={(e) => setPriceType(e.target.value as "single" | "multiple")}
                />
                <span className="text-sm">سعر واحد</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  value="multiple"
                  checked={priceType === "multiple"}
                  onChange={(e) => setPriceType(e.target.value as "single" | "multiple")}
                />
                <span className="text-sm">أسعار متعددة (L/M)</span>
              </label>
            </div>
          </div>

          {priceType === "single" ? (
            <div>
              <Label htmlFor="price">السعر (د.ل)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price || ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  price: e.target.value ? parseFloat(e.target.value) : undefined 
                }))}
                className="text-sm"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priceL">السعر الكبير (L)</Label>
                <Input
                  id="priceL"
                  type="number"
                  step="0.01"
                  value={formData.prices?.L || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prices: { 
                      ...prev.prices, 
                      L: e.target.value ? parseFloat(e.target.value) : 0 
                    } 
                  }))}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="priceM">السعر المتوسط (M)</Label>
                <Input
                  id="priceM"
                  type="number"
                  step="0.01"
                  value={formData.prices?.M || ""}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prices: { 
                      ...prev.prices, 
                      M: e.target.value ? parseFloat(e.target.value) : 0 
                    } 
                  }))}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="text-sm"
            />
          </div>

          <div>
            <Label>الخيارات</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="أضف خيار جديد"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addOption())}
                  className="text-sm"
                />
                <Button type="button" onClick={addOption} size="sm">
                  إضافة
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.options?.map((option, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1 text-xs">
                    {option}
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="image_url">رابط الصورة</Label>
            <Input
              id="image_url"
              value={formData.image_url}
              onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              className="text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sort_order">ترتيب العرض</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  sort_order: parseInt(e.target.value) || 0 
                }))}
                className="text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
              />
              <Label htmlFor="is_available" className="text-sm">متوفر</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {initialData ? "تحديث" : "إضافة"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedMenuManagement;
