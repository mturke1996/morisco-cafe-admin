import { useState, useEffect } from "react";
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
  employees: Employee;
}

const AttendanceCard = ({
  record,
  onEdit,
  onViewProfile,
}: {
  record: AttendanceRecord;
  onEdit: (record: AttendanceRecord) => void;
  onViewProfile: (id: string) => void;
}) => {
  const calculateWorkingHours = (
    checkIn: string | null,
    checkOut: string | null
  ) => {
    if (!checkIn) return "0";

    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date();
    const diffInMs = end.getTime() - start.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    return diffInHours.toFixed(1);
  };

  const netEarnings =
    record.daily_wage_earned +
    (record.bonus_amount || 0) -
    (record.deduction_amount || 0);

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
          <Badge
            variant={record.status === "present" ? "default" : "destructive"}
            className="text-xs"
          >
            {record.status === "present" ? "حاضر" : "غائب"}
          </Badge>
        </div>

        <div className="text-sm text-muted-foreground mb-3">
          {record.employees.position}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">وقت الدخول</p>
            <p className="text-sm font-medium">
              {record.check_in
                ? new Date(record.check_in).toLocaleTimeString("ar-LY", {
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
            <p className="text-xs text-muted-foreground mb-1">اليومية</p>
            <p className="text-sm font-medium text-green-600">
              {record.daily_wage_earned || 0} د.ل
            </p>
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

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewProfile(record.employee_id)}
            className="text-xs h-8"
          >
            <Eye className="w-3 h-3 ml-1" />
            عرض
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(record)}
            className="text-xs h-8"
          >
            <Edit className="w-3 h-3 ml-1" />
            تعديل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

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
  const [editFormData, setEditFormData] = useState({
    deduction_amount: "",
    bonus_amount: "",
    deduction_reason: "",
    early_departure: false,
    notes: "",
  });
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const today = new Date().toLocaleDateString("en-GB");

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
      setAttendanceRecords(data || []);
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
        toast({
          title: "تنبيه",
          description: "تم تسجيل حضور هذا الموظف من قبل اليوم",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("attendance").insert({
        employee_id: employeeId,
        date: selectedDate,
        check_in: new Date().toISOString(),
        status: "present",
      });

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم تسجيل الحضور وحساب اليومية بنجاح",
      });

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

  const handleViewProfile = (employeeId: string) => {
    navigate(`/employee-profile/${employeeId}`);
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
          اختر الموظف لتسجيل حضوره اليوم وحساب يوميته
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
        <div className="space-y-3">
          {employees.map((employee) => {
            const hasAttendance = attendanceRecords.some(
              (record) => record.employee_id === employee.id
            );

            return (
              <div
                key={employee.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{employee.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {employee.position}
                  </p>
                </div>
                <Button
                  onClick={() => handleCheckIn(employee.id)}
                  size="sm"
                  disabled={hasAttendance}
                  className={`ml-2 ${
                    hasAttendance
                      ? "bg-gray-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {hasAttendance ? (
                    <>
                      <CheckCircle className="w-4 h-4 ml-1" />
                      مسجل
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 ml-1" />
                      حضور
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background p-3" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
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
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 ml-2" />
                      تسجيل حضور
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent dir="rtl" className="h-[90vh] overflow-y-auto">
                    <DrawerHeader>
                      <DrawerTitle>تسجيل حضور موظف</DrawerTitle>
                      <DrawerDescription>
                        اختر الموظف لتسجيل حضوره اليوم وحساب يوميته
                      </DrawerDescription>
                    </DrawerHeader>
                    <div className="px-4">
                      <div className="max-h-[70vh] overflow-y-auto pr-1 -mr-1">
                        <div className="space-y-3">
                          {employees.map((employee) => {
                            const hasAttendance = attendanceRecords.some(
                              (record) => record.employee_id === employee.id
                            );

                            return (
                              <div
                                key={employee.id}
                                className="flex items-center justify-between p-3 border rounded-lg"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium truncate">
                                    {employee.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {employee.position}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => handleCheckIn(employee.id)}
                                  size="sm"
                                  disabled={hasAttendance}
                                  className={`ml-2 ${
                                    hasAttendance
                                      ? "bg-gray-400"
                                      : "bg-green-600 hover:bg-green-700"
                                  }`}
                                >
                                  {hasAttendance ? (
                                    <>
                                      <CheckCircle className="w-4 h-4 ml-1" />
                                      مسجل
                                    </>
                                  ) : (
                                    <>
                                      <LogIn className="w-4 h-4 ml-1" />
                                      حضور
                                    </>
                                  )}
                                </Button>
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
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      <Plus className="w-4 h-4 ml-2" />
                      تسجيل حضور
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md mx-auto" dir="rtl">
                    <CheckInDialogContent />
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        إجمالي الموظفين
                      </p>
                      <p className="text-xl font-bold">{employees.length}</p>
                    </div>
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">الحاضرون</p>
                      <p className="text-xl font-bold text-green-600">
                        {presentCount}
                      </p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">الغائبون</p>
                      <p className="text-xl font-bold text-red-600">
                        {absentCount}
                      </p>
                    </div>
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        معدل الحضور
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {attendanceRate}%
                      </p>
                    </div>
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="w-5 h-5" />
                  تصفية النتائج
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      التاريخ
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
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
                      <SelectTrigger className="text-sm">
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

            {/* Attendance Records */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">سجل الحضور اليومي</CardTitle>
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
                  <div className="p-4 space-y-3">
                    {filteredRecords.map((record) => (
                      <AttendanceCard
                        key={record.id}
                        record={record}
                        onEdit={handleEditRecord}
                        onViewProfile={handleViewProfile}
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

        {/* Edit Record Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent
            className="max-w-sm mx-2 max-h-[90vh] overflow-y-auto"
            dir="rtl"
          >
            <DialogHeader>
              <DialogTitle className="text-lg">تعديل سجل الحضور</DialogTitle>
              <DialogDescription className="text-sm">
                يمكنك تعديل الخصومات والمكافآت والملاحظات
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
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
                  className="mt-1"
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
                  className="mt-1"
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
                  className="mt-1"
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
                  className="rounded"
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
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSaveEdit} className="flex-1 text-sm">
                  حفظ التعديلات
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="flex-1 text-sm"
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Attendance;
