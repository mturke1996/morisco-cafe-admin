import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Minus,
  X,
  FileText,
  DollarSign,
  Calendar,
  User,
  Receipt,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  type: "invoice" | "report" | "salary" | "expense";
  title: string;
  customer?: {
    name: string;
    phone?: string;
    email?: string;
  };
  employee?: {
    name: string;
    position: string;
  };
  initialData?: any;
}

export const InvoiceGenerator = ({
  isOpen,
  onClose,
  type,
  title,
  customer,
  employee,
  initialData,
}: InvoiceGeneratorProps) => {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState("");
  const [taxRate, setTaxRate] = useState(14);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.totalPrice =
              updatedItem.quantity * updatedItem.unitPrice;
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const generatePDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title} - موريسكو كافيه</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');

              body {
                  font-family: 'Cairo', sans-serif;
                  background-color: #f0f2f5;
                  padding: 40px;
                  color: #333;
              }

              .invoice-container {
                  max-width: 900px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 12px;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                  padding: 50px;
              }

              .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding-bottom: 25px;
                  border-bottom: 3px solid #e9ecef;
                  margin-bottom: 30px;
              }

              .logo-box {
                  display: flex;
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 10px;
              }

              .logo-box img {
                  max-width: 120px;
              }

              .logo-text {
                  font-size: 40px;
                  font-weight: 700;
                  color: #006241;
              }

              .logo-subinfo {
                  font-size: 14px;
                  color: #6c757d;
                  line-height: 1.6;
              }

              .header-info {
                  text-align: right;
              }

              .header-info h1 {
                  font-size: 48px;
                  color: #212529;
                  margin: 0;
                  font-weight: 700;
              }

              .header-info p {
                  margin: 5px 0;
                  color: #6c757d;
                  font-size: 16px;
              }

              .bill-info {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  margin-bottom: 30px;
                  font-size: 16px;
              }

              .bill-info .section {
                  width: 45%;
              }

              .bill-info .section p {
                  margin: 5px 0;
              }

              .bill-info .section span {
                  font-weight: 700;
                  color: #495057;
              }

              .invoice-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
              }

              .invoice-table th, .invoice-table td {
                  padding: 18px;
                  text-align: center;
                  border: none;
              }

              .invoice-table thead th {
                  background-color: #006241;
                  color: #ffffff;
                  font-weight: 700;
                  font-size: 16px;
              }

              .invoice-table tbody tr {
                  border-bottom: 1px solid #e9ecef;
              }

              .invoice-table tbody tr:last-child {
                  border-bottom: none;
              }

              .invoice-table tbody td {
                  background-color: #f8f9fa;
                  font-size: 16px;
                  color: #495057;
              }

              .invoice-table tbody tr:hover td {
                  background-color: #e2e6ea;
              }

              .summary-section {
                  display: flex;
                  justify-content: flex-end;
                  margin-top: 40px;
              }

              .summary-box {
                  width: 400px;
                  border: 1px solid #e9ecef;
                  border-radius: 8px;
                  padding: 20px;
              }

              .summary-box .row {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 0;
                  border-bottom: 1px solid #e9ecef;
              }

              .summary-box .row:last-child {
                  border-bottom: none;
                  font-size: 20px;
                  font-weight: 700;
                  color: #28a745;
              }

              .summary-box .row span {
                  font-size: 16px;
                  color: #495057;
              }
              
              .footer {
                  text-align: center;
                  margin-top: 50px;
                  padding-top: 20px;
                  border-top: 3px solid #e9ecef;
              }

              .footer p {
                  font-size: 14px;
                  color: #6c757d;
              }

              @media print {
                  body {
                      padding: 0;
                      background: white;
                  }
                  .invoice-container {
                      box-shadow: none;
                      border-radius: 0;
                  }
              }
          </style>
      </head>
      <body>
          <div class="invoice-container">
              <div class="header">
                  <div class="logo-box">
                      <img src="./logo_green.png" alt="Moresque Cafe Logo">
                      <div class="logo-text">موريسكو كافيه</div>
                      <div class="logo-subinfo">
                          تاجوراء - طرابلس، ليبيا<br>
                          0910929091<br>
                          info@moresquecafe.ly
                      </div>
                  </div>
                  <div class="header-info">
                      <h1>${title}</h1>
                  </div>
              </div>
              
              <div class="bill-info">
                  <div class="section">
                      <p><span>تاريخ ${title}:</span> ${new Date(
      invoiceDate
    ).toLocaleDateString("en-US")}</p>
                      <p><span>رقم ${title}:</span> ${
      invoiceNumber || "غير محدد"
    }</p>
                  </div>
                  <div class="section">
                      ${
                        customer
                          ? `
                          <p><span>${title} إلى:</span> ${customer.name}</p>
                          ${
                            customer.phone
                              ? `<p><span>هاتف العميل:</span> ${customer.phone}</p>`
                              : ""
                          }
                          ${
                            customer.email
                              ? `<p><span>البريد الإلكتروني:</span> ${customer.email}</p>`
                              : ""
                          }
                      `
                          : employee
                          ? `
                          <p><span>اسم الموظف:</span> ${employee.name}</p>
                          <p><span>المنصب:</span> ${employee.position}</p>
                      `
                          : ""
                      }
                  </div>
              </div>

              ${
                items.length > 0
                  ? `
                  <table class="invoice-table">
                      <thead>
                          <tr>
                              <th>م</th>
                              <th>وصف المنتج / الخدمة</th>
                              <th>الكمية</th>
                              <th>السعر</th>
                              <th>الإجمالي</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${items
                            .map(
                              (item, index) => `
                              <tr>
                                  <td>${index + 1}</td>
                                  <td>${item.description}</td>
                                  <td>${item.quantity}</td>
                                  <td>${item.unitPrice.toFixed(2)} دينار</td>
                                  <td>${item.totalPrice.toFixed(2)} دينار</td>
                              </tr>
                          `
                            )
                            .join("")}
                      </tbody>
                  </table>
              `
                  : ""
              }

              <div class="summary-section">
                  <div class="summary-box">
                      <div class="row">
                          <span>المجموع الفرعي:</span>
                          <span>${subtotal.toFixed(2)} دينار</span>
                      </div>
                      <div class="row">
                          <span>الضريبة (${taxRate}%):</span>
                          <span>${taxAmount.toFixed(2)} دينار</span>
                      </div>
                      <div class="row">
                          <span>المجموع النهائي:</span>
                          <span>${total.toFixed(2)} دينار</span>
                      </div>
                  </div>
              </div>

              ${
                notes
                  ? `
                  <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                      <h3 style="margin: 0 0 10px 0; color: #495057;">ملاحظات:</h3>
                      <p style="margin: 0; color: #6c757d;">${notes}</p>
                  </div>
              `
                  : ""
              }

              <div class="footer">
                  <p>شكراً لزيارتكم موريسكو كافيه. نأمل أن نراكم مرة أخرى قريباً!</p>
              </div>
          </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl mx-auto max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="w-5 h-5" />
            إنشاء {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoiceNumber">رقم {title}</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder={`أدخل رقم ${title}`}
              />
            </div>
            <div>
              <Label htmlFor="invoiceDate">تاريخ {title}</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>

          {/* Items Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">العناصر</h3>
                <Button onClick={addItem} size="sm">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة عنصر
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-4" />
                  <p>لا توجد عناصر مضافة</p>
                </div>
              ) : (
                <ScrollArea className="max-h-60">
                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 gap-2 items-center p-3 border rounded-lg"
                      >
                        <div className="col-span-1 text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="col-span-4">
                          <Input
                            placeholder="وصف المنتج أو الخدمة"
                            value={item.description}
                            onChange={(e) =>
                              updateItem(item.id, "description", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="الكمية"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            placeholder="السعر"
                            value={item.unitPrice}
                            onChange={(e) =>
                              updateItem(
                                item.id,
                                "unitPrice",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>
                        <div className="col-span-2 flex items-center gap-2">
                          <span className="font-medium">
                            {item.totalPrice.toFixed(2)} د.ل
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {items.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span className="font-medium">
                      {subtotal.toFixed(2)} د.ل
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة ({taxRate}%):</span>
                    <span className="font-medium">
                      {taxAmount.toFixed(2)} د.ل
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع النهائي:</span>
                    <span className="text-green-600">
                      {total.toFixed(2)} د.ل
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">ملاحظات (اختياري)</Label>
            <Textarea
              id="notes"
              placeholder="أي ملاحظات إضافية..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              إلغاء
            </Button>
            <Button
              onClick={generatePDF}
              className="flex-1"
              disabled={items.length === 0}
            >
              <FileText className="w-4 h-4 ml-2" />
              إنشاء وطباعة
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
