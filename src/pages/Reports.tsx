
import ReportGenerator from "@/components/ReportGenerator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, BarChart3 } from "lucide-react";

const Reports = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-3 sm:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            التقارير
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            إنشاء وتصدير التقارير المالية والإدارية
          </p>
        </div>

        {/* Report Generator */}
        <ReportGenerator />

        {/* Report Types Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• إحصائيات الحضور والغياب</li>
                <li>• حساب اليوميات المكتسبة</li>
                <li>• جدول تفصيلي بالتواريخ</li>
                <li>• تصدير PDF احترافي</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <TrendingUp className="w-5 h-5" />
                تقرير المصروفات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 text-sm mb-4">
                تقرير مفصل للمصروفات مع التوزيع حسب الفئات والإجماليات
              </p>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• إجمالي المصروفات</li>
                <li>• التوزيع حسب الفئة</li>
                <li>• جدول تفصيلي للمصروفات</li>
                <li>• رسوم بيانية وإحصائيات</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <FileText className="w-5 h-5" />
                تقرير الديون
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-600 text-sm mb-4">
                تقرير شامل لديون العملاء مع المبالغ المدفوعة والمتبقية
              </p>
              <ul className="text-xs text-orange-700 space-y-1">
                <li>• إجمالي الديون والمدفوعات</li>
                <li>• الديون المعلقة والمدفوعة</li>
                <li>• تفاصيل كل عميل</li>
                <li>• إحصائيات مالية دقيقة</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reports;
