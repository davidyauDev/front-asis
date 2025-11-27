<template>
  <div class="space-y-4">

    <!-- Título -->
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-user-group" class="text-green-700" />
      <span class="font-semibold text-green-700 text-base">Filtrar por Empleados</span>
    </div>

    <!-- Input de búsqueda -->
    <UInput
      v-model="search"
      icon="i-heroicons-magnifying-glass-20-solid"
      placeholder="Buscar empleado..."
      class="border border-green-300 rounded-xl"
    />

    <!-- Lista de empleados -->
    <div
      class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2"
    >
      <button
        v-for="emp in filteredEmpleados"
        :key="emp.id"
        class="w-full py-3 text-center rounded-xl border border-gray-300
               bg-white dark:bg-gray-900 
               hover:bg-gray-50 dark:hover:bg-gray-700
               transition font-medium text-gray-700 dark:text-gray-300"
      >
        {{ emp.name }}
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const search = ref('')

const empleados = [
  { id: 1, name: 'Hermes' },
  { id: 2, name: 'Isaac' },
  { id: 3, name: 'Werner' },
  { id: 4, name: 'David' }
]

const filteredEmpleados = computed(() => {
  if (!search.value) return empleados
  return empleados.filter(e =>
    e.name.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>
