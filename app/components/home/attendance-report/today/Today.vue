<template>
  <div class="space-y-6 text-gray-900 dark:text-gray-100">
    <!-- FILTROS -->
    <section class="grid grid-cols-1 gap-6 items-start">
      <div
        class="
          rounded-lg
          p-4
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          space-y-4
        "
      >
        <AppTabs
          v-model="filterMode"
          ariaLabel="Filtros del reporte de hoy"
          size="sm"
          :items="filterTabs"
          list-class="items-end flex-wrap"
        />

        <div v-if="filterMode === 'ADMIN'" class="grid grid-cols-12 gap-4 items-start">
          <div class="col-span-12 md:col-span-2 min-w-0">
            <CompanyFilter
              :loading="company.daily.loading"
              :is-error="company.daily.isError"
              :list="company.daily.list"
              v-model:company="company.daily.selecteds"
              v-model:param="dailyTakenAttendace.params.company_id"
            />
          </div>

          <div class="col-span-12 md:col-span-4 min-w-0">
            <DepartmentFilter
              :loading="department.daily.loading"
              :is-error="department.daily.isError"
              :list="department.daily.list"
              persist-key="attendance-home-today"
              v-model:department="department.daily.selecteds"
            />
          </div>

          <div class="col-span-12 md:col-span-6 min-w-0">
            <EmployeeFilter
              :loading="employee.daily.loading"
              :is-error="employee.daily.isError"
              :list="employee.daily.list"
              v-model:employee="employee.daily.selecteds"
            />
          </div>
        </div>

        <div v-else class="grid grid-cols-12 gap-4 items-start">
          <div class="col-span-12 md:col-span-4">
            <UCard
              :ui="{
                header: 'px-3 py-2 flex items-center justify-between border-b'
              }"
            >
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-sparkles" class="size-4 text-[#2d5fc0] dark:text-[#9cb7f5]" />
                  <span class="font-semibold text-sm text-[#1d3f7f] dark:text-[#d9e5ff]">Ingenieros productos</span>
                </div>
              </template>

              <div class="space-y-3">
                <div>
                  <p class="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Empresa
                  </p>

                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="item in specialCompanies"
                      :key="item.key"
                      type="button"
                      @click="specialCompanyKey = item.key"
                      :class="[
                        'px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                        specialCompanyKey === item.key
                          ? 'bg-[#2d5fc0] text-white border border-[#2d5fc0] shadow-sm ring-2 ring-[#2d5fc0]/15'
                          : 'border border-[#d7e1f5] bg-[#f7faff] text-[#4d6ea8] hover:bg-[#ebf2ff] dark:border-[#314d7d] dark:bg-[#13203a] dark:text-[#c2d2f8] dark:hover:bg-[#1a2c51]'
                      ]"
                    >
                      <UIcon
                        v-if="specialCompanyKey === item.key"
                        name="i-lucide-check"
                        class="size-3.5"
                      />
                      {{ item.label }}
                    </button>
                  </div>
                </div>

                <div>
                  <p class="text-[11px] font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    Usuarios
                  </p>
                  <UInput
                    v-model="specialEmployeeSearch"
                    icon="i-lucide-search"
                    size="sm"
                    placeholder="Buscar usuario..."
                    class="w-full"
                  />
                  <div class="mt-2 flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                    <button
                      v-for="emp in specialEmployeesFiltered"
                      :key="emp.id"
                      type="button"
                      @click="toggleSpecialEmployee(emp.id)"
                      :class="[
                        'px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                        specialEmployeeIds.includes(emp.id)
                          ? 'bg-[#2d5fc0] text-white border border-[#2d5fc0] shadow-sm ring-2 ring-[#2d5fc0]/15'
                          : 'border border-[#d7e1f5] bg-[#f7faff] text-[#4d6ea8] hover:bg-[#ebf2ff] dark:border-[#314d7d] dark:bg-[#13203a] dark:text-[#c2d2f8] dark:hover:bg-[#1a2c51]'
                      ]"
                    >
                      <UIcon
                        v-if="specialEmployeeIds.includes(emp.id)"
                        name="i-lucide-check"
                        class="size-3.5"
                      />
                      {{ emp.first_name }} {{ emp.last_name }}
                    </button>

                    <p
                      v-if="!specialEmployeesFiltered.length"
                      class="text-xs text-gray-500 dark:text-gray-400 italic"
                    >
                      No hay usuarios para mostrar.
                    </p>
                  </div>

                  <div class="mt-2 flex items-center justify-between gap-2">
                    <p class="text-[11px] text-gray-500 dark:text-gray-400">
                      Seleccionados: <span class="font-semibold">{{ specialEmployeeIds.length }}</span>
                    </p>
                    <div class="flex items-center gap-2">
                      <UButton
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-rotate-ccw"
                        @click="specialEmployeeIds = []"
                      >
                        Limpiar
                      </UButton>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>

          <div class="col-span-12 md:col-span-8">
            <UCard
              :ui="{ header: 'px-3 py-2 flex items-center justify-between border-b' }"
            >
              <template #header>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-users" class="size-4 text-gray-500 dark:text-gray-400" />
                  <span class="font-semibold text-sm">Usuarios</span>
                </div>
              </template>

              <div class="space-y-3">
                <div class="flex flex-wrap gap-2">
                  <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Empresa: {{ activeSpecialCompany?.label ?? '-' }}
                  </span>
                  <span class="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Seleccionados: {{ specialEmployeeIds.length }}
                  </span>
                </div>

                <div class="flex flex-wrap gap-2">
                  <template v-if="specialEmployeeIds.length">
                    <span
                      v-for="emp in selectedSpecialEmployees"
                      :key="emp.key"
                      class="inline-flex items-center gap-2 rounded-full border border-[#cfdcf7] bg-[#eef4ff] px-3 py-1.5 text-xs font-semibold text-[#30508f] dark:border-[#314d7d] dark:bg-[#162542] dark:text-[#d6e3ff]"
                    >
                      <span class="truncate max-w-[240px]">{{ emp.label }}</span>
                      <button
                        v-if="emp.id != null"
                        type="button"
                        class="rounded-full p-0.5 transition-colors hover:bg-[#dbe7ff] dark:hover:bg-[#223862]"
                        @click="toggleSpecialEmployee(emp.id)"
                        aria-label="Quitar usuario"
                      >
                        <UIcon name="i-lucide-x" class="size-3.5" />
                      </button>
                    </span>
                  </template>

                  <p v-else class="text-sm text-gray-500 dark:text-gray-400 italic">
                    Selecciona usuarios para ver resultados.
                  </p>
                </div>
              </div>
            </UCard>
          </div>
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
      <ReportTable :params-override="effectiveDailyParams" />
    </section>

  </div>
