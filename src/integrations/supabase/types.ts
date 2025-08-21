export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          bonus_amount: number | null
          check_in: string | null
          check_out: string | null
          created_at: string
          daily_wage_earned: number | null
          date: string
          deduction_amount: number | null
          deduction_reason: string | null
          early_departure: boolean | null
          employee_id: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bonus_amount?: number | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          daily_wage_earned?: number | null
          date?: string
          deduction_amount?: number | null
          deduction_reason?: string | null
          early_departure?: boolean | null
          employee_id: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bonus_amount?: number | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          daily_wage_earned?: number | null
          date?: string
          deduction_amount?: number | null
          deduction_reason?: string | null
          early_departure?: boolean | null
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_attendance_employee"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_debts: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          debt_date: string
          description: string | null
          id: string
          paid_amount: number | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          debt_date?: string
          description?: string | null
          id?: string
          paid_amount?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          debt_date?: string
          description?: string | null
          id?: string
          paid_amount?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_debts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          last_visit: string | null
          name: string
          phone: string | null
          status: string
          total_orders: number | null
          total_spent: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_visit?: string | null
          name: string
          phone?: string | null
          status?: string
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_visit?: string | null
          name?: string
          phone?: string | null
          status?: string
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_cash_count: {
        Row: {
          bills_large: number | null
          card_sales: number | null
          cash_sales: number | null
          coins_one_dinar: number | null
          coins_small: number | null
          count_date: string
          created_at: string
          created_by: string | null
          daily_expenses: number | null
          difference: number | null
          id: string
          presto_sales: number | null
          prev_bills_large: number | null
          prev_coins_one_dinar: number | null
          prev_coins_small: number | null
          screen_sales_count: number | null
          status: string | null
          tadawul_sales: number | null
          total_actual: number | null
          total_calculated: number | null
          updated_at: string
        }
        Insert: {
          bills_large?: number | null
          card_sales?: number | null
          cash_sales?: number | null
          coins_one_dinar?: number | null
          coins_small?: number | null
          count_date?: string
          created_at?: string
          created_by?: string | null
          daily_expenses?: number | null
          difference?: number | null
          id?: string
          presto_sales?: number | null
          prev_bills_large?: number | null
          prev_coins_one_dinar?: number | null
          prev_coins_small?: number | null
          screen_sales_count?: number | null
          status?: string | null
          tadawul_sales?: number | null
          total_actual?: number | null
          total_calculated?: number | null
          updated_at?: string
        }
        Update: {
          bills_large?: number | null
          card_sales?: number | null
          cash_sales?: number | null
          coins_one_dinar?: number | null
          coins_small?: number | null
          count_date?: string
          created_at?: string
          created_by?: string | null
          daily_expenses?: number | null
          difference?: number | null
          id?: string
          presto_sales?: number | null
          prev_bills_large?: number | null
          prev_coins_one_dinar?: number | null
          prev_coins_small?: number | null
          screen_sales_count?: number | null
          status?: string | null
          tadawul_sales?: number | null
          total_actual?: number | null
          total_calculated?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      employee_profiles: {
        Row: {
          created_at: string
          daily_wage: number | null
          employee_id: string
          id: string
          last_withdrawal_date: string | null
          monthly_withdrawals: number | null
          notes: string | null
          total_work_hours: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_wage?: number | null
          employee_id: string
          id?: string
          last_withdrawal_date?: string | null
          monthly_withdrawals?: number | null
          notes?: string | null
          total_work_hours?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_wage?: number | null
          employee_id?: string
          id?: string
          last_withdrawal_date?: string | null
          monthly_withdrawals?: number | null
          notes?: string | null
          total_work_hours?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_profiles_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_withdrawals: {
        Row: {
          amount: number
          created_at: string
          employee_id: string
          id: string
          notes: string | null
          updated_at: string
          withdrawal_date: string
        }
        Insert: {
          amount?: number
          created_at?: string
          employee_id: string
          id?: string
          notes?: string | null
          updated_at?: string
          withdrawal_date?: string
        }
        Update: {
          amount?: number
          created_at?: string
          employee_id?: string
          id?: string
          notes?: string | null
          updated_at?: string
          withdrawal_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_withdrawals_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          created_at: string
          email: string | null
          hire_date: string
          id: string
          name: string
          phone: string | null
          position: string
          salary: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          hire_date?: string
          id?: string
          name: string
          phone?: string | null
          position: string
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          hire_date?: string
          id?: string
          name?: string
          phone?: string | null
          position?: string
          salary?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          receipt_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          receipt_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          invoice_date: string
          invoice_number: string
          notes: string | null
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          invoice_date?: string
          invoice_number: string
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          notes?: string | null
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          status: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          status?: string
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          status?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_reminders: {
        Row: {
          created_at: string
          customer_id: string
          debt_id: string | null
          id: string
          message: string
          reminder_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          debt_id?: string | null
          id?: string
          message: string
          reminder_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          debt_id?: string | null
          id?: string
          message?: string
          reminder_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_reminders_debt_id_fkey"
            columns: ["debt_id"]
            isOneToOne: false
            referencedRelation: "customer_debts"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_payments: {
        Row: {
          amount_paid: number
          created_at: string
          daily_wage: number
          days_worked: number
          employee_id: string
          gross_amount: number
          id: string
          net_amount: number
          notes: string | null
          payment_date: string
          payment_status: string
          period_end: string
          period_start: string
          remaining_balance: number
          total_bonuses: number
          total_deductions: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          daily_wage?: number
          days_worked?: number
          employee_id: string
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          payment_date?: string
          payment_status?: string
          period_end: string
          period_start: string
          remaining_balance?: number
          total_bonuses?: number
          total_deductions?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          daily_wage?: number
          days_worked?: number
          employee_id?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          payment_date?: string
          payment_status?: string
          period_end?: string
          period_start?: string
          remaining_balance?: number
          total_bonuses?: number
          total_deductions?: number
          updated_at?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          payment_method: string
          sale_date: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          sale_date?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          payment_method?: string
          sale_date?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_closures: {
        Row: {
          bills_large: number
          card_sales: number
          cash_sales: number
          coins_one_dinar: number
          coins_small: number
          created_at: string
          created_by: string | null
          difference: number
          id: string
          presto_sales: number
          prev_bills_large: number
          prev_coins_one_dinar: number
          prev_coins_small: number
          screen_sales: number
          shift_date: string
          shift_expenses: number
          shift_type: string
          tadawul_sales: number
          total_actual: number
          total_calculated: number
          updated_at: string
        }
        Insert: {
          bills_large?: number
          card_sales?: number
          cash_sales?: number
          coins_one_dinar?: number
          coins_small?: number
          created_at?: string
          created_by?: string | null
          difference?: number
          id?: string
          presto_sales?: number
          prev_bills_large?: number
          prev_coins_one_dinar?: number
          prev_coins_small?: number
          screen_sales?: number
          shift_date?: string
          shift_expenses?: number
          shift_type: string
          tadawul_sales?: number
          total_actual?: number
          total_calculated?: number
          updated_at?: string
        }
        Update: {
          bills_large?: number
          card_sales?: number
          cash_sales?: number
          coins_one_dinar?: number
          coins_small?: number
          created_at?: string
          created_by?: string | null
          difference?: number
          id?: string
          presto_sales?: number
          prev_bills_large?: number
          prev_coins_one_dinar?: number
          prev_coins_small?: number
          screen_sales?: number
          shift_date?: string
          shift_expenses?: number
          shift_type?: string
          tadawul_sales?: number
          total_actual?: number
          total_calculated?: number
          updated_at?: string
        }
        Relationships: []
      }
      shift_closure_expenses: {
        Row: {
          id: string
          shift_closure_id: string
          title: string
          description: string | null
          amount: number
          category: string | null
          date: string
          receipt_url: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          shift_closure_id: string
          title: string
          description?: string | null
          amount: number
          category?: string | null
          date: string
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          shift_closure_id?: string
          title?: string
          description?: string | null
          amount?: number
          category?: string | null
          date?: string
          receipt_url?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_invoice_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_customer_total_debt: {
        Args: { customer_uuid: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
