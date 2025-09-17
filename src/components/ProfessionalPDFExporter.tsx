import jsPDF from "jspdf";
import "jspdf-autotable";

interface ProfessionalPDFOptions {
  title: string;
  subtitle?: string;
  data: any[];
  columns: Array<{
    key: string;
    label: string;
    width?: number;
    align?: "left" | "center" | "right";
  }>;
  summary?: Record<string, any>;
  charts?: Array<{
    type: string;
    title: string;
    data: any[];
  }>;
  analytics?: {
    trends: Record<string, number>;
    insights: string[];
  };
  fileName?: string;
  orientation?: "portrait" | "landscape";
  branding?: {
    logo?: string;
    companyName?: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

class ProfessionalPDFExporter {
  private doc: jsPDF;
  private currentY: number = 20;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly margin: number = 20;

  constructor(orientation: "portrait" | "landscape" = "portrait") {
    this.doc = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
    });

    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    
    this.setupArabicFont();
  }

  private setupArabicFont() {
    this.doc.setLanguage("ar");
    this.doc.setR2L(true);
  }

  public exportProfessionalReport(options: ProfessionalPDFOptions): void {
    const {
      title,
      subtitle,
      data,
      columns,
      summary,
      charts,
      analytics,
      fileName = "professional-report.pdf",
      branding,
    } = options;

    // Add header with branding
    this.addProfessionalHeader(title, subtitle, branding);

    // Add executive summary if provided
    if (summary) {
      this.addExecutiveSummary(summary);
    }

    // Add main data table
    this.addDataTable(data, columns);

    // Add analytics section if provided
    if (analytics) {
      this.addAnalyticsSection(analytics);
    }

    // Add charts section if provided
    if (charts) {
      this.addChartsSection(charts);
    }

    // Add professional footer
    this.addProfessionalFooter();

    // Add page numbers and watermark
    this.addPageNumbers();
    this.addWatermark();

    // Save the document
    this.doc.save(fileName);
  }

  private addProfessionalHeader(
    title: string,
    subtitle?: string,
    branding?: ProfessionalPDFOptions["branding"]
  ): void {
    // Add company branding if provided
    if (branding) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      if (branding.companyName) {
        this.doc.text(branding.companyName, this.pageWidth - this.margin, this.currentY, {
          align: "right",
        });
        this.currentY += 6;
      }

      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      if (branding.address) {
        this.doc.text(branding.address, this.pageWidth - this.margin, this.currentY, {
          align: "right",
        });
        this.currentY += 4;
      }
      if (branding.phone) {
        this.doc.text(branding.phone, this.pageWidth - this.margin, this.currentY, {
          align: "right",
        });
        this.currentY += 4;
      }
      if (branding.email) {
        this.doc.text(branding.email, this.pageWidth - this.margin, this.currentY, {
          align: "right",
        });
        this.currentY += 6;
      }
    }

    // Add decorative line
    this.doc.setDrawColor(41, 128, 185);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;

    // Add main title
    this.doc.setFontSize(20);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(41, 128, 185);
    this.doc.text(title, this.pageWidth / 2, this.currentY, { align: "center" });
    this.currentY += 10;

    // Add subtitle if provided
    if (subtitle) {
      this.doc.setFontSize(14);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(subtitle, this.pageWidth / 2, this.currentY, { align: "center" });
      this.currentY += 8;
    }

    // Add report date and time
    this.doc.setFontSize(10);
    this.doc.setTextColor(120, 120, 120);
    const currentDateTime = new Date().toLocaleString("en-US");
    this.doc.text(`تاريخ ووقت التقرير: ${currentDateTime}`, this.pageWidth / 2, this.currentY, {
      align: "center",
    });
    this.currentY += 15;

