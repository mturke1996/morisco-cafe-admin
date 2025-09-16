import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Upload,
  Save,
  Coffee,
  User,
  Globe,
  Plus,
  Trash2,
  Edit,
  Shield,
  Database,
  Bell,
  Palette,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import cafeLogo from "@/assets/cafe-logo.png";
import CreateUserModal from "@/components/CreateUserModal";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [cafeSettings, setCafeSettings] = useState({
    name: "موريسكو كافيه",
    description: "مقهى راقي يقدم أفضل أنواع القهوة والمشروبات",
    phone: "+218 91 234 5678",
    email: "info@morisco-cafe.com",
    address: "طرابلس - ليبيا",
    currency: "LYD",
    timezone: "Africa/Tripoli",
    logo: null as File | null,
  });

  const [systemSettings, setSystemSettings] = useState({
    notifications: true,
    autoBackup: true,
    darkMode: false,
    language: "ar",
    dateFormat: "en-US",
    timeFormat: "24h",
  });

  const [users, setUsers] = useState([]);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currencies = [
    { value: "LYD", label: "دينار ليبي (د.ل)" },
    { value: "SAR", label: "ريال سعودي (ر.س)" },
    { value: "USD", label: "دولار أمريكي ($)" },
    { value: "EUR", label: "يورو (€)" },
    { value: "AED", label: "درهم إماراتي (د.إ)" },
  ];

  const timezones = [
    { value: "Africa/Tripoli", label: "طرابلس - ليبيا (GMT+2)" },
    { value: "Asia/Riyadh", label: "الرياض (GMT+3)" },
    { value: "Asia/Dubai", label: "دبي (GMT+4)" },
    { value: "Asia/Kuwait", label: "الكويت (GMT+3)" },
    { value: "Africa/Cairo", label: "القاهرة (GMT+2)" },
  ];

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCafeSettings((prev) => ({ ...prev, logo: file }));
    }
  };

  useEffect(() => {
    fetchUsers();
    loadSettings();
  }, []);

  const loadSettings = () => {
    try {
      const savedCafeSettings = localStorage.getItem("cafeSettings");
      const savedSystemSettings = localStorage.getItem("systemSettings");

      if (savedCafeSettings) {
        setCafeSettings(JSON.parse(savedCafeSettings));
      }

      if (savedSystemSettings) {
        const parsed = JSON.parse(savedSystemSettings);
        setSystemSettings(parsed);

        // Apply dark mode on load
        if (parsed.darkMode) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save cafe settings to localStorage for now
      localStorage.setItem("cafeSettings", JSON.stringify(cafeSettings));
      localStorage.setItem("systemSettings", JSON.stringify(systemSettings));

      // Apply dark mode immediately
      if (systemSettings.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      toast({
        title: "تم حفظ الإعدادات",
        description: "تم حفظ جميع الإعدادات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم بنجاح",
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: "خطأ في الحذف",
        description: "حدث خطأ أثناء حذف المستخدم",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-3 sm:p-6"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            الإعدادات
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            إدارة إعدادات المقهى والنظام العامة
          </p>
        </div>

        <Tabs defaultValue="cafe" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cafe" className="flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              <span className="hidden sm:inline">المقهى</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="hidden sm:inline">النظام</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">المستخدمين</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">المظهر</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cafe" className="space-y-4 sm:space-y-8">
            {/* Cafe Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                  معلومات المقهى
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Logo Upload - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-muted rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={cafeLogo}
                      alt="شعار المقهى"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-right">
                    <Label className="text-sm font-medium">شعار المقهى</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      ارفع شعار المقهى (PNG, JPG - حد أقصى 2MB)
                    </p>
                    <div className="flex justify-center sm:justify-start">
                      <Button variant="outline" size="sm" asChild>
                        <label htmlFor="logo-upload" className="cursor-pointer">
                          <Upload className="w-4 h-4 ml-2" />
                          رفع شعار جديد
                        </label>
                      </Button>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cafe-name" className="text-sm">
                      اسم المقهى
                    </Label>
                    <Input
                      id="cafe-name"
                      placeholder="ادخل اسم المقهى"
                      value={cafeSettings.name}
                      onChange={(e) =>
                        setCafeSettings((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cafe-phone" className="text-sm">
                      رقم الهاتف
                    </Label>
                    <Input
                      id="cafe-phone"
                      placeholder="091xxxxxxx"
                      value={cafeSettings.phone}
                      onChange={(e) =>
                        setCafeSettings((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }))
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cafe-email" className="text-sm">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      id="cafe-email"
                      type="email"
                      placeholder="info@cafe.com"
                      value={cafeSettings.email}
                      onChange={(e) =>
                        setCafeSettings((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm">
                      العملة
                    </Label>
                    <Select
                      value={cafeSettings.currency}
                      onValueChange={(value) =>
                        setCafeSettings((prev) => ({
                          ...prev,
                          currency: value,
                        }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="اختر العملة" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cafe-address" className="text-sm">
                    العنوان
                  </Label>
                  <Textarea
                    id="cafe-address"
                    placeholder="طرابلس - ليبيا"
                    value={cafeSettings.address}
                    onChange={(e) =>
                      setCafeSettings((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                    className="min-h-[80px] sm:min-h-[100px] text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cafe-description" className="text-sm">
                    وصف المقهى
                  </Label>
                  <Textarea
                    id="cafe-description"
                    placeholder="وصف قصير عن المقهى"
                    value={cafeSettings.description}
                    onChange={(e) =>
                      setCafeSettings((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="min-h-[80px] sm:min-h-[100px] text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4 sm:space-y-8">
            {/* System Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                  إعدادات النظام
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-sm">
                      المنطقة الزمنية
                    </Label>
                    <Select
                      value={cafeSettings.timezone}
                      onValueChange={(value) =>
                        setCafeSettings((prev) => ({
                          ...prev,
                          timezone: value,
                        }))
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="اختر المنطقة الزمنية" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((timezone) => (
                          <SelectItem
                            key={timezone.value}
                            value={timezone.value}
                          >
                            {timezone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">الإشعارات</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">تفعيل الإشعارات</Label>
                      <p className="text-xs text-muted-foreground">
                        تلقي إشعارات حول الأنشطة المهمة
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.notifications}
                      onCheckedChange={(checked) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          notifications: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">النسخ الاحتياطي</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">
                        النسخ الاحتياطي التلقائي
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        نسخ احتياطي تلقائي للبيانات يومياً
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          autoBackup: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4 sm:space-y-8">
            {/* User Management */}
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  إدارة المستخدمين
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm">
                      المستخدمين المسجلين
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateUserOpen(true)}
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة مستخدم
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {users.map((user: any) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{user.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {user.created_at
                                ? new Date(user.created_at).toLocaleDateString(
                                    "en-US"
                                  )
                                : "غير محدد"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              user.email_confirmed_at ? "default" : "secondary"
                            }
                          >
                            {user.email_confirmed_at ? "مفعل" : "غير مفعل"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 sm:space-y-8">
            {/* Appearance Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border-green-200">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                  إعدادات المظهر
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">الوضع الليلي</h3>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">تفعيل الوضع الليلي</Label>
                      <p className="text-xs text-muted-foreground">
                        تبديل بين الوضع الفاتح والليلي
                      </p>
                    </div>
                    <Switch
                      checked={systemSettings.darkMode}
                      onCheckedChange={(checked) =>
                        setSystemSettings((prev) => ({
                          ...prev,
                          darkMode: checked,
                        }))
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm">
                    تنسيق التاريخ والوقت
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm">تنسيق التاريخ</Label>
                      <Select
                        value={systemSettings.dateFormat}
                        onValueChange={(value) =>
                          setSystemSettings((prev) => ({
                            ...prev,
                            dateFormat: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en-US">MM/DD/YYYY</SelectItem>
                          <SelectItem value="en-GB">DD/MM/YYYY</SelectItem>
                          <SelectItem value="ar-SA">YYYY/MM/DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">تنسيق الوقت</Label>
                      <Select
                        value={systemSettings.timeFormat}
                        onValueChange={(value) =>
                          setSystemSettings((prev) => ({
                            ...prev,
                            timeFormat: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12 ساعة (AM/PM)</SelectItem>
                          <SelectItem value="24h">24 ساعة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Save Button */}
          <div className="flex justify-center sm:justify-end mt-6">
            <Button
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 w-full sm:w-auto"
              size="lg"
              onClick={handleSave}
              disabled={loading}
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </Tabs>
      </div>

      <CreateUserModal open={createUserOpen} onOpenChange={setCreateUserOpen} />
    </div>
  );
};

export default Settings;
