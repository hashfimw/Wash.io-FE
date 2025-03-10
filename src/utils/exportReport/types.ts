export type ExportData = {
  [key: string]: Record<string, string | number | boolean> | string | number | boolean;
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

export const formatToIDR = (value: number | string): string => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (!text) return "";
  return text.length <= maxLength ? text : text.substring(0, maxLength - 3) + "...";
};

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

      if (config.currencyColumns?.includes(dataKey)) {
        if (typeof cellValue === "string" || typeof cellValue === "number") {
          cellValue = formatToIDR(cellValue);
        }
      }

      rowValues.push(cellValue);
    }
    return rowValues;
  });
};
