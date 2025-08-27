import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock,
  Calendar,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  Coffee,
  Zap,
  Calculator,
  BarChart3,
} from "lucide-react";

interface Shift {
  id: string;
  employee_id: string;
  shift_date: string;
  shift_type: "morning" | "evening" | "night" | "full_day";
  start_time: string;
  end_time: string;
  break_duration: number;
  is_overtime: boolean;
  overtime_hours: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  daily_wage: number;
  total_earnings: number;
  created_at: string;
}

interface Employee {
  id: string;
  name: string;
  employment_type: "shift_based" | "full_time" | "part_time";
  daily_wage?: number;
}

interface AdvancedShiftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
}

export const AdvancedShiftsModal = ({ isOpen, onClose, employeeId }: AdvancedShiftsModalProps) => {
  const { toast } = useToast();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  // Form state
  const [shiftDate, setShiftDate] = useState("");
  const [shiftType, setShiftType] = useState<"morning" | "evening" | "night" | "full_day">("morning");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [breakDuration, setBreakDuration] = useState(30);
  const [isOvertime, setIsOvertime] = useState(false);
  const [overtimeHours, setOvertimeHours] = useState(0);
  const [status, setStatus] = useState<"scheduled" | "in_progress" | "completed" | "cancelled">("scheduled");

  const shiftTypes = [
    { value: "morning", label: "وردية صباحية", icon: Sun, color: "bg-yellow-100 text-yellow-800" },
    { value: "evening", label: "وردية مسائية", icon: Moon, color: "bg-blue-100 text-blue-800" },
    { value: "night", label: "وردية ليلية", icon: Coffee, color: "bg-purple-100 text-purple-800" },
    { value: "full_day", label: "دوام كامل", icon: Clock, color: "bg-green-100 text-green-800" },
  ];

  const statusOptions = [
    { value: "scheduled", label: "مجدول", icon: Calendar, color: "bg-blue-100 text-blue-800" },
    { value: "in_progress", label: "قيد التنفيذ", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
    { value: "completed", label: "مكتمل", icon: CheckCircle, color: "bg-green-100 text-green-800" },
    { value: "cancelled", label: "ملغي", icon: XCircle, color: "bg-red-100 text-red-800" },
  ];

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchEmployeeData();
      fetchShifts();
    }
  }, [isOpen, employeeId]);

  const fetchEmployeeData = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, employment_type")
        .eq("id", employeeId)
        .single();

      if (error) throw error;

      // Fetch employee profile for daily wage
      const { data: profileData } = await supabase
        .from("employee_profiles")
        .select("daily_wage")
        .eq("employee_id", employeeId)
        .single();

      setEmployee({
        ...data,
        daily_wage: profileData?.daily_wage || 0,
      });
    } catch (error) {
      console.error("خطأ في جلب بيانات الموظف:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الموظف",
        variant: "destructive",
      });
    }
  };

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_shifts")
        .select("*")
        .eq("employee_id", employeeId)
        .order("shift_date", { ascending: false });

      if (error) throw error;

      // Calculate earnings for each shift
      const shiftsWithEarnings = data.map(shift => {
        const baseWage = employee?.daily_wage || 0;
        let totalEarnings = baseWage;

        // For shift-based employees, calculate based on shift type
        if (employee?.employment_type === "shift_based") {
          if (shift.shift_type === "full_day") {
            totalEarnings = baseWage * 2; // Full day counts as 2 shifts
          } else {
            totalEarnings = baseWage; // Single shift
          }
        } else if (employee?.employment_type === "full_time") {
          totalEarnings = baseWage; // Full-time employees get daily wage
        }

        // Add overtime if applicable
        if (shift.is_overtime && shift.overtime_hours > 0) {
          const overtimeRate = baseWage * 0.5; // 50% extra for overtime
          totalEarnings += shift.overtime_hours * overtimeRate;
        }

        return {
          ...shift,
          daily_wage: baseWage,
          total_earnings: totalEarnings,
        };
      });

      setShifts(shiftsWithEarnings);
    } catch (error) {
      console.error("خطأ في جلب الورديات:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الورديات",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setShiftDate("");
    setShiftType("morning");
    setStartTime("");
    setEndTime("");
    setBreakDuration(30);
    setIsOvertime(false);
    setOvertimeHours(0);
    setStatus("scheduled");
    setEditingShift(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shiftDate || !startTime || !endTime) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const shiftData = {
        employee_id: employeeId,
        shift_date: shiftDate,
        shift_type: shiftType,
        start_time: startTime,
        end_time: endTime,
        break_duration: breakDuration,
        is_overtime: isOvertime,
        overtime_hours: overtimeHours,
        status: status,
      };

      if (editingShift) {
        // Update existing shift
        const { error } = await supabase
          .from("employee_shifts")
          .update(shiftData)
          .eq("id", editingShift.id);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم تحديث الوردية بنجاح",
        });
      } else {
        // Add new shift
        const { error } = await supabase
          .from("employee_shifts")
          .insert(shiftData);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم إضافة الوردية بنجاح",
        });
      }

      resetForm();
      fetchShifts();
    } catch (error) {
      console.error("خطأ في حفظ الوردية:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الوردية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الوردية؟")) return;

    try {
      const { error } = await supabase
        .from("employee_shifts")
        .delete()
        .eq("id", shiftId);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الوردية بنجاح",
      });

      fetchShifts();
    } catch (error) {
      console.error("خطأ في حذف الوردية:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الوردية",
        variant: "destructive",
      });
    }
  };

  const handleEditShift = (shift: Shift) => {
    setEditingShift(shift);
    setShiftDate(shift.shift_date);
    setShiftType(shift.shift_type);
    setStartTime(shift.start_time);
    setEndTime(shift.end_time);
    setBreakDuration(shift.break_duration);
    setIsOvertime(shift.is_overtime);
    setOvertimeHours(shift.overtime_hours);
    setStatus(shift.status);
    setShowAddForm(true);
  };

  // Calculate statistics
  const totalShifts = shifts.length;
  const completedShifts = shifts.filter(s => s.status === "completed").length;
  const totalEarnings = shifts.reduce((sum, shift) => sum + shift.total_earnings, 0);
  const totalOvertimeHours = shifts.reduce((sum, shift) => sum + (shift.overtime_hours || 0), 0);

  const getShiftTypeInfo = (type: string) => {
    return shiftTypes.find(t => t.value === type) || shiftTypes[0];
  };

  const getStatusInfo = (status: string) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <Clock className="w-5 h-5" />
            إدارة الورديات المتقدمة
            {employee && (
              <span className="text-sm text-gray-600 font-normal">
                - {employee.name}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Employee Info and Statistics */}
          {employee && (
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                    <div className="text-2xl font-bold text-blue-600">{totalShifts}</div>
                    <div className="text-xs text-blue-700">إجمالي الورديات</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-green-100">
                    <div className="text-2xl font-bold text-green-600">{completedShifts}</div>
                    <div className="text-xs text-green-700">الورديات المكتملة</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-purple-100">
                    <div className="text-2xl font-bold text-purple-600">{totalEarnings.toFixed(0)}</div>
                    <div className="text-xs text-purple-700">إجمالي الأرباح</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-orange-100">
                    <div className="text-2xl font-bold text-orange-600">{totalOvertimeHours}</div>
                    <div className="text-xs text-orange-700">ساعات الإضافي</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-blue-800">نوع التوظيف:</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {employee.employment_type === "full_time" && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>دوام كامل - يومية واحدة من الصباح للمساء</span>
                      </div>
                    )}
                    {employee.employment_type === "shift_based" && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span>نظام ورديات - حساب يوميتين منفصلتين للورديتين</span>
                      </div>
                    )}
                    {employee.employment_type === "part_time" && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span>دوام جزئي - حسب ساعات العمل</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    <strong>الأجر اليومي:</strong> {employee.daily_wage?.toFixed(2) || 'غير محدد'} د.ل
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  {editingShift ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingShift ? "تعديل الوردية" : "إضافة وردية جديدة"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="shiftDate">تاريخ الوردية</Label>
                      <Input
                        id="shiftDate"
                        type="date"
                        value={shiftDate}
                        onChange={(e) => setShiftDate(e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="shiftType">نوع الوردية</Label>
                      <Select value={shiftType} onValueChange={(value: any) => setShiftType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {shiftTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className="w-4 h-4" />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="status">حالة الوردية</Label>
                      <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <option.icon className="w-4 h-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="startTime">وقت البداية</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">وقت النهاية</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="breakDuration">مدة الاستراحة (دقائق)</Label>
                      <Input
                        id="breakDuration"
                        type="number"
                        value={breakDuration}
                        onChange={(e) => setBreakDuration(parseInt(e.target.value) || 0)}
                        min="0"
                        max="120"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="isOvertime"
                        checked={isOvertime}
                        onChange={(e) => setIsOvertime(e.target.checked)}
                        className="rounded"
                      />
                      <Label htmlFor="isOvertime">إضافي</Label>
                    </div>

                    {isOvertime && (
                      <div>
                        <Label htmlFor="overtimeHours">ساعات الإضافي</Label>
                        <Input
                          id="overtimeHours"
                          type="number"
                          value={overtimeHours}
                          onChange={(e) => setOvertimeHours(parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.5"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "جاري الحفظ..." : (editingShift ? "تحديث" : "إضافة")}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Shifts List */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                قائمة الورديات
              </CardTitle>
              <Button onClick={() => setShowAddForm(true)} size="sm">
                <Plus className="w-4 h-4 ml-2" />
                إضافة وردية
              </Button>
            </CardHeader>
            <CardContent>
              {shifts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-4" />
                  <p>لا توجد ورديات مضافة</p>
                </div>
              ) : (
                <ScrollArea className="max-h-96">
                  <div className="space-y-3">
                    {shifts.map((shift) => {
                      const shiftTypeInfo = getShiftTypeInfo(shift.shift_type);
                      const statusInfo = getStatusInfo(shift.status);
                      
                      return (
                        <div key={shift.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={shiftTypeInfo.color}>
                                  <shiftTypeInfo.icon className="w-3 h-3 ml-1" />
                                  {shiftTypeInfo.label}
                                </Badge>
                                <Badge className={statusInfo.color}>
                                  <statusInfo.icon className="w-3 h-3 ml-1" />
                                  {statusInfo.label}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                                <div>
                                  <span className="text-gray-600">التاريخ:</span>
                                  <div className="font-medium">{new Date(shift.shift_date).toLocaleDateString('ar-LY')}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">الوقت:</span>
                                  <div className="font-medium">{shift.start_time} - {shift.end_time}</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">الاستراحة:</span>
                                  <div className="font-medium">{shift.break_duration} دقيقة</div>
                                </div>
                                <div>
                                  <span className="text-gray-600">الأرباح:</span>
                                  <div className="font-medium text-green-600">{shift.total_earnings.toFixed(2)} د.ل</div>
                                </div>
                              </div>

                              {shift.is_overtime && shift.overtime_hours > 0 && (
                                <div className="mt-2 p-2 bg-orange-50 rounded border border-orange-200">
                                  <div className="flex items-center gap-2 text-orange-700 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    <span>إضافي: {shift.overtime_hours} ساعة</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditShift(shift)}
                                variant="outline"
                                size="sm"
                                className="border-blue-300 text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDeleteShift(shift.id)}
                                variant="outline"
                                size="sm"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
