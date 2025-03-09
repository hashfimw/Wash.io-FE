// types/overviewDashboard.ts
export interface DashboardData {
  outletsCount: number;
  newOutletsThisMonth: number;
  customersCount: number;
  newCustomersThisMonth: number;
  pendingOrdersCount: number;
  todayOrdersCount: number;
  outletName?: string; // Untuk outlet admin
  lastUpdated?: string; // Untuk tracking waktu pembaruan data
}
