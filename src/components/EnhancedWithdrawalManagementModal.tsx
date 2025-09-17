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
  const [activeTab, setActiveTab] = useState("today");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingWithdrawal, setEditingWithdrawal] = useState<Withdrawal | null>(
    null
  );
  const [editAmount, setEditAmount] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [editDate, setEditDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const { toast } = useToast();
  const { data: todayWithdrawals = [], isLoading: todayLoading } =
    useWithdrawals(employeeId, selectedDate);
  const { data: allWithdrawals = [], isLoading: allLoading } = useWithdrawals(
    employeeId,
    undefined
  );
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

  const handleDeleteWithdrawal = (withdrawalId: string) => {
    if (confirm("هل أنت متأكد من حذف هذا السحب؟")) {
      deleteWithdrawal.mutate(withdrawalId);
    }
  };

  const handleEditWithdrawal = (withdrawal: Withdrawal) => {
    setEditingWithdrawal(withdrawal);
    setEditAmount(withdrawal.amount.toString());
    setEditNotes(withdrawal.notes || "");
    setEditDate(withdrawal.withdrawal_date);
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
    } catch (error) {
      console.error("خطأ في تحديث السحب:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث السحب",
        variant: "destructive",
      });
    }
  };

  const handleAddWithdrawal = async (withdrawalData: {
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
    } catch (error) {
      console.error("خطأ في تسجيل السحب:", error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل السحب",
        variant: "destructive",
      });
    }
  };

  const filteredWithdrawals = allWithdrawals.filter((withdrawal) => {
    const matchesSearch =
      searchTerm === "" ||
      withdrawal.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.amount.toString().includes(searchTerm);

    const withdrawalDate = new Date(withdrawal.withdrawal_date);
    const fromDate = new Date(dateRange.from);
    const toDate = new Date(dateRange.to);

    const matchesDateRange =
      withdrawalDate >= fromDate && withdrawalDate <= toDate;

    return matchesSearch && matchesDateRange;
  });

  const totalTodayWithdrawals = todayWithdrawals.reduce(
    (sum, w) => sum + w.amount,
    0
  );
  const totalFilteredWithdrawals = filteredWithdrawals.reduce(
    (sum, w) => sum + w.amount,
    0
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="w-[95vw] max-w-[800px] h-[90vh] max-h-[800px] p-4"
          dir="rtl"
        >
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="w-5 h-5" />
              <span className="truncate">إدارة السحوبات - {employeeName}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Balance Info */}
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-blue-600 mb-1">الرصيد الحالي</p>
                    <p className="text-xl font-bold text-blue-800">
                      {formatCurrency(currentBalance)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-blue-600 mb-1">سحوبات اليوم</p>
                    <p className="text-lg font-semibold text-blue-800">
                      {formatCurrency(totalTodayWithdrawals)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-blue-600 mb-1">
                      إجمالي السحوبات
                    </p>
                    <p className="text-lg font-semibold text-blue-800">
                      {formatCurrency(totalFilteredWithdrawals)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="today" className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  اليوم
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center gap-2"
                >
                  <History className="w-4 h-4" />
                  السجل الكامل
                </TabsTrigger>
              </TabsList>

              <TabsContent value="today" className="space-y-4">
                {/* Today's Withdrawals */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">سحوبات اليوم</span>
                    <Badge variant="outline">{todayWithdrawals.length}</Badge>
                  </div>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-9"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة سحب
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {todayLoading ? (
                    <div className="text-center py-4">جاري التحميل...</div>
                  ) : todayWithdrawals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد سحوبات لهذا اليوم</p>
                    </div>
                  ) : (
                    todayWithdrawals.map((withdrawal) => (
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
                      />
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {/* Historical Withdrawals */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span className="font-medium">السحوبات المفلترة</span>
                    <Badge variant="outline">
                      {filteredWithdrawals.length}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-9"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة سحب بتاريخ قديم
                  </Button>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {allLoading ? (
                    <div className="text-center py-4">جاري التحميل...</div>
                  ) : filteredWithdrawals.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد سحوبات في الفترة المحددة</p>
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
              </TabsContent>
            </Tabs>
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

const WithdrawalCard = ({
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

  return (
    <Card className="bg-white/90 backdrop-blur-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-lg text-red-600">
                {formatCurrency(withdrawal.amount)}
              </span>
              <Badge variant="outline" className="text-xs">
                {formatTime(withdrawal.created_at)}
              </Badge>
              {showDate && (
                <Badge variant="secondary" className="text-xs">
                  {formatDate(withdrawal.withdrawal_date)}
                </Badge>
              )}
            </div>
            {withdrawal.notes && (
              <p className="text-sm text-muted-foreground mb-2">
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
      </CardContent>
    </Card>
  );
};

export default EnhancedWithdrawalManagementModal;
