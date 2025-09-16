import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  Minus,
  Clock,
  Calculator,
  Edit,
  Trash2,
  Eye,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmployeeBalance } from "@/hooks/useEmployeeFinancials";
import EmployeeWithdrawalModal from "./EmployeeWithdrawalModal";
import EmployeeSalaryPaymentModal from "./EmployeeSalaryPaymentModal";

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  salary: number;
  hire_date: string;
  status: string;
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit?: (employee: Employee) => void;
  onDelete?: (employeeId: string) => void;
}

export const EmployeeCard = ({
  employee,
  onEdit,
  onDelete,
}: EmployeeCardProps) => {
  const navigate = useNavigate();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
  const [isSalaryPaymentModalOpen, setIsSalaryPaymentModalOpen] =
    useState(false);

  const { data: balanceData, isLoading } = useEmployeeBalance(employee.id);

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "نشط";
      case "inactive":
        return "غير نشط";
      default:
        return "غير محدد";
    }
  };

  const handleViewProfile = () => {
    navigate(`/employees/${employee.id}`);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(employee);
    }
  };

  const handleDelete = () => {
    if (onDelete && confirm("هل أنت متأكد من حذف هذا الموظف؟")) {
      onDelete(employee.id);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-64">
        <CardContent className="p-4 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">جاري التحميل...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentBalance = balanceData?.currentBalance || 0;
  const totalEarnings = balanceData?.totalEarnings || 0;
  const totalWithdrawals = balanceData?.totalWithdrawals || 0;
  const totalPaid = balanceData?.totalPaid || 0;
  const presentDays = balanceData?.presentDays || 0;

  return (
    <>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-800 text-lg font-semibold">
                  {employee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">
                  {employee.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground truncate">
                  {employee.position}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(employee.status)}>
              {getStatusLabel(employee.status)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-2">
            {employee.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{employee.email}</span>
              </div>
            )}
            {employee.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{employee.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>تاريخ التوظيف: {formatDate(employee.hire_date)}</span>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs text-green-600 mb-1">الراتب</p>
              <p className="font-semibold text-green-800">
                {formatCurrency(employee.salary)}
              </p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs text-blue-600 mb-1">الرصيد</p>
              <p
                className={`font-semibold ${
                  currentBalance >= 0 ? "text-blue-800" : "text-red-600"
                }`}
              >
                {formatCurrency(currentBalance)}
              </p>
            </div>
          </div>

          {/* Monthly Stats */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">أيام الحضور</span>
              <span className="font-medium">{presentDays} يوم</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">إجمالي الأرباح</span>
              <span className="font-medium text-green-600">
                {formatCurrency(totalEarnings)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">إجمالي السحوبات</span>
              <span className="font-medium text-red-600">
                {formatCurrency(totalWithdrawals)}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">المدفوع</span>
              <span className="font-medium text-blue-600">
                {formatCurrency(totalPaid)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewProfile}
              className="text-xs h-8"
            >
              <Eye className="w-3 h-3 ml-1" />
              عرض
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="text-xs h-8"
            >
              <Edit className="w-3 h-3 ml-1" />
              تعديل
            </Button>
          </div>

          {/* Financial Management Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="text-xs h-8 bg-orange-50 text-orange-700 hover:bg-orange-100"
            >
              <Minus className="w-3 h-3 ml-1" />
              السحوبات
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSalaryPaymentModalOpen(true)}
              className="text-xs h-8 bg-green-50 text-green-700 hover:bg-green-100"
            >
              <CreditCard className="w-3 h-3 ml-1" />
              دفع المرتب
            </Button>
          </div>

          {/* Delete Button */}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="w-full text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-3 h-3 ml-1" />
              حذف الموظف
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Management Modal */}
      <EmployeeWithdrawalModal
        open={isWithdrawalModalOpen}
        onOpenChange={setIsWithdrawalModalOpen}
        employeeId={employee.id}
        employeeName={employee.name}
        currentBalance={currentBalance}
      />

      {/* Salary Payment Modal */}
      <EmployeeSalaryPaymentModal
        open={isSalaryPaymentModalOpen}
        onOpenChange={setIsSalaryPaymentModalOpen}
        employeeId={employee.id}
        employeeName={employee.name}
        currentBalance={currentBalance}
        employeeSalary={employee.salary}
      />
    </>
  );
};
