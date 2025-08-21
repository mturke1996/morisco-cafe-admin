import { brand } from "@/lib/brand";
import { supabase } from "@/integrations/supabase/client";

interface AttendanceRecord {
  date: string;
  status: string;
  daily_wage_earned?: number | null;
  check_in?: string | null;
  check_out?: string | null;
  employee_name?: string | null;
  employees?: { name?: string | null } | null;
}

interface AttendanceReportData {
  data: AttendanceRecord[];
  config: {
    startDate: string;
    endDate: string;
    dateRange: string;
  };
}

export const generateAttendanceReportPDF = ({
  data,
  config,
}: AttendanceReportData) => {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const filteredData = data.filter((record) => {
    const recordDate = new Date(record.date);
    const start = new Date(config.startDate);
    const end = new Date(config.endDate);
    return recordDate >= start && recordDate <= end;
  });

  const totalDays = filteredData.length;
  const presentDays = filteredData.filter((r) => r.status === "present").length;
  const absentDays = filteredData.filter((r) => r.status === "absent").length;
  const totalWages = filteredData.reduce(
    (sum, r) => sum + (r.daily_wage_earned || 0),
    0
  );

  const startIso = config.startDate;
  const endIso = config.endDate;
  supabase
    .from("employee_withdrawals")
    .select("amount, withdrawal_date")
    .gte("withdrawal_date", startIso)
    .lte("withdrawal_date", endIso)
    .then(({ data: wd }) => {
      const withdrawalsByDate: Record<string, number> = {};
      const totalWithdrawals =
        wd?.reduce((acc: number, w: any) => {
          const key = String(w.withdrawal_date).split("T")[0];
          const amt = Number(w.amount || 0);
          withdrawalsByDate[key] = (withdrawalsByDate[key] || 0) + amt;
          return acc + amt;
        }, 0) || 0;

      const currency = (n: number) => `${n.toFixed(2)} د.ل`;
      const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>تقرير الحضور والانصراف</title>
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;900&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Cairo',sans-serif; background:#f3f4f6; color:#1f2937; padding:24px; }

        .wrap { max-width:1100px; margin:auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 10px 35px rgba(0,0,0,0.08); }

        .header { background:linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor}); color:#fff; padding:28px; display:flex; align-items:center; justify-content:space-between; }
        .brand { display:flex; align-items:center; gap:14px; }
        .logo { width:52px; height:52px; border-radius:12px; background:rgba(255,255,255,0.18); display:grid; place-items:center; overflow:hidden; border:1px solid rgba(255,255,255,0.25); }
        .logo img { width:100%; height:100%; object-fit:cover; }
        .company { font-size:20px; font-weight:900; letter-spacing:-0.5px; }
        .title { font-size:20px; font-weight:700; text-align:right; line-height:1.4; }

        .body { padding:28px; }

        .cards { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:22px; }
        .card { background:#fff; border:1px solid #e5e7eb; border-radius:14px; padding:18px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.05); }
        .card h3 { font-size:24px; font-weight:900; color:${brand.primaryColor}; margin-bottom:8px; }
        .card p { font-size:13px; color:#6b7280; font-weight:500; }

        table { width:100%; border-collapse:collapse; margin-top:20px; border-radius:12px; overflow:hidden; box-shadow:0 1px 4px rgba(0,0,0,0.05); }
        thead th { background:#f1f5f9; padding:12px; font-size:14px; font-weight:700; color:#374151; text-align:center; border-bottom:2px solid #e5e7eb; }
        tbody td { padding:12px; font-size:13px; border-bottom:1px solid #e5e7eb; text-align:center; }
        tbody tr:nth-child(even){ background:#f9fafb; }

        .summary { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:24px; }
        .sum { background:#fff; border:1px solid #e5e7eb; border-top:4px solid ${brand.accentColor}; border-radius:14px; padding:18px; text-align:center; box-shadow:0 2px 6px rgba(0,0,0,0.05); }
        .sum .label { font-size:12px; color:#6b7280; margin-bottom:6px; font-weight:500; }
        .sum .value { font-size:18px; font-weight:900; color:#111827; }

        .footer { margin-top:28px; background:#f9fafb; padding:14px; border-top:1px solid #e5e7eb; text-align:center; font-size:12px; color:#6b7280; }

        @media print {
          body { background:#fff; padding:0; }
          .wrap { box-shadow:none; border-radius:0; }
        }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header">
          <div class="brand">
            <div class="logo"><img src="${brand.logoUrl}" onerror="this.style.display='none'"/></div>
            <div class="company">${brand.companyName}</div>
          </div>
          <div class="title">تقرير الحضور والانصراف<br/><small style="font-weight:400;font-size:14px;opacity:.9">${new Date(config.startDate).toLocaleDateString("en-GB")} - ${new Date(config.endDate).toLocaleDateString("en-GB")}</small></div>
        </div>

        <div class="body">
          <div class="cards">
            <div class="card"><h3>${totalDays}</h3><p>إجمالي الأيام</p></div>
            <div class="card"><h3>${presentDays}</h3><p>أيام الحضور</p></div>
            <div class="card"><h3>${absentDays}</h3><p>أيام الغياب</p></div>
            <div class="card"><h3>${currency(totalWages)}</h3><p>إجمالي اليوميات</p></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>اسم الموظف</th>
                <th>وقت الدخول</th>
                <th>وقت الخروج</th>
                <th>الحالة</th>
                <th>السحب</th>
                <th>اليومية</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.map((record) => {
                const key = new Date(record.date).toISOString().split("T")[0];
                const d = new Date(record.date).toLocaleDateString("en-GB");
                const inT = record.check_in ? new Date(record.check_in).toLocaleTimeString("ar-LY") : "-";
                const outT = record.check_out ? new Date(record.check_out).toLocaleTimeString("ar-LY") : "-";
                const name = record.employee_name || record.employees?.name || "غير محدد";
                const wd = withdrawalsByDate[key] || 0;
                const wage = Number(record.daily_wage_earned || 0);
                const status = record.status === "present" ? "✅ حاضر" : "❌ غائب";
                return `<tr><td>${d}</td><td>${name}</td><td>${inT}</td><td>${outT}</td><td>${status}</td><td>${currency(wd)}</td><td>${currency(wage)}</td></tr>`;
              }).join("")}
            </tbody>
          </table>

          <div class="summary">
            <div class="sum"><div class="label">إجمالي اليوميات</div><div class="value">${currency(totalWages)}</div></div>
            <div class="sum"><div class="label">إجمالي السحب</div><div class="value">${currency(totalWithdrawals)}</div></div>
            <div class="sum"><div class="label">الصافي</div><div class="value">${currency(totalWages - totalWithdrawals)}</div></div>
          </div>

          <div class="footer">تم إنشاء هذا التقرير في ${new Date().toLocaleDateString("en-GB")} - ${brand.companyName}</div>
        </div>
      </div>
      <script>window.onload=function(){setTimeout(()=>{window.print();window.close();},300);}</script>
    </body>
    </html>`;
      
      printWindow.document.write(html);
      printWindow.document.close();
    });
};
