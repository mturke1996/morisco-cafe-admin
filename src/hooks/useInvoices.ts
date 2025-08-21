
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInvoices = (customerId?: string) => {
  return useQuery({
    queryKey: ["invoices", customerId],
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select(`
          *,
          customers(name, email, phone),
          invoice_items(*)
        `)
        .order("created_at", { ascending: false });

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching invoices:", error);
        throw error;
      }
      return data;
    },
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceData: {
      customer_id: string;
      items: Array<{
        description: string;
        quantity: number;
        unit_price: number;
      }>;
      notes?: string;
    }) => {
      console.log("Creating invoice with data:", invoiceData);
      
      // Generate invoice number
      const { data: invoiceNumber, error: numberError } = await supabase.rpc('generate_invoice_number');
      
      if (numberError) {
        console.error("Error generating invoice number:", numberError);
        throw numberError;
      }
      
      const total_amount = invoiceData.items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price), 0
      );

      console.log("Generated invoice number:", invoiceNumber);
      console.log("Calculated total amount:", total_amount);

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert([{
          customer_id: invoiceData.customer_id,
          invoice_number: invoiceNumber,
          total_amount,
          notes: invoiceData.notes,
        }])
        .select()
        .single();

      if (invoiceError) {
        console.error("Error creating invoice:", invoiceError);
        throw invoiceError;
      }

      console.log("Created invoice:", invoice);

      // Create invoice items
      const items = invoiceData.items.map(item => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
      }));

      console.log("Creating invoice items:", items);

      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

      if (itemsError) {
        console.error("Error creating invoice items:", itemsError);
        throw itemsError;
      }

      console.log("Successfully created invoice and items");
      return { ...invoice, invoice_items: items };
    },
    onSuccess: (data) => {
      console.log("Invoice created successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("تم إنشاء الفاتورة بنجاح");
    },
    onError: (error) => {
      console.error("Failed to create invoice:", error);
      toast.error("حدث خطأ في إنشاء الفاتورة");
    },
  });
};

export const usePaymentReminders = (customerId?: string) => {
  return useQuery({
    queryKey: ["payment-reminders", customerId],
    queryFn: async () => {
      let query = supabase
        .from("payment_reminders")
        .select(`
          *,
          customers(name, phone),
          customer_debts(amount, paid_amount, description)
        `)
        .order("created_at", { ascending: false });

      if (customerId) {
        query = query.eq("customer_id", customerId);
      }

      const { data, error } = await query;
      if (error) {
        console.error("Error fetching payment reminders:", error);
        throw error;
      }
      return data;
    },
  });
};

export const useSendPaymentReminder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reminderData: {
      customer_id: string;
      debt_id?: string;
      message: string;
    }) => {
      const { data, error } = await supabase
        .from("payment_reminders")
        .insert([reminderData])
        .select()
        .single();

      if (error) {
        console.error("Error sending payment reminder:", error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payment-reminders"] });
      toast.success("تم إرسال رسالة التذكير بنجاح");
    },
    onError: (error) => {
      console.error("Failed to send payment reminder:", error);
      toast.error("حدث خطأ في إرسال رسالة التذكير");
    },
  });
};
