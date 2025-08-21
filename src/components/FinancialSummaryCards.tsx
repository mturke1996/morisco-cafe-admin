
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Users } from "lucide-react";

interface FinancialSummaryCardsProps {
  stats: {
    total_expenses: number;
    daily_expenses: number;
    weekly_expenses: number;
    monthly_expenses: number;
    total_customers: number;
    total_debt: number;
    total_paid: number;
    remaining_debt: number;
  };
  isLoading: boolean;
}

const FinancialSummaryCards = ({ stats, isLoading }: FinancialSummaryCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    // Arabic-friendly: number then currency
    return `${amount.toFixed(2)} د.ل`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">إجمالي المصروفات</p>
              <p className="text-2xl font-bold text-blue-800">
                {formatCurrency(stats?.total_expenses || 0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">مصروفات اليوم</p>
              <p className="text-2xl font-bold text-red-800">
                {formatCurrency(stats?.daily_expenses || 0)}
              </p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">الديون المحصلة</p>
              <p className="text-2xl font-bold text-green-800">
                {formatCurrency(stats?.total_paid || 0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">الديون المتبقية</p>
              <p className="text-2xl font-bold text-purple-800">
                {formatCurrency(stats?.remaining_debt || 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialSummaryCards;
