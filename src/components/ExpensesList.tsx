
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, FileText } from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface ExpensesListProps {
  expenses: Expense[];
  onAddExpense: () => void;
}

const ExpensesList = ({ expenses, onAddExpense }: ExpensesListProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExpenses = expenses.filter(expense =>
    expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

  const getCategoryColor = (category: string) => {
    const colors = {
      'مكتب': 'bg-blue-100 text-blue-800',
      'مطبخ': 'bg-green-100 text-green-800',
      'صيانة': 'bg-yellow-100 text-yellow-800',
      'تسويق': 'bg-purple-100 text-purple-800',
      'أخرى': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors['أخرى'];
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button 
          onClick={onAddExpense} 
          className="btn-gradient flex-shrink-0"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة مصروف جديد
        </Button>
        <Input
          placeholder="البحث في المصروفات..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-white/80 backdrop-blur-sm"
        />
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">
              {searchTerm ? "لا توجد مصروفات تطابق البحث" : "لا توجد مصروفات"}
            </p>
            {!searchTerm && (
              <Button onClick={onAddExpense} className="btn-gradient">
                <Plus className="w-4 h-4 ml-2" />
                إضافة أول مصروف
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <Card key={expense.id} className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-md transition-all duration-200">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-lg">{formatCurrency(expense.amount)}</span>
                      <Badge className={getCategoryColor(expense.category)}>
                        {expense.category}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-2 text-sm">{expense.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.expense_date).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpensesList;
