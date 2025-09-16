import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Calendar, Minus, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Employee {
  id: string;
  name: string;
  position: string;
}

interface AddWithdrawalModalProps {
  employee: Employee;
  currentBalance: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddWithdrawalModal = ({
  employee,
  currentBalance,
  open,
  onOpenChange,
}: AddWithdrawalModalProps) => {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleWithdrawal = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال مبلغ صحيح",
        variant: "destructive",
      });
      return;
    }

    const withdrawalAmount = parseFloat(amount);

    // السماح بالسحب حتى لو كان الرصيد سالب
    if (withdrawalAmount > Math.abs(currentBalance) + 1000) {
      // حد أقصى 1000 د.ل فوق الرصيد
      toast({
        title: "خطأ",
        description:
          "المبلغ المطلوب كبير جداً. الحد الأقصى المسموح: " +
          (Math.abs(currentBalance) + 1000) +
          " د.ل",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const withdrawalData = {
        employee_id: employee.id,
        amount: withdrawalAmount,
        withdrawal_date: new Date().toISOString().split("T")[0],
        notes: notes || null,
      };

      const { error } = await supabase
        .from("employee_withdrawals")
        .insert(withdrawalData);

      if (error) throw error;

      toast({
        title: "تم السحب بنجاح",
        description: `تم تسجيل سحب ${withdrawalAmount.toFixed(2)} د.ل`,
      });

      onOpenChange(false);
      setAmount("");
      setNotes("");
    } catch (error) {
      console.error("خطأ في تسجيل السحب:", error);
      toast({
        title: "خطأ",
        description: "فشل في تسجيل السحب",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            سحب مبلغ من المرتب
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center mb-3">
                <h3 className="font-semibold text-lg">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {employee.position}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Balance */}
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    الرصيد الحالي
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold ${
                    currentBalance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {currentBalance >= 0 ? "+" : ""}
                  {currentBalance.toFixed(2)} د.ل
                </p>
                {currentBalance < 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                    <AlertTriangle className="w-3 h-3" />
                    <span>
                      الرصيد سالب - يمكن السحب حتى{" "}
                      {Math.abs(currentBalance) + 1000} د.ل
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Withdrawal Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">مبلغ السحب</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-center"
                max={Math.abs(currentBalance) + 1000}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setAmount((Math.abs(currentBalance) + 100).toString())
                }
                className="whitespace-nowrap"
              >
                اقتراح
              </Button>
            </div>
            {amount && parseFloat(amount) > 0 && (
              <p className="text-xs text-muted-foreground text-center">
                الرصيد بعد السحب:{" "}
                {(currentBalance - parseFloat(amount)).toFixed(2)} د.ل
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="سبب السحب أو أي ملاحظات..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleWithdrawal}
              disabled={
                isProcessing ||
                !amount ||
                parseFloat(amount) <= 0 ||
                parseFloat(amount) > Math.abs(currentBalance) + 1000
              }
              className="flex-1"
            >
              <Minus className="w-4 h-4 ml-2" />
              {isProcessing ? "جاري المعالجة..." : "تأكيد السحب"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
