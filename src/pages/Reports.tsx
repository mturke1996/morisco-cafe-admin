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
} from "lucide-react";
import { InvoiceGenerator } from "@/components/InvoiceGenerator";

const Reports = () => {
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
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
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                التقارير والفواتير
              </h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                إنشاء وتصدير التقارير المالية والإدارية والفواتير
              </p>
            </div>
            <Button
              onClick={() => handleCreateInvoice("invoice", "فاتورة")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء فاتورة جديدة
            </Button>
          </div>
        </div>

        {/* Report Generator */}
        <ReportGenerator />

        {/* Report Types Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <BarChart3 className="w-5 h-5" />
                تقرير الحضور
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-600 text-sm mb-4">
                تقرير شامل لحضور وغياب الموظفين مع حساب اليوميات والإجماليات
              </p>
              <ul className="text-xs text-blue-700 space-y-1 mb-4">
                <li>• إحصائيات الحضور والغياب</li>
                <li>• حساب اليوميات المكتسبة</li>
                <li>• جدول تفصيلي بالتواريخ</li>
                <li>• تصدير PDF احترافي</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-blue-700 border-blue-300 hover:bg-blue-50"
                onClick={() => handleCreateInvoice("report", "تقرير الحضور")}
              >
                <FileText className="w-4 h-4 ml-2" />
                إنشاء تقرير
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Receipt className="w-5 h-5" />
                تقرير المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 text-sm mb-4">
                تقرير مفصل للمصروفات مع التوزيع حسب الفئات والإجماليات
              </p>
              <ul className="text-xs text-red-700 space-y-1 mb-4">
                <li>• إجمالي المصروفات</li>
                <li>• التوزيع حسب الفئة</li>
                <li>• جدول تفصيلي للمصروفات</li>
                <li>• رسوم بيانية وإحصائيات</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-700 border-red-300 hover:bg-red-50"
                onClick={() =>
                  handleCreateInvoice("expense", "تقرير المصروفات")
                }
              >
                <FileText className="w-4 h-4 ml-2" />
                إنشاء تقرير
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <CreditCard className="w-5 h-5" />
                تقرير الديون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600 text-sm mb-4">
                تقرير شامل لديون العملاء مع المبالغ المدفوعة والمتبقية
              </p>
              <ul className="text-xs text-orange-700 space-y-1 mb-4">
                <li>• إجمالي الديون والمدفوعات</li>
                <li>• الديون المعلقة والمدفوعة</li>
                <li>• تفاصيل كل عميل</li>
                <li>• إحصائيات مالية دقيقة</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-orange-700 border-orange-300 hover:bg-orange-50"
                onClick={() => handleCreateInvoice("report", "تقرير الديون")}
              >
                <FileText className="w-4 h-4 ml-2" />
                إنشاء تقرير
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Calculator className="w-5 h-5" />
                فاتورة عامة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 text-sm mb-4">
                إنشاء فواتير عامة للمبيعات والخدمات مع تصميم احترافي
              </p>
              <ul className="text-xs text-green-700 space-y-1 mb-4">
                <li>• تصميم احترافي للفواتير</li>
                <li>• إضافة عناصر متعددة</li>
                <li>• حساب الضريبة تلقائياً</li>
                <li>• طباعة PDF عالية الجودة</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-green-700 border-green-300 hover:bg-green-50"
                onClick={() => handleCreateInvoice("invoice", "فاتورة")}
              >
                <FileText className="w-4 h-4 ml-2" />
                إنشاء فاتورة
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Invoice Generator Modal */}
      <InvoiceGenerator
        isOpen={showInvoiceGenerator}
        onClose={() => setShowInvoiceGenerator(false)}
        type={invoiceType}
        title={invoiceTitle}
      />
    </div>
  );
};

export default Reports;
