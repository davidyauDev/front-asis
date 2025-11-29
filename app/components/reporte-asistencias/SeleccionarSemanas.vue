<template>
  <div class="space-y-3">
    <!-- Título -->
    <div class="flex items-center gap-2">
      <UIcon name="i-heroicons-calendar" class="text-green-700" />
      <span class="font-semibold text-green-700 text-base">Seleccionar Semanas</span>
    </div>

    <div v-for="semana in semanas" :key="semana.id" @click="toggleSemana(semana)" class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition select-none
           hover:shadow-sm" :class="{
            // borde según color
            'border-red-200': !semana.color,
            'border-orange-400': semana.color === 'orange',
            'border-green-400': semana.color === 'green',
            'border-pink-400': semana.color === 'pink',

            // estilo de selección
            'ring-2 ring-primary bg-primary/10':
              isSelected(semana)
          }">
      <!-- Checkbox linkeado -->
      <UCheckbox :model-value="isSelected(semana)" />

      <!-- Indicador de color -->
      <span class="w-3 h-3 rounded-full" :class="{
        'bg-red-500': semana.color === 'red',
        'bg-orange-400': semana.color === 'orange',
        'bg-green-500': semana.color === 'green',
        'bg-pink-500': semana.color === 'pink',
      }" />

      <!-- Texto -->
      <span class="font-medium text-gray-700 dark:text-gray-200">
        {{ semana.label }}
      </span>
    </div>

  </div>

</template>

<script setup lang="ts">
import { useAttendanceReportStore, type Week } from '~/store/useAttendanceReportStore';

const store = useAttendanceReportStore();

const { week } = storeToRefs(store);

const semanas: Week[] = [
  { id: 1, label: '1era Semana', color: 'red' },
  { id: 2, label: '2da Semana', color: 'orange' },
  { id: 3, label: '3era Semana', color: 'green' },
  { id: 4, label: '4ta Semana', color: 'pink' }
]

onMounted(() => {
  if (week.value.selecteds.length) return;
  week.value.selecteds = semanas;
})

const toggleSemana = (semana: Week) => {
  const exists = week.value.selecteds.find(s => s.id === semana.id);

  if (exists) {
    week.value.selecteds = week.value.selecteds.filter(s => s.id !== semana.id);
  } else {
    week.value.selecteds = [...week.value.selecteds, semana];
  }
};


const isSelected = (semana: Week) => {
  return week.value.selecteds.some(s => s.id === semana.id);
};



</script>
