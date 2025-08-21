
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      // First get customers with their basic info (only active customers)
      const { data: customers, error: customersError } = await supabase
        .from("customers")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (customersError) throw customersError;

      // Then get debt information for each customer
      const customersWithDebts = await Promise.all(
        customers.map(async (customer) => {
          const { data: debts, error: debtsError } = await supabase
            .from("customer_debts")
            .select("*")
            .eq("customer_id", customer.id);

          if (debtsError) throw debtsError;

          const total_debt = debts.reduce((sum, debt) => sum + debt.amount, 0);
          const total_paid = debts.reduce((sum, debt) => sum + (debt.paid_amount || 0), 0);
          const remaining_debt = total_debt - total_paid;

          return {
            ...customer,
            debts,
            total_debt,
            total_paid,
            remaining_debt
          };
        })
      );

      return customersWithDebts;
    },
  });
};

export const useCustomerStats = () => {
  return useQuery({
    queryKey: ["customer-stats"],
    queryFn: async () => {
      // Get total customers count (only active)
      const { count: total_customers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      // Get all debts to calculate totals
      const { data: debts, error } = await supabase
        .from("customer_debts")
        .select("amount, paid_amount");

      if (error) throw error;

      const total_debt = debts.reduce((sum, debt) => sum + debt.amount, 0);
      const total_paid = debts.reduce((sum, debt) => sum + (debt.paid_amount || 0), 0);
      const remaining_debt = total_debt - total_paid;

      return {
        total_customers: total_customers || 0,
        total_debt,
        total_paid,
        remaining_debt
      };
    },
  });
};

export const useCustomerDebts = (customerId?: string) => {
  return useQuery({
    queryKey: ["customer-debts", customerId],
    queryFn: async () => {
      let query = supabase
        .from("customer_debts")
        .select("*, customers(name)")
        .order("created_at", { ascending: false });

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerData: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
    }) => {
      const { data, error } = await supabase
        .from("customers")
        .insert([customerData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      toast.success("تم إضافة العميل بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إضافة العميل");
      console.error(error);
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      // Instead of deleting, we mark the customer as deleted
      const { data, error } = await supabase
        .from("customers")
        .update({ status: "deleted" })
        .eq("id", customerId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      toast.success("تم حذف العميل بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في حذف العميل");
      console.error(error);
    },
  });
};

export const useAddDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (debtData: {
      customer_id: string;
      amount: number;
      description?: string;
    }) => {
      const { data, error } = await supabase
        .from("customer_debts")
        .insert([debtData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-debts"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      toast.success("تم إضافة الدين بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في إضافة الدين");
      console.error(error);
    },
  });
};

export const usePayDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ debtId, paidAmount }: { debtId: string; paidAmount: number }) => {
      const { data: debt } = await supabase
        .from("customer_debts")
        .select("*")
        .eq("id", debtId)
        .single();

      if (!debt) throw new Error("الدين غير موجود");

      const totalPaid = (debt.paid_amount || 0) + paidAmount;
      const newStatus = totalPaid >= debt.amount ? "paid" : "partial";

      const { data, error } = await supabase
        .from("customer_debts")
        .update({
          paid_amount: totalPaid,
          status: newStatus,
        })
        .eq("id", debtId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-debts"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-stats"] });
      toast.success("تم دفع الدين بنجاح");
    },
    onError: (error) => {
      toast.error("حدث خطأ في دفع الدين");
      console.error(error);
    },
  });
};
