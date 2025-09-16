import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Minus,
  Plus as PlusIcon,
  Calendar,
  Repeat,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Employee {
  id: string;
  name: string;
  position: string;
}

interface EmployeeAdjustment {
  id: string;
  employee_id: string;
  adjustment_type: "bonus" | "deduction" | "overtime" | "allowance";
  amount: number;
  reason: string;
  adjustment_date: string;
  period_start?: string;
  period_end?: string;
  is_recurring: boolean;
  recurring_frequency?: "daily" | "weekly" | "monthly";
  created_at: string;
}

interface EmployeeAdjustmentsModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

const adjustmentTypeConfig = {
  bonus: {
    icon: TrendingUp,
    color: "bg-green-100 text-green-800 border-green-200",
    label: "مكافأة",
    description: "مكافأة إضافية للموظف",
  },
  deduction: {
    icon: TrendingDown,
    color: "bg-red-100 text-red-800 border-red-200",
    label: "خصم",
    description: "خصم من راتب الموظف",
  },
  overtime: {
    icon: Calendar,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "عمل إضافي",
    description: "أجر العمل الإضافي",
  },
  allowance: {
    icon: DollarSign,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    label: "بدل",
    description: "بدل إضافي للموظف",
  },
};

const frequencyConfig = {
  daily: { label: "يومي", color: "bg-blue-100 text-blue-800" },
  weekly: { label: "أسبوعي", color: "bg-green-100 text-green-800" },
  monthly: { label: "شهري", color: "bg-purple-100 text-purple-800" },
};

