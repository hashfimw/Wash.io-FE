// src/utils/exports/pdfExport.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "@/components/ui/use-toast";
import { ExportData, ExportConfig, prepareDataRows, truncateText } from "./types";

/**
 * Exports chart and data to PDF format
 */
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

    // Setup document with header information
    const setupDocument = (yStartPosition = 15) => {
      let yPos = yStartPosition;

      // Add title
      pdf.setFontSize(16);
      pdf.text(config.title, 105, yPos, { align: "center" });
      yPos += 10;

      // Add metadata
      pdf.setFontSize(10);

      if (config.period) {
        pdf.text(`Period: ${config.period}`, 20, yPos);
        yPos += 5;
      }

      if (config.startDate && config.endDate) {
        pdf.text(`Date Range: ${config.startDate} to ${config.endDate}`, 20, yPos);
        yPos += 5;
      }

      // Add additional info
      if (config.additionalInfo) {
        Object.entries(config.additionalInfo).forEach(([key, value]) => {
          pdf.text(`${key}: ${value}`, 20, yPos);
          yPos += 5;
        });
      }

      return yPos;
    };

    // Initial document setup
    let yPosition = setupDocument();

    // Capture and add chart
    const chartCanvas = await html2canvas(chartElement, {
      scale: 2,
      logging: false,
      useCORS: true,
    });

    const chartImgData = chartCanvas.toDataURL("image/png");
    pdf.addImage(chartImgData, "PNG", 15, yPosition, 180, 100);
    yPosition += 110;

    // Add data table heading
    pdf.setFontSize(12);
    pdf.text("Data", 105, yPosition, { align: "center" });
    yPosition += 10;

    // Setup table with column headers
    const columnHeaders = Object.values(config.columnMapping);
    pdf.setFontSize(10);

    // Calculate column widths - either custom or equal
    const pageWidth = 190;
    const margins = 20;
    const tableWidth = pageWidth - margins * 2;

    let colWidths: number[] = [];
    const columnKeys = Object.keys(config.columnMapping);

    if (config.columnWidths) {
      // Calculate total ratio sum
      const totalRatio = Object.values(config.columnWidths).reduce((sum, ratio) => sum + ratio, 0);

      // Calculate each column width based on its ratio
      colWidths = columnKeys.map((key) => {
        const ratio = config.columnWidths?.[key] || 1;
        return (tableWidth * ratio) / totalRatio;
      });
    } else {
      // Equal widths if no custom widths provided
      const colWidth = tableWidth / columnKeys.length;
      colWidths = columnKeys.map(() => colWidth);
    }

    // Draw table headers
    let xPosition = margins;
    columnHeaders.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });

    // Draw header separation line
    yPosition += 2;
    pdf.line(margins, yPosition, pageWidth - margins, yPosition);
    yPosition += 7;

    // Draw table rows with pagination
    const dataEntries = Object.entries(data);
    const maxRowsPerPage = 20;
    let rowCount = 0;

    const dataRows = prepareDataRows(data, config);

    dataRows.forEach((rowValues) => {
      // Add new page if needed
      if (rowCount >= maxRowsPerPage) {
        pdf.addPage();
        yPosition = setupDocument(15) + 5;

        // Re-add table headers on new page
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

      // Draw row values
      xPosition = margins;
      rowValues.forEach((cellValue, cellIndex) => {
        const displayValue = truncateText(cellValue.toString(), Math.floor(colWidths[cellIndex] / 2));
        pdf.text(displayValue, xPosition, yPosition);
        xPosition += colWidths[cellIndex];
      });

      yPosition += 7;
      rowCount++;
    });

    // Add note about data truncation if needed
    if (dataEntries.length > maxRowsPerPage) {
      pdf.setFontSize(8);
      pdf.text(`Showing all ${dataEntries.length} entries across pages`, 20, 285);
    }

    // Save the PDF file
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
