"use client";

import { useParams } from "next/navigation";
import { AttendancesList } from "./AttendancesList";

export default function AttendancesPage() {
  const params = useParams();
  const role = params.role as string;

  return (
    <div className={`mx-auto p-3 space-y-6 ${role === "driver" || role === "worker" ? "max-w-screen-lg" : ""}`}>
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">Attendances History</h1>
        <p className="text-muted-foreground">View list of {role === "driver" || role === "worker" ? "your" : "employees'"} attendances history</p>
      </div>
      <AttendancesList />
    </div>
  );
}
