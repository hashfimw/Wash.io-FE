import { Outlet } from "./outlet";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  OUTLET_ADMIN = "OUTLET_ADMIN",
  WORKER = "WORKER",
  DRIVER = "DRIVER",
}

export enum EmployeeWorkShift {
  MORNING = "MORNING",
  NOON = "NOON",
  NIGHT = "NIGHT",
}

export enum WorkerStation {
  WASHING = "WASHING",
  IRONING = "IRONING",
  PACKING = "PACKING",
}

export interface Employee {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  avatar: string;
  Employee: {
    id: number;
    workShift?: EmployeeWorkShift;
    station?: WorkerStation;
    outlet?: Outlet;
  };
}
export interface User {
  id: number;
  fullName: string | null;
  email: string;
  role: Role;
  Employee?: Employee;
}

export interface CreateEmployeeInput {
  fullName: string;
  email: string;
  password: string;
  role: Role;
  workShift?: EmployeeWorkShift;
  station?: WorkerStation;
  outletId?: number;
}

export interface UpdateEmployeeInput {
  fullName?: string;
  email?: string;
  workShift?: EmployeeWorkShift;
  station?: WorkerStation;
  outletId?: number;
}

export interface AssignEmployeeInput {
  id: number;
  outletId: number;
}

export interface ReassignEmployeesInput {
  assignments: AssignEmployeeInput[];
}

export type EmployeeSortField =
  | "fullName"
  | "email"
  | "role"
  | "outlet"
  | "workShift"
  | "station"
  | "employmentStatus";

export interface SortConfig {
  field: EmployeeSortField;
  direction: "asc" | "desc";
}
