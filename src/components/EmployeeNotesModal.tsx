import { useState, useEffect } from "react";
import { X, Plus, Edit, Trash2, AlertCircle, Star, Award, AlertTriangle, Info, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Employee {
  id: string;
  name: string;
  position: string;
}

interface EmployeeNote {
  id: string;
  employee_id: string;
  note_type: 'general' | 'performance' | 'warning' | 'praise' | 'incident';
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  created_by?: string;
}

interface EmployeeNotesModalProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

const noteTypeConfig = {
  general: { icon: Info, color: "bg-blue-100 text-blue-800 border-blue-200", label: "عامة" },
  performance: { icon: Star, color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "أداء" },
  warning: { icon: AlertTriangle, color: "bg-orange-100 text-orange-800 border-orange-200", label: "تحذير" },
  praise: { icon: Award, color: "bg-green-100 text-green-800 border-green-200", label: "مدح" },
  incident: { icon: AlertCircle, color: "bg-red-100 text-red-800 border-red-200", label: "حادث" }
};

const priorityConfig = {
  low: { color: "bg-gray-100 text-gray-800", label: "منخفض" },
  normal: { color: "bg-blue-100 text-blue-800", label: "عادي" },
  high: { color: "bg-orange-100 text-orange-800", label: "عالي" },
  urgent: { color: "bg-red-100 text-red-800", label: "عاجل" }
};

export const EmployeeNotesModal = ({ employee, isOpen, onClose }: EmployeeNotesModalProps) => {
  const [notes, setNotes] = useState<EmployeeNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<EmployeeNote | null>(null);
  const [formData, setFormData] = useState({
    note_type: 'general' as const,
    title: '',
    content: '',
    priority: 'normal' as const
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchNotes();
    }
  }, [isOpen, employee.id]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('employee_notes')
        .select('*')
        .eq('employee_id', employee.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الملاحظات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingNote) {
        // تحديث الملاحظة
        const { error } = await supabase
          .from('employee_notes')
          .update({
            note_type: formData.note_type,
            title: formData.title,
            content: formData.content,
            priority: formData.priority
          })
          .eq('id', editingNote.id);

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم تحديث الملاحظة بنجاح"
        });
      } else {
        // إضافة ملاحظة جديدة
        const { error } = await supabase
          .from('employee_notes')
          .insert({
            employee_id: employee.id,
            note_type: formData.note_type,
            title: formData.title,
            content: formData.content,
            priority: formData.priority
          });

        if (error) throw error;

        toast({
          title: "تم بنجاح",
          description: "تم إضافة الملاحظة بنجاح"
        });
      }

      resetForm();
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الملاحظة",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;

    try {
      const { error } = await supabase
        .from('employee_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast({
        title: "تم بنجاح",
        description: "تم حذف الملاحظة بنجاح"
      });

      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الملاحظة",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      note_type: 'general',
      title: '',
      content: '',
      priority: 'normal'
    });
    setEditingNote(null);
    setShowAddNote(false);
  };

  const handleEdit = (note: EmployeeNote) => {
    setEditingNote(note);
    setFormData({
      note_type: note.note_type,
      title: note.title,
      content: note.content,
      priority: note.priority
    });
    setShowAddNote(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {employee.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div>ملاحظات الموظف</div>
              <div className="text-sm font-normal text-muted-foreground">
                {employee.name} - {employee.position}
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(noteTypeConfig).map(([type, config]) => {
              const count = notes.filter(note => note.note_type === type).length;
              const Icon = config.icon;
              return (
                <Card key={type} className="text-center">
                  <CardContent className="p-4">
                    <Icon className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground">{config.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* زر إضافة ملاحظة */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">الملاحظات</h3>
            <Button
              onClick={() => setShowAddNote(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة ملاحظة
            </Button>
          </div>

          {/* نموذج إضافة/تعديل ملاحظة */}
          {showAddNote && (
            <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingNote ? 'تعديل الملاحظة' : 'إضافة ملاحظة جديدة'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="note_type">نوع الملاحظة</Label>
                      <Select
                        value={formData.note_type}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, note_type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(noteTypeConfig).map(([type, config]) => (
                            <SelectItem key={type} value={type}>
                              <div className="flex items-center gap-2">
                                <config.icon className="w-4 h-4" />
                                {config.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">الأولوية</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(priorityConfig).map(([priority, config]) => (
                            <SelectItem key={priority} value={priority}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">عنوان الملاحظة</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="أدخل عنوان الملاحظة"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="content">محتوى الملاحظة</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="أدخل تفاصيل الملاحظة"
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingNote ? 'تحديث' : 'إضافة'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* قائمة الملاحظات */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : notes.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">لا توجد ملاحظات</h3>
                <p className="text-muted-foreground mb-4">
                  لم يتم إضافة أي ملاحظات لهذا الموظف بعد
                </p>
                <Button onClick={() => setShowAddNote(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة أول ملاحظة
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => {
                const typeConfig = noteTypeConfig[note.note_type];
                const priorityConfig = priorityConfig[note.priority];
                const Icon = typeConfig.icon;
                
                return (
                  <Card key={note.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{note.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={typeConfig.color}>
                                {typeConfig.label}
                              </Badge>
                              <Badge className={priorityConfig.color}>
                                {priorityConfig.label}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(note)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(note.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {formatDate(note.created_at)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
