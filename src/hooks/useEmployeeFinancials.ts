import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useEmployeeBalance = (employeeId: string) => {
  return useQuery({
    queryKey: ["employee-balance", employeeId],
    queryFn: async () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Get first day of current month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const firstDayStr = firstDay.toISOString().split('T')[0];
      
      // Get first day of next month
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];

      // Get attendance records for current month
      const { data: attendanceData } = await supabase
        .from("attendance")
        .select("daily_wage_earned, deduction_amount, bonus_amount")
        .eq("employee_id", employeeId)
        .gte("date", firstDayStr)
        .lt("date", nextMonthStr);

      // Get withdrawals for current month
      const { data: withdrawalsData } = await supabase
        .from("employee_withdrawals")
        .select("amount")
        .eq("employee_id", employeeId)
        .gte("withdrawal_date", firstDayStr)
        .lt("withdrawal_date", nextMonthStr);

      // Get salary payments for current month
      const { data: salaryPaymentsData } = await supabase
        .from("salary_payments")
        .select("amount_paid")
        .eq("employee_id", employeeId)
        .gte("payment_date", firstDayStr)
        .lt("payment_date", nextMonthStr);

      // Calculate totals
      const totalEarnings = attendanceData?.reduce((sum, record) => 
        sum + (record.daily_wage_earned || 0) + (record.bonus_amount || 0) - (record.deduction_amount || 0), 0) || 0;
      
      const totalWithdrawals = withdrawalsData?.reduce((sum, record) => 
        sum + record.amount, 0) || 0;
      
      const totalPaid = salaryPaymentsData?.reduce((sum, record) => 
        sum + record.amount_paid, 0) || 0;

      const currentBalance = totalEarnings - totalWithdrawals - totalPaid;

      return {
        totalEarnings,
        totalWithdrawals,
        totalPaid,
        currentBalance,
        presentDays: attendanceData?.length || 0
      };
    },
    enabled: !!employeeId,
  });
};

export const useEmployeeWithdrawals = (employeeId: string) => {
  return useQuery({
    queryKey: ["employee-withdrawals", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_withdrawals")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
};

export const useAddWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (withdrawalData: {
      employee_id: string;
      amount: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("employee_withdrawals")
        .insert([{
          ...withdrawalData,
          withdrawal_date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-balance"] });
      queryClient.invalidateQueries({ queryKey: ["employee-withdrawals"] });
      toast.success("تم إضافة السحب بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إضافة السحب");
      console.error(error);
    },
  });
};

export const useDeleteWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (withdrawalId: string) => {
      const { error } = await supabase
        .from("employee_withdrawals")
        .delete()
        .eq("id", withdrawalId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-balance"] });
      queryClient.invalidateQueries({ queryKey: ["employee-withdrawals"] });
      toast.success("تم حذف السحب بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حذف السحب");
      console.error(error);
    },
  });
};

export const useUpdateWithdrawal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (withdrawalData: {
      id: string;
      amount: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("employee_withdrawals")
        .update({
          amount: withdrawalData.amount,
          notes: withdrawalData.notes,
          updated_at: new Date().toISOString()
        })
        .eq("id", withdrawalData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-balance"] });
      queryClient.invalidateQueries({ queryKey: ["employee-withdrawals"] });
      toast.success("تم تحديث السحب بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في تحديث السحب");
      console.error(error);
    },
  });
};

export const useSalaryPayments = (employeeId: string) => {
  return useQuery({
    queryKey: ["salary-payments", employeeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("salary_payments")
        .select("*")
        .eq("employee_id", employeeId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!employeeId,
  });
};

export const useAddSalaryPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (paymentData: {
      employee_id: string;
      amount_paid: number;
      period_start: string;
      period_end: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("salary_payments")
        .insert([{
          ...paymentData,
          payment_date: new Date().toISOString().split('T')[0],
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee-balance"] });
      queryClient.invalidateQueries({ queryKey: ["salary-payments"] });
      toast.success("تم إضافة دفع المرتب بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إضافة دفع المرتب");
      console.error(error);
    },
  });
};
