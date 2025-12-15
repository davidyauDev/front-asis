<template>
  

  <div class="grid grid-cols-1 gap-4 md:grid-cols-3 items-start">
    <CompanyFilter
      :loading="company.daily.loading"
      :is-error="company.daily.isError"
      :list="company.daily.list"
      v-model:company="company.daily.selecteds"
      v-model:param="dailyTakenAttendace.params.company_id"
    />

    <DepartmentFilter
      :loading="department.daily.loading"
      :is-error="department.daily.isError"
      :list="department.daily.list"
      v-model:department="department.daily.selecteds"
      v-model:param="dailyTakenAttendace.params.department_id"
    />

    <EmployeeFilter
      :loading="employee.daily.loading"
      :is-error="employee.daily.isError"
      :list="employee.daily.list"
      v-model:employee="employee.daily.selecteds"
      v-model:param="dailyTakenAttendace.params.empleado_id"
    />
  </div>

  <section class="w-full mb-4">
    <div class="flex flex-col gap-6 lg:flex-row lg:items-stretch">
      <div class="w-full lg:w-2/5">
        <AttendanceSummary />
      </div>

      <div class="w-full lg:w-1/3 flex justify-center">
        <AttendanceBarChart />
      </div>

      <div class="w-full lg:w-1/3 flex justify-center">
        <ScatterTimeChart />
      </div>
    </div>
  </section>

  <ReportTable :taken-attendaces="dailyTakenAttendace.list" />
</template>

<script setup lang="ts">
import AttendanceBarChart from "./AttendanceBarChart.vue";
import AttendanceSummary from "./AttendanceSummary.vue";
import CompanyFilter from "../CompanyFilter.vue";
import DepartmentFilter from "../DepartmentFilter.vue";
import EmployeeFilter from "../EmployeeFilter.vue";
import ReportTable from "./ReportTable.vue";
import ScatterTimeChart from "./ScatterTimeChart.vue";
import { useAttendanceReportStore } from "~/store/useAttendanceReportStore";

const store = useAttendanceReportStore();
const { attendance, company, department, employee } = storeToRefs(store);
const { getDailyTakenAttendances } = store;

const dailyTakenAttendace = computed(() => attendance.value.taken.daily);

watch(
  () => dailyTakenAttendace.value.params.company_id,
  (companyId) => {
    getDailyTakenAttendances();
    if (companyId) {
      department.value.daily.list = department.value.list.filter(
        (dep) => dep.company_id === companyId
      );
      if (!dailyTakenAttendace.value.params.department_id) {
        // const currDep = department.value.list.find((dep) => dep.id === dailyTakenAttendace.value.params.department_id);
        // if (currDep && currDep.company_id !== companyId) {
        //     dailyTakenAttendace.value.params.department_id = null;
        // }
        employee.value.daily.list = employee.value.list.filter(
          (dep) => dep.company_id === companyId
        );
      }
    } else {
      const departmentId = dailyTakenAttendace.value.params.department_id;

      if (departmentId) {
        employee.value.daily.list = employee.value.list.filter(
          (dep) => dep.department_id === departmentId
        );
      } else {
        employee.value.daily.list = employee.value.list;
      }

      department.value.daily.list = department.value.list;
    }

    dailyTakenAttendace.value.pagination.pageIndex = 0;
  }
);

watch(
  () => dailyTakenAttendace.value.params.department_id,
  (departmentId) => {
    getDailyTakenAttendances();
    const currDep = department.value.list.find(
      (dep) => dep.id === departmentId
    );
    if (currDep) {
      company.value.daily.list = company.value.list.filter(
        (com) => com.id === currDep.company_id
      );
      employee.value.daily.list = employee.value.list.filter(
        (dep) => dep.department_id === currDep.id
      );
    } else {
      company.value.daily.list = company.value.list;
      employee.value.daily.list = employee.value.list;
    }

    dailyTakenAttendace.value.pagination.pageIndex = 0;
  }
);

watch(
  () => dailyTakenAttendace.value.params.empleado_id,
  (employeeId) => {
    getDailyTakenAttendances();
    const currEmp = employee.value.list.find((em) => em.id === employeeId);
    if (currEmp) {
      company.value.daily.list = company.value.list.filter(
        (com) => com.id === currEmp.company_id
      );
      department.value.daily.list = department.value.list.filter(
        (dep) => dep.id === currEmp.department_id
      );
    } else {
      const companyId = dailyTakenAttendace.value.params.company_id;
      if (companyId) {
        department.value.daily.list = department.value.list.filter(
          (dep) => dep.company_id === companyId
        );
        return;
      } else {
        company.value.daily.list = company.value.list;
      }

      department.value.daily.list = department.value.list;
    }

    dailyTakenAttendace.value.pagination.pageIndex = 0;
  }
);
</script>
