<template>
  <div class="space-y-4">

    <!-- Título -->
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-user-group" class="text-green-700" />
      <span class="font-semibold text-green-700 text-base">Filtrar por Empleados</span>
    </div>

    <!-- Input de búsqueda -->
    <UInput v-model="search" icon="i-heroicons-magnifying-glass-20-solid" placeholder="Buscar empleado..."
      class="border border-green-300 rounded-xl" />

    <!-- Lista de empleados -->
    <div v-if="department.loadingEmployees" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-48 overflow-y-auto"
      v-for="(_, i) in Array.from({ length: 3 })" :key="i">
      <USkeleton class="h-14" />
      <USkeleton class="h-14" />

    </div>

    <template v-else>

      <div v-if="filteredEmployees.length" class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-h-48 overflow-y-auto">

        <button v-for="emp in filteredEmployees" :key="emp.id" class="w-full py-3 text-center cursor-pointer rounded-xl border border-gray-300
        bg-white dark:bg-gray-900 
        hover:bg-gray-50 dark:hover:bg-gray-700
        transition font-medium text-gray-700 dark:text-gray-300">
          {{ emp.first_name }} {{ emp.last_name }}
        </button>
      </div>
      <UEmpty v-else icon="i-lucide-users" title="No se encontraron empleados"
        description="Parece que no has escogido un departamento o trata de ajustar la busqueda" />
    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore';

const store = useAttendanceReportStore()
const { department } = storeToRefs(store)

const search = ref('')


const filteredEmployees = computed(() => {
  const employees = department.value.employees;
  if (!search.value) return employees;
  return employees.filter(e =>
    e.first_name.toLowerCase().includes(search.value.toLowerCase()) || e.last_name.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>
