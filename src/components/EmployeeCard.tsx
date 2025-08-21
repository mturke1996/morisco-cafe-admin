
import { Eye, Edit2, Trash2, User, Phone, Mail, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

interface EmployeeCardProps {
  employee: Employee;
  onView: (id: string) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: string) => void;
}

export const EmployeeCard = ({ employee, onView, onEdit, onDelete }: EmployeeCardProps) => {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium text-base truncate">{employee.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{employee.position}</p>
          </div>
          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'} className="text-xs">
            {employee.status === 'active' ? 'نشط' : 'غير نشط'}
          </Badge>
        </div>

        <div className="space-y-2 mb-4">
          {employee.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-3 h-3 text-muted-foreground" />
              <span className="truncate">{employee.email}</span>
            </div>
          )}
          
          {employee.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-3 h-3 text-muted-foreground" />
              <span>{employee.phone}</span>
            </div>
          )}
          
          {employee.salary && (
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="w-3 h-3 text-muted-foreground" />
              <span>{employee.salary} د.ل</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span>{new Date(employee.hire_date).toLocaleDateString('ar-LY')}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(employee.id)}
            className="flex-1 text-xs h-8"
          >
            <Eye className="w-3 h-3 ml-1" />
            عرض
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(employee)}
            className="flex-1 text-xs h-8"
          >
            <Edit2 className="w-3 h-3 ml-1" />
            تعديل
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(employee.id)}
            className="flex-1 text-xs h-8"
          >
            <Trash2 className="w-3 h-3 ml-1" />
            حذف
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
