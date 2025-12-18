<template>
  <div class="space-y-6 text-gray-900 dark:text-gray-100">
    <section class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div
        class="
          rounded-lg
          flex flex-col gap-4
          bg-white dark:bg-gray-900
           border-gray-200 dark:border-gray-800
        "
      >
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
        />

        <EmployeeFilter
          :loading="employee.department.loading"
          :is-error="employee.department.isError"
          :list="employee.department.list"
          v-model:employee="employee.department.selecteds"
        />
      </div>

      <!-- GRÁFICO -->
      <UCard
        :ui="{
          base: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
          header: 'border-b border-gray-200 dark:border-gray-800'
        }"
      >
        <template #header>
          <div class="flex items-center gap-2 text-gray-700 dark:text-gray-200">
            <UIcon name="i-lucide-pie-chart" class="text-primary" />
            <span class="font-medium text-sm">
              Distribución de asistencia
            </span>
          </div>
        </template>

        <div class="flex justify-center pt-16 pb-6 min-h-[340px]">
          <div class="w-full max-w-[560px]">
            <AttendanceBarChart />
          </div>
        </div>
      </UCard>

    </section>

    <!-- TABLA -->
    <section
      class="
        rounded-lg
        bg-white dark:bg-gray-900
        border border-gray-200 dark:border-gray-800
      "
    >
      <ReportTable :taken-attendaces="dailyTakenAttendace.list" />
    </section>

  </div>
</template>

<script setup lang="ts">
import AttendanceBarChart from "./AttendanceBarChart.vue";
import CompanyFilter from "../CompanyFilter.vue";
import DepartmentFilter from "../DepartmentFilter.vue";
import EmployeeFilter from "../EmployeeFilter.vue";
import ReportTable from "./ReportTable.vue";
import { useAttendanceReportStore } from "~/store/useAttendanceReportStore";

const store = useAttendanceReportStore();
const { attendance, company, department, employee } = storeToRefs(store);
const { getDailyTakenAttendances } = store;

const dailyTakenAttendace = computed(() => attendance.value.taken.daily);

/* =========================
   WATCHERS
========================= */

watch(
  () => dailyTakenAttendace.value.params.company_id,
  (companyId) => {
    getDailyTakenAttendances();

    if (companyId) {
      department.value.daily.list = department.value.list.filter(
        dep => dep.company_id === companyId
      );

      if (!dailyTakenAttendace.value.params.department_id) {
        employee.value.daily.list = employee.value.list.filter(
          emp => emp.company_id === companyId
        );
      }
    } else {
      const departmentId = dailyTakenAttendace.value.params.department_id;

      if (departmentId) {
        employee.value.daily.list = employee.value.list.filter(
          emp => emp.department_id === departmentId
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
  () => store.department.daily.selecteds,
  (departments) => {
    const ids = departments.map(d => d.id);

    store.attendance.params.departamento_ids = ids;
    store.attendance.taken.daily.params.departamento_ids = ids;

    store.getEmployeesByDepartment();
    store.getDailyTakenAttendances();
  },
  { deep: true, immediate: true }
);

watch(
  () => store.employee.department.selecteds,
  (employees) => {
    store.attendance.taken.daily.params.empleado_ids =
      employees.map(e => e.id);

    store.getDailyTakenAttendances();
  },
  { deep: true }
);

watch(
  () => dailyTakenAttendace.value.params.department_id,
  (departmentId) => {
    getDailyTakenAttendances();

    const currDep = department.value.list.find(dep => dep.id === departmentId);

    if (currDep) {
      company.value.daily.list = company.value.list.filter(
        com => com.id === currDep.company_id
      );

      employee.value.daily.list = employee.value.list.filter(
        emp => emp.department_id === currDep.id
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

    const currEmp = employee.value.list.find(emp => emp.id === employeeId);

    if (currEmp) {
      company.value.daily.list = company.value.list.filter(
        com => com.id === currEmp.company_id
      );

      department.value.daily.list = department.value.list.filter(
        dep => dep.id === currEmp.department_id
      );
    } else {
      const companyId = dailyTakenAttendace.value.params.company_id;

      if (companyId) {
        department.value.daily.list = department.value.list.filter(
          dep => dep.company_id === companyId
        );
        return;
      }

      company.value.daily.list = company.value.list;
      department.value.daily.list = department.value.list;
    }

    dailyTakenAttendace.value.pagination.pageIndex = 0;
  }
);
</script>
