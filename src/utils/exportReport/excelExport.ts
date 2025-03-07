import * as XLSX from "xlsx";
import { toast } from "@/components/ui/use-toast";
import { ExportData, ExportConfig, prepareDataRows } from "./types";

/**
 * Exports data to Excel format
 */
export const exportToExcel = (data: ExportData, config: ExportConfig) => {
  try {
    // Create initial header rows with title and metadata
    const headerRows = [[config.title, ""]];

    if (config.period) headerRows.push(["Period", config.period]);
    if (config.startDate && config.endDate)
      headerRows.push(["Date Range", `${config.startDate} to ${config.endDate}`]);

    // Add any additional info
    if (config.additionalInfo) {
      Object.entries(config.additionalInfo).forEach(([key, value]) => {
        headerRows.push([key, value]);
      });
    }

    // Add empty row as separator and column headers
    headerRows.push([""]);
    headerRows.push(Object.values(config.columnMapping));

    // Create worksheet and add data
    const ws = XLSX.utils.aoa_to_sheet(headerRows);
    const dataRows = prepareDataRows(data, config);
    XLSX.utils.sheet_add_aoa(ws, dataRows, { origin: headerRows.length });

    // Set column widths
    const wscols = Object.keys(config.columnMapping).map((key) => ({
      wch: config.columnWidths?.[key] ? config.columnWidths[key] * 5 : 15,
    }));
    ws["!cols"] = wscols;

    // Create workbook, add worksheet and export
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, config.title);
    XLSX.writeFile(
      wb,
      `${config.title.toLowerCase().replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`
    );

    toast({
      title: "Success",
      description: "Excel file has been downloaded successfully!",
    });

    return true;
  } catch (error) {
    console.error("Error exporting Excel:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to export Excel file. Please try again.",
    });
    return false;
  }
};
