
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Printer, DollarSign } from "lucide-react";
import { ShiftClosureData } from "@/hooks/useShiftClosure";

interface ShiftClosureCardProps {
  closure: ShiftClosureData;
  onPrint: (closure: ShiftClosureData) => void;
}

const ShiftClosureCard = ({ closure, onPrint }: ShiftClosureCardProps) => {
  const isPositive = closure.difference >= 0;
  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>وردية {closure.shift_type === 'morning' ? 'صباحية' : 'مسائية'}</span>
          </div>
          <Badge variant={closure.shift_type === 'morning' ? 'default' : 'secondary'}>
            {new Date(closure.shift_date).toLocaleDateString('ar-SA')}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">النقود الحالية</p>
            <p className="font-semibold">{formatCurrency(closure.total_actual)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">المجموع المحسوب</p>
            <p className="font-semibold">{formatCurrency(closure.total_calculated)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">مبيعات الشاشة</p>
            <p className="font-semibold">{formatCurrency(closure.screen_sales)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">المصروفات</p>
            <p className="font-semibold">{formatCurrency(closure.shift_expenses)}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">النتيجة:</span>
            <div className="flex items-center gap-2">
              <DollarSign className={`w-4 h-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(closure.total_calculated)} / {isPositive ? 'فائض' : 'عجز'} {formatCurrency(Math.abs(closure.difference))}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onPrint(closure)} variant="outline" size="sm">
            <Printer className="w-4 h-4 ml-2" />
            طباعة التقرير
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftClosureCard;
