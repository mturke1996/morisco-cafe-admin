
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSaveDailyCashCount, useDailyCashCount, useDailyExpenses } from "@/hooks/useDailyCashCount";

interface DailyCashCountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
}

const DailyCashCountModal = ({ open, onOpenChange, date }: DailyCashCountModalProps) => {
  const [formData, setFormData] = useState({
    coins_small: 0,
    coins_one_dinar: 0,
    bills_large: 0,
    screen_sales_count: 0,
    cash_sales: 0,
    card_sales: 0,
    tadawul_sales: 0,
    presto_sales: 0,
    prev_coins_small: 0,
    prev_coins_one_dinar: 0,
    prev_bills_large: 0,
  });

  const { data: existingCount } = useDailyCashCount(date);
  const { data: expensesData } = useDailyExpenses(date);
  const saveCashCount = useSaveDailyCashCount();

  useEffect(() => {
    if (existingCount) {
      setFormData({
        coins_small: existingCount.coins_small || 0,
        coins_one_dinar: existingCount.coins_one_dinar || 0,
        bills_large: existingCount.bills_large || 0,
        screen_sales_count: existingCount.screen_sales_count || 0,
        cash_sales: existingCount.cash_sales || 0,
        card_sales: existingCount.card_sales || 0,
        tadawul_sales: existingCount.tadawul_sales || 0,
        presto_sales: existingCount.presto_sales || 0,
        prev_coins_small: existingCount.prev_coins_small || 0,
        prev_coins_one_dinar: existingCount.prev_coins_one_dinar || 0,
        prev_bills_large: existingCount.prev_bills_large || 0,
      });
    }
  }, [existingCount]);

  const totalActual = formData.coins_small + formData.coins_one_dinar + formData.bills_large;
  const totalSales = formData.cash_sales + formData.card_sales + formData.tadawul_sales + formData.presto_sales;
  const prevBalance = formData.prev_coins_small + formData.prev_coins_one_dinar + formData.prev_bills_large;
  const dailyExpenses = expensesData?.total || 0;
  const totalCalculated = prevBalance + totalSales - dailyExpenses;
  const difference = totalActual - totalCalculated;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    saveCashCount.mutate({
      count_date: date,
      ...formData,
      daily_expenses: dailyExpenses,
    }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>إغلاق الحساب اليومي - {date}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* النقد الموجود */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">النقد الموجود حالياً</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>نحاس (الفكة)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.coins_small}
                    onChange={(e) => setFormData({ ...formData, coins_small: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>رقاق (عملة 1 دينار)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.coins_one_dinar}
                    onChange={(e) => setFormData({ ...formData, coins_one_dinar: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>غلاض (عملة 5-10-20)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.bills_large}
                    onChange={(e) => setFormData({ ...formData, bills_large: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="p-2 bg-muted rounded">
                  <strong>المجموع الفعلي: {totalActual.toFixed(2)} د.ل</strong>
                </div>
              </CardContent>
            </Card>

            {/* المبيعات */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">المبيعات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>عدد المبيعات من الشاشة</Label>
                  <Input
                    type="number"
                    value={formData.screen_sales_count}
                    onChange={(e) => setFormData({ ...formData, screen_sales_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>الكاش</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.cash_sales}
                    onChange={(e) => setFormData({ ...formData, cash_sales: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>بطاقة المصرفية</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.card_sales}
                    onChange={(e) => setFormData({ ...formData, card_sales: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>بطاقة تداول</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.tadawul_sales}
                    onChange={(e) => setFormData({ ...formData, tadawul_sales: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>بريستو</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.presto_sales}
                    onChange={(e) => setFormData({ ...formData, presto_sales: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* رصيد اليوم السابق */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">رصيد اليوم السابق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>نحاس (اليوم السابق)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.prev_coins_small}
                    onChange={(e) => setFormData({ ...formData, prev_coins_small: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>رقاق (اليوم السابق)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.prev_coins_one_dinar}
                    onChange={(e) => setFormData({ ...formData, prev_coins_one_dinar: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label>غلاض (اليوم السابق)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.prev_bills_large}
                    onChange={(e) => setFormData({ ...formData, prev_bills_large: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* الحسابات النهائية */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الحسابات النهائية</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>إجمالي المبيعات:</span>
                  <span>{totalSales.toFixed(2)} د.ل</span>
                </div>
                <div className="flex justify-between">
                  <span>رصيد اليوم السابق:</span>
                  <span>{prevBalance.toFixed(2)} د.ل</span>
                </div>
                <div className="flex justify-between">
                  <span>المصروفات اليومية:</span>
                  <span>{dailyExpenses.toFixed(2)} د.ل</span>
                </div>
                <hr />
                <div className="flex justify-between font-semibold">
                  <span>المجموع المحسوب:</span>
                  <span>{totalCalculated.toFixed(2)} د.ل</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>المجموع الفعلي:</span>
                  <span>{totalActual.toFixed(2)} د.ل</span>
                </div>
                <div className={`flex justify-between font-bold text-lg p-2 rounded ${
                  difference > 0 ? 'bg-green-100 text-green-800' : 
                  difference < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  <span>الفرق:</span>
                  <span>
                    {difference.toFixed(2)} د.ل 
                    {difference > 0 ? ' (فائض)' : difference < 0 ? ' (نقص)' : ' (متوازن)'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={saveCashCount.isPending} className="flex-1">
              {saveCashCount.isPending ? "جاري الحفظ..." : "حفظ إغلاق اليوم"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DailyCashCountModal;
