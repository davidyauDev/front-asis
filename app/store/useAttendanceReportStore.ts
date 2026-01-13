import { startOfDay, startOfMonth } from 'date-fns';
import {
  useAttendanceReport,
  type AttendanceParams,
  type AttendanceDetails,
  type AttendanceSummary,
  type Company,
  type Department,
  type Employee,
  type AttendaceWeeksDates,
  type TakenAttendace,
  type TakenAttendaceParams,
} from "~/composables/useAttendanceReport";

export interface Week {
  id: number;
  label: string;
  color: string;
}

export enum ReportType {
  WEEKLY = "WEEKLY",
  DAYLY = "DAYLY",
}

export enum ItemType {
  TODAY = "TODAY",
  TECHNICIANS = "TECHNICIANS",
  ADMINISTRATORS = "ADMINISTRATORS",
}

export enum EmployeeType {
  TECHNICIANS = "TECHNICIANS",
  ALL = "ALL",
}

const {
  fetchCompanies,
  fetchDepartments,
  fetchEmployeesByDepartment,
  fetchAttendancesSummary,
  fetchAttendacesDetails,
  fetchTakenAttandances,
  fetchMonthlyAttendances,
} = useAttendanceReport();

export const useAttendanceReportStore = defineStore("attendance-report", {
  state: () => ({
    company: {
      list: [] as Company[],
      loading: false,
      isError: false,

      daily: {
        loading: false,
        isError: false,
        selecteds: [] as Company[],
        list: [] as Company[],
      },

      tech: {
        loading: false,
        isError: false,
        selecteds: [] as Company[],
        list: [] as Company[],
      },

      all: {
        loading: false,
        isError: false,
        selecteds: [] as Company[],
        list: [] as Company[],
      },
    },

    department: {
      list: [] as Department[],
      loading: false,
      isError: false,
      // dailySelecteds: [] as Department[],
      // techMonthlySelecteds: [] as Department[],
      // allMonthlySelecteds: [] as Department[],

      loadingEmployees: false,
      employees: [] as Employee[],
      isEmployeeError: false,

      current: undefined as Department | undefined,

      daily: {
        loading: false,
        isError: false,
        selecteds: [] as Department[],
        list: [] as Department[],
      },

      tech: {
        loading: false,
        isError: false,
        selecteds: [] as Department[],
        list: [] as Department[],
      },

      all: {
        loading: false,
        isError: false,
        selecteds: [] as Department[],
        list: [] as Department[],
      },
    },

    employee: {
      list: [] as Employee[],
      loading: false,
      isError: false,

      department: {
        selecteds: [] as Employee[],
        list: [] as Employee[],
        loading: false,
        isError: false,
      },

      daily: {
        loading: false,
        isError: false,
        selecteds: [] as Employee[],
        list: [] as Employee[],
      },

      tech: {
        loading: false,
        isError: false,
        selecteds: [] as Employee[],
        list: [] as Employee[],
      },

      all: {
        loading: false,
        isError: false,
        selecteds: [] as Employee[],
        list: [] as Employee[],
      },
    },

    week: {
      selecteds: [] as Week[],
    },

    attendance: {
      type: ReportType.WEEKLY,
      globalFilter: "",

      params: {
        empresa_ids: [1, 2],
        departamento_ids: [],
        empleado_ids: [] as number[],
        fecha_inicio: formatToYMD(),
        fecha_fin: formatToYMD(undefined, true),
      } as AttendanceParams,

      taken: {
        daily: {
          loading: false,
          globalFilter: "",
          params: {} as TakenAttendaceParams,
          list: [] as TakenAttendace[],
          pagination: {
            pageIndex: 0,
            pageSize: 10,
          },
          summary: {
            asistencias: 0,
            ausencias: 0,
            tardanzas: 0,
          } as TakenAttendanceSummary,
          isError: false,
        },
        tech: {
          loading: false,
          globalFilter: "",
          params: {
            fechas: [startOfDay(new Date())],
          } as TakenAttendaceParams,
          list: [] as TakenAttendace[],
          listFiltered: [] as TakenAttendace[],
          isError: false,
          pagination: {
            pageIndex: 0,
            pageSize: 10,
          },
        },
        all: {
          loading: false,
          globalFilter: "",
          params: {
            fechas: [startOfDay(new Date())],
          } as TakenAttendaceParams,
          list: [] as TakenAttendace[],
          listFiltered: [] as TakenAttendace[],
          isError: false,
          pagination: {
            pageIndex: 0,
            pageSize: 10,
          },
        },
      },

      summary: {
        weeks: {} as AttendaceWeeksDates,
        list: [] as AttendanceSummary[],
        loading: false,
        isError: false,
      },

      details: {
        list: [] as AttendanceDetails[],
        loading: false,
        isError: false,
      },
    },

    // ...
  }),

  actions: {
    async getCompanies(force = false) {
      if (this.company.list.length && !force) return;
      this.company.loading = true;
      this.company.daily.loading = true;
      this.company.tech.loading = true;
      this.company.all.loading = true;
      try {
        const companies = await fetchCompanies();
        this.company.list = companies;
        this.company.daily.list = companies;
        this.company.tech.list = companies;
        this.company.all.list = companies;

        this.company.isError = false;
        this.company.daily.isError = false;
        this.company.tech.isError = false;
        this.company.all.isError = false;
      } catch (error) {
        this.company.isError = true;
        this.company.daily.isError = true;
        this.company.tech.isError = true;
        this.company.all.isError = true;
      } finally {
        this.company.loading = false;
        this.company.daily.loading = false;
        this.company.tech.loading = false;
        this.company.all.loading = false;
      }
    },

    async getDailyCompanies(force = false) {
      if (this.company.daily.list.length && !force) return;
      this.company.daily.loading = true;
      try {
        const companies = await fetchCompanies();
        this.company.daily.list = companies;

        this.company.daily.isError = false;
      } catch (error) {
        this.company.daily.isError = true;
      } finally {
        this.company.daily.loading = false;
      }
    },

    async getDepartments(force = false) {
      if (this.department.list.length && !force) return;
      this.department.loading = true;
      this.department.daily.loading = true;
      this.department.tech.loading = true;
      this.department.all.loading = true;
      try {
        const departments = await fetchDepartments();
        this.department.list = departments;
        this.department.daily.list = departments;
        this.department.tech.list = departments;
        this.department.all.list = departments;

        this.department.isError = false;
        this.department.daily.isError = false;
        this.department.tech.isError = false;
        this.department.all.isError = false;
      } catch (error) {
        this.department.isError = true;
        this.department.daily.isError = true;
        this.department.tech.isError = true;
        this.department.all.isError = true;
      } finally {
        this.department.loading = false;
        this.department.daily.loading = false;
        this.department.tech.loading = false;
        this.department.all.loading = false;
      }
    },

    async getEmployees() {
      if (this.employee.list.length) return;

      this.employee.loading = true;
      this.employee.daily.loading = true;
      this.employee.tech.loading = true;
      this.employee.all.loading = true;
      try {
        const employees = await fetchEmployeesByDepartment();
        this.employee.list = employees;
        this.employee.daily.list = employees;
        this.employee.tech.list = employees;
        this.employee.all.list = employees;

        this.employee.isError = false;
        this.employee.daily.isError = false;
        this.employee.tech.isError = false;
        this.employee.all.isError = false;
      } catch (error) {
        this.employee.isError = true;
        this.employee.daily.isError = true;
        this.employee.tech.isError = true;
        this.employee.all.isError = true;
      } finally {
        this.employee.loading = false;
        this.employee.daily.loading = false;
        this.employee.tech.loading = false;
        this.employee.all.loading = false;
      }
    },

    async getEmployeesByDepartment() {
      this.employee.department.loading = true;
      try {
        const employees = await fetchEmployeesByDepartment(
          this.attendance.params.departamento_ids
        );
        this.employee.department.list = employees;

        this.employee.department.isError = false;
      } catch (error) {
        this.employee.department.isError = true;
      } finally {
        this.employee.department.loading = false;
      }
    },

    async getAttendanceSummary() {
      this.attendance.summary.loading = true;
      try {
        const attendances = await fetchAttendancesSummary(
          this.attendance.params
        );
        this.attendance.summary.list = attendances!.data;
        this.attendance.summary.weeks = attendances!.semanas;

        this.attendance.summary.isError = false;
      } catch (error) {
        this.attendance.summary.isError = true;
      } finally {
        this.attendance.summary.loading = false;
      }
    },

    async getAttendanceDetails() {
      this.attendance.details.loading = true;

      try {
        const attendances = await fetchAttendacesDetails(
          this.attendance.params
        );
        this.attendance.details.list = attendances!;

        this.attendance.details.isError = false;
      } catch (error) {
        this.attendance.details.isError = true;
      } finally {
        this.attendance.details.loading = false;
      }
    },

    async getTakenAttendances() {
      if (
        this.attendance.taken.daily.list.length ||
        this.attendance.taken.tech.list.length ||
        this.attendance.taken.all.list.length
      )
        return;

      this.attendance.taken.daily.loading = true;
      this.attendance.taken.tech.loading = true;
      this.attendance.taken.all.loading = true;

      try {
        const attendances = await fetchTakenAttandances(
          this.attendance.taken.daily.params
        );

    
        this.attendance.taken.daily.list = attendances.data;
        this.attendance.taken.daily.summary = attendances.resumen;
        this.attendance.taken.tech.list = attendances.data.filter((att) => att.Tecnico);
        this.attendance.taken.tech.listFiltered = attendances.data.filter((att) => att.Tecnico);

        this.attendance.taken.all.list = attendances.data;
        this.attendance.taken.all.listFiltered = attendances.data;

        this.attendance.taken.daily.isError = false;
        this.attendance.taken.tech.isError = false;
        this.attendance.taken.all.isError = false;
      } catch (error) {
        this.attendance.taken.daily.isError = true;
        this.attendance.taken.tech.isError = true;
        this.attendance.taken.all.isError = true;
      } finally {
        this.attendance.taken.daily.loading = false;
        this.attendance.taken.tech.loading = false;
        this.attendance.taken.all.loading = false;
      }
    },

    async getDailyTakenAttendances() {
      this.attendance.taken.daily.loading = true;

      try {
        const attendances = await fetchTakenAttandances(
          this.attendance.taken.daily.params
        );
        this.attendance.taken.daily.list = attendances.data;
        this.attendance.taken.daily.summary = attendances.resumen;

        this.attendance.taken.daily.isError = false;
      } catch (error) {
        this.attendance.taken.daily.isError = true;
      } finally {
        this.attendance.taken.daily.loading = false;
      }
    },

    async getTechTakenAttendances() {
      this.attendance.taken.tech.loading = true;
      this.attendance.taken.tech.isError = false;

      try {
        const attendances = await fetchMonthlyAttendances(
          this.attendance.taken.tech.params
        );
        this.attendance.taken.tech.listFiltered = attendances.data.filter((att) => att.Tecnico);

        this.attendance.taken.tech.isError = false;
      } catch (error) {
        this.attendance.taken.tech.isError = true;
      } finally {
        this.attendance.taken.tech.loading = false;
      }
    },

    async getAllTakenAttendances() {
      this.attendance.taken.all.loading = true;

      try {
        const attendances = await fetchMonthlyAttendances(
          this.attendance.taken.all.params
        );
        this.attendance.taken.all.list = attendances.data;
         this.attendance.taken.all.listFiltered = attendances.data;
        // this.attendance.taken.all.summary = attendances.resumen;

        this.attendance.taken.all.isError = false;
      } catch (error) {
        this.attendance.taken.all.isError = true;
      } finally {
        this.attendance.taken.all.loading = false;
      }
    },
  },
});
