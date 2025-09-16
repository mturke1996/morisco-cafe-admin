import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAttendance = (date?: string) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ["attendance", targetDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select(`
          *,
          employees (
            id,
            name,
            position,
            salary
          )
        `)
        .eq("date", targetDate)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useDeleteAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendanceId: string) => {
      const { error } = await supabase
        .from("attendance")
        .delete()
        .eq("id", attendanceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("تم حذف سجل الحضور بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حذف سجل الحضور");
      console.error(error);
    },
  });
};

export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendanceData: {
      id: string;
      check_in?: string;
      check_out?: string;
      status?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("attendance")
        .update({
          ...attendanceData,
          updated_at: new Date().toISOString()
        })
        .eq("id", attendanceData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("تم تحديث سجل الحضور بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في تحديث سجل الحضور");
      console.error(error);
    },
  });
};

export const useWithdrawals = (employeeId?: string, date?: string) => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  return useQuery({
    queryKey: ["withdrawals", employeeId, targetDate],
    queryFn: async () => {
      let query = supabase
        .from("employee_withdrawals")
        .select(`
          *,
          employees (
            id,
            name,
            position
          )
        `)
        .eq("withdrawal_date", targetDate);

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!targetDate,
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
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["employee-balance"] });
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
      amount?: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("employee_withdrawals")
        .update({
          ...withdrawalData,
          updated_at: new Date().toISOString()
        })
        .eq("id", withdrawalData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["employee-balance"] });
      toast.success("تم تحديث السحب بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في تحديث السحب");
      console.error(error);
    },
  });
};