</template>

<script setup lang="ts">
 import CompanyFilter from "../CompanyFilter.vue";
 import DepartmentFilter from "../DepartmentFilter.vue";
 import EmployeeFilter from "../EmployeeFilter.vue";
 import ReportTable from "./ReportTable.vue";
 import { useAttendanceReportStore } from "~/store/useAttendanceReportStore";
 
 const store = useAttendanceReportStore();
 const { attendance, company, department, employee } = storeToRefs(store);
 const { getDailyTakenAttendances } = store;
 
 const dailyTakenAttendace = computed(() => attendance.value.taken.daily);
 
 const excludedDepartmentIds = [2, 4, 5, 7, 9, 10] as const
 const excludedDepartmentIdSet = new Set<number>(excludedDepartmentIds)

type FilterMode = 'ADMIN' | 'INGENIEROS'
const filterMode = ref<FilterMode>('ADMIN')

const filterTabs = [
  { label: 'Administrativo', value: 'ADMIN' },
  { label: 'Ingenieros productos', value: 'INGENIEROS' }
]

type SpecialCompanyKey = 'cechriza' | 'ydieza'
const specialCompanyKey = ref<SpecialCompanyKey>('cechriza')
const specialEmployeeIds = ref<number[]>([])
const specialEmployeeSearch = ref('')

const specialCompanies = computed(() => {
  const cechriza = company.value.list.find(c => /cechriza/i.test(c.company_name))
  const ydieza = company.value.list.find(c => /ydieza/i.test(c.company_name))

  return [
    { key: 'cechriza' as const, label: cechriza?.company_name ?? 'Cechriza', id: cechriza?.id ?? 1 },
    { key: 'ydieza' as const, label: ydieza?.company_name ?? 'Ydieza', id: ydieza?.id ?? 2 },
  ]
})

