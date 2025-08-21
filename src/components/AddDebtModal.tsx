
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddDebt } from "@/hooks/useCustomers";

interface AddDebtModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string;
  } | null;
}

const AddDebtModal = ({ open, onOpenChange, customer }: AddDebtModalProps) => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const addDebt = useAddDebt();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !amount) return;

    addDebt.mutate({
      customer_id: customer.id,
      amount: parseFloat(amount),
      description: description || null,
    }, {
      onSuccess: () => {
        setAmount("");
        setDescription("");
        onOpenChange(false);
      },
    });
  };

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة دين جديد</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>العميل:</strong> {customer.name}</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">مبلغ الدين (د.ل) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل مبلغ الدين"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">الوصف (اختياري)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف الدين أو سبب الإضافة"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={addDebt.isPending}>
                {addDebt.isPending ? "جاري الإضافة..." : "إضافة الدين"}
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

export default AddDebtModal;
