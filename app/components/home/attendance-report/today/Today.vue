<template>
  <div class="space-y-6 text-gray-900 dark:text-gray-100">
    <!-- METRICS -->
    <section>
      <MetricCards :metrics="metricsData" />
    </section>

    <!-- FILTROS -->
    <section class="grid grid-cols-1 gap-6 items-start">
      <div
        class="
          rounded-lg
          p-4
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          grid grid-cols-12 gap-4 items-start
        "
      >
        <div class="col-span-2 min-w-0">
          <CompanyFilter
            :loading="company.daily.loading"
            :is-error="company.daily.isError"
            :list="company.daily.list"
            v-model:company="company.daily.selecteds"
            v-model:param="dailyTakenAttendace.params.company_id"
          />
        </div>

        <div class="col-span-4 min-w-0">
          <DepartmentFilter
            :loading="department.daily.loading"
            :is-error="department.daily.isError"
            :list="department.daily.list"
            v-model:department="department.daily.selecteds"
          />
        </div>

        <div class="col-span-6 min-w-0">
          <EmployeeFilter
            :loading="employee.department.loading"
            :is-error="employee.department.isError"
            :list="employee.department.list"
            v-model:employee="employee.department.selecteds"
          />
        </div>
      </div>
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
import CompanyFilter from "../CompanyFilter.vue";
import DepartmentFilter from "../DepartmentFilter.vue";
import EmployeeFilter from "../EmployeeFilter.vue";
import ReportTable from "./ReportTable.vue";
import MetricCards from "~/components/home/MetricCards.vue";
import { useAttendanceReportStore } from "~/store/useAttendanceReportStore";

const store = useAttendanceReportStore();
const { attendance, company, department, employee } = storeToRefs(store);
const { getDailyTakenAttendances } = store;

const dailyTakenAttendace = computed(() => attendance.value.taken.daily);

/* =========================
   METRICS DATA
========================= */
const metricsData = computed(() => {
  const summary = dailyTakenAttendace.value.summary;
  const total = dailyTakenAttendace.value.list.length;
  const incidencias = dailyTakenAttendace.value.list.filter(item => item.Tiene_Incidencia).length;
  
  return [
    {
      title: 'Total Empleados',
      value: total.toString(),
      change: '100%',
      description: 'Empleados registrados'
    },
    {
      title: 'Asistencias',
      value: summary.asistencias.toString(),
      change: total ? `${Math.round((summary.asistencias / total) * 100)}%` : '0%',
      description: 'Asistieron a tiempo'
    },
    {
      title: 'Tardanzas',
      value: summary.tardanzas.toString(),
      change: total ? `${Math.round((summary.tardanzas / total) * 100)}%` : '0%',
      description: 'Llegaron tarde'
    },
    {
      title: 'Incidencias',
      value: incidencias.toString(),
      change: summary.tardanzas ? `${Math.round((incidencias / summary.tardanzas) * 100)}%` : '0%',
      description: 'Justificadas'
    }
  ];
});

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
