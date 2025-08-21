
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Clock } from "lucide-react";

interface CustomerStatsCardsProps {
  stats: {
    total_customers: number;
    total_debt: number;
    total_paid: number;
    remaining_debt: number;
  } | undefined;
  isLoading: boolean;
}

const CustomerStatsCards = ({ stats, isLoading }: CustomerStatsCardsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse bg-white/80">
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} د.ل`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Card className="bg-gradient-to-br from-blue-50/90 to-blue-100/90 backdrop-blur-sm border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-blue-600 font-medium mb-1">إجمالي العملاء</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-800">
                {stats?.total_customers || 0}
              </p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50/90 to-red-100/90 backdrop-blur-sm border-red-200/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-red-600 font-medium mb-1">إجمالي الديون</p>
              <p className="text-xl sm:text-2xl font-bold text-red-800">
                {formatCurrency(stats?.total_debt || 0)}
              </p>
            </div>
            <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50/90 to-green-100/90 backdrop-blur-sm border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-green-600 font-medium mb-1">المبلغ المحصل</p>
              <p className="text-xl sm:text-2xl font-bold text-green-800">
                {formatCurrency(stats?.total_paid || 0)}
              </p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50/90 to-orange-100/90 backdrop-blur-sm border-orange-200/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-orange-600 font-medium mb-1">المتبقي</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-800">
                {formatCurrency(stats?.remaining_debt || 0)}
              </p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerStatsCards;
