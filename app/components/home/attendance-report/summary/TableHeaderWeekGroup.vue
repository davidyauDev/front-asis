<template>
  <div class="w-full h-full border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden mt-4">
    <div
      class="h-12 text-white text-center py-3 font-bold text-xs tracking-wide"
      :class="weekHeaderClass"
    >
      {{ week }}
    </div>

    <!-- RANGO DE FECHAS -->
    <div class="text-center p-2" :class="firstBackgroundColor">
      <span class="w-full text-xs" :class="firstColor">
        <template v-if="date">
          {{ date.inicio }} - {{ date.fin }}
        </template>
        <template v-else>
          Acumulado
        </template>
      </span>
    </div>

    <!-- TITULOS DE LA SEMANA -->
    <div
      class="flex text-[10px] font-semibold uppercase tracking-wider text-center"
      :class="weekSubHeaderClass"
    >
      <span class="w-1/2 py-2 border-r border-white/40">
        Tardanza
      </span>
      <span class="w-1/2 py-2">
        Trabajado
      </span>
    </div>

    <!-- CONTENIDO -->
    <div class="w-full flex">
      <span
        class="w-1/2 block px-2 py-5 text-center text-[10px] font-bold"
        :class="[firstColor, secondBackgroundColor]"
      >
        <!-- aquí van los valores -->
      </span>

      <span
        class="w-1/2 block px-2 py-5 text-center text-[10px] font-bold"
        :class="[firstColor, firstBackgroundColor]"
      >
        <!-- aquí van los valores -->
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AttendaceWeeksDates } from '../../composables/useAttendanceReport'

const props = defineProps<{
  week: string
  date?: AttendaceWeeksDates['s1']
  gradiantBackgroundColor: string
  firstBackgroundColor: string
  secondBackgroundColor: string
  firstColor: string
  secondColor: string
}>()


const weekHeaderClass = computed(() => {
  const w = props.week.toLowerCase()

  if (w.includes('1')) return 'bg-gradient-to-r from-red-500 to-red-400'
  if (w.includes('2')) return 'bg-gradient-to-r from-orange-500 to-orange-400'
  if (w.includes('3')) return 'bg-gradient-to-r from-emerald-500 to-emerald-400'
  if (w.includes('4')) return 'bg-gradient-to-r from-pink-500 to-pink-400'

  return 'bg-gradient-to-r from-slate-600 to-slate-500'
})

const weekSubHeaderClass = computed(() => {
  const w = props.week.toLowerCase()

  if (w.includes('1')) return 'bg-red-50 text-red-700'
  if (w.includes('2')) return 'bg-orange-50 text-orange-700'
  if (w.includes('3')) return 'bg-emerald-50 text-emerald-700'
  if (w.includes('4')) return 'bg-pink-50 text-pink-700'

  return 'bg-slate-100 text-slate-600'
})
</script>
