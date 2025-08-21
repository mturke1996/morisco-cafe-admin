
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Calculator, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateSalaryInvoicePDF } from "./SalaryInvoicePDF";

interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

interface AttendanceStats {
  present_days: number;
  total_earnings: number;
  total_deductions: number;
  total_bonuses: number;
}

interface SalaryPaymentModalProps {
  employee: Employee;
  attendanceStats: AttendanceStats;
  dailyWage: number;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export const SalaryPaymentModal = ({
  employee,
  attendanceStats,
  dailyWage,
  isOpen,
  onClose,
  onPaymentComplete,
}: SalaryPaymentModalProps) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // إصلاح حساب المرتب - يجب ضرب عدد الأيام في اليومية
  const calculatedGrossAmount = attendanceStats.present_days * dailyWage;
  const netAmount = calculatedGrossAmount + attendanceStats.total_bonuses - attendanceStats.total_deductions;
  const remainingBalance = Math.max(0, netAmount - parseFloat(amountPaid || "0"));

  console.log('Salary calculation:', {
    present_days: attendanceStats.present_days,
    dailyWage: dailyWage,
    calculatedGrossAmount: calculatedGrossAmount,
    total_bonuses: attendanceStats.total_bonuses,
    total_deductions: attendanceStats.total_deductions,
    netAmount: netAmount
  });

  const handleFullPayment = () => {
    setAmountPaid(netAmount.toString());
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

    setIsProcessing(true);
    try {
      const currentMonth = new Date();
      const periodStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const periodEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const paymentData = {
        employee_id: employee.id,
        days_worked: attendanceStats.present_days,
        daily_wage: dailyWage,
        gross_amount: calculatedGrossAmount, // استخدام القيمة المحسوبة الصحيحة
        total_bonuses: attendanceStats.total_bonuses,
        total_deductions: attendanceStats.total_deductions,
        net_amount: netAmount,
        amount_paid: parseFloat(amountPaid),
        remaining_balance: remainingBalance,
        payment_status: remainingBalance > 0 ? 'partial' : 'full',
        notes: notes || null,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
      };

      console.log('Payment data to insert:', paymentData);

      const { data, error } = await supabase
        .from('salary_payments')
        .insert(paymentData)
        .select()
        .single();

      if (error) throw error;

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
        description: "تم تسجيل دفع المرتب وإنشاء الفاتورة",
      });

      onPaymentComplete();
      onClose();
    } catch (error) {
      console.error('خطأ في دفع المرتب:', error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل دفع المرتب",
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
          <DialogTitle className="text-xl text-center">دفع مرتب الموظف</DialogTitle>
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

          {/* Salary Summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">أيام العمل</p>
                    <p className="font-bold">{attendanceStats.present_days}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-muted-foreground">اليومية</p>
                    <p className="font-bold">{dailyWage.toFixed(2)} د.ل</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">إجمالي اليوميات ({attendanceStats.present_days} × {dailyWage.toFixed(2)})</span>
                <span className="font-medium text-green-600">+{calculatedGrossAmount.toFixed(2)} د.ل</span>
              </div>
              
              {attendanceStats.total_bonuses > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">المكافآت</span>
                  <span className="font-medium text-green-600">+{attendanceStats.total_bonuses.toFixed(2)} د.ل</span>
                </div>
              )}
              
              {attendanceStats.total_deductions > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">الخصومات</span>
                  <span className="font-medium text-red-600">-{attendanceStats.total_deductions.toFixed(2)} د.ل</span>
                </div>
              )}
              
              <hr className="my-2" />
              <div className="flex justify-between items-center font-semibold text-lg">
                <span>صافي المستحق</span>
                <span className="text-primary">{netAmount.toFixed(2)} د.ل</span>
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
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات إضافية..."
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
              disabled={isProcessing}
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
