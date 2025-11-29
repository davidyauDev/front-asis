import {
  useAttendanceReport,
  type Company,
  type Department,
  type Employee,
} from "~/composables/useAttendanceReport";

export interface Week {
  id: number,
  label: string,
  color: string,
}

const { fetchCompanies, fetchDepartments, fetchEmployeesByDepartment } =
  useAttendanceReport();

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
      selecteds: [] as Week[]
    }

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

    async getEmployeesByDepartment(departmentId: number) {
      this.employee.department.loading = true;
      try {
        const employees = await fetchEmployeesByDepartment(departmentId);
        this.employee.department.list = employees;

        this.employee.department.isError = false;
      } catch (error) {
        this.employee.department.isError = true;
      } finally {
        this.employee.department.loading = false;
      }
    },
  },
});
