"use client";

import DriverWorkerList from "@/components/driverWorker/DriverWorkerList";
import { useBreadcrumb } from "@/context/BreadcrumbContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EmployeeJobHistoryPage() {
  const params = useParams();
  const role = params.role as string;
  const [endPoint, setEndPoint] = useState<"transport-jobs" | "laundry-jobs">();

  useEffect(() => {
    const endPoint = role === "driver" ? "transport-jobs" : "laundry-jobs";
    setEndPoint(endPoint);
  }, []);

  const { setBreadcrumbItems } = useBreadcrumb();

  useEffect(() => {
    const roleName = role === "driver" ? "Driver" : "Worker";
    setBreadcrumbItems([{ label: roleName, href: `/employee-dashboard/${role}` }, { label: "Job History" }]);
  }, [role, setBreadcrumbItems]);

  if (!endPoint) {
    return <>Invalid role!</>;
  }

  return (
    <>
      <DriverWorkerList requestType="history" endPoint={endPoint} />
    </>
  );
}
