import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Edit,
  Trash2,
  Plus,
  DollarSign,
  Calendar,
  Clock,
  Search,
  Filter,
  History,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  useWithdrawals,
  useDeleteWithdrawal,
  useUpdateWithdrawal,
} from "@/hooks/useAttendance";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AddWithdrawalModal } from "@/components/AddWithdrawalModal";

interface EnhancedWithdrawalManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

const EnhancedWithdrawalManagementModal = ({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  currentBalance,
}: EnhancedWithdrawalManagementModalProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(
    null
  );
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDate, setEditDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");

  const { toast } = useToast();

  // Fetch all withdrawals for the employee
  const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
  const [allLoading, setAllLoading] = useState(false);

  const fetchAllWithdrawals = useCallback(async () => {
    setAllLoading(true);
    try {
      const { data, error } = await supabase
        .from("employee_withdrawals")
        .select(
          `
          *,
          employees (
            id,
            name,
            position
          )
        `
        )
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAllWithdrawals(data || []);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب السحوبات",
        variant: "destructive",
      });
    } finally {
      setAllLoading(false);
    }
  }, [employeeId, toast]);

  useEffect(() => {
    if (open) {
      fetchAllWithdrawals();
    }
  }, [open, employeeId]);
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

  const handleDeleteWithdrawal = useCallback(
    (withdrawalId: string) => {
      if (confirm("هل أنت متأكد من حذف هذا السحب؟")) {
        deleteWithdrawal.mutate(withdrawalId, {
          onSuccess: () => {
            fetchAllWithdrawals(); // Refresh the list
            toast({
              title: "تم الحذف",
              description: "تم حذف السحب بنجاح",
            });
          },
          onError: () => {
            toast({
              title: "خطأ",
              description: "فشل في حذف السحب",
              variant: "destructive",
            });
          },
        });
      }
    },
    [deleteWithdrawal, fetchAllWithdrawals, toast]
  );

  const handleEditWithdrawal = useCallback((withdrawal: Withdrawal) => {
    setEditingWithdrawal(withdrawal);
    setEditAmount(withdrawal.amount.toString());
    setEditNotes(withdrawal.notes || "");
    setEditDate(withdrawal.withdrawal_date);
  }, []);

  const handleUpdateWithdrawal = useCallback(async () => {
    if (!editAmount || parseFloat(editAmount) <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    if (!editDate) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار تاريخ السحب",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("employee_withdrawals")
        .update({
          amount: parseFloat(editAmount),
          notes: editNotes,
          withdrawal_date: editDate,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingWithdrawal!.id);

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم تحديث السحب بنجاح",
      });

      setEditingWithdrawal(null);
      setEditAmount("");
      setEditNotes("");
      setEditDate("");
      fetchAllWithdrawals(); // Refresh the list
    } catch (error) {
      console.error("خطأ في تحديث السحب:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث السحب",
        variant: "destructive",
      });
    }
  }, [editAmount, editDate, editingWithdrawal, fetchAllWithdrawals, toast]);

  const handleAddWithdrawal = useCallback(
    async (withdrawalData: {
      amount: number;
      withdrawal_date: string;
      notes?: string;
    }) => {
      try {
        const { error } = await supabase.from("employee_withdrawals").insert({
          employee_id: employeeId,
          ...withdrawalData,
        });

        if (error) throw error;

        toast({
          title: "تم السحب بنجاح",
          description: `تم تسجيل سحب ${withdrawalData.amount.toFixed(2)} د.ل`,
        });

        setIsAddModalOpen(false);
        fetchAllWithdrawals(); // Refresh the list
      } catch (error) {
        console.error("خطأ في تسجيل السحب:", error);
        toast({
          title: "خطأ",
          description: "فشل في تسجيل السحب",
          variant: "destructive",
        });
      }
    },
    [employeeId, fetchAllWithdrawals, toast]
  );

  const filteredWithdrawals = useMemo(() => {
    return allWithdrawals
      .filter((withdrawal) => {
        const matchesSearch =
          searchTerm === "" ||
          withdrawal.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          withdrawal.amount.toString().includes(searchTerm) ||
          withdrawal.withdrawal_date.includes(searchTerm);

        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "date") {
          return (
            new Date(b.withdrawal_date).getTime() -
            new Date(a.withdrawal_date).getTime()
          );
        } else {
          return b.amount - a.amount;
        }
      });
  }, [allWithdrawals, searchTerm, sortBy]);

  const { totalWithdrawals, totalCount } = useMemo(() => {
    const total = filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const count = filteredWithdrawals.length;
    return { totalWithdrawals: total, totalCount: count };
  }, [filteredWithdrawals]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[95vw] max-w-[900px] h-[90vh] max-h-[800px] p-0 overflow-hidden"
          dir="rtl"
        >
          <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <DialogTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="block">إدارة السحوبات</span>
                <span className="text-sm font-normal text-green-100">
                  {employeeName}
                </span>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {/* Balance Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-blue-600 mb-1 font-medium">
                      الرصيد الحالي
                    </p>
                    <p className="text-lg font-bold text-blue-800">
                      {formatCurrency(currentBalance)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-green-600 mb-1 font-medium">
                      إجمالي السحوبات
                    </p>
                    <p className="text-lg font-bold text-green-800">
                      {formatCurrency(totalWithdrawals)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg">
                    <p className="text-xs text-orange-600 mb-1 font-medium">
                      عدد السحوبات
                    </p>
                    <p className="text-lg font-bold text-orange-800">
                      {totalCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Sort */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search">البحث في السحوبات</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="البحث في المبلغ أو الملاحظات أو التاريخ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sort">ترتيب حسب</Label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "date" | "amount")
                  }
                  className="w-full p-3 border border-gray-300 rounded-md h-10 text-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="date">التاريخ (الأحدث أولاً)</option>
                  <option value="amount">المبلغ (الأكبر أولاً)</option>
                </select>
              </div>
            </div>

            {/* Withdrawals List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-lg">جميع السحوبات</span>
                  <Badge variant="secondary" className="px-3 py-1">
                    {totalCount} سحب
                  </Badge>
                </div>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="h-10 bg-green-600 hover:bg-green-700 text-white font-medium"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة سحب جديد
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {allLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-green-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل السحوبات...</p>
                  </div>
                ) : filteredWithdrawals.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">لا توجد سحوبات</p>
                    <p className="text-sm">ابدأ بإضافة سحب جديد</p>
                  </div>
                ) : (
                  filteredWithdrawals.map((withdrawal) => (
                    <WithdrawalCard
                      key={withdrawal.id}
                      withdrawal={withdrawal}
                      onEdit={handleEditWithdrawal}
                      onDelete={handleDeleteWithdrawal}
                      isEditing={editingWithdrawal?.id === withdrawal.id}
                      editAmount={editAmount}
                      editNotes={editNotes}
                      editDate={editDate}
                      onEditAmountChange={setEditAmount}
                      onEditNotesChange={setEditNotes}
                      onEditDateChange={setEditDate}
                      onSave={handleUpdateWithdrawal}
                      onCancel={() => {
                        setEditingWithdrawal(null);
                        setEditAmount("");
                        setEditNotes("");
                        setEditDate("");
                      }}
                      isSaving={updateWithdrawal.isPending}
                      showDate={true}
                    />
                  ))
                )}
              </div>
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
        onWithdrawalComplete={handleAddWithdrawal}
        allowPastDate={true}
      />
    </>
  );
};

interface WithdrawalCardProps {
  withdrawal: Withdrawal;
  onEdit: (withdrawal: Withdrawal) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  editAmount: string;
  editNotes: string;
  editDate: string;
  onEditAmountChange: (value: string) => void;
  onEditNotesChange: (value: string) => void;
  onEditDateChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  showDate?: boolean;
}

const WithdrawalCard = React.memo(
  ({
    withdrawal,
    onEdit,
    onDelete,
    isEditing,
    editAmount,
    editNotes,
    editDate,
    onEditAmountChange,
    onEditNotesChange,
    onEditDateChange,
    onSave,
    onCancel,
    isSaving,
    showDate = false,
  }: WithdrawalCardProps) => {
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
    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return {
        date: date.toLocaleDateString("en-US"),
        time: date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    };

    if (isEditing) {
      return (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
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
                <Label htmlFor="edit-date">تاريخ السحب</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editDate}
                  onChange={(e) => onEditDateChange(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">ملاحظات</Label>
                <Textarea
                  id="edit-notes"
                  value={editNotes}
                  onChange={(e) => onEditNotesChange(e.target.value)}
                  placeholder="ملاحظات السحب..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={onSave}
                  size="sm"
                  disabled={
                    isSaving ||
                    !editAmount ||
                    parseFloat(editAmount) <= 0 ||
                    !editDate
                  }
                >
                  {isSaving ? "جاري التحديث..." : "حفظ"}
                </Button>
                <Button onClick={onCancel} variant="outline" size="sm">
                  إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    const withdrawalDateTime = formatDateTime(withdrawal.created_at);
    const withdrawalDate = formatDate(withdrawal.withdrawal_date);

    return (
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200 hover:shadow-lg transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xl text-red-700">
                      {formatCurrency(withdrawal.amount)}
                    </span>
                    <Badge variant="destructive" className="text-xs px-2 py-1">
                      سحب
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>تاريخ السحب: {withdrawalDate}</span>
                    <span>•</span>
                    <span>وقت التسجيل: {withdrawalDateTime.time}</span>
                  </div>
                </div>
              </div>

              {withdrawal.notes && (
                <div className="bg-white p-3 rounded-lg border border-red-100 mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      📝
                    </span>
                    <span className="text-xs font-medium text-gray-600">
                      ملاحظات
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{withdrawal.notes}</p>
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>تاريخ الإنشاء: {withdrawalDateTime.date}</span>
                <span>•</span>
                <span>وقت الإنشاء: {withdrawalDateTime.time}</span>
              </div>
            </div>

            <div className="flex gap-2 sm:flex-col">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(withdrawal)}
                className="flex-1 sm:w-full h-10 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                <Edit className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline ml-1">تعديل</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(withdrawal.id)}
                className="flex-1 sm:w-full h-10 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
              >
                <Trash2 className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline ml-1">حذف</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

WithdrawalCard.displayName = "WithdrawalCard";

export default EnhancedWithdrawalManagementModal;
