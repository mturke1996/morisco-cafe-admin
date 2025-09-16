import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, CheckCircle } from "lucide-react";
import { useAddSalaryPayment } from "@/hooks/useEmployeeFinancials";

interface EmployeeSalaryPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  currentBalance: number;
  employeeSalary: number;
}

const EmployeeSalaryPaymentModal = ({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  currentBalance,
  employeeSalary,
}: EmployeeSalaryPaymentModalProps) => {
  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const addSalaryPayment = useAddSalaryPayment();

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

  const handlePayment = async () => {
    if (!amountPaid || parseFloat(amountPaid) <= 0) {
      return;
    }

    const paymentAmount = parseFloat(amountPaid);
    if (paymentAmount > currentBalance) {
      return;
    }

    setIsProcessing(true);
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Get first day of current month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const firstDayStr = firstDay.toISOString().split('T')[0];
      
      // Get last day of current month
      const lastDay = new Date(currentYear, currentMonth + 1, 0);
      const lastDayStr = lastDay.toISOString().split('T')[0];

      await addSalaryPayment.mutateAsync({
        employee_id: employeeId,
        amount_paid: paymentAmount,
        period_start: firstDayStr,
        period_end: lastDayStr,
        notes: notes || null,
      });

      setAmountPaid("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing salary payment:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFullPayment = () => {
    setAmountPaid(currentBalance.toString());
  };

  const remainingBalance = currentBalance - parseFloat(amountPaid || "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] h-[90vh] max-h-[600px] p-4" dir="rtl">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="w-5 h-5" />
            <span className="truncate">دفع المرتب - {employeeName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Employee Info */}
          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-base">{employeeName}</p>
                  <p className="text-sm text-green-600">الراتب الشهري: {formatCurrency(employeeSalary)}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="w-3 h-3 ml-1" />
                  دفع المرتب
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Balance Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-3">
              <div className="text-center">
                <p className="text-sm text-blue-600 mb-1">الرصيد المتاح للدفع</p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatCurrency(currentBalance)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount" className="text-sm">المبلغ المدفوع (د.ل) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={currentBalance}
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                className="h-10"
              />
              <div className="flex justify-between items-center mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFullPayment}
                  className="text-xs"
                >
                  دفع كامل
                </Button>
                <span className="text-xs text-muted-foreground">
                  الحد الأقصى: {formatCurrency(currentBalance)}
                </span>
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="text-sm">ملاحظات</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات دفع المرتب..."
                className="min-h-[80px] text-sm"
              />
            </div>

            {amountPaid && parseFloat(amountPaid) > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">الرصيد المتبقي بعد الدفع</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {formatCurrency(remainingBalance)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handlePayment}
              disabled={isProcessing || !amountPaid || parseFloat(amountPaid) <= 0 || parseFloat(amountPaid) > currentBalance}
              className="flex-1 h-10"
            >
              {isProcessing ? "جاري المعالجة..." : "تأكيد الدفع"}
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1 h-10"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeSalaryPaymentModal;
