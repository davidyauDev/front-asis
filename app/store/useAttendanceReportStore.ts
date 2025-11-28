import {
  useAttendanceReport,
  type Company,
  type Department,
  type Employee,
} from "~/composables/useAttendanceReport";

const { fetchCompanies, fetchDepartments, fetchEmployeesByDepartment } =
  useAttendanceReport();

export const useAttendanceReportStore = defineStore("attendance-report", {
  state: () => ({
    company: {
      list: [] as Company[],
      loading: false,
    },

    department: {
      list: [] as Department[],
      loading: false,

      loadingEmployees: false,
      employees: [] as Employee[],

      current: undefined as Department | undefined,
    },

    // ...
  }),

  actions: {
    async getCompanies() {
      if (this.company.list.length) return;
      this.company.loading = true;
      try {
        const companies = await fetchCompanies();
        this.company.list = companies;
      } catch (error) {
      } finally {
        this.company.loading = false;
      }
    },

    async getDepartments() {
      if (this.department.list.length) return;
      this.department.loading = true;
      try {
        const deportments = await fetchDepartments();
        this.department.list = deportments;
      } catch (error) {
      } finally {
        this.department.loading = false;
      }
    },

    async fetchEmployeesByDepartment(departmentId: number) {
      this.department.loadingEmployees = true;
      try {
        const employees = await fetchEmployeesByDepartment(departmentId);
        this.department.employees = employees;
      } catch (error) {
      } finally {
        this.department.loadingEmployees = false;
      }
    },
  },
});
