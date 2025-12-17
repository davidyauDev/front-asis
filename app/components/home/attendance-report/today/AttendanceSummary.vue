<template>
  <div
    class="mx-auto max-w-sm rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
  >
    <!-- Header -->
    <div
      class="grid grid-cols-2 items-center px-4 py-2 text-xs font-semibold uppercase tracking-wide
             bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
    >
      <div>Tipo</div>
      <div class="text-right">Total</div>
    </div>

    <!-- Body -->
    <div class="divide-y divide-gray-200 dark:divide-gray-700">
      <div
        v-for="row in rows"
        :key="row.label"
        class="grid grid-cols-2 items-center px-4 py-3 text-sm font-medium transition-colors"
        :class="row.bg"
      >
        <div class="flex items-center gap-2">
          <span
            class="inline-block w-2.5 h-2.5 rounded-full"
            :class="row.dot"
          />
          {{ row.label }}
        </div>

        <div class="text-right text-lg font-bold">
          {{ row.value }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAttendanceReportStore } from '~/store/useAttendanceReportStore'

interface Row {
  label: string
  value: number
  bg: string
  dot: string
}

const store = useAttendanceReportStore()
const { attendance } = storeToRefs(store)

const rows = computed<Row[]>(() => {
  const dailySummary = attendance.value.taken.daily.summary

  return [
    {
      label: 'Asistencia',
      value: dailySummary.asistencias,
      bg: 'hover:bg-blue-50 dark:hover:bg-blue-900/20',
      dot: 'bg-blue-600'
    },
    {
      label: 'Ausencias',
      value: dailySummary.ausencias,
      bg: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      dot: 'bg-gray-500'
    },
    {
      label: 'Tardanzas',
      value: dailySummary.tardanzas,
      bg: 'hover:bg-red-50 dark:hover:bg-red-900/20',
      dot: 'bg-red-600'
    }
  ]
})
</script>
