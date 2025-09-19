import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, DollarSign, Clock, User } from "lucide-react";
import {
  useDeleteAttendance,
  useUpdateAttendance,
} from "@/hooks/useAttendance";
import EnhancedWithdrawalManagementModal from "./EnhancedWithdrawalManagementModal";

interface AttendanceRecord {
  id: string;
  employee_id: string;
  check_in?: string;
  check_out?: string;
  status: string;
  notes?: string;
  employees: {
    id: string;
    name: string;
    position: string;
    salary: number;
  };
}

interface AttendanceManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendanceRecord: AttendanceRecord | null;
  onAttendanceUpdated: () => void;
}

const AttendanceManagementModal = ({
  open,
  onOpenChange,
  attendanceRecord,
  onAttendanceUpdated,
}: AttendanceManagementModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editCheckIn, setEditCheckIn] = useState("");
  const [editCheckOut, setEditCheckOut] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  const deleteAttendance = useDeleteAttendance();
  const updateAttendance = useUpdateAttendance();

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US");
  };

  const handleDeleteAttendance = () => {
    if (!attendanceRecord) return;

    if (confirm("هل أنت متأكد من حذف سجل الحضور هذا؟")) {
      deleteAttendance.mutate(attendanceRecord.id, {
        onSuccess: () => {
          onAttendanceUpdated();
          onOpenChange(false);
        },
      });
    }
  };

  const handleEditAttendance = () => {
    if (!attendanceRecord) return;

    setIsEditing(true);
    setEditCheckIn(
      attendanceRecord.check_in ? formatTime(attendanceRecord.check_in) : ""
    );
    setEditCheckOut(
      attendanceRecord.check_out ? formatTime(attendanceRecord.check_out) : ""
    );
    setEditStatus(attendanceRecord.status);
    setEditNotes(attendanceRecord.notes || "");
  };

  const handleUpdateAttendance = () => {
    if (!attendanceRecord) return;

    const updateData: any = {
      id: attendanceRecord.id,
      status: editStatus,
      notes: editNotes,
    };

    // Parse time inputs
    if (editCheckIn) {
      const [hours, minutes] = editCheckIn.split(":");
      const checkInDate = new Date();
      checkInDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      updateData.check_in = checkInDate.toISOString();
    }

    if (editCheckOut) {
      const [hours, minutes] = editCheckOut.split(":");
      const checkOutDate = new Date();
      checkOutDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      updateData.check_out = checkOutDate.toISOString();
    }

    updateAttendance.mutate(updateData, {
      onSuccess: () => {
        setIsEditing(false);
        onAttendanceUpdated();
      },
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      present: "bg-green-100 text-green-800",
      absent: "bg-red-100 text-red-800",
      late: "bg-yellow-100 text-yellow-800",
      half_day: "bg-orange-100 text-orange-800",
    };
    return colors[status as keyof typeof colors] || colors.present;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      present: "حاضر",
      absent: "غائب",
      late: "متأخر",
      half_day: "نصف يوم",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (!attendanceRecord) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[95vw] max-w-[600px] h-[90vh] max-h-[700px] p-0 overflow-hidden sm:max-w-[600px] sm:h-[90vh] sm:max-h-[700px]"
          dir="rtl"
        >
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <span className="block">إدارة الموظف</span>
                <span className="text-sm font-normal text-blue-100">
                  {attendanceRecord.employees.name}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Employee Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {attendanceRecord.employees.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-gray-900 truncate">
                      {attendanceRecord.employees.name}
                    </h3>
                    <p className="text-sm text-blue-600 truncate">
                      {attendanceRecord.employees.position}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      الراتب:{" "}
                      {attendanceRecord.employees.salary?.toFixed(2) || 0} د.ل
                    </p>
                  </div>
                  <Badge
                    className={`${getStatusColor(
                      attendanceRecord.status
                    )} px-3 py-1 text-sm font-medium`}
                  >
                    {getStatusLabel(attendanceRecord.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {isEditing ? (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Edit className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-orange-800">
                      تعديل بيانات الحضور
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="check-in"
                          className="text-sm font-medium text-gray-700"
                        >
                          وقت الحضور
                        </Label>
                        <Input
                          id="check-in"
                          type="time"
                          value={editCheckIn}
                          onChange={(e) => setEditCheckIn(e.target.value)}
                          className="h-11 mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="check-out"
                          className="text-sm font-medium text-gray-700"
                        >
                          وقت الانصراف
                        </Label>
                        <Input
                          id="check-out"
                          type="time"
                          value={editCheckOut}
                          onChange={(e) => setEditCheckOut(e.target.value)}
                          className="h-11 mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-gray-700"
                      >
                        حالة الحضور
                      </Label>
                      <select
                        id="status"
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md h-11 text-sm mt-1 focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="present">حاضر</option>
                        <option value="absent">غائب</option>
                        <option value="late">متأخر</option>
                        <option value="half_day">نصف يوم</option>
                      </select>
                    </div>

                    <div>
                      <Label
                        htmlFor="notes"
                        className="text-sm font-medium text-gray-700"
                      >
                        ملاحظات إضافية
                      </Label>
                      <Textarea
                        id="notes"
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder="أدخل أي ملاحظات حول الحضور..."
                        className="min-h-[100px] text-sm mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <Button
                        onClick={handleUpdateAttendance}
                        disabled={updateAttendance.isPending}
                        className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                      >
                        {updateAttendance.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            جاري التحديث...
                          </div>
                        ) : (
                          "حفظ التغييرات"
                        )}
                      </Button>
                      <Button
                        onClick={() => setIsEditing(false)}
                        variant="outline"
                        className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Attendance Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="border-green-200 bg-green-50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-800 mb-1">
                        وقت الحضور
                      </p>
                      <p className="text-lg font-bold text-green-900">
                        {attendanceRecord.check_in
                          ? formatTime(attendanceRecord.check_in)
                          : "غير محدد"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-red-200 bg-red-50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Clock className="w-6 h-6 text-red-600" />
                      </div>
                      <p className="text-sm font-medium text-red-800 mb-1">
                        وقت الانصراف
                      </p>
                      <p className="text-lg font-bold text-red-900">
                        {attendanceRecord.check_out
                          ? formatTime(attendanceRecord.check_out)
                          : "غير محدد"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {attendanceRecord.notes && (
                  <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            📝
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                          ملاحظات
                        </p>
                      </div>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border">
                        {attendanceRecord.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Button
                    onClick={handleEditAttendance}
                    variant="outline"
                    className="h-12 sm:h-12 text-sm font-medium border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">تعديل البيانات</span>
                    <span className="sm:hidden">تعديل</span>
                  </Button>
                  <Button
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    className="h-12 sm:h-12 text-sm font-medium bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span className="hidden sm:inline">إدارة السحوبات</span>
                    <span className="sm:hidden">السحوبات</span>
                  </Button>
                  <Button
                    onClick={handleDeleteAttendance}
                    variant="destructive"
                    className="h-12 sm:h-12 text-sm font-medium bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">حذف السجل</span>
                    <span className="sm:hidden">حذف</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Withdrawal Management Modal */}
      <EnhancedWithdrawalManagementModal
        open={isWithdrawalModalOpen}
        onOpenChange={setIsWithdrawalModalOpen}
        employeeId={attendanceRecord.employees.id}
        employeeName={attendanceRecord.employees.name}
        currentBalance={
          attendanceRecord.daily_wage_earned +
          (attendanceRecord.bonus_amount || 0) -
          (attendanceRecord.deduction_amount || 0)
        }
      />
    </>
  );
};

export default AttendanceManagementModal;
