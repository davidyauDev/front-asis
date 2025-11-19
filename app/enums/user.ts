import type { RoleOption } from "~/types";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  TECHNICIAN = "TECHNICIAN",
}


export const roleOptions: Record<UserRole, RoleOption> = {
  SUPER_ADMIN: {
    label: "Super Administrador",
    value: UserRole.SUPER_ADMIN,
  },
  ADMIN: {
    label: "Administrador",
    value: UserRole.ADMIN,
  },
  TECHNICIAN: {
    label: "Técnico",
    value: UserRole.TECHNICIAN,
  },
};
