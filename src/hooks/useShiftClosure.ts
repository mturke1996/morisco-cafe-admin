
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ShiftClosureData {
  id?: string;
  shift_type: 'morning' | 'evening';
  shift_date: string;
  coins_small: number;
  coins_one_dinar: number;
  bills_large: number;
  screen_sales: number;
  cash_sales: number;
  card_sales: number;
  tadawul_sales: number;
  presto_sales: number;
  shift_expenses: number;
  prev_coins_small: number;
  prev_coins_one_dinar: number;
  prev_bills_large: number;
  total_actual: number;
  total_calculated: number;
  difference: number;
  created_at?: string;
  created_by?: string;
}

export const useShiftClosures = (date?: string) => {
  return useQuery({
    queryKey: ["shift-closures", date],
    queryFn: async () => {
      let query = supabase
        .from("shift_closures")
        .select("*")
        .order("created_at", { ascending: false });

      if (date) {
        query = query.eq("shift_date", date);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShiftClosureData[];
    },
  });
};

export const useSaveShiftClosure = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (shiftData: Omit<ShiftClosureData, 'id' | 'created_at' | 'created_by'>) => {
      // حساب المجاميع
      const totalActual = shiftData.coins_small + shiftData.coins_one_dinar + shiftData.bills_large;
      const totalSales = shiftData.cash_sales + shiftData.card_sales + shiftData.tadawul_sales + shiftData.presto_sales;
      const prevTotal = shiftData.prev_coins_small + shiftData.prev_coins_one_dinar + shiftData.prev_bills_large;
      const totalCalculated = prevTotal + totalSales - shiftData.shift_expenses;
      const difference = totalActual - totalCalculated;

      const { data: userData } = await supabase.auth.getUser();
      
      const finalData = {
        ...shiftData,
        total_actual: totalActual,
        total_calculated: totalCalculated,
        difference: difference,
        created_by: userData.user?.id,
      };

      const { data, error } = await supabase
        .from("shift_closures")
        .insert([finalData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-closures"] });
      toast.success("تم حفظ إغلاق الوردية بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حفظ البيانات");
      console.error(error);
    },
  });
};
