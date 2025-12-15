<template>
  <div class="space-y-4">
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-calendar" class="text-slate-600 dark:text-slate-300" />
      <span class="font-semibold text-slate-700 dark:text-slate-200 text-base">
        Seleccionar semanas
      </span>
    </div>

    <div
      v-for="semana in semanas"
      :key="semana.id"
      @click="toggleSemana(semana)"
      class="
        flex items-center gap-3
        p-3 rounded-lg border
        cursor-pointer select-none
        transition-all
        hover:shadow-sm
      "
      :class="weekCardClass(semana)"
    >
      <UCheckbox
        :model-value="isSelected(semana)"
        @click.stop
      />

      <span
        class="w-3 h-3 rounded-full"
        :class="weekDotClass(semana)"
      />

      <span class="font-medium text-slate-700 dark:text-slate-200">
        {{ semana.label }}
      </span>
    </div>
  </div>
</template>


<script setup lang="ts">
import { useAttendanceReportStore, type Week } from '~/store/useAttendanceReportStore'

const store = useAttendanceReportStore()
const { week } = storeToRefs(store)

const semanas: Week[] = [
  { id: 1, label: '1era Semana', color: 'red' },
  { id: 2, label: '2da Semana', color: 'orange' },
  { id: 3, label: '3era Semana', color: 'green' },
  { id: 4, label: '4ta Semana', color: 'pink' }
]

onMounted(() => {
  if (!week.value.selecteds.length) {
    week.value.selecteds = semanas
  }
})

const toggleSemana = (semana: Week) => {
  const exists = week.value.selecteds.some(s => s.id === semana.id)
  week.value.selecteds = exists
    ? week.value.selecteds.filter(s => s.id !== semana.id)
    : [...week.value.selecteds, semana]
}

const isSelected = (semana: Week) =>
  week.value.selecteds.some(s => s.id === semana.id)



const weekDotClass = (semana: Week) => ({
  'bg-red-500': semana.color === 'red',
  'bg-orange-400': semana.color === 'orange',
  'bg-green-500': semana.color === 'green',
  'bg-pink-500': semana.color === 'pink'
})

const weekCardClass = (semana: Week) => {
  const selected = isSelected(semana)

  return {
    'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800': !selected,
    'bg-red-50 border-red-300 dark:bg-red-950/30': selected && semana.color === 'red',
    'bg-orange-50 border-orange-300 dark:bg-orange-950/30': selected && semana.color === 'orange',
    'bg-green-50 border-green-300 dark:bg-green-950/30': selected && semana.color === 'green',
    'bg-pink-50 border-pink-300 dark:bg-pink-950/30': selected && semana.color === 'pink'
  }
}
</script>
