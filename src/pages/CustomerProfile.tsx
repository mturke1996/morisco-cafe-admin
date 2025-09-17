import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, FileText, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomers, useCustomerDebts } from "@/hooks/useCustomers";
import { useInvoices, usePaymentReminders } from "@/hooks/useInvoices";
import CustomerProfileHeader from "@/components/CustomerProfileHeader";
import CustomerFinancialSummary from "@/components/CustomerFinancialSummary";
import PayDebtModal from "@/components/PayDebtModal";
import CreateInvoiceModal from "@/components/CreateInvoiceModal";
import SendReminderModal from "@/components/SendReminderModal";
import InvoicePDF from "@/components/InvoicePDF";

const CustomerProfile = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  type CustomerDebt = {
    id: string;
    amount: number;
    paid_amount?: number | null;
    status: string;
    description?: string | null;
    created_at: string;
  };
  type InvoiceItem = {
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  };
  type Invoice = {
    id: string;
    invoice_number: string;
    invoice_date: string;
    total_amount: number;
    notes?: string;
    invoice_items?: InvoiceItem[];
  };

  const [selectedDebt, setSelectedDebt] = useState<CustomerDebt | null>(null);
  const [isPayDebtModalOpen, setIsPayDebtModalOpen] = useState(false);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] =
    useState(false);
  const [isSendReminderModalOpen, setIsSendReminderModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const { data: customers = [] } = useCustomers();
  const { data: debts = [] } = useCustomerDebts(customerId);
  const { data: invoices = [] } = useInvoices(customerId);
  const { data: reminders = [] } = usePaymentReminders(customerId);

  const customer = customers.find((c) => c.id === customerId);

  if (!customer) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 p-4 flex items-center justify-center"
        dir="rtl"
      >
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">العميل غير موجود</p>
            <Button onClick={() => navigate("/customers")} className="w-full">
              العودة للعملاء
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDebt = customer.total_debt || 0;
  const totalPaid = customer.total_paid || 0;
  const remainingDebt = customer.remaining_debt || 0;

  const handlePayDebt = (debt: CustomerDebt) => {
    setSelectedDebt(debt);
    setIsPayDebtModalOpen(true);
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50 p-3 sm:p-4 lg:p-6"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <CustomerProfileHeader
          customer={customer}
          onBack={() => navigate("/customers")}
          onCreateInvoice={() => setIsCreateInvoiceModalOpen(true)}
          onSendReminder={() => setIsSendReminderModalOpen(true)}
        />

        {/* Financial Summary */}
        <CustomerFinancialSummary
          totalDebt={totalDebt}
          totalPaid={totalPaid}
          remainingDebt={remainingDebt}
        />

        {/* Tabs */}
        <Tabs defaultValue="debts" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-white/80 backdrop-blur-sm">
            <TabsTrigger
              value="debts"
              className="text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              الديون
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              الفواتير
            </TabsTrigger>
            <TabsTrigger
              value="reminders"
              className="text-sm py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              التذكيرات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="debts" className="space-y-3 mt-4">
            {debts.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    لا توجد ديون
                  </p>
                  <Button
                    onClick={() => navigate("/customers")}
                    variant="outline"
                  >
                    العودة للعملاء
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {debts.map((debt) => (
                  <Card
                    key={debt.id}
                    className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-semibold text-lg">
                              {debt.amount.toFixed(2)} د.ل
                            </span>
                            <Badge
                              variant={
                                debt.status === "paid"
                                  ? "default"
                                  : debt.status === "partial"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {debt.status === "paid"
                                ? "مدفوع"
                                : debt.status === "partial"
                                ? "مدفوع جزئياً"
                                : "معلق"}
                            </Badge>
                          </div>
                          {debt.description && (
                            <p className="text-muted-foreground mb-2 text-sm">
                              {debt.description}
                            </p>
                          )}
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <span>
                              التاريخ:{" "}
                              {new Date(debt.created_at).toLocaleDateString(
                                "en-US"
                              )}
                            </span>
                            {debt.paid_amount > 0 && (
                              <span>
                                المدفوع: {debt.paid_amount.toFixed(2)} د.ل
                              </span>
                            )}
                          </div>
                        </div>

                        {debt.amount > (debt.paid_amount || 0) && (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                            <Badge
                              variant="secondary"
                              className="text-xs text-center"
                            >
                              متبقي:{" "}
                              {(debt.amount - (debt.paid_amount || 0)).toFixed(
                                2
                              )}{" "}
                              د.ل
                            </Badge>
                            <Button
                              onClick={() => handlePayDebt(debt)}
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              دفع
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-3 mt-4">
            {invoices.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    لا توجد فواتير
                  </p>
                  <Button
                    onClick={() => setIsCreateInvoiceModalOpen(true)}
                    className="btn-gradient"
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    إنشاء فاتورة جديدة
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <Card
                    key={invoice.id}
                    className="bg-white/90 backdrop-blur-sm border-gray-200/50 hover:shadow-md transition-all duration-200"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="font-semibold">
                              #{invoice.invoice_number}
                            </span>
                            <Badge
                              variant={
                                invoice.status === "paid"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {invoice.status === "paid" ? "مدفوعة" : "معلقة"}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-blue-600 mb-2">
                            {invoice.total_amount.toFixed(2)} د.ل
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <span>
                              التاريخ:{" "}
                              {new Date(
                                invoice.invoice_date
                              ).toLocaleDateString("en-US")}
                            </span>
                            <span>
                              العناصر: {invoice.invoice_items?.length || 0}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            onClick={() => handlePrintInvoice(invoice)}
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            <FileText className="w-4 h-4 ml-2" />
                            طباعة
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="reminders" className="space-y-3 mt-4">
            {reminders.length === 0 ? (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground text-lg mb-4">
                    لا توجد تذكيرات
                  </p>
                  <Button
                    onClick={() => setIsSendReminderModalOpen(true)}
                    className="btn-gradient"
                  >
                    <Send className="w-4 h-4 ml-2" />
                    إرسال تذكير جديد
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => (
                  <Card
                    key={reminder.id}
                    className="bg-white/90 backdrop-blur-sm border-gray-200/50"
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary">
                            {reminder.status === "sent" ? "مرسل" : "معلق"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(
                              reminder.reminder_date
                            ).toLocaleDateString("en-US")}
                          </span>
                        </div>
                        <p className="text-sm">{reminder.message}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <PayDebtModal
          open={isPayDebtModalOpen}
          onOpenChange={setIsPayDebtModalOpen}
          debt={selectedDebt}
        />

        <CreateInvoiceModal
          open={isCreateInvoiceModalOpen}
          onOpenChange={setIsCreateInvoiceModalOpen}
          customer={customer}
        />

        <SendReminderModal
          open={isSendReminderModalOpen}
          onOpenChange={setIsSendReminderModalOpen}
          customer={customer}
          debts={debts}
        />

        {selectedInvoice && (
          <InvoicePDF
            invoice={selectedInvoice}
            customer={customer}
            onClose={() => setSelectedInvoice(null)}
          />
        )}
      </div>
    </div>
  );
};

export default CustomerProfile;
