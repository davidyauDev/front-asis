<script setup lang="ts">
const props = defineProps<{
  search: string
  filtroEstado: string
  ordenarPor: string
  fechaSeleccionada: string
  currentListCount: number
  isLoading: boolean
}>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:filtroEstado': [value: string]
  'update:ordenarPor': [value: string]
  'update:fechaSeleccionada': [value: string]
  'change-date': [value: string]
  reload: []
}>()

const onSearchInput = (event: Event) => {
  emit('update:search', (event.target as HTMLInputElement).value)
}

const onEstadoChange = (event: Event) => {
  emit('update:filtroEstado', (event.target as HTMLSelectElement).value)
}

const onOrdenChange = (event: Event) => {
  emit('update:ordenarPor', (event.target as HTMLSelectElement).value)
}

const onFechaChange = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  emit('update:fechaSeleccionada', value)
  emit('change-date', value)
}
</script>

<template>
  <div class="bg-white dark:bg-gray-950 rounded-lg border border-gray-200/60 dark:border-gray-800/60 p-5 shadow-sm">
    <div class="flex flex-wrap gap-2 items-center">
      <div class="relative flex-1 min-w-[300px]">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 text-gray-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          :value="props.search"
          type="text"
          placeholder="Buscar por nombre, DNI, agencia o cliente..."
          class="w-full pl-10 pr-10 py-2.5 border border-gray-200/80 dark:border-gray-800/80 rounded-md bg-white dark:bg-gray-950 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 transition-all duration-200 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-500"
          @input="onSearchInput"
        />

        <div v-if="props.search" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <span class="text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800/80 px-2 py-0.5 rounded">
            {{ props.currentListCount }}
          </span>
        </div>
      </div>

      <div class="relative">
        <select
          :value="props.filtroEstado"
          class="appearance-none border border-gray-200/80 dark:border-gray-800/80 rounded-md pl-3 pr-8 py-2.5 bg-white dark:bg-gray-950 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700"
          @change="onEstadoChange"
        >
          <option value="todos">Todos los técnicos</option>
          <option value="con-marcacion">Con marcación</option>
          <option value="sin-marcacion">Sin marcación</option>
        </select>

        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-gray-400 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div class="relative">
        <select
          :value="props.ordenarPor"
          class="appearance-none border border-gray-200/80 dark:border-gray-800/80 rounded-md pl-3 pr-8 py-2.5 bg-white dark:bg-gray-950 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700"
          @change="onOrdenChange"
        >
          <option value="original">Orden del sistema</option>
          <option value="nombre">Ordenar: Nombre</option>
          <option value="rutas">Más rutas</option>
          <option value="marcaciones">Más marcaciones</option>
        </select>

        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg class="h-4 w-4 text-gray-400 dark:text-gray-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </div>

      <div class="relative">
        <input
          :value="props.fechaSeleccionada"
          type="date"
          class="border border-gray-200/80 dark:border-gray-800/80 rounded-md px-3 py-2.5 bg-white dark:bg-gray-950 focus:border-gray-400 dark:focus:border-gray-600 focus:ring-0 transition-all duration-200 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:border-gray-300 dark:hover:border-gray-700"
          @change="onFechaChange"
        />
      </div>

      <button
        class="border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
        title="Recargar datos"
        :disabled="props.isLoading"
        @click="emit('reload')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          :class="{ 'animate-spin': props.isLoading }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        <span class="hidden sm:inline">{{ props.isLoading ? 'Cargando...' : 'Actualizar' }}</span>
      </button>
    </div>
  </div>
</template>
