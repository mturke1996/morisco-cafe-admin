import { useState, useEffect } from "react";
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
import { User, X, Loader2, Save, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  hire_date: string;
  status: string;
}

interface EmployeeProfile {
  id: string;
  employee_id: string;
  daily_wage: number;
  total_work_hours: number;
  monthly_withdrawals: number;
  last_withdrawal_date: string | null;
  notes: string | null;
}

interface EditEmployeeModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onEmployeeUpdated: () => void;
}

export const EditEmployeeModal = ({
  employee,
  isOpen,
  onClose,
  onEmployeeUpdated,
}: EditEmployeeModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email || "",
    phone: employee.phone || "",
    position: employee.position,
    salary: employee.salary || 0,
    status: employee.status,
    daily_wage: 0,
    total_work_hours: 0,
    monthly_withdrawals: 0,
    notes: "",
  });
  const { toast } = useToast();

  // جلب بيانات الملف الشخصي
  useEffect(() => {
    fetchEmployeeProfile();

    // حساب اليومية الأولية من الراتب إذا لم تكن موجودة
    if (employee.salary && employee.salary > 0) {
      const calculatedDailyWage =
        Math.round((employee.salary / 30) * 100) / 100;
      setFormData((prev) => ({
        ...prev,
        daily_wage: calculatedDailyWage,
      }));
    }
  }, [employee.id, employee.salary]);

  const fetchEmployeeProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_profiles")
        .select("*")
        .eq("employee_id", employee.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error);
      }

      if (data) {
        setFormData((prev) => ({
          ...prev,
          daily_wage: data.daily_wage || 0,
          total_work_hours: data.total_work_hours || 0,
          monthly_withdrawals: data.monthly_withdrawals || 0,
          notes: data.notes || "",
        }));
      } else {
        // إذا لم يكن هناك ملف شخصي، احسب اليومية من الراتب
        if (employee.salary && employee.salary > 0) {
          const calculatedDailyWage =
            Math.round((employee.salary / 30) * 100) / 100;
          setFormData((prev) => ({
            ...prev,
            daily_wage: calculatedDailyWage,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // إذا تم تغيير الراتب، احسب اليومية تلقائياً
      if (field === "salary" && typeof value === "number" && value > 0) {
        // حساب اليومية: الراتب ÷ 30 يوم
        const dailyWage = Math.round((value / 30) * 100) / 100; // تقريب إلى رقمين عشريين
        newData.daily_wage = dailyWage;
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // تحديث بيانات الموظف الأساسية
      const { error: employeeError } = await supabase
        .from("employees")
        .update({
          name: formData.name,
          email: formData.email || null,
          phone: formData.phone || null,
          position: formData.position,
          salary: formData.salary || null,
          status: formData.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", employee.id);

      if (employeeError) throw employeeError;

      // تحديث أو إنشاء الملف الشخصي
      const { error: profileError } = await supabase
        .from("employee_profiles")
        .upsert(
          {
            employee_id: employee.id,
            daily_wage: formData.daily_wage,
            total_work_hours: formData.total_work_hours,
            monthly_withdrawals: formData.monthly_withdrawals,
            notes: formData.notes || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "employee_id",
          }
        );

      if (profileError) throw profileError;

      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الموظف بنجاح",
      });

      onEmployeeUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث بيانات الموظف",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  تعديل بيانات الموظف
                </h2>
                <p className="text-slate-600 text-sm">
                  تحديث المعلومات الشخصية والمالية
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  المعلومات الأساسية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      الاسم الكامل *
                    </Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="اسم الموظف"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      البريد الإلكتروني
                    </Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="example@email.com"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      رقم الهاتف
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      placeholder="0912345678"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      المنصب *
                    </Label>
                    <Input
                      value={formData.position}
                      onChange={(e) =>
                        handleInputChange("position", e.target.value)
                      }
                      placeholder="مثال: نادل، طباخ، مدير"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      الراتب الشهري (د.ل)
                    </Label>
                    <Input
                      type="number"
                      value={formData.salary}
                      onChange={(e) =>
                        handleInputChange(
                          "salary",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      الحالة *
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleInputChange("status", value)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="inactive">غير نشط</SelectItem>
                        <SelectItem value="suspended">معلق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-800">
                  المعلومات المالية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      اليومية (د.ل) *
                      <span className="text-xs text-blue-600 ml-2">
                        (تُحسب تلقائياً: الراتب ÷ 30)
                      </span>
                    </Label>
                    <Input
                      type="number"
                      value={formData.daily_wage}
                      onChange={(e) =>
                        handleInputChange(
                          "daily_wage",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                      className="w-full"
                    />
                    {formData.salary > 0 && (
                      <div className="mt-2 space-y-2">
                        <p className="text-xs text-green-600">
                          💡 اليومية المحسوبة:{" "}
                          {Math.round((formData.salary / 30) * 100) / 100} د.ل
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const calculatedDailyWage =
                              Math.round((formData.salary / 30) * 100) / 100;
                            handleInputChange(
                              "daily_wage",
                              calculatedDailyWage
                            );
                          }}
                          className="text-xs h-6 px-2"
                        >
                          تطبيق الحساب التلقائي
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      إجمالي ساعات العمل
                    </Label>
                    <Input
                      type="number"
                      value={formData.total_work_hours}
                      onChange={(e) =>
                        handleInputChange(
                          "total_work_hours",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      المسحوبات الشهرية (د.ل)
                    </Label>
                    <Input
                      type="number"
                      value={formData.monthly_withdrawals}
                      onChange={(e) =>
                        handleInputChange(
                          "monthly_withdrawals",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    ملاحظات
                  </Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="أي ملاحظات إضافية..."
                    rows={3}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 ml-2" />
                    حفظ التغييرات
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
