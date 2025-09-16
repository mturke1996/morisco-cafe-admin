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
import { Edit, Trash2, Plus, DollarSign, Calendar } from "lucide-react";
import {
  useEmployeeWithdrawals,
  useAddWithdrawal,
  useDeleteWithdrawal,
  useUpdateWithdrawal,
} from "@/hooks/useEmployeeFinancials";
import { AddWithdrawalModal } from "@/components/AddWithdrawalModal";

interface EmployeeWithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
  currentBalance: number;
}

const EmployeeWithdrawalModal = ({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  currentBalance,
}: EmployeeWithdrawalModalProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");

  const { data: withdrawals = [], isLoading } =
    useEmployeeWithdrawals(employeeId);
  const addWithdrawal = useAddWithdrawal();
  const deleteWithdrawal = useDeleteWithdrawal();
  const updateWithdrawal = useUpdateWithdrawal();

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

  const handleDeleteWithdrawal = (withdrawalId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السحب؟")) {
      deleteWithdrawal.mutate(withdrawalId);
    }
  };

  const handleEditWithdrawal = (withdrawal: any) => {
    setEditingWithdrawal(withdrawal);
    setEditAmount(withdrawal.amount.toString());
    setEditNotes(withdrawal.notes || "");
  };

  const handleUpdateWithdrawal = () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      return;
    }

    updateWithdrawal.mutate(
      {
        id: editingWithdrawal.id,
        amount: parseFloat(editAmount),
        notes: editNotes,
      },
      {
        onSuccess: () => {
          setEditingWithdrawal(null);
          setEditAmount("");
          setEditNotes("");
        },
      }
    );
  };

  const handleAddWithdrawal = (amount: number, notes: string) => {
    addWithdrawal.mutate({
      employee_id: employeeId,
      amount,
      notes,
    });
  };

  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[95vw] max-w-[600px] h-[90vh] max-h-[700px] p-4"
          dir="rtl"
        >
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" />
              <span className="truncate">السحوبات - {employeeName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Balance Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 mb-1">الرصيد الحالي</p>
                    <p className="text-xl font-bold text-blue-800">
                      {formatCurrency(currentBalance)}
                    </p>
                  </div>
                  <div className="text-right sm:text-left">
                    <p className="text-xs text-blue-600 mb-1">
                      إجمالي السحوبات
                    </p>
                    <p className="text-lg font-semibold text-blue-800">
                      {formatCurrency(totalWithdrawals)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Withdrawal Button */}
            <div className="flex justify-center sm:justify-end">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-gradient w-full sm:w-auto h-10"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة سحب جديد
              </Button>
            </div>

            {/* Withdrawals List */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-4">جاري التحميل...</div>
              ) : withdrawals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد سحوبات
                </div>
              ) : (
                withdrawals.map((withdrawal) => (
                  <Card
                    key={withdrawal.id}
                    className="bg-white/90 backdrop-blur-sm"
                  >
                    <CardContent className="p-3">
                      {editingWithdrawal?.id === withdrawal.id ? (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="edit-amount" className="text-sm">
                              المبلغ (د.ل)
                            </Label>
                            <Input
                              id="edit-amount"
                              type="number"
                              step="0.01"
                              min="0"
                              value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              className="h-9"
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-notes" className="text-sm">
                              ملاحظات
                            </Label>
                            <Textarea
                              id="edit-notes"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="ملاحظات السحب..."
                              className="min-h-[60px] text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={handleUpdateWithdrawal}
                              size="sm"
                              disabled={updateWithdrawal.isPending}
                              className="flex-1 h-8"
                            >
                              {updateWithdrawal.isPending
                                ? "جاري التحديث..."
                                : "حفظ"}
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingWithdrawal(null);
                                setEditAmount("");
                                setEditNotes("");
                              }}
                              variant="outline"
                              size="sm"
                              className="flex-1 h-8"
                            >
                              إلغاء
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="font-semibold text-base">
                                {formatCurrency(withdrawal.amount)}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {new Date(
                                  withdrawal.withdrawal_date
                                ).toLocaleDateString("en-US")}
                              </Badge>
                            </div>
                            {withdrawal.notes && (
                              <p className="text-xs text-muted-foreground truncate">
                                {withdrawal.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1 justify-end sm:justify-start">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditWithdrawal(withdrawal)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleDeleteWithdrawal(withdrawal.id)
                              }
                              className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Withdrawal Modal */}
      <AddWithdrawalModal
        employee={{ id: employeeId, name: employeeName, position: "موظف" }}
        currentBalance={currentBalance}
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </>
  );
};

export default EmployeeWithdrawalModal;
