<template>
  <div class="space-y-3">
    <TableReport :range-date="rangeDate" />
  </div>
</template>

<script setup lang="ts">
import { getDaysInMonth, startOfMonth } from 'date-fns'
import TableReport from '~/components/movility-report/TableReport.vue'

definePageMeta({ middleware: 'auth' })

const getMonthlyRangeMax30 = (date: Date) => {
  const start = startOfMonth(date)
  const end = new Date(
    start.getFullYear(),
    start.getMonth(),
    Math.min(30, getDaysInMonth(start))
  )

  return { start, end }
}

const rangeDate = computed(() => getMonthlyRangeMax30(new Date()))
</script>
