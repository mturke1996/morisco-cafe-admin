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
  });

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const [employees, attendance, expenses, customers, debts] =
        await Promise.all([
          supabase.from("employees").select("*", { count: "exact" }),
          supabase.from("attendance").select("*").eq("date", today),
          supabase.from("expenses").select("amount"),
          supabase.from("customers").select("*", { count: "exact" }),
          supabase
            .from("customer_debts")
            .select("amount, paid_amount")
            .eq("status", "pending"),
        ]);

      const totalExpenses =
        expenses.data?.reduce(
          (sum, expense) => sum + Number(expense.amount),
          0
        ) || 0;
      const pendingDebts =
        debts.data?.reduce(
          (sum, debt) =>
            sum + (Number(debt.amount) - Number(debt.paid_amount || 0)),
          0
        ) || 0;

      setStats({
        totalEmployees: employees.count || 0,
        todayAttendance: attendance.data?.length || 0,
        totalExpenses,
        totalCustomers: customers.count || 0,
        monthlyRevenue: 0,
        pendingDebts,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const quickActions = [
    {
      title: "الموظفين",
      description: "إدارة الموظفين والرواتب",
      icon: Users,
      path: "/employees",
      gradient: "from-blue-500 via-blue-600 to-blue-700",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-300",
      shadowColor: "shadow-blue-200/50",
    },
    {
      title: "الحضور والانصراف",
      description: "تسجيل ومتابعة الحضور",
      icon: Clock,
      path: "/attendance",
      gradient: "from-purple-500 via-purple-600 to-purple-700",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-purple-300",
      shadowColor: "shadow-purple-200/50",
    },
    {
      title: "العملاء",
      description: "إدارة بيانات العملاء",
      icon: UserCheck,
      path: "/customers",
      gradient: "from-orange-500 via-orange-600 to-orange-700",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
      borderColor: "border-orange-300",
      shadowColor: "shadow-orange-200/50",
    },
    {
      title: "المصروفات",
      description: "تسجيل ومتابعة المصروفات",
      icon: Receipt,
      path: "/expenses",
      gradient: "from-red-500 via-red-600 to-red-700",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      iconColor: "text-red-600",
      borderColor: "border-red-300",
      shadowColor: "shadow-red-200/50",
    },
    {
      title: "التقارير",
      description: "التقارير المالية والإحصائيات",
      icon: FileText,
      path: "/reports",
      gradient: "from-indigo-500 via-indigo-600 to-indigo-700",
      bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
      iconColor: "text-indigo-600",
      borderColor: "border-indigo-300",
      shadowColor: "shadow-indigo-200/50",
    },
    {
      title: "الإعدادات",
      description: "إعدادات النظام والحساب",
      icon: Settings,
      path: "/settings",
      gradient: "from-gray-500 via-gray-600 to-gray-700",
      bgColor: "bg-gradient-to-br from-gray-50 to-gray-100",
      iconColor: "text-gray-600",
      borderColor: "border-gray-300",
      shadowColor: "shadow-gray-200/50",
    },
  ];

  const todayStats = [
    {
      title: "إجمالي الموظفين",
      value: stats.totalEmployees.toString(),
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconBg: "bg-gradient-to-br from-blue-100 to-blue-200",
      iconColor: "text-blue-600",
    },
    {
      title: "إجمالي العملاء",
      value: stats.totalCustomers.toString(),
      icon: UserCheck,
      gradient: "from-purple-500 to-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconBg: "bg-gradient-to-br from-purple-100 to-purple-200",
      iconColor: "text-purple-600",
    },
    {
      title: "المصروفات الإجمالية",
      value: `${stats.totalExpenses.toFixed(2)} د.ل`,
      valueNum: stats.totalExpenses,
      isCurrency: true,
      icon: DollarSign,
      gradient: "from-red-500 to-red-600",
      bgColor: "bg-gradient-to-br from-red-50 to-red-100",
      iconBg: "bg-gradient-to-br from-red-100 to-red-200",
      iconColor: "text-red-600",
    },
    {
      title: "الديون المعلقة",
      value: `${stats.pendingDebts.toFixed(2)} د.ل`,
      valueNum: stats.pendingDebts,
      isCurrency: true,
      icon: TrendingUp,
      gradient: "from-orange-500 to-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      iconBg: "bg-gradient-to-br from-orange-100 to-orange-200",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/30">
      {/* Hero Section - Mobile Optimized */}
      <div className="bg-gradient-to-l from-emerald-500 via-emerald-600 to-emerald-700 p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-800/20"></div>
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-white/5 rounded-full -translate-y-16 -translate-x-16 sm:-translate-y-32 sm:-translate-x-32 lg:-translate-y-48 lg:-translate-x-48 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-24 h-24 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/5 rounded-full translate-y-12 translate-x-12 sm:translate-y-24 sm:translate-x-24 lg:translate-y-32 lg:translate-x-32 animate-pulse delay-1000"></div>

        <div className="container mx-auto relative z-10" dir="rtl">
          <div className="flex flex-col items-center text-center gap-4 sm:gap-6">
            {/* Logo and Title */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/95 rounded-xl flex items-center justify-center shadow-2xl border-2 border-emerald-200 backdrop-blur-sm transform hover:scale-110 transition-all duration-500 group">
                <img
                  src="/lovable-uploads/6f94ee33-78e5-4785-9e28-4687fe0587d6.png"
                  alt="موريسكو كافيه"
                  className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
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
                  className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-emerald-600 coffee-fallback animate-bounce"
                  style={{ display: "none" }}
                />
              </div>

              <div className="text-center sm:text-right">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white drop-shadow-2xl mb-1 sm:mb-2 font-cairo tracking-wide animate-fade-in">
                  موريسكو كافيه
                </h1>
                <p className="text-emerald-100 text-sm sm:text-base lg:text-lg font-bold tracking-wide font-cairo drop-shadow-lg">
                  نظام الإدارة الذكي
                </p>
              </div>
            </div>

            {/* Date - Mobile Friendly */}
            <div className="flex items-center gap-2 sm:gap-3 text-white bg-emerald-800/40 backdrop-blur-xl px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl border-2 border-emerald-400/30 shadow-2xl hover:bg-emerald-800/50 transition-all duration-300 transform hover:scale-105">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100 drop-shadow-lg animate-pulse" />
              <span className="font-bold text-xs sm:text-sm drop-shadow-lg font-cairo text-emerald-100">
                {new Date().toLocaleDateString("ar-LY", {
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
        {/* Quick Actions */}
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-800 mb-6 sm:mb-8 text-center font-cairo flex items-center justify-center gap-2 sm:gap-3">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-500" />
            القوائم الرئيسية
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-500" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                className={`group border-2 ${action.borderColor} hover:border-emerald-400 ${action.shadowColor} hover:shadow-2xl hover:shadow-emerald-200/30 transition-all duration-500 transform hover:-translate-y-2 sm:hover:-translate-y-3 hover:scale-105 cursor-pointer ${action.bgColor} backdrop-blur-lg relative overflow-hidden`}
                onClick={() => navigate(action.path)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <CardHeader className="pb-3 sm:pb-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-3 sm:p-4 lg:p-6 rounded-2xl sm:rounded-3xl ${action.bgColor} group-hover:scale-125 transition-all duration-500 shadow-2xl border-3 border-white/50 backdrop-blur-sm relative overflow-hidden`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
                      ></div>
                      <action.icon
                        className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 ${action.iconColor} relative z-10 group-hover:rotate-12 transition-transform duration-300`}
                      />
                    </div>
                    <div className="text-right flex-1 mr-3 sm:mr-4">
                      <CardTitle className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800 group-hover:text-emerald-600 transition-colors duration-300 font-cairo drop-shadow-sm">
                        {action.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 relative z-10">
                  <CardDescription className="text-gray-600 text-right mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg font-cairo leading-relaxed">
                    {action.description}
                  </CardDescription>

                  <div className="flex items-center justify-end text-emerald-600 group-hover:text-emerald-700 transition-colors duration-300">
                    <span className="text-sm sm:text-base font-bold ml-2 sm:ml-3 font-cairo">
                      دخول
                    </span>
                    <div className="p-1.5 sm:p-2 bg-emerald-100 rounded-full group-hover:bg-emerald-200 transition-all duration-300">
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 text-center font-cairo flex items-center justify-center gap-2 sm:gap-3">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            الإحصائيات العامة
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {todayStats.map((stat, index) => (
              <Card
                key={index}
                className={`border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105 ${stat.bgColor} backdrop-blur-lg relative overflow-hidden group`}
              >
                {/* Light Effect */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
                  <div className="flex flex-col items-center gap-2 sm:gap-3 lg:gap-4">
                    <div
                      className={`p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl ${stat.iconBg} shadow-xl border-2 border-white/50 group-hover:scale-110 transition-all duration-300`}
                    >
                      <stat.icon
                        className={`w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 ${stat.iconColor} group-hover:rotate-12 transition-transform duration-300`}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold font-cairo mb-1">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-black text-gray-800 stat-value drop-shadow-sm">
                        {stat.isCurrency ? (
                          <span dir="ltr" className="inline-flex items-baseline gap-1">
                            <span>{stat.valueNum?.toFixed(2)}</span>
                            <span>د.ل</span>
                          </span>
                        ) : (
                          stat.value
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Welcome Message */}
        <Card className="border-0 shadow-2xl bg-gradient-to-l from-emerald-500 via-emerald-600 to-emerald-700 text-white relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-800/20"></div>
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/5 rounded-full -translate-y-16 translate-x-16 sm:-translate-y-24 sm:translate-x-24 lg:-translate-y-32 lg:translate-x-32 group-hover:scale-110 transition-transform duration-1000"></div>
          <CardContent className="p-6 sm:p-8 relative z-10" dir="rtl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="text-center sm:text-right flex-1">
                <h3 className="text-xl sm:text-2xl font-black mb-3 font-cairo tracking-wide drop-shadow-lg">
                  مرحباً بك في موريسكو كافيه
                </h3>
                <p className="text-emerald-100 text-sm sm:text-base font-cairo leading-relaxed drop-shadow-sm">
                  نظام إدارة متكامل لجميع احتياجات المقهى
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-lg border-2 border-white/30 shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                  <Coffee className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-lg group-hover:animate-bounce" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
