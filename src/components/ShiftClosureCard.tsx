import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Printer, DollarSign, List } from "lucide-react";
import { ShiftClosureData } from "@/hooks/useShiftClosure";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ShiftClosureCardProps {
  closure: ShiftClosureData;
  onPrint: (closure: ShiftClosureData) => void;
}

const ShiftClosureCard = ({ closure, onPrint }: ShiftClosureCardProps) => {
  const isPositive = closure.difference > 0;
  const isNegative = closure.difference < 0;
  const combinedDisplay = `${Math.round(closure.total_calculated)}/${Math.abs(
    Math.round(closure.difference)
  )} د.ل`;
  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span>
              وردية {closure.shift_type === "morning" ? "صباحية" : "مسائية"}
            </span>
          </div>
          <Badge
            variant={closure.shift_type === "morning" ? "default" : "secondary"}
          >
            {new Date(closure.shift_date).toLocaleDateString("en-GB")}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">النقود الحالية</p>
            <p className="font-semibold">
              {formatCurrency(closure.total_actual)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">
              المجموع قبل طرح مبيعات الشاشة
            </p>
            <p className="font-semibold">
              {formatCurrency(closure.total_calculated)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">مبيعات الشاشة</p>
            <p className="font-semibold">
              {formatCurrency(closure.screen_sales)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">المصروفات</p>
            <p className="font-semibold">
              {formatCurrency(closure.shift_expenses)}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium">النتيجة:</span>
            <div className="flex items-center gap-2">
              <DollarSign
                className={`w-4 h-4 ${
                  isPositive
                    ? "text-green-600"
                    : isNegative
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              />
              <span
                className={`font-bold ${
                  isPositive
                    ? "text-green-600"
                    : isNegative
                    ? "text-red-600"
                    : "text-gray-700"
                }`}
              >
                {combinedDisplay}
              </span>
            </div>
          </div>
          <div
            className={`mt-2 text-sm p-2 rounded ${
              isPositive
                ? "bg-green-50 text-green-700"
                : isNegative
                ? "bg-red-50 text-red-700"
                : "bg-gray-50 text-gray-700"
            }`}
          >
            الفائض/العجز: {isPositive ? "فائض" : isNegative ? "عجز" : "متوازن"}{" "}
            / {formatCurrency(Math.abs(closure.difference))}
          </div>
        </div>

        {Array.isArray((closure as any).shift_closure_expenses) &&
          (closure as any).shift_closure_expenses.length > 0 && (
            <div className="border rounded-md">
              <div className="px-3 py-2 font-medium bg-blue-50 border-b flex items-center gap-2">
                <List className="w-4 h-4 text-blue-600" />
                <span className="text-blue-800">
                  مصروفات هذه الوردية (
                  {(closure as any).shift_closure_expenses.length})
                </span>
              </div>
              <ScrollArea className="max-h-40">
                <div className="divide-y">
                  {(closure as any).shift_closure_expenses.map((exp: any) => (
                    <div
                      key={exp.id}
                      className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {exp.title || "مصروفة"}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {exp.description}
                          </p>
                        )}
                        {exp.category && (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded-full mt-1">
                            {exp.category}
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-red-600 ml-2">
                        {formatCurrency(Number(exp.amount || 0))}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

        {/* Show message if expenses are not archived yet */}
        {(!(closure as any).shift_closure_expenses ||
          (closure as any).shift_closure_expenses.length === 0) &&
          closure.shift_expenses > 0 && (
            <div className="border rounded-md">
              <div className="px-3 py-2 font-medium bg-gray-50 border-b flex items-center gap-2">
                <List className="w-4 h-4" /> مصروفات هذه الوردية
              </div>
              <div className="px-3 py-2 text-sm text-muted-foreground">
                إجمالي المصروفات: {formatCurrency(closure.shift_expenses)}
                <br />
                <span className="text-xs">
                  (تفاصيل المصروفات ستظهر بعد تطبيق ترحيل قاعدة البيانات)
                </span>
              </div>
            </div>
          )}

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
