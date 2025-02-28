"use client"

import { redirect, useParams } from "next/navigation";

export default function EmployeeDashboardPage() {
  const params = useParams();
  const role = params.role as string;
  redirect(`/employee-dashboard/${role}/attendances`);
}