const activeSpecialCompany = computed(() =>
  specialCompanies.value.find(c => c.key === specialCompanyKey.value)
)

const specialDefaultEmployeeIds = computed<number[]>(() => {
  if (specialCompanyKey.value === 'cechriza') return [155, 64]
  if (specialCompanyKey.value === 'ydieza') return [9]
  return []
})

const specialEmployeesBase = computed(() => {
  const companyId = activeSpecialCompany.value?.id
  if (!companyId) return [] as Employee[]

  // Empresas con usuarios fijos (por ID)
  if (specialDefaultEmployeeIds.value.length) {
    const ids = new Set(specialDefaultEmployeeIds.value)
    return employee.value.list.filter(e => ids.has(e.id))
  }

  return employee.value.list.filter(e => e.company_id === companyId)
})

const specialEmployeesFiltered = computed(() => {
  const term = specialEmployeeSearch.value.trim().toLowerCase()
  if (!term) return specialEmployeesBase.value

  return specialEmployeesBase.value.filter(e =>
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(term) ||
    (e.emp_code ?? '').toLowerCase().includes(term)
  )
})

const toggleSpecialEmployee = (id: number) => {
  specialEmployeeIds.value = specialEmployeeIds.value.includes(id)
    ? specialEmployeeIds.value.filter(x => x !== id)
    : [...specialEmployeeIds.value, id]
}

const selectedSpecialEmployees = computed(() => {
  const ids = specialEmployeeIds.value
  const base = specialEmployeesBase.value
  const byId = new Map(base.map(e => [e.id, e]))

  return ids.map((id) => {
    const found = byId.get(id) ?? employee.value.list.find(e => e.id === id)
    if (!found) {
      return { key: `id:${id}`, id, label: `ID ${id}` }
    }
    return {
      key: `emp:${found.id}`,
      id: found.id,
      label: `${found.first_name} ${found.last_name}`.trim() || `ID ${found.id}`,
    }
  })
})

const effectiveDailyParams = computed(() => {
  const base = dailyTakenAttendace.value.params

  if (filterMode.value === 'INGENIEROS') {
    const ids = specialEmployeeIds.value.length
      ? [...specialEmployeeIds.value]
      : []

    if (!ids.length) return null

    return {
      ...base,
      company_id: undefined,
      departamento_ids: [],
      empleado_id: undefined,
      empleado_ids: ids,
    }
  }

  // ADMIN: no enviar empleado_ids cuando es "todos"
  const explicitEmployeeIds = store.employee.daily.selecteds.map(e => e.id)
  const allCount = employee.value.daily.list.length || employee.value.list.length
  const shouldOmitEmployeeFilter =
    !explicitEmployeeIds.length || (allCount > 0 && explicitEmployeeIds.length >= allCount)

  return {
    ...base,
    empleado_id: undefined,
    empleado_ids: shouldOmitEmployeeFilter ? undefined : explicitEmployeeIds,
  }
})



/* =========================
   WATCHERS - REFACTORIZADO
========================= */

