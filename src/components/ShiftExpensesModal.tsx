import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Receipt, Calendar, DollarSign, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ShiftExpense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string | null;
  date: string;
  receipt_url: string | null;
  created_at: string;
}

interface ShiftExpensesModalProps {
  shiftId: string;
  shiftDate: string;
  shiftType: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShiftExpensesModal = ({
  shiftId,
  shiftDate,
  shiftType,
  isOpen,
  onClose,
}: ShiftExpensesModalProps) => {
  const [expenses, setExpenses] = useState<ShiftExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    if (isOpen && shiftId) {
      fetchShiftExpenses();
    }
  }, [isOpen, shiftId]);

  const fetchShiftExpenses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("shift_closure_expenses")
        .select("*")
        .eq("shift_closure_id", shiftId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setExpenses(data || []);
      const total = (data || []).reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      setTotalAmount(total);
    } catch (error) {
      console.error("Error fetching shift expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ar-LY");
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} د.ل`;
  };

  const getShiftTypeText = (type: string) => {
    return type === "morning" ? "صباحية" : "مسائية";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] p-0" dir="rtl">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">مصروفات الوردية</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(shiftDate)}</span>
            <Badge variant="outline" className="text-xs">
              {getShiftTypeText(shiftType)}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Receipt className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  جاري تحميل المصروفات...
                </p>
              </div>
            </div>
          ) : expenses.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا توجد مصروفات</h3>
                <p className="text-muted-foreground text-sm">
                  لم يتم تسجيل أي مصروفات لهذه الوردية
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Total Summary */}
              <div className="p-4 bg-muted/50 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">إجمالي المصروفات</span>
                  <span className="text-lg font-bold text-red-600">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {expenses.length} مصروفة مسجلة
                </div>
              </div>

              {/* Expenses List */}
              <ScrollArea className="h-[60vh]">
                <div className="p-4 space-y-3">
                  {expenses.map((expense) => (
                    <Card
                      key={expense.id}
                      className="border-l-4 border-l-red-500"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {expense.title}
                            </h4>
                            {expense.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {expense.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right mr-3">
                            <span className="font-bold text-red-600 text-sm">
                              {formatCurrency(expense.amount)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            {expense.category && (
                              <>
                                <Tag className="w-3 h-3" />
                                <Badge
                                  variant="secondary"
                                  className="text-xs px-2 py-0"
                                >
                                  {expense.category}
                                </Badge>
                              </>
                            )}
                          </div>
                          <span>{formatDate(expense.date)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-background">
          <Button onClick={onClose} className="w-full">
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
