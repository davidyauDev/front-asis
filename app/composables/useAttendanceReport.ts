import { createSharedComposable } from "@vueuse/core";

const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;
const reportPrefix = `${apiBaseUrl}/api/reporte-asistencia`;

const biotimePrefix = `${apiBaseUrl}/api/biotime`;

const getAuthToken = (): string | null => {
  if (import.meta.client) {
    return localStorage.getItem("auth_token");
  }
  return null;
};

const token = getAuthToken();

//  {
//             "id": 2,
//             "company_code": "20330799073",
//             "company_name": "Cechriza SAC"
//         },
export interface Company {
  id: number;
  company_code: string;
  company_name: string;
}

export interface Department {
  id: number;
  dept_name: string;
}

export interface Employee {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string;
}

export interface AttendanceSummary {
  dni: string;
  apellidos: string;
  nombres: string;
  departamento: string;
  empresa: string;
  s1_tardanza: string | null;
  s1_trabajadas: string | null;
  s2_tardanza: string | null;
  s2_trabajadas: string | null;
  s3_tardanza: string | null;
  s3_trabajadas: string | null;
  s4_tardanza: string | null;
  s4_trabajadas: string | null;
}

export interface AttendaceWeeksDates {
  s1: {
    inicio: string;
    fin: string;
  };
  s2: {
    inicio: string;
    fin: string;
  };
  s3: {
    inicio: string;
    fin: string;
  };
  s4: {
    inicio: string;
    fin: string;
  };
}
export interface AttendanceDetails {
  dni: string;
  apellidos: string;
  nombres: string;
  departamento: string;
  empresa: string;
  fecha: string;
  h_ingreso: string;
  h_salida: string;
  m_ingreso: string;
  m_salida: string;
  tardanza: string;
  total_trabajado: string;
}

// export type AttendanceSummaryParams = {
//   empresa_id?: number;
//   departmento_id?: number;
//   fecha_inicio: string;
// };

export type AttendanceParams = {
  fecha_inicio: string;
  fecha_fin?: string;
  empresa_ids: number[];
  departamento_ids: number[];
};

const _useAttendanceReport = () => {
  const fetchCompanies = async (): Promise<Company[]> => {
    try {
      const res = await $fetch<{
        data: Company[];
      }>(`${biotimePrefix}/empresas`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      return res.data;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await $fetch<{
        data: Department[];
      }>(`${biotimePrefix}/departamentos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      return res.data;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  };

  const fetchEmployeesByDepartment = async (departmentIds: number[]) => {
    try {
      const res = await $fetch<{
        data: Employee[];
      }>(
        `${biotimePrefix}/empleados-por-departamento`,

        {
          method: "POST",
          body: {
            department_ids: departmentIds,
          },
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      return res.data;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  };

  const fetchAttendancesSummary = async (
    params: AttendanceParams
  ): Promise<{
    data: AttendanceSummary[];
    semanas: AttendaceWeeksDates;
  }> => {
    try {
      const res = await $fetch<{
        data: AttendanceSummary[];
        semanas: AttendaceWeeksDates;
      }>(`${reportPrefix}/resumen`, {
        body: {
          ...params,
          fecha_inicio: params.fecha_inicio || new Date().toDateString(),
        },
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      return res;
    } catch (error: any) {
      console.error({ error: error });
      throw error;
    }
  };

  const fetchAttendacesDetails = async (
    params: AttendanceParams
  ): Promise<any> => {
    try {
      const res = await $fetch<{
        data: AttendanceSummary[];
      }>(`${reportPrefix}/detalle`, {
        body: params,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      return res.data;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  };

  return {
    fetchCompanies,
    fetchDepartments,
    fetchEmployeesByDepartment,
    fetchAttendancesSummary,
    fetchAttendacesDetails,
  };
};

export const useAttendanceReport = createSharedComposable(_useAttendanceReport);
