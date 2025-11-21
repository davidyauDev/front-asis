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
    color: 'error',
  },
  ADMIN: {
    label: "Administrador",
    value: UserRole.ADMIN,
    color: 'warning',
  },
  TECHNICIAN: {
    label: "Técnico",
    value: UserRole.TECHNICIAN,
    color: 'success',
  },
};
export const getRoleOp = (role: UserRole) => {
  return roleOptions[role] || { label: 'Sin rol', value: role, color: 'neutral' }
}

