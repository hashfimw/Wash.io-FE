"use client";

import AttendancesList from "@/components/attendances/AttendancesList";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function AdminAttendancesPage() {
  const params = useParams();
  const role = params.role as string;

  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    const roleName = role === "super-admin" ? "Super Admin" : "Outlet Admin";
    setBreadcrumbItems([{ label: roleName, href: `/dashboard/${role}` }, { label: "Attendances" }]);
  }, [role, setBreadcrumbItems]);
  return (
    <>
      <AttendancesList />
    </>
  );
}
