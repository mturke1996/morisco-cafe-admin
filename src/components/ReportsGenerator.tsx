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
import { generateAttendanceReportPDF } from "./reports/AttendanceReportPDF";
import { generateDebtsReportPDF } from "./reports/DebtsReportPDF";
import { generateExpensesReportPDF } from "./reports/ExpensesReportPDF";

interface ReportData {
  title: string;
  startDate: string;
  endDate: string;
  employeeId?: string;
  data: any[];
  summary: any;
}

interface ReportsGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  reportType?: string;
  defaultEmployeeId?: string;
}

export const ReportsGenerator = ({
  isOpen,
  onClose,
  reportType = "attendance",
  defaultEmployeeId,
}: ReportsGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedReportType, setSelectedReportType] = useState(reportType);
  const [employees, setEmployees] = useState<any[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
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
          reportData = await generateAttendanceReport(
            startDate,
            endDate,
            selectedEmployee
          );
          break;
        case "withdrawals":
          reportData = await generateWithdrawalsReport(
            startDate,
            endDate,
            selectedEmployee
          );
          break;
        case "debts":
          reportData = await generateDebtsReport(
            startDate,
            endDate,
            selectedEmployee
          );
          break;
        case "expenses":
          reportData = await generateExpensesReport(startDate, endDate);
          break;
        default:
          reportData = await generateAttendanceReport(
            startDate,
            endDate,
            selectedEmployee
          );
      }

      setReportData({
        title: getReportTitle(selectedReportType),
        startDate,
        endDate,
        employeeId: selectedEmployee,
        data: reportData.data,
        summary: reportData.summary,
      });

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

  // تقرير الحضور
  const generateAttendanceReport = async (
    startDate: string,
    endDate: string,
    employeeId?: string
  ) => {
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

    if (employeeId) {
      query = query.eq("employee_id", employeeId);
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
      lateDays: data.filter((item) => item.status === "late").length,
    };

    return { data, summary };
  };

  // تقرير الديون
  const generateDebtsReport = async (
    startDate: string,
    endDate: string,
    employeeId?: string
  ) => {
    try {
      // استخدام جدول customers بدلاً من customer_debts
      let query = supabase
        .from("customers")
        .select(
          `
          *,
          employee_withdrawals (
            amount,
            withdrawal_date
          )
        `
        )
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: true });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data: customers, error } = await query;
      if (error) throw error;

      const data = customers || [];
      const summary = {
        totalCustomers: data.length,
        totalDebts: data.reduce(
          (sum, item) => sum + (item.debt_amount || 0),
          0
        ),
        activeDebts: data.filter((item) => (item.debt_amount || 0) > 0).length,
        totalWithdrawals: data.reduce((sum, item) => {
          const withdrawals = item.employee_withdrawals || [];
          return (
            sum + withdrawals.reduce((wSum, w) => wSum + (w.amount || 0), 0)
          );
        }, 0),
      };

      return { data, summary };
    } catch (error) {
      console.error("Error in generateDebtsReport:", error);
      // إرجاع بيانات فارغة في حالة الخطأ
      return {
        data: [],
        summary: {
          totalCustomers: 0,
          totalDebts: 0,
          activeDebts: 0,
          totalWithdrawals: 0,
        },
      };
    }
  };

  // تقرير السحوبات
  const generateWithdrawalsReport = async (
    startDate: string,
    endDate: string,
    employeeId?: string
  ) => {
    try {
      let query = supabase
        .from("employee_withdrawals")
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
        .gte("withdrawal_date", startDate)
        .lte("withdrawal_date", endDate)
        .order("withdrawal_date", { ascending: true });

      if (employeeId) {
        query = query.eq("employee_id", employeeId);
      }

      const { data: withdrawals, error } = await query;
      if (error) throw error;

      const data = withdrawals || [];
      const summary = {
        totalWithdrawals: data.length,
        totalAmount: data.reduce((sum, item) => sum + (item.amount || 0), 0),
        averageWithdrawal:
          data.length > 0
            ? data.reduce((sum, item) => sum + (item.amount || 0), 0) /
              data.length
            : 0,
        totalEmployees: new Set(data.map((item) => item.employee_id)).size,
      };

      return { data, summary };
    } catch (error) {
      console.error("Error in generateWithdrawalsReport:", error);
      return {
        data: [],
        summary: {
          totalWithdrawals: 0,
          totalAmount: 0,
          averageWithdrawal: 0,
          totalEmployees: 0,
        },
      };
    }
  };

  // تقرير المصروفات
  const generateExpensesReport = async (startDate: string, endDate: string) => {
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

  const getReportTitle = (type: string) => {
    const titles: { [key: string]: string } = {
      attendance: "تقرير الحضور والانصراف",
      withdrawals: "تقرير السحوبات",
      debts: "تقرير الديون",
      expenses: "تقرير المصروفات",
    };
    return titles[type] || "تقرير";
  };

  const exportToPDF = () => {
    if (!reportData) return;

    try {
      switch (selectedReportType) {
        case "attendance":
          generateAttendanceReportPDF({
            data: reportData.data,
            config: {
              startDate: reportData.startDate,
              endDate: reportData.endDate,
              dateRange: `${new Date(reportData.startDate).toLocaleDateString(
                "ar-SA"
              )} - ${new Date(reportData.endDate).toLocaleDateString("en-US")}`,
            },
          });
          break;
        case "withdrawals":
          // استخدام تقرير الحضور للسحوبات مؤقتاً
          generateAttendanceReportPDF({
            data: reportData.data,
            config: {
              startDate: reportData.startDate,
              endDate: reportData.endDate,
              dateRange: `${new Date(reportData.startDate).toLocaleDateString(
                "ar-SA"
              )} - ${new Date(reportData.endDate).toLocaleDateString("en-US")}`,
            },
          });
          break;
        case "debts":
          generateDebtsReportPDF({
            data: reportData.data,
            config: {
              startDate: reportData.startDate,
              endDate: reportData.endDate,
              dateRange: `${new Date(reportData.startDate).toLocaleDateString(
                "ar-SA"
              )} - ${new Date(reportData.endDate).toLocaleDateString("en-US")}`,
            },
          });
          break;
        case "expenses":
          generateExpensesReportPDF({
            data: reportData.data,
            config: {
              startDate: reportData.startDate,
              endDate: reportData.endDate,
              dateRange: `${new Date(reportData.startDate).toLocaleDateString(
                "ar-SA"
              )} - ${new Date(reportData.endDate).toLocaleDateString("en-US")}`,
            },
          });
          break;
      }

      toast({
        title: "تم التصدير بنجاح",
        description: "تم إنشاء التقرير كملف PDF",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء ملف PDF",
        variant: "destructive",
      });
    }
  };

  const printReport = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  نظام التقارير
                </h2>
                <p className="text-slate-600 text-sm">
                  إنشاء تقارير احترافية من قاعدة البيانات
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

        <div className="p-6 space-y-6">
          {/* Report Configuration */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-slate-800">إعدادات التقرير</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Report Type */}
                <div>
                  <Label className="text-sm font-medium text-slate-700 mb-2 block">
                    نوع التقرير *
                  </Label>
                  <Select
                    value={selectedReportType}
                    onValueChange={setSelectedReportType}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر نوع التقرير" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          تقرير الحضور
                        </div>
                      </SelectItem>
                      <SelectItem value="debts">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          تقرير الديون
                        </div>
                      </SelectItem>
                      <SelectItem value="withdrawals">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4" />
                          تقرير السحوبات
                        </div>
                      </SelectItem>
                      <SelectItem value="expenses">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          تقرير المصروفات
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
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

                {/* Employee Selection */}
                {(selectedReportType === "attendance" ||
                  selectedReportType === "withdrawals" ||
                  selectedReportType === "debts") && (
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      الموظف (اختياري)
                    </Label>
                    <Select
                      value={selectedEmployee}
                      onValueChange={setSelectedEmployee}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر موظف محدد أو اتركه فارغاً لجميع الموظفين" />
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
                  إنشاء التقرير
                </>
              )}
            </Button>
          </div>

          {/* Report Results */}
          {reportData && (
            <Card className="border-slate-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-slate-800">
                    نتائج التقرير
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={exportToPDF}
                      className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تصدير PDF
                    </Button>
                    <Button variant="outline" onClick={printReport}>
                      <Printer className="w-4 h-4 ml-2" />
                      طباعة
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Report Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-800">نوع التقرير</h4>
                      <p className="text-sm text-blue-600">
                        {reportData.title}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-800">
                        عدد السجلات
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {reportData.data.length}
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-medium text-purple-800">المدة</h4>
                      <p className="text-sm text-purple-600">
                        {new Date(reportData.startDate).toLocaleDateString(
                          "ar-SA"
                        )}{" "}
                        -
                        {new Date(reportData.endDate).toLocaleDateString(
                          "ar-SA"
                        )}
                      </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h4 className="font-medium text-orange-800">الحالة</h4>
                      <p className="text-sm text-orange-600">جاهز للتصدير</p>
                    </div>
                  </div>

                  {/* Summary Data */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-800 mb-3">
                      ملخص البيانات
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {Object.entries(reportData.summary).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm text-slate-600">
                              {getArabicLabel(key)}
                            </span>
                            <Badge variant="outline" className="text-slate-700">
                              {typeof value === "number"
                                ? value.toLocaleString("ar-SA")
                                : String(value)}
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Data Preview */}
                  {reportData.data.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-lg p-4">
                      <h4 className="font-medium text-slate-800 mb-3">
                        معاينة البيانات
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-slate-50">
                              {Object.keys(reportData.data[0] || {})
                                .slice(0, 5)
                                .map((key) => (
                                  <th
                                    key={key}
                                    className="p-2 text-right text-slate-600"
                                  >
                                    {getArabicLabel(key)}
                                  </th>
                                ))}
                            </tr>
                          </thead>
                          <tbody>
                            {reportData.data.slice(0, 3).map((item, index) => (
                              <tr
                                key={index}
                                className="border-b border-slate-100"
                              >
                                {Object.values(item)
                                  .slice(0, 5)
                                  .map((value, valIndex) => (
                                    <td
                                      key={valIndex}
                                      className="p-2 text-slate-700"
                                    >
                                      {typeof value === "object"
                                        ? JSON.stringify(value).substring(
                                            0,
                                            30
                                          ) + "..."
                                        : String(value)}
                                    </td>
                                  ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {reportData.data.length > 3 && (
                          <p className="text-xs text-slate-500 mt-2 text-center">
                            عرض 3 من {reportData.data.length} سجل
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const getArabicLabel = (key: string): string => {
  const labels: { [key: string]: string } = {
    totalDays: "إجمالي الأيام",
    totalEmployees: "إجمالي الموظفين",
    totalWages: "إجمالي الرواتب",
    presentDays: "أيام الحضور",
    absentDays: "أيام الغياب",
    lateDays: "أيام التأخير",
    totalCustomers: "إجمالي العملاء",
    totalDebts: "إجمالي الديون",
    activeDebts: "الديون النشطة",
    totalWithdrawals: "إجمالي السحوبات",
    totalAmount: "إجمالي المبلغ",
    averageWithdrawal: "متوسط السحب",
    totalExpenses: "إجمالي المصروفات",
    averageExpense: "متوسط المصروف",
  };

  return labels[key] || key;
};

export default ReportsGenerator;
