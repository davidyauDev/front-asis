<template>
  <UTable sticky :loading="loading" :data="movilityReportList" :columns="columns" class="flex-1 bg-white" 
  ">
    <template #empty>
      <div v-if="error" class="w-full flex gap-4 justify-center items-center text-center">
        <Icon name="lucide:alert-triangle" class="text-red-500" size="20" />
        <h2 class="text-sm font-semibold text-red-600">No se pudo cargar el reporte de movilidad</h2>
        <UButton color="error" variant="link" icon="i-lucide-refresh-cw" class="cursor-pointer" @click="refresh"
          :loading="loading" />
      </div>
      <div v-else class="flex flex-col items-center justify-center p-6">
        <UIcon name="i-lucide-inbox" size="48" class="mb-4 text-gray-400" />
        <p class="text-gray-500">No se encontraron registros para los criterios seleccionados.</p>
      </div>
    </template>

    <!-- Empleado -->
    <template #employee-cell="{ row }">
      <div class="flex items-center gap-3 max-w-fit">
        <UUser :name="row.original.employee.last_name" :description="row.original.employee.first_name" />
        <UButton icon="i-lucide-eye" variant="link" size="sm" class="ml-auto cursor-pointer"
          @click="(open = true), $emit('select:movility-report', row.original)" />
      </div>
    </template>

    <template #fechaIngreso-cell="{ row }">
      <span class="text-green-600 font-medium">
        01/03/2023
      </span>

    </template>

    <template #fecgha-cell="{ row }">
      <span class="text-green-600 font-medium">
        150
      </span>
    </template>

    <template #movilidad-cell="{ row }">
      <span class="text-green-600 font-medium">
        150
      </span>
    </template>
    

    <!-- Provincia -->
    <template #provincia-cell="{ row }">
      <span class="text-orange-500 font-medium">
        Lima
      </span>
    </template>

    <!-- Empresa -->
    <template #empresa-cell="{ row }">
      <span class="text-blue-500 font-medium">
        Cechriza
      </span>
    </template>
  </UTable>
</template>

<script setup lang="ts">
import type { TableColumn } from "@nuxt/ui"
import { format } from "date-fns"
import type { MovilityReport } from "~/interfaces/movility-report"

const open = defineModel("open", {
  type: Boolean,
  required: true,
})

const { rangeDate, searchTerm } = defineProps<{
  rangeDate: {
    start: Date
    end: Date
  }
  searchTerm: string
}>()

defineEmits<{
  (e: "select:movility-report", movilityReport: MovilityReport): void
}>()

const currentYear = computed(() => format(rangeDate.start, "yyyy"))
const currentMonth = computed(() => format(rangeDate.start, "MM"))

const {
  data,
  pending: loading,
  error,
  refresh,
} = await useFetch<MovilityReport[]>("/daily-records/monthly-summary", {
  method: "POST",
  $fetch: useNuxtApp().$api,
  body: computed(() => ({
    year: Number(currentYear.value),
    month: Number(currentMonth.value),
  })),
  default: () => [],
  watch: [currentYear, currentMonth],
})

const movilityReportList = computed<MovilityReport[]>(() => {
  let filtered = data.value
  if (searchTerm) {
    const term = searchTerm.toLowerCase().trim()
    filtered = filtered.filter(
      (item) =>
        item.employee.first_name.toLowerCase().includes(term) ||
        item.employee.last_name.toLowerCase().includes(term) ||
        item.employee.position_name.toLowerCase().includes(term)
    )
  }
  return filtered
})

const columns = computed<TableColumn<MovilityReport>[]>(() => [
  {
    accessorKey: "employee",
    header: "Empleado",
    size: 220,
  },
  {
    accessorKey: "employee.department_name",
    header: "Cargo",
  },
  {
    accessorKey: "fechaIngreso",
    header: "F. Ingreso",
    size: 110,
  },
  {
    accessorKey: "movilidad",
    header: "Movilidad",
    size: 100,
  },
  {
    accessorKey: "provincia",
    header: "Provincia",
    size: 120,
  },
  {
    accessorKey: "empresa",
    header: "Empresa",
    size: 130,
  },
  {
    accessorKey: "summary.total_days",
    header: "Total",
    size: 60,
  },
  {
    accessorKey: "summary.vacation_days",
    header: "Vac",
    size: 60,
  },
  {
    accessorKey: "summary.no_mark_days",
    header: "NM",
    size: 60,
  },
  {
    accessorKey: "summary.days_with_mobility",
    header: "DM",
    size: 60,
  },
  {
    accessorKey: "summary.days_with_mobility",
    header: "Depostar",
    size: 60,
  },
  {
    accessorKey: "summary.days_with_mobility",
    header: "Comentario",
    size: 60,
  },
   {
    accessorKey: "summary.days_with_mobility",
    header: "Acciones",
    size: 60,
  },
])
</script>
