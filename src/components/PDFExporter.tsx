import jsPDF from "jspdf";
import "jspdf-autotable";

interface PDFExportOptions {
  title: string;
  data: any[];
  columns: string[];
  fileName?: string;
  orientation?: "portrait" | "landscape";
  includeDate?: boolean;
  includePageNumbers?: boolean;
  customFooter?: string;
}

class PDFExporter {
  private doc: jsPDF;

  constructor(orientation: "portrait" | "landscape" = "portrait") {
    this.doc = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });
    
    // Add Arabic font support
    this.setupArabicFont();
  }

  private setupArabicFont() {
    // Set text direction for Arabic
    this.doc.setLanguage("ar");
    this.doc.setR2L(true);
  }

  public exportData(options: PDFExportOptions): void {
    const {
      title,
      data,
      columns,
      fileName = "report.pdf",
      includeDate = true,
      includePageNumbers = true,
      customFooter,
    } = options;

    // Add title
    this.doc.setFontSize(18);
    this.doc.setFont("helvetica", "bold");
    this.doc.text(title, this.doc.internal.pageSize.width / 2, 20, {
      align: "center",
    });

    // Add date if requested
    if (includeDate) {
      this.doc.setFontSize(10);
      this.doc.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString("en-US");
      this.doc.text(`تاريخ التقرير: ${currentDate}`, 20, 30);
    }

    // Prepare table data
    const tableRows = data.map((item) =>
      columns.map((col) => this.formatCellValue(item[col]))
    );

    // Add table
    (this.doc as any).autoTable({
      head: [columns],
      body: tableRows,
      startY: includeDate ? 40 : 30,
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 3,
        overflow: "linebreak",
        halign: "center",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { halign: "right" },
      },
      margin: { top: 30, right: 20, bottom: 20, left: 20 },
    });

    // Add page numbers if requested
    if (includePageNumbers) {
      this.addPageNumbers();
    }

    // Add custom footer if provided
    if (customFooter) {
      this.addFooter(customFooter);
    }

    // Save the PDF
    this.doc.save(fileName);
  }

  public exportAttendanceReport(attendanceData: any[]): void {
    const columns = [
      "اسم الموظف",
      "التاريخ",
      "وقت الدخول",
      "وقت الخروج",
      "الحالة",
      "الراتب المكتسب",
    ];

    this.exportData({
      title: "تقرير الحضور والانصراف",
      data: attendanceData,
      columns,
      fileName: "attendance-report.pdf",
    });
  }

  public exportExpensesReport(expensesData: any[]): void {
    const columns = [
      "العنوان",
      "المبلغ",
      "التاريخ",
      "الفئة",
      "الوصف",
    ];

    this.exportData({
      title: "تقرير المصروفات",
      data: expensesData,
      columns,
      fileName: "expenses-report.pdf",
    });
  }

  public exportSalesReport(salesData: any[]): void {
    const columns = [
      "التاريخ",
      "مبيعات الشاشة",
      "النقد",
      "البطاقة المصرفية",
      "تداول",
      "بريستو",
      "الإجمالي",
    ];

    this.exportData({
      title: "تقرير المبيعات",
      data: salesData,
      columns,
      fileName: "sales-report.pdf",
      orientation: "landscape",
    });
  }

  public exportCustomReport(
    title: string,
    data: any[],
    columns: string[],
    fileName?: string
  ): void {
    this.exportData({
      title,
      data,
      columns,
      fileName: fileName || "custom-report.pdf",
    });
  }

  private formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return "-";
    }

    if (typeof value === "number") {
      return value.toFixed(2);
    }

    if (value instanceof Date) {
      return value.toLocaleDateString("en-US");
    }

    return String(value);
  }

  private addPageNumbers(): void {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.text(
        `صفحة ${i} من ${pageCount}`,
        this.doc.internal.pageSize.width - 20,
        this.doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }
  }

  private addFooter(footerText: string): void {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.text(
        footerText,
        this.doc.internal.pageSize.width / 2,
        this.doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
  }

  // Static methods for quick exports
  static exportAttendance(data: any[]): void {
    const exporter = new PDFExporter();
    exporter.exportAttendanceReport(data);
  }

  static exportExpenses(data: any[]): void {
    const exporter = new PDFExporter();
    exporter.exportExpensesReport(data);
  }

  static exportSales(data: any[]): void {
    const exporter = new PDFExporter("landscape");
    exporter.exportSalesReport(data);
  }

  static exportCustom(
    title: string,
    data: any[],
    columns: string[],
    fileName?: string
  ): void {
    const exporter = new PDFExporter();
    exporter.exportCustomReport(title, data, columns, fileName);
  }
}

export default PDFExporter;