    // Reset text color
    this.doc.setTextColor(0, 0, 0);
  }

  private addExecutiveSummary(summary: Record<string, any>): void {
    this.checkPageBreak(40);

    // Section title
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(41, 128, 185);
    this.doc.text("الملخص التنفيذي", this.margin, this.currentY);
    this.currentY += 8;

    // Summary cards in a grid
    const cardWidth = (this.pageWidth - 2 * this.margin - 10) / 3;
    const cardHeight = 25;
    let cardX = this.margin;
    let cardCount = 0;

    Object.entries(summary).forEach(([key, value]) => {
      if (cardCount % 3 === 0 && cardCount > 0) {
        this.currentY += cardHeight + 5;
        cardX = this.margin;
      }

      // Draw card background
      this.doc.setFillColor(248, 249, 250);
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(cardX, this.currentY, cardWidth, cardHeight, "FD");

      // Add card content
      this.doc.setFontSize(8);
      this.doc.setFont("helvetica", "normal");
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(this.translateKey(key), cardX + cardWidth / 2, this.currentY + 8, {
        align: "center",
      });

      this.doc.setFontSize(16);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(41, 128, 185);
      const formattedValue = typeof value === "number" ? 
        value.toLocaleString("en-US") : String(value);
      this.doc.text(formattedValue, cardX + cardWidth / 2, this.currentY + 18, {
        align: "center",
      });

      cardX += cardWidth + 5;
      cardCount++;
    });

    this.currentY += cardHeight + 15;
    this.doc.setTextColor(0, 0, 0);
  }

  private addDataTable(data: any[], columns: ProfessionalPDFOptions["columns"]): void {
    this.checkPageBreak(50);

    // Section title
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(41, 128, 185);
    this.doc.text("البيانات التفصيلية", this.margin, this.currentY);
    this.currentY += 10;

    // Prepare table data
    const tableColumns = columns.map(col => col.label);
    const tableRows = data.map(item =>
      columns.map(col => this.formatCellValue(item[col.key]))
    );

    // Add table with professional styling
    (this.doc as any).autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: this.currentY,
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 4,
        overflow: "linebreak",
        halign: "center",
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: columns.reduce((acc, col, index) => {
        acc[index] = {
          halign: col.align || "center",
          cellWidth: col.width || "auto",
        };
        return acc;
      }, {} as any),
      margin: { top: this.currentY, right: this.margin, bottom: 20, left: this.margin },
      didDrawPage: (data: any) => {
        this.currentY = data.cursor.y;
      },
    });

    this.currentY += 10;
  }

  private addAnalyticsSection(analytics: ProfessionalPDFOptions["analytics"]): void {
    if (!analytics) return;

    this.checkPageBreak(60);

    // Section title
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(41, 128, 185);
    this.doc.text("التحليلات والرؤى", this.margin, this.currentY);
    this.currentY += 10;

    // Trends subsection
    if (analytics.trends && Object.keys(analytics.trends).length > 0) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(0, 0, 0);
      this.doc.text("الاتجاهات", this.margin, this.currentY);
      this.currentY += 8;

      Object.entries(analytics.trends).forEach(([key, value]) => {
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "normal");
        
        const trendText = `${this.translateKey(key)}: ${value}%`;
        const trendColor = value > 0 ? [34, 197, 94] : value < 0 ? [239, 68, 68] : [107, 114, 128];
        
        this.doc.setTextColor(...trendColor);
        this.doc.text(`• ${trendText}`, this.margin + 5, this.currentY);
        this.currentY += 6;
      });

      this.currentY += 5;
    }

    // Insights subsection
    if (analytics.insights && analytics.insights.length > 0) {
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(0, 0, 0);
      this.doc.text("الرؤى الرئيسية", this.margin, this.currentY);
      this.currentY += 8;

      analytics.insights.forEach(insight => {
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(60, 60, 60);
        
        const lines = this.doc.splitTextToSize(`• ${insight}`, this.pageWidth - 2 * this.margin - 10);
        this.doc.text(lines, this.margin + 5, this.currentY);
        this.currentY += lines.length * 5 + 2;
      });
    }

    this.currentY += 10;
  }

  private addChartsSection(charts: ProfessionalPDFOptions["charts"]): void {
    if (!charts || charts.length === 0) return;

    this.checkPageBreak(80);

    // Section title
    this.doc.setFontSize(14);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(41, 128, 185);
    this.doc.text("الرسوم البيانية والمخططات", this.margin, this.currentY);
    this.currentY += 10;

    charts.forEach((chart, index) => {
      this.checkPageBreak(60);

      // Chart title
      this.doc.setFontSize(12);
      this.doc.setFont("helvetica", "bold");
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(chart.title, this.margin, this.currentY);
      this.currentY += 8;

      // Chart placeholder (in a real implementation, you would generate actual charts)
      const chartWidth = this.pageWidth - 2 * this.margin;
      const chartHeight = 50;

      this.doc.setFillColor(248, 249, 250);
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(this.margin, this.currentY, chartWidth, chartHeight, "FD");

      // Chart type indicator
      this.doc.setFontSize(10);
      this.doc.setTextColor(120, 120, 120);
      this.doc.text(
        `مخطط ${chart.type} - ${chart.data.length} نقطة بيانات`,
        this.margin + chartWidth / 2,
        this.currentY + chartHeight / 2,
        { align: "center" }
      );

      this.currentY += chartHeight + 10;
    });
  }

  private addProfessionalFooter(): void {
    const footerY = this.pageHeight - 20;
    
    this.doc.setDrawColor(41, 128, 185);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);

    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(120, 120, 120);
    
    const footerText = "هذا التقرير تم إنشاؤه تلقائياً من نظام إدارة المقهى";
    this.doc.text(footerText, this.pageWidth / 2, footerY, { align: "center" });
  }

  private addPageNumbers(): void {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setTextColor(120, 120, 120);
      this.doc.text(
        `صفحة ${i} من ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: "right" }
      );
    }
  }

  private addWatermark(): void {
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(50);
      this.doc.setTextColor(240, 240, 240);
      this.doc.text(
        "مقهى",
        this.pageWidth / 2,
        this.pageHeight / 2,
        { align: "center", angle: 45 }
      );
    }
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private formatCellValue(value: any): string {
    if (value === null || value === undefined) {
      return "-";
    }

    if (typeof value === "number") {
      return value.toLocaleString("en-US");
    }

    if (value instanceof Date) {
      return value.toLocaleDateString("en-US");
    }

    return String(value);
  }

  private translateKey(key: string): string {
    const translations: Record<string, string> = {
      totalAttendance: "إجمالي الحضور",
      totalExpenses: "إجمالي المصروفات",
      totalRevenue: "إجمالي الإيرادات",
      uniqueEmployees: "عدد الموظفين",
      presentDays: "أيام الحضور",
      absentDays: "أيام الغياب",
      averageSales: "متوسط المبيعات",
      netProfit: "صافي الربح",
      revenueGrowth: "نمو الإيرادات",
      expenseIncrease: "زيادة المصروفات",
      attendanceRate: "معدل الحضور",
    };

    return translations[key] || key;
  }

  // Static method for quick professional export
  static exportProfessional(options: ProfessionalPDFOptions): void {
    const exporter = new ProfessionalPDFExporter(options.orientation);
    exporter.exportProfessionalReport(options);
  }
}

export default ProfessionalPDFExporter;
