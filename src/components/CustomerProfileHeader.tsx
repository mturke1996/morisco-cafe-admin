
import { ArrowLeft, User, Phone, Mail, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomerProfileHeaderProps {
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  onBack: () => void;
  onCreateInvoice: () => void;
  onSendReminder: () => void;
}

const CustomerProfileHeader = ({ 
  customer, 
  onBack, 
  onCreateInvoice, 
  onSendReminder 
}: CustomerProfileHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Navigation and Title */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" onClick={onBack} size="sm" className="p-2">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3 truncate">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
            <span className="truncate">{customer.name}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            ملف العميل التفصيلي
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
        <Button 
          onClick={onCreateInvoice} 
          className="btn-gradient flex-1 sm:flex-none"
          size="sm"
        >
          <span className="text-sm">إنشاء فاتورة</span>
        </Button>
        <Button 
          onClick={onSendReminder} 
          variant="outline" 
          className="flex-1 sm:flex-none"
          size="sm"
        >
          <span className="text-sm">إرسال تذكير</span>
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card className="bg-white/90 backdrop-blur-sm border-blue-200/50">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">الاسم</span>
              </div>
              <p className="font-semibold text-sm sm:text-base truncate">{customer.name}</p>
            </div>
            
            {customer.phone && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">الهاتف</span>
                </div>
                <p className="font-semibold text-sm sm:text-base truncate">{customer.phone}</p>
              </div>
            )}
            
            {customer.email && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">البريد الإلكتروني</span>
                </div>
                <p className="font-semibold text-sm sm:text-base truncate">{customer.email}</p>
              </div>
            )}
            
            {customer.address && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">العنوان</span>
                </div>
                <p className="font-semibold text-sm sm:text-base truncate">{customer.address}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfileHeader;
