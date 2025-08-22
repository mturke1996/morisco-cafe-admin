
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Calculator, FileText, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateSalaryInvoicePDF } from "./SalaryInvoicePDF";

interface Employee {
  id: string;
  name: string;
  position: string;
}

interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  total_earnings: number;
  total_deductions: number;
  total_bonuses: number;
}

interface WithdrawalRecord {
  id: string;
  employee_id: string;
  amount: number;
  withdrawal_date: string;
  notes: string | null;
  created_at: string;
}

interface SalaryPaymentModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  currentBalance: number;
  attendanceStats: AttendanceStats;
  dailyWage: number;
  withdrawals: WithdrawalRecord[];
}

export const SalaryPaymentModal = ({
  employee,
  isOpen,
  onClose,
  onPaymentComplete,
  currentBalance,
  attendanceStats,
  dailyWage,
  withdrawals,
}: SalaryPaymentModalProps) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // حساب الإجماليات
  const calculatedEarnings = attendanceStats.present_days * dailyWage;
  const netEarnings = calculatedEarnings + attendanceStats.total_bonuses - attendanceStats.total_deductions;
  const totalWithdrawals = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0);
  const remainingBalance = currentBalance - parseFloat(amountPaid || "0");

  // تحديد فترة الدفع (الشهر الحالي)
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const periodStart = new Date(currentYear, currentMonth, 1);
  const periodEnd = new Date(currentYear, currentMonth + 1, 0);

  const handleFullPayment = () => {
    setAmountPaid(currentBalance.toString());
  };

  const handlePayment = async () => {
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive"
      });
      return;
    }

    const paymentAmount = parseFloat(amountPaid);
    if (paymentAmount > currentBalance) {
      toast({
        title: "خطأ",
        description: "المبلغ المطلوب أكبر من الرصيد المتاح",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData = {
        employee_id: employee.id,
        amount_paid: paymentAmount,
        payment_date: new Date().toISOString().split('T')[0],
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        notes: notes || null,
      };

      const { data, error } = await supabase
        .from('salary_payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

      // إذا كان الدفع كاملاً، قم بتصفير المسحوبات لهذا الشهر
      if (remainingBalance === 0) {
        const firstDayStr = periodStart.toISOString().split('T')[0];
        const nextMonthStr = new Date(currentYear, currentMonth + 1, 1).toISOString().split('T')[0];
        
        // حذف جميع المسحوبات لهذا الشهر
        const { error: withdrawalError } = await supabase
          .from('employee_withdrawals')
          .delete()
          .eq('employee_id', employee.id)
          .gte('withdrawal_date', firstDayStr)
          .lt('withdrawal_date', nextMonthStr);

        if (withdrawalError) {
          console.error('Error clearing withdrawals:', withdrawalError);
        } else {
          console.log('Successfully cleared withdrawals for full payment');
        }
      }

      // Generate and download PDF invoice
      await generateSalaryInvoicePDF({
        employee,
        paymentData: {
          ...data,
          payment_date: new Date().toISOString().split('T')[0]
        }
      });

      toast({
        title: "تم الدفع بنجاح",
        description: remainingBalance === 0 
          ? "تم تسجيل دفع المرتب كاملاً وتصفير المسحوبات" 
          : "تم تسجيل دفع المرتب وإنشاء الفاتورة",
      });

      onPaymentComplete();
      onClose();
      setAmountPaid("");
      setNotes("");
    } catch (error) {
      console.error('خطأ في تسجيل الدفع:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل الدفع",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">دفع راتب الموظف</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <h3 className="font-semibold text-lg">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.position}</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="text-center mb-3">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">الملخص المالي</h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <Calculator className="w-4 h-4 text-blue-600" />
                    أيام العمل
                  </span>
                  <span className="font-medium">{attendanceStats.present_days} يوم</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    اليومية
                  </span>
                  <span className="font-medium">{dailyWage.toFixed(2)} د.ل</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    إجمالي الكسب
                  </span>
                  <span className="font-medium">{calculatedEarnings.toFixed(2)} د.ل</span>
                </div>

                {attendanceStats.total_bonuses > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      المكافآت
                    </span>
                    <span className="font-medium text-green-600">+{attendanceStats.total_bonuses.toFixed(2)} د.ل</span>
                  </div>
                )}

                {attendanceStats.total_deductions > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Minus className="w-4 h-4 text-red-600" />
                      الخصومات
                    </span>
                    <span className="font-medium text-red-600">-{attendanceStats.total_deductions.toFixed(2)} د.ل</span>
                  </div>
                )}

                {totalWithdrawals > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Minus className="w-4 h-4 text-red-600" />
                      المسحوبات
                    </span>
                    <span className="font-medium text-red-600">-{totalWithdrawals.toFixed(2)} د.ل</span>
                  </div>
                )}

                <hr className="my-2" />
                
                <div className="flex justify-between items-center font-semibold">
                  <span>الرصيد المتاح</span>
                  <span className={`text-lg ${currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currentBalance >= 0 ? '+' : ''}{currentBalance.toFixed(2)} د.ل
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">المبلغ المدفوع</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="text-center"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleFullPayment}
                className="whitespace-nowrap"
              >
                الكامل
              </Button>
            </div>
            {amountPaid && (
              <p className="text-xs text-muted-foreground text-center">
                المتبقي: {remainingBalance.toFixed(2)} د.ل
                {remainingBalance === 0 && (
                  <span className="block text-green-600 font-medium mt-1">
                    سيتم تصفير المسحوبات تلقائياً
                  </span>
                )}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات حول الدفع..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button 
              onClick={handlePayment} 
              disabled={isProcessing || !amountPaid || parseFloat(amountPaid) <= 0 || parseFloat(amountPaid) > currentBalance}
              className="flex-1"
            >
              <DollarSign className="w-4 h-4 ml-2" />
              {isProcessing ? "جاري المعالجة..." : "تأكيد الدفع"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
