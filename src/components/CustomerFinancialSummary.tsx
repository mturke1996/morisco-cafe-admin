
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock } from "lucide-react";

interface CustomerFinancialSummaryProps {
  totalDebt: number;
  totalPaid: number;
  remainingDebt: number;
}

const CustomerFinancialSummary = ({ 
  totalDebt, 
  totalPaid, 
  remainingDebt 
}: CustomerFinancialSummaryProps) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} د.ل`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <Card className="bg-gradient-to-br from-red-50/90 to-red-100/90 backdrop-blur-sm border-red-200/50 shadow-sm hover:shadow-md transition-all duration-200">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-red-600 font-medium mb-1">إجمالي الديون</p>
              <p className="text-xl sm:text-2xl font-bold text-red-800">
                {formatCurrency(totalDebt)}
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
                {formatCurrency(totalPaid)}
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
                {formatCurrency(remainingDebt)}
              </p>
            </div>
            <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerFinancialSummary;
