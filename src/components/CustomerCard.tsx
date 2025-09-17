import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type CustomerDebt = {
  id: string;
  amount: number;
  paid_amount?: number;
  status: string;
};

type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  total_debt: number;
  remaining_debt: number;
  total_paid: number;
  debts?: CustomerDebt[];
};
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  CreditCard,
  Eye,
  Trash2,
  FileText,
} from "lucide-react";

interface CustomerCardProps {
  customer: Customer;
  onViewProfile: (customerId: string) => void;
  onAddDebt: (customer: Customer) => void;
  onPayDebt: (debt: CustomerDebt) => void;
  onDeleteCustomer?: (customer: Customer) => void;
  onCreateInvoice?: (customer: Customer) => void;
}

const CustomerCard = ({
  customer,
  onViewProfile,
  onAddDebt,
  onPayDebt,
  onDeleteCustomer,
  onCreateInvoice,
}: CustomerCardProps) => {
  const hasUnpaidDebts = customer.remaining_debt > 0;
  const unpaidDebts =
    customer.debts?.filter(
      (debt) =>
        debt.status !== "paid" && debt.amount - (debt.paid_amount || 0) > 0
    ) || [];

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} د.ل`;
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div className="text-right flex-1 min-w-0">
              <h3
                className="font-semibold text-base sm:text-lg text-foreground truncate"
                dir="rtl"
              >
                {customer.name}
              </h3>
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-1">
                <Badge
                  variant={hasUnpaidDebts ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {hasUnpaidDebts
                    ? `ديون: ${formatCurrency(customer.remaining_debt)}`
                    : "لا توجد ديون"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-1 text-xs sm:text-sm">
            {customer.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">{customer.address}</span>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50/80 rounded-lg">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">
                إجمالي الديون
              </p>
              <p className="font-semibold text-red-600 text-xs sm:text-sm">
                {formatCurrency(customer.total_debt)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">المدفوع</p>
              <p className="font-semibold text-green-600 text-xs sm:text-sm">
                {formatCurrency(customer.total_paid)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">المتبقي</p>
              <p className="font-semibold text-orange-600 text-xs sm:text-sm">
                {formatCurrency(customer.remaining_debt)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(customer.id)}
              className="text-xs h-8"
            >
              <Eye className="w-3 h-3 ml-1" />
              عرض التفاصيل
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddDebt(customer)}
              className="text-xs h-8"
            >
              <Plus className="w-3 h-3 ml-1" />
              إضافة دين
            </Button>

            {hasUnpaidDebts && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPayDebt(unpaidDebts[0])}
                className="text-xs h-8 text-green-600 border-green-200 hover:bg-green-50"
              >
                <CreditCard className="w-3 h-3 ml-1" />
                دفع دين
              </Button>
            )}

            {onCreateInvoice && hasUnpaidDebts && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateInvoice(customer)}
                className="text-xs h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <FileText className="w-3 h-3 ml-1" />
                إنشاء فاتورة
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDeleteCustomer?.(customer)}
              className="text-xs h-8 text-red-600 border-red-200 hover:bg-red-50 col-span-2 sm:col-span-1"
            >
              <Trash2 className="w-3 h-3 ml-1" />
              حذف العميل
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;
