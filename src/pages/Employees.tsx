
import { useState, useEffect } from "react";
import { User, Plus, Search } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
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
    status: "active"
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.position.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "الرجاء إدخال الاسم والمنصب على الأقل",
        variant: "destructive"
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
        status: formData.status
      };

      if (editingEmployee) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployee.id);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم تحديث بيانات الموظف بنجاح",
        });
      } else {
        const { error } = await supabase
          .from('employees')
          .insert(employeeData);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم إضافة الموظف بنجاح",
        });
      }

      setFormData({ name: "", position: "", email: "", phone: "", salary: "", status: "active" });
      setEditingEmployee(null);
      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error) {
      console.error('خطأ في حفظ بيانات الموظف:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ بيانات الموظف",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: "", position: "", email: "", phone: "", salary: "", status: "active" });
    setEditingEmployee(null);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      email: employee.email || "",
      phone: employee.phone || "",
      salary: employee.salary?.toString() || "",
      status: employee.status
    });
    setIsDialogOpen(true);
  };

  const handleViewProfile = (employeeId: string) => {
    navigate(`/employee-profile/${employeeId}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الموظف بنجاح",
      });

      fetchEmployees();
    } catch (error) {
      console.error('خطأ في حذف الموظف:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الموظف",
        variant: "destructive"
      });
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-3" dir="rtl">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <div className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              إدارة الموظفين
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              إدارة بيانات الموظفين ومتابعة أدائهم
            </p>
          </div>
          
          <Button onClick={openAddDialog} className="w-full bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" />
            إضافة موظف جديد
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">إجمالي الموظفين</p>
                  <p className="text-xl font-bold">{employees.length}</p>
                </div>
                <User className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">الموظفون النشطون</p>
                  <p className="text-xl font-bold text-green-600">
                    {employees.filter(emp => emp.status === 'active').length}
                  </p>
                </div>
                <User className="w-5 h-5 text-green-600" />
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
                placeholder="البحث عن موظف..."
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
            <CardTitle className="text-lg">قائمة الموظفين</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-8 px-4">
                <User className="w-8 h-8 animate-spin text-muted-foreground mx-auto mb-2" />
                <p className="text-sm">جاري تحميل البيانات...</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-8 px-4">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">لا يوجد موظفون</h3>
                <p className="text-muted-foreground text-sm mb-6">
                  ابدأ بإضافة أول موظف في النظام
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {filteredEmployees.map((employee) => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onView={handleViewProfile}
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
        <DialogContent className="max-w-sm mx-2 max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {editingEmployee ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
            </DialogTitle>
            <DialogDescription className="text-sm">
              {editingEmployee 
                ? 'قم بتحديث بيانات الموظف أدناه' 
                : 'أدخل بيانات الموظف الجديد أدناه'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm">الاسم الكامل *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="أدخل اسم الموظف"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="position" className="text-sm">المنصب *</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({...formData, position: e.target.value})}
                placeholder="أدخل منصب الموظف"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="أدخل البريد الإلكتروني"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm">رقم الهاتف</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="أدخل رقم الهاتف"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="salary" className="text-sm">الراتب (دينار ليبي)</Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({...formData, salary: e.target.value})}
                placeholder="1234"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-sm">الحالة</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
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
                {editingEmployee ? 'حفظ التعديلات' : 'إضافة الموظف'}
              </Button>
              <Button variant="outline" onClick={closeDialog} className="flex-1 text-sm">
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
