
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { useDeleteCustomer } from "@/hooks/useCustomers";

interface DeleteCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: {
    id: string;
    name: string;
    total_debt?: number;
    remaining_debt?: number;
  } | null;
}

const DeleteCustomerModal = ({ open, onOpenChange, customer }: DeleteCustomerModalProps) => {
  const deleteCustomer = useDeleteCustomer();

  const handleDelete = () => {
    if (!customer) return;

    deleteCustomer.mutate(customer.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (!customer) return null;

  const hasRemainingDebt = (customer.remaining_debt || 0) > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            حذف العميل
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">تحذير مهم!</h3>
            <p className="text-red-700 text-sm mb-3">
              أنت على وشك حذف العميل: <strong>{customer.name}</strong>
            </p>
            
            {hasRemainingDebt && (
              <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
                <p className="text-red-800 text-sm font-medium">
                  تنبيه: هذا العميل لديه ديون متبقية بقيمة {(customer.remaining_debt || 0).toFixed(2)} د.ل
                </p>
              </div>
            )}
            
            <p className="text-red-600 text-sm">
              سيتم الاحتفاظ بجميع سجلات الديون والدفعات في قاعدة البيانات لأغراض المحاسبة والتقارير، 
              ولكن العميل لن يظهر في القائمة الرئيسية.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">ما سيحدث عند الحذف:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 pr-4">
              <li>• إخفاء العميل من قائمة العملاء</li>
              <li>• الاحتفاظ بجميع سجلات الديون والدفعات</li>
              <li>• إمكانية العثور على البيانات في التقارير</li>
              <li>• لا يمكن التراجع عن هذا الإجراء</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            إلغاء
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCustomer.isPending}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 ml-2" />
            {deleteCustomer.isPending ? "جاري الحذف..." : "تأكيد الحذف"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCustomerModal;
