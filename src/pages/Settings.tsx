import { useState } from "react";
import {
  Settings as SettingsIcon,
  Upload,
  Save,
  Coffee,
  User,
  Globe,
  Plus,
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
import cafeLogo from "@/assets/cafe-logo.png";
import CreateUserModal from "@/components/CreateUserModal";

const Settings = () => {
  const [cafeSettings, setCafeSettings] = useState({
    name: "",
    description: "",
    phone: "",
    email: "",
    address: "",
    currency: "LYD",
    timezone: "Africa/Tripoli",
    logo: null as File | null,
  });

  const [createUserOpen, setCreateUserOpen] = useState(false);

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

  const handleSave = () => {
    console.log("Saving settings:", cafeSettings);
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

        <div className="space-y-4 sm:space-y-8">
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
                      setCafeSettings((prev) => ({ ...prev, currency: value }))
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="اختر العملة" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
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

          {/* System Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
                إعدادات النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm">
                    المنطقة الزمنية
                  </Label>
                  <Select
                    value={cafeSettings.timezone}
                    onValueChange={(value) =>
                      setCafeSettings((prev) => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="اختر المنطقة الزمنية" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((timezone) => (
                        <SelectItem key={timezone.value} value={timezone.value}>
                          {timezone.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="bg-white/80 backdrop-blur-sm border-green-200">
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="w-4 h-4 sm:w-5 sm:h-5" />
                إدارة المستخدمين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 sm:py-8">
                <User className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2 text-sm sm:text-base">
                  إدارة المستخدمين
                </h3>
                <p className="text-muted-foreground mb-4 text-xs sm:text-sm">
                  إضافة وإدارة مستخدمين جدد للنظام
                </p>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    className="text-sm"
                    onClick={() => setCreateUserOpen(true)}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء مستخدم
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center sm:justify-end">
            <Button
              className="btn-gradient w-full sm:w-auto"
              size="lg"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </div>

      <CreateUserModal open={createUserOpen} onOpenChange={setCreateUserOpen} />
    </div>
  );
};

export default Settings;
