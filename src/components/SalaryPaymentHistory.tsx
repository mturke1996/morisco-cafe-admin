
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSalaryInvoicePDF } from "./SalaryInvoicePDF";

interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

interface SalaryPayment {
  id: string;
  payment_date: string;
  days_worked: number;
  daily_wage: number;
  gross_amount: number;
  total_bonuses: number;
  total_deductions: number;
  net_amount: number;
  amount_paid: number;
  remaining_balance: number;
  payment_status: string;
  notes?: string;
  period_start: string;
  period_end: string;
}

interface SalaryPaymentHistoryProps {
  employeeId: string;
  employee: Employee;
}

export const SalaryPaymentHistory = ({ employeeId, employee }: SalaryPaymentHistoryProps) => {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPaymentHistory();
  }, [employeeId]);

  const fetchPaymentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('employee_id', employeeId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('خطأ في جلب سجل المدفوعات:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب سجل دفعات المرتبات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async (payment: SalaryPayment) => {
    await generateSalaryInvoicePDF({
      employee,
      paymentData: payment
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-sm text-muted-foreground">جاري تحميل سجل المدفوعات...</p>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">سجل دفعات المرتبات</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">لا توجد دفعات مسجلة بعد</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">سجل دفعات المرتبات</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {payments.map((payment) => (
          <div key={payment.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {new Date(payment.payment_date).toLocaleDateString('ar-LY')}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  الفترة: {new Date(payment.period_start).toLocaleDateString('ar-LY')} - {new Date(payment.period_end).toLocaleDateString('ar-LY')}
                </p>
              </div>
              <Badge variant={payment.payment_status === 'full' ? 'default' : 'secondary'}>
                {payment.payment_status === 'full' ? 'مدفوع بالكامل' : 'دفع جزئي'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">أيام العمل: </span>
                <span className="font-medium">{payment.days_worked}</span>
              </div>
              <div>
                <span className="text-muted-foreground">اليومية: </span>
                <span className="font-medium">{payment.daily_wage.toFixed(2)} د.ل</span>
              </div>
              <div>
                <span className="text-muted-foreground">المبلغ المدفوع: </span>
                <span className="font-medium text-green-600">{payment.amount_paid.toFixed(2)} د.ل</span>
              </div>
              <div>
                <span className="text-muted-foreground">المتبقي: </span>
                <span className="font-medium text-red-600">{payment.remaining_balance.toFixed(2)} د.ل</span>
              </div>
            </div>

            {payment.notes && (
              <div className="text-sm">
                <span className="text-muted-foreground">ملاحظات: </span>
                <span>{payment.notes}</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePrintInvoice(payment)}
              >
                <FileText className="w-4 h-4 ml-2" />
                طباعة الفاتورة
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
