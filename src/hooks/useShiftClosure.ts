import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useToast } from "@/components/ui/use-toast";

export interface ShiftClosureData {
  id?: string;
  shift_type: "morning" | "evening";
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
      try {
        let query = supabase
          .from("shift_closures")
          .select(`*, shift_closure_expenses(*)`) // Try to fetch related expenses
          .order("created_at", { ascending: false });

        if (date) {
          query = query.eq("shift_date", date);
        }

        const { data, error } = await query;
        if (error) {
          // If the shift_closure_expenses table doesn't exist, try without it
          if (error.message.includes("shift_closure_expenses")) {
            console.warn(
              "shift_closure_expenses table not found, fetching basic data only"
            );
            let basicQuery = supabase
              .from("shift_closures")
              .select(`*`)
              .order("created_at", { ascending: false });

            if (date) {
              basicQuery = basicQuery.eq("shift_date", date);
            }

            const { data: basicData, error: basicError } = await basicQuery;
            if (basicError) throw basicError;
            return basicData as ShiftClosureData[];
          }
          throw error;
        }
        return data as ShiftClosureData[];
      } catch (error) {
        console.error("Error fetching shift closures:", error);
        throw error;
      }
    },
  });
};

export const useSaveShiftClosure = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (
      shiftData: Omit<ShiftClosureData, "id" | "created_at" | "created_by">
    ) => {
      try {
        // Fetch expenses for the current shift date
        const { data: expensesRows, error: expensesErr } = await supabase
          .from("expenses")
          .select("id, title, amount, category, date, description")
          .eq("date", shiftData.shift_date);

        if (expensesErr) throw expensesErr;
        const expensesTotal = (expensesRows || []).reduce(
          (sum: number, row: any) => sum + Number(row.amount || 0),
          0
        );

        // Calculate totals based on the user's exact formula
        const totalActual =
          shiftData.coins_small +
          shiftData.coins_one_dinar +
          shiftData.bills_large;
        const totalSales =
          shiftData.cash_sales +
          shiftData.card_sales +
          shiftData.tadawul_sales +
          shiftData.presto_sales;
        const prevTotal =
          shiftData.prev_coins_small +
          shiftData.prev_coins_one_dinar +
          shiftData.prev_bills_large;
        const totalBeforeScreen =
          totalActual + totalSales + expensesTotal - prevTotal;
        const finalAfterScreen = totalBeforeScreen - shiftData.screen_sales;

        const { data: userData } = await supabase.auth.getUser();

        const finalData = {
          ...shiftData,
          shift_expenses: expensesTotal, // Store the total expenses for this shift
          total_actual: totalActual,
          total_calculated: totalBeforeScreen, // Store total before screen sales
          difference: finalAfterScreen, // Store final difference after screen sales
          created_by: userData.user?.id,
        };

        // Insert shift closure
        const { data, error } = await supabase
          .from("shift_closures")
          .insert([finalData])
          .select()
          .single();

        if (error) throw error;

        // Archive individual expenses to the new table (if it exists)
        if (expensesRows && expensesRows.length > 0) {
          try {
            const archivedExpenses = expensesRows.map((exp) => ({
              shift_closure_id: data.id,
              title: exp.title,
              description: exp.description,
              amount: exp.amount,
              category: exp.category,
              date: exp.date,
              created_by: exp.created_by,
            }));

            const { error: archiveError } = await supabase
              .from("shift_closure_expenses")
              .insert(archivedExpenses);

            if (archiveError) {
              console.warn("Failed to archive expenses:", archiveError);
            }
          } catch (archiveError) {
            console.warn("Error during expense archiving:", archiveError);
          }
        }

        // CRITICAL: Always clear expenses from main table after shift closure
        console.log("تحاول حذف المصروفات للتاريخ:", shiftData.shift_date);

        // Method 1: Delete by date (most reliable)
        const { error: dateDeleteError, count: deletedCount } = await supabase
          .from("expenses")
          .delete()
          .eq("date", shiftData.shift_date);

        if (dateDeleteError) {
          console.error("فشل في حذف المصروفات بالتاريخ:", dateDeleteError);

          // Method 2: Try deleting by IDs as fallback
          if (expensesRows && expensesRows.length > 0) {
            const expenseIdsToDelete = expensesRows.map((exp) => exp.id);
            const { error: idDeleteError } = await supabase
              .from("expenses")
              .delete()
              .in("id", expenseIdsToDelete);

            if (idDeleteError) {
              console.error("فشل في حذف المصروفات بالـ ID:", idDeleteError);
              throw new Error(
                "فشل في تصفير المصروفات بعد إغلاق الوردية - يرجى المحاولة مرة أخرى"
              );
            } else {
              console.log("تم حذف المصروفات بنجاح باستخدام الـ ID");
            }
          } else {
            throw new Error("فشل في تصفير المصروفات - لا توجد مصروفات لحذفها");
          }
        } else {
          console.log(
            `تم حذف ${deletedCount || 0} مصروفة بنجاح للتاريخ ${
              shiftData.shift_date
            }`
          );
        }

        return data;
      } catch (error) {
        console.error("Error in shift closure save:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shift-closures"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] }); // Invalidate main expenses list
      queryClient.invalidateQueries({ queryKey: ["daily-expenses"] }); // Invalidate daily expenses hook
      queryClient.invalidateQueries({ queryKey: ["expense-stats"] }); // Invalidate expense stats
      toast.success("تم حفظ إغلاق الوردية بنجاح");
    },
    onError: (error) => {
      console.error("Error saving shift closure:", error);
      toast.error("فشل في حفظ إغلاق الوردية");
    },
  });
};