// Debounce para evitar múltiples llamadas a API
let fetchTimeout: ReturnType<typeof setTimeout> | null = null;
const debouncedFetch = () => {
  if (fetchTimeout) clearTimeout(fetchTimeout);
  fetchTimeout = setTimeout(() => {
    const params = effectiveDailyParams.value
    if (filterMode.value === 'INGENIEROS' && !params) return
    getDailyTakenAttendances(params ?? undefined);
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

  department.value.daily.list = department.value.daily.list.filter(
    dep => !excludedDepartmentIdSet.has(dep.id)
  )

  // Filtrar employees por company y departments
  const effectiveDepartmentIds = departmentIds.length
    ? departmentIds
    : department.value.daily.list.map(d => d.id)

  if (effectiveDepartmentIds.length > 0) {
    employee.value.daily.list = employee.value.list.filter(
      emp => effectiveDepartmentIds.includes(emp.department_id)
    );
  } else if (companyId) {
    employee.value.daily.list = employee.value.list.filter(
      emp => emp.company_id === companyId
    );
  } else {
    employee.value.daily.list = employee.value.list;
  }
};

const applyDepartmentExclusionsAndDefaults = () => {
  if (filterMode.value !== 'ADMIN') return
  if (!department.value.list.length) return

  updateFilteredLists()

  const allowedDepartments = department.value.daily.list
  const allowedIdSet = new Set<number>(allowedDepartments.map(d => d.id))

  const cleanedSelected = store.department.daily.selecteds.filter(
    (dep) => allowedIdSet.has(dep.id)
  )
  if (cleanedSelected.length !== store.department.daily.selecteds.length) {
    store.department.daily.selecteds = cleanedSelected
  }

  if (!store.department.daily.selecteds.length) {
    store.attendance.taken.daily.params.departamento_ids = allowedDepartments.map(d => d.id)
  }
}

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

  // Aplicar exclusiones y defaults iniciales
  applyDepartmentExclusionsAndDefaults()
});

// Cuando se cargan departamentos por primera vez (o se refrescan), aplicar exclusiones sin esperar click.
watch(
  () => department.value.list.length,
  () => {
    applyDepartmentExclusionsAndDefaults()
  },
  { immediate: true }
)

// Watch para cambios en departments seleccionados
watch(
  () => store.department.daily.selecteds,
  async (departments) => {
    if (filterMode.value !== 'ADMIN') return
    const normalizedSelected = departments.filter(
      d => !excludedDepartmentIdSet.has(d.id)
    )

    if (normalizedSelected.length !== departments.length) {
      store.department.daily.selecteds = normalizedSelected
      return
    }

    const ids = normalizedSelected.length
      ? normalizedSelected.map(d => d.id)
      : department.value.daily.list.map(d => d.id)

    store.attendance.taken.daily.params.departamento_ids = ids;

    // Actualizar listas filtradas
    updateFilteredLists();

    // Hacer fetch con debounce
    debouncedFetch();
  },
  { deep: true, immediate: true }
);

// Watch para cambios en employees seleccionados
watch(
  () => store.employee.daily.selecteds,
  (employees) => {
    if (filterMode.value !== 'ADMIN') return

    // Mantenemos el estado de UI (selecteds) pero el request real se arma en effectiveDailyParams
    store.attendance.taken.daily.params.empleado_id = undefined
    store.attendance.taken.daily.params.empleado_ids = employees.map(e => e.id);
 
    debouncedFetch();
  },
  { deep: true }
);

// Watch para company_id (filtro simple)
watch(
  () => dailyTakenAttendace.value.params.company_id,
  (companyId) => {
    if (filterMode.value !== 'ADMIN') return
    // Limpiar selections cuando cambia company
    const validDepartments = store.department.daily.selecteds.filter((dep) => {
      if (excludedDepartmentIdSet.has(dep.id)) return false
      return companyId ? dep.company_id === companyId : true
    })
    if (validDepartments.length !== store.department.daily.selecteds.length) {
      store.department.daily.selecteds = validDepartments
    }

    updateFilteredLists();
    if (!store.department.daily.selecteds.length) {
      const ids = department.value.daily.list.map(d => d.id)
      store.attendance.taken.daily.params.departamento_ids = ids
    }
    dailyTakenAttendace.value.pagination.pageIndex = 0;
    debouncedFetch();
  }
);

watch(filterMode, () => {
  // Al entrar a Ingenieros, setear defaults de Cechriza
  if (filterMode.value === 'INGENIEROS') {
    specialCompanyKey.value = 'cechriza'
    specialEmployeeIds.value = [...specialDefaultEmployeeIds.value]
    specialEmployeeSearch.value = ''
  }
  debouncedFetch()
})

watch([specialCompanyKey, specialEmployeeIds], () => {
  if (filterMode.value !== 'INGENIEROS') return
  debouncedFetch()
}, { deep: true })

watch(specialCompanyKey, () => {
  if (filterMode.value !== 'INGENIEROS') return
  specialEmployeeSearch.value = ''
  specialEmployeeIds.value = [...specialDefaultEmployeeIds.value]
})
</script>
