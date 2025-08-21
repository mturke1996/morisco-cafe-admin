
import React from 'react';
import { brand } from "@/lib/brand";

interface ExpenseDetail {
  id: string;
  description: string;
  amount: number;
  category: string;
  expense_date: string;
}

interface ExpensesReportData {
  stats: {
    total_amount: number;
    by_category: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
  };
  details: ExpenseDetail[];
}

interface ExpensesReportPDFProps {
  data: ExpensesReportData;
  config: {
    startDate: string;
    endDate: string;
    dateRange: string;
  };
}

export const generateExpensesReportPDF = ({ data, config }: ExpensesReportPDFProps) => {
  const reportWindow = window.open('', '_blank');
  if (!reportWindow) return;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} د.ل`;
  };

  const getPeriodText = () => {
    switch (config.dateRange) {
      case 'daily': return 'تقرير يومي';
      case 'weekly': return 'تقرير أسبوعي';
      case 'monthly': return 'تقرير شهري';
      case 'custom': return `من ${formatDate(config.startDate)} إلى ${formatDate(config.endDate)}`;
      default: return 'تقرير المصروفات';
    }
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>تقرير المصروفات</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body { font-family: 'Cairo', sans-serif; background: #f6f7f9; color: #111827; direction: rtl; padding: 20px; }
            
            .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); overflow: hidden; }
            
            .header { background: linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor}); color: white; padding: 28px; text-align: center; position: relative; display: flex; align-items: center; justify-content: space-between; }
            .brand { display:flex; align-items:center; gap:12px; }
            .logo { width: 56px; height: 56px; border-radius: 12px; background: rgba(255,255,255,0.15); display:grid; place-items:center; overflow:hidden; border:1px solid rgba(255,255,255,0.25); }
            .logo img { width:100%; height:100%; object-fit:cover; }
            .company { font-size:20px; font-weight:700; }
            .report-title { font-size:18px; font-weight:600; }
            
            .header::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
                opacity: 0.3;
            }
            
            .header * {
                position: relative;
                z-index: 1;
            }
            
            .logo {
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .report-title {
                font-size: 1.8rem;
                margin-bottom: 5px;
            }
            
            .report-period {
                font-size: 1.1rem;
                opacity: 0.9;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                padding: 30px;
                background: linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%);
            }
            
            .stat-card {
                background: white;
                padding: 25px;
                border-radius: 15px;
                text-align: center;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                border: 2px solid transparent;
                background-clip: padding-box;
                position: relative;
                overflow: hidden;
            }
            
            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 4px;
                background: linear-gradient(90deg, #e74c3c, #f39c12, #e67e22);
            }
            
            .stat-value { font-size: 2rem; font-weight: bold; color: ${brand.primaryColor}; margin-bottom: 8px; }
            
            .stat-label {
                color: #666;
                font-size: 0.9rem;
                font-weight: 500;
            }
            
            .content {
                padding: 30px;
            }
            
            .section-title {
                font-size: 1.4rem;
                color: #2c3e50;
                margin-bottom: 20px;
                padding-bottom: 10px;
                border-bottom: 3px solid #e74c3c;
                display: inline-block;
            }
            
            .category-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .category-card {
                background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
                padding: 20px;
                border-radius: 10px;
                border-right: 4px solid #e74c3c;
                box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            }
            
            .category-name {
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 8px;
            }
            
            .category-amount {
                font-size: 1.3rem;
                color: #e74c3c;
                font-weight: bold;
            }
            
            .category-count {
                font-size: 0.9rem;
                color: #666;
                margin-top: 4px;
            }
            
            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 20px;
                background: white;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            }
            
            th { background: #f3f4f6; color: #111827; padding: 15px; font-weight: 700; text-align: center; }
            
            td {
                padding: 12px 15px;
                text-align: center;
                border-bottom: 1px solid #eee;
            }
            
            tr:nth-child(even) {
                background: #f8f9fa;
            }
            
            tr:hover {
                background: #e3f2fd;
                transform: scale(1.01);
                transition: all 0.2s ease;
            }
            
            .amount-cell {
                font-weight: bold;
                color: #e74c3c;
            }
            
            .footer { background: #f9fafb; color: #6b7280; text-align: center; padding: 18px; margin-top: 30px; border-top:1px solid #e5e7eb; }
            
            @media print {
                body { 
                    background: white !important; 
                    padding: 0;
                }
                .container {
                    box-shadow: none;
                    border-radius: 0;
                }
                tr:hover {
                    transform: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="brand">
                  <div class="logo"><img src="${brand.logoUrl}" onerror="this.style.display='none'" /></div>
                  <div class="company">${brand.companyName}</div>
                </div>
                <div class="report-title">تقرير المصروفات<br/><small>${getPeriodText()}</small></div>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${formatCurrency(data.stats.total_amount)}</div>
                    <div class="stat-label">إجمالي المصروفات</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.details.length}</div>
                    <div class="stat-label">عدد المصروفات</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.stats.by_category.length}</div>
                    <div class="stat-label">عدد الفئات</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.stats.total_amount > 0 ? (data.stats.total_amount / data.details.length).toFixed(2) : '0.00'} د.ل</div>
                    <div class="stat-label">متوسط المصروف</div>
                </div>
            </div>
            
            <div class="content">
                <h2 class="section-title">التوزيع حسب الفئات</h2>
                <div class="category-grid">
                    ${data.stats.by_category.map(category => `
                        <div class="category-card">
                            <div class="category-name">${category.category}</div>
                            <div class="category-amount">${formatCurrency(category.amount)}</div>
                            <div class="category-count">${category.count} مصروف</div>
                        </div>
                    `).join('')}
                </div>
                
                <h2 class="section-title">تفاصيل المصروفات</h2>
                <table>
                    <thead>
                        <tr>
                            <th>التاريخ</th>
                            <th>الوصف</th>
                            <th>الفئة</th>
                            <th>المبلغ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.details.map(expense => `
                            <tr>
                                <td>${formatDate(expense.expense_date)}</td>
                                <td>${expense.description}</td>
                                <td>${expense.category}</td>
                                <td class="amount-cell">${formatCurrency(expense.amount)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="footer">تم إنشاء هذا التقرير في ${formatDate(new Date().toISOString().split('T')[0])} - ${brand.companyName}</div>
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

  reportWindow.document.write(htmlContent);
  reportWindow.document.close();
};
