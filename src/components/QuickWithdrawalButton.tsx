import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  History,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuickWithdrawalButtonProps {
  employeeId: string;
  employeeName: string;
  currentBalance: number;
  onWithdrawalComplete?: () => void;
  selectedDate?: string;
  variant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

interface TodayWithdrawal {
  id: string;
  amount: number;
  withdrawal_date: string;
  notes?: string;
  created_at: string;
}

const QuickWithdrawalButton = React.memo(
  ({
    employeeId,
    employeeName,
    currentBalance,
    onWithdrawalComplete,
    selectedDate,
    variant = "outline",
    size = "sm",
    className = "",
  }: QuickWithdrawalButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [withdrawalDate, setWithdrawalDate] = useState(
      selectedDate || new Date().toISOString().split("T")[0]
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [todayWithdrawals, setTodayWithdrawals] = useState<TodayWithdrawal[]>(
      []
    );
    const [showHistory, setShowHistory] = useState(false);

    const { toast } = useToast();

    const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;

    // جلب السحوبات اليومية
    const fetchTodayWithdrawals = useCallback(async () => {
      try {
        const { data, error } = await supabase
          .from("employee_withdrawals")
          .select("*")
          .eq("employee_id", employeeId)
          .eq("withdrawal_date", withdrawalDate)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setTodayWithdrawals(data || []);
      } catch (error) {
        console.error("خطأ في جلب السحوبات اليومية:", error);
      }
    }, [employeeId, withdrawalDate]);

    useEffect(() => {
      if (isOpen) {
        fetchTodayWithdrawals();
      }
    }, [isOpen, withdrawalDate, employeeId]);

    useEffect(() => {
      if (selectedDate) {
        setWithdrawalDate(selectedDate);
      }
    }, [selectedDate]);

    // التحقق من وجود سحب مكرر
    const checkDuplicateWithdrawal = useCallback(
      (amount: number) => {
        return todayWithdrawals.some(
          (w) => Math.abs(w.amount - amount) < 0.01 // مقارنة مع هامش خطأ صغير
        );
      },
      [todayWithdrawals]
    );

    const handleWithdrawal = useCallback(async () => {
      if (!amount || parseFloat(amount) <= 0) {
        toast({
          title: "خطأ",
          description: "يرجى إدخال مبلغ صحيح",
          variant: "destructive",
        });
        return;
      }

      const withdrawalAmount = parseFloat(amount);

      // التحقق من وجود سحب مكرر
      if (checkDuplicateWithdrawal(withdrawalAmount)) {
        const duplicateWithdrawal = todayWithdrawals.find(
          (w) => Math.abs(w.amount - withdrawalAmount) < 0.01
        );
        toast({
          title: "تحذير: سحب مكرر محتمل",
          description: `تم تسجيل سحب بنفس المبلغ (${withdrawalAmount.toFixed(
            2
          )} د.ل) في هذا اليوم في الساعة ${
            duplicateWithdrawal
              ? new Date(duplicateWithdrawal.created_at).toLocaleTimeString(
                  "en-US",
                  { hour: "2-digit", minute: "2-digit" }
                )
              : "غير محدد"
          }. يرجى التأكد من عدم تكرار السحب.`,
          variant: "destructive",
        });
        return;
      }

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
        const { error } = await supabase.from("employee_withdrawals").insert({
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

        // تحديث قائمة السحوبات
        await fetchTodayWithdrawals();

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
    }, [
      amount,
      withdrawalDate,
      notes,
      employeeId,
      checkDuplicateWithdrawal,
      todayWithdrawals,
      fetchTodayWithdrawals,
      onWithdrawalComplete,
      toast,
    ]);

    const suggestedAmounts = useMemo(
      () => [
        { label: "50 د.ل", value: 50 },
        { label: "100 د.ل", value: 100 },
        { label: "200 د.ل", value: 200 },
        { label: "500 د.ل", value: 500 },
      ],
      []
    );

    const totalTodayWithdrawals = useMemo(
      () => todayWithdrawals.reduce((sum, w) => sum + w.amount, 0),
      [todayWithdrawals]
    );

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
          {todayWithdrawals.length > 0 && (
            <Badge variant="destructive" className="mr-1 text-xs">
              {todayWithdrawals.length}
            </Badge>
          )}
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

              {/* Today's Withdrawals Summary */}
              {todayWithdrawals.length > 0 && (
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <History className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-800">
                          سحوبات اليوم
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowHistory(!showHistory)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Eye className="w-4 h-4 ml-1" />
                        {showHistory ? "إخفاء" : "عرض"}
                      </Button>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-800">
                        {formatCurrency(totalTodayWithdrawals)}
                      </p>
                      <p className="text-sm text-orange-600">
                        {todayWithdrawals.length} سحب
                      </p>
                    </div>

                    {showHistory && (
                      <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                        {todayWithdrawals.map((withdrawal) => (
                          <div
                            key={withdrawal.id}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {formatCurrency(withdrawal.amount)}
                              </p>
                              {withdrawal.notes && (
                                <p className="text-xs text-muted-foreground">
                                  {withdrawal.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(
                                withdrawal.created_at
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

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
  }
);

QuickWithdrawalButton.displayName = "QuickWithdrawalButton";

export default QuickWithdrawalButton;
