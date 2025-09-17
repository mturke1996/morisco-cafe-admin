import { brand } from "@/lib/brand";

interface Employee {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

interface PaymentData {
  id: string;
  days_worked: number;
  daily_wage: number;
  gross_amount: number;
  total_bonuses: number;
  total_deductions: number;
  net_amount: number;
  amount_paid: number;
  remaining_balance: number;
  payment_status: string;
  payment_date: string;
  period_start: string;
  period_end: string;
  notes?: string;
}

interface InvoiceProps {
  employee: Employee;
  paymentData: PaymentData;
}

export const generateSalaryInvoicePDF = ({
  employee,
  paymentData,
}: InvoiceProps) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const invoiceHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>فاتورة راتب - ${employee.name}</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { font-family: 'Cairo', sans-serif; background: #f6f7f9; min-height: 100vh; padding: 20px; color: #111827; }
        
        .invoice-container { max-width: 900px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); overflow: hidden; position: relative; }
        
        .invoice-header { background: linear-gradient(135deg, ${
          brand.primaryColor
        }, ${
    brand.secondaryColor
  }); color: white; padding: 28px; text-align: center; position: relative; display:flex; align-items:center; justify-content:space-between; }
        
        .header-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 2px, transparent 2px);
          background-size: 50px 50px;
        }
        
        .logo-section {
          position: relative;
          z-index: 2;
          margin-bottom: 20px;
        }
        
        .brand { display:flex; align-items:center; gap:12px; }
        .logo { width:56px; height:56px; border-radius:12px; background: rgba(255,255,255,0.15); display:grid; place-items:center; overflow:hidden; border:1px solid rgba(255,255,255,0.25); }
        .logo img { width:100%; height:100%; object-fit:cover; }
        
        .company-name {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .invoice-title {
          font-size: 20px;
          font-weight: 400;
          opacity: 0.9;
        }
        
        .invoice-body {
          padding: 40px;
        }
        
        .invoice-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }
        
        .meta-section { background: #f9fafb; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb; }
        
        .meta-title { font-size: 16px; font-weight: 700; color: ${
          brand.primaryColor
        }; margin-bottom: 12px; display:flex; align-items:center; gap:8px; }
        
        .meta-content p {
          margin-bottom: 8px;
          color: #64748b;
          font-size: 14px;
        }
        
        .meta-content strong {
          color: #1e293b;
          font-weight: 600;
        }
        
        .salary-breakdown { background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px; position: relative; overflow: hidden; border:1px solid #e5e7eb; }
        
        .breakdown-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(45deg, rgba(102, 126, 234, 0.05) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(102, 126, 234, 0.05) 25%, transparent 25%);
          background-size: 20px 20px;
        }
        
        .breakdown-title {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 25px;
          text-align: center;
          position: relative;
          z-index: 2;
        }
        
        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid rgba(148, 163, 184, 0.3);
          position: relative;
          z-index: 2;
        }
        
        .breakdown-item:last-child { border-bottom: none; padding-top: 20px; margin-top: 15px; border-top: 2px solid ${
          brand.primaryColor
        }; font-weight: 700; font-size: 18px; color: #1e293b; }
        
        .amount {
          font-weight: 600;
        }
        
        .amount.positive {
          color: #059669;
        }
        
        .amount.negative {
          color: #dc2626;
        }
        
        .amount.total { color: ${brand.primaryColor}; font-size: 20px; }
        
        .payment-status {
          text-align: center;
          margin: 30px 0;
        }
        
        .status-badge {
          display: inline-block;
          padding: 12px 30px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 16px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .status-full {
          background: linear-gradient(135deg, #059669, #10b981);
          color: white;
          box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
        }
        
        .status-partial {
          background: linear-gradient(135deg, #d97706, #f59e0b);
          color: white;
          box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3);
        }
        
        .invoice-footer { background: #f9fafb; padding: 20px 28px; text-align: center; border-top: 1px solid #e5e7eb; color:#6b7280; }
        
        .footer-note {
          color: #64748b;
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 15px;
        }
        
        .footer-signature {
          color: #667eea;
          font-weight: 600;
          font-size: 16px;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
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
        <div class="invoice-header">
          <div class="header-pattern"></div>
          <div class="brand">
            <div class="logo"><img src="${
              brand.logoUrl
            }" onerror="this.style.display='none'"/></div>
            <div class="company-name">${brand.companyName}</div>
          </div>
          <div class="invoice-title">فاتورة دفع راتب</div>
        </div>
        
        <div class="invoice-body">
          <div class="invoice-meta">
            <div class="meta-section">
              <div class="meta-title">
                👤 معلومات الموظف
              </div>
              <div class="meta-content">
                <p><strong>الاسم:</strong> ${employee.name}</p>
                <p><strong>المنصب:</strong> ${employee.position}</p>
                ${
                  employee.phone
                    ? `<p><strong>الهاتف:</strong> ${employee.phone}</p>`
                    : ""
                }
                ${
                  employee.email
                    ? `<p><strong>البريد:</strong> ${employee.email}</p>`
                    : ""
                }
              </div>
            </div>
            
            <div class="meta-section">
              <div class="meta-title">
                📅 تفاصيل الفترة
              </div>
              <div class="meta-content">
                <p><strong>تاريخ الدفع:</strong> ${new Date(
                  paymentData.payment_date
                ).toLocaleDateString("en-US")}</p>
                <p><strong>من:</strong> ${new Date(
                  paymentData.period_start
                ).toLocaleDateString("en-US")}</p>
                <p><strong>إلى:</strong> ${new Date(
                  paymentData.period_end
                ).toLocaleDateString("en-US")}</p>
                <p><strong>أيام العمل:</strong> ${
                  paymentData.days_worked
                } يوم</p>
                <p><strong>اليومية:</strong> ${paymentData.daily_wage.toFixed(
                  2
                )} د.ل</p>
              </div>
            </div>
          </div>
          
          <div class="salary-breakdown">
            <div class="breakdown-pattern"></div>
            <div class="breakdown-title">تفصيل الراتب</div>
            
            <div class="breakdown-item">
              <span>إجمالي اليوميات (${
                paymentData.days_worked
              } × ${paymentData.daily_wage.toFixed(2)})</span>
              <span class="amount positive">+${paymentData.gross_amount.toFixed(
                2
              )} د.ل</span>
            </div>
            
            ${
              paymentData.total_bonuses > 0
                ? `
            <div class="breakdown-item">
              <span>المكافآت والحوافز</span>
              <span class="amount positive">+${paymentData.total_bonuses.toFixed(
                2
              )} د.ل</span>
            </div>
            `
                : ""
            }
            
            ${
              paymentData.total_deductions > 0
                ? `
            <div class="breakdown-item">
              <span>الخصومات</span>
              <span class="amount negative">-${paymentData.total_deductions.toFixed(
                2
              )} د.ل</span>
            </div>
            `
                : ""
            }
            
            <div class="breakdown-item">
              <span>صافي المستحق</span>
              <span class="amount total">${paymentData.net_amount.toFixed(
                2
              )} د.ل</span>
            </div>
          </div>
          
          <div class="invoice-meta">
            <div class="meta-section">
              <div class="meta-title">
                💰 تفاصيل الدفع
              </div>
              <div class="meta-content">
                <p><strong>المبلغ المدفوع:</strong> ${paymentData.amount_paid.toFixed(
                  2
                )} د.ل</p>
                <p><strong>المتبقي:</strong> ${paymentData.remaining_balance.toFixed(
                  2
                )} د.ل</p>
                <p><strong>رقم الفاتورة:</strong> #${paymentData.id
                  .substring(0, 8)
                  .toUpperCase()}</p>
              </div>
            </div>
            
            <div class="meta-section">
              <div class="payment-status">
                <div class="status-badge ${
                  paymentData.payment_status === "full"
                    ? "status-full"
                    : "status-partial"
                }">
                  ${
                    paymentData.payment_status === "full"
                      ? "مدفوع بالكامل"
                      : "دفع جزئي"
                  }
                </div>
              </div>
            </div>
          </div>
          
          ${
            paymentData.notes
              ? `
          <div class="meta-section" style="margin-top: 20px;">
            <div class="meta-title">📝 ملاحظات</div>
            <div class="meta-content">
              <p>${paymentData.notes}</p>
            </div>
          </div>
          `
              : ""
          }
        </div>
        
        <div class="invoice-footer">
          <div class="footer-note">
            تم إنشاء هذه الفاتورة آلياً في ${new Date().toLocaleDateString(
              "en-US"
            )} الساعة ${new Date().toLocaleTimeString("en-US")}
          </div>
          <div class="footer-signature">${
            brand.companyName
          } - إدارة الموارد البشرية</div>
        </div>
      </div>
      
      <script>
        window.onload = function() {
          window.print();
          setTimeout(() => {
            window.close();
          }, 1000);
        }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};
