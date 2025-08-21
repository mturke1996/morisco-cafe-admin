
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDailyCashCount = (date?: string) => {
  return useQuery({
    queryKey: ["daily-cash-count", date],
    queryFn: async () => {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("daily_cash_count")
        .select("*")
        .eq("count_date", targetDate)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
};

export const useSaveDailyCashCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cashCountData: {
      count_date: string;
      coins_small: number;
      coins_one_dinar: number;
      bills_large: number;
      screen_sales_count: number;
      cash_sales: number;
      card_sales: number;
      tadawul_sales: number;
      presto_sales: number;
      daily_expenses: number;
      prev_coins_small: number;
      prev_coins_one_dinar: number;
      prev_bills_large: number;
    }) => {
      // حساب المجموع الفعلي
      const totalActual = cashCountData.coins_small + cashCountData.coins_one_dinar + cashCountData.bills_large;
      
      // حساب المجموع المحسوب
      const totalSales = cashCountData.cash_sales + cashCountData.card_sales + 
                        cashCountData.tadawul_sales + cashCountData.presto_sales;
      const prevBalance = cashCountData.prev_coins_small + cashCountData.prev_coins_one_dinar + 
                         cashCountData.prev_bills_large;
      const totalCalculated = prevBalance + totalSales - cashCountData.daily_expenses;
      
      // حساب الفرق
      const difference = totalActual - totalCalculated;

      const finalData = {
        ...cashCountData,
        total_actual: totalActual,
        total_calculated: totalCalculated,
        difference: difference,
        status: 'closed',
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      const { data, error } = await supabase
        .from("daily_cash_count")
        .upsert([finalData], { onConflict: 'count_date' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["daily-cash-count"] });
      toast.success("تم حفظ إغلاق الحساب اليومي بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حفظ البيانات");
      console.error(error);
    },
  });
};

export const useDailyExpenses = (date?: string) => {
  return useQuery({
    queryKey: ["daily-expenses", date],
    queryFn: async () => {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("date", targetDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      const total = data?.reduce((sum, expense) => sum + Number(expense.amount), 0) || 0;
      return { expenses: data || [], total };
    },
  });
};
