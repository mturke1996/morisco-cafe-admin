import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Sun, 
  Moon, 
  ChevronDown,
  CheckCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AttendanceButtonProps {
  employeeId: string;
  employeeName: string;
  onAttendanceRecorded?: () => void;
  currentRecord?: {
    check_in: string | null;
    check_out: string | null;
  } | null;
}

export const AttendanceButton = ({ 
  employeeId, 
  employeeName, 
  onAttendanceRecorded,
  currentRecord 
}: AttendanceButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const recordAttendance = async (shiftType: 'morning' | 'evening') => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // التحقق من وجود سجل موجود
      const { data: existingRecord } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .single();

      if (existingRecord) {
        // تحديث السجل الموجود
        const updateData: any = {
          updated_at: new Date().toISOString(),
          status: 'present'
        };

        if (shiftType === 'morning') {
          if (existingRecord.check_in) {
            toast({
              title: "تنبيه",
              description: "تم تسجيل الحضور للوردية الصباحية من قبل",
              variant: "destructive",
            });
            return;
          }
          updateData.check_in = new Date().toISOString();
        } else {
          if (existingRecord.check_out) {
            toast({
              title: "تنبيه", 
              description: "تم تسجيل الحضور للوردية المسائية من قبل",
              variant: "destructive",
            });
            return;
          }
          updateData.check_out = new Date().toISOString();
        }

        const { error: updateError } = await supabase
          .from('attendance')
          .update(updateData)
          .eq('id', existingRecord.id);

        if (updateError) throw updateError;

      } else {
        // إنشاء سجل جديد
        const insertData: any = {
          employee_id: employeeId,
          date: today,
          status: 'present',
          created_at: new Date().toISOString()
        };

        if (shiftType === 'morning') {
          insertData.check_in = new Date().toISOString();
        } else {
          insertData.check_out = new Date().toISOString();
        }

        const { error: insertError } = await supabase
          .from('attendance')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      toast({
        title: "تم التسجيل بنجاح",
        description: `تم تسجيل حضور ${employeeName} للوردية ${shiftType === 'morning' ? 'الصباحية' : 'المسائية'}`,
      });

      if (onAttendanceRecorded) {
        onAttendanceRecorded();
      }

    } catch (error) {
      console.error('Error recording attendance:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تسجيل الحضور",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const hasAttendanceToday = currentRecord && (currentRecord.check_in || currentRecord.check_out);
  const hasMorningShift = currentRecord?.check_in;
  const hasEveningShift = currentRecord?.check_out;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={hasAttendanceToday ? "default" : "outline"}
          size="sm"
          disabled={loading}
          className={hasAttendanceToday ? "bg-green-600 hover:bg-green-700" : ""}
        >
          <Clock className="w-4 h-4 ml-2" />
          {hasAttendanceToday ? "حاضر" : "حضور"}
          <ChevronDown className="w-3 h-3 mr-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-center">
          تسجيل الحضور - {employeeName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => recordAttendance('morning')}
          disabled={loading || !!hasMorningShift}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-orange-500" />
            <span>الوردية الصباحية</span>
          </div>
          {hasMorningShift && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => recordAttendance('evening')}
          disabled={loading || !!hasEveningShift}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>الوردية المسائية</span>
          </div>
          {hasEveningShift && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        {hasAttendanceToday && (
          <div className="px-2 py-1 text-xs text-slate-600">
            <div className="space-y-1">
              {hasMorningShift && (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                    صباحية ✓
                  </Badge>
                  <span className="text-xs">
                    {new Date(currentRecord!.check_in!).toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}
              {hasEveningShift && (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
                    مسائية ✓
                  </Badge>
                  <span className="text-xs">
                    {new Date(currentRecord!.check_out!).toLocaleTimeString('ar-SA', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AttendanceButton;
