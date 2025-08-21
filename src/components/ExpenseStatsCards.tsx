import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface ExpenseStatsCardsProps {
  stats:
    | {
        today: number;
        this_week: number;
        this_month: number;
        total: number;
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
                اليوم
              </p>
              <p className="text-xl sm:text-2xl font-bold text-blue-800">
                {formatCurrency(stats.today)}
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
                هذا الأسبوع
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-800">
                {formatCurrency(stats.this_week)}
              </p>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-xs sm:text-sm font-medium">
                هذا الشهر
              </p>
              <p className="text-xl sm:text-2xl font-bold text-orange-800">
                {formatCurrency(stats.this_month)}
              </p>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-xs sm:text-sm font-medium">
                الإجمالي
              </p>
              <p className="text-xl sm:text-2xl font-bold text-purple-800">
                {formatCurrency(stats.total)}
              </p>
            </div>
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseStatsCards;
