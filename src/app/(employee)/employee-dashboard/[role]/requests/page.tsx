"use client"

import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function EmployeeJobRequestsPage() {
  const params = useParams();
  const role = params.role as string;

  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    const roleName = role === "driver" ? "Driver" : "Worker";
    setBreadcrumbItems([{ label: roleName, href: `/employee-dashboard/${role}` }, { label: "Job Requests" }]);
  }, [role, setBreadcrumbItems]);
  return <></>;
}
