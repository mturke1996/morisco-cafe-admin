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
      return data.map((expense) => ({
        ...expense,
        expense_date: expense.date, // Map 'date' to 'expense_date' for compatibility
        description: expense.title || expense.description, // Use title as description if description is empty
      }));
    },
  });
};

export const useExpenseStats = () => {
  return useQuery({
    queryKey: ["expense-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      // Get today's expenses from main table (for current day)
      const { data: todayExpenses } = await supabase
        .from("expenses")
        .select("amount, category")
        .eq("date", today);

      // Get all archived expenses from shift closures
      const { data: archivedExpenses } = await supabase
        .from("shift_closure_expenses")
        .select("amount, category, date");

      // Get all current expenses (not yet archived)
      const { data: currentExpenses } = await supabase
        .from("expenses")
        .select("amount, category, date");

      // Combine archived and current expenses
      const allExpenses = [
        ...(archivedExpenses || []),
        ...(currentExpenses || []),
      ];

      // Calculate today's total (from current expenses)
      const today_total =
        todayExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

      // Calculate total expenses (archived + current)
      const total = allExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;

      // Calculate average daily expense (last 30 days from all expenses)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentExpenses =
        allExpenses?.filter((exp) => new Date(exp.date) >= thirtyDaysAgo) || [];
      const averageDaily =
        recentExpenses.length > 0
          ? recentExpenses.reduce((sum, exp) => sum + exp.amount, 0) / 30
          : 0;

      // Calculate most expensive category today
      const todayByCategory =
        todayExpenses?.reduce((acc, exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
          return acc;
        }, {} as Record<string, number>) || {};

      const mostExpensiveCategory =
        Object.entries(todayByCategory).sort(([, a], [, b]) => b - a)[0]?.[0] ||
        "لا توجد مصروفات";

      return {
        today: today_total,
        total,
        averageDaily: Math.round(averageDaily * 100) / 100,
        mostExpensiveCategory,
        todayCount: todayExpenses?.length || 0,
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
        .insert([
          {
            title: expenseData.description,
            description: expenseData.description,
            amount: expenseData.amount,
            category: expenseData.category,
            date: expenseData.expense_date,
          },
        ])
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

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseData: {
      id: string;
      description: string;
      amount: number;
      category: string;
      expense_date: string;
    }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update({
          title: expenseData.description,
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.expense_date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", expenseData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("تم تحديث المصروف بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في تحديث المصروف");
      console.error(error);
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (expenseId: string) => {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] });
      toast.success("تم حذف المصروف بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حذف المصروف");
      console.error(error);
    },
  });
};