export const EmployeeAdjustmentsModal = ({
  employee,
  isOpen,
  onClose,
}: EmployeeAdjustmentsModalProps) => {
  const [adjustments, setAdjustments] = useState<EmployeeAdjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAdjustment, setEditingAdjustment] =
    useState<EmployeeAdjustment | null>(null);
  const [formData, setFormData] = useState({
    adjustment_type: "bonus" as const,
    amount: "",
    reason: "",
    adjustment_date: new Date().toISOString().split("T")[0],
    period_start: "",
    period_end: "",
    is_recurring: false,
    recurring_frequency: "monthly" as const,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchAdjustments();
    }
  }, [isOpen, employee.id]);

  const fetchAdjustments = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_adjustments")
        .select("*")
        .eq("employee_id", employee.id)
        .order("adjustment_date", { ascending: false });

      if (error) throw error;
      setAdjustments(data || []);
    } catch (error) {
      console.error("Error fetching adjustments:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الإضافي والخصم",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.reason.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    try {
      const adjustmentData = {
        employee_id: employee.id,
        adjustment_type: formData.adjustment_type,
        amount: amount,
        reason: formData.reason,
        adjustment_date: formData.adjustment_date,
        period_start: formData.period_start || null,
        period_end: formData.period_end || null,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.is_recurring
          ? formData.recurring_frequency
          : null,
      };

      if (editingAdjustment) {
        // تحديث الإضافي/الخصم
        const { error } = await supabase
          .from("employee_adjustments")
          .update(adjustmentData)
          .eq("id", editingAdjustment.id);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم تحديث الإضافي/الخصم بنجاح",
        });
      } else {
        // إضافة إضافي/خصم جديد
        const { error } = await supabase
          .from("employee_adjustments")
          .insert(adjustmentData);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم إضافة الإضافي/الخصم بنجاح",
        });
      }

      resetForm();
      fetchAdjustments();
    } catch (error) {
      console.error("Error saving adjustment:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الإضافي/الخصم",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (adjustmentId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإضافي/الخصم؟")) return;

    try {
      const { error } = await supabase
        .from("employee_adjustments")
        .delete()
        .eq("id", adjustmentId);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الإضافي/الخصم بنجاح",
      });

      fetchAdjustments();
    } catch (error) {
      console.error("Error deleting adjustment:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الإضافي/الخصم",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      adjustment_type: "bonus",
      amount: "",
      reason: "",
      adjustment_date: new Date().toISOString().split("T")[0],
      period_start: "",
      period_end: "",
      is_recurring: false,
      recurring_frequency: "monthly",
    });
    setEditingAdjustment(null);
    setShowAddForm(false);
  };

  const handleEdit = (adjustment: EmployeeAdjustment) => {
    setEditingAdjustment(adjustment);
    setFormData({
      adjustment_type: adjustment.adjustment_type,
      amount: adjustment.amount.toString(),
      reason: adjustment.reason,
      adjustment_date: adjustment.adjustment_date,
      period_start: adjustment.period_start || "",
      period_end: adjustment.period_end || "",
      is_recurring: adjustment.is_recurring,
      recurring_frequency: adjustment.recurring_frequency || "monthly",
    });
    setShowAddForm(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateTotals = () => {
    return adjustments.reduce(
      (acc, adjustment) => {
        if (
          adjustment.adjustment_type === "bonus" ||
          adjustment.adjustment_type === "overtime" ||
          adjustment.adjustment_type === "allowance"
        ) {
          acc.totalBonus += adjustment.amount;
        } else {
          acc.totalDeduction += adjustment.amount;
        }
        return acc;
      },
      { totalBonus: 0, totalDeduction: 0 }
    );
  };

  const { totalBonus, totalDeduction } = calculateTotals();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <div>الإضافي والخصم</div>
              <div className="text-sm font-normal text-muted-foreground">
                {employee.name} - {employee.position}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">إجمالي المكافآت</p>
                    <p className="text-2xl font-bold text-green-800">
                      {totalBonus.toFixed(2)} د.ك
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">إجمالي الخصومات</p>
                    <p className="text-2xl font-bold text-red-800">
                      {totalDeduction.toFixed(2)} د.ك
                    </p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">صافي الإضافي</p>
                    <p
                      className={`text-2xl font-bold ${
                        totalBonus - totalDeduction >= 0
                          ? "text-green-800"
                          : "text-red-800"
                      }`}
                    >
                      {(totalBonus - totalDeduction).toFixed(2)} د.ك
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* زر إضافة إضافي/خصم */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">سجل الإضافي والخصم</h3>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة إضافي/خصم
            </Button>
          </div>

          {/* نموذج إضافة/تعديل */}
          {showAddForm && (
            <Card className="border-2 border-dashed border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingAdjustment
                    ? "تعديل الإضافي/الخصم"
                    : "إضافة إضافي/خصم جديد"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adjustment_type">نوع الإضافي/الخصم</Label>
                      <Select
                        value={formData.adjustment_type}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            adjustment_type: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(adjustmentTypeConfig).map(
                            ([type, config]) => (
                              <SelectItem key={type} value={type}>
                                <div className="flex items-center gap-2">
                                  <config.icon className="w-4 h-4" />
                                  {config.label}
                                </div>
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="amount">المبلغ (د.ك)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="reason">السبب</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      placeholder="أدخل سبب الإضافي/الخصم"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="adjustment_date">
                        تاريخ الإضافي/الخصم
                      </Label>
                      <Input
                        id="adjustment_date"
                        type="date"
                        value={formData.adjustment_date}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            adjustment_date: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="period_start">
                        تاريخ البداية (اختياري)
                      </Label>
                      <Input
                        id="period_start"
                        type="date"
                        value={formData.period_start}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            period_start: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="period_end">
                        تاريخ النهاية (اختياري)
                      </Label>
                      <Input
                        id="period_end"
                        type="date"
                        value={formData.period_end}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            period_end: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id="is_recurring"
                      checked={formData.is_recurring}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          is_recurring: !!checked,
                        }))
                      }
                    />
                    <Label htmlFor="is_recurring">متكرر</Label>
                  </div>

                  {formData.is_recurring && (
                    <div>
                      <Label htmlFor="recurring_frequency">تكرار</Label>
                      <Select
                        value={formData.recurring_frequency}
                        onValueChange={(value: any) =>
                          setFormData((prev) => ({
                            ...prev,
                            recurring_frequency: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(frequencyConfig).map(
                            ([frequency, config]) => (
                              <SelectItem key={frequency} value={frequency}>
                                {config.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingAdjustment ? "تحديث" : "إضافة"}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* قائمة الإضافي والخصم */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : adjustments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  لا توجد إضافي أو خصم
                </h3>
                <p className="text-muted-foreground mb-4">
                  لم يتم إضافة أي إضافي أو خصم لهذا الموظف بعد
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أول إضافي/خصم
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {adjustments.map((adjustment) => {
                const typeConfig =
                  adjustmentTypeConfig[adjustment.adjustment_type];
                const Icon = typeConfig.icon;

                return (
                  <Card
                    key={adjustment.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-lg ${typeConfig.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">
                              {typeConfig.label}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {typeConfig.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge
                                variant="outline"
                                className={typeConfig.color}
                              >
                                {adjustment.amount.toFixed(2)} د.ك
                              </Badge>
                              {adjustment.is_recurring && (
                                <Badge className="bg-purple-100 text-purple-800">
                                  <Repeat className="w-3 h-3 ml-1" />
                                  متكرر
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(adjustment)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(adjustment.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700">{adjustment.reason}</p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(adjustment.adjustment_date)}
                          </div>
                          {adjustment.period_start && adjustment.period_end && (
                            <div className="flex items-center gap-1">
                              <span>
                                من {formatDate(adjustment.period_start)} إلى{" "}
                                {formatDate(adjustment.period_end)}
                              </span>
                            </div>
                          )}
                        </div>
                        {adjustment.is_recurring &&
                          adjustment.recurring_frequency && (
                            <Badge
                              className={
                                frequencyConfig[adjustment.recurring_frequency]
                                  .color
                              }
                            >
                              {
                                frequencyConfig[adjustment.recurring_frequency]
                                  .label
                              }
                            </Badge>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
