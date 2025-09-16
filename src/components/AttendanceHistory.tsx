import { useState, useEffect } from "react";
import { Calendar, Download, Filter, FileText, User, Clock, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Employee {
  id: string;
  name: string;
  position: string;
  status: string;
}

interface AttendanceRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  daily_wage_earned: number;
  deduction_amount: number;
  bonus_amount: number;
  early_departure: boolean;
  deduction_reason: string | null;
  employees: Employee;
}

interface WithdrawalRecord {
  id: string;
  employee_id: string;
  amount: number;
  withdrawal_date: string;
  notes: string | null;
}

const AttendanceHistory = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [withdrawalRecords, setWithdrawalRecords] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('خطأ في جلب بيانات الموظفين:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الموظفين",
        variant: "destructive"
      });
    }
  };

  const fetchRecords = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "تنبيه",
        description: "يرجى تحديد تاريخ البداية والنهاية",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch attendance records
      let attendanceQuery = supabase
        .from('attendance')
        .select(`
          id,
          employee_id,
          date,
          check_in,
          check_out,
          status,
          daily_wage_earned,
          deduction_amount,
          bonus_amount,
          early_departure,
          deduction_reason,
          employees!attendance_employee_id_fkey (
            id,
            name,
            position,
            status
          )
        `)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (selectedEmployee !== "all") {
        attendanceQuery = attendanceQuery.eq('employee_id', selectedEmployee);
      }

      const { data: attendanceData, error: attendanceError } = await attendanceQuery;
      if (attendanceError) throw attendanceError;

      // Fetch withdrawal records
      let withdrawalQuery = supabase
        .from('employee_withdrawals')
        .select('*')
        .gte('withdrawal_date', startDate)
        .lte('withdrawal_date', endDate)
        .order('withdrawal_date', { ascending: false });

      if (selectedEmployee !== "all") {
        withdrawalQuery = withdrawalQuery.eq('employee_id', selectedEmployee);
      }

      const { data: withdrawalData, error: withdrawalError } = await withdrawalQuery;
      if (withdrawalError) throw withdrawalError;

      setAttendanceRecords(attendanceData || []);
      setWithdrawalRecords(withdrawalData || []);
    } catch (error) {
      console.error('خطأ في جلب السجلات:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب السجلات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const totalEarnings = attendanceRecords.reduce((sum, record) => 
        sum + (record.daily_wage_earned || 0) + (record.bonus_amount || 0) - (record.deduction_amount || 0), 0
      );
      const totalWithdrawals = withdrawalRecords.reduce((sum, record) => sum + record.amount, 0);
      const balance = totalEarnings - totalWithdrawals;

      const printContent = `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <meta charset="UTF-8">
          <title>تقرير الحضور والغياب - مقهى موريسكو</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&display=swap');
            
            @media print {
              @page { 
                margin: 0.3in; 
                size: A4;
              }
              body { 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body { 
              font-family: 'Cairo', sans-serif; 
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              color: #1e293b;
              direction: rtl;
              line-height: 1.6;
              padding: 20px;
              min-height: 100vh;
            }
            
            .document-container {
              max-width: 1200px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
            }
            
            .header-section {
              background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #4ade80 100%);
              padding: 40px;
              position: relative;
              overflow: hidden;
            }
            
            .header-section::before {
              content: '';
              position: absolute;
              top: -50%;
              right: -50%;
              width: 200%;
              height: 200%;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="25" cy="75" r="1" fill="white" opacity="0.05"/><circle cx="75" cy="25" r="1" fill="white" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
              pointer-events: none;
            }
            
            .header-content {
              position: relative;
              z-index: 2;
              text-align: center;
            }
            
            .logo-container {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 20px;
              margin-bottom: 30px;
            }
            
            .logo {
              width: 120px;
              height: 120px;
              background: rgba(255, 255, 255, 0.95);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 48px;
              color: #16a34a;
              font-weight: 900;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
              position: relative;
            }
            
            .logo::before {
              content: '';
              position: absolute;
              inset: -3px;
              background: linear-gradient(45deg, #f59e0b, #eab308, #22c55e, #16a34a);
              border-radius: 50%;
              z-index: -1;
              padding: 3px;
            }
            
            .cafe-name {
              color: white;
              font-size: 42px;
              font-weight: 900;
              text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
              margin-bottom: 8px;
              letter-spacing: 1px;
            }
            
            .cafe-subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 18px;
              font-weight: 500;
              margin-bottom: 25px;
            }
            
            .report-title {
              color: white;
              font-size: 32px;
              font-weight: 700;
              margin-bottom: 15px;
              text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
            }
            
            .report-date {
              color: rgba(255, 255, 255, 0.95);
              font-size: 18px;
              font-weight: 500;
            }
            
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
              gap: 25px;
              padding: 40px;
              background: #f8fafc;
            }
            
            .stat-card {
              background: white;
              padding: 30px;
              border-radius: 16px;
              text-align: center;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
              border: 1px solid #e2e8f0;
              position: relative;
              overflow: hidden;
              transition: all 0.3s ease;
            }
            
            .stat-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #16a34a, #22c55e);
            }
            
            .stat-card:hover {
              transform: translateY(-5px);
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
            }
            
            .stat-label {
              color: #64748b;
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .stat-value {
              font-size: 36px;
              font-weight: 900;
              margin-bottom: 8px;
            }
            
            .stat-positive { color: #16a34a; }
            .stat-negative { color: #dc2626; }
            .stat-neutral { color: #0f172a; }
            
            .content-section {
              padding: 40px;
            }
            
            .section-title {
              font-size: 28px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 30px;
              text-align: center;
              position: relative;
              padding-bottom: 15px;
            }
            
            .section-title::after {
              content: '';
              position: absolute;
              bottom: 0;
              left: 50%;
              transform: translateX(-50%);
              width: 80px;
              height: 4px;
              background: linear-gradient(90deg, #16a34a, #22c55e);
              border-radius: 2px;
            }
            
            .records-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }
            
            .table-header {
              background: linear-gradient(135deg, #1e293b, #334155);
              color: white;
            }
            
            .table-header th {
              padding: 20px 15px;
              font-weight: 700;
              font-size: 14px;
              text-align: center;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            
            .table-row {
              background: white;
              transition: all 0.2s ease;
            }
            
            .table-row:nth-child(even) {
              background: #f8fafc;
            }
            
            .table-row:hover {
              background: #e2e8f0;
              transform: scale(1.01);
            }
            
            .table-row td {
              padding: 16px 15px;
              text-align: center;
              font-size: 14px;
              border-bottom: 1px solid #e2e8f0;
              font-weight: 500;
            }
            
            .status-badge {
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-present {
              background: #dcfce7;
              color: #166534;
              border: 1px solid #bbf7d0;
            }
            
            .status-absent {
              background: #fee2e2;
              color: #991b1b;
              border: 1px solid #fecaca;
            }
            
            .amount-cell {
              font-weight: 700;
              font-size: 15px;
            }
            
            .footer-section {
              background: #1e293b;
              color: white;
              padding: 30px 40px;
              text-align: center;
            }
            
            .footer-title {
              font-size: 18px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            
            .footer-text {
              color: #94a3b8;
              font-size: 14px;
              line-height: 1.5;
            }
            
            .generation-date {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #334155;
              color: #64748b;
              font-size: 13px;
            }
            
            @media print {
              .stat-card:hover,
              .table-row:hover {
                transform: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="document-container">
            <div class="header-section">
              <div class="header-content">
                <div class="logo-container">
                  <div class="logo">☕</div>
                  <div>
                    <h1 class="cafe-name">مقهى موريسكو</h1>
                    <p class="cafe-subtitle">Morisco Café</p>
                  </div>
                </div>
                <h2 class="report-title">تقرير الحضور والمرتبات</h2>
                <p class="report-date">من ${new Date(startDate).toLocaleDateString('en-US')} إلى ${new Date(endDate).toLocaleDateString('en-US')}</p>
              </div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-label">إجمالي أيام العمل</div>
                <div class="stat-value stat-neutral">${attendanceRecords.length}</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">إجمالي الأرباح</div>
                <div class="stat-value stat-positive">${totalEarnings.toFixed(2)} د.ل</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">إجمالي المسحوبات</div>
                <div class="stat-value stat-negative">${totalWithdrawals.toFixed(2)} د.ل</div>
              </div>
              <div class="stat-card">
                <div class="stat-label">الرصيد المتبقي</div>
                <div class="stat-value ${balance >= 0 ? 'stat-positive' : 'stat-negative'}">${balance.toFixed(2)} د.ل</div>
              </div>
            </div>

            <div class="content-section">
              <h3 class="section-title">تفاصيل سجل الحضور والأجور</h3>
              
              <table class="records-table">
                <thead class="table-header">
                  <tr>
                    <th>التاريخ</th>
                    <th>اسم الموظف</th>
                    <th>حالة الحضور</th>
                    <th>وقت الدخول</th>
                    <th>الأجر اليومي</th>
                    <th>المكافآت</th>
                    <th>الخصومات</th>
                    <th>صافي الأجر</th>
                    <th>المسحوبات</th>
                  </tr>
                </thead>
                <tbody>
                  ${attendanceRecords.map(record => {
                    const netEarnings = (record.daily_wage_earned || 0) + (record.bonus_amount || 0) - (record.deduction_amount || 0);
                    const dayWithdrawals = withdrawalRecords
                      .filter(w => w.employee_id === record.employee_id && w.withdrawal_date === record.date)
                      .reduce((sum, w) => sum + w.amount, 0);
                    
                    return `
                      <tr class="table-row">
                        <td>${new Date(record.date).toLocaleDateString('en-US')}</td>
                        <td style="font-weight: 600;">${record.employees?.name || 'غير محدد'}</td>
                        <td>
                          <span class="status-badge ${record.status === 'present' ? 'status-present' : 'status-absent'}">
                            ${record.status === 'present' ? 'حاضر' : 'غائب'}
                          </span>
                        </td>
                        <td>${record.check_in ? new Date(record.check_in).toLocaleTimeString('ar-LY', { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                        <td class="amount-cell stat-positive">${(record.daily_wage_earned || 0).toFixed(2)} د.ل</td>
                        <td class="amount-cell stat-positive">${(record.bonus_amount || 0).toFixed(2)} د.ل</td>
                        <td class="amount-cell stat-negative">${(record.deduction_amount || 0).toFixed(2)} د.ل</td>
                        <td class="amount-cell stat-positive" style="font-weight: 800;">${netEarnings.toFixed(2)} د.ل</td>
                        <td class="amount-cell stat-negative">${dayWithdrawals.toFixed(2)} د.ل</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>

            <div class="footer-section">
              <h4 class="footer-title">مقهى موريسكو - نظام إدارة الموظفين</h4>
              <p class="footer-text">
                هذا التقرير تم إنشاؤه آلياً بواسطة نظام إدارة الموظفين المتطور<br>
                جميع البيانات محفوظة ومؤمنة وفقاً لأعلى معايير الأمان
              </p>
              <div class="generation-date">
                تم إنشاء هذا التقرير في: ${new Date().toLocaleDateString('en-US')} - ${new Date().toLocaleTimeString('en-US')}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=1200,height=800');
      
      if (!printWindow) {
        // Fallback: create a downloadable HTML file
        const blob = new Blob([printContent], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `تقرير_مقهى_موريسكو_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "تم التحميل بنجاح",
          description: "تم تحميل التقرير كملف HTML. يمكنك فتحه وطباعته كـ PDF من المتصفح",
        });
        return;
      }

      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait for content to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          
          // Close window after printing (with delay to ensure print dialog appears)
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };

      toast({
        title: "جاري فتح الطباعة",
        description: "سيتم فتح نافذة الطباعة الآن مع التصميم الجديد",
      });

    } catch (error) {
      console.error('خطأ في إنشاء PDF:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء ملف PDF",
        variant: "destructive"
      });
    }
  };

  const calculateWorkingHours = (checkIn: string | null, checkOut: string | null) => {
    if (!checkIn) return "0";
    
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date();
    const diffInMs = end.getTime() - start.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    return diffInHours.toFixed(1);
  };

  const groupedData = attendanceRecords.reduce((acc, record) => {
    const date = record.date;
    if (!acc[date]) {
      acc[date] = {
        attendance: [],
        withdrawals: []
      };
    }
    acc[date].attendance.push(record);
    return acc;
  }, {} as Record<string, { attendance: AttendanceRecord[], withdrawals: WithdrawalRecord[] }>);

  // Add withdrawals to grouped data
  withdrawalRecords.forEach(withdrawal => {
    const date = withdrawal.withdrawal_date;
    if (!groupedData[date]) {
      groupedData[date] = {
        attendance: [],
        withdrawals: []
      };
    }
    groupedData[date].withdrawals.push(withdrawal);
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            فلترة السجلات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">من تاريخ</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">الموظف</label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الموظفين</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={fetchRecords} disabled={loading} className="flex-1 sm:flex-none">
              <FileText className="w-4 h-4 ml-2" />
              {loading ? "جاري التحميل..." : "عرض السجلات"}
            </Button>
            {attendanceRecords.length > 0 && (
              <Button onClick={generatePDF} variant="outline" className="flex-1 sm:flex-none">
                <Download className="w-4 h-4 ml-2" />
                طباعة PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {attendanceRecords.length > 0 && (
        <div id="attendance-report">
          {Object.entries(groupedData)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .map(([date, data]) => (
            <Card key={date} className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex gap-2 text-sm">
                    {data.attendance.length > 0 && (
                      <Badge variant="default">
                        {data.attendance.length} حضور
                      </Badge>
                    )}
                    {data.withdrawals.length > 0 && (
                      <Badge variant="secondary">
                        {data.withdrawals.reduce((sum, w) => sum + w.amount, 0).toFixed(2)} د.ل مسحوبات
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Attendance Records */}
                {data.attendance.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h4 className="font-medium text-primary flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      سجلات الحضور
                    </h4>
                    {data.attendance.map((record) => {
                      const netEarnings = (record.daily_wage_earned || 0) + (record.bonus_amount || 0) - (record.deduction_amount || 0);
                      return (
                        <div key={record.id} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{record.employees.name}</span>
                            </div>
                            <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                              {record.status === 'present' ? 'حاضر' : 'غائب'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">وقت الدخول:</span>
                              <div className="font-medium">
                                {record.check_in ? new Date(record.check_in).toLocaleTimeString('ar-LY', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                }) : '-'}
                              </div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">ساعات العمل:</span>
                              <div className="font-medium">{calculateWorkingHours(record.check_in, record.check_out)} ساعة</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">اليومية:</span>
                              <div className="font-medium text-green-600">{(record.daily_wage_earned || 0).toFixed(2)} د.ل</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">صافي الكسب:</span>
                              <div className="font-medium text-primary">{netEarnings.toFixed(2)} د.ل</div>
                            </div>
                          </div>
                          
                          {((record.bonus_amount || 0) > 0 || (record.deduction_amount || 0) > 0) && (
                            <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                              {(record.bonus_amount || 0) > 0 && (
                                <div>
                                  <span className="text-muted-foreground">مكافأة:</span>
                                  <div className="font-medium text-green-600">+{record.bonus_amount} د.ل</div>
                                </div>
                              )}
                              {(record.deduction_amount || 0) > 0 && (
                                <div>
                                  <span className="text-muted-foreground">خصم:</span>
                                  <div className="font-medium text-red-600">-{record.deduction_amount} د.ل</div>
                                  {record.deduction_reason && (
                                    <div className="text-xs text-muted-foreground mt-1">{record.deduction_reason}</div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Withdrawal Records */}
                {data.withdrawals.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-orange-600 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      المسحوبات
                    </h4>
                    {data.withdrawals.map((withdrawal) => {
                      const employee = employees.find(e => e.id === withdrawal.employee_id);
                      return (
                        <div key={withdrawal.id} className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{employee?.name || 'موظف محذوف'}</span>
                            </div>
                            <div className="text-orange-600 font-bold">-{withdrawal.amount.toFixed(2)} د.ل</div>
                          </div>
                          {withdrawal.notes && (
                            <div className="text-sm text-muted-foreground mt-2">{withdrawal.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && attendanceRecords.length === 0 && startDate && endDate && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">لا توجد سجلات</h3>
            <p className="text-muted-foreground">
              لم يتم العثور على سجلات حضور في الفترة المحددة
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceHistory;
