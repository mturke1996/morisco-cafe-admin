import { useState } from "react";
import ReportGenerator from "@/components/ReportGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  TrendingUp,
  BarChart3,
  Plus,
  Receipt,
  CreditCard,
  Calculator,
  Settings,
  Download,
  Printer,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  DollarSign,
  CheckCircle,
  Users,
} from "lucide-react";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";
import { ProfessionalReportGenerator } from "@/components/ProfessionalReportGenerator";

const Reports = () => {
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [showProfessionalReportGenerator, setShowProfessionalReportGenerator] =
    useState(false);
  const [invoiceType, setInvoiceType] = useState<
    "invoice" | "report" | "salary" | "expense"
  >("invoice");
  const [invoiceTitle, setInvoiceTitle] = useState("");

  const handleCreateInvoice = (
    type: "invoice" | "report" | "salary" | "expense",
    title: string
  ) => {
    setInvoiceType(type);
    setInvoiceTitle(title);
    setShowInvoiceGenerator(true);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-3 sm:p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-green-600" />
                التقارير والفواتير
              </h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base">
                إنشاء وتصدير التقارير المالية والإدارية والفواتير
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => handleCreateInvoice("invoice", "فاتورة")}
                className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                size="sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                إنشاء فاتورة جديدة
              </Button>
              <Button
                onClick={() => setShowProfessionalReportGenerator(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xs sm:text-sm"
                size="sm"
              >
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                تقرير احترافي A4
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {/* Quick Actions Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-800 text-sm sm:text-base">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                إجراءات سريعة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => handleCreateInvoice("invoice", "فاتورة")}
                  size="sm"
                  className="text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Receipt className="w-3 h-3 ml-1" />
                  فاتورة
                </Button>
                <Button
                  onClick={() => handleCreateInvoice("report", "تقرير")}
                  size="sm"
                  variant="outline"
                  className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <FileText className="w-3 h-3 ml-1" />
                  تقرير
                </Button>
                <Button
                  onClick={() => handleCreateInvoice("salary", "مسير راتب")}
                  size="sm"
                  variant="outline"
                  className="text-xs border-green-300 text-green-700 hover:bg-green-50"
                >
                  <DollarSign className="w-3 h-3 ml-1" />
                  راتب
                </Button>
                <Button
                  onClick={() => handleCreateInvoice("expense", "مصروفات")}
                  size="sm"
                  variant="outline"
                  className="text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  <Calculator className="w-3 h-3 ml-1" />
                  مصروفات
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Professional Reports Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-800 text-sm sm:text-base">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                التقارير الاحترافية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-purple-600 text-xs sm:text-sm">
                إنشاء تقارير احترافية بحجم A4 مع تصميم متقدم
              </p>
              <ul className="text-xs text-purple-700 space-y-1">
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  تقارير شاملة للموظفين
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  تصميم احترافي للطباعة
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  متوافق مع جميع الأجهزة
                </li>
              </ul>
              <Button
                onClick={() => setShowProfessionalReportGenerator(true)}
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
              >
                <FileText className="w-3 h-3 ml-1" />
                إنشاء تقرير احترافي
              </Button>
            </CardContent>
          </Card>

          {/* Device Compatibility Card */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800 text-sm sm:text-base">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
                التوافق مع الأجهزة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <Smartphone className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <span className="text-xs text-green-700">الهواتف</span>
                </div>
                <div className="text-center">
                  <Tablet className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <span className="text-xs text-blue-700">الأجهزة اللوحية</span>
                </div>
                <div className="text-center">
                  <Monitor className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <span className="text-xs text-purple-700">الحواسيب</span>
                </div>
              </div>
              <p className="text-xs text-green-600 text-center">
                جميع التقارير متوافقة مع جميع أحجام الشاشات
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Report Generator - Mobile Optimized */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-800 text-sm sm:text-base">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
              مولد التقارير المتقدم
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="overflow-x-auto">
              <ReportGenerator />
            </div>
          </CardContent>
        </Card>

        {/* Additional Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Financial Reports */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-semibold text-emerald-800 text-sm">
                  التقارير المالية
                </h3>
              </div>
              <p className="text-xs text-emerald-700 mb-3">
                تقارير شاملة للوضع المالي والأرباح والخسائر
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                إنشاء تقرير مالي
              </Button>
            </CardContent>
          </Card>

          {/* Employee Reports */}
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800 text-sm">
                  تقارير الموظفين
                </h3>
              </div>
              <p className="text-xs text-blue-700 mb-3">
                تقارير الأداء والحضور والرواتب للموظفين
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                تقرير الموظفين
              </Button>
            </CardContent>
          </Card>

          {/* Sales Reports */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800 text-sm">
                  تقارير المبيعات
                </h3>
              </div>
              <p className="text-xs text-orange-700 mb-3">
                تحليل المبيعات والأداء والإيرادات
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-orange-300 text-orange-700 hover:bg-orange-50"
              >
                تقرير المبيعات
              </Button>
            </CardContent>
          </Card>

          {/* Inventory Reports */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-purple-800 text-sm">
                  تقارير المخزون
                </h3>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                تتبع المخزون والمواد والمشتريات
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                تقرير المخزون
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modals */}
        <InvoiceGenerator
          isOpen={showInvoiceGenerator}
          onClose={() => setShowInvoiceGenerator(false)}
          type={invoiceType}
          title={invoiceTitle}
        />

        <ProfessionalReportGenerator
          isOpen={showProfessionalReportGenerator}
          onClose={() => setShowProfessionalReportGenerator(false)}
        />
      </div>
    </div>
  );
};

export default Reports;
