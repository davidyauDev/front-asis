import { createSharedComposable } from "@vueuse/core";

const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;
const reportPrefix = `${apiBaseUrl}/api/reporte-asistencia`;

const biotimePrefix = `${apiBaseUrl}/api/biotime`;

// const getAuthToken = (): string | null => {
//   if (import.meta.client) {
//     return localStorage.getItem("auth_token");
//   }
//   return null;
// };

// const token = getAuthToken();

export interface Company {
  id: number;
  company_code: string;
  company_name: string;
}

export interface Department {
  id: number;
  dept_name: string;
  company_id: number;
}

export interface Employee {
  id: number;
  emp_code: string;
  first_name: string;
  last_name: string;
  department_id: number;
  company_id: number;
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

export interface TakenAttendace {
  Ubicacion: string;
  Imagen: string | null;
  map_url: string | null;
  DNI: string;
  Apellidos: string;
  Nombres: string;
  Empleado_id: number;
  Departamento: string;
  Departamento_id: number;
  Empresa: string;
  Empresa_id: number;
  Horario: string;
  Ingreso: string | null;
  Salida: string | null;
  Tardanza: number;
  Ausencia: number;
  Tecnico: boolean;
}

export type TakenAttendanceSummary = {
  asistencias: number;
  ausencias: number;
  tardanzas: number;
};

export type TakenAttendaceParams = {
  company_id?: number;
  departamento_ids?: number[];
  empleado_id?: number;
  fechas: Date[];
};

export type AttendanceParams = {
  fecha_inicio: string;
  fecha_fin?: string;
  empresa_ids: number[];
  departamento_ids: number[];
};

const token = useCookie<string | null>('auth_token')

const _useAttendanceReport = () => {
  const fetchCompanies = async (): Promise<Company[]> => {
    try {
      const res = await $fetch<{
        data: Company[];
      }>(`${biotimePrefix}/empresas`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
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
          Authorization: `Bearer ${token.value}`,
          Accept: "application/json",
        },
      });

      return res.data;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  };

  const fetchEmployeesByDepartment = async (departmentIds?: number[]) => {
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
            Authorization: `Bearer ${token.value}`,
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
    params: AttendanceParams,
    exportExcel: string | null = null
  ): Promise<{
    data: AttendanceSummary[];
    semanas: AttendaceWeeksDates;
  } | void> => {
    try {
      const res = await $fetch<
        | {
            data: AttendanceSummary[];
            semanas: AttendaceWeeksDates;
          }
        | Blob
      >(`${reportPrefix}/resumen`, {
        body: {
          ...params,
          fecha_inicio: params.fecha_inicio || new Date().toDateString(),
          export: exportExcel,
        },
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: "application/json",
        },
      });

      if (exportExcel) {
        const fieldName = `Reporte semanal ( Desde ${params.fecha_inicio} )`;
        descargarBlob(res as Blob, fieldName);
        return;
      }

      return res as {
        data: AttendanceSummary[];
        semanas: AttendaceWeeksDates;
      };
    } catch (error: any) {
      console.error({ error: error });
      throw error;
    }
  };

  const fetchAttendacesDetails = async (
    params: AttendanceParams,
    exportExcel: string | null = null
  ): Promise<AttendanceDetails[] | void> => {
    try {
      const res = await $fetch<AttendanceDetails[] | Blob>(
        `${reportPrefix}/detalle`,
        {
          body: {
            ...params,
            fecha_fin: params.fecha_fin || undefined,
            export: exportExcel,
          },
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.value}`,
            Accept: "application/json",
          },
        }
      );

      if (exportExcel) {
        const fieldName = params.fecha_fin
          ? `Reporte diario ( ${params.fecha_inicio} - ${params.fecha_fin} )`
          : `Reporte diario ( Desde ${params.fecha_inicio} )`;
        descargarBlob(res as Blob, fieldName);
        return;
      }

      return res as AttendanceDetails[];
    } catch (error) {
      console.error({ error });
      throw error;
    }
  };

  const fetchTakenAttandances = async (
    params: TakenAttendaceParams
  ): Promise<{
    data: TakenAttendace[];
    resumen: TakenAttendanceSummary;
  }> => {
    try {
      const res = await $fetch<{
        data: TakenAttendace[];
        resumen: TakenAttendanceSummary;
      }>(`${reportPrefix}/marcacion-simple`, {
        body: params,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: "application/json",
        },
      });

      return res;
    } catch (error) {
      console.error({ error });
      throw error;
    }
  };

  const fetchMonthlyAttendances = async (
    params: TakenAttendaceParams
  ): Promise<{
    data: TakenAttendace[];
    resumen: TakenAttendanceSummary;
  }> => {
    try {
      const res = await $fetch<{
        data: TakenAttendace[];
        resumen: TakenAttendanceSummary;
      }>(`${reportPrefix}/marcacion`, {
        body: params,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
          Accept: "application/json",
        },
      });

      return res;
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
    fetchTakenAttandances,
    fetchMonthlyAttendances,
  };
};

export const useAttendanceReport = createSharedComposable(_useAttendanceReport);

function descargarBlob(blob: Blob, fieldName: string) {
  // Crear un objeto URL para el blob
  const urlObjeto = window.URL.createObjectURL(blob);

  // Crear un elemento de anclaje
  const enlaceDescarga = document.createElement("a");
  enlaceDescarga.href = urlObjeto;
  enlaceDescarga.download = fieldName;

  // Añadir el enlace al cuerpo del documento y hacer clic en él
  document.body.appendChild(enlaceDescarga);
  enlaceDescarga.click();

  // Limpiar el objeto URL para liberar memoria
  document.body.removeChild(enlaceDescarga);
  window.URL.revokeObjectURL(urlObjeto);
}
