
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useExpenses = () => {
  return useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data.map(expense => ({
        ...expense,
        expense_date: expense.date, // Map 'date' to 'expense_date' for compatibility
        description: expense.title || expense.description // Use title as description if description is empty
      }));
    },
  });
};

export const useExpenseStats = () => {
  return useQuery({
    queryKey: ["expense-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - 1);

      // Today's expenses
      const { data: todayExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .eq("date", today);

      // This week's expenses
      const { data: weekExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .gte("date", weekStart.toISOString().split('T')[0]);

      // This month's expenses
      const { data: monthExpenses } = await supabase
        .from("expenses")
        .select("amount")
        .gte("date", monthStart.toISOString().split('T')[0]);

      // Total expenses
      const { data: totalExpenses } = await supabase
        .from("expenses")
        .select("amount");

      const today_total = todayExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const week_total = weekExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const month_total = monthExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
      const total = totalExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

      return {
        today: today_total,
        this_week: week_total,
        this_month: month_total,
        total
      };
    },
  });
};

export const useAddExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (expenseData: {
      description: string;
      amount: number;
      category: string;
      expense_date: string;
    }) => {
      const { data, error } = await supabase
        .from("expenses")
        .insert([{
          title: expenseData.description,
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.expense_date
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("تم إضافة المصروف بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إضافة المصروف");
      console.error(error);
    },
  });
};
