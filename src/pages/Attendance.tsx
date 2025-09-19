import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Calendar,
  Clock,
  Plus,
  Filter,
  Users,
  CheckCircle,
  XCircle,
  LogIn,
  User,
  Eye,
  Edit,
  History,
  Minus,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AttendanceHistory from "@/components/AttendanceHistory";
import AttendanceManagementModal from "@/components/AttendanceManagementModal";
import QuickWithdrawalButton from "@/components/QuickWithdrawalButton";
import WithdrawalStatsCard from "@/components/WithdrawalStatsCard";
import { useAttendance } from "@/hooks/useAttendance";

interface Employee {
  id: string;
  name: string;
  position: string;
  status: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  daily_wage_earned: number;
  deduction_amount: number;
  bonus_amount: number;
  early_departure: boolean;
  deduction_reason: string | null;
  notes: string | null;
  is_double_shift?: boolean;
  employees: Employee;
}

const AttendanceCard = React.memo(
  ({
    record,
    onEdit,
    onViewProfile,
    onManage,
    onDelete,
    selectedDate,
  }: {
    record: AttendanceRecord;
    onEdit: (record: AttendanceRecord) => void;
    onViewProfile: (id: string) => void;
    onManage: (record: AttendanceRecord) => void;
    onDelete: (record: AttendanceRecord) => void;
    selectedDate: string;
  }) => {
    const [todayWithdrawals, setTodayWithdrawals] = useState<any[]>([]);
    const [loadingWithdrawals, setLoadingWithdrawals] = useState(false);

    // جلب السحوبات للموظف في التاريخ المحدد
    const fetchTodayWithdrawals = useCallback(async () => {
      setLoadingWithdrawals(true);
      try {
        const { data, error } = await supabase
          .from("employee_withdrawals")
          .select("*")
          .eq("employee_id", record.employee_id)
          .eq("withdrawal_date", selectedDate)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTodayWithdrawals(data || []);
      } catch (error) {
        console.error("خطأ في جلب السحوبات:", error);
      } finally {
        setLoadingWithdrawals(false);
      }
    }, [record.employee_id, selectedDate]);

    useEffect(() => {
      fetchTodayWithdrawals();
    }, [record.employee_id, selectedDate]);
    const calculateWorkingHours = useCallback(
      (checkIn: string | null, checkOut: string | null) => {
        if (!checkIn) return "0";

        const start = new Date(checkIn);
        const end = checkOut ? new Date(checkOut) : new Date();
        const diffInMs = end.getTime() - start.getTime();
        const diffInHours = diffInMs / (1000 * 60 * 60);

        return diffInHours.toFixed(1);
      },
      []
    );

    const netEarnings = useMemo(() => {
      const baseWage = record.daily_wage_earned;
      const multiplier = record.is_double_shift ? 2 : 1;
      const adjustedWage = baseWage * multiplier;

      console.log(
        `Employee ${record.employees.name}: baseWage=${baseWage}, is_double_shift=${record.is_double_shift}, multiplier=${multiplier}, adjustedWage=${adjustedWage}`
      );

      return (
        adjustedWage +
        (record.bonus_amount || 0) -
        (record.deduction_amount || 0)
      );
    }, [
      record.daily_wage_earned,
      record.bonus_amount,
      record.deduction_amount,
      record.is_double_shift,
    ]);

    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProfile(record.employee_id)}
                className="p-0 h-auto text-primary hover:text-primary/80"
              >
                <User className="w-4 h-4 ml-1" />
                <span className="font-medium">{record.employees.name}</span>
              </Button>
            </div>
            <div className="flex flex-col gap-1">
              <Badge
                variant={
                  record.status === "present" ? "default" : "destructive"
                }
                className="text-xs"
              >
                {record.status === "present" ? "حاضر" : "غائب"}
              </Badge>
              {record.is_double_shift && (
                <Badge
                  variant="default"
                  className="text-xs bg-orange-500 text-white"
                >
                  ورديتين (×2)
                </Badge>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground mb-3">
            {record.employees.position}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">وقت الدخول</p>
              <p className="text-sm font-medium">
                {record.check_in
                  ? new Date(record.check_in).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">ساعات العمل</p>
              <p className="text-sm font-medium">
                {calculateWorkingHours(record.check_in, record.check_out)} ساعة
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {record.is_double_shift ? "اليومية (×2)" : "اليومية"}
              </p>
              <p className="text-sm font-medium text-green-600">
                {record.is_double_shift
                  ? `${(record.daily_wage_earned * 2).toFixed(2)} د.ل`
                  : `${record.daily_wage_earned || 0} د.ل`}
              </p>
              {record.is_double_shift && (
                <p className="text-xs text-muted-foreground">
                  ({record.daily_wage_earned} × 2)
                </p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">صافي الكسب</p>
              <p className="text-sm font-medium text-primary">
                {netEarnings.toFixed(2)} د.ل
              </p>
            </div>
          </div>

          {(record.deduction_amount > 0 || record.bonus_amount > 0) && (
            <div className="grid grid-cols-2 gap-4 mb-3 text-xs">
              {record.deduction_amount > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">خصم</p>
                  <p className="text-red-600">-{record.deduction_amount} د.ل</p>
                  {record.deduction_reason && (
                    <p className="text-muted-foreground text-xs">
                      {record.deduction_reason}
                    </p>
                  )}
                </div>
              )}
              {record.bonus_amount > 0 && (
                <div>
                  <p className="text-muted-foreground mb-1">مكافأة</p>
                  <p className="text-green-600">+{record.bonus_amount} د.ل</p>
                </div>
              )}
            </div>
          )}

          {record.early_departure && (
            <div className="mb-3">
              <Badge variant="destructive" className="text-xs">
                انصراف مبكر
              </Badge>
            </div>
          )}

          {/* Today's Withdrawals */}
          {loadingWithdrawals ? (
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">
                  جاري تحميل السحوبات...
                </span>
              </div>
            </div>
          ) : todayWithdrawals.length > 0 ? (
            <div className="mb-3 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <Minus className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-red-800">
                      السحوبات المسجلة
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="destructive"
                        className="text-xs px-2 py-1"
                      >
                        {todayWithdrawals.length} سحب
                      </Badge>
                      <span className="text-xs text-red-600">
                        {selectedDate === new Date().toISOString().split("T")[0]
                          ? "اليوم"
                          : new Date(selectedDate).toLocaleDateString("en-US")}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-red-700">
                    {todayWithdrawals
                      .reduce((sum, w) => sum + w.amount, 0)
                      .toFixed(2)}{" "}
                    د.ل
                  </div>
                  <div className="text-xs text-red-500 font-medium">
                    إجمالي المسحوبات
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-24 overflow-y-auto">
                {todayWithdrawals.map((withdrawal, index) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-red-700 text-sm">
                            {withdrawal.amount.toFixed(2)} د.ل
                          </span>
                          <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        </div>
                        {withdrawal.notes && (
                          <div className="text-xs text-gray-600 mt-1 max-w-32 truncate">
                            {withdrawal.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-700">
                        {new Date(withdrawal.created_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleDateString(
                          "en-US"
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-green-800">
                    لا توجد سحوبات
                  </span>
                  <div className="text-xs text-green-600">
                    {selectedDate === new Date().toISOString().split("T")[0]
                      ? "لم يسحب الموظف أي مبلغ اليوم"
                      : `لم يسحب الموظف أي مبلغ في ${new Date(
                          selectedDate
                        ).toLocaleDateString("en-US")}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log(
                  "Navigating to employee profile:",
                  record.employee_id
                );
                onViewProfile(record.employee_id);
              }}
              className="h-10 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 hover:from-purple-100 hover:to-pink-100 border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              title={`عرض بروفايل ${record.employees.name}`}
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">عرض</span>
              <span className="sm:hidden">عرض</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(record)}
              className="h-10 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 hover:from-blue-100 hover:to-cyan-100 border-blue-200 hover:border-blue-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">تعديل</span>
              <span className="sm:hidden">تعديل</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(record)}
              className="h-10 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 hover:from-red-100 hover:to-rose-100 border-red-200 hover:border-red-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              title={`حذف سجل الحضور لـ ${record.employees.name}`}
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">حذف</span>
              <span className="sm:hidden">حذف</span>
            </Button>
            <div className="col-span-2 sm:col-span-1">
              <QuickWithdrawalButton
                employeeId={record.employee_id}
                employeeName={record.employees.name}
                currentBalance={
                  record.daily_wage_earned +
                  (record.bonus_amount || 0) -
                  (record.deduction_amount || 0)
                }
                selectedDate={selectedDate}
                onWithdrawalComplete={() => {
                  // تحديث قائمة السحوبات بعد السحب
                  fetchTodayWithdrawals();
                }}
                size="sm"
                className="w-full h-10 text-sm font-medium"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onManage(record)}
                className="w-full h-10 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border-green-200 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">إدارة</span>
                <span className="sm:hidden">إدارة</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

AttendanceCard.displayName = "AttendanceCard";

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [managingRecord, setManagingRecord] = useState<AttendanceRecord | null>(
    null
  );
  const [editFormData, setEditFormData] = useState({
    deduction_amount: "",
    bonus_amount: "",
    deduction_reason: "",
    early_departure: false,
    notes: "",
  });
  const [selectedShift, setSelectedShift] = useState<
    "morning" | "evening" | "both"
  >("morning");
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const today = new Date().toLocaleDateString("en-US");

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedDate]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("خطأ في جلب بيانات الموظفين:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الموظفين",
        variant: "destructive",
      });
    }
  };

  const fetchAttendanceRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select(
          `
          id,
          employee_id,
          date,
          check_in,
          check_out,
          status,
          daily_wage_earned,
          deduction_amount,
          bonus_amount,
          early_departure,
          deduction_reason,
          notes,
          is_double_shift,
          employees!attendance_employee_id_fkey (
            id,
            name,
            position,
            status
          )
        `
        )
        .eq("date", selectedDate)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // تحديد الورديتين ببساطة
      const recordsWithShiftType = (data || []).map((record) => {
        let isDoubleShift = record.is_double_shift || false;

        // إذا لم يكن محفوظ في قاعدة البيانات، احسبه بناءً على الأوقات
        if (!record.is_double_shift && record.check_in && record.check_out) {
          const checkInTime = new Date(record.check_in).getHours();
          const checkOutTime = new Date(record.check_out).getHours();

          console.log(
            `Employee ${record.employee_id}: Check-in at ${checkInTime}, Check-out at ${checkOutTime}`
          );

          // إذا كان الحضور صباحاً (قبل 12) والانصراف مساءً (بعد 4) = ورديتين
          if (checkInTime < 12 && checkOutTime >= 16) {
            isDoubleShift = true;
            console.log(
              `✅ Double shift detected for employee ${record.employee_id}`
            );
          }
        }

        console.log(
          `Final is_double_shift for employee ${record.employee_id}: ${isDoubleShift} (from DB: ${record.is_double_shift})`
        );

        return {
          ...record,
          is_double_shift: isDoubleShift,
        };
      });

      setAttendanceRecords(recordsWithShiftType);
    } catch (error) {
      console.error("خطأ في جلب سجلات الحضور:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب سجلات الحضور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (employeeId: string) => {
    try {
      const { data: existingRecord } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .eq("date", selectedDate)
        .single();

      if (existingRecord) {
        // إذا كان هناك سجل موجود، نتحقق من الوردية
        if (selectedShift === "morning" && existingRecord.check_in) {
          toast({
            title: "تنبيه",
            description: "تم تسجيل الحضور الصباحي من قبل",
            variant: "destructive",
          });
          return;
        }
        if (selectedShift === "evening" && existingRecord.check_out) {
          toast({
            title: "تنبيه",
            description: "تم تسجيل الحضور المسائي من قبل",
            variant: "destructive",
          });
          return;
        }
        if (
          selectedShift === "both" &&
          existingRecord.check_in &&
          existingRecord.check_out
        ) {
          toast({
            title: "تنبيه",
            description: "تم تسجيل الحضور في الورديتين من قبل",
            variant: "destructive",
          });
          return;
        }

        // تحديث السجل الموجود
        const updateData: any = {};
        if (selectedShift === "morning" && !existingRecord.check_in) {
          updateData.check_in = new Date().toISOString();
        }
        if (selectedShift === "evening" && !existingRecord.check_out) {
          updateData.check_out = new Date().toISOString();
        }
        if (selectedShift === "both") {
          if (!existingRecord.check_in)
            updateData.check_in = new Date().toISOString();
          if (!existingRecord.check_out)
            updateData.check_out = new Date().toISOString();
        }

        // تحديد الورديتين بناءً على اختيار المستخدم
        if (selectedShift === "both") {
          updateData.is_double_shift = true;
          console.log(
            `Setting is_double_shift = true for employee ${employeeId}`
          );
        }

        console.log(`Updating attendance record with data:`, updateData);

        const { error } = await supabase
          .from("attendance")
          .update(updateData)
          .eq("id", existingRecord.id);

        if (error) throw error;

        // تم حفظ is_double_shift في قاعدة البيانات

        toast({
          title: "تم بنجاح",
          description: `تم تسجيل الحضور في الوردية ${
            selectedShift === "morning"
              ? "الصباحية"
              : selectedShift === "evening"
              ? "المسائية"
              : "الصباحية والمسائية"
          } بنجاح`,
        });
      } else {
        // إنشاء سجل جديد
        const insertData: any = {
          employee_id: employeeId,
          date: selectedDate,
          status: "present",
          is_double_shift: selectedShift === "both",
        };

        if (selectedShift === "morning" || selectedShift === "both") {
          insertData.check_in = new Date().toISOString();
        }
        if (selectedShift === "evening" || selectedShift === "both") {
          insertData.check_out = new Date().toISOString();
        }

        console.log(`Creating new attendance record with data:`, insertData);

        const { error } = await supabase.from("attendance").insert(insertData);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: `تم تسجيل الحضور في الوردية ${
            selectedShift === "morning"
              ? "الصباحية"
              : selectedShift === "evening"
              ? "المسائية"
              : "الصباحية والمسائية"
          } وحساب اليومية بنجاح`,
        });
      }

      await fetchAttendanceRecords();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("خطأ في تسجيل الحضور:", error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الحضور",
        variant: "destructive",
      });
    }
  };

  const handleEditRecord = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditFormData({
      deduction_amount: record.deduction_amount?.toString() || "",
      bonus_amount: record.bonus_amount?.toString() || "",
      deduction_reason: record.deduction_reason || "",
      early_departure: record.early_departure || false,
      notes: record.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;

    try {
      const { error } = await supabase
        .from("attendance")
        .update({
          deduction_amount: editFormData.deduction_amount
            ? parseFloat(editFormData.deduction_amount)
            : 0,
          bonus_amount: editFormData.bonus_amount
            ? parseFloat(editFormData.bonus_amount)
            : 0,
          deduction_reason: editFormData.deduction_reason || null,
          early_departure: editFormData.early_departure,
          notes: editFormData.notes || null,
        })
        .eq("id", editingRecord.id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تحديث سجل الحضور بنجاح",
      });

      setIsEditDialogOpen(false);
      await fetchAttendanceRecords();
    } catch (error) {
      console.error("خطأ في تحديث السجل:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث السجل",
        variant: "destructive",
      });
    }
  };

  const handleManageRecord = (record: AttendanceRecord) => {
    setManagingRecord(record);
    setIsManagementModalOpen(true);
  };

  const handleDeleteRecord = async (record: AttendanceRecord) => {
    if (
      !confirm(`هل أنت متأكد من حذف سجل الحضور لـ ${record.employees.name}؟`)
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", record.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: `تم حذف سجل الحضور لـ ${record.employees.name} بنجاح`,
      });

      await fetchAttendanceRecords();
    } catch (error) {
      console.error("خطأ في حذف السجل:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف السجل",
        variant: "destructive",
      });
    }
  };

  const handleAttendanceUpdated = () => {
    fetchAttendanceRecords();
  };

  const handleViewProfile = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  };

  const filteredRecords =
    selectedEmployee === "all"
      ? attendanceRecords
      : attendanceRecords.filter(
          (record) => record.employee_id === selectedEmployee
        );

  const presentCount = attendanceRecords.length;
  const absentCount = employees.length - presentCount;
  const attendanceRate =
    employees.length > 0
      ? Math.round((presentCount / employees.length) * 100)
      : 0;

  const CheckInDialogContent = () => (
    <>
      <DialogHeader>
        <DialogTitle>تسجيل حضور موظف</DialogTitle>
        <DialogDescription>
          اختر الموظف والوردية لتسجيل الحضور
        </DialogDescription>
      </DialogHeader>

      {/* Shift Selection */}
      <div className="mb-6 p-6 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            اختر الوردية
          </h3>
          <p className="text-slate-600 text-sm">
            حدد نوع الوردية لتسجيل الحضور
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Morning Shift */}
          <div
            onClick={() => setSelectedShift("morning")}
            className={`relative cursor-pointer group transition-all duration-300 ${
              selectedShift === "morning" ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div
              className={`h-32 rounded-2xl border-2 transition-all duration-300 ${
                selectedShift === "morning"
                  ? "border-emerald-500 bg-gradient-to-br from-emerald-50 to-green-100 shadow-lg shadow-emerald-200"
                  : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
              }`}
            >
              <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                    selectedShift === "morning"
                      ? "bg-emerald-500 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600"
                  }`}
                >
                  <Clock className="w-6 h-6" />
                </div>
                <h4
                  className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                    selectedShift === "morning"
                      ? "text-emerald-700"
                      : "text-slate-700 group-hover:text-emerald-700"
                  }`}
                >
                  صباحية
                </h4>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    selectedShift === "morning"
                      ? "text-emerald-600"
                      : "text-slate-500 group-hover:text-emerald-600"
                  }`}
                >
                  وردية الصباح
                </p>
              </div>
            </div>
            {selectedShift === "morning" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          {/* Evening Shift */}
          <div
            onClick={() => setSelectedShift("evening")}
            className={`relative cursor-pointer group transition-all duration-300 ${
              selectedShift === "evening" ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div
              className={`h-32 rounded-2xl border-2 transition-all duration-300 ${
                selectedShift === "evening"
                  ? "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-100 shadow-lg shadow-blue-200"
                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
              }`}
            >
              <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                    selectedShift === "evening"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-600"
                  }`}
                >
                  <Clock className="w-6 h-6" />
                </div>
                <h4
                  className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                    selectedShift === "evening"
                      ? "text-blue-700"
                      : "text-slate-700 group-hover:text-blue-700"
                  }`}
                >
                  مسائية
                </h4>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    selectedShift === "evening"
                      ? "text-blue-600"
                      : "text-slate-500 group-hover:text-blue-600"
                  }`}
                >
                  وردية المساء
                </p>
              </div>
            </div>
            {selectedShift === "evening" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>

          {/* Both Shifts */}
          <div
            onClick={() => setSelectedShift("both")}
            className={`relative cursor-pointer group transition-all duration-300 ${
              selectedShift === "both" ? "scale-105" : "hover:scale-102"
            }`}
          >
            <div
              className={`h-32 rounded-2xl border-2 transition-all duration-300 ${
                selectedShift === "both"
                  ? "border-purple-500 bg-gradient-to-br from-purple-50 to-pink-100 shadow-lg shadow-purple-200"
                  : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md"
              }`}
            >
              <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                    selectedShift === "both"
                      ? "bg-purple-500 text-white shadow-lg"
                      : "bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-600"
                  }`}
                >
                  <Clock className="w-6 h-6" />
                </div>
                <h4
                  className={`font-bold text-lg mb-1 transition-colors duration-300 ${
                    selectedShift === "both"
                      ? "text-purple-700"
                      : "text-slate-700 group-hover:text-purple-700"
                  }`}
                >
                  الورديتين
                </h4>
                <p
                  className={`text-xs transition-colors duration-300 ${
                    selectedShift === "both"
                      ? "text-purple-600"
                      : "text-slate-500 group-hover:text-purple-600"
                  }`}
                >
                  صباح + مساء
                </p>
              </div>
            </div>
            {selectedShift === "both" && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        <ScrollArea className="max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {employees.map((employee) => {
              const existingRecord = attendanceRecords.find(
                (record) => record.employee_id === employee.id
              );

              let canCheckIn = true;
              let statusText = "حضور";
              let statusColor = "bg-green-600 hover:bg-green-700";

              if (existingRecord) {
                if (selectedShift === "morning" && existingRecord.check_in) {
                  canCheckIn = false;
                  statusText = "مسجل صباحاً";
                  statusColor = "bg-emerald-400";
                } else if (
                  selectedShift === "evening" &&
                  existingRecord.check_out
                ) {
                  canCheckIn = false;
                  statusText = "مسجل مساءً";
                  statusColor = "bg-blue-400";
                } else if (
                  selectedShift === "both" &&
                  existingRecord.check_in &&
                  existingRecord.check_out
                ) {
                  canCheckIn = false;
                  statusText = "مسجل في الورديتين";
                  statusColor = "bg-purple-400";
                } else if (selectedShift === "both") {
                  if (existingRecord.check_in && existingRecord.check_out) {
                    canCheckIn = false;
                    statusText = "مسجل في الورديتين";
                    statusColor = "bg-purple-400";
                  } else if (existingRecord.check_in) {
                    statusText = "إضافة مساءً";
                    statusColor = "bg-blue-600 hover:bg-blue-700";
                  } else if (existingRecord.check_out) {
                    statusText = "إضافة صباحاً";
                    statusColor = "bg-emerald-600 hover:bg-emerald-700";
                  }
                }
              }

              return (
                <div
                  key={employee.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{employee.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {employee.position}
                    </p>
                    {existingRecord && (
                      <div className="flex gap-2 mt-1">
                        {existingRecord.check_in && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-emerald-100 text-emerald-700"
                          >
                            صباح:{" "}
                            {new Date(
                              existingRecord.check_in
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                        )}
                        {existingRecord.check_out && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-blue-100 text-blue-700"
                          >
                            مساء:{" "}
                            {new Date(
                              existingRecord.check_out
                            ).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleCheckIn(employee.id)}
                    size="sm"
                    disabled={!canCheckIn}
                    className={`ml-2 ${statusColor} text-white`}
                  >
                    {!canCheckIn ? (
                      <>
                        <CheckCircle className="w-4 h-4 ml-1" />
                        {statusText}
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 ml-1" />
                        {statusText}
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background p-3" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header - Mobile Optimized */}
        <div className="space-y-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              الحضور والغياب
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              تسجيل ومتابعة حضور الموظفين - {today}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="today" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              اليوم
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              السجل الكامل
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-4">
            {/* Check-in Button */}
            <div>
              {isMobile ? (
                <Drawer open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DrawerTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="w-4 h-4 ml-2" />
                      تسجيل حضور موظف
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent dir="rtl" className="h-[90vh] overflow-y-auto">
                    <DrawerHeader>
                      <DrawerTitle>تسجيل حضور موظف</DrawerTitle>
                      <DrawerDescription>
                        اختر الموظف والوردية لتسجيل الحضور
                      </DrawerDescription>
                    </DrawerHeader>
                    {/* Shift Selection for Mobile - Compact Design */}
                    <div className="px-3 mb-4">
                      <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-200 shadow-lg p-4">
                        {/* Header */}
                        <div className="text-center mb-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg">
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-800 mb-1">
                            اختر الوردية
                          </h3>
                        </div>

                        {/* Shift Options - Horizontal Layout */}
                        <div className="grid grid-cols-3 gap-2">
                          {/* Morning Shift */}
                          <div
                            onClick={() => setSelectedShift("morning")}
                            className={`relative cursor-pointer group transition-all duration-300 ${
                              selectedShift === "morning"
                                ? "scale-105"
                                : "hover:scale-102"
                            }`}
                          >
                            <div
                              className={`h-20 rounded-xl border-2 transition-all duration-300 ${
                                selectedShift === "morning"
                                  ? "border-emerald-500 bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg shadow-emerald-500/30"
                                  : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md"
                              }`}
                            >
                              <div className="p-2 h-full flex flex-col items-center justify-center text-center">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-all duration-300 ${
                                    selectedShift === "morning"
                                      ? "bg-white text-emerald-600 shadow-md"
                                      : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"
                                  }`}
                                >
                                  <Clock className="w-4 h-4" />
                                </div>
                                <h4
                                  className={`font-bold text-sm transition-colors duration-300 ${
                                    selectedShift === "morning"
                                      ? "text-white"
                                      : "text-emerald-700 group-hover:text-emerald-800"
                                  }`}
                                >
                                  صباحية
                                </h4>
                              </div>
                            </div>
                            {selectedShift === "morning" && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>

                          {/* Evening Shift */}
                          <div
                            onClick={() => setSelectedShift("evening")}
                            className={`relative cursor-pointer group transition-all duration-300 ${
                              selectedShift === "evening"
                                ? "scale-105"
                                : "hover:scale-102"
                            }`}
                          >
                            <div
                              className={`h-20 rounded-xl border-2 transition-all duration-300 ${
                                selectedShift === "evening"
                                  ? "border-blue-500 bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/30"
                                  : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-md"
                              }`}
                            >
                              <div className="p-2 h-full flex flex-col items-center justify-center text-center">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-all duration-300 ${
                                    selectedShift === "evening"
                                      ? "bg-white text-blue-600 shadow-md"
                                      : "bg-blue-100 text-blue-600 group-hover:bg-blue-200"
                                  }`}
                                >
                                  <Clock className="w-4 h-4" />
                                </div>
                                <h4
                                  className={`font-bold text-sm transition-colors duration-300 ${
                                    selectedShift === "evening"
                                      ? "text-white"
                                      : "text-blue-700 group-hover:text-blue-800"
                                  }`}
                                >
                                  مسائية
                                </h4>
                              </div>
                            </div>
                            {selectedShift === "evening" && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>

                          {/* Both Shifts */}
                          <div
                            onClick={() => setSelectedShift("both")}
                            className={`relative cursor-pointer group transition-all duration-300 ${
                              selectedShift === "both"
                                ? "scale-105"
                                : "hover:scale-102"
                            }`}
                          >
                            <div
                              className={`h-20 rounded-xl border-2 transition-all duration-300 ${
                                selectedShift === "both"
                                  ? "border-purple-500 bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30"
                                  : "border-slate-200 bg-white hover:border-purple-300 hover:shadow-md"
                              }`}
                            >
                              <div className="p-2 h-full flex flex-col items-center justify-center text-center">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1 transition-all duration-300 ${
                                    selectedShift === "both"
                                      ? "bg-white text-purple-600 shadow-md"
                                      : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                                  }`}
                                >
                                  <Clock className="w-4 h-4" />
                                </div>
                                <h4
                                  className={`font-bold text-sm transition-colors duration-300 ${
                                    selectedShift === "both"
                                      ? "text-white"
                                      : "text-purple-700 group-hover:text-purple-800"
                                  }`}
                                >
                                  الورديتين
                                </h4>
                              </div>
                            </div>
                            {selectedShift === "both" && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Employees List - Compact Mobile Design */}
                    <div className="px-3 flex-1">
                      <div className="max-h-[55vh] overflow-y-auto pr-1 -mr-1">
                        <div className="space-y-2">
                          {employees.map((employee) => {
                            const existingRecord = attendanceRecords.find(
                              (record) => record.employee_id === employee.id
                            );

                            let canCheckIn = true;
                            let statusText = "حضور";
                            let statusColor = "bg-green-600 hover:bg-green-700";

                            if (existingRecord) {
                              if (
                                selectedShift === "morning" &&
                                existingRecord.check_in
                              ) {
                                canCheckIn = false;
                                statusText = "مسجل صباحاً";
                                statusColor = "bg-emerald-400";
                              } else if (
                                selectedShift === "evening" &&
                                existingRecord.check_out
                              ) {
                                canCheckIn = false;
                                statusText = "مسجل مساءً";
                                statusColor = "bg-blue-400";
                              } else if (
                                selectedShift === "both" &&
                                existingRecord.check_in &&
                                existingRecord.check_out
                              ) {
                                canCheckIn = false;
                                statusText = "مسجل في الورديتين";
                                statusColor = "bg-purple-400";
                              } else if (selectedShift === "both") {
                                if (
                                  existingRecord.check_in &&
                                  existingRecord.check_out
                                ) {
                                  canCheckIn = false;
                                  statusText = "مسجل في الورديتين";
                                  statusColor = "bg-purple-400";
                                } else if (existingRecord.check_in) {
                                  statusText = "إضافة مساءً";
                                  statusColor = "bg-blue-600 hover:bg-blue-700";
                                } else if (existingRecord.check_out) {
                                  statusText = "إضافة صباحاً";
                                  statusColor =
                                    "bg-emerald-600 hover:bg-emerald-700";
                                }
                              }
                            }

                            return (
                              <div
                                key={employee.id}
                                className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-md transition-all duration-200"
                              >
                                {/* Employee Info Row */}
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                                      <User className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-800 truncate">
                                        {employee.name}
                                      </p>
                                      <p className="text-xs text-slate-500 truncate">
                                        {employee.position}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Status Button */}
                                  <Button
                                    onClick={() => handleCheckIn(employee.id)}
                                    size="sm"
                                    disabled={!canCheckIn}
                                    className={`${statusColor} text-white text-xs px-3 py-1.5 h-auto rounded-lg shadow-sm`}
                                  >
                                    {!canCheckIn ? (
                                      <>
                                        <CheckCircle className="w-3 h-3 ml-1" />
                                        {statusText}
                                      </>
                                    ) : (
                                      <>
                                        <LogIn className="w-3 h-3 ml-1" />
                                        {statusText}
                                      </>
                                    )}
                                  </Button>
                                </div>

                                {/* Attendance Status Badges */}
                                {existingRecord && (
                                  <div className="flex flex-wrap gap-1.5">
                                    {existingRecord.check_in && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1"
                                      >
                                        <Clock className="w-3 h-3 ml-1" />
                                        صباح:{" "}
                                        {new Date(
                                          existingRecord.check_in
                                        ).toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </Badge>
                                    )}
                                    {existingRecord.check_out && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-1"
                                      >
                                        <Clock className="w-3 h-3 ml-1" />
                                        مساء:{" "}
                                        {new Date(
                                          existingRecord.check_out
                                        ).toLocaleTimeString("en-US", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <DrawerFooter>
                      <DrawerClose asChild>
                        <Button variant="outline">إغلاق</Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              ) : (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                      <Plus className="w-4 h-4 ml-2" />
                      تسجيل حضور موظف
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg mx-auto" dir="rtl">
                    <CheckInDialogContent />
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        إجمالي الموظفين
                      </p>
                      <p className="text-lg sm:text-xl font-bold">
                        {employees.length}
                      </p>
                    </div>
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        الحاضرون
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-green-600">
                        {presentCount}
                      </p>
                    </div>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        الغائبون
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-red-600">
                        {absentCount}
                      </p>
                    </div>
                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        معدل الحضور
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-primary">
                        {attendanceRate}%
                      </p>
                    </div>
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Withdrawal Stats */}
            <WithdrawalStatsCard selectedDate={selectedDate} />

            {/* Filters - Mobile Optimized */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                  تصفية النتائج
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      التاريخ
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      الموظف
                    </label>
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger className="text-sm h-10">
                        <SelectValue placeholder="اختر الموظف" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الموظفين</SelectItem>
                        {employees.map((employee) => (
                          <SelectItem key={employee.id} value={employee.id}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Records - Mobile Optimized */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">
                  سجل الحضور اليومي
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="text-center py-8 px-4">
                    <Clock className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm">جاري تحميل البيانات...</p>
                  </div>
                ) : filteredRecords.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      لا توجد سجلات حضور
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      ابدأ بتسجيل حضور الموظفين لمتابعة أوقات العمل
                    </p>
                  </div>
                ) : (
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    {filteredRecords.map((record) => (
                      <AttendanceCard
                        key={record.id}
                        record={record}
                        onEdit={handleEditRecord}
                        onViewProfile={handleViewProfile}
                        onManage={handleManageRecord}
                        onDelete={handleDeleteRecord}
                        selectedDate={selectedDate}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <AttendanceHistory />
          </TabsContent>
        </Tabs>

        {/* Edit Record Dialog - Mobile Optimized */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent
            className="max-w-sm mx-2 max-h-[90vh] overflow-y-auto sm:max-w-md"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg">
                تعديل سجل الحضور
              </DialogTitle>
              <DialogDescription className="text-sm">
                يمكنك تعديل الخصومات والمكافآت والملاحظات
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label htmlFor="deduction_amount" className="text-sm">
                  مبلغ الخصم (د.ل)
                </Label>
                <Input
                  id="deduction_amount"
                  type="number"
                  value={editFormData.deduction_amount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      deduction_amount: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="mt-1 h-10"
                />
              </div>

              <div>
                <Label htmlFor="deduction_reason" className="text-sm">
                  سبب الخصم
                </Label>
                <Input
                  id="deduction_reason"
                  value={editFormData.deduction_reason}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      deduction_reason: e.target.value,
                    })
                  }
                  placeholder="أدخل سبب الخصم"
                  className="mt-1 h-10"
                />
              </div>

              <div>
                <Label htmlFor="bonus_amount" className="text-sm">
                  مبلغ المكافأة (د.ل)
                </Label>
                <Input
                  id="bonus_amount"
                  type="number"
                  value={editFormData.bonus_amount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      bonus_amount: e.target.value,
                    })
                  }
                  placeholder="0"
                  className="mt-1 h-10"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="early_departure"
                  checked={editFormData.early_departure}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      early_departure: e.target.checked,
                    })
                  }
                  className="rounded w-4 h-4"
                />
                <Label htmlFor="early_departure" className="text-sm">
                  انصراف مبكر
                </Label>
              </div>

              <div>
                <Label htmlFor="notes" className="text-sm">
                  ملاحظات
                </Label>
                <Input
                  id="notes"
                  value={editFormData.notes}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, notes: e.target.value })
                  }
                  placeholder="أدخل ملاحظات إضافية"
                  className="mt-1 h-10"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 text-sm h-10"
                >
                  حفظ التعديلات
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 text-sm h-10"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Attendance Management Modal */}
        <AttendanceManagementModal
          open={isManagementModalOpen}
          onOpenChange={setIsManagementModalOpen}
          attendanceRecord={
            managingRecord
              ? {
                  id: managingRecord.id,
                  employee_id: managingRecord.employee_id,
                  check_in: managingRecord.check_in,
                  check_out: managingRecord.check_out,
                  status: managingRecord.status,
                  notes: managingRecord.notes,
                  employees: {
                    id: managingRecord.employees.id,
                    name: managingRecord.employees.name,
                    position: managingRecord.employees.position,
                    salary: 0, // Default salary, will be updated by the modal
                  },
                }
              : null
          }
          onAttendanceUpdated={handleAttendanceUpdated}
        />
      </div>
    </div>
  );
};

export default Attendance;
