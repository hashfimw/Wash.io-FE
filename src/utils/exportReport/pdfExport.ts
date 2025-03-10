import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/components/ui/use-toast";
import { ExportData, ExportConfig, prepareDataRows, truncateText } from "./types";

export const exportToPDF = async (chartElement: HTMLElement, data: ExportData, config: ExportConfig) => {
  if (!chartElement) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Chart element not found for PDF export.",
    });
    return false;
  }

  toast({
    title: "Processing",
    description: "Generating PDF, please wait...",
  });

  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    const setupDocument = (yStartPosition = 15) => {
      let yPos = yStartPosition;
      pdf.setFontSize(16);
      pdf.text(config.title, 105, yPos, { align: "center" });
      yPos += 10;
      pdf.setFontSize(10);

      if (config.period) {
        pdf.text(`Period: ${config.period}`, 20, yPos);
        yPos += 5;
      }

      if (config.startDate && config.endDate) {
        pdf.text(`Date Range: ${config.startDate} to ${config.endDate}`, 20, yPos);
        yPos += 5;
      }

      if (config.additionalInfo) {
        Object.entries(config.additionalInfo).forEach(([key, value]) => {
          pdf.text(`${key}: ${value}`, 20, yPos);
          yPos += 5;
        });
      }

      return yPos;
    };

    let yPosition = setupDocument();

    const chartCanvas = await html2canvas(chartElement, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const chartImgData = chartCanvas.toDataURL("image/png");
    pdf.addImage(chartImgData, "PNG", 15, yPosition, 180, 100);
    yPosition += 110;
    pdf.setFontSize(12);
    pdf.text("Data", 105, yPosition, { align: "center" });
    yPosition += 10;

    const columnHeaders = Object.values(config.columnMapping);
    pdf.setFontSize(10);

    const pageWidth = 190;
    const margins = 20;
    const tableWidth = pageWidth - margins * 2;

    let colWidths: number[] = [];
    const columnKeys = Object.keys(config.columnMapping);

    if (config.columnWidths) {
      const totalRatio = Object.values(config.columnWidths).reduce((sum, ratio) => sum + ratio, 0);

      colWidths = columnKeys.map((key) => {
        const ratio = config.columnWidths?.[key] || 1;
        return (tableWidth * ratio) / totalRatio;
      });
    } else {
      const colWidth = tableWidth / columnKeys.length;
      colWidths = columnKeys.map(() => colWidth);
    }

    let xPosition = margins;
    columnHeaders.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });

    yPosition += 2;
    pdf.line(margins, yPosition, pageWidth - margins, yPosition);
    yPosition += 7;

    const dataEntries = Object.entries(data);
    const maxRowsPerPage = 20;
    let rowCount = 0;

    const dataRows = prepareDataRows(data, config);

    dataRows.forEach((rowValues) => {
      if (rowCount >= maxRowsPerPage) {
        pdf.addPage();
        yPosition = setupDocument(15) + 5;
        xPosition = margins;
        columnHeaders.forEach((header, index) => {
          pdf.text(header, xPosition, yPosition);
          xPosition += colWidths[index];
        });

        yPosition += 2;
        pdf.line(margins, yPosition, pageWidth - margins, yPosition);
        yPosition += 7;

        rowCount = 0;
      }

      xPosition = margins;
      rowValues.forEach((cellValue, cellIndex) => {
        const displayValue = truncateText(cellValue.toString(), Math.floor(colWidths[cellIndex] / 2));
        pdf.text(displayValue, xPosition, yPosition);
        xPosition += colWidths[cellIndex];
      });

      yPosition += 7;
      rowCount++;
    });

    if (dataEntries.length > maxRowsPerPage) {
      pdf.setFontSize(8);
      pdf.text(`Showing all ${dataEntries.length} entries across pages`, 20, 285);
    }

    pdf.save(
      `${config.title.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`
    );

    toast({
      title: "Success",
      description: "PDF has been downloaded successfully!",
    });

    return true;
  } catch (error) {
    console.error("Error exporting PDF:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to export PDF. Please try again.",
    });
    return false;
  }
};
