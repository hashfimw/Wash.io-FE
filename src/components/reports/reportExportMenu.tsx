"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { ExportData, ExportConfig } from "@/utils/exportReport/types";
import { exportToExcel } from "@/utils/exportReport/excelExport";
import { exportToPDF } from "@/utils/exportReport/pdfExport";
import { toast } from "@/components/ui/use-toast";

interface ReportExportMenuProps {
  data: ExportData;
  config: ExportConfig;
  chartRef: React.RefObject<HTMLElement>;
  isDisabled?: boolean;
}

export function ReportExportMenu({
  data,
  config,
  chartRef,
  isDisabled = false,
}: ReportExportMenuProps) {
  // Check if data is empty
  const isDataEmpty = Object.keys(data).length === 0;

  const handleExportExcel = () => exportToExcel(data, config);

  const handleExportPDF = () => {
    if (chartRef.current) {
      exportToPDF(chartRef.current, data, config);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Chart element not found for PDF export.",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isDisabled || isDataEmpty}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Excel
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
