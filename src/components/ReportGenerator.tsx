import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, FileText, Users, Receipt, CreditCard } from "lucide-react";
import { useReportsData } from "@/hooks/useReports";
import { generateAttendanceReportPDF } from "./reports/AttendanceReportPDF";
import { generateExpensesReportPDF } from "./reports/ExpensesReportPDF";
import { generateDebtsReportPDF } from "./reports/DebtsReportPDF";

const ReportGenerator = () => {
  const [reportType, setReportType] = useState("");
  const [dateRange, setDateRange] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  const { data: reportsData, isLoading } = useReportsData();

  const handleGenerateReport = () => {
    if (!reportType || !reportsData) {
      return;
    }

    const reportConfig = {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
      dateRange
    };

    switch (reportType) {
      case "attendance":
        generateAttendanceReportPDF({
          data: reportsData.attendance.details,
          config: reportConfig
        });
        break;
      case "expenses":
        generateExpensesReportPDF({
          data: reportsData.expenses,
          config: reportConfig
        });
        break;
      case "debts":
        generateDebtsReportPDF({
          data: reportsData.debts.details,
          config: reportConfig
        });
        break;
      default:
        break;
    }
  };

  const reportTypes = [
    { value: "attendance", label: "تقرير الحضور والانصراف", icon: Users },
    { value: "expenses", label: "تقرير المصروفات", icon: Receipt },
    { value: "debts", label: "تقرير الديون", icon: CreditCard },
    { value: "salaries", label: "تقرير الرواتب", icon: FileText }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5" />
          مولد التقارير
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">نوع التقرير</label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التقرير" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="w-4 h-4" />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">الفترة الزمنية</label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفترة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">يومي</SelectItem>
                <SelectItem value="weekly">أسبوعي</SelectItem>
                <SelectItem value="monthly">شهري</SelectItem>
                <SelectItem value="custom">فترة مخصصة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {dateRange === "custom" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">من تاريخ</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleGenerateReport}
            disabled={!reportType}
            className="btn-gradient"
          >
            <Download className="w-4 h-4 ml-2" />
            إنشاء وتحميل التقرير
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportGenerator;
