import { useState } from "react";
import { FileText, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useExpenses, useExpenseStats } from "@/hooks/useExpenses";
import { useShiftClosures, useSaveShiftClosure } from "@/hooks/useShiftClosure";
import AddExpenseModal from "@/components/AddExpenseModal";
import ShiftClosureModal from "@/components/ShiftClosureModal";
import ExpenseStatsCards from "@/components/ExpenseStatsCards";
import ExpensesList from "@/components/ExpensesList";
import ShiftClosuresList from "@/components/ShiftClosuresList";

const Expenses = () => {
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [isShiftClosureModalOpen, setIsShiftClosureModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const { data: expenses = [] } = useExpenses();
  const { data: expenseStats } = useExpenseStats();
  const { data: shiftClosures = [] } = useShiftClosures(selectedDate);
  const saveShiftClosure = useSaveShiftClosure();

  const handleSaveShiftClosure = (
    data: Parameters<typeof useSaveShiftClosure>[number] extends never
      ? never
      : NonNullable<
          Parameters<ReturnType<typeof useSaveShiftClosure>["mutate"]>[0]
        >
  ) => {
    saveShiftClosure.mutate(data, {
      onSuccess: () => {
        setIsShiftClosureModalOpen(false);
      },
    });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-3 sm:p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            المصروفات وإدارة الورديات
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            إدارة المصروفات اليومية وإغلاق الورديات الصباحية والمسائية
          </p>
        </div>

        {/* Stats Cards */}
        <ExpenseStatsCards stats={expenseStats} />

        {/* Tabs */}
        <Tabs defaultValue="expenses" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="expenses"
              className="text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              المصروفات
            </TabsTrigger>
            <TabsTrigger
              value="shifts"
              className="text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              إغلاق الورديات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-4">
            <ExpensesList
              expenses={expenses}
              onAddExpense={() => setIsAddExpenseModalOpen(true)}
            />
          </TabsContent>

          <TabsContent value="shifts" className="space-y-4">
            <ShiftClosuresList
              shiftClosures={shiftClosures}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onAddShiftClosure={() => setIsShiftClosureModalOpen(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <AddExpenseModal
          open={isAddExpenseModalOpen}
          onOpenChange={setIsAddExpenseModalOpen}
        />

        <ShiftClosureModal
          open={isShiftClosureModalOpen}
          onOpenChange={setIsShiftClosureModalOpen}
          onSave={handleSaveShiftClosure}
          initialDate={selectedDate}
        />
      </div>
    </div>
  );
};

export default Expenses;
