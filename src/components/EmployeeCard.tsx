import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Minus,
  Clock,
  Calculator,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

interface EmployeeStats {
  totalEarnings: number;
  totalWithdrawals: number;
  currentBalance: number;
  presentDays: number;
  totalPaidThisMonth: number;
  finalBalance: number;
}

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard = ({ employee }: EmployeeCardProps) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<EmployeeStats>({
    totalEarnings: 0,
    totalWithdrawals: 0,
    currentBalance: 0,
    presentDays: 0,
    totalPaidThisMonth: 0,
    finalBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchEmployeeStats = async () => {
    try {
      // تحديد الشهر الحالي
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      const firstDay = new Date(currentYear, currentMonth, 1);
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);
      const firstDayStr = firstDay.toISOString().split("T")[0];
      const nextMonthStr = nextMonth.toISOString().split("T")[0];

      // جلب بيانات الحضور
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("daily_wage_earned, bonus_amount, deduction_amount")
        .eq("employee_id", employee.id)
        .gte("date", firstDayStr)
        .lt("date", nextMonthStr)
        .eq("status", "present");

      // جلب بيانات المسحوبات
      const { data: withdrawalsData } = await supabase
        .from("employee_withdrawals")
        .select("amount")
        .eq("employee_id", employee.id)
        .gte("withdrawal_date", firstDayStr)
        .lt("withdrawal_date", nextMonthStr);

      // جلب بيانات مدفوعات الرواتب
      const { data: paymentsData } = await supabase
        .from("salary_payments")
        .select("amount_paid")
        .eq("employee_id", employee.id)
        .gte("payment_date", firstDayStr)
        .lt("payment_date", nextMonthStr);

      // حساب الإحصائيات
      const totalEarnings = (attendanceData || []).reduce(
        (sum, record) =>
          sum +
          (record.daily_wage_earned || 0) +
          (record.bonus_amount || 0) -
          (record.deduction_amount || 0),
        0
      );
      const totalWithdrawals = (withdrawalsData || []).reduce(
        (sum, record) => sum + record.amount,
        0
      );
      const totalPaidThisMonth = (paymentsData || []).reduce(
        (sum, record) => sum + record.amount_paid,
        0
      );
      const presentDays = attendanceData?.length || 0;
      const currentBalance = totalEarnings - totalWithdrawals;
      const finalBalance = currentBalance - totalPaidThisMonth;

      setStats({
        totalEarnings,
        totalWithdrawals,
        currentBalance,
        presentDays,
        totalPaidThisMonth,
        finalBalance,
      });
    } catch (error) {
      console.error("Error fetching employee stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeStats();
  }, [employee.id]);

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} د.ل`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-green-100 text-green-700">
                {getInitials(employee.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">
                {employee.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {employee.position}
              </p>
            </div>
          </div>
          <Badge
            variant={employee.status === "active" ? "default" : "secondary"}
          >
            {employee.status === "active" ? "نشط" : "غير نشط"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Info */}
        <div className="space-y-2">
          {employee.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="truncate">{employee.email}</span>
            </div>
          )}
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span>{employee.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span>
              تاريخ التوظيف:{" "}
              {new Date(employee.hire_date).toLocaleDateString("ar-LY")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-muted-foreground" />
            <span>
              الراتب:{" "}
              {employee.salary ? formatCurrency(employee.salary) : "غير محدد"}
            </span>
          </div>
        </div>

        {/* Financial Summary */}
        {!loading && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">
              الملخص المالي للشهر الحالي
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-600" />
                <span>إجمالي الكسب:</span>
                <span className="font-medium text-green-600">
                  {formatCurrency(stats.totalEarnings)}
                </span>
              </div>

              {stats.totalWithdrawals > 0 && (
                <div className="flex items-center gap-1">
                  <Minus className="w-3 h-3 text-red-600" />
                  <span>المسحوبات:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(stats.totalWithdrawals)}
                  </span>
                </div>
              )}

              {stats.totalPaidThisMonth > 0 && (
                <div className="flex items-center gap-1">
                  <Minus className="w-3 h-3 text-red-600" />
                  <span>المدفوعات:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(stats.totalPaidThisMonth)}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 col-span-2">
                <Calculator className="w-3 h-3 text-blue-600" />
                <span>أيام العمل:</span>
                <span className="font-medium">{stats.presentDays} يوم</span>
              </div>
            </div>

            <hr className="my-2" />

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">الرصيد النهائي:</span>
              <span
                className={`font-bold text-sm ${
                  stats.finalBalance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {stats.finalBalance >= 0 ? "+" : ""}
                {formatCurrency(stats.finalBalance)}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/employees/${employee.id}`)}
          >
            <User className="w-4 h-4 ml-2" />
            عرض التفاصيل
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/attendance")}
          >
            <Clock className="w-4 h-4" />
            الحضور
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};