import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteExpense } from "@/hooks/useExpenses";
import { Trash2, AlertTriangle } from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface DeleteExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}

const DeleteExpenseModal = ({
  open,
  onOpenChange,
  expense,
}: DeleteExpenseModalProps) => {
  const deleteExpense = useDeleteExpense();

  const handleDelete = () => {
    if (!expense) return;

    deleteExpense.mutate(expense.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            تأكيد حذف المصروف
          </DialogTitle>
          <DialogDescription className="text-right">
            هل أنت متأكد من أنك تريد حذف هذا المصروف؟ لا يمكن التراجع عن هذا
            الإجراء.
          </DialogDescription>
        </DialogHeader>

        {expense && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg text-red-600">
                  {formatCurrency(expense.amount)}
                </span>
                <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                  {expense.category}
                </span>
              </div>
              <p className="text-gray-700">{expense.description}</p>
              <p className="text-sm text-gray-500">
                {new Date(expense.expense_date).toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="flex-1"
            disabled={deleteExpense.isPending}
          >
            <Trash2 className="w-4 h-4 ml-2" />
            {deleteExpense.isPending ? "جاري الحذف..." : "حذف المصروف"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteExpenseModal;
