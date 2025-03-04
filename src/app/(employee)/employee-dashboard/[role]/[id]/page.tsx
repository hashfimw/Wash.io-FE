"use client";

import JobDetails from "@/components/driverWorker/JobDetails";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function JobPage() {
  const params = useParams();
  const role = params.role as string;
  const id = params.id as string;
  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    const roleName = role === "driver" ? "Driver" : "Worker";
    setBreadcrumbItems([
      { label: roleName, href: `/employee-dashboard/${role}` },
      { label: `${role === "driver" ? "Transport Job" : "Laundry Job"} #${id}` },
    ]);
  }, [role, setBreadcrumbItems, id]);

  return (
    <>
      <JobDetails role={role as "driver" | "worker"} id={id} />
    </>
  );
}
