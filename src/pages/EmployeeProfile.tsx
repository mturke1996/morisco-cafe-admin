import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, DollarSign, Calendar, Clock, TrendingUp, FileText, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalaryPaymentModal } from "@/components/SalaryPaymentModal";
import { SalaryPaymentHistory } from "@/components/SalaryPaymentHistory";

interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
  salary: number;
  hire_date: string;
  status: string;
}

interface EmployeeProfile {
  daily_wage: number;
  monthly_withdrawals: number;
  total_work_hours: number;
  last_withdrawal_date: string | null;
  notes: string | null;
}

interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  total_earnings: number;
  total_deductions: number;
  total_bonuses: number;
}

const EmployeeProfile = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    total_days: 0,
    present_days: 0,
    absent_days: 0,
    total_earnings: 0,
    total_deductions: 0,
    total_bonuses: 0
  });
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    if (!employeeId) return;
    
    setLoading(true);
    try {
      // Fetch employee basic info
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (employeeError) throw employeeError;
      setEmployee(employeeData);

      // Fetch employee profile
      const { data: profileData, error: profileError } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('employee_id', employeeId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
      } else if (profileData) {
        setProfile(profileData);
      }

      // Fetch attendance statistics for current month - FIX THE DATE RANGE
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth(); // 0-based month
      
      // Get first day of current month
      const firstDay = new Date(currentYear, currentMonth, 1);
      const firstDayStr = firstDay.toISOString().split('T')[0];
      
      // Get first day of next month (this will be the exclusive end date)
      const nextMonth = new Date(currentYear, currentMonth + 1, 1);
      const nextMonthStr = nextMonth.toISOString().split('T')[0];
      
      console.log('Fetching attendance from:', firstDayStr, 'to:', nextMonthStr);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .gte('date', firstDayStr)
        .lt('date', nextMonthStr);

      if (attendanceError) {
        console.error('Attendance fetch error:', attendanceError);
      } else if (attendanceData) {
        console.log('Attendance data:', attendanceData);
        const stats = attendanceData.reduce((acc, record) => {
          acc.total_days++;
          if (record.status === 'present') {
            acc.present_days++;
            // استخدام اليومية المسجلة في الحضور أو اليومية الافتراضية
            acc.total_earnings += record.daily_wage_earned || 0;
            acc.total_deductions += record.deduction_amount || 0;
            acc.total_bonuses += record.bonus_amount || 0;
          } else {
            acc.absent_days++;
          }
          return acc;
        }, {
          total_days: 0,
          present_days: 0,
          absent_days: 0,
          total_earnings: 0,
          total_deductions: 0,
          total_bonuses: 0
        } as AttendanceStats);

        console.log('Calculated stats:', stats);
        setAttendanceStats(stats);
      }

    } catch (error) {
      console.error('خطأ في جلب بيانات الموظف:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الموظف",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-3 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <User className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-background p-3 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">لم يتم العثور على الموظف</h3>
          <Button onClick={() => navigate('/employees')} variant="outline">
            <ArrowLeft className="w-4 h-4 ml-2" />
            العودة للموظفين
          </Button>
        </div>
      </div>
    );
  }

  const attendanceRate = attendanceStats.total_days > 0 
    ? Math.round((attendanceStats.present_days / attendanceStats.total_days) * 100) 
    : 0;

  // حساب صحيح للمرتب - ضرب عدد الأيام في اليومية
  const dailyWage = profile?.daily_wage || (employee.salary ? employee.salary / 30 : 0);
  const calculatedEarnings = attendanceStats.present_days * dailyWage;
  const netEarnings = calculatedEarnings + attendanceStats.total_bonuses - attendanceStats.total_deductions;

  console.log('Profile calculation:', {
    present_days: attendanceStats.present_days,
    dailyWage: dailyWage,
    calculatedEarnings: calculatedEarnings,
    netEarnings: netEarnings
  });

  return (
    <div className="min-h-screen bg-background p-3" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Button 
            onClick={() => navigate('/employees')} 
            variant="outline" 
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">ملف الموظف</h1>
            <p className="text-sm text-muted-foreground">معلومات وإحصائيات الموظف</p>
          </div>
        </div>

        {/* Employee Basic Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{employee.name}</h2>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
              </div>
              <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                {employee.status === 'active' ? 'نشط' : 'غير نشط'}
              </Badge>
            </div>

            <div className="space-y-3">
              {employee.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{employee.email}</span>
                </div>
              )}
              
              {employee.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{employee.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span>{employee.salary ? `${employee.salary} د.ل` : 'غير محدد'}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>تاريخ التوظيف: {new Date(employee.hire_date).toLocaleDateString('ar-LY')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">أيام الحضور</p>
                  <p className="text-lg font-bold text-green-600">{attendanceStats.present_days}</p>
                </div>
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">معدل الحضور</p>
                  <p className="text-lg font-bold text-primary">{attendanceRate}%</p>
                </div>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي الكسب</p>
                  <p className="text-lg font-bold text-blue-600">{calculatedEarnings.toFixed(2)} د.ل</p>
                </div>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">صافي الكسب</p>
                  <p className="text-lg font-bold text-green-600">{netEarnings.toFixed(2)} د.ل</p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Payment Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              حساب المرتب الشهري
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">أيام العمل هذا الشهر</p>
                <p className="text-2xl font-bold text-primary">{attendanceStats.present_days}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">اليومية المحددة</p>
                <p className="text-2xl font-bold text-green-600">{dailyWage.toFixed(2)} د.ل</p>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">إجمالي المستحق</span>
                <span className="font-semibold text-lg text-primary">{netEarnings.toFixed(2)} د.ل</span>
              </div>
              <p className="text-xs text-muted-foreground">
                محسوب على أساس {attendanceStats.present_days} يوم × {dailyWage.toFixed(2)} د.ل = {calculatedEarnings.toFixed(2)} د.ل
                {attendanceStats.total_bonuses > 0 && ` + ${attendanceStats.total_bonuses.toFixed(2)} د.ل مكافآت`}
                {attendanceStats.total_deductions > 0 && ` - ${attendanceStats.total_deductions.toFixed(2)} د.ل خصومات`}
              </p>
            </div>
            
            <Button 
              onClick={() => setShowPaymentModal(true)}
              className="w-full"
              disabled={attendanceStats.present_days === 0}
            >
              <DollarSign className="w-4 h-4 ml-2" />
              دفع المرتب
            </Button>
          </CardContent>
        </Card>

        {/* Earnings Breakdown */}
        {(attendanceStats.total_deductions > 0 || attendanceStats.total_bonuses > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">تفصيل الأرباح والخصومات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">إجمالي اليوميات ({attendanceStats.present_days} × {dailyWage.toFixed(2)})</span>
                <span className="font-medium text-green-600">+{calculatedEarnings.toFixed(2)} د.ل</span>
              </div>
              
              {attendanceStats.total_bonuses > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">المكافآت</span>
                  <span className="font-medium text-green-600">+{attendanceStats.total_bonuses.toFixed(2)} د.ل</span>
                </div>
              )}
              
              {attendanceStats.total_deductions > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">الخصومات</span>
                  <span className="font-medium text-red-600">-{attendanceStats.total_deductions.toFixed(2)} د.ل</span>
                </div>
              )}
              
              <hr className="my-2" />
              <div className="flex justify-between items-center font-semibold">
                <span>صافي الكسب</span>
                <span className="text-primary">{netEarnings.toFixed(2)} د.ل</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Info */}
        {profile && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                معلومات إضافية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">اليومية المحددة</span>
                <span className="font-medium">{profile.daily_wage.toFixed(2)} د.ل</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">إجمالي ساعات العمل</span>
                <span className="font-medium">{profile.total_work_hours.toFixed(1)} ساعة</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">المسحوبات الشهرية</span>
                <span className="font-medium">{profile.monthly_withdrawals.toFixed(2)} د.ل</span>
              </div>
              
              {profile.last_withdrawal_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm">آخر سحب</span>
                  <span className="font-medium">{new Date(profile.last_withdrawal_date).toLocaleDateString('ar-LY')}</span>
                </div>
              )}
              
              {profile.notes && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">ملاحظات:</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{profile.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Salary Payment History */}
        <SalaryPaymentHistory employeeId={employeeId!} employee={employee} />

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate(`/employees`)} 
            variant="outline" 
            className="flex-1"
          >
            <Edit className="w-4 h-4 ml-2" />
            تعديل البيانات
          </Button>
          <Button 
            onClick={() => navigate('/attendance')} 
            className="flex-1"
          >
            <Clock className="w-4 h-4 ml-2" />
            سجل الحضور
          </Button>
        </div>
      </div>

      {/* Salary Payment Modal */}
      {employee && (
        <SalaryPaymentModal
          employee={employee}
          attendanceStats={attendanceStats}
          dailyWage={dailyWage}
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentComplete={() => {
            fetchEmployeeData();
            toast({
              title: "تم الدفع بنجاح",
              description: "تم تسجيل دفع المرتب بنجاح",
            });
          }}
        />
      )}
    </div>
  );
};

export default EmployeeProfile;
