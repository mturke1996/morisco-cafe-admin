import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Edit,
  Minus,
  Plus,
  Calculator,
  Receipt,
  BarChart3,
  Target,
  Wallet,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SalaryPaymentModal } from "@/components/SalaryPaymentModal";
import { AddWithdrawalModal } from "@/components/AddWithdrawalModal";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";
import { EmployeeReportGenerator } from "@/components/EmployeeReportGenerator";
import { ImprovedAttendanceModal } from "@/components/ImprovedAttendanceModal";
import { EmployeeNotesModal } from "@/components/EmployeeNotesModal";
import { EmployeeAdjustmentsModal } from "@/components/EmployeeAdjustmentsModal";
import { AdvancedShiftsModal } from "@/components/AdvancedShiftsModal";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  hire_date: string;
  status: string;
  employment_type: 'shift_based' | 'full_time' | 'part_time';
  work_schedule?: any;
  contract_start_date?: string;
  contract_end_date?: string;
  emergency_contact?: string;
  id_number?: string;
  bank_account?: string;
  social_security_number?: string;
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

interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  total_earnings: number;
  total_deductions: number;
  total_bonuses: number;
}

interface WithdrawalRecord {
  id: string;
  employee_id: string;
  amount: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
}

interface SalaryPayment {
  id: string;
  employee_id: string;
  amount_paid: number;
  payment_date: string;
  period_start: string;
  period_end: string;
  notes: string | null;
  created_at: string;
}

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    total_earnings: 0,
    total_deductions: 0,
    total_bonuses: 0,
  });
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<SalaryPayment[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showAdjustmentsModal, setShowAdjustmentsModal] = useState(false);
  const [showShiftsModal, setShowShiftsModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteEmployee = async () => {
    if (!employee) return;

    try {
      // حذف الموظف من قاعدة البيانات
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employee.id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الموظف بنجاح",
      });

      // العودة إلى صفحة الموظفين
      navigate("/employees");
    } catch (error) {
      console.error("خطأ في حذف الموظف:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الموظف",
        variant: "destructive",
      });
    }
  };

  const handleEmployeeUpdated = () => {
    fetchEmployeeData();
    setShowEditModal(false);
  };

  const handleAttendanceRecorded = () => {
    fetchEmployeeData();
    setShowAttendanceModal(false);
  };

  const handlePaymentCompleted = () => {
    fetchEmployeeData();
    setShowPaymentModal(false);
  };

  const handleWithdrawalAdded = () => {
    fetchEmployeeData();
    setShowWithdrawalModal(false);
  };

  const handleReportGenerated = () => {
    setShowReportModal(false);
  };

  const handleNotesModalClose = () => {
    setShowNotesModal(false);
  };

  const handleAdjustmentsModalClose = () => {
    setShowAdjustmentsModal(false);
  };

  const handleShiftsModalClose = () => {
    setShowShiftsModal(false);
  };

  const fetchEmployeeData = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      // Fetch employee basic info
      const { data: employeeData, error: employeeError } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (employeeError) throw employeeError;
      setEmployee(employeeData);

      // Fetch employee profile
      const { data: profileData, error: profileError } = await supabase
        .from("employee_profiles")
        .select("*")
        .eq("employee_id", employeeId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile fetch error:", profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Calculate current month date range
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      const firstDay = new Date(currentYear, currentMonth, 1);
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);

      const firstDayStr = firstDay.toISOString().split("T")[0];
      const nextMonthStr = nextMonth.toISOString().split("T")[0];

      // Fetch attendance data for current month
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .gte("date", firstDayStr)
        .lt("date", nextMonthStr);

      if (attendanceError) {
        console.error("Attendance fetch error:", attendanceError);
      } else if (attendanceData) {
        const stats = attendanceData.reduce(
          (acc, record) => {
            acc.total_days++;
            if (record.status === "present") {
              acc.present_days++;
              acc.total_earnings += record.daily_wage_earned || 0;
              acc.total_deductions += record.deduction_amount || 0;
              acc.total_bonuses += record.bonus_amount || 0;
            } else {
              acc.absent_days++;
            }
            return acc;
          },
          {
            total_days: 0,
            present_days: 0,
            absent_days: 0,
            total_earnings: 0,
            total_deductions: 0,
            total_bonuses: 0,
          } as AttendanceStats
        );

        setAttendanceStats(stats);
      }

      // Fetch withdrawals for current month
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from("employee_withdrawals")
        .select("*")
        .eq("employee_id", employeeId)
        .gte("withdrawal_date", firstDayStr)
        .lt("withdrawal_date", nextMonthStr)
        .order("withdrawal_date", { ascending: false });

      if (withdrawalsError) {
        console.error("Withdrawals fetch error:", withdrawalsError);
      } else {
        setWithdrawals(withdrawalsData || []);
      }

      // Fetch salary payments for current month
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("salary_payments")
        .select("*")
        .eq("employee_id", employeeId)
        .gte("payment_date", firstDayStr)
        .lt("payment_date", nextMonthStr)
        .order("payment_date", { ascending: false });

      if (paymentsError) {
        console.error("Salary payments fetch error:", paymentsError);
      } else {
        setSalaryPayments(paymentsData || []);
      }
    } catch (error) {
      console.error("خطأ في جلب بيانات الموظف:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الموظف",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId]);

  const handlePaymentComplete = () => {
    fetchEmployeeData();
  };

  const handleWithdrawalComplete = () => {
    fetchEmployeeData();
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-background p-3 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <User className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            جاري تحميل بيانات الموظف...
          </p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div
        className="min-h-screen bg-background p-3 flex items-center justify-center"
        dir="rtl"
      >
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            لم يتم العثور على الموظف
          </h3>
          <Button onClick={() => navigate("/employees")} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للموظفين
          </Button>
        </div>
      </div>
    );
  }

  const attendanceRate =
    attendanceStats.total_days > 0
      ? Math.round(
          (attendanceStats.present_days / attendanceStats.total_days) * 100
        )
      : 0;

  // حساب صحيح للمرتب - ضرب عدد الأيام في اليومية
  const dailyWage =
    profile?.daily_wage || (employee.salary ? employee.salary / 30 : 0);
  const calculatedEarnings = attendanceStats.present_days * dailyWage;
  const netEarnings =
    calculatedEarnings +
    attendanceStats.total_bonuses -
    attendanceStats.total_deductions;

  // حساب المسحوبات والرصيد الحالي
  const totalWithdrawals = withdrawals.reduce(
    (sum, withdrawal) => sum + withdrawal.amount,
    0
  );
  const currentBalance = netEarnings - totalWithdrawals;

  // حساب إجمالي المدفوعات لهذا الشهر
  const totalPaidThisMonth = salaryPayments.reduce(
    (sum, payment) => sum + payment.amount_paid,
    0
  );

  // الرصيد النهائي بعد خصم المدفوعات
  const finalBalance = currentBalance - totalPaidThisMonth;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/employees")}
              variant="outline"
              size="sm"
              className="p-2 h-10 w-10 rounded-full hover:bg-slate-100 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                ملف الموظف
              </h1>
              <p className="text-sm text-muted-foreground">
                معلومات وإحصائيات الموظف
              </p>
            </div>
          </div>
        </div>

        {/* Employee Basic Info */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-green-800">
                    {employee.name}
                  </h2>
                  <p className="text-sm text-green-600 font-medium">
                    {employee.position}
                  </p>
                </div>
              </div>
              <Badge
                variant={employee.status === "active" ? "default" : "secondary"}
                className="text-xs sm:text-sm px-3 py-1 h-auto"
              >
                {employee.status === "active" ? "نشط" : "غير نشط"}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {employee.email && (
                <div className="flex items-center gap-2 text-sm bg-white/50 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">
                    {employee.email}
                  </span>
                </div>
              )}

              {employee.phone && (
                <div className="flex items-center gap-2 text-sm bg-white/50 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 font-medium">
                    {employee.phone}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm bg-white/50 p-2 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">
                  {employee.salary ? `${employee.salary} د.ل` : "غير محدد"}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm bg-white/50 p-2 rounded-lg">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-medium">
                  تاريخ التوظيف:{" "}
                  {new Date(employee.hire_date).toLocaleDateString("ar-LY")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    أيام الحضور
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-blue-800">
                    {attendanceStats.present_days}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-md transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-purple-600 font-medium">
                    معدل الحضور
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-purple-800">
                    {attendanceRate}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-green-600 font-medium">
                    اليومية
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-800">
                    {dailyWage.toFixed(2)} د.ل
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-md transition-all duration-300">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-orange-600 font-medium">
                    الرصيد النهائي
                  </p>
                  <p
                    className={`text-lg sm:text-xl font-bold ${
                      finalBalance >= 0 ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {finalBalance >= 0 ? "+" : ""}
                    {finalBalance.toFixed(2)} د.ل
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:shadow-lg transition-all duration-300">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-800">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              الملخص المالي للشهر الحالي
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            {/* Basic Calculations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-3 bg-white/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">أيام العمل</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {attendanceStats.present_days}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 font-medium">اليومية</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {dailyWage.toFixed(2)} د.ل
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center gap-1">
                  <Plus className="w-4 h-4 text-green-600" />
                  إجمالي الكسب ({attendanceStats.present_days} ×{" "}
                  {dailyWage.toFixed(2)})
                </span>
                <span className="font-semibold text-green-600">
                  +{calculatedEarnings.toFixed(2)} د.ل
                </span>
              </div>

              {attendanceStats.total_bonuses > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Plus className="w-4 h-4 text-green-600" />
                    المكافآت
                  </span>
                  <span className="font-semibold text-green-600">
                    +{attendanceStats.total_bonuses.toFixed(2)} د.ل
                  </span>
                </div>
              )}

              {attendanceStats.total_deductions > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center gap-1">
                    <Minus className="w-4 h-4 text-red-600" />
                    الخصومات
                  </span>
                  <span className="font-semibold text-red-600">
                    -{attendanceStats.total_deductions.toFixed(2)} د.ل
                  </span>
                </div>
              )}

              <hr className="my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span>صافي الكسب</span>
                <span className="text-primary">
                  {netEarnings.toFixed(2)} د.ل
                </span>
              </div>

              {totalWithdrawals > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-1">
                      <Minus className="w-4 h-4 text-red-600" />
                      المسحوبات
                    </span>
                    <span className="font-semibold text-red-600">
                      -{totalWithdrawals.toFixed(2)} د.ل
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>الرصيد الحالي</span>
                    <span
                      className={
                        currentBalance >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {currentBalance >= 0 ? "+" : ""}
                      {currentBalance.toFixed(2)} د.ل
                    </span>
                  </div>
                </>
              )}

              {totalPaidThisMonth > 0 && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-1">
                      <Minus className="w-4 h-4 text-red-600" />
                      المدفوعات هذا الشهر
                    </span>
                    <span className="font-semibold text-red-600">
                      -{totalPaidThisMonth.toFixed(2)} د.ل
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>الرصيد النهائي</span>
                    <span
                      className={
                        finalBalance >= 0 ? "text-green-600" : "text-red-600"
                      }
                    >
                      {finalBalance >= 0 ? "+" : ""}
                      {finalBalance.toFixed(2)} د.ل
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowWithdrawalModal(true)}
                variant="outline"
                className="flex-1"
              >
                <Minus className="w-4 h-4 ml-2" />
                سحب مبلغ
              </Button>
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="flex-1"
                disabled={finalBalance <= 0}
              >
                <DollarSign className="w-4 h-4 ml-2" />
                دفع راتب
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        {withdrawals.length > 0 && (
          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-red-800 text-lg sm:text-xl">
                <Minus className="w-5 h-5 sm:w-6 sm:h-6" />
                سجل المسحوبات للشهر الحالي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-bold text-red-600 text-lg">
                        -{withdrawal.amount.toFixed(2)} د.ل
                      </span>
                      <span className="text-sm text-red-500 font-medium">
                        {new Date(
                          withdrawal.withdrawal_date
                        ).toLocaleDateString("ar-LY")}
                      </span>
                    </div>
                    {withdrawal.notes && (
                      <p className="text-xs text-red-400 mt-2 bg-red-50 p-2 rounded">
                        {withdrawal.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Salary Payments History */}
        {salaryPayments.length > 0 && (
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-green-800 text-lg sm:text-xl">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
                سجل مدفوعات الرواتب للشهر الحالي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
              {salaryPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-bold text-green-600 text-lg">
                        +{payment.amount_paid.toFixed(2)} د.ل
                      </span>
                      <span className="text-sm text-green-500 font-medium">
                        {new Date(payment.payment_date).toLocaleDateString(
                          "ar-LY"
                        )}
                      </span>
                    </div>
                    {payment.notes && (
                      <p className="text-xs text-green-400 mt-2 bg-green-50 p-2 rounded">
                        {payment.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Employee Profile Details */}
        {profile && (
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-lg sm:text-xl">
                <User className="w-5 h-5 sm:w-6 sm:h-6" />
                تفاصيل الملف الشخصي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/50 p-3 rounded-lg">
                  <span className="text-sm text-blue-600 font-medium block mb-1">
                    اليومية المحددة
                  </span>
                  <span className="text-lg font-bold text-blue-800">
                    {profile.daily_wage.toFixed(2)} د.ل
                  </span>
                </div>

                <div className="bg-white/50 p-3 rounded-lg">
                  <span className="text-sm text-blue-600 font-medium block mb-1">
                    إجمالي ساعات العمل
                  </span>
                  <span className="text-lg font-bold text-blue-800">
                    {profile.total_work_hours.toFixed(1)} ساعة
                  </span>
                </div>

                <div className="bg-white/50 p-3 rounded-lg">
                  <span className="text-sm text-blue-600 font-medium block mb-1">
                    المسحوبات الشهرية
                  </span>
                  <span className="text-lg font-bold text-blue-800">
                    {profile.monthly_withdrawals.toFixed(2)} د.ل
                  </span>
                </div>

                {profile.last_withdrawal_date && (
                  <div className="bg-white/50 p-3 rounded-lg">
                    <span className="text-sm text-blue-600 font-medium block mb-1">
                      آخر سحب
                    </span>
                    <span className="text-lg font-bold text-blue-800">
                      {new Date(
                        profile.last_withdrawal_date
                      ).toLocaleDateString("ar-LY")}
                    </span>
                  </div>
                )}
              </div>

              {profile.notes && (
                <div className="mt-4">
                  <p className="text-sm text-blue-600 font-medium mb-2">
                    ملاحظات:
                  </p>
                  <p className="text-sm bg-white p-3 rounded-md border-r-4 border-blue-400">
                    {profile.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Main Action Buttons - كل اثنين بجانب بعض */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowEditModal(true)}
              variant="outline"
              className="w-full h-14 text-base font-semibold border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
            >
              <Edit className="w-5 h-5 ml-2" />
              تعديل الموظف
            </Button>
            <Button
              onClick={() => setShowReportModal(true)}
              className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
            >
              <FileText className="w-5 h-5 ml-2" />
              إنشاء تقرير
            </Button>
          </div>

          {/* Advanced Management Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowNotesModal(true)}
              variant="outline"
              className="w-full h-14 text-base font-semibold border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
            >
              <FileText className="w-5 h-5 ml-2" />
              ملاحظات الموظف
            </Button>
            <Button
              onClick={() => setShowAdjustmentsModal(true)}
              className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
            >
              <DollarSign className="w-5 h-5 ml-2" />
              الإضافي والخصم
            </Button>
          </div>

          {/* Shifts and Financial Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowShiftsModal(true)}
              variant="outline"
              className="w-full h-14 text-base font-semibold border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
            >
              <Clock className="w-5 h-5 ml-2" />
              إدارة الورديات
            </Button>
            <Button
              onClick={() => setShowAttendanceModal(true)}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl"
            >
              <Calendar className="w-5 h-5 ml-2" />
              تسجيل الحضور
            </Button>
          </div>

          {/* Financial Action Buttons - كل اثنين بجانب بعض */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => setShowWithdrawalModal(true)}
              variant="outline"
              className="w-full h-14 text-base font-semibold border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
            >
              <Minus className="w-5 h-5 ml-2" />
              سحب مبلغ
            </Button>
            <Button
              onClick={() => setShowPaymentModal(true)}
              disabled={finalBalance <= 0}
              className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <DollarSign className="w-5 h-5 ml-2" />
              دفع راتب
            </Button>
          </div>

          {/* Delete Employee Button - زر منفصل */}
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="destructive"
            className="w-full h-14 text-base font-semibold border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-300 rounded-xl shadow-md hover:shadow-lg"
          >
            <Minus className="w-5 h-5 ml-2" />
            حذف الموظف
          </Button>
        </div>
      </div>

      {/* Modals */}
      <SalaryPaymentModal
        employee={employee}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        currentBalance={finalBalance}
        attendanceStats={attendanceStats}
        dailyWage={dailyWage}
        withdrawals={withdrawals}
      />

      <AddWithdrawalModal
        employee={employee}
        currentBalance={finalBalance}
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onWithdrawalComplete={handleWithdrawalAdded}
      />

      <EditEmployeeModal
        employee={employee}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEmployeeUpdated={handleEmployeeUpdated}
      />

      <EmployeeReportGenerator
        employee={employee}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
      />

      <ImprovedAttendanceModal
        employee={employee}
        isOpen={showAttendanceModal}
        onClose={() => setShowAttendanceModal(false)}
      />

      <EmployeeNotesModal
        employee={employee}
        isOpen={showNotesModal}
        onClose={handleNotesModalClose}
      />

      <EmployeeAdjustmentsModal
        employee={employee}
        isOpen={showAdjustmentsModal}
        onClose={handleAdjustmentsModalClose}
      />

      <AdvancedShiftsModal
        employee={employee}
        isOpen={showShiftsModal}
        onClose={handleShiftsModalClose}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Minus className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-600">
                تأكيد حذف الموظف
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                هل أنت متأكد من حذف الموظف{" "}
                <span className="font-semibold text-gray-800">
                  "{employee?.name}"
                </span>
                ؟
                <br />
                <span className="text-red-500 font-medium">
                  هذا الإجراء لا يمكن التراجع عنه.
                </span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleDeleteEmployee}
                variant="destructive"
                className="flex-1 h-12 text-base font-semibold"
              >
                <Minus className="w-4 h-4 ml-2" />
                حذف الموظف
              </Button>
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="outline"
                className="flex-1 h-12 text-base font-semibold border-2 hover:bg-slate-50"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
