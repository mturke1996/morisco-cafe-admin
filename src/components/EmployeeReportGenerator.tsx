import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, FileText, Download, Printer, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import cafeLogo from "@/assets/cafe-logo.png";

interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
}

interface EmployeeReportGeneratorProps {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}

interface AttendanceRecord {
  date: string;
  check_in: string | null;
  check_out: string | null;
  daily_wage: number;
  withdrawal_amount: number;
  bonus: number;
  deduction: number;
}

export const EmployeeReportGenerator = ({
  employee,
  isOpen,
  onClose,
}: EmployeeReportGeneratorProps) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<AttendanceRecord[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [reportNumber, setReportNumber] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // توليد رقم تقرير عشوائي عند فتح المودال
  const generateReportNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `RPT-${timestamp}-${random}`;
  };

  // توليد رقم التقرير عند فتح المودال
  useEffect(() => {
    if (isOpen) {
      setReportNumber(generateReportNumber());
    }
  }, [isOpen]);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد تاريخ البداية والنهاية",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // جلب سجلات الحضور
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("*")
        .eq("employee_id", employee.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (attendanceError) throw attendanceError;

      // جلب السحوبات
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from("employee_withdrawals")
        .select("*")
        .eq("employee_id", employee.id)
        .gte("withdrawal_date", startDate)
        .lte("withdrawal_date", endDate);

      if (withdrawalsError) throw withdrawalsError;

      // جلب بروفايل الموظف للحصول على اليومية
      const { data: profileData, error: profileError } = await supabase
        .from("employee_profiles")
        .select("daily_wage")
        .eq("employee_id", employee.id)
        .single();

      if (profileError && profileError.code !== "PGRST116") throw profileError;

      const dailyWage = profileData?.daily_wage || employee.salary / 30;

      // تجميع البيانات
      const records: AttendanceRecord[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const attendance = attendanceData?.find((a) => a.date === dateStr);
        const withdrawal = withdrawalsData?.find(
          (w) => w.withdrawal_date === dateStr
        );

        records.push({
          date: dateStr,
          check_in: attendance?.check_in || null,
          check_out: attendance?.check_out || null,
          daily_wage: attendance ? dailyWage : 0,
          withdrawal_amount: withdrawal?.amount || 0,
          bonus: 0, // سيتم إضافته لاحقاً
          deduction: 0, // سيتم إضافته لاحقاً
        });
      }

      setReportData(records);
      setShowReport(true);
    } catch (error) {
      console.error("Error generating report:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء التقرير",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generateReportHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const downloadPDF = async () => {
    setPdfLoading(true);
    try {
      // إنشاء عنصر مؤقت للتقرير
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = generateReportHTML();
      tempDiv.style.position = "absolute";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.width = "600px"; // تعديل العرض ليتناسب مع A4
      tempDiv.style.backgroundColor = "#ffffff";
      tempDiv.style.fontFamily = "Cairo, sans-serif";
      tempDiv.style.padding = "20px";
      tempDiv.style.boxSizing = "border-box";
      tempDiv.style.direction = "rtl";
      tempDiv.style.textAlign = "right";
      document.body.appendChild(tempDiv);

      // انتظار تحميل الصور
      const images = tempDiv.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) => {
          return new Promise((resolve) => {
            if (img.complete) {
              resolve(null);
            } else {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null);
            }
          });
        })
      );

      // تحويل HTML إلى canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // جودة عالية
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: 600, // تعديل العرض ليتناسب مع A4
        height: tempDiv.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // إصلاح اتجاه النص في النسخة المستنسخة
          const clonedBody = clonedDoc.body;
          clonedBody.style.direction = "rtl";
          clonedBody.style.textAlign = "right";
        },
      });

      // إزالة العنصر المؤقت
      document.body.removeChild(tempDiv);

      // إنشاء PDF
      const imgData = canvas.toDataURL("image/png", 1.0); // جودة عالية
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // عرض A4
      const pageHeight = 295; // ارتفاع A4
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // إضافة الصفحة الأولى
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // إضافة صفحات إضافية إذا لزم الأمر
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // إضافة معلومات الملف
      pdf.setProperties({
        title: `تقرير الموظف - ${employee.name}`,
        subject: `تقرير الحضور والسحوبات من ${startDate} إلى ${endDate}`,
        author: "نظام موريسكو كافيه",
        creator: "نظام موريسكو كافيه",
      });

      // حفظ الملف
      const fileName = `تقرير_${employee.name}_${startDate}_${endDate}.pdf`;
      pdf.save(fileName);

      toast({
        title: "تم التصدير بنجاح",
        description: `تم حفظ التقرير باسم: ${fileName}`,
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إنشاء PDF",
        variant: "destructive",
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const generateReportHTML = () => {
    const totalDays = reportData.filter(
      (r) => r.check_in || r.check_out
    ).length;
    const totalEarned = reportData.reduce((sum, r) => sum + r.daily_wage, 0);
    const totalWithdrawals = reportData.reduce(
      (sum, r) => sum + r.withdrawal_amount,
      0
    );
    const totalBonus = reportData.reduce((sum, r) => sum + r.bonus, 0);
    const totalDeduction = reportData.reduce((sum, r) => sum + r.deduction, 0);
    const netAmount =
      totalEarned + totalBonus - totalDeduction - totalWithdrawals;

    return `
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>تقرير الموظف - ${employee.name}</title>
          <style>
            @import url("https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap");

            body {
              font-family: "Cairo", sans-serif;
              background-color: #f0f2f5;
              padding: 40px;
              color: #333;
              position: relative;
            }

                         .watermark {
               position: absolute;
               top: 50%;
               left: 50%;
               transform: translate(-50%, -50%);
               opacity: 0.12;
               z-index: 0;
               filter: drop-shadow(0 4px 8px rgba(0, 98, 65, 0.2));
             }

                                                   .watermark img {
                max-width: 400px;
                border-radius: 15px;
              }

                                                    .invoice-container {
                position: relative;
                z-index: 1;
                max-width: 600px;
                margin: 0 auto;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 98, 65, 0.1);
                padding: 25px;
                border: 1px solid #e9ecef;
              }

                                                   .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding-bottom: 20px;
                border-bottom: 2px solid #006241;
                margin-bottom: 20px;
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 3px 10px rgba(0, 98, 65, 0.08);
              }

            .logo-box {
              display: flex;
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }

            .logo-box1 {
              display: flex;
              justify-content: flex-start;
            }

            .logo-box img {
              max-width: 120px;
            }

                         .logo-text {
               font-size: 28px;
               font-weight: 700;
               color: #006241;
               margin-top: 15px;
             }

            .logo-subinfo {
              font-size: 14px;
              color: #6c757d;
              line-height: 1.6;
            }

            .header-info {
              text-align: left;
            }

                                                   .header-info h1 {
                font-size: 24px;
                color: #212529;
                margin: 0 0 8px 0;
                font-weight: 700;
              }

            .bill-meta {
              font-size: 14px;
              color: #495057;
            }

            .bill-meta p {
              margin: 4px 0;
            }

                                                   .bill-info {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
                font-size: 14px;
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                padding: 18px;
                border-radius: 10px;
                border: 1px solid #e9ecef;
                box-shadow: 0 3px 10px rgba(0, 98, 65, 0.05);
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

                         .invoice-table th,
             .invoice-table td {
               padding: 12px 8px;
               text-align: center;
               border: none;
             }

                         .invoice-table thead th {
               background: linear-gradient(135deg, #006241 0%, #008f5a 100%);
               color: #ffffff;
               font-weight: 700;
               font-size: 16px;
               text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
             }

            .invoice-table tbody tr {
              border-bottom: 1px solid #e9ecef;
            }

            .invoice-table tbody tr:last-child {
              border-bottom: none;
            }

                         .invoice-table tbody td {
               background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
               font-size: 16px;
               color: #495057;
               transition: all 0.3s ease;
             }

             .invoice-table tbody tr:hover td {
               background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
               transform: translateY(-2px);
               box-shadow: 0 4px 12px rgba(0, 98, 65, 0.1);
             }

            .summary-section {
              display: flex;
              justify-content: flex-end;
              margin-top: 40px;
            }

                                                   .summary-box {
                width: 300px;
                background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                border: 1px solid #006241;
                border-radius: 10px;
                padding: 18px;
                box-shadow: 0 5px 15px rgba(0, 98, 65, 0.08);
              }

            .summary-box .row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #e9ecef;
            }

                         .summary-box .row:last-child {
               border-bottom: none;
               font-size: 22px;
               font-weight: 700;
               color: #006241;
               background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
               padding: 15px;
               border-radius: 10px;
               margin-top: 10px;
               text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
             }

            .summary-box .row span {
              font-size: 16px;
              color: #495057;
            }

                                                   .footer {
                text-align: center;
                margin-top: 25px;
                padding: 20px;
                border-top: 1px solid #006241;
                background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
                border-radius: 10px;
                box-shadow: 0 3px 10px rgba(0, 98, 65, 0.08);
              }

            .footer p {
              font-size: 14px;
              color: #6c757d;
            }

                         @media print {
               body { padding: 0; }
               .invoice-container { box-shadow: none; }
             }

             /* تحسينات للهاتف */
             @media (max-width: 768px) {
               body {
                 padding: 10px;
               }
               
               .invoice-container {
                 padding: 20px;
                 margin: 0;
                 border-radius: 10px;
               }
               
               .header {
                 flex-direction: column;
                 gap: 20px;
                 text-align: center;
               }
               
               .logo-box {
                 align-items: center;
               }
               
               .logo-box1 {
                 flex-direction: column;
                 align-items: center;
                 gap: 10px;
               }
               
               .logo-text {
                 font-size: 28px;
                 margin-top: 10px;
               }
               
               .header-info h1 {
                 font-size: 28px;
                 text-align: center;
               }
               
               .bill-info {
                 flex-direction: column;
                 gap: 15px;
               }
               
               .bill-info .section {
                 width: 100%;
               }
               
               .invoice-table {
                 font-size: 12px;
               }
               
               .invoice-table th,
               .invoice-table td {
                 padding: 8px 4px;
               }
               
               .summary-section {
                 justify-content: center;
               }
               
               .summary-box {
                 width: 100%;
                 max-width: 350px;
               }
               
               .watermark img {
                 max-width: 300px;
               }
             }

             @media (max-width: 480px) {
               .invoice-table {
                 font-size: 10px;
               }
               
               .invoice-table th,
               .invoice-table td {
                 padding: 6px 2px;
               }
               
               .logo-text {
                 font-size: 24px;
               }
               
               .header-info h1 {
                 font-size: 24px;
               }
               
               .summary-box .row {
                 font-size: 14px;
               }
               
               .summary-box .row:last-child {
                 font-size: 18px;
               }
             }
          </style>
        </head>
        <body>
                                                                                                                                                                               <div class="watermark">
                                 <img src="${cafeLogo}" alt="Watermark Logo" />
              </div>

          <div class="invoice-container">
            <div class="header">
                             <div class="logo-box">
                 <div class="logo-box1">
                                                                                                                       <img src="${cafeLogo}" alt="Moresque Cafe Logo" />
                   <div class="logo-text">موريسكو كافيه</div>
                 </div>
                <div class="logo-subinfo">
                  تاجوراء - طرابلس، ليبيا<br />
                  0910929091<br />
                  Mohturke96@gmail.com
                </div>
              </div>

                             <div class="header-info">
                 <h1>تقرير موظف</h1>
                <div class="bill-meta">
                  <p><strong>اسم الموظف:</strong> ${employee.name}</p>
                  <p><strong>المنصب:</strong> ${employee.position}</p>
                                     <p><strong>من تاريخ:</strong> ${startDate}</p>
                   <p><strong>إلى تاريخ:</strong> ${endDate}</p>
                   <p><strong>تاريخ التقرير:</strong> ${
                     new Date().toISOString().split("T")[0]
                   }</p>
                   <p><strong>رقم التقرير:</strong> ${reportNumber}</p>
                </div>
              </div>
            </div>

            <div class="bill-info">
              <div class="section">
                <p><span>الموظف:</span> ${employee.name}</p>
                <p><span>المنصب:</span> ${employee.position}</p>
              </div>
                             <div class="section">
                                  <p><span>الفترة:</span> من ${startDate} إلى ${endDate}</p>
                 <p><span>رقم التقرير:</span> ${reportNumber}</p>
               </div>
            </div>

                         <div style="text-align: center; margin-bottom: 20px;">
               <h2 style="color: #006241; font-size: 24px; font-weight: 700; margin: 0;">تقرير الحضور والسحوبات</h2>
             </div>
             <table class="invoice-table">
               <thead>
                 <tr>
                   <th>م</th>
                   <th>التاريخ</th>
                   <th>الحضور</th>
                   <th>اليومية</th>
                   <th>السحب</th>
                   <th>إضافي</th>
                   <th>خصم</th>
                 </tr>
               </thead>
              <tbody>
                                 ${reportData
                                   .map((record, index) => {
                                     const isPresent =
                                       record.check_in || record.check_out;
                                     const attendanceStatus = isPresent
                                       ? "حاضر"
                                       : "غائب";
                                     const attendanceColor = isPresent
                                       ? "#28a745"
                                       : "#dc3545";
                                     const rowNumber = index + 1;

                                     return `
                     <tr>
                       <td>${rowNumber}</td>
                       <td>${record.date}</td>
                       <td style="color: ${attendanceColor}; font-weight: bold;">${attendanceStatus}</td>
                       <td>${
                         isPresent ? record.daily_wage.toFixed(2) : "0.00"
                       } د.ل</td>
                       <td>${record.withdrawal_amount.toFixed(2)} د.ل</td>
                       <td>${record.bonus.toFixed(2)} د.ل</td>
                       <td>${record.deduction.toFixed(2)} د.ل</td>
                     </tr>
                   `;
                                   })
                                   .join("")}
              </tbody>
            </table>

                         <div class="summary-section">
                              <div class="summary-box">
                 <div style="text-align: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #006241;">
                   <h2 style="color: #006241; font-size: 24px; font-weight: 700; margin: 0;">ملخص التقرير المالي</h2>
                 </div>
                 <div class="row">
                   <span>إجمالي أيام العمل:</span>
                   <span>${totalDays} يوم</span>
                 </div>
                <div class="row">
                  <span>إجمالي المكتسب:</span>
                  <span>${totalEarned.toFixed(2)} د.ل</span>
                </div>
                <div class="row">
                  <span>إجمالي الإضافي:</span>
                  <span>${totalBonus.toFixed(2)} د.ل</span>
                </div>
                <div class="row">
                  <span>إجمالي الخصم:</span>
                  <span>${totalDeduction.toFixed(2)} د.ل</span>
                </div>
                <div class="row">
                  <span>إجمالي السحوبات:</span>
                  <span>${totalWithdrawals.toFixed(2)} د.ل</span>
                </div>
                <div class="row">
                  <span>الصافي:</span>
                  <span>${netAmount.toFixed(2)} د.ل</span>
                </div>
              </div>
            </div>

                         <div class="footer">
               <p style="font-size: 18px; font-weight: 600; color: #006241;">تم إنشاء هذا التقرير تلقائياً من نظام موريسكو كافيه</p>
               <p style="font-size: 14px; color: #6c757d; margin-top: 10px;">رقم التقرير: ${reportNumber}</p>
             </div>
          </div>
        </body>
      </html>
    `;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                  إنشاء تقرير الموظف
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm">
                  تقرير مفصل عن الحضور والسحوبات والإضافي
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 p-2"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>

        {!showReport ? (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Employee Info */}
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-emerald-800 text-base sm:text-lg font-bold">
                  معلومات الموظف
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label className="text-sm font-medium text-emerald-700 mb-2 block">
                      الاسم
                    </Label>
                    <div className="text-emerald-900 font-medium text-lg">
                      {employee.name}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-emerald-700 mb-2 block">
                      المنصب
                    </Label>
                    <div className="text-emerald-900 font-medium text-lg">
                      {employee.position}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-emerald-700 mb-2 block">
                      الراتب الشهري
                    </Label>
                    <div className="text-emerald-900 font-medium text-lg">
                      {employee.salary} د.ل
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date Selection */}
            <Card className="border border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-slate-800 text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  تحديد الفترة الزمنية
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      من تاريخ
                    </Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg px-4 py-3 text-slate-700 placeholder-slate-400 transition-all duration-200 hover:border-slate-400"
                        placeholder="اختر تاريخ البداية"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <Calendar className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700 mb-2 block">
                      إلى تاريخ
                    </Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border border-slate-300 focus:border-emerald-500 focus:ring-emerald-500 rounded-lg px-4 py-3 text-slate-700 placeholder-slate-400 transition-all duration-200 hover:border-slate-400"
                        placeholder="اختر تاريخ النهاية"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <Calendar className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Date Selection */}
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <Label className="text-sm font-medium text-slate-600 mb-3 block">
                    اختيار سريع:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const weekAgo = new Date(
                          today.getTime() - 7 * 24 * 60 * 60 * 1000
                        );
                        setStartDate(weekAgo.toISOString().split("T")[0]);
                        setEndDate(today.toISOString().split("T")[0]);
                      }}
                      className="text-xs border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                    >
                      آخر أسبوع
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        const monthAgo = new Date(
                          today.getTime() - 30 * 24 * 60 * 60 * 1000
                        );
                        setStartDate(monthAgo.toISOString().split("T")[0]);
                        setEndDate(today.toISOString().split("T")[0]);
                      }}
                      className="text-xs border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                    >
                      آخر شهر
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const today = new Date();
                        setStartDate(today.toISOString().split("T")[0]);
                        setEndDate(today.toISOString().split("T")[0]);
                      }}
                      className="text-xs border-slate-300 text-slate-600 hover:bg-slate-50 hover:border-slate-400"
                    >
                      اليوم
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="flex justify-center sm:justify-end">
              <Button
                onClick={generateReport}
                disabled={loading || !startDate || !endDate}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                    جاري إنشاء التقرير...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 ml-2" />
                    إنشاء التقرير
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6">
            {/* Report Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Button
                variant="outline"
                onClick={() => setShowReport(false)}
                className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <Calendar className="w-4 h-4 ml-2" />
                تغيير التاريخ
              </Button>
              <Button
                variant="outline"
                onClick={printReport}
                className="border-2 border-orange-600 text-orange-700 hover:bg-orange-50 font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <Printer className="w-4 h-4 ml-2" />
                طباعة
              </Button>
              <Button
                onClick={downloadPDF}
                disabled={pdfLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                {pdfLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                    جاري إنشاء PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 ml-2" />
                    تصدير PDF
                  </>
                )}
              </Button>
            </div>

            {/* Report Preview */}
            <div className="border-2 border-emerald-200 rounded-xl p-4 sm:p-6 bg-gradient-to-br from-white to-emerald-50 shadow-lg">
              <div
                ref={reportRef}
                className="prose max-w-none overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: generateReportHTML() }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeReportGenerator;
