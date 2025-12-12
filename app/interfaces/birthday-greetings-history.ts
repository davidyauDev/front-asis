import type { Severity } from "~/types";

export interface BirthdayGreetingsHistory {
  id: number;
  employee_id: number;
  sent_at: string;
  status: BirthdayGreetingsStatus;
  first_name: string;
  last_name: string;
  birthday: string;
  email: string;
  error_message?: string;
}

export enum BirthdayGreetingsStatus {
  SENT = "sent",
  FAILED = "failed",
}

type BirthdayGreetingsOp = {
  label: string;
  value: BirthdayGreetingsStatus;
  severity: Severity;
};

export const birthdayGreetingsStatusOp: Record<
  BirthdayGreetingsStatus,
  BirthdayGreetingsOp
> = {
  [BirthdayGreetingsStatus.SENT]: {
    label: "Enviado",
    value: BirthdayGreetingsStatus.SENT,
    severity: "success",
  },
  [BirthdayGreetingsStatus.FAILED]: {
    label: "Fallido",
    value: BirthdayGreetingsStatus.FAILED,
    severity: "error",
  },
};
