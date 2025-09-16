import { Card, CardContent } from "@/components/ui/card";
import { FileText, TrendingUp, BarChart3, Target } from "lucide-react";

interface ExpenseStatsCardsProps {
  stats:
    | {
        today: number;
        total: number;
        averageDaily: number;
        mostExpensiveCategory: string;
        todayCount: number;
      }
    | undefined;
}

const ExpenseStatsCards = ({ stats }: ExpenseStatsCardsProps) => {
  // Arabic-friendly: number then currency
  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-xs sm:text-sm font-medium">
                مصروفات اليوم
              </p>
              <p className="text-xl sm:text-2xl font-bold text-blue-800">
                {formatCurrency(stats.today)}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                {stats.todayCount} مصروف
              </p>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-xs sm:text-sm font-medium">
                المتوسط اليومي
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-800">
                {formatCurrency(stats.averageDaily)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                آخر 30 يوم
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-xs sm:text-sm font-medium">
                أعلى فئة اليوم
              </p>
              <p className="text-sm sm:text-base font-bold text-orange-800 truncate">
                {stats.mostExpensiveCategory}
              </p>
              <p className="text-xs text-orange-600 mt-1">
                أكثر إنفاقاً
              </p>
            </div>
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-xs sm:text-sm font-medium">
                إجمالي المصروفات
              </p>
              <p className="text-xl sm:text-2xl font-bold text-purple-800">
                {formatCurrency(stats.total)}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                منذ البداية
              </p>
            </div>
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseStatsCards;
