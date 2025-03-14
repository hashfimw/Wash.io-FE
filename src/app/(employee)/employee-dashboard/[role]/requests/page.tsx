"use client";

import DriverWorkerList from "@/components/driverWorker/DriverWorkerList";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployeeJobRequestsPage() {
  const params = useParams();
  const role = params.role as string;
  const [endPoint, setEndPoint] = useState<"transport-jobs" | "laundry-jobs">();

  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    const endPoint = role === "driver" ? "transport-jobs" : "laundry-jobs";
    setEndPoint(endPoint);
  }, [role]);

  useEffect(() => {
    const roleName = role === "driver" ? "Driver" : "Worker";
    setBreadcrumbItems([{ label: roleName, href: `/employee-dashboard/${role}` }, { label: "Job Requests" }]);
  }, [role, setBreadcrumbItems]);

  if (!endPoint) {
    return <>Invalid role!</>;
  }

  return (
    <>
      <DriverWorkerList requestType="request" endPoint={endPoint} />
    </>
  );
}
