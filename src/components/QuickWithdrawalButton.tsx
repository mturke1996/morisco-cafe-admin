import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuickWithdrawalButtonProps {
  employeeId: string;
  employeeName: string;
  currentBalance: number;
  onWithdrawalComplete?: () => void;
  variant?: "default" | "outline" | "destructive" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const QuickWithdrawalButton = ({
  employeeId,
  employeeName,
  currentBalance,
  onWithdrawalComplete,
  variant = "outline",
  size = "sm",
  className = "",
}: QuickWithdrawalButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [withdrawalDate, setWithdrawalDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const { toast } = useToast();

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

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
      const { error } = await supabase
        .from("employee_withdrawals")
        .insert({
          employee_id: employeeId,
          amount: withdrawalAmount,
          withdrawal_date: withdrawalDate,
          notes: notes || null,
        });

      if (error) throw error;

      toast({
        title: "تم السحب بنجاح",
        description: `تم تسجيل سحب ${withdrawalAmount.toFixed(2)} د.ل`,
      });

      setIsOpen(false);
      setAmount("");
      setNotes("");
      setWithdrawalDate(new Date().toISOString().split("T")[0]);
      
      if (onWithdrawalComplete) {
        onWithdrawalComplete();
      }
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

  const suggestedAmounts = [
    { label: "50 د.ل", value: 50 },
    { label: "100 د.ل", value: 100 },
    { label: "200 د.ل", value: 200 },
    { label: "500 د.ل", value: 500 },
  ];

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant={variant}
        size={size}
        className={`text-orange-600 hover:text-orange-700 ${className}`}
      >
        <Minus className="w-4 h-4 ml-1" />
        سحب سريع
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md mx-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl text-center flex items-center gap-2">
              <Minus className="w-5 h-5" />
              سحب سريع
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee Info */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">{employeeName}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      الرصيد الحالي
                    </span>
                  </div>
                  <p
                    className={`text-xl font-bold ${
                      currentBalance >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(currentBalance)}
                  </p>
                  {currentBalance < 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span>الرصيد سالب</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Amount Buttons */}
            <div>
              <Label className="text-sm mb-2 block">مبالغ سريعة</Label>
              <div className="grid grid-cols-2 gap-2">
                {suggestedAmounts.map((suggestion) => (
                  <Button
                    key={suggestion.value}
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(suggestion.value.toString())}
                    className="h-10"
                  >
                    {suggestion.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Withdrawal Date */}
            <div>
              <Label htmlFor="withdrawal-date">تاريخ السحب</Label>
              <Input
                id="withdrawal-date"
                type="date"
                value={withdrawalDate}
                onChange={(e) => setWithdrawalDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount">مبلغ السحب</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-center"
                max={Math.abs(currentBalance) + 1000}
              />
              {amount && parseFloat(amount) > 0 && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                  الرصيد بعد السحب:{" "}
                  {(currentBalance - parseFloat(amount)).toFixed(2)} د.ل
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
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
                onClick={() => setIsOpen(false)}
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
    </>
  );
};

export default QuickWithdrawalButton;
