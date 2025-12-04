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
} = useAttendanceReport();

export const useAttendanceReportStore = defineStore("attendance-report", {
  state: () => ({
    company: {
      list: [] as Company[],
      dailySelecteds: [] as Company[],
      techMonthlySelecteds: [] as Company[],
      allMonthlySelecteds: [] as Company[],
      loading: false,
      isError: false,

      daily: {
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
      dailySelecteds: [] as Department[],
      techMonthlySelecteds: [] as Department[],
      allMonthlySelecteds: [] as Department[],

      loadingEmployees: false,
      employees: [] as Employee[],
      isEmployeeError: false,

      current: undefined as Department | undefined,
    },

    employee: {
      department: {
        selecteds: [] as Employee[],
        list: [] as Employee[],
        loading: false,
        isError: false,
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
        departamento_ids: [8],
        fecha_inicio: formatToYMD(),
        fecha_fin: formatToYMD(undefined, true),
      } as AttendanceParams,

      taken: {
        daily: {
          loading: false,
          globalFilter: "",
          params: {} as TakenAttendaceParams,
          list: [] as TakenAttendace[],
          summary: {
            asistencias: 0,
            ausencias: 0,
            tardanzas: 0,
          } as TakenAttendanceSummary,
          isError: false,
        },
        tech: {
          loading: false,
          params: {} as TakenAttendaceParams,
          list: [] as TakenAttendace[],
          isError: false,
        },
        all: {
          loading: false,
          params: {} as TakenAttendaceParams,
          list: [] as TakenAttendace[],
          isError: false,
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
      try {
        const companies = await fetchCompanies();
        this.company.list = companies;

        this.company.isError = false;
      } catch (error) {
        this.company.isError = true;
      } finally {
        this.company.loading = false;
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
      try {
        const deportments = await fetchDepartments();
        this.department.list = deportments;

        this.department.isError = false;
      } catch (error) {
        this.department.isError = true;
      } finally {
        this.department.loading = false;
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
        this.attendance.taken.tech.list = attendances.data;
        this.attendance.taken.all.list = attendances.data;

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
  },
});
