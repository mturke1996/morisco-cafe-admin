import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Eye,
  Download,
  Printer,
  X,
  FileText,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Maximize2,
  Minimize2,
} from "lucide-react";

interface ReportPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: {
    title: string;
    type: string;
    startDate: string;
    endDate: string;
    data: any[];
    summary: Record<string, any>;
    analytics?: {
      trends: Record<string, number>;
      insights: string[];
    };
    charts?: Array<{
      type: string;
      title: string;
      data: any[];
    }>;
  } | null;
  onExport?: () => void;
  onPrint?: () => void;
}

export const ReportPreview = ({
  isOpen,
  onClose,
  reportData,
  onExport,
  onPrint,
}: ReportPreviewProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "data" | "analytics" | "charts">("overview");

  if (!isOpen || !reportData) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  const getStatusColor = (value: number, isPositive: boolean = true) => {
    if (value === 0) return "text-gray-600";
    return (isPositive ? value > 0 : value < 0) ? "text-green-600" : "text-red-600";
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Report Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <FileText className="w-5 h-5" />
            معلومات التقرير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-blue-600 mb-1">عنوان التقرير</p>
              <p className="font-semibold text-blue-800">{reportData.title}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">نوع التقرير</p>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                {reportData.type}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">الفترة الزمنية</p>
              <p className="font-medium text-blue-700">
                {formatDate(reportData.startDate)} - {formatDate(reportData.endDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-600 mb-1">عدد السجلات</p>
              <p className="font-semibold text-blue-800">{formatNumber(reportData.data.length)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(reportData.summary).map(([key, value]) => (
          <Card key={key} className="border-slate-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-slate-600">
                  {translateSummaryKey(key)}
                </h4>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  {getSummaryIcon(key)}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {typeof value === "number" ? formatNumber(value) : String(value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            إحصائيات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-600 mb-1">معدل النمو</p>
              <p className="text-xl font-bold text-green-700">+12.5%</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <BarChart3 className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-orange-600 mb-1">متوسط يومي</p>
              <p className="text-xl font-bold text-orange-700">
                {reportData.data.length > 0 ? formatNumber(Math.round(reportData.data.length / 30)) : "0"}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <PieChart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-600 mb-1">كفاءة البيانات</p>
              <p className="text-xl font-bold text-purple-700">95%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          البيانات التفصيلية ({formatNumber(reportData.data.length)} سجل)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b">
                  {reportData.data.length > 0 &&
                    Object.keys(reportData.data[0]).slice(0, 6).map((key) => (
                      <th key={key} className="p-3 text-right font-medium text-slate-600">
                        {translateKey(key)}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {reportData.data.slice(0, 10).map((item, index) => (
                  <tr key={index} className="border-b hover:bg-slate-50">
                    {Object.values(item).slice(0, 6).map((value, valIndex) => (
                      <td key={valIndex} className="p-3 text-slate-700">
                        {formatCellValue(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.data.length > 10 && (
              <div className="text-center py-4 text-slate-500">
                عرض 10 من {formatNumber(reportData.data.length)} سجل
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderAnalyticsTab = () => {
    if (!reportData.analytics) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">لا توجد تحليلات متوفرة لهذا التقرير</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              الاتجاهات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(reportData.analytics.trends).map(([key, value]) => (
                <div key={key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-600">
                      {translateKey(key)}
                    </span>
                    <Badge
                      variant={value > 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {value > 0 ? "+" : ""}{value}%
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        value > 0 ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(Math.abs(value), 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              الرؤى والتوصيات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.analytics.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-white font-bold">{index + 1}</span>
                  </div>
                  <p className="text-blue-800">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderChartsTab = () => {
    if (!reportData.charts || reportData.charts.length === 0) {
      return (
        <Card>
          <CardContent className="p-8 text-center">
            <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500">لا توجد رسوم بيانية متوفرة لهذا التقرير</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportData.charts.map((chart, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                {chart.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-slate-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-500">
                    مخطط {chart.type} - {formatNumber(chart.data.length)} نقطة بيانات
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const translateKey = (key: string): string => {
    const translations: Record<string, string> = {
      name: "الاسم",
      date: "التاريخ",
      amount: "المبلغ",
      status: "الحالة",
      position: "المنصب",
      check_in: "وقت الدخول",
      check_out: "وقت الخروج",
      daily_wage_earned: "الراتب اليومي",
      title: "العنوان",
      category: "الفئة",
      description: "الوصف",
      employee_id: "معرف الموظف",
      created_at: "تاريخ الإنشاء",
    };
    return translations[key] || key;
  };

  const translateSummaryKey = (key: string): string => {
    const translations: Record<string, string> = {
      totalDays: "إجمالي الأيام",
      totalEmployees: "إجمالي الموظفين",
      totalWages: "إجمالي الرواتب",
      presentDays: "أيام الحضور",
      absentDays: "أيام الغياب",
      totalExpenses: "إجمالي المصروفات",
      totalAmount: "إجمالي المبلغ",
      averageExpense: "متوسط المصروف",
      totalRevenue: "إجمالي الإيرادات",
      netProfit: "صافي الربح",
    };
    return translations[key] || key;
  };

  const getSummaryIcon = (key: string) => {
    const iconMap: Record<string, JSX.Element> = {
      totalDays: <Calendar className="w-4 h-4 text-blue-600" />,
      totalEmployees: <Users className="w-4 h-4 text-blue-600" />,
      totalWages: <DollarSign className="w-4 h-4 text-blue-600" />,
      presentDays: <TrendingUp className="w-4 h-4 text-blue-600" />,
      absentDays: <Activity className="w-4 h-4 text-blue-600" />,
      totalExpenses: <DollarSign className="w-4 h-4 text-blue-600" />,
      totalAmount: <DollarSign className="w-4 h-4 text-blue-600" />,
      totalRevenue: <BarChart3 className="w-4 h-4 text-blue-600" />,
    };
    return iconMap[key] || <FileText className="w-4 h-4 text-blue-600" />;
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "-";
    }

    if (typeof value === "number") {
      return formatNumber(value);
    }

    if (typeof value === "string" && value.includes("T")) {
      try {
        return new Date(value).toLocaleDateString("en-US");
      } catch {
        return value;
      }
    }

    return String(value);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${
        isFullscreen ? "p-0" : ""
      }`}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl ${
          isFullscreen ? "w-full h-full rounded-none" : "max-w-7xl w-full max-h-[95vh]"
        } overflow-hidden flex flex-col`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">معاينة التقرير</h2>
                <p className="text-slate-600 text-sm">{reportData.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="w-4 h-4 ml-2" />
                  تصدير
                </Button>
              )}
              {onPrint && (
                <Button variant="outline" size="sm" onClick={onPrint}>
                  <Printer className="w-4 h-4 ml-2" />
                  طباعة
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: "overview", label: "نظرة عامة", icon: Eye },
              { id: "data", label: "البيانات", icon: FileText },
              { id: "analytics", label: "التحليلات", icon: TrendingUp },
              { id: "charts", label: "الرسوم البيانية", icon: BarChart3 },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "data" && renderDataTab()}
          {activeTab === "analytics" && renderAnalyticsTab()}
          {activeTab === "charts" && renderChartsTab()}
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
