import type { Severity } from "~/types";

type StatusOption = {
  label: string;
  value: number;
  color: Severity;
};

export const statusOptions: Record<number, StatusOption> = {
  1: {
    label: "Activo",
    value: 1,
    color: "success",
  },
  0: {
    label: "Inactivo",
    value: 0,
    color: "error",
  },
};
export const getEventoStatusOp = (status: number) => {
  console.log("Status recibido:", status);
  return (
    statusOptions[status] || {
      label: "Desconocido",
      value: status,
      color: "neutral",
    }
  );
};
