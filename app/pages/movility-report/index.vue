<template>
  <div class="space-y-3">
    <TableReport :range-date="rangeDate" />
  </div>
</template>

<script setup lang="ts">
import { endOfMonth, startOfMonth } from 'date-fns'
import TableReport from '~/components/movility-report/TableReport.vue'

definePageMeta({ middleware: 'auth' })

const modelValue = shallowRef({
  start: toCalendarDate(startOfMonth(new Date())),
  end: toCalendarDate(endOfMonth(new Date())),
})

const rangeDate = computed(() => ({
  start: fromCalToDate(modelValue.value.start),
  end: fromCalToDate(modelValue.value.end),
}))
</script>

