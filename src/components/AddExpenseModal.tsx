
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAddExpense } from "@/hooks/useExpenses";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddExpenseModal = ({ open, onOpenChange }: AddExpenseModalProps) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    expense_date: new Date().toISOString().split('T')[0],
  });

  const addExpense = useAddExpense();

  const categories = [
    "مكتب",
    "مطبخ", 
    "صيانة",
    "تسويق",
    "أخرى"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category) {
      return;
    }

    addExpense.mutate({
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      expense_date: formData.expense_date,
    }, {
      onSuccess: () => {
        setFormData({
          description: "",
          amount: "",
          category: "",
          expense_date: new Date().toISOString().split('T')[0],
        });
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مصروف جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">الوصف *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف المصروف..."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="amount">المبلغ (د.ل) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">الفئة *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="expense_date">التاريخ *</Label>
            <Input
              id="expense_date"
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
              required
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={addExpense.isPending}>
              {addExpense.isPending ? "جاري الإضافة..." : "إضافة المصروف"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExpenseModal;
