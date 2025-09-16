import { useState, useEffect } from "react";
import {
  User,
  Plus,
  Search,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  Calculator,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAutoRedirect } from "@/hooks/useAutoRedirect";
import { useNavigate } from "react-router-dom";
import { EmployeeCard } from "@/components/EmployeeCard";

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

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Auto redirect after 30 minutes of inactivity
  useAutoRedirect({ timeoutMinutes: 30, redirectTo: "/", enabled: true });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    salary: "",
    status: "active",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .order("name");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error("خطأ في جلب بيانات الموظفين:", error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الموظفين",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.position.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء إدخال الاسم والمنصب على الأقل",
        variant: "destructive",
      });
      return;
    }

    try {
      const employeeData = {
        name: formData.name,
        position: formData.position,
        email: formData.email || null,
        phone: formData.phone || null,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        status: formData.status,
      };

      if (editingEmployee) {
        // Update existing employee
        const { error } = await supabase
          .from("employees")
          .update(employeeData)
          .eq("id", editingEmployee.id);

        if (error) throw error;

        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات الموظف بنجاح",
        });
      } else {
        // Add new employee
        const { error } = await supabase
          .from("employees")
          .insert([employeeData]);

        if (error) throw error;

        toast({
          title: "تم الإضافة",
          description: "تم إضافة الموظف الجديد بنجاح",
        });
      }

      closeDialog();
      fetchEmployees();
    } catch (error) {
      console.error("خطأ في حفظ بيانات الموظف:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات الموظف",
        variant: "destructive",
      });
    }
  };

  const openAddDialog = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      position: "",
      email: "",
      phone: "",
      salary: "",
      status: "active",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      email: employee.email || "",
      phone: employee.phone || "",
      salary: employee.salary ? employee.salary.toString() : "",
      status: employee.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الموظف؟")) return;

    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "تم الحذف",
        description: "تم حذف الموظف بنجاح",
      });

      fetchEmployees();
    } catch (error) {
      console.error("خطأ في حذف الموظف:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الموظف",
        variant: "destructive",
      });
    }
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
    setFormData({
      name: "",
      position: "",
      email: "",
      phone: "",
      salary: "",
      status: "active",
    });
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // حساب الإحصائيات
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(
    (emp) => emp.status === "active"
  ).length;
  const inactiveEmployees = employees.filter(
    (emp) => emp.status === "inactive"
  ).length;
  const averageSalary =
    employees.length > 0
      ? employees.reduce((sum, emp) => sum + (emp.salary || 0), 0) /
        employees.length
      : 0;

  // إحصائيات إضافية
  const totalSalaryBudget = employees.reduce(
    (sum, emp) => sum + (emp.salary || 0),
    0
  );
  const employeesWithSalary = employees.filter(
    (emp) => emp.salary && emp.salary > 0
  ).length;

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <User className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              إدارة الموظفين
            </h1>
            <p className="text-muted-foreground mt-2 text-sm sm:text-base">
              إدارة بيانات الموظفين ومتابعة أدائهم المالي
            </p>
          </div>

          <Button
            onClick={openAddDialog}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة موظف جديد
          </Button>
        </div>

        {/* Stats Cards - Mobile Friendly */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    إجمالي الموظفين
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-blue-800">
                    {totalEmployees}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-200 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-green-600 font-medium">
                    الموظفون النشطون
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-800">
                    {activeEmployees}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-orange-600 font-medium">
                    غير النشطين
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-orange-800">
                    {inactiveEmployees}
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-200 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-purple-600 font-medium">
                    متوسط الراتب
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-purple-800">
                    {averageSalary.toFixed(0)} د.ل
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-200 rounded-full flex items-center justify-center">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-indigo-600 font-medium">
                    إجمالي ميزانية الرواتب
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-indigo-800">
                    {totalSalaryBudget.toFixed(0)} د.ل
                  </p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-200 rounded-full flex items-center justify-center">
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="البحث عن موظف بالاسم أو المنصب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Employees List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              قائمة الموظفين
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12 px-4">
                <User className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  جاري تحميل البيانات...
                </p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12 px-4">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {searchTerm ? "لا توجد نتائج للبحث" : "لا يوجد موظفون"}
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  {searchTerm
                    ? "جرب البحث بكلمات مختلفة"
                    : "ابدأ بإضافة أول موظف في النظام"}
                </p>
                {!searchTerm && (
                  <Button onClick={openAddDialog} variant="outline">
                    <Plus className="w-4 h-4 ml-2" />
                    إضافة موظف جديد
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {filteredEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={closeDialog}>
        <DialogContent
          className="max-w-sm mx-2 max-h-[90vh] overflow-y-auto"
          dir="rtl"
        >
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingEmployee
                ? "قم بتحديث بيانات الموظف أدناه"
                : "أدخل بيانات الموظف الجديد أدناه"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm">
                الاسم الكامل *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="أدخل اسم الموظف"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position" className="text-sm">
                المنصب *
              </Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) =>
                  setFormData({ ...formData, position: e.target.value })
                }
                placeholder="أدخل منصب الموظف"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="أدخل البريد الإلكتروني"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm">
                رقم الهاتف
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="أدخل رقم الهاتف"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="salary" className="text-sm">
                الراتب (دينار ليبي)
              </Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) =>
                  setFormData({ ...formData, salary: e.target.value })
                }
                placeholder="1234"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-sm">
                الحالة
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} className="flex-1 text-sm">
                {editingEmployee ? "حفظ التعديلات" : "إضافة الموظف"}
              </Button>
              <Button
                variant="outline"
                onClick={closeDialog}
                className="flex-1 text-sm"
              >
                إلغاء
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
