import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, X, Loader2, Sun, Moon, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  position: string;
  status: string;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttendanceRecorded: () => void;
  selectedDate?: string;
  defaultEmployeeId?: string;
}

export const AttendanceModal = ({
  isOpen,
  onClose,
  onAttendanceRecorded,
  selectedDate,
  defaultEmployeeId,
}: AttendanceModalProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [shiftType, setShiftType] = useState<"morning" | "evening" | "both">(
    "morning"
  );
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceDate, setAttendanceDate] = useState("");
  const { toast } = useToast();

  // تعيين التاريخ الافتراضي
  useEffect(() => {
    if (selectedDate) {
      setAttendanceDate(selectedDate);
    } else {
      setAttendanceDate(new Date().toISOString().split("T")[0]);
    }
  }, [selectedDate]);

  // تعيين الموظف الافتراضي
  useEffect(() => {
    if (defaultEmployeeId) {
      setSelectedEmployee(defaultEmployeeId);
    }
  }, [defaultEmployeeId]);

  // جلب قائمة الموظفين
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, position, status")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEmployee) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار الموظف",
        variant: "destructive",
      });
      return;
    }

    if (!attendanceDate) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد التاريخ",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // التحقق من وجود سجل حضور سابق
      const { data: existingRecord } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", selectedEmployee)
        .eq("date", attendanceDate)
        .single();

      if (existingRecord) {
        // إذا كان هناك سجل موجود، نحدثه
        let updateData: any = {
          updated_at: new Date().toISOString(),
          status: "present",
        };

        // تحديث وقت الحضور بناءً على نوع الوردية
        if (shiftType === "morning" || shiftType === "both") {
          updateData.check_in = new Date().toISOString();
        }

        if (shiftType === "evening" || shiftType === "both") {
          updateData.check_out = new Date().toISOString();
        }

        // تحديث السجل الموجود
        const { error: updateError } = await supabase
          .from("attendance")
          .update(updateData)
          .eq("id", existingRecord.id);

        if (updateError) throw updateError;

        toast({
          title: "تم التحديث بنجاح",
          description: `تم تحديث حضور الموظف للوردية ${
            shiftType === "morning"
              ? "الصباحية"
              : shiftType === "evening"
              ? "المسائية"
              : "الصباحية والمسائية"
          }`,
        });
      } else {
        // إنشاء سجل حضور جديد
        const insertData: any = {
          employee_id: selectedEmployee,
          date: attendanceDate,
          status: "present",
          created_at: new Date().toISOString(),
        };

        // تعيين وقت الحضور بناءً على نوع الوردية
        if (shiftType === "morning" || shiftType === "both") {
          insertData.check_in = new Date().toISOString();
        }

        if (shiftType === "evening" || shiftType === "both") {
          insertData.check_out = new Date().toISOString();
        }

        const { error: insertError } = await supabase
          .from("attendance")
          .insert(insertData);

        if (insertError) throw insertError;

        toast({
          title: "تم التسجيل بنجاح",
          description: `تم تسجيل حضور الموظف للوردية ${
            shiftType === "morning"
              ? "الصباحية"
              : shiftType === "evening"
              ? "المسائية"
              : "الصباحية والمسائية"
          }`,
        });
      }

      onAttendanceRecorded();
      onClose();
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الحضور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case "morning":
        return "الصباحية";
      case "evening":
        return "المسائية";
      case "both":
        return "الصباحية والمسائية";
      default:
        return shift;
    }
  };

  const getShiftIcon = (shift: string) => {
    switch (shift) {
      case "morning":
        return <Sun className="w-4 h-4" />;
      case "evening":
        return <Moon className="w-4 h-4" />;
      case "both":
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  تسجيل الحضور
                </h2>
                <p className="text-slate-600 text-sm">
                  تسجيل حضور موظف مع تحديد الوردية
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
            {/* Date Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                تاريخ الحضور *
              </Label>
              <Input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                required
                className="w-full"
              />
            </div>

            {/* Employee Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                الموظف *
              </Label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{emp.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {emp.position}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shift Type Selection */}
            <div>
              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                نوع الوردية *
              </Label>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  type="button"
                  variant={shiftType === "morning" ? "default" : "outline"}
                  onClick={() => setShiftType("morning")}
                  className="flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-sm">الصباحية</span>
                </Button>

                <Button
                  type="button"
                  variant={shiftType === "evening" ? "default" : "outline"}
                  onClick={() => setShiftType("evening")}
                  className="flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-sm">المسائية</span>
                </Button>

                <Button
                  type="button"
                  variant={shiftType === "both" ? "default" : "outline"}
                  onClick={() => setShiftType("both")}
                  className="flex flex-col items-center gap-2 p-4 h-auto"
                >
                  <Clock className="w-5 h-5" />
                  <span className="text-sm">كلاهما</span>
                </Button>
              </div>
            </div>

            {/* Shift Info */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                {getShiftIcon(shiftType)}
                <span className="font-medium text-blue-800">
                  معلومات الوردية
                </span>
              </div>
              <p className="text-sm text-blue-600">
                {shiftType === "morning" &&
                  "سيتم تسجيل الحضور للوردية الصباحية فقط"}
                {shiftType === "evening" &&
                  "سيتم تسجيل الحضور للوردية المسائية فقط"}
                {shiftType === "both" &&
                  "سيتم تسجيل الحضور للورديتين الصباحية والمسائية"}
              </p>
              {shiftType === "both" && (
                <p className="text-xs text-blue-500 mt-2">
                  ملاحظة: سيتم حساب اليومية مرتين إذا حضر الموظف الورديتين
                </p>
              )}
            </div>

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
                disabled={loading || !selectedEmployee || !attendanceDate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 ml-2" />
                    تسجيل الحضور
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

export default AttendanceModal;
