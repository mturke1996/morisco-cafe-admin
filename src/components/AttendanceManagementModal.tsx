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
          className="w-[95vw] max-w-[500px] h-[90vh] max-h-[600px] p-4"
          dir="rtl"
        >
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <User className="w-5 h-5" />
              <span className="truncate">
                إدارة - {attendanceRecord.employees.name}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Employee Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-base truncate">
                      {attendanceRecord.employees.name}
                    </p>
                    <p className="text-sm text-blue-600 truncate">
                      {attendanceRecord.employees.position}
                    </p>
                  </div>
                  <Badge className={getStatusColor(attendanceRecord.status)}>
                    {getStatusLabel(attendanceRecord.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="check-in" className="text-sm">
                      وقت الحضور
                    </Label>
                    <Input
                      id="check-in"
                      type="time"
                      value={editCheckIn}
                      onChange={(e) => setEditCheckIn(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="check-out" className="text-sm">
                      وقت الانصراف
                    </Label>
                    <Input
                      id="check-out"
                      type="time"
                      value={editCheckOut}
                      onChange={(e) => setEditCheckOut(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="status" className="text-sm">
                    الحالة
                  </Label>
                  <select
                    id="status"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-3 border rounded-md h-10 text-sm"
                  >
                    <option value="present">حاضر</option>
                    <option value="absent">غائب</option>
                    <option value="late">متأخر</option>
                    <option value="half_day">نصف يوم</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="notes" className="text-sm">
                    ملاحظات
                  </Label>
                  <Textarea
                    id="notes"
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="ملاحظات الحضور..."
                    className="min-h-[80px] text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <Button
                    onClick={handleUpdateAttendance}
                    disabled={updateAttendance.isPending}
                    className="flex-1 h-10"
                  >
                    {updateAttendance.isPending
                      ? "جاري التحديث..."
                      : "حفظ التغييرات"}
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="flex-1 h-10"
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Attendance Times */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Clock className="w-5 h-5 mx-auto mb-2 text-green-600" />
                      <p className="text-xs text-muted-foreground mb-1">
                        وقت الحضور
                      </p>
                      <p className="font-semibold text-sm">
                        {attendanceRecord.check_in
                          ? formatTime(attendanceRecord.check_in)
                          : "غير محدد"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-3 text-center">
                      <Clock className="w-5 h-5 mx-auto mb-2 text-red-600" />
                      <p className="text-xs text-muted-foreground mb-1">
                        وقت الانصراف
                      </p>
                      <p className="font-semibold text-sm">
                        {attendanceRecord.check_out
                          ? formatTime(attendanceRecord.check_out)
                          : "غير محدد"}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {attendanceRecord.notes && (
                  <Card>
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        ملاحظات
                      </p>
                      <p className="text-sm">{attendanceRecord.notes}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <Button
                    onClick={handleEditAttendance}
                    variant="outline"
                    className="h-10 text-sm"
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    onClick={() => setIsWithdrawalModalOpen(true)}
                    className="h-10 text-sm"
                  >
                    <DollarSign className="w-4 h-4 ml-1" />
                    السحوبات
                  </Button>
                  <Button
                    onClick={handleDeleteAttendance}
                    variant="destructive"
                    className="h-10 text-sm"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
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
        currentBalance={attendanceRecord.employees.salary || 0} // Using salary as base balance
      />
    </>
  );
};

export default AttendanceManagementModal;
