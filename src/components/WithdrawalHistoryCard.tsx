import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Minus,
  Calendar,
  Clock,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  DollarSign,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useWithdrawals, useDeleteWithdrawal, useUpdateWithdrawal } from "@/hooks/useAttendance";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WithdrawalHistoryCardProps {
  employeeId: string;
  employeeName: string;
  currentBalance: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  withdrawal_date: string;
  notes?: string;
  created_at: string;
  employees: {
    id: string;
    name: string;
    position: string;
  };
}

const WithdrawalHistoryCard = ({
  employeeId,
  employeeName,
  currentBalance,
}: WithdrawalHistoryCardProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { toast } = useToast();
  const { data: withdrawals = [], isLoading } = useWithdrawals(employeeId, undefined);
  const deleteWithdrawal = useDeleteWithdrawal();
  const updateWithdrawal = useUpdateWithdrawal();

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredWithdrawals = withdrawals.filter((withdrawal) => {
    const matchesSearch = searchTerm === "" || 
      withdrawal.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.amount.toString().includes(searchTerm);
    
    const withdrawalDate = new Date(withdrawal.withdrawal_date);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);
    
    const matchesDateRange = withdrawalDate >= fromDate && withdrawalDate <= toDate;
    
    return matchesSearch && matchesDateRange;
  });

  const totalWithdrawals = filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  const handleDeleteWithdrawal = (withdrawalId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السحب؟")) {
      deleteWithdrawal.mutate(withdrawalId);
    }
  };

  const handleEditWithdrawal = (withdrawal: Withdrawal) => {
    setEditingWithdrawal(withdrawal);
    setEditAmount(withdrawal.amount.toString());
    setEditNotes(withdrawal.notes || "");
  };

  const handleUpdateWithdrawal = async () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    updateWithdrawal.mutate(
      {
        id: editingWithdrawal!.id,
        amount: parseFloat(editAmount),
        notes: editNotes,
      },
      {
        onSuccess: () => {
          setEditingWithdrawal(null);
          setEditAmount("");
          setEditNotes("");
          toast({
            title: "تم التحديث",
            description: "تم تحديث السحب بنجاح",
          });
        },
      }
    );
  };

  const handleAddWithdrawal = async (withdrawalData: {
    amount: number;
    withdrawal_date: string;
    notes?: string;
  }) => {
    try {
      const { error } = await supabase
        .from("employee_withdrawals")
        .insert({
          employee_id: employeeId,
          ...withdrawalData,
        });

      if (error) throw error;

      toast({
        title: "تم السحب بنجاح",
        description: `تم تسجيل سحب ${withdrawalData.amount.toFixed(2)} د.ل`,
      });

      setIsAddModalOpen(false);
    } catch (error) {
      console.error("خطأ في تسجيل السحب:", error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل السحب",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Minus className="w-5 h-5" />
            سجل السحوبات
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsAddModalOpen(true)}
              size="sm"
              className="h-8"
            >
              <Plus className="w-4 h-4 ml-1" />
              إضافة سحب
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-600 mb-1">الرصيد الحالي</p>
            <p className="text-lg font-bold text-blue-800">
              {formatCurrency(currentBalance)}
            </p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-red-600 mb-1">إجمالي السحوبات</p>
            <p className="text-lg font-bold text-red-800">
              {formatCurrency(totalWithdrawals)}
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-green-600 mb-1">عدد السحوبات</p>
            <p className="text-lg font-bold text-green-800">
              {filteredWithdrawals.length}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <Label htmlFor="search">البحث</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="البحث في الملاحظات أو المبلغ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="from-date">من تاريخ</Label>
            <Input
              id="from-date"
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange({ ...dateRange, from: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="to-date">إلى تاريخ</Label>
            <Input
              id="to-date"
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange({ ...dateRange, to: e.target.value })
              }
            />
          </div>
        </div>

        {/* Withdrawals List */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-4">جاري التحميل...</div>
          ) : filteredWithdrawals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Minus className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد سحوبات في الفترة المحددة</p>
            </div>
          ) : (
            filteredWithdrawals.map((withdrawal) => (
              <WithdrawalItem
                key={withdrawal.id}
                withdrawal={withdrawal}
                onEdit={handleEditWithdrawal}
                onDelete={handleDeleteWithdrawal}
                isEditing={editingWithdrawal?.id === withdrawal.id}
                editAmount={editAmount}
                editNotes={editNotes}
                onEditAmountChange={setEditAmount}
                onEditNotesChange={setEditNotes}
                onSave={handleUpdateWithdrawal}
                onCancel={() => {
                  setEditingWithdrawal(null);
                  setEditAmount("");
                  setEditNotes("");
                }}
                isSaving={updateWithdrawal.isPending}
              />
            ))
          )}
        </div>
      </CardContent>

      {/* Add Withdrawal Modal */}
      <AddWithdrawalModal
        employee={{ id: employeeId, name: employeeName, position: "موظف" }}
        currentBalance={currentBalance}
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onWithdrawalComplete={handleAddWithdrawal}
        allowPastDate={true}
      />
    </Card>
  );
};

interface WithdrawalItemProps {
  withdrawal: Withdrawal;
  onEdit: (withdrawal: Withdrawal) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  editAmount: string;
  editNotes: string;
  onEditAmountChange: (value: string) => void;
  onEditNotesChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

const WithdrawalItem = ({
  withdrawal,
  onEdit,
  onDelete,
  isEditing,
  editAmount,
  editNotes,
  onEditAmountChange,
  onEditNotesChange,
  onSave,
  onCancel,
  isSaving,
}: WithdrawalItemProps) => {
  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isEditing) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="space-y-3">
          <div>
            <Label htmlFor="edit-amount">المبلغ (د.ل)</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              value={editAmount}
              onChange={(e) => onEditAmountChange(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-notes">ملاحظات</Label>
            <Input
              id="edit-notes"
              value={editNotes}
              onChange={(e) => onEditNotesChange(e.target.value)}
              placeholder="ملاحظات السحب..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={onSave}
              size="sm"
              disabled={isSaving || !editAmount || parseFloat(editAmount) <= 0}
            >
              {isSaving ? "جاري التحديث..." : "حفظ"}
            </Button>
            <Button onClick={onCancel} variant="outline" size="sm">
              إلغاء
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-lg text-red-600">
            {formatCurrency(withdrawal.amount)}
          </span>
          <Badge variant="outline" className="text-xs">
            {formatTime(withdrawal.created_at)}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {formatDate(withdrawal.withdrawal_date)}
          </Badge>
        </div>
        {withdrawal.notes && (
          <p className="text-sm text-muted-foreground mb-1">
            {withdrawal.notes}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>تاريخ السحب: {formatDate(withdrawal.withdrawal_date)}</span>
          <span>تاريخ الإنشاء: {formatDate(withdrawal.created_at)}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(withdrawal)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(withdrawal.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default WithdrawalHistoryCard;
