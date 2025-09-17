import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Percent,
  Clock,
  Star,
  ShoppingCart,
  Tag,
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number | null;
  prices: any;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
}

interface OfferItem {
  id: string;
  menu_item_id: string;
  quantity: number;
  menu_item?: MenuItem;
}

interface DailyOffer {
  id: string;
  title: string;
  description: string | null;
  original_price: number;
  offer_price: number;
  discount_percentage: number | null;
  image_url: string | null;
  is_active: boolean;
  start_date: string;
  end_date: string | null;
  sort_order: number;
  created_at: string;
  offer_items?: OfferItem[];
}

export default function DailyOffersManagement() {
  const [offers, setOffers] = useState<DailyOffer[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<DailyOffer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    original_price: 0,
    offer_price: 0,
    image_url: "",
    is_active: true,
    end_date: "",
  });

  const [selectedItems, setSelectedItems] = useState<
    { menu_item_id: string; quantity: number }[]
  >([]);

  useEffect(() => {
    fetchOffers();
    fetchMenuItems();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_offers")
        .select(
          `
          *,
          daily_offer_items (
            *,
            menu_item:menu_items (*)
          )
        `
        )
        .order("sort_order", { ascending: true });

      if (error) throw error;

      // Transform data to match expected format
      const transformedOffers = (data || []).map((offer) => ({
        ...offer,
        offer_items: offer.daily_offer_items || [],
      }));

      setOffers(transformedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      toast.error("خطأ في جلب العروض");
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("name");

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  const calculateDiscount = (original: number, offer: number) => {
    return Math.round(((original - offer) / original) * 100);
  };

  const handleAddOffer = async () => {
    try {
      if (
        !formData.title ||
        formData.original_price <= 0 ||
        formData.offer_price <= 0
      ) {
        toast.error("يرجى ملء جميع الحقول المطلوبة");
        return;
      }

      if (selectedItems.length === 0) {
        toast.error("يرجى إضافة عنصر واحد على الأقل للعرض");
        return;
      }

      const discountPercentage = calculateDiscount(
        formData.original_price,
        formData.offer_price
      );

      // Create offer
      const { data: offerData, error: offerError } = await supabase
        .from("daily_offers")
        .insert({
          title: formData.title,
          description: formData.description,
          original_price: formData.original_price,
          offer_price: formData.offer_price,
          discount_percentage: discountPercentage,
          image_url: formData.image_url || null,
          is_active: formData.is_active,
          end_date: formData.end_date || null,
        })
        .select()
        .single();

      if (offerError) throw offerError;

      // Add offer items
      const offerItems = selectedItems.map((item) => ({
        offer_id: offerData.id,
        menu_item_id: item.menu_item_id,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("daily_offer_items")
        .insert(offerItems);

      if (itemsError) throw itemsError;

      toast.success("تم إضافة العرض بنجاح");
      setShowAddDialog(false);
      resetForm();
      fetchOffers();
    } catch (error) {
      console.error("Error adding offer:", error);
      toast.error("خطأ في إضافة العرض");
    }
  };

  const handleToggleStatus = async (offer: DailyOffer) => {
    try {
      const { error } = await supabase
        .from("daily_offers")
        .update({ is_active: !offer.is_active })
        .eq("id", offer.id);

      if (error) throw error;

      toast.success(`تم ${offer.is_active ? "إلغاء تفعيل" : "تفعيل"} العرض`);
      fetchOffers();
    } catch (error) {
      console.error("Error updating offer:", error);
      toast.error("خطأ في تحديث العرض");
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    try {
      const { error } = await supabase
        .from("daily_offers")
        .delete()
        .eq("id", offerId);

      if (error) throw error;

      toast.success("تم حذف العرض بنجاح");
      fetchOffers();
    } catch (error) {
      console.error("Error deleting offer:", error);
      toast.error("خطأ في حذف العرض");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      original_price: 0,
      offer_price: 0,
      image_url: "",
      is_active: true,
      end_date: "",
    });
    setSelectedItems([]);
  };

  const addMenuItem = (menuItemId: string) => {
    if (selectedItems.find((item) => item.menu_item_id === menuItemId)) {
      toast.warning("هذا العنصر موجود بالفعل في العرض");
      return;
    }

    const menuItem = menuItems.find((item) => item.id === menuItemId);
    if (menuItem) {
      setSelectedItems([
        ...selectedItems,
        { menu_item_id: menuItemId, quantity: 1 },
      ]);
    }
  };

  const removeMenuItem = (menuItemId: string) => {
    setSelectedItems(
      selectedItems.filter((item) => item.menu_item_id !== menuItemId)
    );
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    setSelectedItems(
      selectedItems.map((item) =>
        item.menu_item_id === menuItemId ? { ...item, quantity } : item
      )
    );
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.description?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "active") return matchesSearch && offer.is_active;
    if (filterStatus === "inactive") return matchesSearch && !offer.is_active;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 arabic-text">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            إدارة عروض اليوم
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة العروض والتخفيضات الخاصة
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              إضافة عرض جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة عرض جديد</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
                <TabsTrigger value="items">عناصر العرض</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">عنوان العرض *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="مثال: عرض القهوة والكرواسون"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">وصف العرض</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="وصف مختصر للعرض"
                    />
                  </div>

                  <div>
                    <Label htmlFor="original_price">السعر الأصلي *</Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={formData.original_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          original_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="offer_price">سعر العرض *</Label>
                    <Input
                      id="offer_price"
                      type="number"
                      value={formData.offer_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          offer_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image_url">رابط الصورة</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) =>
                        setFormData({ ...formData, image_url: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="end_date">تاريخ انتهاء العرض</Label>
                    <Input
                      id="end_date"
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(e) =>
                        setFormData({ ...formData, end_date: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked })
                    }
                  />
                  <Label htmlFor="is_active">تفعيل العرض</Label>
                </div>
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <div>
                  <Label>إضافة عناصر للعرض</Label>
                  <Select onValueChange={addMenuItem}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر عنصر من القائمة" />
                    </SelectTrigger>
                    <SelectContent>
                      {menuItems.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name} - {item.price || "أسعار متعددة"} د.ل
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedItems.length > 0 && (
                  <div className="space-y-2">
                    <Label>عناصر العرض المحددة</Label>
                    {selectedItems.map((item) => {
                      const menuItem = menuItems.find(
                        (mi) => mi.id === item.menu_item_id
                      );
                      return (
                        <div
                          key={item.menu_item_id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{menuItem?.name}</p>
                            <p className="text-sm text-gray-600">
                              {menuItem?.category}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`qty-${item.menu_item_id}`}>
                              الكمية:
                            </Label>
                            <Input
                              id={`qty-${item.menu_item_id}`}
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(
                                  item.menu_item_id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              className="w-20"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMenuItem(item.menu_item_id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddOffer}>إضافة العرض</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">البحث في العروض</Label>
              <Input
                id="search"
                placeholder="ابحث في العروض..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                size="sm"
              >
                الكل
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
                size="sm"
              >
                نشط
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
                size="sm"
              >
                غير نشط
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOffers.map((offer) => (
          <Card key={offer.id} className="relative overflow-hidden">
            <CardContent className="p-4">
              {/* Status Badge */}
              <div className="absolute top-2 left-2">
                <Badge variant={offer.is_active ? "default" : "secondary"}>
                  {offer.is_active ? "نشط" : "غير نشط"}
                </Badge>
              </div>

              {/* Discount Badge */}
              {offer.discount_percentage && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-red-500 text-white">
                    -{offer.discount_percentage}%
                  </Badge>
                </div>
              )}

              {/* Image */}
              {offer.image_url && (
                <div className="mb-4">
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-gray-900">
                  {offer.title}
                </h3>

                {offer.description && (
                  <p className="text-sm text-gray-600">{offer.description}</p>
                )}

                {/* Items */}
                {offer.offer_items && offer.offer_items.length > 0 && (
                  <div className="space-y-1">
                    <Label className="text-sm font-medium">عناصر العرض:</Label>
                    {offer.offer_items.map((item, index) => (
                      <div key={index} className="text-sm text-gray-600">
                        • {item.quantity}x {item.menu_item?.name}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pricing */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 line-through">
                        {offer.original_price} د.ل
                      </span>
                      <span className="text-lg font-bold text-green-600">
                        {offer.offer_price} د.ل
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      توفير: {offer.original_price - offer.offer_price} د.ل
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(offer)}
                    className="flex-1"
                  >
                    {offer.is_active ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        إلغاء التفعيل
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        تفعيل
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد عروض
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "لم يتم العثور على عروض تطابق البحث"
                : "لم يتم إضافة أي عروض بعد"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddDialog(true)}>
                إضافة أول عرض
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
