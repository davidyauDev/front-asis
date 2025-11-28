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

  const fetchEmployeesByDepartment = async (departmentId: number) => {
    try {
      const res = await $fetch<{
        data: Employee[];
      }>(
        `${biotimePrefix}/empleados-por-departamento?department_id=${departmentId}`,
        {
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

  return {
    fetchCompanies,
    fetchDepartments,
    fetchEmployeesByDepartment
  };
};

export const useAttendanceReport = createSharedComposable(_useAttendanceReport);
