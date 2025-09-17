import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { ShiftClosureData } from "@/hooks/useShiftClosure";

interface PrintShiftClosureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closure: ShiftClosureData | null;
}

const PrintShiftClosureModal = ({
  open,
  onOpenChange,
  closure,
}: PrintShiftClosureModalProps) => {
  if (!closure) return null;

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US");
  const unit = " د.ل";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const isPositive = closure.difference > 0;
    const isNegative = closure.difference < 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
          <meta charset="UTF-8">
          <title>فاتورة إغلاق وردية · 2026</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  background: #f7f7fb;
                  color: #1f2937;
                  direction: rtl;
                  padding: 24px;
              }
              
              .container {
                  max-width: 780px;
                  margin: 0 auto;
                  background: #fff;
                  border: 1px solid #e5e7eb;
                  border-radius: 16px;
                  overflow: hidden;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.06);
              }
              
              .header {
                  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
                  color: white;
                  padding: 24px;
                  text-align: center;
              }
              
              .logo {
                  font-size: 1.75rem;
                  font-weight: bold;
                  margin-bottom: 8px;
              }
              
              .report-title {
                  font-size: 1.25rem;
                  margin-bottom: 4px;
              }
              
              .report-info {
                  font-size: 1rem;
                  opacity: 0.85;
              }
              
              .content {
                  padding: 24px;
              }
              
              .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 12px;
                  margin-bottom: 20px;
              }
              
              .info-item {
                  display: flex;
                  justify-content: space-between;
                  padding: 10px 12px;
                  background: #f9fafb;
                  border-radius: 10px;
                  border: 1px solid #eef2f7;
              }
              
              .info-label {
                  font-weight: bold;
                  color: #374151;
              }
              
              .info-value {
                  color: #111827;
              }
              
              .section {
                  margin-bottom: 20px;
                  border: 1px solid #e5e7eb;
                  border-radius: 14px;
                  overflow: hidden;
              }
              
              .section-header {
                  background: #f3f4f6;
                  padding: 14px 16px;
                  font-weight: 700;
                  color: #111827;
                  border-bottom: 1px solid #e5e7eb;
              }
              
              .section-content {
                  padding: 16px;
              }
              
              table {
                  width: 100%;
                  border-collapse: separate;
                  border-spacing: 0;
                  border: 1px solid #e5e7eb;
                  border-radius: 12px;
                  overflow: hidden;
              }

              th, td {
                  padding: 12px 14px;
                  text-align: center;
                  border-bottom: 1px solid #eef2f7;
              }

              th {
                  background: #f9fafb;
                  font-weight: 700;
                  color: #1f2937;
              }

              tr:last-child td {
                  border-bottom: none;
              }
              
              .result-section {
                  background: ${
                    isPositive ? "#d4edda" : isNegative ? "#f8d7da" : "#f1f2f6"
                  };
                  border: 2px solid ${
                    isPositive ? "#c3e6cb" : isNegative ? "#f5c6cb" : "#ddd"
                  };
                  border-radius: 8px;
                  padding: 16px;
                  margin: 20px 0;
              }
              
              .result-title {
                  font-size: 1.2rem;
                  font-weight: bold;
                  color: ${
                    isPositive ? "#155724" : isNegative ? "#721c24" : "#2c3e50"
                  };
                  margin-bottom: 12px;
                  text-align: center;
              }
              
              .result-details {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 12px;
              }
              
              .result-item {
                  display: flex;
                  justify-content: space-between;
                  padding: 6px 0;
              }
              
              .final-result {
                  text-align: center;
                  font-size: 1.3rem;
                  font-weight: bold;
                  color: ${
                    isPositive ? "#155724" : isNegative ? "#721c24" : "#2c3e50"
                  };
                  margin-top: 15px;
                  padding: 12px;
                  border-top: 2px solid ${
                    isPositive ? "#c3e6cb" : isNegative ? "#f5c6cb" : "#ddd"
                  };
              }
              .status-row {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  gap: 12px;
                  margin-top: 10px;
              }
              .badge {
                  display: inline-block;
                  padding: 6px 10px;
                  border-radius: 9999px;
                  font-weight: 700;
                  font-size: 0.9rem;
                  border: 1px solid transparent;
              }
              .badge-green { background: #e8f5e9; color: #1b5e20; border-color: #c8e6c9; }
              .badge-red { background: #ffebee; color: #b71c1c; border-color: #ffcdd2; }
              .badge-gray { background: #f3f4f6; color: #374151; border-color: #e5e7eb; }
              
              .footer {
                  background: #f9fafb;
                  text-align: center;
                  padding: 16px;
                  color: #6b7280;
                  font-size: 0.9rem;
                  border-top: 1px solid #e5e7eb;
              }
              
              @media print {
                  body { 
                      padding: 0;
                  }
                  .container {
                      border: none;
                      border-radius: 0;
                  }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">☕ مقهى موريسكو</div>
                  <div class="report-title">فاتورة إغلاق الوردية · 2026</div>
                  <div class="report-info">
                      وردية ${
                        closure.shift_type === "morning" ? "صباحية" : "مسائية"
                      } - ${formatDate(closure.shift_date)}
                  </div>
              </div>
              
              <div class="content">
                  <div class="info-grid">
                      <div class="info-item">
                          <span class="info-label">نوع الوردية:</span>
                          <span class="info-value">${
                            closure.shift_type === "morning"
                              ? "صباحية"
                              : "مسائية"
                          }</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">التاريخ:</span>
                          <span class="info-value">${formatDate(
                            closure.shift_date
                          )}</span>
                      </div>
                  </div>
                  
                  <div class="section">
                      <div class="section-header">ملخص القيم</div>
                      <div class="section-content">
                          <table>
                              <thead>
                                  <tr>
                                      <th>البند</th>
                                      <th>المبلغ</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr>
                                      <td>نحاس (فكة)</td>
                                      <td>${formatCurrency(
                                        closure.coins_small
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>رقاق (1 دينار)</td>
                                      <td>${formatCurrency(
                                        closure.coins_one_dinar
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>غلاض (باقي العملات)</td>
                                      <td>${formatCurrency(
                                        closure.bills_large
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>الكاش</td>
                                      <td>${formatCurrency(
                                        closure.cash_sales
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>البطاقة المصرفية</td>
                                      <td>${formatCurrency(
                                        closure.card_sales
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>بطاقة تداول</td>
                                      <td>${formatCurrency(
                                        closure.tadawul_sales
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>بريستو</td>
                                      <td>${formatCurrency(
                                        closure.presto_sales
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>مصروفات الوردية</td>
                                      <td>${formatCurrency(
                                        closure.shift_expenses
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>نحاس/رقاق/غلاض سابقة (مطروح)</td>
                                      <td>- ${formatCurrency(
                                        closure.prev_coins_small +
                                          closure.prev_coins_one_dinar +
                                          closure.prev_bills_large
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>مبيعات الشاشة (مطروح لاحقًا)</td>
                                      <td>- ${formatCurrency(
                                        closure.screen_sales
                                      )}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
                  
                  <div class="section">
                      <div class="section-header">النقود من الوردية السابقة</div>
                      <div class="section-content">
                          <table>
                              <thead>
                                  <tr>
                                      <th>البند</th>
                                      <th>المبلغ</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <tr>
                                      <td>نحاس سابق</td>
                                      <td>${formatCurrency(
                                        closure.prev_coins_small
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>رقاق سابق</td>
                                      <td>${formatCurrency(
                                        closure.prev_coins_one_dinar
                                      )}</td>
                                  </tr>
                                  <tr>
                                      <td>غلاض سابق</td>
                                      <td>${formatCurrency(
                                        closure.prev_bills_large
                                      )}</td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                  </div>
                  
                  <div class="result-section">
                      <div class="result-title">نتائج إغلاق الوردية</div>
                      <div class="result-details">
                          <div class="result-item">
                              <span>المجموع قبل طرح مبيعات الشاشة:</span>
                              <span>${formatCurrency(
                                closure.total_calculated
                              )}</span>
                          </div>
                          <div class="result-item">
                              <span>النهائي بعد طرح مبيعات الشاشة:</span>
                              <span>${formatCurrency(closure.difference)}</span>
                          </div>
                      </div>
                      <div class="final-result">
                          ${Math.round(closure.total_calculated)}/${Math.abs(
      Math.round(closure.difference)
    )}${unit}
                      </div>
                      <div class="status-row">
                          <span class="badge ${
                            isPositive
                              ? "badge-green"
                              : isNegative
                              ? "badge-red"
                              : "badge-gray"
                          }">
                              ${
                                isPositive
                                  ? "فائض"
                                  : isNegative
                                  ? "عجز"
                                  : "متوازن"
                              }
                          </span>
                          <span>
                              قيمة ${
                                isPositive
                                  ? "الفائض"
                                  : isNegative
                                  ? "العجز"
                                  : "النتيجة"
                              }: ${formatCurrency(Math.abs(closure.difference))}
                          </span>
                      </div>
                  </div>
              </div>
              
              <div class="footer">
                  تم إنشاء هذا التقرير في ${formatDate(
                    new Date().toISOString().split("T")[0]
                  )} - مقهى موريسكو
              </div>
          </div>
          
          <script>
              window.onload = function() {
                  setTimeout(() => {
                      window.print();
                  }, 500);
              }
          </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            طباعة تقرير إغلاق الوردية
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              معلومات التقرير
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>نوع الوردية:</span>
                <span className="font-medium">
                  {closure.shift_type === "morning" ? "صباحية" : "مسائية"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span className="font-medium">
                  {formatDate(closure.shift_date)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>النتيجة:</span>
                <span
                  className={`font-bold ${
                    closure.difference >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {closure.difference >= 0 ? "فائض" : "عجز"}{" "}
                  {formatCurrency(Math.abs(closure.difference))}
                </span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-sm">
            سيتم فتح نافذة جديدة لطباعة التقرير مع جميع التفاصيل والنتائج.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1"
          >
            <X className="w-4 h-4 ml-2" />
            إلغاء
          </Button>
          <Button onClick={handlePrint} className="flex-1 btn-gradient">
            <Printer className="w-4 h-4 ml-2" />
            طباعة التقرير
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PrintShiftClosureModal;
