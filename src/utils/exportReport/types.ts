export type ExportData = {
  [key: string]: any;
};

export type ExportConfig = {
  title: string;
  period?: string;
  startDate?: string;
  endDate?: string;
  additionalInfo?: Record<string, string>;
  columnMapping: Record<string, string>;
  currencyColumns?: string[];
  columnWidths?: Record<string, number>;
};

// Helper function to format currency in IDR
export const formatToIDR = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

// Helper to truncate text with ellipsis
export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength - 3) + "...";
};

// Helper to prepare data rows for export
export const prepareDataRows = (data: ExportData, config: ExportConfig) => {
  return Object.entries(data).map(([key, value]) => {
    const rowValues = [];
    for (const dataKey of Object.keys(config.columnMapping)) {
      let cellValue;
      if (dataKey === "key") {
        cellValue = key;
      } else if (typeof value === "object" && value !== null) {
        cellValue = value[dataKey] || "";
      } else {
        cellValue = value || "";
      }

      // Format currency values if needed
      if (config.currencyColumns?.includes(dataKey)) {
        cellValue = formatToIDR(cellValue);
      }

      rowValues.push(cellValue);
    }
    return rowValues;
  });
};
