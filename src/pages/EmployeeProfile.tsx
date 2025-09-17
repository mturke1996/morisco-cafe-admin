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
  Edit,
  Minus,
  Plus,
  Calculator,
  Receipt,
  BarChart3,
  Target,
  Wallet,
  CreditCard,
  Eye,
  Trash2,
  Download,
  Upload,
  FileText,
  History,
  Settings,
  Star,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  PieChart,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAutoRedirect } from "@/hooks/useAutoRedirect";
import { supabase } from "@/integrations/supabase/client";
import { useEmployeeBalance } from "@/hooks/useEmployeeFinancials";
import EnhancedWithdrawalManagementModal from "@/components/EnhancedWithdrawalManagementModal";
import WithdrawalHistoryCard from "@/components/WithdrawalHistoryCard";
import EmployeeSalaryPaymentModal from "@/components/EmployeeSalaryPaymentModal";
import { EditEmployeeModal } from "@/components/EditEmployeeModal";

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

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto redirect after 30 minutes of inactivity
  useAutoRedirect({ timeoutMinutes: 30, redirectTo: "/", enabled: true });

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isSalaryPaymentModalOpen, setIsSalaryPaymentModalOpen] =
    useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);

  const { data: balanceData, isLoading: balanceLoading } = useEmployeeBalance(
    employeeId || ""
  );

  useEffect(() => {
    if (employeeId) {
      fetchEmployee();
      fetchAttendanceHistory();
      fetchWithdrawalHistory();
      fetchSalaryHistory();
    }
  }, [employeeId]);

  const fetchEmployee = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single();

      if (error) throw error;
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الموظف",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employeeId)
        .order("date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setAttendanceHistory(data || []);
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_withdrawals")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setWithdrawalHistory(data || []);
    } catch (error) {
      console.error("Error fetching withdrawal history:", error);
    }
  };

  const fetchSalaryHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("salary_payments")
        .select("*")
        .eq("employee_id", employeeId)
        .order("payment_date", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSalaryHistory(data || []);
    } catch (error) {
      console.error("Error fetching salary history:", error);
    }
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "inactive":
        return "غير نشط";
      default:
        return "غير محدد";
    }
  };

  const getAttendanceStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800";
      case "absent":
        return "bg-red-100 text-red-800";
      case "late":
        return "bg-yellow-100 text-yellow-800";
      case "half_day":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAttendanceStatusLabel = (status: string) => {
    switch (status) {
      case "present":
        return "حاضر";
      case "absent":
        return "غائب";
      case "late":
        return "متأخر";
      case "half_day":
        return "نصف يوم";
      default:
        return "غير محدد";
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employee || !confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;

    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employee.id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الموظف بنجاح",
      });

      navigate("/employees");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الموظف",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <Clock className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              جاري تحميل البيانات...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background p-3 sm:p-6" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">الموظف غير موجود</h3>
            <p className="text-muted-foreground text-sm mb-6">
              الموظف المطلوب غير موجود أو تم حذفه
            </p>
            <Button onClick={() => navigate("/employees")} variant="outline">
              <ArrowLeft className="w-4 h-4 ml-2" />
              العودة للموظفين
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentBalance = balanceData?.currentBalance || 0;
  const totalEarnings = balanceData?.totalEarnings || 0;
  const totalWithdrawals = balanceData?.totalWithdrawals || 0;
  const totalPaid = balanceData?.totalPaid || 0;
  const presentDays = balanceData?.presentDays || 0;

  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 lg:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/employees")}
              className="flex items-center gap-2 h-9"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">العودة للموظفين</span>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                <User className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-blue-600" />
                <span className="truncate">ملف الموظف</span>
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base truncate">
                {employee.name} - {employee.position}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center gap-2 h-9 text-xs sm:text-sm"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">تعديل</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteEmployee}
              className="flex items-center gap-2 h-9 text-red-600 hover:text-red-700 text-xs sm:text-sm"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">حذف</span>
            </Button>
          </div>
        </div>

        {/* Tabs - Mobile Optimized */}
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {[
            { id: "overview", label: "نظرة عامة", icon: BarChart3 },
            { id: "attendance", label: "الحضور", icon: Clock },
            { id: "financial", label: "المالية", icon: DollarSign },
            { id: "history", label: "السجل", icon: History },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 h-9 text-xs sm:text-sm"
            >
              <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Employee Info Card - Mobile Optimized */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  البيانات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg truncate">
                          {employee.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {employee.position}
                        </p>
                        <Badge className={getStatusColor(employee.status)}>
                          {getStatusLabel(employee.status)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    {employee.email && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">البريد:</span>
                        <span className="truncate">{employee.email}</span>
                      </div>
                    )}
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">الهاتف:</span>
                        <span>{employee.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        تاريخ التوظيف:
                      </span>
                      <span>{formatDate(employee.hire_date)}</span>
                    </div>
                  </div>

                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        الراتب الشهري:
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(employee.salary)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        أيام الحضور:
                      </span>
                      <span className="font-semibold">{presentDays} يوم</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Overview - Mobile Optimized */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-green-600 font-medium">
                        إجمالي الأرباح
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-green-800">
                        {formatCurrency(totalEarnings)}
                      </p>
                    </div>
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-red-600 font-medium">
                        إجمالي السحوبات
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-red-800">
                        {formatCurrency(totalWithdrawals)}
                      </p>
                    </div>
                    <Minus className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-blue-600 font-medium">
                        المدفوع
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-blue-800">
                        {formatCurrency(totalPaid)}
                      </p>
                    </div>
                    <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-purple-600 font-medium">
                        الرصيد الحالي
                      </p>
                      <p
                        className={`text-lg sm:text-xl font-bold ${
                          currentBalance >= 0
                            ? "text-purple-800"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(currentBalance)}
                      </p>
                    </div>
                    <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  سجل الحضور الأخير
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendanceHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد سجلات حضور</p>
                    </div>
                  ) : (
                    attendanceHistory.map((record: any) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {formatDate(record.date)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {record.check_in && formatTime(record.check_in)} -{" "}
                              {record.check_out && formatTime(record.check_out)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          className={getAttendanceStatusColor(record.status)}
                        >
                          {getAttendanceStatusLabel(record.status)}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Financial Tab */}
        {activeTab === "financial" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Button
                onClick={() => setIsWithdrawalModalOpen(true)}
                className="h-12 bg-orange-600 hover:bg-orange-700"
              >
                <Minus className="w-5 h-5 ml-2" />
                إدارة السحوبات
              </Button>
              <Button
                onClick={() => setIsSalaryPaymentModalOpen(true)}
                className="h-12 bg-green-600 hover:bg-green-700"
              >
                <CreditCard className="w-5 h-5 ml-2" />
                دفع المرتب
              </Button>
            </div>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  ملخص الأداء المالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-sm">
                        إجمالي الأرباح هذا الشهر
                      </span>
                    </div>
                    <span className="font-bold text-green-600">
                      {formatCurrency(totalEarnings)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Minus className="w-5 h-5 text-red-600" />
                      <span className="font-medium text-sm">
                        إجمالي السحوبات هذا الشهر
                      </span>
                    </div>
                    <span className="font-bold text-red-600">
                      {formatCurrency(totalWithdrawals)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-sm">
                        إجمالي المدفوعات هذا الشهر
                      </span>
                    </div>
                    <span className="font-bold text-blue-600">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-sm">
                        الرصيد المتبقي
                      </span>
                    </div>
                    <span
                      className={`font-bold text-lg ${
                        currentBalance >= 0 ? "text-purple-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(currentBalance)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div className="space-y-4 sm:space-y-6">
            {/* Enhanced Withdrawal History */}
            <WithdrawalHistoryCard
              employeeId={employee.id}
              employeeName={employee.name}
              currentBalance={currentBalance}
            />

            {/* Salary History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  سجل المدفوعات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {salaryHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد مدفوعات</p>
                    </div>
                  ) : (
                    salaryHistory.map((payment: any) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CreditCard className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {formatDate(payment.payment_date)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.notes || "بدون ملاحظات"}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-green-600">
                          {formatCurrency(payment.amount_paid)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modals */}
      <EnhancedWithdrawalManagementModal
        open={isWithdrawalModalOpen}
        onOpenChange={setIsWithdrawalModalOpen}
        employeeId={employee.id}
        employeeName={employee.name}
        currentBalance={currentBalance}
      />

      <EmployeeSalaryPaymentModal
        open={isSalaryPaymentModalOpen}
        onOpenChange={setIsSalaryPaymentModalOpen}
        employeeId={employee.id}
        employeeName={employee.name}
        currentBalance={currentBalance}
        employeeSalary={employee.salary}
      />

      <EditEmployeeModal
        employee={employee}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEmployeeUpdated={fetchEmployee}
      />
    </div>
  );
};

export default EmployeeProfile;
