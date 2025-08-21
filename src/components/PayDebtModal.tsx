
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayDebt } from "@/hooks/useCustomers";

interface PayDebtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  debt: {
    id: string;
    amount: number;
    paid_amount?: number;
    customers?: { name: string };
    description?: string;
  } | null;
}

const PayDebtModal = ({ open, onOpenChange, debt }: PayDebtModalProps) => {
  const [paymentAmount, setPaymentAmount] = useState("");
  const payDebt = usePayDebt();

  const remainingAmount = debt ? debt.amount - (debt.paid_amount || 0) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debt || !paymentAmount) return;

    const amount = parseFloat(paymentAmount);
    if (amount <= 0 || amount > remainingAmount) return;

    payDebt.mutate({
      debtId: debt.id,
      paidAmount: amount,
    }, {
      onSuccess: () => {
        setPaymentAmount("");
        onOpenChange(false);
      },
    });
  };

  if (!debt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>دفع دين</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>العميل:</strong> {debt.customers?.name}</p>
            <p><strong>إجمالي الدين:</strong> {debt.amount.toFixed(2)} د.ل</p>
            <p><strong>المدفوع:</strong> {(debt.paid_amount || 0).toFixed(2)} د.ل</p>
            <p><strong>المتبقي:</strong> {remainingAmount.toFixed(2)} د.ل</p>
            {debt.description && <p><strong>الوصف:</strong> {debt.description}</p>}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="payment">مبلغ الدفع (د.ل) *</Label>
              <Input
                id="payment"
                type="number"
                step="0.01"
                max={remainingAmount}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder={`أدخل مبلغ الدفع (الحد الأقصى: ${remainingAmount.toFixed(2)})`}
                required
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={payDebt.isPending}>
                {payDebt.isPending ? "جاري الدفع..." : "دفع"}
              </Button>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PayDebtModal;
