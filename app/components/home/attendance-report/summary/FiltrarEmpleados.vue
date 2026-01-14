<template>
  <div class="space-y-4">

    <!-- Título -->
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-user-group" class="text-green-700" />
      <span class="font-semibold text-green-700 text-base">Filtrar por Empleados</span>
    </div>

    <!-- Input de búsqueda -->
    <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Buscar empleado..." />

    <div class="flex flex-wrap gap-2">
      <UButton class="cursor-pointer" @click="handleRemoveSelect(sel)" variant="outline" v-for="sel in selecteds"
        trailing-icon="i-lucide-x" size="xs">
        {{ sel.first_name }} {{ sel.last_name }}
      </UButton>
    </div>

    <DataState :loading="employee.department.loading" :error="employee.department.isError"
      :error-message="`No se pudieron cargar los empleados para ${departmentsByAttendanceParams.join(', ')}`"
      :show-retry="departmentsByAttendanceParams.length > 0" @retry="getEmployeesByDepartment()">
      <template #loading>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-48 overflow-y-auto"
          v-for="(_, i) in Array.from({ length: 3 })" :key="i">
          <USkeleton class="h-14" />
          <USkeleton class="h-14" />
        </div>
      </template>
      <div v-if="filteredEmployees.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-48 overflow-y-auto">
        <button @click="handleSelectEmployee(emp)" v-for="emp in filteredEmployees" :key="emp.id" class="w-full py-3 text-center cursor-pointer rounded-xl border border-gray-300
        transition font-medium " :class="{
          'bg-primary text-gray-700': hasEmployee(emp),
          'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 px-2': !hasEmployee(emp)
        }">
          {{ emp.first_name }} {{ emp.last_name }}
        </button>
      </div>
      <UEmpty v-else icon="i-lucide-users" title="No se encontraron empleados"
        description="Parece que no has escogido un departamento o trata de ajustar la busqueda" />
    </DataState>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DataState from '~/components/common/DataState.vue';
import { type Employee } from '~/composables/useAttendanceReport'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';


const store = useAttendanceReportStore()
const { getEmployeesByDepartment } = store;
const { department, employee, attendance } = storeToRefs(store)

const search = ref('')

const filteredEmployees = computed(() => {
  const employeesByDepartments = employee.value.department.list;
  if (!search.value) return employeesByDepartments;
  return employeesByDepartments.filter(e =>
    e.first_name.toLowerCase().includes(search.value.toLowerCase()) || e.last_name.toLowerCase().includes(search.value.toLowerCase())
  )
})

const departmentsByAttendanceParams = computed(() => {
  const ids = new Set(attendance.value.params.departamento_ids || [])

  return department.value.list.filter(d => ids.has(d.id)).map((d) => d.dept_name)
})

const selecteds = computed({
  get() {
    return employee.value.department.selecteds;
  },
  set(value) {
    employee.value.department.selecteds = value;
  }
})
onMounted(() => {
  // if (attendance.value.summary.list.length) return;
  if (employee.value.department.list.length) return;
  getEmployeesByDepartment()
})

const handleSelectEmployee = (newEmployee: Employee) => {
  if (hasEmployee(newEmployee)) {
    return handleRemoveSelect(newEmployee);
  }
  selecteds.value = [...selecteds.value, newEmployee]
}

const handleRemoveSelect = (employee: Employee) => {
  selecteds.value = selecteds.value.filter((sel) => sel.id !== employee.id);
}

const hasEmployee = (emp: Employee) => {
  return !!selecteds.value.find((e) => e.id === emp.id);
}

</script>
