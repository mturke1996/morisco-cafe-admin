import React, { useState, useEffect } from "react";
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
import { Clock, User, Calendar, CheckCircle, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  position: string;
}

interface ImprovedAttendanceModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

interface AttendanceRecord {
  id?: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  shift_type: "morning" | "evening" | "both";
  notes?: string;
}

export const ImprovedAttendanceModal = ({
  employee,
  isOpen,
  onClose,
}: ImprovedAttendanceModalProps) => {
  const [date, setDate] = useState("");
  const [shiftType, setShiftType] = useState<"morning" | "evening" | "both">(
    "morning"
  );
  const [morningShift, setMorningShift] = useState(false);
  const [eveningShift, setEveningShift] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingRecord, setExistingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const { toast } = useToast();

  // تعيين التاريخ الحالي عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];
      setDate(formattedDate);
      setMorningShift(false);
      setEveningShift(false);
      fetchExistingRecord(formattedDate);
    }
  }, [isOpen, employee.id]);

  // جلب السجل الموجود
  const fetchExistingRecord = async (selectedDate: string) => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employee.id)
        .eq("date", selectedDate)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching record:", error);
      }

      if (data) {
        setExistingRecord(data);
        setMorningShift(!!data.check_in);
        setEveningShift(!!data.check_out);

        // تحديد نوع الوردية
        if (data.check_in && data.check_out) {
          setShiftType("both");
        } else if (data.check_in) {
          setShiftType("morning");
        } else if (data.check_out) {
          setShiftType("evening");
        }
      } else {
        setExistingRecord(null);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // تحديث التاريخ
  useEffect(() => {
    if (date) {
      fetchExistingRecord(date);
    }
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد التاريخ",
        variant: "destructive",
      });
      return;
    }

    if (!morningShift && !eveningShift) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد نوع الوردية",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const currentTime = new Date().toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      let checkIn = null;
      let checkOut = null;
      let finalShiftType: "morning" | "evening" | "both" = "morning";

      if (morningShift && eveningShift) {
        checkIn = currentTime;
        checkOut = currentTime;
        finalShiftType = "both";
      } else if (morningShift) {
        checkIn = currentTime;
        finalShiftType = "morning";
      } else if (eveningShift) {
        checkOut = currentTime;
        finalShiftType = "evening";
      }

      if (existingRecord) {
        // تحديث السجل الموجود
        const updateData: Partial<AttendanceRecord> = {
          shift_type: finalShiftType,
        };

        if (morningShift && !existingRecord.check_in) {
          updateData.check_in = currentTime;
        }
        if (eveningShift && !existingRecord.check_out) {
          updateData.check_out = currentTime;
        }

        const { error } = await supabase
          .from("attendance")
          .update(updateData)
          .eq("id", existingRecord.id);

        if (error) throw error;

        toast({
          title: "تم التحديث بنجاح",
          description: "تم تحديث سجل الحضور",
        });
      } else {
        // إنشاء سجل جديد
        const { error } = await supabase.from("attendance").insert({
          employee_id: employee.id,
          date,
          check_in: checkIn,
          check_out: checkOut,
          shift_type: finalShiftType,
        });

        if (error) throw error;

        toast({
          title: "تم التسجيل بنجاح",
          description: "تم تسجيل الحضور",
        });
      }

      onClose();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getShiftTime = (shift: "morning" | "evening") => {
    if (shift === "morning") {
      return "9:00 - 15:30";
    } else {
      return "15:30 - 23:30";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b-2 border-green-600 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  تسجيل الحضور
                </h2>
                <p className="text-slate-600 text-sm">
                  {employee.name} - {employee.position}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Employee Info */}
          <Card className="border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-800 text-lg font-bold flex items-center gap-2">
                <User className="w-5 h-5" />
                معلومات الموظف
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">الاسم:</span>
                  <span className="text-emerald-900 font-semibold">
                    {employee.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-700 font-medium">المنصب:</span>
                  <span className="text-emerald-900 font-semibold">
                    {employee.position}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-800 text-lg font-bold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                تحديد التاريخ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="date" className="text-blue-700 font-medium">
                  التاريخ
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border-2 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                  <strong>التاريخ المحدد:</strong>{" "}
                  {date
                    ? new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "لم يتم تحديد التاريخ"}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shift Selection */}
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-800 text-lg font-bold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                اختيار الوردية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Morning Shift */}
                <div className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="morning"
                      checked={morningShift}
                      onChange={(e) => setMorningShift(e.target.checked)}
                      className="w-5 h-5 text-orange-600 border-orange-300 rounded focus:ring-orange-500"
                    />
                    <div>
                      <Label
                        htmlFor="morning"
                        className="text-orange-800 font-bold text-lg cursor-pointer"
                      >
                        الوردية الصباحية
                      </Label>
                      <p className="text-orange-600 text-sm">9:00 - 15:30</p>
                    </div>
                  </div>
                  {morningShift && (
                    <CheckCircle className="w-6 h-6 text-orange-600" />
                  )}
                </div>

                {/* Evening Shift */}
                <div className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg bg-gradient-to-r from-purple-50 to-white">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="evening"
                      checked={eveningShift}
                      onChange={(e) => setEveningShift(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                    />
                    <div>
                      <Label
                        htmlFor="evening"
                        className="text-purple-800 font-bold text-lg cursor-pointer"
                      >
                        الوردية المسائية
                      </Label>
                      <p className="text-purple-600 text-sm">15:30 - 23:30</p>
                    </div>
                  </div>
                  {eveningShift && (
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  )}
                </div>

                {/* Current Status */}
                {existingRecord && (
                  <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                    <h4 className="font-semibold text-slate-800 mb-2">
                      الحالة الحالية:
                    </h4>
                    <div className="space-y-1 text-sm">
                      {existingRecord.check_in && (
                        <div className="flex justify-between">
                          <span>الحضور الصباحي:</span>
                          <span className="text-green-600 font-medium">
                            {existingRecord.check_in}
                          </span>
                        </div>
                      )}
                      {existingRecord.check_out && (
                        <div className="flex justify-between">
                          <span>الحضور المسائي:</span>
                          <span className="text-green-600 font-medium">
                            {existingRecord.check_out}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading || (!morningShift && !eveningShift)}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 ml-2" />
                {existingRecord ? "تحديث الحضور" : "تسجيل الحضور"}
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ImprovedAttendanceModal;
