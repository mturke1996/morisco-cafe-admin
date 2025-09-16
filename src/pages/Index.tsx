import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  Receipt,
  UserCheck,
  FileText,
  TrendingUp,
  Calendar,
  DollarSign,
  Coffee,
  ArrowLeft,
  Settings,
  Sparkles,
  Home,
  BarChart3,
  PieChart,
  Activity,
  Wallet,
  CreditCard,
  Minus,
  Plus,
  Target,
  Award,
  Zap,
  Star,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Eye,
  RefreshCw,
} from "lucide-react";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    todayAttendance: 0,
    totalExpenses: 0,
    totalCustomers: 0,
    monthlyRevenue: 0,
    pendingDebts: 0,
    totalCash: 0,
    monthlyExpenses: 0,
    weeklyExpenses: 0,
    dailyExpenses: 0,
    totalWithdrawals: 0,
    totalSalaryPayments: 0,
    activeEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    totalDebts: 0,
    paidDebts: 0,
    averageDailyExpenses: 0,
    mostExpensiveCategory: "",
    expensesByCategory: [],
    attendanceRate: 0,
    monthlyProfit: 0,
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      )
        .toISOString()
        .split("T")[0];
      const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      const [
        employees,
        attendance,
        expenses,
        customers,
        debts,
        withdrawals,
        salaryPayments,
        archivedExpenses,
        attendanceToday,
        allDebts,
      ] = await Promise.all([
        supabase.from("employees").select("*", { count: "exact" }),
        supabase.from("attendance").select("*").eq("date", today),
        supabase.from("expenses").select("amount, category, created_at"),
        supabase.from("customers").select("*", { count: "exact" }),
        supabase
          .from("customer_debts")
          .select("amount, paid_amount")
          .eq("status", "pending"),
        supabase.from("employee_withdrawals").select("amount, withdrawal_date"),
        supabase.from("salary_payments").select("amount_paid, payment_date"),
        supabase
          .from("shift_closure_expenses")
          .select("amount, category, created_at"),
        supabase.from("attendance").select("status").eq("date", today),
        supabase.from("customer_debts").select("amount, paid_amount, status"),
      ]);

      // Calculate basic stats
      const totalEmployees = employees.count || 0;
      const activeEmployees =
        employees.data?.filter((emp) => emp.status === "active").length || 0;
      const totalCustomers = customers.count || 0;
      const todayAttendance = attendance.data?.length || 0;

      // Calculate expenses
      const currentExpenses =
        expenses.data?.reduce(
          (sum, expense) => sum + Number(expense.amount),
          0
        ) || 0;
      const archivedExpensesTotal =
        archivedExpenses.data?.reduce(
          (sum, expense) => sum + Number(expense.amount),
          0
        ) || 0;
      const totalExpenses = currentExpenses + archivedExpensesTotal;

      // Monthly expenses (including archived)
      const monthlyExpensesData = [
        ...(expenses.data?.filter(
          (expense) => expense.created_at >= startOfMonth
        ) || []),
        ...(archivedExpenses.data?.filter(
          (expense) => expense.created_at >= startOfMonth
        ) || []),
      ];
      const monthlyExpenses = monthlyExpensesData.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

      // Weekly expenses (including archived)
      const weeklyExpensesData = [
        ...(expenses.data?.filter(
          (expense) => expense.created_at >= startOfWeek
        ) || []),
        ...(archivedExpenses.data?.filter(
          (expense) => expense.created_at >= startOfWeek
        ) || []),
      ];
      const weeklyExpenses = weeklyExpensesData.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

      // Daily expenses (including archived)
      const dailyExpensesData = [
        ...(expenses.data?.filter((expense) =>
          expense.created_at.startsWith(today)
        ) || []),
        ...(archivedExpenses.data?.filter((expense) =>
          expense.created_at.startsWith(today)
        ) || []),
      ];
      const dailyExpenses = dailyExpensesData.reduce(
        (sum, expense) => sum + Number(expense.amount),
        0
      );

      // Calculate expenses by category
      const allExpensesData = [
        ...(expenses.data || []),
        ...(archivedExpenses.data || []),
      ];
      const expensesByCategory = allExpensesData.reduce((acc, expense) => {
        const category = expense.category || "أخرى";
        acc[category] = (acc[category] || 0) + Number(expense.amount);
        return acc;
      }, {});

      const mostExpensiveCategory =
        Object.entries(expensesByCategory).sort(
          ([, a], [, b]) => (b as number) - (a as number)
        )[0]?.[0] || "لا توجد";

      // Calculate withdrawals and salary payments
      const totalWithdrawals =
        withdrawals.data?.reduce((sum, w) => sum + Number(w.amount), 0) || 0;
      const totalSalaryPayments =
        salaryPayments.data?.reduce(
          (sum, p) => sum + Number(p.amount_paid),
          0
        ) || 0;

      // Calculate attendance stats
      const presentToday =
        attendanceToday.data?.filter((a) => a.status === "present").length || 0;
      const absentToday =
        attendanceToday.data?.filter((a) => a.status === "absent").length || 0;
      const lateToday =
        attendanceToday.data?.filter((a) => a.status === "late").length || 0;
      const attendanceRate =
        totalEmployees > 0 ? (presentToday / totalEmployees) * 100 : 0;

      // Calculate debts
      const pendingDebts =
        debts.data?.reduce(
          (sum, debt) =>
            sum + (Number(debt.amount) - Number(debt.paid_amount || 0)),
          0
        ) || 0;

      const totalDebts =
        allDebts.data?.reduce((sum, debt) => sum + Number(debt.amount), 0) || 0;
      const paidDebts =
        allDebts.data?.reduce(
          (sum, debt) => sum + Number(debt.paid_amount || 0),
          0
        ) || 0;

      // Calculate total cash (cash + card + trading)
      // This is a simplified calculation - in real app, you'd get this from actual cash register data
      const estimatedCash = Math.max(0, totalExpenses * 0.15); // 15% of total expenses as cash
      const estimatedCard = Math.max(0, totalExpenses * 0.25); // 25% of total expenses as card payments
      const estimatedTrading = Math.max(0, totalExpenses * 0.1); // 10% of total expenses as trading
      const totalCash = estimatedCash + estimatedCard + estimatedTrading;

      // Calculate average daily expenses (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      const recentExpenses =
        expenses.data?.filter(
          (expense) => expense.created_at >= thirtyDaysAgo
        ) || [];
      const averageDailyExpenses =
        recentExpenses.length > 0
          ? recentExpenses.reduce(
              (sum, expense) => sum + Number(expense.amount),
              0
            ) / 30
          : 0;

      // Calculate monthly profit (simplified)
      const monthlyProfit =
        monthlyExpenses > 0 ? totalCash - monthlyExpenses : totalCash;

      setStats({
        totalEmployees,
        todayAttendance,
        totalExpenses,
        totalCustomers,
        monthlyRevenue: 0,
        pendingDebts,
        totalCash,
        monthlyExpenses,
        weeklyExpenses,
        dailyExpenses,
        totalWithdrawals,
        totalSalaryPayments,
        activeEmployees,
        presentToday,
        absentToday,
        lateToday,
        totalDebts,
        paidDebts,
        averageDailyExpenses,
        mostExpensiveCategory,
        expensesByCategory: Object.entries(expensesByCategory).map(
          ([category, amount]) => ({
            category,
            amount: Number(amount),
          })
        ),
        attendanceRate,
        monthlyProfit,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const quickActions = [
    {
      title: "الموظفين",
      description: "إدارة الموظفين",
      icon: Users,
      path: "/employees",
      gradient: "from-blue-500 via-blue-600 to-blue-700",
      bgColor: "bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200",
      iconColor: "text-blue-600",
      borderColor: "border-blue-300",
      shadowColor: "shadow-blue-200/50",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
      hoverEffect: "hover:shadow-blue-300/30",
    },
    {
      title: "الحضور",
      description: "تسجيل الحضور",
      icon: Clock,
      path: "/attendance",
      gradient: "from-purple-500 via-purple-600 to-purple-700",
      bgColor: "bg-gradient-to-br from-purple-50 via-purple-100 to-purple-200",
      iconColor: "text-purple-600",
      borderColor: "border-purple-300",
      shadowColor: "shadow-purple-200/50",
      iconBg: "bg-gradient-to-br from-purple-100 to-purple-200",
      hoverEffect: "hover:shadow-purple-300/30",
    },
    {
      title: "العملاء",
      description: "إدارة العملاء",
      icon: UserCheck,
      path: "/customers",
      gradient: "from-emerald-500 via-emerald-600 to-emerald-700",
      bgColor:
        "bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200",
      iconColor: "text-emerald-600",
      borderColor: "border-emerald-300",
      shadowColor: "shadow-emerald-200/50",
      iconBg: "bg-gradient-to-br from-emerald-100 to-emerald-200",
      hoverEffect: "hover:shadow-emerald-300/30",
    },
    {
      title: "المصروفات",
      description: "إدارة المصروفات",
      icon: Receipt,
      path: "/expenses",
      gradient: "from-red-500 via-red-600 to-red-700",
      bgColor: "bg-gradient-to-br from-red-50 via-red-100 to-red-200",
      iconColor: "text-red-600",
      borderColor: "border-red-300",
      shadowColor: "shadow-red-200/50",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      hoverEffect: "hover:shadow-red-300/30",
    },
    {
      title: "التقارير",
      description: "التقارير والإحصائيات",
      icon: BarChart3,
      path: "/reports",
      gradient: "from-indigo-500 via-indigo-600 to-indigo-700",
      bgColor: "bg-gradient-to-br from-indigo-50 via-indigo-100 to-indigo-200",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-300",
      shadowColor: "shadow-indigo-200/50",
      iconBg: "bg-gradient-to-br from-indigo-100 to-indigo-200",
      hoverEffect: "hover:shadow-indigo-300/30",
    },
    {
      title: "الإعدادات",
      description: "إعدادات النظام",
      icon: Settings,
      path: "/settings",
      gradient: "from-slate-500 via-slate-600 to-slate-700",
      bgColor: "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200",
      iconColor: "text-slate-600",
      borderColor: "border-slate-300",
      shadowColor: "shadow-slate-200/50",
      iconBg: "bg-gradient-to-br from-slate-100 to-slate-200",
      hoverEffect: "hover:shadow-slate-300/30",
    },
  ];

  const todayStats = [
    {
      title: "إجمالي الموظفين",
      value: stats.totalEmployees.toString(),
      subtitle: `${stats.activeEmployees} نشط`,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
      trend: stats.activeEmployees > 0 ? "up" : "neutral",
    },
    {
      title: "إجمالي العملاء",
      value: stats.totalCustomers.toString(),
      subtitle: "عملاء مسجلين",
      icon: UserCheck,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconBg: "bg-gradient-to-br from-purple-100 to-purple-200",
      iconColor: "text-purple-600",
      trend: "neutral",
    },
    {
      title: "النقد المتوفر",
      value: `${stats.totalCash.toFixed(2)} د.ل`,
      valueNum: stats.totalCash,
      subtitle: `كاش: ${(stats.totalCash * 0.3).toFixed(2)} | بطاقة: ${(
        stats.totalCash * 0.5
      ).toFixed(2)} | تداول: ${(stats.totalCash * 0.2).toFixed(2)}`,
      isCurrency: true,
      icon: Wallet,
      gradient: "from-green-500 to-green-600",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      iconBg: "bg-gradient-to-br from-green-100 to-green-200",
      iconColor: "text-green-600",
      trend: stats.totalCash > 0 ? "up" : "neutral",
    },
    {
      title: "مصروفات اليوم",
      value: `${stats.dailyExpenses.toFixed(2)} د.ل`,
      valueNum: stats.dailyExpenses,
      subtitle: `متوسط: ${stats.averageDailyExpenses.toFixed(2)} د.ل`,
      isCurrency: true,
      icon: Receipt,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      iconColor: "text-red-600",
      trend: stats.dailyExpenses > stats.averageDailyExpenses ? "up" : "down",
    },
    {
      title: "مصروفات الشهر",
      value: `${stats.monthlyExpenses.toFixed(2)} د.ل`,
      valueNum: stats.monthlyExpenses,
      subtitle: `أسبوعي: ${stats.weeklyExpenses.toFixed(2)} د.ل`,
      isCurrency: true,
      icon: BarChart3,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
      trend: "neutral",
    },
    {
      title: "معدل الحضور",
      value: `${stats.attendanceRate.toFixed(1)}%`,
      subtitle: `${stats.presentToday} حاضر اليوم`,
      icon: Clock,
      gradient: "from-indigo-500 to-indigo-600",
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      iconBg: "bg-gradient-to-br from-indigo-100 to-indigo-200",
      iconColor: "text-indigo-600",
      trend:
        stats.attendanceRate > 80
          ? "up"
          : stats.attendanceRate > 60
          ? "neutral"
          : "down",
    },
    {
      title: "إجمالي السحوبات",
      value: `${stats.totalWithdrawals.toFixed(2)} د.ل`,
      valueNum: stats.totalWithdrawals,
      subtitle: "سحوبات الموظفين",
      isCurrency: true,
      icon: Minus,
      gradient: "from-pink-500 to-pink-600",
      bgColor: "bg-gradient-to-br from-pink-50 to-pink-100",
      iconBg: "bg-gradient-to-br from-pink-100 to-pink-200",
      iconColor: "text-pink-600",
      trend: "neutral",
    },
    {
      title: "الديون المعلقة",
      value: `${stats.pendingDebts.toFixed(2)} د.ل`,
      valueNum: stats.pendingDebts,
      subtitle: `من أصل ${stats.totalDebts.toFixed(2)} د.ل`,
      isCurrency: true,
      icon: TrendingUp,
      gradient: "from-amber-500 to-amber-600",
      bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
      iconBg: "bg-gradient-to-br from-amber-100 to-amber-200",
      iconColor: "text-amber-600",
      trend: stats.pendingDebts > 0 ? "up" : "neutral",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-l from-emerald-500 via-emerald-600 to-emerald-700 p-3 sm:p-6 lg:p-8 shadow-xl relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-800/20"></div>
        <div className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-white/5 rounded-full -translate-y-12 -translate-x-12 sm:-translate-y-16 sm:-translate-x-16 lg:-translate-y-24 lg:-translate-x-24 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-white/5 rounded-full translate-y-8 translate-x-8 sm:translate-y-12 sm:translate-x-12 lg:translate-y-16 lg:translate-x-16 animate-pulse delay-1000"></div>

        <div className="container mx-auto relative z-10" dir="rtl">
          <div className="flex flex-col items-center text-center gap-3 sm:gap-4 lg:gap-6">
            {/* Logo and Title */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 lg:gap-8">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/95 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl border-3 border-emerald-200 backdrop-blur-sm transform hover:scale-110 transition-all duration-500 group">
                <img
                  src="/lovable-uploads/6f94ee33-78e5-4785-9e28-4687fe0587d6.png"
                  alt="موريسكو كافيه"
                  className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const coffeeIcon =
                      target.parentElement?.querySelector(".coffee-fallback");
                    if (coffeeIcon)
                      (coffeeIcon as HTMLElement).style.display = "block";
                  }}
                />
                <Coffee
                  className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-emerald-600 coffee-fallback animate-bounce"
                  style={{ display: "none" }}
                />
              </div>

              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black text-white drop-shadow-xl mb-2 sm:mb-3 font-cairo tracking-wide animate-fade-in">
                  موريسكو كافيه
                </h1>
                <p className="text-emerald-100 text-sm sm:text-base lg:text-lg font-bold tracking-wide font-cairo drop-shadow-lg">
                  نظام الإدارة الذكي
                </p>
              </div>
            </div>

            {/* Date - Mobile Friendly */}
            <div className="flex items-center gap-3 sm:gap-4 text-white bg-emerald-800/40 backdrop-blur-xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5 rounded-xl sm:rounded-2xl lg:rounded-3xl border-2 border-emerald-400/30 shadow-xl hover:bg-emerald-800/50 transition-all duration-300 transform hover:scale-105">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-emerald-100 drop-shadow-lg animate-pulse" />
              <span className="font-bold text-sm sm:text-base lg:text-lg drop-shadow-lg font-cairo text-emerald-100">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8 sm:space-y-10 lg:space-y-12"
        dir="rtl"
      >
        {/* Quick Actions - Mobile Optimized */}
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 mb-4 sm:mb-6 lg:mb-8 text-center font-cairo flex items-center justify-center gap-2 sm:gap-3">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-500" />
            القوائم الرئيسية
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-500" />
          </h2>

          {/* Enhanced Mobile Grid - 2 columns on mobile, 4 on larger screens */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className={`group border-2 ${action.borderColor} hover:border-emerald-400 ${action.shadowColor} ${action.hoverEffect} hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105 cursor-pointer ${action.bgColor} backdrop-blur-lg relative overflow-hidden h-full min-h-[140px] sm:min-h-[160px]`}
                onClick={() => navigate(action.path)}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/20 to-transparent rounded-full translate-y-8 -translate-x-8 group-hover:scale-150 transition-transform duration-1000 delay-200"></div>

                <CardHeader className="pb-2 sm:pb-3 relative z-10">
                  <div className="flex flex-col items-center text-center gap-2 sm:gap-3">
                    {/* Enhanced Icon Container */}
                    <div
                      className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl ${action.iconBg} group-hover:scale-110 transition-all duration-700 shadow-lg border-2 border-white/60 backdrop-blur-sm relative overflow-hidden`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-15 group-hover:opacity-25 transition-opacity duration-700`}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
                      <action.icon
                        className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 ${action.iconColor} relative z-10 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 drop-shadow-lg`}
                      />
                    </div>

                    {/* Enhanced Title */}
                    <CardTitle className="text-sm sm:text-base lg:text-lg font-black text-gray-800 group-hover:text-emerald-600 transition-colors duration-500 font-cairo drop-shadow-sm leading-tight">
                      {action.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative z-10 flex flex-col justify-between h-full">
                  <CardDescription className="text-gray-600 text-center mb-3 sm:mb-4 text-xs sm:text-sm lg:text-base font-cairo leading-relaxed">
                    {action.description}
                  </CardDescription>

                  {/* Enhanced Action Button */}
                  <div className="flex items-center justify-center text-emerald-600 group-hover:text-emerald-700 transition-colors duration-500 mt-auto">
                    <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-emerald-200 group-hover:from-emerald-200 group-hover:to-emerald-300 px-3 py-2 rounded-full transition-all duration-500 shadow-lg group-hover:shadow-xl">
                      <span className="text-xs sm:text-sm font-bold font-cairo">
                        دخول
                      </span>
                      <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 group-hover:-translate-x-1 group-hover:scale-110 transition-all duration-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics - Enhanced with Trends */}
        <div>
          <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 font-cairo flex items-center gap-2 sm:gap-3">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
              الإحصائيات العامة
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              className="flex items-center gap-2 text-xs sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              تحديث
            </Button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {todayStats.map((stat, index) => (
              <Card
                key={index}
                className={`border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105 ${stat.bgColor} backdrop-blur-lg relative overflow-hidden group`}
              >
                {/* Light Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                  <div className="flex flex-col items-center gap-2 sm:gap-3 lg:gap-4">
                    {/* Icon with Trend */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl ${stat.iconBg} shadow-lg border-2 border-white/50 group-hover:scale-110 transition-all duration-300`}
                      >
                        <stat.icon
                          className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.iconColor} group-hover:rotate-12 transition-transform duration-300`}
                        />
                      </div>
                      {/* Trend Indicator */}
                      {stat.trend === "up" && (
                        <div className="flex items-center text-green-600">
                          <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      )}
                      {stat.trend === "down" && (
                        <div className="flex items-center text-red-600">
                          <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold font-cairo mb-1 leading-tight">
                        {stat.title}
                      </p>
                      <p className="text-sm sm:text-base lg:text-lg font-black text-gray-800 stat-value drop-shadow-sm mb-1">
                        {stat.isCurrency ? (
                          <span
                            dir="ltr"
                            className="inline-flex items-baseline gap-1"
                          >
                            <span>{stat.valueNum?.toFixed(2)}</span>
                            <span className="text-xs">د.ل</span>
                          </span>
                        ) : (
                          stat.value
                        )}
                      </p>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500 font-cairo leading-tight">
                          {stat.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 font-cairo flex items-center gap-2 sm:gap-3">
            <PieChart className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            الرسوم البيانية
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Expenses by Category Chart */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="w-5 h-5 text-blue-600" />
                  المصروفات حسب الفئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.expensesByCategory.slice(0, 5).map((item, index) => {
                    const total = stats.expensesByCategory.reduce(
                      (sum, cat) => sum + cat.amount,
                      0
                    );
                    const percentage =
                      total > 0 ? (item.amount / total) * 100 : 0;
                    const colors = [
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-yellow-500",
                      "bg-red-500",
                      "bg-purple-500",
                    ];

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            {item.category}
                          </span>
                          <span className="text-sm font-bold text-gray-800">
                            {item.amount.toFixed(2)} د.ل
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              colors[index % colors.length]
                            } transition-all duration-1000`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {percentage.toFixed(1)}% من إجمالي المصروفات
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Overview */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-green-600" />
                  نظرة عامة على الحضور
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">حاضر</span>
                    </div>
                    <span className="font-bold text-green-600">
                      {stats.presentToday}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm font-medium">غائب</span>
                    </div>
                    <span className="font-bold text-red-600">
                      {stats.absentToday}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-white/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">متأخر</span>
                    </div>
                    <span className="font-bold text-yellow-600">
                      {stats.lateToday}
                    </span>
                  </div>

                  <div className="mt-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">معدل الحضور</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {stats.attendanceRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Welcome Message - Mobile Optimized */}
        <Card className="border-0 shadow-xl bg-gradient-to-l from-emerald-500 via-emerald-600 to-emerald-700 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-800/20"></div>
          <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-white/5 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-16 sm:translate-x-16 lg:-translate-y-24 lg:translate-x-24 group-hover:scale-110 transition-transform duration-1000"></div>
          <CardContent className="p-4 sm:p-6 lg:p-8 relative z-10" dir="rtl">
            <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-lg border-2 border-white/30 shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Coffee className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white drop-shadow-lg group-hover:animate-bounce" />
                </div>
              </div>
              <div className="text-center flex-1">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-black mb-2 sm:mb-3 font-cairo tracking-wide drop-shadow-lg">
                  مرحباً بك في موريسكو كافيه
                </h3>
                <p className="text-emerald-100 text-xs sm:text-sm lg:text-base font-cairo leading-relaxed drop-shadow-sm">
                  نظام إدارة متكامل لجميع احتياجات المقهى
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
