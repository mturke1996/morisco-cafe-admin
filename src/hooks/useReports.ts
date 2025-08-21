
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  totalHours: number;
  totalWagesEarned: number;
}

export interface ExpenseStats {
  total_amount: number;
  by_category: Array<{
    category: string;
    amount: number;
    count: number;
  }>;
}

export interface DebtStats {
  totalDebts: number;
  paidAmount: number;
  remainingAmount: number;
}

export interface AttendanceDetail {
  id: string;
  employee_name: string;
  date: string;
  status: string;
  check_in: string;
  check_out: string;
  daily_wage_earned: number;
}

export interface ExpenseDetail {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}

export interface DebtDetail {
  id: string;
  customer_name: string;
  amount: number;
  paid_amount: number;
  remaining: number;
  debt_date: string;
  description: string;
}

export interface AttendanceReportData {
  stats: AttendanceStats;
  details: AttendanceDetail[];
}

export interface ExpensesReportData {
  stats: ExpenseStats;
  details: ExpenseDetail[];
}

export interface DebtsReportData {
  stats: DebtStats;
  details: DebtDetail[];
}

export const useReportsData = () => {
  return useQuery({
    queryKey: ['reports-data'],
    queryFn: async () => {
      // Fetch attendance data with proper relationship hint
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select(`
          *,
          employees!attendance_employee_id_fkey (
            name
          )
        `);

      // Fetch expenses data
      const { data: expensesData } = await supabase
        .from('expenses')
        .select('*');

      // Fetch debts data
      const { data: debtsData } = await supabase
        .from('customer_debts')
        .select(`
          *,
          customers!customer_debts_customer_id_fkey (
            name
          )
        `);

      // Process attendance data
      const attendanceDetails: AttendanceDetail[] = attendanceData?.map(record => ({
        id: record.id,
        employee_name: record.employees?.name || 'غير محدد',
        date: record.date,
        status: record.status,
        check_in: record.check_in || '',
        check_out: record.check_out || '',
        daily_wage_earned: Number(record.daily_wage_earned || 0)
      })) || [];

      const attendanceStats: AttendanceStats = {
        totalDays: attendanceDetails.length,
        presentDays: attendanceDetails.filter(a => a.status === 'present').length,
        totalHours: attendanceDetails
          .filter(a => a.check_in && a.check_out)
          .reduce((total, a) => {
            const checkIn = new Date(`1970-01-01T${a.check_in}`);
            const checkOut = new Date(`1970-01-01T${a.check_out}`);
            const hours = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);
            return total + (hours > 0 ? hours : 0);
          }, 0),
        totalWagesEarned: attendanceDetails.reduce((total, a) => total + a.daily_wage_earned, 0)
      };

      // Process expenses data
      const expenseDetails: ExpenseDetail[] = expensesData?.map(expense => ({
        id: expense.id,
        description: expense.description || '',
        amount: Number(expense.amount),
        category: expense.category,
        expense_date: expense.date // Map 'date' field to 'expense_date'
      })) || [];

      const categoryBreakdown = expenseDetails.reduce((acc, expense) => {
        const existing = acc.find(item => item.category === expense.category);
        if (existing) {
          existing.amount += expense.amount;
          existing.count += 1;
        } else {
          acc.push({
            category: expense.category,
            amount: expense.amount,
            count: 1
          });
        }
        return acc;
      }, [] as Array<{ category: string; amount: number; count: number; }>);

      const expenseStats: ExpenseStats = {
        total_amount: expenseDetails.reduce((total, e) => total + e.amount, 0),
        by_category: categoryBreakdown
      };

      // Process debts data
      const debtDetails: DebtDetail[] = debtsData?.map(debt => ({
        id: debt.id,
        customer_name: debt.customers?.name || 'غير محدد',
        amount: Number(debt.amount),
        paid_amount: Number(debt.paid_amount || 0),
        remaining: Number(debt.amount) - Number(debt.paid_amount || 0),
        debt_date: debt.debt_date,
        description: debt.description || ''
      })) || [];

      const debtStats: DebtStats = {
        totalDebts: debtDetails.reduce((total, d) => total + d.amount, 0),
        paidAmount: debtDetails.reduce((total, d) => total + d.paid_amount, 0),
        remainingAmount: debtDetails.reduce((total, d) => total + d.remaining, 0)
      };

      return {
        attendance: {
          stats: attendanceStats,
          details: attendanceDetails
        } as AttendanceReportData,
        expenses: {
          stats: expenseStats,
          details: expenseDetails
        } as ExpensesReportData,
        debts: {
          stats: debtStats,
          details: debtDetails
        } as DebtsReportData
      };
    }
  });
};
