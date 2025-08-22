import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Printer,
  List,
  Receipt,
} from "lucide-react";
import { ShiftClosureData } from "@/hooks/useShiftClosure";
import { useState } from "react";
import { ShiftExpensesModal } from "./ShiftExpensesModal";

interface ShiftClosureCardProps {
  closure: ShiftClosureData;
  onPrint: (closure: ShiftClosureData) => void;
}

const formatCurrency = (amount: number) => {
  return `${amount.toFixed(2)} د.ل`;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ar-LY");
};

const getShiftTypeText = (type: string) => {
  return type === "morning" ? "صباحية" : "مسائية";
};

const ShiftClosureCard = ({ closure, onPrint }: ShiftClosureCardProps) => {
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const isPositive = closure.difference > 0;
  const isNegative = closure.difference < 0;
  const combinedDisplay = `${closure.total_calculated.toFixed(0)}/${Math.abs(
    closure.difference
  ).toFixed(0)} د.ل`;

  const hasExpenses =
    Array.isArray((closure as any).shift_closure_expenses) &&
    (closure as any).shift_closure_expenses.length > 0;

  return (
    <>
      <Card className="bg-white/90 backdrop-blur-sm border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">
                وردية {getShiftTypeText(closure.shift_type)}
              </CardTitle>
            </div>
            <Badge variant="outline" className="text-xs">
              {formatDate(closure.shift_date)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Sales Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-xs text-green-700">إجمالي المبيعات</span>
              </div>
              <p className="text-lg font-bold text-green-700">
                {formatCurrency(
                  closure.cash_sales +
                    closure.card_sales +
                    closure.tadawul_sales +
                    closure.presto_sales
                )}
              </p>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-blue-700">النقد المتوفر</span>
              </div>
              <p className="text-lg font-bold text-blue-700">
                {formatCurrency(
                  closure.coins_small +
                    closure.coins_one_dinar +
                    closure.bills_large
                )}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">المجموع المحسوب</span>
              <span className="font-semibold">
                {formatCurrency(closure.total_calculated)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">المجموع الفعلي</span>
              <span className="font-semibold">
                {formatCurrency(closure.total_actual)}
              </span>
            </div>

            <hr className="my-2" />

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">الفرق</span>
              <div className="flex items-center gap-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : isNegative ? (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                ) : null}
                <span
                  className={`font-bold text-lg ${
                    isPositive
                      ? "text-green-600"
                      : isNegative
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {formatCurrency(closure.difference)}
                </span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          {hasExpenses && (
            <div className="border rounded-md">
              <div className="px-3 py-2 font-medium bg-blue-50 border-b flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800">
                    مصروفات هذه الوردية (
                    {(closure as any).shift_closure_expenses.length})
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExpensesModal(true)}
                  className="h-6 px-2 text-xs"
                >
                  <Receipt className="w-3 h-3 ml-1" />
                  عرض التفاصيل
                </Button>
              </div>
              <ScrollArea className="max-h-32">
                <div className="divide-y">
                  {(closure as any).shift_closure_expenses
                    .slice(0, 3)
                    .map((exp: any) => (
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
                  {(closure as any).shift_closure_expenses.length > 3 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                      + {(closure as any).shift_closure_expenses.length - 3}{" "}
                      مصروفة أخرى
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Show message if expenses are not archived yet */}
          {(!(closure as any).shift_closure_expenses ||
            (closure as any).shift_closure_expenses.length === 0) && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <Receipt className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p>لا توجد مصروفات مسجلة لهذه الوردية</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPrint(closure)}
              className="flex-1"
            >
              <Printer className="w-4 h-4 ml-2" />
              طباعة التقرير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Modal */}
      <ShiftExpensesModal
        shiftId={closure.id!}
        shiftDate={closure.shift_date}
        shiftType={closure.shift_type}
        isOpen={showExpensesModal}
        onClose={() => setShowExpensesModal(false)}
      />
    </>
  );
};

export default ShiftClosureCard;
