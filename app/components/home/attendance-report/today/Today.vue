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
        <div class="col-span-2 min-w-0 space-y-3">
          <CompanyFilter
            :loading="company.daily.loading"
            :is-error="company.daily.isError"
            :list="company.daily.list"
            v-model:company="company.daily.selecteds"
            v-model:param="dailyTakenAttendace.params.company_id"
          />

          <div>
           
            <UCard
              :ui="{
                header: 'px-3 py-2 flex items-center justify-between border-b'
              }"
            >
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-sparkles" class="size-4 text-primary" />
                  <span class="font-semibold text-sm">Filtros especiales</span>
                </div>
              </template>

              <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    @click="applySpecialFilter([155, 64])"
                    :class="[
                      'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                      isSpecialFilterActive([155, 64])
                        ? 'bg-primary text-white shadow-md hover:shadow-lg hover:scale-105 ring-2 ring-primary/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                    ]"
                  >
                    <UIcon
                      v-if="isSpecialFilterActive([155, 64])"
                      name="i-lucide-check"
                      class="size-3.5"
                    />
                    Ingenieros productos
                  </button>

                  <button
                    type="button"
                    @click="applySpecialFilter([9])"
                    :class="[
                      'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                      isSpecialFilterActive([9])
                        ? 'bg-primary text-white shadow-md hover:shadow-lg hover:scale-105 ring-2 ring-primary/20'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                    ]"
                  >
                    <UIcon
                      v-if="isSpecialFilterActive([9])"
                      name="i-lucide-check"
                      class="size-3.5"
                    />
                    Ingenieros productos Ydieza
                  </button>
                </div>
              </div>
            </UCard>
          </div>
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
const isSpecialFilterActive = (ids: number[]) => {
  const selectedIds = store.employee.daily.selecteds.map(e => e.id);
  if (selectedIds.length !== ids.length) return false;
  const selectedSet = new Set(selectedIds);
  return ids.every(id => selectedSet.has(id));
};

const applySpecialFilter = (ids: number[]) => {
  if (isSpecialFilterActive(ids)) {
    store.employee.daily.selecteds = [];
    return;
  }

  const selected = employee.value.list.filter(emp =>
    ids.includes(emp.id)
  );
  store.employee.daily.selecteds = selected;
};

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
