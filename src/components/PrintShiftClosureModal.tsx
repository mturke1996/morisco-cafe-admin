
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";
import { ShiftClosureData } from "@/hooks/useShiftClosure";

interface PrintShiftClosureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  closure: ShiftClosureData | null;
}

const PrintShiftClosureModal = ({ open, onOpenChange, closure }: PrintShiftClosureModalProps) => {
  if (!closure) return null;

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} د.ل`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ar-LY');

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isPositive = closure.difference >= 0;

    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
          <meta charset="UTF-8">
          <title>تقرير إغلاق الوردية</title>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Arial', sans-serif;
                  background: white;
                  color: #333;
                  direction: rtl;
                  padding: 20px;
              }
              
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background: white;
                  border: 2px solid #333;
                  border-radius: 10px;
                  overflow: hidden;
              }
              
              .header {
                  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
                  color: white;
                  padding: 20px;
                  text-align: center;
              }
              
              .logo {
                  font-size: 2rem;
                  font-weight: bold;
                  margin-bottom: 10px;
              }
              
              .report-title {
                  font-size: 1.5rem;
                  margin-bottom: 5px;
              }
              
              .report-info {
                  font-size: 1rem;
                  opacity: 0.9;
              }
              
              .content {
                  padding: 20px;
              }
              
              .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-bottom: 20px;
              }
              
              .info-item {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px;
                  background: #f8f9fa;
                  border-radius: 5px;
              }
              
              .info-label {
                  font-weight: bold;
                  color: #2c3e50;
              }
              
              .info-value {
                  color: #34495e;
              }
              
              .section {
                  margin-bottom: 20px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                  overflow: hidden;
              }
              
              .section-header {
                  background: #f1f2f6;
                  padding: 10px 15px;
                  font-weight: bold;
                  color: #2c3e50;
                  border-bottom: 1px solid #ddd;
              }
              
              .section-content {
                  padding: 15px;
              }
              
              .grid-3 {
                  display: grid;
                  grid-template-columns: repeat(3, 1fr);
                  gap: 10px;
              }
              
              .grid-2 {
                  display: grid;
                  grid-template-columns: repeat(2, 1fr);
                  gap: 10px;
              }
              
              .result-section {
                  background: ${isPositive ? '#d4edda' : '#f8d7da'};
                  border: 2px solid ${isPositive ? '#c3e6cb' : '#f5c6cb'};
                  border-radius: 8px;
                  padding: 15px;
                  margin: 20px 0;
              }
              
              .result-title {
                  font-size: 1.2rem;
                  font-weight: bold;
                  color: ${isPositive ? '#155724' : '#721c24'};
                  margin-bottom: 10px;
                  text-align: center;
              }
              
              .result-details {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 10px;
              }
              
              .result-item {
                  display: flex;
                  justify-content: space-between;
                  padding: 5px 0;
              }
              
              .final-result {
                  text-align: center;
                  font-size: 1.3rem;
                  font-weight: bold;
                  color: ${isPositive ? '#155724' : '#721c24'};
                  margin-top: 15px;
                  padding: 10px;
                  border-top: 2px solid ${isPositive ? '#c3e6cb' : '#f5c6cb'};
              }
              
              .footer {
                  background: #f8f9fa;
                  text-align: center;
                  padding: 15px;
                  color: #666;
                  font-size: 0.9rem;
                  border-top: 1px solid #ddd;
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
                  <div class="report-title">تقرير إغلاق الوردية</div>
                  <div class="report-info">
                      وردية ${closure.shift_type === 'morning' ? 'صباحية' : 'مسائية'} - ${formatDate(closure.shift_date)}
                  </div>
              </div>
              
              <div class="content">
                  <div class="info-grid">
                      <div class="info-item">
                          <span class="info-label">نوع الوردية:</span>
                          <span class="info-value">${closure.shift_type === 'morning' ? 'صباحية' : 'مسائية'}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">التاريخ:</span>
                          <span class="info-value">${formatDate(closure.shift_date)}</span>
                      </div>
                  </div>
                  
                  <div class="section">
                      <div class="section-header">النقود الحالية</div>
                      <div class="section-content">
                          <div class="grid-3">
                              <div class="info-item">
                                  <span class="info-label">نحاس (فكة):</span>
                                  <span class="info-value">${formatCurrency(closure.coins_small)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">رقاق (1 دينار):</span>
                                  <span class="info-value">${formatCurrency(closure.coins_one_dinar)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">غلاض (باقي العملات):</span>
                                  <span class="info-value">${formatCurrency(closure.bills_large)}</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="section">
                      <div class="section-header">المبيعات</div>
                      <div class="section-content">
                          <div class="grid-2">
                              <div class="info-item">
                                  <span class="info-label">مبيعات الشاشة:</span>
                                  <span class="info-value">${formatCurrency(closure.screen_sales)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">الكاش:</span>
                                  <span class="info-value">${formatCurrency(closure.cash_sales)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">البطاقة المصرفية:</span>
                                  <span class="info-value">${formatCurrency(closure.card_sales)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">بطاقة تداول:</span>
                                  <span class="info-value">${formatCurrency(closure.tadawul_sales)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">بريستو:</span>
                                  <span class="info-value">${formatCurrency(closure.presto_sales)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">مصروفات الوردية:</span>
                                  <span class="info-value">${formatCurrency(closure.shift_expenses)}</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="section">
                      <div class="section-header">النقود من الوردية السابقة</div>
                      <div class="section-content">
                          <div class="grid-3">
                              <div class="info-item">
                                  <span class="info-label">نحاس سابق:</span>
                                  <span class="info-value">${formatCurrency(closure.prev_coins_small)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">رقاق سابق:</span>
                                  <span class="info-value">${formatCurrency(closure.prev_coins_one_dinar)}</span>
                              </div>
                              <div class="info-item">
                                  <span class="info-label">غلاض سابق:</span>
                                  <span class="info-value">${formatCurrency(closure.prev_bills_large)}</span>
                              </div>
                          </div>
                      </div>
                  </div>
                  
                  <div class="result-section">
                      <div class="result-title">نتائج إغلاق الوردية</div>
                      <div class="result-details">
                          <div class="result-item">
                              <span>إجمالي النقود الحالية:</span>
                              <span>${formatCurrency(closure.total_actual)}</span>
                          </div>
                          <div class="result-item">
                              <span>المجموع المحسوب:</span>
                              <span>${formatCurrency(closure.total_calculated)}</span>
                          </div>
                      </div>
                      <div class="final-result">
                          النتيجة: ${isPositive ? 'فائض' : 'عجز'} ${formatCurrency(Math.abs(closure.difference))}
                      </div>
                  </div>
              </div>
              
              <div class="footer">
                  تم إنشاء هذا التقرير في ${formatDate(new Date().toISOString().split('T')[0])} - مقهى موريسكو
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
            <h3 className="font-semibold text-blue-800 mb-2">معلومات التقرير</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>نوع الوردية:</span>
                <span className="font-medium">{closure.shift_type === 'morning' ? 'صباحية' : 'مسائية'}</span>
              </div>
              <div className="flex justify-between">
                <span>التاريخ:</span>
                <span className="font-medium">{formatDate(closure.shift_date)}</span>
              </div>
              <div className="flex justify-between">
                <span>النتيجة:</span>
                <span className={`font-bold ${closure.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {closure.difference >= 0 ? 'فائض' : 'عجز'} {formatCurrency(Math.abs(closure.difference))}
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-muted-foreground text-sm">
            سيتم فتح نافذة جديدة لطباعة التقرير مع جميع التفاصيل والنتائج.
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
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
