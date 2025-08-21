import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Printer, X } from "lucide-react";
import { brand } from "@/lib/brand";

interface InvoicePDFProps {
  invoice: {
    id: string;
    invoice_number: string;
    invoice_date: string;
    total_amount: number;
    notes?: string;
    invoice_items?: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  };
  customer: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  onClose: () => void;
}

const InvoicePDF = ({ invoice, customer, onClose }: InvoicePDFProps) => {
  const handlePrint = () => {
    // Open a print-friendly window with branded design
    const w = window.open("", "_blank");
    if (!w) return;

    const html = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>فاتورة #${invoice.invoice_number}</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet" />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Cairo', sans-serif; background: #f6f7f9; color: #111827; padding: 24px; }
          .wrap { max-width: 900px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 16px 32px rgba(17,24,39,0.06); }
          .header {
            background: linear-gradient(135deg, ${brand.primaryColor}, ${
      brand.secondaryColor
    });
            color: #fff; padding: 24px 28px; display: flex; align-items: center; gap: 16px; justify-content: space-between;
          }
          .brand { display: flex; align-items: center; gap: 14px; }
          .logo {
            width: 56px; height: 56px; border-radius: 12px; background: rgba(255,255,255,0.15);
            display: grid; place-items: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.25);
          }
          .logo img { width: 100%; height: 100%; object-fit: cover; }
          .company { font-size: 18px; font-weight: 800; letter-spacing: 0.2px; }
          .title { font-size: 18px; opacity: 0.95; font-weight: 700; }
          .meta { font-size: 12px; opacity: 0.9; text-align: left; direction: ltr; }
          .section { padding: 24px 28px; }
          .row { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
          .card { background: #fafafa; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px 18px; }
          .card h4 { font-size: 13px; color: ${
            brand.secondaryColor
          }; margin-bottom: 10px; letter-spacing: .2px; }
          .card p { font-size: 14px; color: #374151; margin-bottom: 6px; }
          .table { margin-top: 12px; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
          table { width: 100%; border-collapse: collapse; }
          thead th { background: #f3f4f6; color: #111827; font-weight: 700; font-size: 13px; padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb; }
          tbody td { padding: 12px; border-top: 1px solid #e5e7eb; font-size: 13px; }
          tbody tr:nth-child(even){ background: #fafafa; }
          tbody td.num { text-align: right; font-variant-numeric: tabular-nums; }
          .total { display: flex; justify-content: flex-end; margin-top: 16px; }
          .total-box { background: #ffffff; color: #111827; border: 1px solid #e5e7eb; border-top: 3px solid ${
            brand.accentColor
          }; border-radius: 10px; padding: 14px 20px; min-width: 300px; }
          .footer { background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 18px 24px; text-align: center; color: #6b7280; font-size: 13px; }
          .accent { color: ${brand.accentColor}; }
          @media print { body { background: #fff; padding: 0; } .wrap { box-shadow: none; border-radius: 0; } }
        </style>
      </head>
      <body>
        <div class="wrap">
          <div class="header">
            <div class="brand">
              <div class="logo">
                <img src="${
                  brand.logoUrl
                }" onerror="this.style.display='none'" />
              </div>
              <div class="company">${brand.companyName}</div>
            </div>
            <div class="title">فاتورة #${
              invoice.invoice_number
            }<div class="meta">${brand.phone || ""} ${
      brand.email ? " | " + brand.email : ""
    }</div></div>
          </div>

          <div class="section">
            <div class="row">
              <div class="card">
                <h4>بيانات العميل</h4>
                <p><strong>الاسم:</strong> ${customer.name}</p>
                ${
                  customer.phone
                    ? `<p><strong>الهاتف:</strong> ${customer.phone}</p>`
                    : ""
                }
                ${
                  customer.email
                    ? `<p><strong>البريد:</strong> ${customer.email}</p>`
                    : ""
                }
                ${
                  customer.address
                    ? `<p><strong>العنوان:</strong> ${customer.address}</p>`
                    : ""
                }
              </div>
              <div class="card">
                <h4>تفاصيل الفاتورة</h4>
                <p><strong>رقم الفاتورة:</strong> ${invoice.invoice_number}</p>
                <p><strong>تاريخ الفاتورة:</strong> ${new Date(
                  invoice.invoice_date
                ).toLocaleDateString("en-GB")}</p>
                <p><strong>حالة الدفع:</strong> <span class="accent">معلقة</span></p>
              </div>
            </div>

            <div class="table">
              <table>
                <thead>
                  <tr>
                    <th>الوصف</th>
                    <th>الكمية</th>
                    <th>السعر (د.ل)</th>
                    <th>الإجمالي (د.ل)</th>
                  </tr>
                </thead>
                <tbody>
                  ${(invoice.invoice_items || [])
                    .map(
                      (it) => `
                    <tr>
                      <td>${it.description}</td>
                      <td class="num">${it.quantity}</td>
                      <td class="num">${it.unit_price.toFixed(2)}</td>
                      <td class="num">${it.total_price.toFixed(2)}</td>
                    </tr>`
                    )
                    .join("")}
                </tbody>
              </table>
            </div>

            <div class="total">
              <div class="total-box">
                <div><strong>الإجمالي:</strong> ${invoice.total_amount.toFixed(
                  2
                )} د.ل</div>
              </div>
            </div>

            ${
              invoice.notes
                ? `<div class="card" style="margin-top:16px"><h4>ملاحظات</h4><p>${invoice.notes}</p></div>`
                : ""
            }
          </div>

          <div class="footer">تم إنشاء هذه الفاتورة في ${new Date().toLocaleDateString(
            "en-GB"
          )} - ${brand.companyName}</div>
        </div>

        <script>
          window.onload = function(){ setTimeout(function(){ window.print(); window.close(); }, 300); };
        </script>
      </body>
      </html>
    `;

    w.document.write(html);
    w.document.close();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden p-0">
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            فاتورة #{invoice.invoice_number}
          </h2>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} size="sm" variant="outline">
              <Printer className="w-4 h-4 ml-2" />
              طباعة
            </Button>
            <Button onClick={onClose} size="sm" variant="ghost">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto" dir="rtl" id="invoice-content">
          <div className="max-w-4xl mx-auto bg-white">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-2">فاتورة</h1>
              <div className="h-1 bg-gradient-to-r from-blue-600 to-blue-400 mx-auto w-32 mb-4"></div>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  معلومات العميل
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>الاسم:</strong> {customer.name}
                  </p>
                  {customer.phone && (
                    <p>
                      <strong>الهاتف:</strong> {customer.phone}
                    </p>
                  )}
                  {customer.email && (
                    <p>
                      <strong>البريد:</strong> {customer.email}
                    </p>
                  )}
                  {customer.address && (
                    <p>
                      <strong>العنوان:</strong> {customer.address}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-left" dir="ltr">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  Invoice Details
                </h3>
                <div className="space-y-2 text-gray-600">
                  <p>
                    <strong>رقم الفاتورة:</strong> {invoice.invoice_number}
                  </p>
                  <p>
                    <strong>التاريخ:</strong>{" "}
                    {new Date(invoice.invoice_date).toLocaleDateString("en-GB")}
                  </p>
                  <p>
                    <strong>حالة الدفع:</strong>{" "}
                    <span className="text-orange-600">معلقة</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                تفاصيل الفاتورة
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-right">
                        الوصف
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        الكمية
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        السعر (د.ل)
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center">
                        الإجمالي (د.ل)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.invoice_items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3">
                          {item.description}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          {item.unit_price.toFixed(2)}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center font-semibold">
                          {item.total_price.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end mb-8">
              <div className="bg-blue-50 p-6 rounded-lg min-w-[300px]">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-semibold">
                    {invoice.total_amount.toFixed(2)} د.ل
                  </span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-blue-600">
                      الإجمالي النهائي:
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      {invoice.total_amount.toFixed(2)} د.ل
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">
                  ملاحظات
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-600">{invoice.notes}</p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 border-t pt-6">
              <p>شكراً لتعاملكم معنا</p>
              <p className="mt-2">
                تم إنشاء هذه الفاتورة بتاريخ{" "}
                {new Date().toLocaleDateString("en-GB")}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoicePDF;
