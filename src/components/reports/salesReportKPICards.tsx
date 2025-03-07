// src/components/reports/SalesReportKPICards.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ReportPeriod } from "@/types/reports";

interface SalesKPI {
  totalSales: number;
  avgSales: number;
  highestSales: {
    name: string;
    sales: number;
  };
}

interface SalesReportKPICardsProps {
  kpis: SalesKPI;
  formatCurrency: (value: number) => string;
  period: ReportPeriod;
}

export function SalesReportKPICards({ kpis, formatCurrency, period }: SalesReportKPICardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Sales</div>
          <div className="text-2xl font-bold">{formatCurrency(kpis.totalSales)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Average Sales</div>
          <div className="text-2xl font-bold">{formatCurrency(kpis.avgSales)}</div>
          <div className="text-xs text-gray-500 mt-1">
            per {period === "daily" ? "day" : period === "monthly" ? "month" : "year"}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Best Performance</div>
          <div className="text-2xl font-bold">{kpis.highestSales.name}</div>
          <div className="text-xs text-gray-500 mt-1">{formatCurrency(kpis.highestSales.sales)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
