import {
  useAttendanceReport,
  type AttendanceParams,
  type AttendanceDetails,
  type AttendanceSummary,
  type Company,
  type Department,
  type Employee,
  type AttendaceWeeksDates,
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

export enum EmployeeType {
  TECHNICIANS = 'TECHNICIANS',
  ADMINISTRATORS = 'ADMINISTRATORS'
}

const {
  fetchCompanies,
  fetchDepartments,
  fetchEmployeesByDepartment,
  fetchAttendancesSummary,
  fetchAttendacesDetails,
} = useAttendanceReport();

export const useAttendanceReportStore = defineStore("attendance-report", {
  state: () => ({
    company: {
      list: [] as Company[],
      loading: false,
      isError: false,
    },

    department: {
      list: [] as Department[],
      loading: false,
      isError: false,

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

    async getAttendanceDetails(exportExcel = null) {
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
  },
});
