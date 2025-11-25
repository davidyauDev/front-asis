import type { RoleOption, Severity } from "~/types";

// export enum UserRole {
//   SUPER_ADMIN = "SUPER_ADMIN",
//   ADMIN = "ADMIN",
//   TECHNICIAN = "TECHNICIAN",
// }

export enum AttendanceType {
  CHECK_IN = "check_in",
  CHECK_OUT = "check_out",
}


export type AttendanceOption = {
  label: string;
  value: AttendanceType;
  color: Severity;
};

export const attendanceOptions: Record<AttendanceType, AttendanceOption> = {
  [AttendanceType.CHECK_IN]: {
    label: "Entrada",
    value: AttendanceType.CHECK_IN,
    color: "success",
  },
  [AttendanceType.CHECK_OUT]: {
    label: "Salida",
    value: AttendanceType.CHECK_OUT,
    color: "error",
  },
};


export const getAttendanceOp = (type: AttendanceType) => {
  return attendanceOptions[type] || { label: 'Desconocido', value: type, color: 'neutral' }
}