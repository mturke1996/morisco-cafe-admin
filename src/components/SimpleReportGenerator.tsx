import { useState } from "react";
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
import { FileText, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SimpleReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimpleReportGenerator = ({
  isOpen,
  onClose,
}: SimpleReportGeneratorProps) => {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState("");
  const { toast } = useToast();

  const generateSimpleReport = () => {
    if (!reportType || !dateRange) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار نوع التقرير والفترة الزمنية",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم إنشاء التقرير",
      description: "تم إنشاء التقرير البسيط بنجاح",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            مولد التقارير البسيط
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>نوع التقرير</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التقرير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attendance">تقرير الحضور</SelectItem>
                <SelectItem value="expenses">تقرير المصروفات</SelectItem>
                <SelectItem value="sales">تقرير المبيعات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>الفترة الزمنية</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={generateSimpleReport} className="flex-1">
              <Download className="w-4 h-4 ml-2" />
              إنشاء التقرير
            </Button>
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleReportGenerator;
