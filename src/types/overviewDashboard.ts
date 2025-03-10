export interface DashboardData {
  outletsCount: number;
  newOutletsThisMonth: number;
  customersCount: number;
  newCustomersThisMonth: number;
  pendingOrdersCount: number;
  todayOrdersCount: number;
  outletName?: string;
  lastUpdated?: string;
}
