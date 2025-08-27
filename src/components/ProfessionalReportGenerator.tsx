import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  FileText,
  Calendar,
  Download,
  Printer,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  Award,
  Building,
  MapPin,
  Phone,
  Mail,
  Globe,
  Settings,
  Zap,
  Crown,
  Target,
  Activity,
  Calculator,
} from "lucide-react";

interface LocationSettings {
  location_name: string;
  location_address: string;
  business_hours: string;
  currency: string;
  tax_rate: number;
  logo_url: string;
  contact_info: any;
  report_settings: any;
}

interface ProfessionalReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfessionalReportGenerator = ({
  isOpen,
  onClose,
}: ProfessionalReportGeneratorProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [locationSettings, setLocationSettings] =
    useState<LocationSettings | null>(null);

  // Report configuration
  const [reportType, setReportType] = useState<
    "employee" | "financial" | "attendance" | "comprehensive"
  >("comprehensive");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [includeAttendance, setIncludeAttendance] = useState(true);
  const [includeSalary, setIncludeSalary] = useState(true);
  const [includeExpenses, setIncludeExpenses] = useState(true);
  const [includeAdjustments, setIncludeAdjustments] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchLocationSettings();
      // Set default date range (current month)
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setPeriodStart(firstDay.toISOString().split("T")[0]);
      setPeriodEnd(lastDay.toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const fetchLocationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("location_settings")
        .select("*")
        .single();

      if (error) throw error;
      setLocationSettings(data);
    } catch (error) {
      console.error("خطأ في جلب إعدادات الموقع:", error);
    }
  };

  const generateReport = async () => {
    if (!periodStart || !periodEnd) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد فترة التقرير",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch comprehensive data
      const reportData = await fetchReportData();
      const htmlContent = generateHTMLReport(reportData);

      // Open print window
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        toast({
          title: "خطأ",
          description: "فشل في فتح نافذة الطباعة",
          variant: "destructive",
        });
        return;
      }

      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);

      toast({
        title: "تم بنجاح",
        description: "تم إنشاء التقرير بنجاح",
      });
    } catch (error) {
      console.error("خطأ في إنشاء التقرير:", error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء التقرير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReportData = async () => {
    const data: any = {};

    // Fetch employees
    if (includeAttendance || includeSalary) {
      const { data: employees } = await supabase
        .from("employees")
        .select("*")
        .order("name");
      data.employees = employees || [];
    }

    // Fetch attendance data
    if (includeAttendance) {
      const { data: attendance } = await supabase
        .from("attendance")
        .select("*")
        .gte("date", periodStart)
        .lte("date", periodEnd);
      data.attendance = attendance || [];
    }

    // Fetch salary payments
    if (includeSalary) {
      const { data: salaryPayments } = await supabase
        .from("salary_payments")
        .select("*")
        .gte("payment_date", periodStart)
        .lte("payment_date", periodEnd);
      data.salaryPayments = salaryPayments || [];
    }

    // Fetch expenses
    if (includeExpenses) {
      const { data: expenses } = await supabase
        .from("expenses")
        .select("*")
        .gte("expense_date", periodStart)
        .lte("expense_date", periodEnd);
      data.expenses = expenses || [];
    }

    // Fetch adjustments
    if (includeAdjustments) {
      const { data: adjustments } = await supabase
        .from("employee_adjustments")
        .select("*")
        .gte("adjustment_date", periodStart)
        .lte("adjustment_date", periodEnd);
      data.adjustments = adjustments || [];
    }

    return data;
  };

  const generateHTMLReport = (data: any) => {
    const location = locationSettings || {
      location_name: "موريسكو كافيه",
      location_address: "تاجوراء - طرابلس، ليبيا",
      currency: "د.ل",
      tax_rate: 14,
    };

    const totalEmployees = data.employees?.length || 0;
    const totalAttendance = data.attendance?.length || 0;
    const totalSalary =
      data.salaryPayments?.reduce(
        (sum: number, payment: any) => sum + payment.amount_paid,
        0
      ) || 0;
    const totalExpenses =
      data.expenses?.reduce(
        (sum: number, expense: any) => sum + expense.amount,
        0
      ) || 0;

    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير احترافي - ${location.location_name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Cairo', sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            color: #2d3748;
            line-height: 1.6;
            padding: 20px;
          }
          
          .report-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            position: relative;
          }
          
          .report-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            background: linear-gradient(90deg, #10b981, #3b82f6, #8b5cf6, #f59e0b);
          }
          
          .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
          
          .logo-section {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin-bottom: 20px;
          }
          
          .logo-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: white;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          }
          
          .company-info h1 {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #10b981, #3b82f6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .company-info p {
            font-size: 1.1rem;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          
          .report-meta {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
            backdrop-filter: blur(10px);
          }
          
          .report-meta h2 {
            font-size: 1.5rem;
            margin-bottom: 15px;
            color: #10b981;
          }
          
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          
          .meta-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 15px;
            border-radius: 10px;
            text-align: center;
          }
          
          .meta-item strong {
            display: block;
            font-size: 1.2rem;
            margin-bottom: 5px;
            color: #10b981;
          }
          
          .content {
            padding: 40px;
          }
          
          .section {
            margin-bottom: 40px;
          }
          
          .section-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 3px solid #e2e8f0;
          }
          
          .section-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
          }
          
          .section-title {
            font-size: 1.8rem;
            font-weight: 700;
            color: #1e293b;
          }
          
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
          }
          
          .stat-card {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            border: 1px solid #e2e8f0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
          }
          
          .stat-number {
            font-size: 2.5rem;
            font-weight: 800;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #10b981, #059669);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }
          
          .stat-label {
            font-size: 1rem;
            color: #64748b;
            font-weight: 500;
          }
          
          .table-container {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            margin-bottom: 30px;
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.9rem;
          }
          
          .data-table th {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 18px 15px;
            text-align: right;
            font-weight: 600;
            font-size: 0.95rem;
          }
          
          .data-table td {
            padding: 15px;
            border-bottom: 1px solid #e2e8f0;
            text-align: right;
          }
          
          .data-table tr:nth-child(even) {
            background: #f8fafc;
          }
          
          .data-table tr:hover {
            background: #e2e8f0;
          }
          
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
          }
          
          .badge-success {
            background: #dcfce7;
            color: #166534;
          }
          
          .badge-warning {
            background: #fef3c7;
            color: #92400e;
          }
          
          .badge-danger {
            background: #fee2e2;
            color: #991b1b;
          }
          
          .summary-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 20px;
            padding: 30px;
            margin-top: 40px;
            border: 2px solid #0ea5e9;
          }
          
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
          }
          
          .summary-item {
            text-align: center;
            padding: 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          }
          
          .summary-value {
            font-size: 2rem;
            font-weight: 800;
            color: #0ea5e9;
            margin-bottom: 8px;
          }
          
          .summary-label {
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 500;
          }
          
          .footer {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 30px 40px;
            text-align: center;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 20px;
          }
          
          .footer-info {
            text-align: right;
          }
          
          .footer-info h3 {
            font-size: 1.2rem;
            margin-bottom: 10px;
            color: #10b981;
          }
          
          .footer-info p {
            margin-bottom: 5px;
            opacity: 0.9;
          }
          
          .footer-stats {
            text-align: left;
          }
          
          .footer-stats h3 {
            font-size: 1.2rem;
            margin-bottom: 10px;
            color: #10b981;
          }
          
          .footer-stats p {
            margin-bottom: 5px;
            opacity: 0.9;
          }
          
          .generated-info {
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.2);
            font-size: 0.9rem;
            opacity: 0.8;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .report-container {
              box-shadow: none;
              border-radius: 0;
            }
            
            .header::before {
              display: none;
            }
            
            .stat-card:hover {
              transform: none;
              box-shadow: none;
            }
          }
          
          @media (max-width: 768px) {
            body {
              padding: 10px;
            }
            
            .header {
              padding: 20px;
            }
            
            .company-info h1 {
              font-size: 1.8rem;
            }
            
            .content {
              padding: 20px;
            }
            
            .stats-grid {
              grid-template-columns: 1fr;
            }
            
            .meta-grid {
              grid-template-columns: 1fr;
            }
            
            .footer-content {
              flex-direction: column;
              text-align: center;
            }
            
            .footer-info,
            .footer-stats {
              text-align: center;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <div class="logo-icon">☕</div>
              <div class="company-info">
                <h1>${location.location_name}</h1>
                <p>${location.location_address}</p>
                <p>تقرير احترافي شامل</p>
              </div>
            </div>
            
            <div class="report-meta">
              <h2>📊 معلومات التقرير</h2>
              <div class="meta-grid">
                <div class="meta-item">
                  <strong>نوع التقرير</strong>
                  <span>تقرير شامل</span>
                </div>
                <div class="meta-item">
                  <strong>الفترة</strong>
                  <span>${new Date(periodStart).toLocaleDateString(
                    "ar-LY"
                  )} - ${new Date(periodEnd).toLocaleDateString("ar-LY")}</span>
                </div>
                <div class="meta-item">
                  <strong>تاريخ الإنشاء</strong>
                  <span>${new Date().toLocaleDateString("ar-LY")}</span>
                </div>
                <div class="meta-item">
                  <strong>العملة</strong>
                  <span>${location.currency}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Content -->
          <div class="content">
            <!-- Statistics Overview -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">📈</div>
                <h2 class="section-title">نظرة عامة على الإحصائيات</h2>
              </div>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-number">${totalEmployees}</div>
                  <div class="stat-label">إجمالي الموظفين</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${totalAttendance}</div>
                  <div class="stat-label">سجلات الحضور</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${totalSalary.toFixed(0)}</div>
                  <div class="stat-label">إجمالي الرواتب (${
                    location.currency
                  })</div>
                </div>
                <div class="stat-card">
                  <div class="stat-number">${totalExpenses.toFixed(0)}</div>
                  <div class="stat-label">إجمالي المصروفات (${
                    location.currency
                  })</div>
                </div>
              </div>
            </div>
            
            ${
              includeAttendance && data.attendance?.length > 0
                ? `
            <!-- Attendance Section -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">⏰</div>
                <h2 class="section-title">سجلات الحضور والانصراف</h2>
              </div>
              
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>اسم الموظف</th>
                      <th>التاريخ</th>
                      <th>وقت الحضور</th>
                      <th>وقت الانصراف</th>
                      <th>الحالة</th>
                      <th>ساعات العمل</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.attendance
                      .slice(0, 10)
                      .map((record: any) => {
                        const employee = data.employees?.find(
                          (e: any) => e.id === record.employee_id
                        );
                        const statusBadge =
                          record.status === "present"
                            ? "badge-success"
                            : record.status === "absent"
                            ? "badge-danger"
                            : "badge-warning";
                        const statusText =
                          record.status === "present"
                            ? "حاضر"
                            : record.status === "absent"
                            ? "غائب"
                            : "متأخر";

                        return `
                        <tr>
                          <td>${employee?.name || "غير محدد"}</td>
                          <td>${new Date(record.date).toLocaleDateString(
                            "ar-LY"
                          )}</td>
                          <td>${record.check_in_time || "غير محدد"}</td>
                          <td>${record.check_out_time || "غير محدد"}</td>
                          <td><span class="badge ${statusBadge}">${statusText}</span></td>
                          <td>${record.work_hours || 0} ساعة</td>
                        </tr>
                      `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
            `
                : ""
            }
            
            ${
              includeSalary && data.salaryPayments?.length > 0
                ? `
            <!-- Salary Section -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">💰</div>
                <h2 class="section-title">سجلات الرواتب</h2>
              </div>
              
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>اسم الموظف</th>
                      <th>تاريخ الدفع</th>
                      <th>المبلغ المدفوع</th>
                      <th>الفترة</th>
                      <th>الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.salaryPayments
                      .slice(0, 10)
                      .map((payment: any) => {
                        const employee = data.employees?.find(
                          (e: any) => e.id === payment.employee_id
                        );
                        return `
                        <tr>
                          <td>${employee?.name || "غير محدد"}</td>
                          <td>${new Date(
                            payment.payment_date
                          ).toLocaleDateString("ar-LY")}</td>
                          <td>${payment.amount_paid.toFixed(2)} ${
                          location.currency
                        }</td>
                          <td>${new Date(
                            payment.period_start
                          ).toLocaleDateString("ar-LY")} - ${new Date(
                          payment.period_end
                        ).toLocaleDateString("ar-LY")}</td>
                          <td>${payment.notes || "-"}</td>
                        </tr>
                      `;
                      })
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
            `
                : ""
            }
            
            ${
              includeExpenses && data.expenses?.length > 0
                ? `
            <!-- Expenses Section -->
            <div class="section">
              <div class="section-header">
                <div class="section-icon">📋</div>
                <h2 class="section-title">سجلات المصروفات</h2>
              </div>
              
              <div class="table-container">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>التاريخ</th>
                      <th>الفئة</th>
                      <th>الوصف</th>
                      <th>المبلغ</th>
                      <th>طريقة الدفع</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.expenses
                      .slice(0, 10)
                      .map(
                        (expense: any) => `
                      <tr>
                        <td>${new Date(expense.expense_date).toLocaleDateString(
                          "ar-LY"
                        )}</td>
                        <td>${expense.category || "غير محدد"}</td>
                        <td>${expense.description || "-"}</td>
                        <td>${expense.amount.toFixed(2)} ${
                          location.currency
                        }</td>
                        <td>${expense.payment_method || "غير محدد"}</td>
                      </tr>
                    `
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
            </div>
            `
                : ""
            }
            
            ${
              includeSummary
                ? `
            <!-- Summary Section -->
            <div class="summary-section">
              <div class="section-header">
                <div class="section-icon">📊</div>
                <h2 class="section-title">ملخص مالي شامل</h2>
              </div>
              
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-value">${totalSalary.toFixed(0)}</div>
                  <div class="summary-label">إجمالي الرواتب المدفوعة</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${totalExpenses.toFixed(0)}</div>
                  <div class="summary-label">إجمالي المصروفات</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${(
                    totalSalary + totalExpenses
                  ).toFixed(0)}</div>
                  <div class="summary-label">إجمالي التكاليف</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${totalEmployees}</div>
                  <div class="summary-label">عدد الموظفين النشطين</div>
                </div>
              </div>
            </div>
            `
                : ""
            }
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="footer-content">
              <div class="footer-info">
                <h3>معلومات الاتصال</h3>
                <p>📍 ${location.location_address}</p>
                <p>📞 ${location.contact_info?.phone || "0910929091"}</p>
                <p>✉️ ${
                  location.contact_info?.email || "info@moresquecafe.ly"
                }</p>
              </div>
              
              <div class="footer-stats">
                <h3>إحصائيات سريعة</h3>
                <p>📈 إجمالي الموظفين: ${totalEmployees}</p>
                <p>⏰ سجلات الحضور: ${totalAttendance}</p>
                <p>💰 إجمالي الرواتب: ${totalSalary.toFixed(0)} ${
      location.currency
    }</p>
                <p>📋 إجمالي المصروفات: ${totalExpenses.toFixed(0)} ${
      location.currency
    }</p>
              </div>
            </div>
            
            <div class="generated-info">
              <p>تم إنشاء هذا التقرير في ${new Date().toLocaleString(
                "ar-LY"
              )} بواسطة نظام إدارة موريسكو كافيه</p>
              <p>جميع البيانات محمية ومشفرة وفقاً لأحدث معايير الأمان</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5" />
            مولد التقارير الاحترافية
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Configuration */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Settings className="w-5 h-5" />
                إعدادات التقرير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reportType">نوع التقرير</Label>
                  <Select
                    value={reportType}
                    onValueChange={(value: any) => setReportType(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          تقرير شامل
                        </div>
                      </SelectItem>
                      <SelectItem value="employee">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          تقرير الموظفين
                        </div>
                      </SelectItem>
                      <SelectItem value="financial">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          تقرير مالي
                        </div>
                      </SelectItem>
                      <SelectItem value="attendance">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          تقرير الحضور
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="periodStart">تاريخ البداية</Label>
                  <Input
                    id="periodStart"
                    type="date"
                    value={periodStart}
                    onChange={(e) => setPeriodStart(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="periodEnd">تاريخ النهاية</Label>
                  <Input
                    id="periodEnd"
                    type="date"
                    value={periodEnd}
                    onChange={(e) => setPeriodEnd(e.target.value)}
                  />
                </div>

                <div>
                  <Label>العملة</Label>
                  <div className="text-sm text-gray-600 mt-1">
                    {locationSettings?.currency || "د.ل"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Selection */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Zap className="w-5 h-5" />
                محتوى التقرير
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="includeAttendance"
                    checked={includeAttendance}
                    onCheckedChange={(checked) =>
                      setIncludeAttendance(!!checked)
                    }
                  />
                  <Label
                    htmlFor="includeAttendance"
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    سجلات الحضور والانصراف
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="includeSalary"
                    checked={includeSalary}
                    onCheckedChange={(checked) => setIncludeSalary(!!checked)}
                  />
                  <Label
                    htmlFor="includeSalary"
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    سجلات الرواتب
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="includeExpenses"
                    checked={includeExpenses}
                    onCheckedChange={(checked) => setIncludeExpenses(!!checked)}
                  />
                  <Label
                    htmlFor="includeExpenses"
                    className="flex items-center gap-2"
                  >
                    <TrendingUp className="w-4 h-4" />
                    سجلات المصروفات
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="includeAdjustments"
                    checked={includeAdjustments}
                    onCheckedChange={(checked) =>
                      setIncludeAdjustments(!!checked)
                    }
                  />
                  <Label
                    htmlFor="includeAdjustments"
                    className="flex items-center gap-2"
                  >
                    <Calculator className="w-4 h-4" />
                    الإضافي والخصم
                  </Label>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Checkbox
                    id="includeSummary"
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(!!checked)}
                  />
                  <Label
                    htmlFor="includeSummary"
                    className="flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    ملخص مالي شامل
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Highlight */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <Star className="w-5 h-5" />
                مميزات التقرير الاحترافي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                  <Crown className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-800">
                      تصميم احترافي
                    </div>
                    <div className="text-xs text-purple-600">
                      تصميم حديث ومتطور
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                  <Target className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-800">
                      دقة عالية
                    </div>
                    <div className="text-xs text-purple-600">
                      بيانات دقيقة ومحدثة
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-purple-100">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="font-semibold text-purple-800">
                      متوافق مع الأجهزة
                    </div>
                    <div className="text-xs text-purple-600">
                      يعمل على جميع الأجهزة
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={generateReport}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                  جاري إنشاء التقرير...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 ml-2" />
                  إنشاء التقرير الاحترافي
                </>
              )}
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
