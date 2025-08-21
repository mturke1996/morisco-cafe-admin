
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useDailyExpenses } from "@/hooks/useDailyCashCount";
import { Printer } from "lucide-react";
import { ShiftClosureData } from "@/hooks/useShiftClosure";

interface ShiftClosureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Omit<ShiftClosureData, 'id' | 'created_at' | 'created_by' | 'total_actual' | 'total_calculated' | 'difference'>) => void;
  initialDate?: string;
}

const ShiftClosureModal = ({ open, onOpenChange, onSave, initialDate }: ShiftClosureModalProps) => {
  const [shiftData, setShiftData] = useState<Omit<ShiftClosureData, 'id' | 'created_at' | 'created_by' | 'total_actual' | 'total_calculated' | 'difference'>>({
    shift_type: 'morning',
    shift_date: new Date().toISOString().split('T')[0],
    coins_small: 0,
    coins_one_dinar: 0,
    bills_large: 0,
    screen_sales: 0,
    cash_sales: 0,
    card_sales: 0,
    tadawul_sales: 0,
    presto_sales: 0,
    shift_expenses: 0,
    prev_coins_small: 0,
    prev_coins_one_dinar: 0,
    prev_bills_large: 0,
  });

  const { data: expensesData } = useDailyExpenses(shiftData.shift_date);

  useEffect(() => {
    if (expensesData) {
      setShiftData(prev => ({
        ...prev,
        shift_expenses: expensesData.total || 0
      }));
    }
  }, [expensesData]);

  // Sync provided initial date when dialog opens or prop changes
  useEffect(() => {
    if (open && initialDate) {
      setShiftData(prev => ({ ...prev, shift_date: initialDate }));
    }
  }, [initialDate, open]);

  const handleInputChange = (field: keyof typeof shiftData, value: string | number) => {
    setShiftData(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const calculateTotals = () => {
    const currentCash = shiftData.coins_small + shiftData.coins_one_dinar + shiftData.bills_large;
    const totalSales = shiftData.cash_sales + shiftData.card_sales + shiftData.tadawul_sales + shiftData.presto_sales;
    const prevCash = shiftData.prev_coins_small + shiftData.prev_coins_one_dinar + shiftData.prev_bills_large;
    // المجموع قبل طرح مبيعات الشاشة حسب المطلوب:
    // نحاس + رقاق + غلاض + الكاش + البطاقة + تداول + المصروفات + بريستو - (نحاس/رقاق/غلاض السابقة)
    const totalBeforeScreen = currentCash + totalSales + shiftData.shift_expenses - prevCash;
    // المجموع النهائي بعد طرح مبيعات الشاشة
    const finalAfterScreen = totalBeforeScreen - shiftData.screen_sales;

    return {
      currentCash,
      totalSales,
      prevCash,
      totalBeforeScreen,
      finalAfterScreen,
      screenSales: shiftData.screen_sales
    };
  };

  const totals = calculateTotals();
  const isPositive = totals.finalAfterScreen > 0;
  const isNegative = totals.finalAfterScreen < 0;
  const combinedDisplay = `${totals.totalBeforeScreen.toFixed(0)}/${Math.abs(totals.finalAfterScreen).toFixed(0)} د.ل`;

  const handleSave = () => {
    onSave(shiftData);
  };

  const handlePrint = () => {
    console.log("طباعة تقرير الوردية");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">إغلاق الوردية</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* نوع الوردية والتاريخ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>نوع الوردية</Label>
              <Select 
                value={shiftData.shift_type} 
                onValueChange={(value: 'morning' | 'evening') => handleInputChange('shift_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">صباحية</SelectItem>
                  <SelectItem value="evening">مسائية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>التاريخ</Label>
              <Input
                type="date"
                value={shiftData.shift_date}
                onChange={(e) => handleInputChange('shift_date', e.target.value)}
              />
            </div>
          </div>

          {/* النقود الحالية */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">النقود الحالية</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>نحاس (فكة)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.coins_small}
                    onChange={(e) => handleInputChange('coins_small', e.target.value)}
                  />
                </div>
                <div>
                  <Label>رقاق (1 دينار)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.coins_one_dinar}
                    onChange={(e) => handleInputChange('coins_one_dinar', e.target.value)}
                  />
                </div>
                <div>
                  <Label>غلاض (باقي العملات)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.bills_large}
                    onChange={(e) => handleInputChange('bills_large', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* المبيعات */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">المبيعات</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>مبيعات الشاشة</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.screen_sales}
                    onChange={(e) => handleInputChange('screen_sales', e.target.value)}
                  />
                </div>
                <div>
                  <Label>الكاش</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.cash_sales}
                    onChange={(e) => handleInputChange('cash_sales', e.target.value)}
                  />
                </div>
                <div>
                  <Label>البطاقة المصرفية</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.card_sales}
                    onChange={(e) => handleInputChange('card_sales', e.target.value)}
                  />
                </div>
                <div>
                  <Label>بطاقة تداول</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.tadawul_sales}
                    onChange={(e) => handleInputChange('tadawul_sales', e.target.value)}
                  />
                </div>
                <div>
                  <Label>بريستو</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.presto_sales}
                    onChange={(e) => handleInputChange('presto_sales', e.target.value)}
                  />
                </div>
                <div>
                  <Label>مصروفات الوردية</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.shift_expenses}
                    readOnly
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* النقود من الوردية السابقة */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">النقود من الوردية السابقة</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>نحاس سابق</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.prev_coins_small}
                    onChange={(e) => handleInputChange('prev_coins_small', e.target.value)}
                  />
                </div>
                <div>
                  <Label>رقاق سابق</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.prev_coins_one_dinar}
                    onChange={(e) => handleInputChange('prev_coins_one_dinar', e.target.value)}
                  />
                </div>
                <div>
                  <Label>غلاض سابق</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={shiftData.prev_bills_large}
                    onChange={(e) => handleInputChange('prev_bills_large', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* النتائج */}
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3">النتائج</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>إجمالي النقود الحالية:</span>
                  <span className="font-bold">{totals.currentCash.toFixed(2)} د.ل</span>
                </div>
                <div className="flex justify-between">
                  <span>إجمالي المبيعات:</span>
                  <span className="font-bold">{totals.totalSales.toFixed(2)} د.ل</span>
                </div>
                <div className="flex justify-between">
                  <span>مبيعات الشاشة:</span>
                  <span className="font-bold">{totals.screenSales.toFixed(2)} د.ل</span>
                </div>
                <div className="flex justify-between">
                  <span>المجموع قبل طرح مبيعات الشاشة:</span>
                  <span className="font-bold">{totals.totalBeforeScreen.toFixed(2)} د.ل</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between items-center">
                  <span>النتيجة:</span>
                  <span className={`font-bold text-lg ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-black'}`}>
                    {combinedDisplay}
                  </span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded ${
                  isPositive ? 'bg-green-50' : isNegative ? 'bg-red-50' : 'bg-gray-50'
                }`}>
                  <span>الفائض/العجز:</span>
                  <span className={`font-bold ${isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-gray-700'}`}>
                    {isPositive ? 'فائض' : isNegative ? 'عجز' : 'متوازن'} / {Math.abs(totals.finalAfterScreen).toFixed(2)} د.ل
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* الأزرار */}
          <div className="flex gap-3">
            <Button onClick={handleSave} className="flex-1">
              حفظ إغلاق الوردية
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShiftClosureModal;
