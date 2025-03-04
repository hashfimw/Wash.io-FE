"use client";

import { useParams } from "next/navigation";
import { AttendancesList } from "./AttendancesList";

export default function AttendancesPage() {
  const params = useParams();
  const role = params.role as string;

  const admin = !!(role === "super-admin" || role === "outlet-admin");
  return (
    <div className={`mx-auto p-3 space-y-6 ${!admin && "max-w-screen-lg"}`}>
      {admin && (
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Attendances History</h1>
          <p className="text-muted-foreground">View list of employees' attendances history</p>
        </div>
      )}
      <AttendancesList />
    </div>
  );
}
