
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSendPaymentReminder } from "@/hooks/useInvoices";

interface SendReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string;
    phone?: string;
  } | null;
  debts: Array<{
    id: string;
    amount: number;
    paid_amount?: number;
    description?: string;
  }>;
}

const SendReminderModal = ({ open, onOpenChange, customer, debts }: SendReminderModalProps) => {
  const [selectedDebt, setSelectedDebt] = useState<string>("");
  const [message, setMessage] = useState("");
  const [useTemplate, setUseTemplate] = useState(true);
  const sendReminder = useSendPaymentReminder();

  const unpaidDebts = debts.filter(debt => debt.amount > (debt.paid_amount || 0));
  const totalDebt = unpaidDebts.reduce((sum, debt) => sum + (debt.amount - (debt.paid_amount || 0)), 0);

  const generateMessage = () => {
    if (!customer) return "";
    
    if (selectedDebt) {
      const debt = unpaidDebts.find(d => d.id === selectedDebt);
      if (debt) {
        const remaining = debt.amount - (debt.paid_amount || 0);
        return `عزيزي/عزيزتي ${customer.name},\n\nنذكركم بوجود دين مستحق بقيمة ${remaining.toFixed(2)} د.ل.\n\nالوصف: ${debt.description || 'غير محدد'}\n\nنرجو منكم التواصل معنا لتسوية هذا المبلغ في أقرب وقت ممكن.\n\nشكراً لتعاونكم`;
      }
    }
    
    return `عزيزي/عزيزتي ${customer.name},\n\nنذكركم بوجود إجمالي ديون مستحقة بقيمة ${totalDebt.toFixed(2)} د.ل.\n\nعدد الديون المعلقة: ${unpaidDebts.length}\n\nنرجو منكم التواصل معنا لتسوية هذه المبالغ في أقرب وقت ممكن.\n\nشكراً لتعاونكم`;
  };

  const handleTemplateChange = (value: string) => {
    setUseTemplate(value === "true");
    if (value === "true") {
      setMessage(generateMessage());
    } else {
      setMessage("");
    }
  };

  const handleDebtChange = (debtId: string) => {
    setSelectedDebt(debtId);
    if (useTemplate) {
      setTimeout(() => setMessage(generateMessage()), 100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !message.trim()) return;

    sendReminder.mutate({
      customer_id: customer.id,
      debt_id: selectedDebt || undefined,
      message: message.trim(),
    }, {
      onSuccess: () => {
        setSelectedDebt("");
        setMessage("");
        setUseTemplate(true);
        onOpenChange(false);
      },
    });
  };

  React.useEffect(() => {
    if (useTemplate && open) {
      setMessage(generateMessage());
    }
  }, [useTemplate, selectedDebt, open]);

  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إرسال تذكير دفع</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <p><strong>العميل:</strong> {customer.name}</p>
            {customer.phone && <p><strong>الهاتف:</strong> {customer.phone}</p>}
            <p><strong>إجمالي الديون المعلقة:</strong> {totalDebt.toFixed(2)} د.ل</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="template">نوع الرسالة</Label>
              <Select value={useTemplate.toString()} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">قالب تلقائي</SelectItem>
                  <SelectItem value="false">رسالة مخصصة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {useTemplate && unpaidDebts.length > 1 && (
              <div>
                <Label htmlFor="debt">دين محدد (اختياري)</Label>
                <Select value={selectedDebt} onValueChange={handleDebtChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="جميع الديون" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الديون</SelectItem>
                    {unpaidDebts.map((debt) => (
                      <SelectItem key={debt.id} value={debt.id}>
                        {(debt.amount - (debt.paid_amount || 0)).toFixed(2)} د.ل
                        {debt.description && ` - ${debt.description}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div>
              <Label htmlFor="message">نص الرسالة *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب رسالة التذكير هنا..."
                rows={8}
                required
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={sendReminder.isPending}>
                {sendReminder.isPending ? "جاري الإرسال..." : "إرسال التذكير"}
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

export default SendReminderModal;
