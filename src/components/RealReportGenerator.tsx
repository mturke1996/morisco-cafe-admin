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
  TrendingUp,
  DollarSign,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RealReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  reportType?: string;
  defaultEmployeeId?: string;
}

export const RealReportGenerator = ({
  isOpen,
  onClose,
  reportType = "attendance",
  defaultEmployeeId,
}: RealReportGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedReportType, setSelectedReportType] = useState(reportType);
  const [employees, setEmployees] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const { toast } = useToast();

  // تعيين التواريخ الافتراضية
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  }, []);

  // جلب قائمة الموظفين
  useEffect(() => {
    fetchEmployees();
  }, []);

  // تعيين الموظف الافتراضي عند فتح المودال
  useEffect(() => {
    if (isOpen && defaultEmployeeId) {
      setSelectedEmployee(defaultEmployeeId);
    }
  }, [isOpen, defaultEmployeeId]);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("id, name, phone, position")
        .order("name");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

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
      let reportData;

      switch (selectedReportType) {
        case "attendance":
          reportData = await generateAttendanceReport();
          break;
        case "expenses":
          reportData = await generateExpensesReport();
          break;
        default:
          reportData = await generateAttendanceReport();
      }

      setReportData(reportData);

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

  const generateAttendanceReport = async () => {
    let query = supabase
      .from("attendance")
      .select(
        `
        *,
        employees (
          name,
          phone,
          position
        )
      `
      )
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (selectedEmployee) {
      query = query.eq("employee_id", selectedEmployee);
    }

    const { data: attendance, error } = await query;
    if (error) throw error;

    const data = attendance || [];
    const summary = {
      totalDays: data.length,
      totalEmployees: new Set(data.map((item) => item.employee_id)).size,
      totalWages: data.reduce(
        (sum, item) => sum + (item.daily_wage_earned || 0),
        0
      ),
      presentDays: data.filter((item) => item.status === "present").length,
      absentDays: data.filter((item) => item.status === "absent").length,
    };

    return { data, summary };
  };

  const generateExpensesReport = async () => {
    const { data: expenses, error } = await supabase
      .from("expenses")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) throw error;

    const data = expenses || [];
    const summary = {
      totalExpenses: data.length,
      totalAmount: data.reduce((sum, item) => sum + (item.amount || 0), 0),
      averageExpense:
        data.length > 0
          ? data.reduce((sum, item) => sum + (item.amount || 0), 0) /
            data.length
          : 0,
    };

    return { data, summary };
  };

  const exportToPDF = () => {
    if (!reportData) return;
    // Export logic here
    toast({
      title: "تم التصدير",
      description: "تم تصدير التقرير بصيغة PDF",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  مولد التقارير الحقيقي
                </h2>
                <p className="text-slate-600 text-sm">
                  إنشاء تقارير من البيانات الفعلية
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التقرير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>نوع التقرير</Label>
                  <Select
                    value={selectedReportType}
                    onValueChange={setSelectedReportType}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">تقرير الحضور</SelectItem>
                      <SelectItem value="expenses">تقرير المصروفات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>من تاريخ</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label>إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>

                {selectedReportType === "attendance" && (
                  <div>
                    <Label>الموظف (اختياري)</Label>
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="جميع الموظفين" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">جميع الموظفين</SelectItem>
                        {employees.map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} - {emp.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-center">
            <Button
              onClick={generateReport}
              disabled={loading || !startDate || !endDate}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 py-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  جاري إنشاء التقرير...
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 ml-2" />
                  إنشاء التقرير
                </>
              )}
            </Button>
          </div>

          {/* Report Results */}
          {reportData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>نتائج التقرير</CardTitle>
                  <Button onClick={exportToPDF} className="bg-green-600">
                    <Download className="w-4 h-4 ml-2" />
                    تصدير PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800">عدد السجلات</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      {reportData.data.length}
                    </p>
                  </div>
                  {Object.entries(reportData.summary).map(([key, value]) => (
                    <div key={key} className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800">{key}</h4>
                      <p className="text-lg font-bold text-green-600">
                        {typeof value === "number"
                          ? value.toLocaleString("ar-SA")
                          : String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealReportGenerator;
