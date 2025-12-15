import type { Severity } from "~/types";

interface MovilityReportBase {
  employee: {
    id: number;
    dni: string;
    first_name: string;
    last_name: string;
    position_id: number;
    position_name: string;
  };
  summary: {
    total_days: number;
    vacation_days: number;
    medical_leave_days: number;
    no_mark_days: number;
    days_with_mobility: number;
    mobility_amount_per_day: number;
    total_mobility_to_pay: number;
  };
  
}
export type MovilityReport = MovilityReportBase & {
  [key: string]: {
    // date: string;
    code: MovilityReportCode;
    mobility_counted: boolean;
  };
};
// export interface MovilityReport {
//   employee: {
//     id: number;
//     dni: string;
//     name: string;
//     position_id: number;
//     position_name: string;
//   };
//   summary: {
//     total_days: number;
//     vacation_days: number;
//     medical_leave_days: number;
//     no_mark_days: number;
//     days_with_mobility: number;
//     mobility_amount_per_day: number;
//     total_mobility_to_pay: number;
//   };
// debug_details: {
//   date: string;
//   code: string;
//   mobility_counted: boolean;
// }[];
// }

export enum MovilityReportCode {
   ONE = "1",
  SR = "SR",
  DM = "DM",
  V = "V",
  X = "X",
  LSGH = "LSGH",
  LSLH = "LSLH",
  NM = "NM",
}

type MovilityReportCodeOp = {
  label: string;
  value: MovilityReportCode;
  severity: Severity | undefined;
  bg: string;
  
};
export const movilityReportCodeOp: Record<
  MovilityReportCode,
  MovilityReportCodeOp
> = {
  [MovilityReportCode.ONE]: {
    label: "Asistencia",
    value: MovilityReportCode.ONE,
    severity: "success",
    bg: "bg-green-500 dark:text-white",
    
  },
  [MovilityReportCode.SR]: {
    label: "Sin Ruta",
    value: MovilityReportCode.SR,
    severity: "info",
    bg: "bg-blue-500 dark:text-white",
   
  },
  [MovilityReportCode.DM]: {
    label: "Descanso Médico",
    value: MovilityReportCode.DM,
    severity: "error",
    bg: "bg-red-500 dark:text-white",
    
  },
  [MovilityReportCode.V]: {
    label: "Vacaciones",
    value: MovilityReportCode.V,
    severity: "warning",
    bg: "bg-yellow-500 dark:text-white",
    
  },
  [MovilityReportCode.X]: {
    label: "Cese",
    value: MovilityReportCode.X,
    severity: undefined,
    bg: "bg-gray-700 dark:text-white",
    
  },
  [MovilityReportCode.LSGH]: {
    label: "LSGH",
    value: MovilityReportCode.LSGH,
    severity: "neutral",
    bg: "bg-gray-500 dark:text-white",
  
  },
  [MovilityReportCode.LSLH]: {
    label: "LSLH",
    value: MovilityReportCode.LSLH,
    severity: "primary",
    bg: "bg-purple-500 dark:text-white",
 
  },
  [MovilityReportCode.NM]: {
    label: "No Marcó",
    value: MovilityReportCode.NM,
    severity: "secondary",
    bg: "bg-pink-500 dark:text-white",

  },
};


export const getCodeOp = (key?: MovilityReportCode) =>{
    return key ? movilityReportCodeOp[key] :  {
        label: "Desconocido",
        value: '-' as MovilityReportCode,
        severity: "default" as Severity,
        bg: "transparent text-gray-700",
       
    }
}
