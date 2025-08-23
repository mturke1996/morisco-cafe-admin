import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Printer,
  X,
  Clock,
  Loader2,
  Calendar,
  User,
  TrendingUp,
  DollarSign,
  Users,
  Receipt,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdvancedReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedReportGenerator = ({
  isOpen,
  onClose,
}: AdvancedReportGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const { toast } = useToast();

  // تعيين التواريخ الافتراضية
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد الفترة الزمنية",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Generate advanced report logic here
      toast({
        title: "تم إنشاء التقرير",
        description: "تم استخراج البيانات بنجاح",
      });
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التقرير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  مولد التقارير المتقدم
                </h2>
                <p className="text-slate-600 text-sm">
                  إنشاء تقارير مفصلة وتحليلات متقدمة
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Configuration */}
          <Card className="border-slate-200 mb-6">
            <CardHeader>
              <CardTitle className="text-slate-800">إعدادات التقرير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    من تاريخ
                  </Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    إلى تاريخ
                  </Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={generateReport}
              disabled={loading || !startDate || !endDate}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-8 py-3 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري إنشاء التقرير...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 ml-2" />
                  إنشاء التقرير المتقدم
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReportGenerator;
