<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import { addMonths, endOfMonth, format, getDaysInMonth, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { toCalendarDate } from '~/utils/formatDate'

const modelValue = defineModel<{
  start: CalendarDate
  end: CalendarDate
}>({
  required: true
})

const currentMonth = computed(() =>
  startOfMonth(modelValue.value.start.toDate('UTC'))
)

const monthLabel = computed(() =>
  format(currentMonth.value, 'MMMM yyyy', { locale: es })
)

const daysInMonth = computed(() =>
  getDaysInMonth(currentMonth.value)
)

function updateMonth(date: Date) {
  modelValue.value = {
    start: toCalendarDate(startOfMonth(date)),
    end: toCalendarDate(endOfMonth(date))
  }
}

function prevMonth() {
  updateMonth(addMonths(currentMonth.value, -1))
}

function nextMonth() {
  updateMonth(addMonths(currentMonth.value, 1))
}
</script>

<template>
  <div
    class="flex items-center gap-3
           px-4 py-2
           border border-gray-200
           rounded-lg
           bg-white"
  >
    <!-- PREV -->
    <UButton
      icon="i-heroicons-chevron-left"
      variant="ghost"
      size="sm"
      @click="prevMonth"
    />

    <!-- LABEL -->
    <div class="flex items-center gap-2 text-sm font-medium text-gray-800">
      <UIcon name="i-lucide-calendar" class="text-gray-500" />
      <span class="capitalize">
        {{ monthLabel }}
      </span>
      <span class="text-gray-400">
        ({{ daysInMonth }} días)
      </span>
    </div>

    <!-- NEXT -->
    <UButton
      icon="i-heroicons-chevron-right"
      variant="ghost"
      size="sm"
      @click="nextMonth"
    />
  </div>
</template>
