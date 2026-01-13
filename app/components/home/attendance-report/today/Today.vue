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
            :loading="employee.daily.loading"
            :is-error="employee.daily.isError"
            :list="employee.daily.list"
            v-model:employee="employee.daily.selecteds"
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
   WATCHERS - REFACTORIZADO
========================= */

// Debounce para evitar múltiples llamadas a API
let fetchTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedFetch = () => {
  if (fetchTimeout) clearTimeout(fetchTimeout);
  fetchTimeout = setTimeout(() => {
    getDailyTakenAttendances();
  }, 300);
};

// Función auxiliar para actualizar listas filtradas en cascada
const updateFilteredLists = () => {
  const companyId = dailyTakenAttendace.value.params.company_id;
  const departmentIds = store.attendance.taken.daily.params.departamento_ids || [];

  // Filtrar departments por company
  if (companyId) {
    department.value.daily.list = department.value.list.filter(
      dep => dep.company_id === companyId
    );
  } else {
    department.value.daily.list = department.value.list;
  }

  // Filtrar employees por company y departments
  if (departmentIds.length > 0) {
    employee.value.daily.list = employee.value.list.filter(
      emp => departmentIds.includes(emp.department_id)
    );
  } else if (companyId) {
    employee.value.daily.list = employee.value.list.filter(
      emp => emp.company_id === companyId
    );
  } else {
    employee.value.daily.list = employee.value.list;
  }
};

// Inicializar listas al montar el componente
onMounted(() => {
  // Asegurarse de que las listas daily tengan todos los datos al inicio
  if (employee.value.list.length > 0 && employee.value.daily.list.length === 0) {
    employee.value.daily.list = employee.value.list;
  }
  if (department.value.list.length > 0 && department.value.daily.list.length === 0) {
    department.value.daily.list = department.value.list;
  }
  if (company.value.list.length > 0 && company.value.daily.list.length === 0) {
    company.value.daily.list = company.value.list;
  }
});

// Watch para cambios en departments seleccionados
watch(
  () => store.department.daily.selecteds,
  async (departments) => {
    const ids = departments.map(d => d.id);

    store.attendance.params.departamento_ids = ids;
    store.attendance.taken.daily.params.departamento_ids = ids;

    // Actualizar listas filtradas
    updateFilteredLists();

    // Cargar empleados por departamento (esperar a que termine)
    if (ids.length > 0) {
      await store.getEmployeesByDepartment();
    }

    // Hacer fetch con debounce
    debouncedFetch();
  },
  { deep: true, immediate: true }
);

// Watch para cambios en employees seleccionados
watch(
  () => store.employee.daily.selecteds,
  (employees) => {
    store.attendance.taken.daily.params.empleado_ids =
      employees.map(e => e.id);

    debouncedFetch();
  },
  { deep: true }
);

// Watch para company_id (filtro simple)
watch(
  () => dailyTakenAttendace.value.params.company_id,
  (companyId) => {
    // Limpiar selections cuando cambia company
    if (companyId) {
      // Limpiar departments que no pertenecen a la company
      const validDepartments = store.department.daily.selecteds.filter(
        dep => dep.company_id === companyId
      );
      
      if (validDepartments.length !== store.department.daily.selecteds.length) {
        store.department.daily.selecteds = validDepartments;
      }
    }

    updateFilteredLists();
    dailyTakenAttendace.value.pagination.pageIndex = 0;
    debouncedFetch();
  }
);
</script>
