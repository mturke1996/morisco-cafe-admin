import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateExpense } from "@/hooks/useExpenses";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface EditExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}

const EditExpenseModal = ({
  open,
  onOpenChange,
  expense,
}: EditExpenseModalProps) => {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    expense_date: "",
  });

  const updateExpense = useUpdateExpense();

  const categories = [
    "سحوبات شخصية",
    "مرتبات الموظفين",
    "صيانة المعدات",
    "مشتريات المطبخ",
    "دفع فواتير الكهرباء",
    "دفع فواتير المياه",
    "دفع فواتير الإنترنت",
    "تأجير المحل",
    "تسويق وإعلان",
    "مستلزمات مكتبية",
    "تنظيف وصيانة عامة",
    "تأمين وتراخيص",
    "نقل وشحن",
    "أخرى",
  ];

  // Update form data when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || "",
        amount: expense.amount.toString(),
        category: expense.category || "",
        expense_date:
          expense.expense_date || new Date().toISOString().split("T")[0],
      });
    }
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.description ||
      !formData.amount ||
      !formData.category ||
      !expense
    ) {
      return;
    }

    updateExpense.mutate(
      {
        id: expense.id,
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        expense_date: formData.expense_date,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المصروف</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="description">الوصف *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">الفئة *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, expense_date: e.target.value })
              }
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              className="flex-1"
              disabled={updateExpense.isPending}
            >
              {updateExpense.isPending ? "جاري التحديث..." : "تحديث المصروف"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditExpenseModal;
