import { brand } from "@/lib/brand";

interface DebtRecord {
  id: string;
  debt_date: string;
  amount: number;
  paid_amount?: number | null;
  status: string;
  description?: string | null;
  customers?: { name?: string | null } | null;
}

interface DebtsReportData {
  data: DebtRecord[];
  config: {
    startDate: string;
    endDate: string;
    dateRange: string;
  };
}

export const generateDebtsReportPDF = ({ data, config }: DebtsReportData) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const filteredData = data.filter((debt) => {
    const debtDate = new Date(debt.debt_date);
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    return debtDate >= start && debtDate <= end;
  });

  const totalDebts = filteredData.reduce((sum, debt) => sum + debt.amount, 0);
  const totalPaid = filteredData.reduce(
    (sum, debt) => sum + (debt.paid_amount || 0),
    0
  );
  const totalRemaining = totalDebts - totalPaid;
  const paidDebts = filteredData.filter(
    (debt) => debt.status === "paid"
  ).length;
  const pendingDebts = filteredData.filter(
    (debt) => debt.status === "pending"
  ).length;

  const reportHTML = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير الديون</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body { font-family: 'Cairo', sans-serif; background: #f6f7f9; min-height: 100vh; padding: 20px; color: #111827; }
        
        .report-container { max-width: 1000px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); overflow: hidden; }
        
        .report-header { background: linear-gradient(135deg, ${
          brand.primaryColor
        }, ${
    brand.secondaryColor
  }); color: white; padding: 28px; text-align: center; display: flex; align-items: center; justify-content: space-between; }
        .brand { display: flex; align-items: center; gap: 12px; }
        .logo { width: 56px; height: 56px; border-radius: 12px; background: rgba(255,255,255,0.15); display: grid; place-items: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.25); }
        .logo img { width: 100%; height: 100%; object-fit: cover; }
        .company { font-size: 20px; font-weight: 700; }
        .title { font-size: 18px; font-weight: 600; }
        
        .logo {
          width: 80px;
          height: 80px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          backdrop-filter: blur(10px);
        }
        
        .company-name {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
        }
        
        .report-title {
          font-size: 20px;
          opacity: 0.9;
        }
        
        .report-body {
          padding: 40px;
        }
        
        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }
        
        .summary-card { background: #f9fafb; padding: 20px; border-radius: 12px; text-align: center; border: 1px solid #e5e7eb; }
        
        .summary-card.debt {
          border-right-color: #dc2626;
        }
        
        .summary-card.paid {
          border-right-color: #059669;
        }
        
        .summary-card h3 { font-size: 22px; color: ${
          brand.primaryColor
        }; margin-bottom: 6px; }
        
        .summary-card.debt h3 {
          color: #dc2626;
        }
        
        .summary-card.paid h3 {
          color: #059669;
        }
        
        .summary-card p {
          font-size: 16px;
          color: #64748b;
        }
        
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 30px;
        }
        
        .data-table th,
        .data-table td {
          padding: 15px;
          text-align: center;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .data-table th { background: #f3f4f6; font-weight: 700; color: #111827; }
        
        .status-paid {
          background: #dcfce7;
          color: #166534;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
        }
        
        .status-pending {
          background: #fef3c7;
          color: #92400e;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 12px;
        }
        
        .amount-debt {
          font-weight: 600;
          color: #dc2626;
        }
        
        .amount-paid {
          font-weight: 600;
          color: #059669;
        }
        
        .report-footer { background: #f9fafb; padding: 18px; text-align: center; border-top: 1px solid #e5e7eb; color: #6b7280; }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .report-container {
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-container">
        <div class="report-header">
          <div class="brand">
            <div class="logo"><img src="${
              brand.logoUrl
            }" onerror="this.style.display='none'" /></div>
            <div class="company">${brand.companyName}</div>
          </div>
          <div class="title">تقرير الديون<br/><small>${new Date(
            config.startDate
          ).toLocaleDateString("en-US")} - ${new Date(
    config.endDate
  ).toLocaleDateString("en-US")}</small></div>
        </div>
        
        <div class="report-body">
          <div class="summary-cards">
            <div class="summary-card debt">
              <h3>${totalDebts.toFixed(2)} د.ل</h3>
              <p>إجمالي الديون</p>
            </div>
            <div class="summary-card paid">
              <h3>${totalPaid.toFixed(2)} د.ل</h3>
              <p>المبلغ المدفوع</p>
            </div>
            <div class="summary-card debt">
              <h3>${totalRemaining.toFixed(2)} د.ل</h3>
              <p>المبلغ المتبقي</p>
            </div>
            <div class="summary-card">
              <h3>${filteredData.length}</h3>
              <p>عدد الديون</p>
            </div>
            <div class="summary-card paid">
              <h3>${paidDebts}</h3>
              <p>ديون مدفوعة</p>
            </div>
            <div class="summary-card">
              <h3>${pendingDebts}</h3>
              <p>ديون معلقة</p>
            </div>
          </div>
          
          <table class="data-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>اسم العميل</th>
                <th>الوصف</th>
                <th>المبلغ الأصلي</th>
                <th>المبلغ المدفوع</th>
                <th>المتبقي</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map(
                  (debt) => `
                <tr>
                  <td>${new Date(debt.debt_date).toLocaleDateString(
                    "en-GB"
                  )}</td>
                  <td>${debt.customers?.name || "غير محدد"}</td>
                  <td>${debt.description || "-"}</td>
                  <td class="amount-debt">${debt.amount.toFixed(2)} د.ل</td>
                  <td class="amount-paid">${(debt.paid_amount || 0).toFixed(
                    2
                  )} د.ل</td>
                  <td class="amount-debt">${(
                    debt.amount - (debt.paid_amount || 0)
                  ).toFixed(2)} د.ل</td>
                  <td>
                    <span class="status-${debt.status}">
                      ${debt.status === "paid" ? "مدفوع" : "معلق"}
                    </span>
                  </td>
                </tr>
              `
                )
                .join("")}
            </tbody>
            <tfoot>
              <tr style="background: #fef3c7; font-weight: 600;">
                <td colspan="3">الإجمالي</td>
                <td class="amount-debt">${totalDebts.toFixed(2)} د.ل</td>
                <td class="amount-paid">${totalPaid.toFixed(2)} د.ل</td>
                <td class="amount-debt">${totalRemaining.toFixed(2)} د.ل</td>
                <td>-</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div class="report-footer">تم إنشاء هذا التقرير في ${new Date().toLocaleDateString(
          "en-GB"
        )} - ${brand.companyName}</div>
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

  printWindow.document.write(reportHTML);
  printWindow.document.close();
};
