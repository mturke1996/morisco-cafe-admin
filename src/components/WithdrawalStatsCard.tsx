import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Minus,
  DollarSign,
  TrendingDown,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawalStatsCardProps {
  selectedDate?: string;
}

interface WithdrawalStats {
  totalWithdrawals: number;
  totalAmount: number;
  averageAmount: number;
  employeeCount: number;
  todayWithdrawals: number;
  todayAmount: number;
  recentWithdrawals: Array<{
    id: string;
    amount: number;
    withdrawal_date: string;
    notes?: string;
    employees: {
      name: string;
      position: string;
    };
  }>;
}

const WithdrawalStatsCard = ({ selectedDate }: WithdrawalStatsCardProps) => {
  const [stats, setStats] = useState<WithdrawalStats>({
    totalWithdrawals: 0,
    totalAmount: 0,
    averageAmount: 0,
    employeeCount: 0,
    todayWithdrawals: 0,
    todayAmount: 0,
    recentWithdrawals: [],
  });
  const [loading, setLoading] = useState(true);

  const targetDate = selectedDate || new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetchWithdrawalStats();
  }, [targetDate]);

  const fetchWithdrawalStats = async () => {
    try {
      setLoading(true);

      // Get today's withdrawals
      const { data: todayData, error: todayError } = await supabase
        .from("employee_withdrawals")
        .select(
          `
          id,
          amount,
          withdrawal_date,
          notes,
          employees (
            name,
            position
          )
        `
        )
        .eq("withdrawal_date", targetDate);

      if (todayError) throw todayError;

      // Get all withdrawals for the month
      const startOfMonth = new Date(targetDate);
      startOfMonth.setDate(1);
      const endOfMonth = new Date(targetDate);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);

      const { data: monthData, error: monthError } = await supabase
        .from("employee_withdrawals")
        .select(
          `
          id,
          amount,
          withdrawal_date,
          notes,
          employees (
            name,
            position
          )
        `
        )
        .gte("withdrawal_date", startOfMonth.toISOString().split("T")[0])
        .lte("withdrawal_date", endOfMonth.toISOString().split("T")[0]);

      if (monthError) throw monthError;

      // Get unique employees who made withdrawals
      const uniqueEmployees = new Set(
        monthData?.map((w) => w.employees?.name).filter(Boolean) || []
      );

      // Calculate stats
      const todayAmount = todayData?.reduce((sum, w) => sum + w.amount, 0) || 0;
      const monthAmount = monthData?.reduce((sum, w) => sum + w.amount, 0) || 0;
      const averageAmount = monthData?.length
        ? monthAmount / monthData.length
        : 0;

      setStats({
        totalWithdrawals: monthData?.length || 0,
        totalAmount: monthAmount,
        averageAmount,
        employeeCount: uniqueEmployees.size,
        todayWithdrawals: todayData?.length || 0,
        todayAmount,
        recentWithdrawals: todayData?.slice(0, 5) || [],
      });
    } catch (error) {
      console.error("Error fetching withdrawal stats:", error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Minus className="w-5 h-5" />
            إحصائيات السحوبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Minus className="w-5 h-5" />
          إحصائيات السحوبات
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Minus className="w-4 h-4 text-red-600" />
                <span className="text-xs text-red-600">اليوم</span>
              </div>
              <p className="text-lg font-bold text-red-800">
                {stats.todayWithdrawals}
              </p>
              <p className="text-xs text-red-600">
                {formatCurrency(stats.todayAmount)}
              </p>
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingDown className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-orange-600">هذا الشهر</span>
              </div>
              <p className="text-lg font-bold text-orange-800">
                {stats.totalWithdrawals}
              </p>
              <p className="text-xs text-orange-600">
                {formatCurrency(stats.totalAmount)}
              </p>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-600">متوسط السحب</span>
              </div>
              <p className="text-lg font-bold text-blue-800">
                {formatCurrency(stats.averageAmount)}
              </p>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-600">الموظفين</span>
              </div>
              <p className="text-lg font-bold text-green-800">
                {stats.employeeCount}
              </p>
            </div>
          </div>

          {/* Recent Withdrawals */}
          {stats.recentWithdrawals.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                السحوبات اليومية
                <Badge variant="secondary" className="text-xs">
                  {stats.recentWithdrawals.length}
                </Badge>
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stats.recentWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm truncate">
                          {withdrawal.employees?.name || "غير محدد"}
                        </span>
                        <Badge variant="outline" className="text-xs bg-white">
                          {withdrawal.employees?.position || "موظف"}
                        </Badge>
                      </div>
                      {withdrawal.notes && (
                        <p className="text-xs text-muted-foreground truncate">
                          {withdrawal.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatDate(withdrawal.withdrawal_date)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(withdrawal.withdrawal_date)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600 text-lg">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-red-500">
                        <Minus className="w-3 h-3" />
                        <span>سحب</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No withdrawals message */}
          {stats.recentWithdrawals.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-sm font-medium">لا توجد سحوبات اليوم</p>
              <p className="text-xs mt-1">جميع الموظفين لم يسحبوا أي مبالغ</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WithdrawalStatsCard;
